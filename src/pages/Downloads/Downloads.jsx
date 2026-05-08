import { useState } from 'react'
import { getActivity, clearActivity } from '../../data/fileStorage'
import './Downloads.css'

const actionFilters = ['All', 'Uploaded', 'Downloaded', 'Deleted', 'Edited']

export default function Downloads() {
  const [activity, setActivity] = useState(getActivity)
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activity.filter(a => {
    return activeFilter === 'All' || a.action === activeFilter.toLowerCase()
  })

  const handleRefresh = () => {
    setActivity(getActivity())
  }

  const handleClear = () => {
    clearActivity()
    setActivity([])
  }

  return (
    <div className="downloads page">
      <div className="downloads-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Activity Log</h2>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>Recently added, downloaded, deleted, and edited files</p>
      </div>

      <div className="downloads-controls">
        <div className="filter-tabs">
          {actionFilters.map(f => (
            <button
              key={f}
              className={'filter-tab ' + (activeFilter === f ? 'active' : '')}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="downloads-actions">
          <button className="btn btn-sm btn-secondary" onClick={handleRefresh}>Refresh</button>
          <button className="btn btn-sm btn-danger" onClick={handleClear}>Clear All</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <h3>No activity found</h3>
          <p>Try adjusting your filter or upload a file.</p>
        </div>
      ) : (
        <div className="activity-list">
          {filtered.map(a => (
            <div className="activity-card card" key={a.id}>
              <div className="activity-card-icon">{a.icon}</div>
              <div className="activity-card-info">
                <p className="activity-card-text">
                  <strong>{a.action === 'uploaded' ? 'Uploaded' : a.action === 'downloaded' ? 'Downloaded' : a.action === 'deleted' ? 'Deleted' : a.action === 'edited' ? 'Edited' : a.action}</strong> {a.file}
                </p>
                <span className="activity-card-time">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
