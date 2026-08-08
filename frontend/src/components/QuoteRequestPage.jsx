import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function QuoteRequestPage({ user }) {
  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [details, setDetails] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      navigate('/login')
      return
    }

    fetch('http://localhost:5000/api/services')
      .then((response) => response.json())
      .then((data) => setServices(data))
      .catch((err) => {
        setError('Could not load services')
        console.error(err)
      })
  }, [user])

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/api/customer/upload-attachment', {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // Note: no Content-Type header here — the browser sets it automatically
        // for FormData, including the required "boundary" value.
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Attachment upload failed')
        setUploading(false)
        return
      }

      setAttachmentUrl(data.url)
    } catch (err) {
      setError('Could not upload attachment')
      console.error('Attachment upload error:', err)
    }

    setUploading(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const requestBody = {
      service_id: parseInt(serviceId),
      details,
      attachment_url: attachmentUrl,
    }

    try {
      const response = await fetch('http://localhost:5000/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Could not submit quote request')
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Quote request submit error:', err)
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="products-page">
        <h1 className="products-page-title">Request Submitted</h1>
        <p className="products-page-subtitle">
          Thanks — we've received your quote request and will get back to you shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="products-page">
      <h1 className="products-page-title">Request a Quote</h1>
      <p className="products-page-subtitle">
        Tell us about the job and, if you have one, attach a drawing or blueprint.
      </p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </label>

        <label>
          Details
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            placeholder="Describe what you need — quantities, materials, tolerances, deadlines, etc."
          />
        </label>

        <label>
          Attachment (drawing or blueprint — PDF, DWG, DXF, PNG, or JPG)
          <input
            type="file"
            accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {uploading && <p className="upload-status">Uploading attachment...</p>}

        {attachmentUrl && (
          <p className="upload-status">Attachment uploaded successfully.</p>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={submitting || uploading}>
          {submitting ? 'Submitting...' : 'Submit Quote Request'}
        </button>
      </form>
    </div>
  )
}

export default QuoteRequestPage