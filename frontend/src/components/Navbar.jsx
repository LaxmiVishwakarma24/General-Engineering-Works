import { Link } from 'react-router-dom'

/**
 * Navbar displays the site logo/name and navigation links.
 * Home/Services/Machines/Contact are still placeholders (real routing for
 * those specific pages comes later — only Login/Signup/Home are wired up now).
 * Note: intentionally NO link to /admin-login — that page is private/unlisted.
 */
function Navbar({ user, onLogoutClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="navbar-logo-link">General Engineering Works</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li>Services</li>
        <li>Machines</li>
        <li>Contact</li>

        {user ? (
          <>
            <li className="navbar-welcome">Welcome, {user.name}</li>
            <li onClick={onLogoutClick} className="navbar-action">Logout</li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="navbar-action">Login</Link></li>
            <li><Link to="/signup" className="navbar-action">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar