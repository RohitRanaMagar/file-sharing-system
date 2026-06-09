import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import StatCard from '../../components/StatCard/StatCard'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [activity, setActivity] = useState([])
  const [shareCount, setShareCount] = useState(0)

  useEffect(() => {
    loadFiles()
    loadActivity()
    loadShares()
  }, [])

  const loadFiles = async () => {
    try {
      const { data } = await client.get('/files')
      setFiles(data.files)
    } catch { }
  }

  const loadActivity = async () => {
    try {
      const { data } = await client.get('/files/activity')
      setActivity(data.activity)
    } catch { }
  }

  const loadShares = async () => {
    try {
      const { data } = await client.get('/share/my')
      setShareCount(data.links.length)
    } catch { }
  }

  const totalSize = files.reduce((acc, f) => {
    return acc + f.size
  }, 0)

  const stats = [
    { icon: '\uD83D\uDCC1', label: 'Total Files', value: files.length, color: '#6366f1', to: '/my-files' },
    { icon: '\uD83D\uDD17', label: 'Shared Files', value: shareCount, color: '#10b981', to: '/my-shares' },
    { icon: '\uD83D\uDCE5', label: 'Activity log', value: activity.length, color: '#f59e0b', to: '/downloads' },
    { icon: '\uD83D\uDCBE', label: 'Storage Used', value: totalSize > 0 ? formatBytes(totalSize) : '0 MB', color: '#ef4444' },
  ]

  const quickActions = [
    { icon: '\uD83D\uDCE4', label: 'Upload File', to: '/upload', color: '#6366f1' },
    { icon: '\uD83D\uDCC2', label: 'View Files', to: '/my-files', color: '#10b981' },
    { icon: '\uD83D\uDC64', label: 'Manage Profile', to: '/profile', color: '#f59e0b' },
    { icon: '\u2699\uFE0F', label: 'Settings', to: '/settings', color: '#ef4444' },
  ]

  return (
    <div className="dashboard page">
      <div className="dashboard-welcome card">
        <div className="welcome-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="welcome-info">
          <h2>Welcome back, {user?.name || 'User'}!</h2>
          <p className="welcome-login">Last login: {user?.lastLogin || 'N/A'}</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} to={s.to} />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="recent-activity card">
          <h3 className="section-heading">Recent Activity</h3>
          <div className="activity-timeline">
            {activity.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No activity yet.</p>
            ) : (
              activity.map((a, i) => (
                <div className="activity-item" key={a.id || i}>
                  <div className="activity-icon">{a.icon}</div>
                  <div className="activity-info">
                    <p className="activity-text">
                      <strong>{a.action === 'uploaded' ? 'Uploaded' : a.action === 'shared' ? 'Shared' : 'Downloaded'}</strong> {a.file}
                    </p>
                    <span className="activity-time">{a.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h3 className="section-heading">Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map((q, i) => (
              <Link to={q.to} className="quick-action-card card" key={i}>
                <div className="quick-action-icon" style={{ background: q.color + '15', color: q.color }}>
                  {q.icon}
                </div>
                <span className="quick-action-label">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
