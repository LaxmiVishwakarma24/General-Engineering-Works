import { useState, useEffect } from 'react'

/**
 * TestimonialsSection displays customer testimonials as a row of cards.
 * Used on the homepage (limited to a few) and on the dedicated /testimonials
 * page (showing all of them), controlled by the `limit` prop.
 */
function TestimonialsSection({ limit }) {
  const [testimonials, setTestimonials] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  if (isLoading || testimonials.length === 0) {
    return null
  }

  const shown = limit ? testimonials.slice(0, limit) : testimonials

  return (
    <section className="testimonials-section">
      <h2>What Our Customers Say</h2>

      <div className="testimonials-grid">
        {shown.map((t) => (
          <div key={t.id} className="testimonial-card">
            {t.rating && (
              <div className="testimonial-rating">
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
            )}
            <p className="testimonial-quote">"{t.quote_text}"</p>
            <p className="testimonial-author">
              {t.customer_name}
              {t.company_name && <span className="testimonial-company"> — {t.company_name}</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection