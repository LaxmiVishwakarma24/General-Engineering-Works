import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ServiceCard from './ServiceCard'

const SERVICE_ICONS = {
  'Lathe Machining': 'Disc3',
  'Drilling': 'Drill',
  'Milling': 'Grid3x3',
  'Welding': 'Flame',
  'Fabrication': 'Hammer',
  'Shaft Repair': 'Wrench',
  'Thread Cutting': 'Component',
  'Boring': 'CircleDot',
  'Grinding': 'Sparkles',
  'CNC Turning': 'Cpu',
  'Machine Repair': 'Settings',
  'Custom Components': 'Puzzle',
}

function ServicesPreview() {
  const [services, setServices] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then((response) => response.json())
      .then((data) => setServices(data.slice(0, 3))) // only show the first 3
      .catch((err) => {
        setError('Could not load services')
        console.error(err)
      })
  }, [])

  return (
    <section className="services-section">
      <h2>Our Services</h2>

      {error && <p className="error-text">{error}</p>}

      <div className="services-grid">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            name={service.name}
            description={service.description}
            iconName={SERVICE_ICONS[service.name]}
          />
        ))}
      </div>

      <div className="services-preview-footer">
        <Link to="/services" className="view-all-link">View All Services →</Link>
      </div>
    </section>
  )
}

export default ServicesPreview