import { useState } from 'react'
import './FAQ.css'

const faqData = [
  { q: 'What is EasyShare?', a: 'EasyShare is a file sharing platform built with React and Node.js. It allows users to upload, manage, organize in folders, and share files securely with end-to-end encryption.' },
  { q: 'Is EasyShare free to use?', a: 'Yes, EasyShare is completely free as it is a college project for educational purposes.' },
  { q: 'What file types are supported?', a: 'EasyShare supports all common file types including documents (PDF, DOCX), images (JPG, PNG), videos (MP4), and more.' },
  { q: 'Is there a file size limit?', a: 'Files up to 500MB are supported. The backend stores files on the server disk and metadata in MongoDB.' },
  { q: 'How do I share files with others?', a: 'Go to My Files, click the Share button on any file. A unique access code is generated. The file is encrypted in your browser and uploaded securely. Share the code with the recipient — they enter it on the Access page to decrypt and download the file.' },
  { q: 'Is my data secure?', a: 'Yes. When sharing, files are encrypted with AES-256-GCM in your browser before upload. The server never sees the encryption key or the plaintext file. Only someone with the access code can decrypt and view the file.' },
  { q: 'How do I organize files?', a: 'You can create folders and upload files into them. Use the "New Folder" button on the My Files page to get started.' },
  { q: 'How do I delete a file?', a: 'Go to My Files, find the file you want to delete, and click the Delete button.' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <div className="faq-page page">
      <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>Frequently Asked Questions</h2>
      <p className="section-subtitle" style={{ marginBottom: '2rem' }}>Find answers to common questions.</p>

      <div className="faq-list">
        {faqData.map((item, i) => (
          <div className={'faq-item card ' + (openIndex === i ? 'open' : '')} key={i}>
            <button className="faq-question" onClick={() => toggle(i)}>
              <span>{item.q}</span>
              <span className={'faq-arrow ' + (openIndex === i ? 'rotated' : '')}>▼</span>
            </button>
            <div className="faq-answer" style={{
              maxHeight: openIndex === i ? '300px' : '0',
              opacity: openIndex === i ? 1 : 0,
            }}>
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
