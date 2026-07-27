/**
 * Navbar displays the site logo/name and navigation links.
 * Home/Services/Machines/Contact are still placeholders (real routing comes later).
 * Login/Signup/Logout are now functional, controlled by props from App.jsx.
 */
function Navbar({ user, onLoginClick, onSignupClick, onLogoutClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">General Engineering Works</div>
      <ul className="navbar-links">
        <li>Home</li>
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
            <li onClick={onLoginClick} className="navbar-action">Login</li>
            <li onClick={onSignupClick} className="navbar-action">Sign Up</li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar