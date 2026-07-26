/**
 * Hero is the large banner section at the top of the homepage,
 * introducing the business with a headline, tagline, and call-to-action button.
 */
function Hero() {
  return (
    <section className="hero">
      <h1 className="hero-title">Precision Engineering. Reliable Results.</h1>
      <p className="hero-subtitle">
        CNC machining, welding, fabrication, and repair services for industrial clients.
      </p>
      <button className="hero-cta">Request a Quote</button>
    </section>
  )
}

export default Hero