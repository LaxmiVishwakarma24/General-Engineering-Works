import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminCustomersPage({ user }) {
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/admin-login')
      return
    }

    fetch('http://localhost:5000/api/admin/customers', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((err) => {
        setError('Could not load customers')
        console.error(err)
      })
  }, [user])

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Customers</h1>
      </div>

      {error && <p className="error-text">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Joined</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>{customer.company_name || '—'}</td>
              <td>{new Date(customer.created_at).toLocaleDateString()}</td>
              <td>{customer.order_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminCustomersPage