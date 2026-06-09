import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import fileRoutes from './routes/files.js'
import shareRoutes from './routes/share.js'
import folderRoutes from './routes/folders.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/share', shareRoutes)
app.use('/api/folders', folderRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`EasyShare server running on http://localhost:${PORT}`)
  })
})
