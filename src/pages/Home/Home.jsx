import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/Footer/Footer'
import teamMembers from '../../data/teamMembers'
import './Home.css'

const features = [
  { title: 'Secure File Sharing', desc: 'End-to-end encrypted file transfers to keep your data safe and private.', icon: '🔒' },
  { title: 'Fast Upload', desc: 'Lightning-fast upload speeds with support for large files up to 2GB.', icon: '⚡' },
  { title: 'Download Anywhere', desc: 'Access and download your files from any device, anytime, anywhere.', icon: '🌍' },
  { title: 'File Preview', desc: 'Preview documents, images, and videos directly in your browser.', icon: '👁️' },
  { title: 'Responsive Design', desc: 'Fully responsive interface that works perfectly on all screen sizes.', icon: '📱' },
  { title: 'Easy File Management', desc: 'Organize, search, filter, and manage all your files in one place.', icon: '📁' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content container">
          <div className="hero-badge"> Project</div>
          <h1 className="hero-title">
            Welcome to <span className="hero-highlight">EasyShare</span>
          </h1>
          <p className="hero-subtitle">
            Upload, manage, and share your files securely with a simple and modern interface.
            Built with React.js for educational purposes.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                <Link to="/access" className="btn btn-outline">Access a File</Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn btn-primary">Get Started</Link>
                <Link to="/access" className="btn btn-outline">Receive a File</Link>
                <Link to="/auth" className="btn btn-secondary">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <p className="section-subtitle">Everything you need for file management</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About Project</h2>
          <p className="section-subtitle">Learn more about EasyShare</p>
          <div className="about-content card">
            <h3>What is EasyShare?</h3>
            <p>
              EasyShare is a college-level frontend file sharing web application developed as a
              semester project for BIT students at Gandaki University. It demonstrates modern web
              development practices using React.js and related technologies.
            </p>
            <h3>Educational Purpose</h3>
            <p>
              This project was built to showcase skills in React.js, responsive design, state
              management using Context API, routing with React Router, and modern CSS techniques.
              It simulates a real-world file sharing platform with authentication, file management,
              and user settings.
            </p>
            <h3>Built Using</h3>
            <div className="tech-stack">
              {['React.js', 'Vite', 'React Router', 'Context API', 'CSS3', 'localStorage'].map(tech => (
                <span className="tech-badge" key={tech}>{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="team-section">
        <div className="container">
          <h2 className="section-title">Team</h2>
          <p className="section-subtitle">Developed by</p>
          <div className="team-grid">
            {teamMembers.map((m, i) => (
              <div className="team-card card" key={i}>
                <div className="team-avatar">{m.name.charAt(0)}</div>
                <h3 className="team-name">{m.name}</h3>
                <p className="team-role">{m.role}</p>
                <div className="team-details">
                  <p><strong>Course:</strong> {m.course}</p>
                  <p><strong>College:</strong> {m.college}</p>
                  <p><strong>Supervisor:</strong> {m.supervisor}</p>
                  <p><strong>Semester:</strong> {m.semester}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
