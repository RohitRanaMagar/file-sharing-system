import { Router } from 'express'
import Folder from '../models/Folder.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { name, parent } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' })
    }
    if (parent) {
      const parentFolder = await Folder.findOne({ _id: parent, owner: req.userId })
      if (!parentFolder) return res.status(404).json({ message: 'Parent folder not found' })
    }
    const folder = await Folder.create({ name: name.trim(), owner: req.userId, parent: parent || null })
    res.status(201).json({ folder })
  } catch (err) { next(err) }
})

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const parent = req.query.parent || null
    const folders = await Folder.find({ owner: req.userId, parent }).sort({ createdAt: -1 })
    res.json({ folders })
  } catch (err) { next(err) }
})

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.userId })
    if (!folder) return res.status(404).json({ message: 'Folder not found' })
    res.json({ folder })
  } catch (err) { next(err) }
})

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.userId })
    if (!folder) return res.status(404).json({ message: 'Folder not found' })
    folder.name = name.trim()
    await folder.save()
    res.json({ folder })
  } catch (err) { next(err) }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.userId })
    if (!folder) return res.status(404).json({ message: 'Folder not found' })
    await Folder.deleteMany({ owner: req.userId, parent: folder._id })
    await Folder.deleteOne({ _id: folder._id })
    res.json({ message: 'Folder deleted' })
  } catch (err) { next(err) }
})

export default router
