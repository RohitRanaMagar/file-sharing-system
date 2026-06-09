import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { validate, required, email, minLength } from '../middleware/validation.js'
import { authMiddleware } from '../middleware/auth.js'

const JWT_SECRET = process.env.JWT_SECRET || 'easyshare-dev-secret-change-in-production'
const router = Router()

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
    const user = await User.create({ name, email, password })
    const token = generateToken(user)
    res.status(201).json({ token, user: user.toJSON() })
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

export default router
