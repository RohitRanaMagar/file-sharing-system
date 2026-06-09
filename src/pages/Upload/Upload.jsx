import { useState, useRef, useEffect } from 'react'
import client from '../../api/client'
import './Upload.css'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    client.get('/folders').then(({ data }) => setFolders(data.folders)).catch(() => {})
  }, [])

  const handleFile = (selected) => {
    if (selected && selected.size > 0) {
      if (selected.size > 500 * 1024 * 1024) {
        setError('File too large. Max 500MB allowed.')
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

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    if (selectedFolder) formData.append('folderId', selectedFolder)

    try {
      await client.post('/files/upload', formData, {
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100)
          setProgress(pct)
        },
      })
      setProgress(100)
      setUploading(false)
      setUploaded(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setProgress(0)
    setUploading(false)
    setUploaded(false)
    setError('')
  }

  const resetUpload = () => {
    removeFile()
    setSelectedFolder('')
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
              <p>or click to browse (max 500MB)</p>
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

        {folders.length > 0 && (
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Upload to folder</label>
            <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
              <option value="">Root (no folder)</option>
              {folders.map(f => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

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
            <div style={{ marginTop: '0.75rem' }}>
              <button className="btn btn-primary btn-sm" onClick={resetUpload}>Upload Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
