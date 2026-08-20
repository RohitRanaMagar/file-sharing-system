import { Router } from 'express'
import User from '../models/User.js'
import SharedFile from '../models/SharedFile.js'
import ShareLink from '../models/ShareLink.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

async function adminAuth(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  } catch (err) { next(err) }
}

router.get('/stats', authMiddleware, adminAuth, async (req, res, next) => {
  try {
    const [totalUsers, totalFiles, totalShares, recentUsers] = await Promise.all([
      User.countDocuments(),
      SharedFile.countDocuments(),
      ShareLink.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
    ])
    res.json({ stats: { totalUsers, totalFiles, totalShares, recentUsers } })
  } catch (err) { next(err) }
})

router.get('/users', authMiddleware, adminAuth, async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100).select('-password')
    res.json({ users })
  } catch (err) { next(err) }
})

router.get('/files', authMiddleware, adminAuth, async (req, res, next) => {
  try {
    const files = await SharedFile.find().populate('owner', 'name email').sort({ uploadedAt: -1 }).limit(100)
    res.json({ files })
  } catch (err) { next(err) }
})

router.get('/shares', authMiddleware, adminAuth, async (req, res, next) => {
  try {
    const shares = await ShareLink.find()
      .populate({ path: 'fileId', populate: { path: 'owner', select: 'name email' } })
      .sort({ createdAt: -1 }).limit(100)
    res.json({ shares })
  } catch (err) { next(err) }
})

router.delete('/users/:id', authMiddleware, adminAuth, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    await SharedFile.deleteMany({ owner: user._id })
    res.json({ message: 'User and associated files deleted' })
  } catch (err) { next(err) }
})

export default router
