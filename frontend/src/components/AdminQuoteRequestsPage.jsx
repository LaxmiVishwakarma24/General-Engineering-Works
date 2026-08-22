import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_OPTIONS = ['new', 'reviewed', 'quoted', 'approved', 'changes_requested', 'rejected', 'closed']

function AdminQuoteRequestsPage({ user }) {
  const [quoteRequests, setQuoteRequests] = useState([])
  const [error, setError] = useState('')
  const [notesDraft, setNotesDraft] = useState({})
  const navigate = useNavigate()

  const loadQuoteRequests = () => {
    fetch('http://localhost:5000/api/admin/quote-requests', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setQuoteRequests(data))
      .catch((err) => {
        setError('Could not load quote requests')
        console.error(err)
      })
  }

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/admin-login')
      return
    }
    loadQuoteRequests()
  }, [user])

  const handleStatusChange = async (quoteRequestId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/quote-requests/${quoteRequestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notesDraft[quoteRequestId] ?? undefined,
        }),
      })

      if (response.ok) {
        loadQuoteRequests()
      } else {
        const data = await response.json()
        alert(data.error || 'Could not update status')
      }
    } catch (err) {
      console.error('Status update error:', err)
    }
  }

  const handleNotesChange = (quoteRequestId, value) => {
    setNotesDraft({ ...notesDraft, [quoteRequestId]: value })
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quote Requests</h1>
      </div>

      {error && <p className="error-text">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Details</th>
            <th>Attachment</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Notes to customer</th>
          </tr>
        </thead>
        <tbody>
          {quoteRequests.map((qr) => (
            <tr key={qr.id}>
              <td>
                {qr.customer_name}
                <br />
                <span className="admin-order-email">{qr.customer_email}</span>
              </td>
              <td>{qr.service_name}</td>
              <td className="quote-details-cell">{qr.details || '—'}</td>
              <td>
                {qr.attachment_url ? (
                  <a href={qr.attachment_url} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>{new Date(qr.created_at).toLocaleDateString()}</td>
              <td>
                <select
                  value={qr.status}
                  onChange={(e) => handleStatusChange(qr.id, e.target.value)}
                  className="admin-status-select"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </td>
              <td className="quote-details-cell">
                <textarea
                  rows={2}
                  placeholder="Notes for the customer (optional)"
                  defaultValue={qr.admin_notes || ''}
                  onChange={(e) => handleNotesChange(qr.id, e.target.value)}
                  style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.85rem' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminQuoteRequestsPage