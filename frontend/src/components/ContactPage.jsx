import { useState } from 'react'

function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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