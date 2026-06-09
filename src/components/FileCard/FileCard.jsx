import './FileCard.css'

export default function FileCard({ file, onView, onDownload, onDelete, onShare, isFolder, onFolderClick }) {
  const typeColors = {
    document: '#6366f1',
    image: '#10b981',
    video: '#f59e0b',
    other: '#64748b',
    folder: '#f59e0b',
  }

  const color = typeColors[file.type || 'folder'] || typeColors.other

  const handleClick = () => {
    if (isFolder && onFolderClick) onFolderClick(file)
  }

  return (
    <div className={'file-card card' + (isFolder ? ' folder-card' : '')} onClick={handleClick}>
      <div className="file-card-icon" style={{ background: `${color}15`, color }}>
        {isFolder ? '\uD83D\uDCC1' : (file.icon || '\uD83D\uDCC4')}
      </div>
      <div className="file-card-info">
        <h4 className="file-card-name">{file.name}</h4>
        <p className="file-card-meta">
          {isFolder ? (
            <span>Folder</span>
          ) : (
            <>
              <span>{file.date}</span>
              <span className="file-card-dot">·</span>
              <span>{file.size}</span>
            </>
          )}
        </p>
      </div>
      <div className="file-card-actions" onClick={e => e.stopPropagation()}>
        {isFolder ? (
          <button className="btn btn-sm btn-danger" onClick={() => onDelete?.(file.id)} title="Delete Folder">🗑️</button>
        ) : (
          <>
            <button className="btn btn-sm btn-secondary" onClick={() => onView?.(file)} title="View">👁️</button>
            <button className="btn btn-sm btn-secondary" onClick={() => onDownload?.(file)} title="Download">📥</button>
            <button className="btn btn-sm btn-secondary" onClick={() => onShare?.(file)} title="Share">🔗</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete?.(file.id)} title="Delete">🗑️</button>
          </>
        )}
      </div>
    </div>
  )
}
