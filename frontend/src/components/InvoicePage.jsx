import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function InvoicePage({ user }) {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      navigate('/login')
      return
    }

    fetch('http://localhost:5000/api/orders', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((orders) => {
        const found = orders.find((o) => o.id === parseInt(orderId))
        if (!found) {
          setError('Order not found')
          return
        }
        setOrder(found)
      })
      .catch((err) => {
        setError('Could not load order')
        console.error(err)
      })

    fetch(`http://localhost:5000/api/orders/${orderId}/payment`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setPayment(data))
      .catch((err) => console.error(err))
  }, [user, orderId])

  if (error) {
    return <div className="invoice-page"><p className="error-text">{error}</p></div>
  }

  if (!order) {
    return <div className="invoice-page"><p>Loading invoice...</p></div>
  }

  return (
    <div className="invoice-page">
      <div className="invoice-card">
        <div className="invoice-success-icon">✓</div>
        <h1>Payment Successful</h1>
        <p className="invoice-subtitle">Thank you for your order!</p>

        <div className="invoice-details">
          <div className="invoice-row">
            <span>Order Number</span>
            <span>#{order.id}</span>
          </div>
          <div className="invoice-row">
            <span>Date</span>
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="invoice-row">
            <span>Payment Method</span>
            <span>{payment?.payment_method || '—'}</span>
          </div>
          <div className="invoice-row">
            <span>Payment Status</span>
            <span className="invoice-status-paid">{payment?.status || 'Pending'}</span>
          </div>
        </div>

        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price_at_purchase.toFixed(2)}</td>
                <td>₹{item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-total-row">
          <span>Total Paid</span>
          <span>₹{order.total_amount.toFixed(2)}</span>
        </div>

        <a href={`http://localhost:5000/api/orders/${order.id}/invoice/pdf`} className="invoice-download-btn" target="_blank" rel="noopener noreferrer">
          Download PDF Invoice
        </a>

        <button className="invoice-continue-btn" onClick={() => navigate('/orders')}>
          Continue to My Orders
        </button>
      </div>
    </div>
  )
}

export default InvoicePage