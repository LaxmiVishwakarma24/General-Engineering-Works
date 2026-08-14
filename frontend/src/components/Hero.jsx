import { useNavigate } from 'react-router-dom'

/**
 * Hero is the large banner section at the top of the homepage,
 * introducing the business with a headline, tagline, and call-to-action button.
 */
function Hero() {
  const navigate = useNavigate()

  return (
    <section
      className="hero"
      style={{
        backgroundImage:
          'linear-gradient(rgba(30, 42, 56, 0.75), rgba(30, 42, 56, 0.75)), url(https://res.cloudinary.com/qilyv0ww/image/upload/v1786718715/lisk-obe-_VBsh_IKsD8-unsplash.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="hero-title">Precision Engineering. Reliable Results.</h1>
      <p className="hero-subtitle">
        CNC machining, welding, fabrication, and repair services for industrial clients.
      </p>
      <button className="hero-cta" onClick={() => navigate('/request-quote')}>
        Request a Quote
      </button>
    </section>
  )
}

export default Hero