import { useState, useEffect } from 'react'

/**
 * AdminSettingsPage lets an admin view and edit site-wide settings:
 * logo URL, business hours, and contact info. There's only ever one
 * settings row on the backend (id=1) -- this form just loads and
 * updates that single record.
 */
function AdminSettingsPage({ user }) {
  const [formData, setFormData] = useState({
    logo_url: '',
    business_hours: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/website-settings')
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          logo_url: data.logo_url || '',
          business_hours: data.business_hours || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          contact_address: data.contact_address || '',
        })
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load settings:', err)
        setIsLoading(false)
      })
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    fetch('http://localhost:5000/api/admin/website-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        setMessage('Settings saved successfully.')
        setIsSaving(false)
      })
      .catch((err) => {
        console.error('Failed to save settings:', err)
        setMessage('Something went wrong. Please try again.')
        setIsSaving(false)
      })
  }

  if (isLoading) {
    return <div className="profile-page"><p>Loading settings...</p></div>
  }

  return (
    <div className="profile-page">
      <h1>Website Settings</h1>

      <form className="profile-section auth-form" onSubmit={handleSubmit}>
        <label>
          Logo URL
          <input
            type="text"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            placeholder="https://res.cloudinary.com/..."
          />
        </label>

        <label>
          Business Hours
          <textarea
            name="business_hours"
            value={formData.business_hours}
            onChange={handleChange}
            rows={3}
            placeholder="Mon - Sat: 9:00 AM - 6:00 PM"
          />
        </label>

        <label>
          Contact Phone
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </label>

        <label>
          Contact Email
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            placeholder="info@generalengineeringworks.com"
          />
        </label>

        <label>
          Contact Address
          <textarea
            name="contact_address"
            value={formData.contact_address}
            onChange={handleChange}
            rows={2}
            placeholder="123 Industrial Area, City, State, PIN"
          />
        </label>

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>

        {message && <p className="auth-success">{message}</p>}
      </form>
    </div>
  )
}

export default AdminSettingsPage
