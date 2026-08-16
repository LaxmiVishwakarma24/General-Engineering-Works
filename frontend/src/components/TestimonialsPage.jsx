import TestimonialsSection from './TestimonialsSection'

/**
 * TestimonialsPage is the dedicated /testimonials page, showing every
 * testimonial (no limit) using the same TestimonialsSection component
 * as the homepage.
 */
function TestimonialsPage() {
  return (
    <div className="products-page">
      <h1 className="products-page-title">Customer Testimonials</h1>
      <p className="products-page-subtitle">
        See what our customers have to say about working with us.
      </p>

      <TestimonialsSection />
    </div>
  )
}

export default TestimonialsPage