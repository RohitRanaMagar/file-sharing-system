import { useState } from 'react'
import './FAQ.css'

const faqData = [
  { q: 'What is EasyShare?', a: 'EasyShare is a college project file sharing platform built with React. It allows users to upload, manage, and share files securely.' },
  { q: 'Is EasyShare free to use?', a: 'Yes, EasyShare is completely free as it is a college project for educational purposes.' },
  { q: 'What file types are supported?', a: 'EasyShare supports all common file types including documents (PDF, DOCX), images (JPG, PNG), videos (MP4), and more.' },
  { q: 'Is there a file size limit?', a: 'For this project demo, files up to 2GB are supported. This is simulated as there is no backend.' },
  { q: 'Can I share files with others?', a: 'Yes, you can share files via download links. This feature is simulated in the demo.' },
  { q: 'How do I delete a file?', a: 'Go to My Files, find the file you want to delete, and click the Delete button.' },
  { q: 'Is my data secure?', a: 'All data is stored locally in your browser using localStorage. No data is sent to any server.' },
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
