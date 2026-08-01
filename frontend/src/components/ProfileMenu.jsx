import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * ProfileMenu shows a single account icon that expands into a dropdown
 * containing My Profile, Cart, My Orders, and Logout.
 */
function ProfileMenu({ user, onLogoutClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the dropdown if the user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="profile-menu" ref={menuRef}>
      <button className="profile-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        {user.name.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="profile-menu-dropdown">
          <p className="profile-menu-name">Welcome, {user.name}</p>

          {user.type === 'customer' && (
            <>
              <Link to="/profile" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                My Profile
              </Link>
              <Link to="/cart" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Cart
              </Link>
              <Link to="/orders" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                My Orders
              </Link>
            </>
          )}

          <button
            className="profile-menu-item profile-menu-logout"
            onClick={() => {
              setIsOpen(false)
              onLogoutClick()
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu