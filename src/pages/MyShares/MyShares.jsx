import { useState, useEffect } from 'react';
import client from '../../api/client';
import './MyShares.css';

const filters = ['All', 'Public', 'Code-Protected', 'Private', 'Expired'];

export default function MyShares() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ isPublic: true, expiresAt: '' });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const { data } = await client.get('/share/my');
      setLinks(data.links);
    } catch {}
    setLoading(false);
  };

  const revokeLink = async (id) => {
    if (!confirm('Revoke this share link?')) {return;}
    try {
      await client.delete(`/share/${id}`);
      loadLinks();
    } catch {}
  };

  const startEditing = (link) => {
    setEditingId(link._id);
    setEditForm({
      isPublic: link.isPublic,
      expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ isPublic: true, expiresAt: '' });
  };

  const saveSettings = async (id) => {
    try {
      await client.put(`/share/${id}/settings`, {
        isPublic: editForm.isPublic,
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null,
      });
      setEditingId(null);
      loadLinks();
    } catch {}
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : 'Never');

  const filtered = links.filter((link) => {
    const nameMatch = (link.fileId?.originalName || '')
      .toLowerCase()
      .includes(search.toLowerCase());
    const typeMatch =
      activeFilter === 'All' ||
      (activeFilter === 'Public' && !link.isCodeProtected && link.isPublic) ||
      (activeFilter === 'Code-Protected' && link.isCodeProtected) ||
      (activeFilter === 'Private' && !link.isPublic && !link.isCodeProtected) ||
      (activeFilter === 'Expired' && link.expiresAt && new Date(link.expiresAt) < new Date());
    return nameMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="share-spinner" />
        <p>Loading shares...</p>
      </div>
    );
  }

  return (
    <div className="my-shares-page page">
      <div className="my-shares-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          My Shared Links
        </h2>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>
          Manage your shared files and access codes
        </p>
      </div>

      <div className="myfiles-controls" style={{ marginTop: '1.5rem' }}>
        <div className="search-bar">
          <span className="search-icon">{'\uD83D\uDD0D'}</span>
          <input
            type="text"
            placeholder="Search shared files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {filters.map((f) => (
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
          <h3>No shared files found</h3>
          <p>
            {search || activeFilter !== 'All'
              ? 'Try adjusting your search or filter.'
              : 'Go to My Files, click the Share button on any file to generate an access code.'}
          </p>
        </div>
      ) : (
        <div className="shares-list">
          {filtered.map((link) => (
            <div className="share-item card" key={link._id}>
              <div className="share-item-icon">
                {link.fileId?.type === 'image'
                  ? '\uD83D\uDDBC\uFE0F'
                  : link.fileId?.type === 'video'
                    ? '\uD83C\uDFA5'
                    : '\uD83D\uDCC4'}
              </div>
              <div className="share-item-info">
                <span className="share-item-name">
                  {link.fileId?.originalName || 'Unknown file'}
                </span>
                <div className="share-item-meta">
                  <span>
                    {link.isCodeProtected
                      ? '🔐 Code-protected'
                      : link.isPublic
                        ? '🌍 Public'
                        : '🔒 Private'}
                  </span>
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

                {editingId === link._id && (
                  <div
                    className="share-edit-form"
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editForm.isPublic}
                          onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                        />
                        Public visibility
                      </label>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                      <label>Expires at</label>
                      <input
                        type="datetime-local"
                        value={editForm.expiresAt}
                        onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => saveSettings(link._id)}
                      >
                        Save
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="share-item-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => startEditing(link)}
                  title="Settings"
                  style={{ marginRight: '0.5rem' }}
                >
                  Settings
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => revokeLink(link._id)}
                  title="Revoke"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
