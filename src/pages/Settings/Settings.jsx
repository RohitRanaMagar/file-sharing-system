import { useState, useEffect } from 'react'
import client from '../../api/client'
import './Settings.css'

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('easyshare_user') || 'null')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('easyshare_theme') === 'dark')
  const [notifications, setNotifications] = useState(() => localStorage.getItem('easyshare_notifications') !== 'false')

  const [passForm, setPassForm] = useState({ current: '', newPassword: '', confirm: '' })
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('easyshare_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDark = () => setDarkMode(prev => !prev)
  const toggleNotifications = () => {
    setNotifications(prev => {
      const next = !prev
      localStorage.setItem('easyshare_notifications', String(next))
      return next
    })
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPassError('')
    setPassSuccess('')

    if (!passForm.current || !passForm.newPassword || !passForm.confirm) {
      setPassError('Please fill in all fields')
      return
    }
    if (passForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters')
      return
    }
    if (passForm.newPassword !== passForm.confirm) {
      setPassError('Passwords do not match')
      return
    }

    try {
      await client.put('/auth/password', {
        currentPassword: passForm.current,
        newPassword: passForm.newPassword,
      })
      setPassSuccess('Password changed successfully!')
      setPassForm({ current: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <div className="settings-page page">
      <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>Settings</h2>
      <p className="section-subtitle" style={{ marginBottom: '2rem' }}>Customize your experience</p>

      <div className="settings-sections">
        <div className="settings-section card">
          <h3 className="settings-section-title">Appearance</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Dark Mode</span>
              <span className="setting-desc">Toggle dark theme</span>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={darkMode} onChange={toggleDark} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-section card">
          <h3 className="settings-section-title">Notifications</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Enable Notifications</span>
              <span className="setting-desc">Receive file updates</span>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={notifications} onChange={toggleNotifications} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-section card">
          <h3 className="settings-section-title">Change Password</h3>
          <form className="password-form" onSubmit={handlePasswordChange}>
            {passError && <div className="error-msg">{passError}</div>}
            {passSuccess && <div className="success-msg">{passSuccess}</div>}
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Update Password</button>
          </form>
        </div>

        <div className="settings-section card">
          <h3 className="settings-section-title">Account Information</h3>
          <div className="account-info">
            <div className="account-row">
              <span className="account-label">Name</span>
              <span className="account-value">{user?.name || 'N/A'}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Email</span>
              <span className="account-value">{user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
