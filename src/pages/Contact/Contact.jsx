import { useState } from 'react'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({})
    setSent(false)
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.subject.trim()) errs.subject = 'Subject is required'
    if (!form.message.trim()) errs.message = 'Message is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="contact-page page">
      <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>Contact Us</h2>
      <p className="section-subtitle" style={{ marginBottom: '2rem' }}>Have a question? Send us a message.</p>

      <div className="contact-container card">
        {sent && <div className="success-msg">Message sent successfully! We will get back to you soon.</div>}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            {errors.subject && <span className="error-msg">{errors.subject}</span>}
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea placeholder="Write your message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            {errors.message && <span className="error-msg">{errors.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary contact-submit">Send Message</button>
        </form>
      </div>
    </div>
  )
}
