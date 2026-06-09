import mongoose from 'mongoose'

const sharedFileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, default: 'application/octet-stream' },
  type: { type: String, enum: ['image', 'video', 'document', 'other'], default: 'document' },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
}, { timestamps: { createdAt: 'uploadedAt', updatedAt: false } })

export default mongoose.model('SharedFile', sharedFileSchema)
