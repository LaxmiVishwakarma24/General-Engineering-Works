import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function OrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadOrders = () => {
    fetch('http://localhost:5000/api/orders', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Could not load orders')
        console.error('Error fetching orders:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      navigate('/login')
      return
    }
    loadOrders()
  }, [user])

  const handleCancel = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        loadOrders() // refresh the list to show the updated status
      } else {
        const data = await response.json()
        alert(data.error || 'Could not cancel order')
      }
    } catch (err) {
      console.error('Cancel order error:', err)
    }
  }

  if (loading) {
    return <div className="orders-page"><p>Loading orders...</p></div>
  }

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>

      {error && <p className="error-text">{error}</p>}

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet. <a href="/products">Browse products</a></p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <h3>Order #{order.id}</h3>
                <span className={`order-status order-status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.status}
                </span>
              </div>

              <p className="order-date">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>

              <ul className="order-items-list">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} × {item.quantity} — ₹{item.subtotal.toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="order-total">Total: ₹{order.total_amount.toFixed(2)}</div>

              {order.delay_reason && (
                <p className="order-delay-notice">
                  ⚠️ Delayed: {order.delay_reason}
                  {order.expected_delivery_date && (
                    <> Expected: {new Date(order.expected_delivery_date).toLocaleDateString()}</>
                  )}
                </p>
              )}

              {order.can_cancel && order.status !== 'Cancelled' && (
                <button className="order-cancel-btn" onClick={() => handleCancel(order.id)}>
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage