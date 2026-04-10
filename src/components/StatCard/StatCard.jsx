import { Link } from 'react-router-dom'
import './StatCard.css'

export default function StatCard({ icon, label, value, color, to }) {
  const content = (
    <>
      <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
      </div>
    </>
  )

  if (to) {
    return <Link to={to} className="stat-card card stat-card-link">{content}</Link>
  }

  return <div className="stat-card card">{content}</div>
}
