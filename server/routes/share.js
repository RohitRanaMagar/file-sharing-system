import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import multer from 'multer'
import SharedFile from '../models/SharedFile.js'
import ShareLink from '../models/ShareLink.js'
import { authMiddleware } from '../middleware/auth.js'

const SHARE_UPLOAD_DIR = path.resolve('server/share-uploads')
if (!fs.existsSync(SHARE_UPLOAD_DIR)) fs.mkdirSync(SHARE_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, SHARE_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, unique + '-' + file.originalname)
  },
})

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } })

const router = Router()

router.post('/access', async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ message: 'Code is required' })

    const codeHash = crypto.createHash('sha256').update(code).digest('hex')
    const link = await ShareLink.findOne({ codeHash, isCodeProtected: true }).populate('fileId')

    if (!link) return res.status(404).json({ message: 'Invalid access code' })
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ message: 'This share has expired' })
    }

    link.viewCount += 1
    await link.save()

    if (link.encryptedPath && fs.existsSync(link.encryptedPath)) {
      const filename = path.basename(link.encryptedPath)
      const originalName = link.fileId ? link.fileId.originalName : filename.replace(/^\d+-\d+-/, '')
      res.json({
        access: true,
        fileId: link.fileId?._id,
        originalName,
        encryptedFile: `/share/file/${link._id}`,
        mimeType: 'application/octet-stream',
        size: fs.statSync(link.encryptedPath).size,
      })
    } else {
      res.json({ access: true, fileId: link.fileId?._id, originalName: link.fileId?.originalName })
    }
  } catch (err) { next(err) }
})

router.post('/:fileId', authMiddleware, async (req, res, next) => {
  try {
    const fileDoc = await SharedFile.findOne({ _id: req.params.fileId, owner: req.userId })
    if (!fileDoc) return res.status(404).json({ message: 'File not found' })

    const existing = await ShareLink.findOne({ fileId: fileDoc._id })
    if (existing) return res.json({ link: existing })

    const link = await ShareLink.create({
      fileId: fileDoc._id,
      isPublic: req.body.isPublic !== false,
      expiresAt: req.body.expiresAt || null,
    })
    res.status(201).json({ link })
  } catch (err) { next(err) }
})

router.post('/:fileId/encrypted', authMiddleware, upload.single('encryptedFile'), async (req, res, next) => {
  try {
    const fileDoc = await SharedFile.findOne({ _id: req.params.fileId, owner: req.userId })
    if (!fileDoc) return res.status(404).json({ message: 'File not found' })

    if (!req.file) return res.status(400).json({ message: 'No encrypted file provided' })
    const { code } = req.body
    if (!code) return res.status(400).json({ message: 'Access code is required' })

    const codeHash = crypto.createHash('sha256').update(code).digest('hex')

    const link = await ShareLink.create({
      fileId: fileDoc._id,
      codeHash,
      isCodeProtected: true,
      isPublic: false,
      encryptedPath: req.file.path,
    })

    res.status(201).json({ link, code })
  } catch (err) { next(err) }
})

router.get('/file/:linkId', async (req, res, next) => {
  try {
    const link = await ShareLink.findById(req.params.linkId)
    if (!link || !link.encryptedPath) return res.status(404).json({ message: 'File not found' })
    if (!fs.existsSync(link.encryptedPath)) {
      return res.status(404).json({ message: 'File data not found' })
    }
    res.download(link.encryptedPath)
  } catch (err) { next(err) }
})

router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const files = await SharedFile.find({ owner: req.userId })
    const fileIds = files.map(f => f._id)
    const links = await ShareLink.find({ fileId: { $in: fileIds } }).populate('fileId').sort({ createdAt: -1 })
    res.json({ links })
  } catch (err) { next(err) }
})

router.get('/token/:token', async (req, res, next) => {
  try {
    const link = await ShareLink.findOne({ token: req.params.token }).populate('fileId')
    if (!link) return res.status(404).json({ message: 'Link not found' })
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ message: 'Link has expired' })
    }
    link.viewCount += 1
    await link.save()
    res.json({ link, file: link.fileId })
  } catch (err) { next(err) }
})

router.get('/download/token/:token', async (req, res, next) => {
  try {
    const link = await ShareLink.findOne({ token: req.params.token }).populate('fileId')
    if (!link) return res.status(404).json({ message: 'Link not found' })
    if (!link.isPublic) return res.status(403).json({ message: 'This link is private' })
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ message: 'Link has expired' })
    }
    link.downloadCount += 1
    await link.save()
    const filePath = link.fileId.path
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' })
    }
    res.download(filePath, link.fileId.originalName)
  } catch (err) { next(err) }
})

router.put('/:id/settings', authMiddleware, async (req, res, next) => {
  try {
    const link = await ShareLink.findById(req.params.id).populate('fileId')
    if (!link) return res.status(404).json({ message: 'Link not found' })
    if (link.fileId.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    if (req.body.isPublic !== undefined) link.isPublic = req.body.isPublic
    if (req.body.expiresAt !== undefined) link.expiresAt = req.body.expiresAt
    await link.save()
    res.json({ link })
  } catch (err) { next(err) }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const link = await ShareLink.findById(req.params.id).populate('fileId')
    if (!link) return res.status(404).json({ message: 'Link not found' })
    if (link.fileId.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    if (link.encryptedPath) {
      try { fs.unlinkSync(link.encryptedPath) } catch {}
    }
    await ShareLink.deleteOne({ _id: link._id })
    res.json({ message: 'Share link deleted' })
  } catch (err) { next(err) }
})

export default router
