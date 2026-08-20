import Tokens from 'csrf'

const tokens = new Tokens()
let secret = null

export function csrfProtection(req, res, next) {
  const method = req.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next()

  if (req.path.startsWith('/auth/')) return next()

  const token = req.headers['csrf-token'] || req.body?._csrf
  if (!token) {
    return res.status(403).json({ message: 'CSRF token missing' })
  }

  if (!secret) {
    secret = tokens.secretSync()
  }

  if (!tokens.verify(secret, token)) {
    return res.status(403).json({ message: 'Invalid CSRF token' })
  }

  next()
}

export function csrfTokenRoute(req, res) {
  if (!secret) {
    secret = tokens.secretSync()
  }
  const token = tokens.create(secret)
  res.json({ csrfToken: token })
}
