import { useState, useEffect } from 'react'
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

function ServicesPage() {
  const [services, setServices] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then((response) => response.json())
      .then((data) => setServices(data))
      .catch((err) => {
        setError('Could not load services')
        console.error(err)
      })
  }, [])

  return (
    <div className="products-page">
      <h1 className="products-page-title">Our Services</h1>
      <p className="products-page-subtitle">Custom machining and fabrication work, quoted individually.</p>

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
    </div>
  )
}

export default ServicesPage