import { useState, useEffect } from 'react';
import client from '../../api/client';
import FileCard from '../../components/FileCard/FileCard';
import FilePreview from '../../components/FilePreview/FilePreview';
import ShareDialog from '../../components/ShareDialog/ShareDialog';
import FolderBreadcrumb from './components/FolderBreadcrumb';
import './MyFiles.css';

const filters = ['All', 'Images', 'Documents', 'Videos', 'Others'];

export default function MyFiles() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [currentFolder, activeFilter, search]);

  useEffect(() => {
    loadFiles();
    loadFolders();
  }, [currentFolder, page]);

  const loadFiles = async () => {
    try {
      let params = currentFolder ? `?folder=${currentFolder}` : '?folder=null';
      params += `&page=${page}&limit=12`;
      const { data } = await client.get(`/files${params}`);
      setFiles(data.files);
      setPagination(data.pagination);
    } catch {}
  };

  const loadFolders = async () => {
    try {
      const params = currentFolder ? `?parent=${currentFolder}` : '';
      const { data } = await client.get(`/folders${params}`);
      setFolders(data.folders);
    } catch {}
  };

  const navigateToFolder = async (folderId) => {
    setCurrentFolder(folderId);
    if (folderId) {
      const idx = folderPath.findIndex((f) => f._id === folderId);
      if (idx !== -1) {
        setFolderPath(folderPath.slice(0, idx + 1));
      } else {
        try {
          const { data } = await client.get(`/folders/${folderId}`);
          setFolderPath([...folderPath, data.folder]);
        } catch {}
      }
    } else {
      setFolderPath([]);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {return;}
    try {
      await client.post('/folders', {
        name: newFolderName.trim(),
        parent: currentFolder,
      });
      setNewFolderName('');
      setShowNewFolder(false);
      loadFolders();
    } catch {}
  };

  const deleteFolder = async (id) => {
    if (!confirm('Delete this folder and all its contents?')) {return;}
    try {
      await client.delete(`/folders/${id}`);
      loadFolders();
    } catch {}
  };

  const getType = (type) => {
    if (type === 'image') {return 'Images';}
    if (type === 'document') {return 'Documents';}
    if (type === 'video') {return 'Videos';}
    return 'Others';
  };

  const filtered = files.filter((f) => {
    const matchSearch = f.originalName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || getType(f.type) === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id) => {
    try {
      await client.delete(`/files/${id}`);
      loadFiles();
    } catch {}
  };

  const handleView = async (file) => {
    try {
      const res = await client.get(`/files/download/${file._id}`, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
      if (file.type === 'image') {
        setPreviewFile({ ...file, content: blobUrl });
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      }
    } catch {}
  };

  const handleDownload = async (file) => {
    try {
      const res = await client.get(`/files/download/${file._id}`, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {}
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) {return bytes + ' B';}
    if (bytes < 1024 * 1024) {return (bytes / 1024).toFixed(1) + ' KB';}
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const typeIcon = (type) => {
    const map = {
      image: '\uD83D\uDDBC\uFE0F',
      video: '\uD83C\uDFA5',
      document: '\uD83D\uDCC4',
      other: '\uD83D\uDCC1',
    };
    return map[type] || '\uD83D\uDCC1';
  };

  return (
    <div className="myfiles page">
      <div className="myfiles-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          My Files
        </h2>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>
          Manage your uploaded files
        </p>
      </div>

      <FolderBreadcrumb path={folderPath} onNavigate={navigateToFolder} />

      <div className="myfiles-toolbar">
        <button className="btn btn-sm btn-primary" onClick={() => setShowNewFolder(!showNewFolder)}>
          + New Folder
        </button>
      </div>

      {showNewFolder && (
        <div className="new-folder-form card">
          <input
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            autoFocus
          />
          <button className="btn btn-sm btn-primary" onClick={createFolder}>
            Create
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => {
              setShowNewFolder(false);
              setNewFolderName('');
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="myfiles-controls">
        <div className="search-bar">
          <span className="search-icon">{'\uD83D\uDD0D'}</span>
          <input
            type="text"
            placeholder="Search files..."
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

      {folders.length > 0 && (
        <div className="folders-section">
          <h4 className="folders-title">Folders</h4>
          <div className="files-grid">
            {folders.map((f) => (
              <FileCard
                key={f._id}
                file={{ id: f._id, name: f.name, type: 'folder' }}
                isFolder
                onFolderClick={(folder) => navigateToFolder(folder.id)}
                onDelete={deleteFolder}
              />
            ))}
          </div>
        </div>
      )}

      {folders.length > 0 && filtered.length > 0 && <hr className="section-divider" />}

      {filtered.length === 0 && folders.length === 0 ? (
        <div className="empty-state card">
          <h3>No files found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="files-grid">
          {filtered.map((f) => (
            <FileCard
              key={f._id}
              file={{
                id: f._id,
                name: f.originalName,
                type: f.type,
                size: formatSize(f.size),
                date: new Date(f.uploadedAt).toISOString().slice(0, 10),
                icon: typeIcon(f.type),
                mime: f.mimeType,
                content: null,
                _serverFile: f,
              }}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={setShareFile}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div
          className="pagination-controls"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <button
            className="btn btn-sm btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-sm btn-secondary"
            disabled={!pagination.hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}

      {shareFile && <ShareDialog file={shareFile} onClose={() => setShareFile(null)} />}
    </div>
  );
}
