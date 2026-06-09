import { useState, useEffect } from 'react'
import client from '../../api/client'
import './MyShares.css'

export default function MyShares() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLinks() }, [])

  const loadLinks = async () => {
    try {
      const { data } = await client.get('/share/my')
      setLinks(data.links)
    } catch {}
    setLoading(false)
  }

  const revokeLink = async (id) => {
    if (!confirm('Revoke this share link?')) return
    try {
      await client.delete(`/share/${id}`)
      loadLinks()
    } catch {}
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString() : 'Never'

  if (loading) {
    return <div className="page" style={{ textAlign: 'center', padding: '3rem' }}><div className="share-spinner" /><p>Loading shares...</p></div>
  }

  return (
    <div className="my-shares-page page">
      <div className="my-shares-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>My Shared Links</h2>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>Manage your shared files and access codes</p>
      </div>

      {links.length === 0 ? (
        <div className="empty-state card">
          <h3>No shared files yet</h3>
          <p>Go to My Files, click the Share button on any file to generate an access code.</p>
        </div>
      ) : (
        <div className="shares-list">
          {links.map(link => (
            <div className="share-item card" key={link._id}>
              <div className="share-item-icon">
                {link.fileId?.type === 'image' ? '\uD83D\uDDBC\uFE0F' : link.fileId?.type === 'video' ? '\uD83C\uDFA5' : '\uD83D\uDCC4'}
              </div>
              <div className="share-item-info">
                <span className="share-item-name">{link.fileId?.originalName || 'Unknown file'}</span>
                <div className="share-item-meta">
                  <span>{link.isCodeProtected ? '🔐 Code-protected' : link.isPublic ? '🌍 Public' : '🔒 Private'}</span>
                  <span className="share-meta-dot">·</span>
                  <span>{link.viewCount || 0} views</span>
                  <span className="share-meta-dot">·</span>
                  <span>{link.downloadCount || 0} downloads</span>
                  {link.expiresAt && (
                    <>
                      <span className="share-meta-dot">·</span>
                      <span>Expires: {formatDate(link.expiresAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="share-item-actions">
                <button className="btn btn-sm btn-danger" onClick={() => revokeLink(link._id)} title="Revoke">
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
