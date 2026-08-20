import { Router } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'
import User from '../models/User.js'
import { validate, required, email, minLength } from '../middleware/validation.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js'

const JWT_SECRET = process.env.JWT_SECRET || 'easyshare-dev-secret-change-in-production'

const authLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'test' ? 60 * 1000 : 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 100 : 10,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const router = Router()
router.use(authLimiter)

function generateToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', validate({
  name: [required],
  email: [required, email],
  password: [required, minLength(6)],
}), async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const user = await User.create({ name, email, password, verificationToken })
    
    // Send verification email
    const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`
    try {
      await sendVerificationEmail(email, name, verificationToken, baseUrl)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue - user can request resend
    }
    
    const token = generateToken(user)
    res.status(201).json({
      token, user: user.toJSON(),
      verificationToken,
      message: 'Account created. Please verify your email.',
    })
  } catch (err) { next(err) }
})

router.post('/login', validate({
  email: [required],
  password: [required],
}), async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const match = await user.comparePassword(password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    user.lastLogin = new Date().toLocaleString()
    await user.save()
    const token = generateToken(user)
    res.json({ token, user: user.toJSON() })
  } catch (err) { next(err) }
})

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: user.toJSON() })
  } catch (err) { next(err) }
})

router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'course', 'college', 'semester', 'supervisor']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: user.toJSON() })
  } catch (err) { next(err) }
})

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'Verification token is required' })
    const user = await User.findOne({ verificationToken: token })
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' })
    user.isVerified = true
    user.verificationToken = null
    await user.save()
    res.json({ message: 'Email verified successfully' })
  } catch (err) { next(err) }
})

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account with that email' })
    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = token
    user.resetPasswordExpires = new Date(Date.now() + 3600000)
    await user.save()
    
    // Send password reset email
    const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`
    try {
      await sendPasswordResetEmail(email, user.name, token, baseUrl)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Continue - but log the error
    }
    
    res.json({ message: 'Password reset email sent', resetToken: token })
  } catch (err) { next(err) }
})

router.post('/reset-password', validate({
  token: [required],
  password: [required, minLength(6)],
}), async (req, res, next) => {
  try {
    const { token, password } = req.body
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' })
    user.password = password
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()
    res.json({ message: 'Password reset successful' })
  } catch (err) { next(err) }
})

router.put('/password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const match = await user.comparePassword(currentPassword)
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' })
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password updated successfully' })
  } catch (err) { next(err) }
})

router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })
    
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' })
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.verificationToken = verificationToken
    await user.save()
    
    // Send verification email
    const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`
    try {
      await sendVerificationEmail(email, user.name, verificationToken, baseUrl)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return res.status(500).json({ message: 'Failed to send verification email' })
    }
    
    res.json({ message: 'Verification email resent successfully' })
  } catch (err) { next(err) }
})

export default router
