import { useState } from 'react';
import client from '../../api/client';
import { decryptFile } from '../../utils/crypto';
import './AccessFile.css';

export default function AccessFile() {
  const [code, setCode] = useState('');
  const [step, setStep] = useState('enter');
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [decryptedUrl, setDecryptedUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleAccess = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Please enter an access code');
      return;
    }

    setStep('validating');
    try {
      const { data } = await client.post('/share/access', { code: code.trim() });
      setFileInfo(data);

      if (data.encryptedFile) {
        setStep('decrypting');
        const res = await client.get(data.encryptedFile, { responseType: 'blob' });
        const encryptedBlob = res.data;

        setStep('decrypting');
        const decrypted = await decryptFile(encryptedBlob, code.trim());

        const mimeType = data.mimeType || 'application/octet-stream';
        const blob = new Blob([decrypted], { type: mimeType });
        const url = URL.createObjectURL(blob);

        setDecryptedUrl(url);
        setFileName(data.originalName || 'file');
        setStep('ready');
      } else {
        setStep('ready');
        setFileName(data.originalName || 'Unknown file');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Access denied');
      setStep('enter');
    }
  };

  const handleDownload = () => {
    if (!decryptedUrl) {return;}
    const a = document.createElement('a');
    a.href = decryptedUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(decryptedUrl);
  };

  return (
    <div className="access-page page">
      <div className="access-container card">
        {step === 'enter' && (
          <>
            <div className="access-lock-icon">🔐</div>
            <h2>Access Shared File</h2>
            <p className="access-description">
              Enter the access code you received from the file owner to view or download the file.
            </p>
            <form className="access-form" onSubmit={handleAccess}>
              <div className="form-group">
                <label>Access Code</label>
                <input
                  type="text"
                  placeholder="e.g. X7K-9M3"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="access-code-input"
                  autoFocus
                />
              </div>
              {error && (
                <div className="error-msg" style={{ marginBottom: '1rem' }}>
                  {error}
                </div>
              )}
              <button type="submit" className="btn btn-primary access-btn">
                Access File
              </button>
            </form>
          </>
        )}

        {(step === 'validating' || step === 'decrypting') && (
          <div className="access-waiting">
            <div className="access-spinner" />
            <p>{step === 'validating' ? 'Validating code...' : 'Decrypting file...'}</p>
          </div>
        )}

        {step === 'ready' && (
          <>
            <div className="access-success-icon">✅</div>
            <h2>Access Granted</h2>
            <p className="access-file-name">{fileInfo?.originalName || fileName}</p>
            {decryptedUrl ? (
              <p className="access-success-text">File decrypted successfully!</p>
            ) : (
              <p className="access-success-text">File verified — ready for download</p>
            )}

            <div className="access-actions">
              {decryptedUrl && (
                <>
                  {fileInfo?.originalName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) && (
                    <div className="access-preview">
                      <img src={decryptedUrl} alt="Preview" className="access-preview-img" />
                    </div>
                  )}
                  {fileInfo?.mimeType === 'application/pdf' && (
                    <div className="access-preview">
                      <iframe
                        src={decryptedUrl}
                        title="PDF Preview"
                        className="access-preview-pdf"
                        style={{
                          width: '100%',
                          height: '500px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                    </div>
                  )}
                  {fileInfo?.mimeType?.startsWith('video/') && (
                    <div className="access-preview">
                      <video
                        src={decryptedUrl}
                        controls
                        className="access-preview-video"
                        style={{ width: '100%', maxHeight: '500px', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                  <button className="btn btn-primary access-btn" onClick={handleDownload}>
                    Download File
                  </button>
                </>
              )}
              {!decryptedUrl && (
                <p style={{ color: '#888', marginTop: '0.5rem' }}>
                  No encrypted file data is associated with this share link.
                </p>
              )}
            </div>

            <button
              className="btn btn-secondary access-btn"
              style={{ marginTop: '0.5rem' }}
              onClick={() => {
                setStep('enter');
                setCode('');
                setDecryptedUrl(null);
                setFileInfo(null);
              }}
            >
              Access Another File
            </button>
          </>
        )}
      </div>
    </div>
  );
}
