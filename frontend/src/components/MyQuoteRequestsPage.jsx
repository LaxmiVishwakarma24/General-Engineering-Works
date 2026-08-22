import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * MyQuoteRequestsPage lets a customer see all their submitted quote
 * requests, the admin's review status and notes, and re-upload a
 * revised drawing when the admin has requested changes.
 */
function MyQuoteRequestsPage({ user }) {
  const [quoteRequests, setQuoteRequests] = useState([])
  const [error, setError] = useState('')
  const [uploadingId, setUploadingId] = useState(null)
  const navigate = useNavigate()

  const loadQuoteRequests = () => {
    fetch('http://localhost:5000/api/quote-requests/mine', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setQuoteRequests(data))
      .catch((err) => {
        setError('Could not load your quote requests')
        console.error(err)
      })
  }

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      navigate('/login')
      return
    }
    loadQuoteRequests()
  }, [user])

  const handleReupload = async (quoteRequestId, file) => {
    if (!file) return

    setUploadingId(quoteRequestId)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadResponse = await fetch('http://localhost:5000/api/customer/upload-attachment', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        setError(uploadData.error || 'Upload failed')
        setUploadingId(null)
        return
      }

      const updateResponse = await fetch(
        `http://localhost:5000/api/quote-requests/${quoteRequestId}/attachment`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ attachment_url: uploadData.url }),
        }
      )

      if (!updateResponse.ok) {
        const updateData = await updateResponse.json()
        setError(updateData.error || 'Could not save the revised drawing')
        setUploadingId(null)
        return
      }

      loadQuoteRequests()
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Re-upload error:', err)
    }

    setUploadingId(null)
  }

  return (
    <div className="orders-page">
      <h1>My Quote Requests</h1>

      {error && <p className="error-text">{error}</p>}

      {quoteRequests.length === 0 ? (
        <p>You haven't submitted any quote requests yet.</p>
      ) : (
        <div className="orders-list">
          {quoteRequests.map((qr) => (
            <div key={qr.id} className="order-card">
              <div className="order-card-header">
                <h3>{qr.service_name}</h3>
                <span className={`order-status order-status-${qr.status.replace(/_/g, '-')}`}>
                  {qr.status.replace('_', ' ')}
                </span>
              </div>

              <p className="order-date">Submitted {new Date(qr.created_at).toLocaleDateString()}</p>

              {qr.details && <p>{qr.details}</p>}

              {qr.attachment_url && (
                <p>
                  <a href={qr.attachment_url} target="_blank" rel="noopener noreferrer">
                    View current attachment
                  </a>
                </p>
              )}

              {qr.admin_notes && (
                <div className="order-delay-notice">
                  <strong>Note from us:</strong> {qr.admin_notes}
                </div>
              )}

              {qr.status === 'changes_requested' && (
                <div>
                  <label>
                    Upload a revised drawing
                    <input
                      type="file"
                      accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                      onChange={(e) => handleReupload(qr.id, e.target.files[0])}
                      disabled={uploadingId === qr.id}
                    />
                  </label>
                  {uploadingId === qr.id && <p className="upload-status">Uploading...</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyQuoteRequestsPage