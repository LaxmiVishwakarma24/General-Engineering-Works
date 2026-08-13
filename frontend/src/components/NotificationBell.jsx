import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'

/**
 * NotificationBell shows a bell icon with an unread-count badge.
 * Clicking it opens a dropdown listing the user's recent notifications.
 * Works for both customers and admins -- the backend already scopes
 * results to whoever is logged in.
 */
function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = () => {
    fetch('http://localhost:5000/api/notifications', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      })
      .catch((err) => console.error('Failed to load notifications:', err))
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 30 seconds so new notifications show up without a manual reload.
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close the dropdown if the user clicks anywhere outside it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = (notificationId) => {
    fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      credentials: 'include',
    })
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      })
      .catch((err) => console.error('Failed to mark notification as read:', err))
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">Notifications</div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet</div>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item ${n.is_read ? 'read' : 'unread'}`}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                >
                  <p className="notification-message">{n.message}</p>
                  <span className="notification-time">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell