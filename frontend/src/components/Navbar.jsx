import { Link } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'
import NotificationBell from './NotificationBell'

/**
 * Navbar displays the site logo/name and navigation links.
 * Note: intentionally NO link to /admin-login — that page is private/unlisted.
 * When logged in, Cart/Orders/Logout live inside the ProfileMenu dropdown
 * instead of cluttering the main navbar.
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
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/machines">Machines</Link></li>
        <li><Link to="/testimonials">Testimonials</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <div className="navbar-right">
        {user ? (
          <div className="navbar-right-logged-in">
            <NotificationBell />
            <ProfileMenu user={user} onLogoutClick={onLogoutClick} />
          </div>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/login" className="navbar-action">Login</Link>
            <Link to="/signup" className="navbar-action">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar