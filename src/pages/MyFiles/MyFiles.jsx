import { useState } from 'react'
import { getFiles, deleteFile as deleteStoredFile } from '../../data/fileStorage'
import FileCard from '../../components/FileCard/FileCard'
import FilePreview from '../../components/FilePreview/FilePreview'
import './MyFiles.css'

const filters = ['All', 'Images', 'Documents', 'Videos', 'Others']

export default function MyFiles() {
  const [files, setFiles] = useState(getFiles)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [previewFile, setPreviewFile] = useState(null)

  const getType = (type) => {
    if (type === 'image') return 'Images'
    if (type === 'document') return 'Documents'
    if (type === 'video') return 'Videos'
    return 'Others'
  }

  const filtered = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || getType(f.type) === activeFilter
    return matchSearch && matchFilter
  })

  const handleDelete = (id) => {
    deleteStoredFile(id)
    setFiles(getFiles())
  }

  const handleView = (file) => {
    if (file.content) {
      if (file.type === 'image') {
        setPreviewFile(file)
      } else {
        window.open(file.content, '_blank')
      }
    } else {
      alert('Preview not available.')
    }
  }

  const handleDownload = (file) => {
    if (file.content) {
      const a = document.createElement('a')
      a.href = file.content
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      alert('Download not available.')
    }
  }

  return (
    <div className="myfiles page">
      <div className="myfiles-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>My Files</h2>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>Manage your uploaded files</p>
      </div>

      <div className="myfiles-controls">
        <div className="search-bar">
          <span className="search-icon">{'\uD83D\uDD0D'}</span>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {filters.map(f => (
            <button
              key={f}
              className={'filter-tab ' + (activeFilter === f ? 'active' : '')}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <h3>No files found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="files-grid">
          {filtered.map(f => (
            <FileCard
              key={f.id}
              file={f}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  )
}
