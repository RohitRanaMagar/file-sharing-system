import { useState, useEffect } from 'react';
import client from '../../api/client';
import './Admin.css';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [shares, setShares] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client
        .get('/admin/stats')
        .then((r) => setStats(r.data.stats))
        .catch(() => {}),
      client
        .get('/admin/users')
        .then((r) => setUsers(r.data.users))
        .catch(() => {}),
      client
        .get('/admin/files')
        .then((r) => setFiles(r.data.files))
        .catch(() => {}),
      client
        .get('/admin/shares')
        .then((r) => setShares(r.data.shares))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and all their files?')) {return;}
    try {
      await client.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch {}
  };

  const formatSize = (bytes) => {
    if (!bytes) {return '0 B';}
    if (bytes < 1024) {return bytes + ' B';}
    if (bytes < 1024 * 1024) {return (bytes / 1024).toFixed(1) + ' KB';}
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="share-spinner" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-page page">
      <h2 className="section-title">Admin Dashboard</h2>
      <p className="section-subtitle">Manage users, files, and shares</p>

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.recentUsers}</h3>
            <p>New This Week</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.totalFiles}</h3>
            <p>Total Files</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.totalShares}</h3>
            <p>Total Shares</p>
          </div>
        </div>
      )}

      <div className="admin-section">
        <div className="admin-tabs">
          {['users', 'files', 'shares'].map((t) => (
            <button
              key={t}
              className={'filter-tab ' + (tab === t ? 'active' : '')}
              onClick={() => setTab(t)}
              style={{ textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={'admin-badge ' + (u.isAdmin ? 'admin' : 'user')}>
                      {u.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={'admin-badge ' + (u.isVerified ? 'verified' : '')}>
                      {u.isVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!u.isAdmin && (
                      <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'files' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Size</th>
                <th>Type</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f._id}>
                  <td>{f.originalName}</td>
                  <td>{f.owner?.name || 'Unknown'}</td>
                  <td>{formatSize(f.size)}</td>
                  <td>{f.type}</td>
                  <td>{new Date(f.uploadedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'shares' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Owner</th>
                <th>Type</th>
                <th>Views</th>
                <th>Downloads</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => (
                <tr key={s._id}>
                  <td>{s.fileId?.originalName || 'Unknown'}</td>
                  <td>{s.fileId?.owner?.name || 'Unknown'}</td>
                  <td>{s.isCodeProtected ? 'Code' : s.isPublic ? 'Public' : 'Private'}</td>
                  <td>{s.viewCount}</td>
                  <td>{s.downloadCount}</td>
                  <td>{s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
