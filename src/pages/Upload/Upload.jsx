import { useState, useRef } from 'react'
import { saveFile, addActivity, generateId } from '../../data/fileStorage'
import './Upload.css'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = (selected) => {
    if (selected && selected.size > 0) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('File too large. Max 5MB allowed for browser storage.')
        return
      }
      setError('')
      setFile(selected)
      setUploaded(false)
      setProgress(0)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleUpload = () => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError('')

    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result

      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.floor(Math.random() * 15) + 5
          if (next >= 100) {
            clearInterval(interval)
            setUploading(false)
            setUploaded(true)

            const iconMap = {
              'image/': '\uD83D\uDDBC\uFE0F',
              'video/': '\uD83C\uDFA5',
              'text/': '\uD83D\uDCDD',
              'application/pdf': '\uD83D\uDCC4',
            }
            let icon = '\uD83D\uDCC4'
            for (const [prefix, emoji] of Object.entries(iconMap)) {
              if (file.type.startsWith(prefix) || file.type === prefix) {
                icon = emoji
                break
              }
            }

            const fileMeta = {
              id: generateId(),
              name: file.name,
              type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
              size: formatSize(file.size),
              date: new Date().toISOString().slice(0, 10),
              icon,
              mime: file.type || 'application/octet-stream',
              content,
            }

            saveFile(fileMeta)
            addActivity('uploaded', file.name)

            return 100
          }
          return next
        })
      }, 300)
    }
    reader.onerror = () => {
      setError('Failed to read file.')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setFile(null)
    setProgress(0)
    setUploading(false)
    setUploaded(false)
    setError('')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="upload-page page">
      <div className="upload-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Upload File</h2>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>Drag and drop or browse to upload</p>
      </div>

      <div className="upload-container card">
        <div
          className={'upload-dropzone' + (dragOver ? ' drag-over' : '') + (file ? ' has-file' : '')}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            hidden
            onChange={e => handleFile(e.target.files[0])}
          />
          {!file ? (
            <div className="dropzone-content">
              <div className="dropzone-icon">{'\uD83D\uDCE4'}</div>
              <h3>Drag & drop your file here</h3>
              <p>or click to browse (max 5MB)</p>
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
                Browse Files
              </button>
            </div>
          ) : (
            <div className="file-preview" onClick={e => e.stopPropagation()}>
              <div className="file-preview-icon">
                {file.type.startsWith('image/') ? '\uD83D\uDDBC\uFE0F' : '\uD83D\uDCC4'}
              </div>
              <div className="file-preview-info">
                <h4 className="file-preview-name">{file.name}</h4>
                <p className="file-preview-size">{formatSize(file.size)}</p>
              </div>
              <button className="btn btn-sm btn-danger" onClick={removeFile}>
                {'\u2715'}
              </button>
            </div>
          )}
        </div>

        {error && <p className="upload-error">{error}</p>}

        {file && !uploading && !uploaded && (
          <button className="btn btn-primary upload-btn" onClick={handleUpload}>
            Upload File
          </button>
        )}

        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: progress + '%' }} />
            </div>
            <p className="progress-text">{progress}% uploaded</p>
          </div>
        )}

        {uploaded && (
          <div className="success-msg" style={{ textAlign: 'center' }}>
            {'\u2705'} File uploaded successfully!
          </div>
        )}
      </div>
    </div>
  )
}
