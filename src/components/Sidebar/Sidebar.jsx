import { Link } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar({ isOpen, onClose, navLinks, isAuthenticated, user, onLogout }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={onClose}>
            <span className="brand-icon">📁</span>
            <span className="brand-text">EasyShare</span>
          </Link>
        </div>

        {isAuthenticated && user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-email">{user.email}</p>
            </div>
          </div>
        )}

        <div className="sidebar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="sidebar-link"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          {isAuthenticated ? (
            <button className="sidebar-logout" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <p className="sidebar-footer-text">College Project</p>
          )}
        </div>
      </aside>
    </>
  )
}
