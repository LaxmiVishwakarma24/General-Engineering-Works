import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'

function MachinesPage() {
  const [machines, setMachines] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/machines')
      .then((response) => response.json())
      .then((data) => setMachines(data))
      .catch((err) => {
        setError('Could not load machines')
        console.error(err)
      })
  }, [])

  return (
    <div className="products-page">
      <h1 className="products-page-title">Our Machines</h1>
      <p className="products-page-subtitle">Equipment and machinery used in our workshop.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="machines-grid">
        {machines.map((machine) => (
          <div key={machine.id} className="machine-card">
            <div className="machine-card-icon">
              <Settings size={36} strokeWidth={1.5} />
            </div>
            <h3 className="machine-card-title">{machine.name}</h3>
            <p className="machine-card-description">{machine.description}</p>
            {machine.specs && (
              <p className="machine-card-specs"><strong>Specs:</strong> {machine.specs}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MachinesPage