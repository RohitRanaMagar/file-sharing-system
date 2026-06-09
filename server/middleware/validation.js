export function validate(schema) {
  return (req, res, next) => {
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
  }
}

export const required = (value, field) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${field} is required`
  }
  return null
}

export const email = (value, field) => {
  if (value && !/^\S+@\S+\.\S+$/.test(value)) {
    return 'Invalid email format'
  }
  return null
}

export const minLength = (min) => (value, field) => {
  if (value && value.length < min) {
    return `${field} must be at least ${min} characters`
  }
  return null
}
