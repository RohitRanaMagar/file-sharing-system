import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import SharedFile from '../models/SharedFile.js'
import ShareLink from '../models/ShareLink.js'
import { authMiddleware } from '../middleware/auth.js'

const UPLOAD_DIR = path.resolve('server/uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, unique + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
})

const router = Router()

function detectType(mime) {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('text/') || mime === 'application/pdf') return 'document'
  return 'other'
}

router.post('/upload', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' })
    const fileDoc = await SharedFile.create({
      owner: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      mimeType: req.file.mimetype,
      type: detectType(req.file.mimetype),
      folder: req.body.folderId || null,
    })
    res.status(201).json({ file: fileDoc.toJSON() })
  } catch (err) { next(err) }
})

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const filter = { owner: req.userId }
    if (req.query.folder) {
      if (req.query.folder === 'null') filter.folder = null
      else filter.folder = req.query.folder
    }
    const files = await SharedFile.find(filter).sort({ uploadedAt: -1 })
    res.json({ files })
  } catch (err) { next(err) }
})

router.get('/download/:id', authMiddleware, async (req, res, next) => {
  try {
    const fileDoc = await SharedFile.findOne({ _id: req.params.id, owner: req.userId })
    if (!fileDoc) return res.status(404).json({ message: 'File not found' })
    if (!fs.existsSync(fileDoc.path)) {
      return res.status(404).json({ message: 'File data not found on disk' })
    }
    res.download(fileDoc.path, fileDoc.originalName)
  } catch (err) { next(err) }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const fileDoc = await SharedFile.findOne({ _id: req.params.id, owner: req.userId })
    if (!fileDoc) return res.status(404).json({ message: 'File not found' })
    try { fs.unlinkSync(fileDoc.path) } catch {}
    const shareLinks = await ShareLink.find({ fileId: fileDoc._id })
    for (const link of shareLinks) {
      if (link.encryptedPath) { try { fs.unlinkSync(link.encryptedPath) } catch {} }
    }
    await ShareLink.deleteMany({ fileId: fileDoc._id })
    await SharedFile.deleteOne({ _id: fileDoc._id })
    res.json({ message: 'File deleted' })
  } catch (err) { next(err) }
})

router.get('/activity', authMiddleware, async (req, res, next) => {
  try {
    const files = await SharedFile.find({ owner: req.userId }).sort({ uploadedAt: -1 }).limit(50)
    const entries = files.map(f => ({
      id: f._id,
      action: 'uploaded',
      file: f.originalName,
      time: formatRelativeTime(f.uploadedAt),
      icon: typeIcon(f.type),
    }))
    res.json({ activity: entries })
  } catch (err) { next(err) }
})

function formatRelativeTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + ' min ago'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago'
  const days = Math.floor(hours / 24)
  return days + ' day' + (days > 1 ? 's' : '') + ' ago'
}

function typeIcon(type) {
  const map = { image: '\uD83D\uDDBC\uFE0F', video: '\uD83C\uDFA5', document: '\uD83D\uDCC4', other: '\uD83D\uDCC1' }
  return map[type] || '\uD83D\uDCC1'
}

export default router
