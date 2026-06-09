import './FolderBreadcrumb.css'

export default function FolderBreadcrumb({ path, onNavigate }) {
  return (
    <div className="folder-breadcrumb">
      <button className="breadcrumb-item" onClick={() => onNavigate(null)}>
        📁 Root
      </button>
      {path.map((folder, i) => (
        <span key={folder._id} className="breadcrumb-segment">
          <span className="breadcrumb-sep">/</span>
          <button
            className={'breadcrumb-item' + (i === path.length - 1 ? ' active' : '')}
            onClick={() => onNavigate(folder._id)}
          >
            {folder.name}
          </button>
        </span>
      ))}
    </div>
  )
}
