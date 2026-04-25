import './FileCard.css'

export default function FileCard({ file, onView, onDownload, onDelete }) {
  const typeColors = {
    document: '#6366f1',
    image: '#10b981',
    video: '#f59e0b',
    other: '#64748b',
  }

  const color = typeColors[file.type] || typeColors.other

  return (
    <div className="file-card card">
      <div className="file-card-icon" style={{ background: `${color}15`, color }}>
        {file.icon || '📁'}
      </div>
      <div className="file-card-info">
        <h4 className="file-card-name">{file.name}</h4>
        <p className="file-card-meta">
          <span>{file.date}</span>
          <span className="file-card-dot">·</span>
          <span>{file.size}</span>
        </p>
      </div>
      <div className="file-card-actions">
        <button className="btn btn-sm btn-secondary" onClick={() => onView?.(file)} title="View">👁️</button>
        <button className="btn btn-sm btn-secondary" onClick={() => onDownload?.(file)} title="Download">📥</button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete?.(file.id)} title="Delete">🗑️</button>
      </div>
    </div>
  )
}
