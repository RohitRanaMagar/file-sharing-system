import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../Sidebar/Sidebar'
import './Navbar.css'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const navbarRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)')
    const handler = () => { if (mq.matches) setMenuOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/my-files', label: 'My Files' },
        { to: '/upload', label: 'Upload' },
        { to: '/my-shares', label: 'My Shares' },
        { to: '/access', label: 'Access File' },
        { to: '/downloads', label: 'Activity' },
        { to: '/profile', label: 'Profile' },
        { to: '/settings', label: 'Settings' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/#features', label: 'Features' },
        { to: '/#about', label: 'About' },
        { to: '/access', label: 'Access File' },
        { to: '/contact', label: 'Contact' },
        { to: '/auth', label: 'Login/Register' },
      ]

  return (
    <>
      <nav className="navbar" ref={navbarRef}>
        <div className="navbar-inner container">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">📁</span>
            <span className="brand-text">EasyShare</span>
          </Link>

          <div className="navbar-links">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button className="btn btn-sm btn-outline nav-logout" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={navLinks}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
    </>
  )
}
