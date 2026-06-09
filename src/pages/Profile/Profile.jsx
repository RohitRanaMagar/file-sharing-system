import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Profile.css'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    course: user?.course || '',
    college: user?.college || '',
    semester: user?.semester || '',
    supervisor: user?.supervisor || '',
  })
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    const result = await updateProfile(form)
    if (result.success) {
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError(result.message)
    }
  }

  return (
    <div className="profile-page page">
      <div className="profile-card card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {saved && <div className="success-msg" style={{ textAlign: 'center', marginBottom: '1rem' }}>Profile updated successfully!</div>}
        {saveError && <div className="error-msg" style={{ textAlign: 'center', marginBottom: '1rem' }}>{saveError}</div>}

        {editing ? (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Course</label>
              <input type="text" value={form.course} placeholder="e.g. B.Sc. IT" onChange={e => setForm({ ...form, course: e.target.value })} />
            </div>
            <div className="form-group">
              <label>College</label>
              <input type="text" value={form.college} placeholder="Your college name" onChange={e => setForm({ ...form, college: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <input type="text" value={form.semester} placeholder="e.g. 6th" onChange={e => setForm({ ...form, semester: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Project Supervisor</label>
              <input type="text" value={form.supervisor} placeholder="Prof. Name" onChange={e => setForm({ ...form, supervisor: e.target.value })} />
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-detail">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user?.name || 'N/A'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email || 'N/A'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Course</span>
              <span className="detail-value">{user?.course || 'Not set'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">College</span>
              <span className="detail-value">{user?.college || 'Not set'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Semester</span>
              <span className="detail-value">{user?.semester || 'Not set'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Supervisor</span>
              <span className="detail-value">{user?.supervisor || 'Not set'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Last Login</span>
              <span className="detail-value">{user?.lastLogin || 'N/A'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
