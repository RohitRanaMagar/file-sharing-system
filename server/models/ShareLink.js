import mongoose from 'mongoose'
import crypto from 'crypto'

const shareLinkSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'SharedFile', required: true },
  token: { type: String, unique: true, default: () => crypto.randomBytes(16).toString('hex') },
  code: { type: String, default: null },
  codeHash: { type: String, default: null },
  isCodeProtected: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  encryptedPath: { type: String, default: null },
}, { timestamps: true })

export default mongoose.model('ShareLink', shareLinkSchema)
