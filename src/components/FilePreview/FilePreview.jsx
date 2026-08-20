import './FilePreview.css';

export default function FilePreview({ file, onClose }) {
  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3>{file.name}</h3>
          <button className="btn btn-sm btn-danger" onClick={onClose}>
            {'\u2715'}
          </button>
        </div>
        <div className="preview-body">
          {file.type === 'image' ? (
            <img src={file.content} alt={file.name} className="preview-image" />
          ) : (
            <iframe src={file.content} className="preview-iframe" title="preview" />
          )}
        </div>
      </div>
    </div>
  );
}
