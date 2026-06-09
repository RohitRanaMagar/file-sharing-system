import { useState } from 'react'
import client from '../../api/client'
import { generateCode, encryptFile } from '../../utils/crypto'
import './ShareDialog.css'

export default function ShareDialog({ file, onClose }) {
  const [step, setStep] = useState('generate')
  const [code, setCode] = useState('')
  const [linkId, setLinkId] = useState(null)
  const [error, setError] = useState('')
  const [copyText, setCopyText] = useState('Copy Code')

  const handleShare = async () => {
    setError('')
    setStep('encrypting')
    try {
      const genCode = await generateCode()
      setCode(genCode)

      const response = await client.get(`/files/download/${file._serverFile._id}`, { responseType: 'blob' })
      const blob = response.data

      setStep('encrypting')
      const encryptedFile = await encryptFile(
        new File([blob], file._serverFile.originalName, { type: file._serverFile.mimeType }),
        genCode
      )

      setStep('uploading')
      const formData = new FormData()
      formData.append('encryptedFile', encryptedFile)
      formData.append('code', genCode)

      const { data } = await client.post(`/share/${file._serverFile._id}/encrypted`, formData)

      setLinkId(data.link._id)
      setCode(data.code)
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Share failed')
      setStep('generate')
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopyText('Copied!')
    setTimeout(() => setCopyText('Copy Code'), 2000)
  }

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-header">
          <h3>Share File</h3>
          <button className="btn btn-sm btn-danger" onClick={onClose}>✕</button>
        </div>

        <div className="share-body">
          <div className="share-file-info">
            <span className="share-file-icon">{file.icon}</span>
            <span className="share-file-name">{file.name}</span>
          </div>

          {step === 'generate' && (
            <div className="share-step">
              <p>Generate a secure access code for this file. The file will be <strong>encrypted</strong> with this code before sharing.</p>
              <button className="btn btn-primary share-action-btn" onClick={handleShare}>
                Generate Code & Share
              </button>
            </div>
          )}

          {step === 'encrypting' && (
            <div className="share-step share-waiting">
              <div className="share-spinner" />
              <p>Encrypting file...</p>
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
              <p className="share-success-text">File encrypted & shared!</p>

              <div className="share-code-box">
                <label>Access Code</label>
                <div className="share-code-display">
                  <span className="share-code-value">{code}</span>
                  <button className="btn btn-sm btn-primary" onClick={copyCode}>
                    {copyText}
                  </button>
                </div>
              </div>

              <p className="share-instruction">
                Share this code with the recipient. They can access the file at:<br />
                <strong>{window.location.origin}/access</strong>
              </p>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}
        </div>
      </div>
    </div>
  )
}
