import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-heading">EasyShare</h3>
            <p className="footer-desc">
              A college project file sharing platform built with React.js for easy file management and sharing.
            </p>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/auth">Login/Register</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/help">Help</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Contact Info</h3>
            <ul className="footer-contact">
              <li>📧 easy@share.com</li>
              <li>📱 +91 98765 43210</li>
              <li>📍 Gandaki University</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} EasyShare. All rights reserved. | Built with React.js</p>
        </div>
      </div>
    </footer>
  )
}
