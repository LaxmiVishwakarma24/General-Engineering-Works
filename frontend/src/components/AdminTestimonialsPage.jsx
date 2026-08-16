import { useState, useEffect } from 'react'

/**
 * AdminTestimonialsPage lists existing testimonials and lets the admin
 * add new ones or delete existing ones. Uses the existing admin-table
 * and modal-overlay CSS patterns already used elsewhere in the admin area.
 */
function AdminTestimonialsPage({ user }) {
  const [testimonials, setTestimonials] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    quote_text: '',
    rating: '',
  })
  const [error, setError] = useState('')

  const fetchTestimonials = () => {
    fetch('http://localhost:5000/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        setTestimonials(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load testimonials:', err)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    fetch('http://localhost:5000/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        customer_name: formData.customer_name,
        company_name: formData.company_name || null,
        quote_text: formData.quote_text,
        rating: formData.rating ? parseInt(formData.rating, 10) : null,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error || 'Could not add testimonial')
          return
        }
        setFormData({ customer_name: '', company_name: '', quote_text: '', rating: '' })
        setShowForm(false)
        fetchTestimonials()
      })
      .catch((err) => {
        console.error('Failed to add testimonial:', err)
        setError('Could not connect to the server')
      })
  }

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/admin/testimonials/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => fetchTestimonials())
      .catch((err) => console.error('Failed to delete testimonial:', err))
  }

  if (isLoading) {
    return <div className="admin-page"><p>Loading testimonials...</p></div>
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Testimonials</h1>
        <button className="admin-add-btn" onClick={() => setShowForm(true)}>
          + Add Testimonial
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Company</th>
            <th>Quote</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map((t) => (
            <tr key={t.id}>
              <td>{t.customer_name}</td>
              <td>{t.company_name || '—'}</td>
              <td className="quote-details-cell">{t.quote_text}</td>
              <td>{t.rating ? `${t.rating} / 5` : '—'}</td>
              <td>
                <button className="admin-delete-btn" onClick={() => handleDelete(t.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Testimonial</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                Customer Name
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Company Name (optional)
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                />
              </label>

              <label>
                Quote
                <textarea
                  name="quote_text"
                  value={formData.quote_text}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </label>

              <label>
                Rating (1-5, optional)
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTestimonialsPage