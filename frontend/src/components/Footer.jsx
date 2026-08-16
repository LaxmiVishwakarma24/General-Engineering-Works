import { useState, useEffect } from 'react'

/**
 * Footer displays business info and contact details at the bottom of every page.
 * Contact details are pulled live from the admin-editable Website Settings.
 */
function Footer() {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/website-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to load website settings:', err))
  }, [])

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h4>General Engineering Works</h4>
          <p>Precision machining, fabrication &amp; repair services.</p>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>Phone: {settings?.contact_phone || 'Not available'}</p>
          <p>Email: {settings?.contact_email || 'Not available'}</p>
          <p>Address: {settings?.contact_address || 'Not available'}</p>
          {settings?.business_hours && <p>Hours: {settings.business_hours}</p>}
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>Home</li>
            <li>Services</li>
            <li>Machines</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>

      <p className="footer-copyright">
        © {currentYear} General Engineering Works. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer