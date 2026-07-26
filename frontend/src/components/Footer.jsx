/**
 * Footer displays business info and contact details at the bottom of every page.
 * Contact details below are placeholders — update with real info when available.
 */
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h4>General Engineering Works</h4>
          <p>Precision machining, fabrication &amp; repair services.</p>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>Phone: (placeholder)</p>
          <p>Email: (placeholder)</p>
          <p>Address: (placeholder)</p>
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