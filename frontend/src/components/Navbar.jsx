/**
 * Navbar displays the site logo/name and navigation links.
 * Links are placeholders for now — real page navigation (React Router)
 * will be added in a future session.
 */
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">General Engineering Works</div>
      <ul className="navbar-links">
        <li>Home</li>
        <li>Services</li>
        <li>Machines</li>
        <li>Contact</li>
      </ul>
    </nav>
  )
}

export default Navbar