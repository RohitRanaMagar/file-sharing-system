import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import express from 'express'
import authRoutes from '../server/routes/auth.js'
import fileRoutes from '../server/routes/files.js'
import folderRoutes from '../server/routes/folders.js'
import shareRoutes from '../server/routes/share.js'

vi.mock('../server/middleware/auth.js', () => ({
  authMiddleware: (req, res, next) => {
    req.userId = 'mock-user-id'
    next()
  },
}))

vi.mock('../server/middleware/validation.js', () => ({
  validate: (schema) => (req, res, next) => {
    const errors = {}
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field]
      for (const rule of rules) {
        const error = rule(value, field)
        if (error) { errors[field] = error; break }
      }
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors })
    }
    next()
  },
  required: (value, field) => (!value || (typeof value === 'string' && !value.trim())) ? `${field} is required` : null,
  email: (value, field) => (value && !/^\S+@\S+\.\S+$/.test(value)) ? 'Invalid email format' : null,
  minLength: (min) => (value, field) => (value && value.length < min) ? `${field} must be at least ${min} characters` : null,
}))

const mockUser = {
  _id: 'mock-user-id',
  name: 'Test User',
  email: 'test@test.com',
  password: 'hashed-password',
  isVerified: false,
  verificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  isAdmin: false,
  toJSON: function () {
    const obj = { ...this }
    delete obj.password
    return obj
  },
  save: vi.fn().mockResolvedValue(true),
  comparePassword: vi.fn(),
}

const mockFile = {
  _id: 'mock-file-id',
  owner: 'mock-user-id',
  originalName: 'test.pdf',
  filename: '123-test.pdf',
  size: 1024,
  path: '/tmp/test.pdf',
  mimeType: 'application/pdf',
  type: 'document',
  contentHash: 'abc123',
  folder: null,
  uploadedAt: new Date(),
  toJSON: function () { return { ...this } },
}

const mockFolder = {
  _id: 'mock-folder-id',
  name: 'Test Folder',
  owner: 'mock-user-id',
  parent: null,
  save: vi.fn().mockResolvedValue(true),
  toJSON: function () { return { ...this } },
}

const mockShareLink = {
  _id: 'mock-share-id',
  fileId: mockFile,
  token: 'mock-token',
  codeHash: null,
  isCodeProtected: false,
  isPublic: true,
  expiresAt: null,
  downloadCount: 0,
  viewCount: 0,
  encryptedPath: null,
  save: vi.fn().mockResolvedValue(true),
}

vi.mock('../server/models/User.js', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}))

vi.mock('../server/models/SharedFile.js', () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}))

vi.mock('../server/models/Folder.js', () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
  },
}))

vi.mock('../server/models/ShareLink.js', () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
  },
}))

import User from '../server/models/User.js'
import SharedFile from '../server/models/SharedFile.js'
import Folder from '../server/models/Folder.js'
import ShareLink from '../server/models/ShareLink.js'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRoutes)
  app.use('/api/files', fileRoutes)
  app.use('/api/folders', folderRoutes)
  app.use('/api/share', shareRoutes)
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
  return app
}

import supertest from 'supertest'

describe('Health Check', () => {
  it('GET /api/health returns ok', async () => {
    const app = createApp()
    const res = await supertest(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('returns 400 for missing fields', async () => {
      const app = createApp()
      const res = await supertest(app).post('/api/auth/register').send({})
      expect(res.status).toBe(400)
    })

    it('returns 409 for duplicate email', async () => {
      User.findOne.mockResolvedValue(mockUser)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' })
      expect(res.status).toBe(409)
    })

    it('creates user and returns token', async () => {
      User.findOne.mockResolvedValue(null)
      User.create.mockResolvedValue({
        ...mockUser,
        toJSON: function () {
          const { password, ...rest } = this
          return rest
        },
      })
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'new@test.com', password: 'password123' })
      expect(res.status).toBe(201)
      expect(res.body.token).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    it('returns 400 for missing fields', async () => {
      const app = createApp()
      const res = await supertest(app).post('/api/auth/login').send({})
      expect(res.status).toBe(400)
    })

    it('returns 401 for invalid email', async () => {
      User.findOne.mockResolvedValue(null)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'password123' })
      expect(res.status).toBe(401)
    })

    it('returns 401 for wrong password', async () => {
      const user = { ...mockUser, comparePassword: vi.fn().mockResolvedValue(false) }
      User.findOne.mockResolvedValue(user)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
      expect(res.status).toBe(401)
    })

    it('returns token for valid credentials', async () => {
      const user = {
        ...mockUser,
        lastLogin: null,
        comparePassword: vi.fn().mockResolvedValue(true),
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          const { password, ...rest } = this
          return rest
        },
      }
      User.findOne.mockResolvedValue(user)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })
      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
    })
  })

  describe('POST /api/auth/verify-email', () => {
    it('returns 400 for missing token', async () => {
      const app = createApp()
      const res = await supertest(app).post('/api/auth/verify-email').send({})
      expect(res.status).toBe(400)
    })

    it('returns 400 for invalid token', async () => {
      User.findOne.mockResolvedValue(null)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid' })
      expect(res.status).toBe(400)
    })

    it('verifies email with valid token', async () => {
      const user = {
        ...mockUser,
        verificationToken: 'valid-token',
        isVerified: false,
        save: vi.fn().mockResolvedValue(true),
      }
      User.findOne.mockResolvedValue(user)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-token' })
      expect(res.status).toBe(200)
      expect(res.body.message).toContain('verified')
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('returns 400 for missing email', async () => {
      const app = createApp()
      const res = await supertest(app).post('/api/auth/forgot-password').send({})
      expect(res.status).toBe(400)
    })

    it('returns 404 for unknown email', async () => {
      User.findOne.mockResolvedValue(null)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'unknown@test.com' })
      expect(res.status).toBe(404)
    })

    it('generates reset token for valid email', async () => {
      const user = { ...mockUser, save: vi.fn().mockResolvedValue(true) }
      User.findOne.mockResolvedValue(user)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@test.com' })
      expect(res.status).toBe(200)
      expect(res.body.resetToken).toBeDefined()
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('returns 400 for missing fields', async () => {
      const app = createApp()
      const res = await supertest(app).post('/api/auth/reset-password').send({})
      expect(res.status).toBe(400)
    })

    it('returns 400 for invalid/expired token', async () => {
      User.findOne.mockResolvedValue(null)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid', password: 'newpassword123' })
      expect(res.status).toBe(400)
    })

    it('resets password with valid token', async () => {
      const user = {
        ...mockUser,
        resetPasswordToken: 'valid-reset-token',
        resetPasswordExpires: new Date(Date.now() + 3600000),
        save: vi.fn().mockResolvedValue(true),
      }
      User.findOne.mockResolvedValue(user)
      const app = createApp()
      const res = await supertest(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-reset-token', password: 'newpassword123' })
      expect(res.status).toBe(200)
    })
  })
})

describe('File Routes', () => {
  describe('GET /api/files', () => {
    it('returns files list with pagination', async () => {
      SharedFile.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockFile]),
          }),
        }),
      })
      SharedFile.countDocuments.mockResolvedValue(1)
      const app = createApp()
      const res = await supertest(app).get('/api/files').set('Authorization', 'Bearer test')
      expect(res.status).toBe(200)
      expect(res.body.files).toBeDefined()
      expect(res.body.pagination).toBeDefined()
    })
  })

  describe('GET /api/files/download/:id', () => {
    it('returns 404 for non-existent file', async () => {
      SharedFile.findOne.mockResolvedValue(null)
      const app = createApp()
      const res = await supertest(app).get('/api/files/download/nonexistent').set('Authorization', 'Bearer test')
      expect(res.status).toBe(404)
    })
  })
})

describe('Folder Routes', () => {
  describe('POST /api/folders', () => {
    it('returns 400 for missing name', async () => {
      const app = createApp()
      const res = await supertest(app).post('/api/folders').set('Authorization', 'Bearer test').send({})
      expect(res.status).toBe(400)
    })

    it('creates folder with name', async () => {
      Folder.findOne.mockResolvedValue(null)
      Folder.create.mockResolvedValue(mockFolder)
      const app = createApp()
      const res = await supertest(app).post('/api/folders').set('Authorization', 'Bearer test').send({ name: 'New Folder' })
      expect(res.status).toBe(201)
    })
  })

  describe('GET /api/folders', () => {
    it('returns folders list', async () => {
      Folder.find.mockReturnValue({ sort: vi.fn().mockResolvedValue([mockFolder]) })
      const app = createApp()
      const res = await supertest(app).get('/api/folders').set('Authorization', 'Bearer test')
      expect(res.status).toBe(200)
      expect(res.body.folders).toBeDefined()
    })
  })
})

describe('Share Routes', () => {
  describe('POST /api/share/access', () => {
    it('returns 400 for missing code', async () => {
      const app = createApp()
      const res = await supertest(app).post('/api/share/access').send({})
      expect(res.status).toBe(400)
    })

    it('returns 404 for invalid code', async () => {
      ShareLink.findOne.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      })
      const app = createApp()
      const res = await supertest(app).post('/api/share/access').send({ code: 'INVALID' })
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/share/my', () => {
    it('returns user share links', async () => {
      SharedFile.find.mockResolvedValue([{ _id: 'file1' }])
      ShareLink.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({ sort: vi.fn().mockResolvedValue([mockShareLink]) }),
      })
      const app = createApp()
      const res = await supertest(app).get('/api/share/my').set('Authorization', 'Bearer test')
      expect(res.status).toBe(200)
      expect(res.body.links).toBeDefined()
    })
  })
})
