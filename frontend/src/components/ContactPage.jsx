import { useState, useEffect } from 'react'

function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/website-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to load website settings:', err))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Could not send your message')
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Contact form submit error:', err)
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="products-page">
        <h1 className="products-page-title">Message Sent</h1>
        <p className="products-page-subtitle">
          Thanks for reaching out — we'll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <div className="products-page">
      <h1 className="products-page-title">Contact Us</h1>
      <p className="products-page-subtitle">
        Have a question or need to reach us? Send a message below.
      </p>

      {settings && (settings.contact_phone || settings.contact_email || settings.contact_address || settings.business_hours) && (
        <div className="profile-section" style={{ maxWidth: 500, margin: '0 auto 2rem auto' }}>
          {settings.contact_phone && <p><strong>Phone:</strong> {settings.contact_phone}</p>}
          {settings.contact_email && <p><strong>Email:</strong> {settings.contact_email}</p>}
          {settings.contact_address && <p><strong>Address:</strong> {settings.contact_address}</p>}
          {settings.business_hours && <p><strong>Hours:</strong> {settings.business_hours}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

export default ContactPage