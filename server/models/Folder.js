import mongoose from 'mongoose'

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
}, { timestamps: true })

folderSchema.index({ owner: 1, parent: 1 })

export default mongoose.model('Folder', folderSchema)
