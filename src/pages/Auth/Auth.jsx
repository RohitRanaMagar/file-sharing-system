import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

function getPasswordStrength(password) {
  let score = 0
  const feedback = []

  if (password.length >= 8) score++
  else feedback.push('Use at least 8 characters')
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  else if (password.length >= 6) feedback.push('Add uppercase letters')
  if (/[a-z]/.test(password)) score++
  else if (password.length >= 6) feedback.push('Add lowercase letters')
  if (/\d/.test(password)) score++
  else if (password.length >= 6) feedback.push('Add a number')
  if (/[^A-Za-z0-9]/.test(password)) score++
  else if (password.length >= 6) feedback.push('Add a special character (!@#$%^&*)')

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['', '#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#27ae60']
  const idx = Math.min(score, 5)

  return { score: idx, label: labels[idx], color: colors[idx], feedback }
}

function generateStrongPassword() {
  const adjectives = ['Secure', 'Strong', 'Safe', 'Fast', 'Super', 'Mega', 'Ultra', 'Easy', 'Big', 'Cool']
  const nouns = ['Pass', 'Key', 'Lock', 'Guard', 'Shield', 'Vault', 'Gate', 'Share', 'Box', 'Hub']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 90) + 10
  const special = ['!', '@', '#', '$', '%', '&'][Math.floor(Math.random() * 6)]
  return adj + noun + num + special
}

export default function Auth() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [showPassword, setShowPassword] = useState({ password: false, confirm: false })

  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false })
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')

  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [regErrors, setRegErrors] = useState({})
  const [regSuccess, setRegSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '', feedback: [] })
  const [suggestedPassword, setSuggestedPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginSuccess('')
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please fill in all fields')
      return
    }
    const result = login(loginForm.email, loginForm.password)
    if (result.success) {
      setLoginSuccess('Login successful! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 500)
    } else {
      setLoginError(result.message)
    }
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setRegErrors({})
    setRegSuccess('')
    const errors = {}
    if (!regForm.name.trim()) errors.name = 'Name is required'
    if (!regForm.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) errors.email = 'Invalid email format'
    if (!regForm.password) errors.password = 'Password is required'
    else if (regForm.password.length < 6) errors.password = 'At least 6 characters'
    if (regForm.password !== regForm.confirm) errors.confirm = 'Passwords do not match'
    setPasswordStrength({ score: 0, label: '', color: '', feedback: [] })
    setSuggestedPassword('')
    if (Object.keys(errors).length) { setRegErrors(errors); return }

    const result = register(regForm.name, regForm.email, regForm.password)
    if (result.success) {
      setRegSuccess('Registration successful! Please login.')
      setRegForm({ name: '', email: '', password: '', confirm: '' })
      setPasswordStrength({ score: 0, label: '', color: '', feedback: [] })
      setSuggestedPassword('')
      setTimeout(() => setTab('login'), 800)
    } else {
      setRegErrors({ general: result.message })
    }
  }

  const handleRegPasswordChange = (e) => {
    const value = e.target.value
    setRegForm({ ...regForm, password: value })
    setRegErrors({ ...regErrors, password: '' })
    if (value.length >= 6) {
      const strength = getPasswordStrength(value)
      setPasswordStrength(strength)
      if (strength.score <= 2) {
        if (!suggestedPassword) setSuggestedPassword(generateStrongPassword())
      } else {
        setSuggestedPassword('')
      }
    } else {
      setPasswordStrength({ score: 0, label: '', color: '', feedback: [] })
      setSuggestedPassword('')
    }
  }

  const acceptSuggestedPassword = () => {
    if (!suggestedPassword) return
    setRegForm({ ...regForm, password: suggestedPassword, confirm: '' })
    setPasswordStrength(getPasswordStrength(suggestedPassword))
    setRegErrors({ ...regErrors, password: '', confirm: '' })
    setSuggestedPassword('')
  }

  return (
    <div className="auth-page page">
      <div className="auth-container card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome to EasyShare</h2>
          <p className="auth-subtitle">Sign in or create your account</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            {loginError && <div className="error-msg" style={{ marginBottom: '1rem', textAlign: 'center' }}>{loginError}</div>}
            {loginSuccess && <div className="success-msg">{loginSuccess}</div>}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input type={showPassword.password ? 'text' : 'password'} placeholder="Enter password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                <button type="button" className="toggle-password" onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}>
                  {showPassword.password ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <label className="remember-label">
              <input type="checkbox" checked={loginForm.remember} onChange={e => setLoginForm({ ...loginForm, remember: e.target.checked })} />
              <span>Remember me</span>
            </label>
            <button type="submit" className="btn btn-primary auth-submit">Login</button>
          </form>
        )}

        {tab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            {regErrors.general && <div className="error-msg" style={{ marginBottom: '1rem', textAlign: 'center' }}>{regErrors.general}</div>}
            {regSuccess && <div className="success-msg">{regSuccess}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
              {regErrors.name && <span className="error-msg">{regErrors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
              {regErrors.email && <span className="error-msg">{regErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input type={showPassword.password ? 'text' : 'password'} placeholder="At least 6 characters" value={regForm.password} onChange={handleRegPasswordChange} />
                <button type="button" className="toggle-password" onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}>
                  {showPassword.password ? '🙈' : '👁️'}
                </button>
              </div>
              {regErrors.password && <span className="error-msg">{regErrors.password}</span>}
              {regForm.password.length >= 6 && (
                <div className="password-strength-area">
                  <div className="strength-meter">
                    <div className="strength-bar" style={{ width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }} />
                  </div>
                  <span className="strength-label" style={{ color: passwordStrength.color || 'var(--text-muted)' }}>{passwordStrength.label || 'Weak'}</span>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="strength-feedback">
                      {passwordStrength.feedback.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
                  {suggestedPassword && (
                    <div className="password-suggestion">
                      <span>Try: <strong>{suggestedPassword}</strong></span>
                      <button type="button" className="btn btn-primary btn-sm" onClick={acceptSuggestedPassword}>Use</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input">
                <input type={showPassword.confirm ? 'text' : 'password'} placeholder="Confirm your password" value={regForm.confirm} onChange={e => setRegForm({ ...regForm, confirm: e.target.value })} />
                <button type="button" className="toggle-password" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}>
                  {showPassword.confirm ? '🙈' : '👁️'}
                </button>
              </div>
              {regErrors.confirm && <span className="error-msg">{regErrors.confirm}</span>}
            </div>
            <button type="submit" className="btn btn-primary auth-submit">Register</button>
          </form>
        )}
      </div>
    </div>
  )
}
