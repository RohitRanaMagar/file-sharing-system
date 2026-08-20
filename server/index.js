import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import fileRoutes from './routes/files.js'
import shareRoutes from './routes/share.js'
import folderRoutes from './routes/folders.js'
import adminRoutes from './routes/admin.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/logger.js'
import { csrfProtection, csrfTokenRoute } from './middleware/csrf.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ credentials: true, origin: true }))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(requestLogger)

app.get('/api/csrf-token', csrfTokenRoute)
app.use('/api', csrfProtection)

app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/share', shareRoutes)
app.use('/api/folders', folderRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`EasyShare server running on http://localhost:${PORT}`)
  })
})
