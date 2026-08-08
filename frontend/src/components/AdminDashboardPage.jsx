import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboardPage({ user }) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/admin-login')
      return
    }

    fetch('http://localhost:5000/api/admin/dashboard', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch((err) => {
        setError('Could not load dashboard stats')
        console.error(err)
      })
  }, [user])

  if (error) {
    return <div className="admin-page"><p className="error-text">{error}</p></div>
  }

  if (!stats) {
    return <div className="admin-page"><p>Loading dashboard...</p></div>
  }

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span className="dashboard-card-label">Total Customers</span>
          <span className="dashboard-card-value">{stats.total_customers}</span>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">Total Orders</span>
          <span className="dashboard-card-value">{stats.total_orders}</span>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">Pending Orders</span>
          <span className="dashboard-card-value">{stats.pending_orders}</span>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">Total Revenue</span>
          <span className="dashboard-card-value">₹{stats.total_revenue.toFixed(2)}</span>
        </div>

        <div className="dashboard-card dashboard-card-alert">
          <span className="dashboard-card-label">Low Stock Products</span>
          <span className="dashboard-card-value">{stats.low_stock_count}</span>
        </div>
      </div>

      <h2 className="dashboard-section-title">Recent Orders</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Placed On</th>
          </tr>
        </thead>
        <tbody>
          {stats.recent_orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>₹{order.total_amount.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDashboardPage