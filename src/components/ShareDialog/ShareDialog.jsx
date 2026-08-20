import { useState } from 'react';
import client from '../../api/client';
import { generateCode, encryptFile } from '../../utils/crypto';
import './ShareDialog.css';

export default function ShareDialog({ file, onClose }) {
  const [step, setStep] = useState('generate');
  const [code, setCode] = useState('');
  const [linkId, setLinkId] = useState(null);
  const [error, setError] = useState('');
  const [copyText, setCopyText] = useState('Copy Code');
  const [expiresAt, setExpiresAt] = useState('');
  const [shareType, setShareType] = useState('encrypted');

  const handleEncryptedShare = async () => {
    setError('');
    setStep('encrypting');
    try {
      const genCode = await generateCode();
      setCode(genCode);

      const response = await client.get(`/files/download/${file._serverFile._id}`, {
        responseType: 'blob',
      });
      const blob = response.data;

      setStep('encrypting');
      const encryptedFile = await encryptFile(
        new File([blob], file._serverFile.originalName, { type: file._serverFile.mimeType }),
        genCode,
      );

      setStep('uploading');
      const formData = new FormData();
      formData.append('encryptedFile', encryptedFile);
      formData.append('code', genCode);

      const { data } = await client.post(`/share/${file._serverFile._id}/encrypted`, formData);

      setLinkId(data.link._id);
      setCode(data.code);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Share failed');
      setStep('generate');
    }
  };

  const handlePublicShare = async () => {
    setError('');
    setStep('creating');
    try {
      const { data } = await client.post(`/share/${file._serverFile._id}`, {
        isPublic: true,
        expiresAt: expiresAt || null,
      });
      setCode(`${window.location.origin}/access?token=${data.link.token}`);
      setLinkId(data.link._id);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Share failed');
      setStep('generate');
    }
  };

  const handleShare = () => {
    if (shareType === 'encrypted') {
      handleEncryptedShare();
    } else {
      handlePublicShare();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy Code'), 2000);
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-header">
          <h3>Share File</h3>
          <button className="btn btn-sm btn-danger" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="share-body">
          <div className="share-file-info">
            <span className="share-file-icon">{file.icon}</span>
            <span className="share-file-name">{file.name}</span>
          </div>

          {step === 'generate' && (
            <div className="share-step">
              <div
                className="share-type-toggle"
                style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="shareType"
                    value="encrypted"
                    checked={shareType === 'encrypted'}
                    onChange={() => setShareType('encrypted')}
                  />
                  <span>🔐 Encrypted (code-protected)</span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="shareType"
                    value="public"
                    checked={shareType === 'public'}
                    onChange={() => setShareType('public')}
                  />
                  <span>🌍 Public link (no code)</span>
                </label>
              </div>

              <p>
                {shareType === 'encrypted'
                  ? 'Generate a secure access code. The file will be encrypted before sharing.'
                  : 'Create a public share link. Anyone with the link can download the file.'}
              </p>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Expiration (optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <button
                className="btn btn-primary share-action-btn"
                onClick={handleShare}
                style={{ marginTop: '1rem' }}
              >
                {shareType === 'encrypted' ? 'Generate Code & Share' : 'Create Share Link'}
              </button>
            </div>
          )}

          {(step === 'encrypting' || step === 'creating') && (
            <div className="share-step share-waiting">
              <div className="share-spinner" />
              <p>{step === 'encrypting' ? 'Encrypting file...' : 'Creating share link...'}</p>
            </div>
          )}

          {step === 'uploading' && (
            <div className="share-step share-waiting">
              <div className="share-spinner" />
              <p>Uploading encrypted file...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="share-step share-done">
              <div className="share-success-icon">✅</div>
              <p className="share-success-text">File shared successfully!</p>

              <div className="share-code-box">
                <label>{shareType === 'encrypted' ? 'Access Code' : 'Share Link'}</label>
                <div className="share-code-display">
                  <span
                    className="share-code-value"
                    style={{
                      fontSize: shareType === 'public' ? '0.8rem' : '1rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    {code}
                  </span>
                  <button className="btn btn-sm btn-primary" onClick={copyCode}>
                    {copyText}
                  </button>
                </div>
              </div>

              {shareType === 'encrypted' && (
                <p className="share-instruction">
                  Share this code with the recipient. They can access the file at:
                  <br />
                  <strong>{window.location.origin}/access</strong>
                </p>
              )}
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}
        </div>
      </div>
    </div>
  );
}
