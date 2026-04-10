import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getFiles, getActivity } from '../../data/fileStorage'
import StatCard from '../../components/StatCard/StatCard'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const files = getFiles()
  const activity = getActivity()

  const totalSize = files.reduce((acc, f) => {
    const num = parseFloat(f.size)
    if (f.size.includes('MB')) return acc + num
    if (f.size.includes('KB')) return acc + num / 1024
    return acc
  }, 0)

  const stats = [
    { icon: '📁', label: 'Total Files', value: files.length, color: '#6366f1', to: '/my-files' },
    { icon: '🔗', label: 'Shared Files', value: '0', color: '#10b981' },
    { icon: '📥', label: 'Activity log', value: '0', color: '#f59e0b', to: '/downloads' },
    { icon: '💾', label: 'Storage Used', value: totalSize > 0 ? totalSize.toFixed(1) + ' MB' : '0 MB', color: '#ef4444' },
  ]

  const quickActions = [
    { icon: '📤', label: 'Upload File', to: '/upload', color: '#6366f1' },
    { icon: '📂', label: 'View Files', to: '/my-files', color: '#10b981' },
    { icon: '👤', label: 'Manage Profile', to: '/profile', color: '#f59e0b' },
    { icon: '⚙️', label: 'Settings', to: '/settings', color: '#ef4444' },
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
                <div className="activity-item" key={a.id}>
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
