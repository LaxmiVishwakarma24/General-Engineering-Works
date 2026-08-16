import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * ProfileMenu shows a single account icon that expands into a dropdown.
 * Shows different links depending on whether the logged-in user is a
 * Customer (My Profile, Cart, My Orders) or an Admin (Dashboard, Manage Products, Manage Orders, Quote Requests).
 */
function ProfileMenu({ user, onLogoutClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

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

          {user.type === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <Link to="/admin/products" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Manage Products
              </Link>
              <Link to="/admin/orders" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Manage Orders
              </Link>
              <Link to="/admin/quote-requests" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Quote Requests
              </Link>
              <Link to="/admin/customers" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Customers
              </Link>
              <Link to="/admin/settings" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Settings
              </Link>
              <Link to="/admin/testimonials" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                Testimonials
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