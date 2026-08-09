import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DelayForm from './DelayForm'

const VALID_STATUSES = [
  "Pending", "Confirmed", "Waiting for Stock", "In Production",
  "Quality Check", "Ready for Dispatch", "Dispatched", "Delivered", "Cancelled"
]

function AdminOrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [delayOrder, setDelayOrder] = useState(null)
  const navigate = useNavigate()

  const loadOrders = () => {
    fetch('http://localhost:5000/api/admin/orders', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((err) => {
        setError('Could not load orders')
        console.error(err)
      })
  }

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/admin-login')
      return
    }
    loadOrders()
  }, [user])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        loadOrders()
      } else {
        const data = await response.json()
        alert(data.error || 'Could not update order status')
      }
    } catch (err) {
      console.error('Status update error:', err)
    }
  }

  const handleDelaySaved = () => {
    setDelayOrder(null)
    loadOrders()
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Orders</h1>
      </div>

      {error && <p className="error-text">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Placed On</th>
            <th>Status</th>
            <th>Delay Info</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>
                {order.customer_name}
                <br />
                <span className="admin-order-email">{order.customer_email}</span>
              </td>
              <td>
                {order.items.map((item, idx) => (
                  <div key={idx}>{item.name} × {item.quantity}</div>
                ))}
              </td>
              <td>₹{order.total_amount.toFixed(2)}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="admin-status-select"
                >
                  {VALID_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td>
                {order.delay_reason && (
                  <div className="admin-order-email">{order.delay_reason}</div>
                )}
                {order.expected_delivery_date && (
                  <div className="admin-order-email">
                    Expected: {new Date(order.expected_delivery_date).toLocaleDateString()}
                  </div>
                )}
                <button
                  type="button"
                  className="admin-edit-btn"
                  onClick={() => setDelayOrder(order)}
                >
                  {order.delay_reason || order.expected_delivery_date ? 'Edit Delay' : 'Set Delay'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {delayOrder && (
        <DelayForm
          order={delayOrder}
          onSaved={handleDelaySaved}
          onCancel={() => setDelayOrder(null)}
        />
      )}
    </div>
  )
}

export default AdminOrdersPage