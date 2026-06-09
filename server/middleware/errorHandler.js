export function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err)

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key error' })
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
}
