import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import ServiceCard from './components/ServiceCard'
import Login from './components/Login'
import Signup from './components/Signup'
import './App.css'

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

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...')
  const [apiStatus, setApiStatus] = useState('checking')

  const [services, setServices] = useState([])
  const [servicesError, setServicesError] = useState(null)

  // Tracks which "view" is currently shown: 'home', 'login', or 'signup'
  const [currentView, setCurrentView] = useState('home')

  // Tracks the currently logged-in user (null if nobody is logged in)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/health')
      .then((response) => response.json())
      .then((data) => {
        setApiMessage(data.message)
        setApiStatus(data.status)
      })
      .catch((error) => {
        setApiMessage('Could not connect to backend API')
        setApiStatus('error')
        console.error('Error fetching API:', error)
      })
  }, [])

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/services')
      .then((response) => response.json())
      .then((data) => {
        setServices(data)
      })
      .catch((error) => {
        setServicesError('Could not load services')
        console.error('Error fetching services:', error)
      })
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentView('home') // send them back to the homepage after logging in
  }

  const handleLogout = async () => {
    const endpoint = user.type === 'admin'
      ? 'http://127.0.0.1:5000/api/admin/logout'
      : 'http://127.0.0.1:5000/api/customer/logout'

    try {
      await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Logout error:', err)
    }

    setUser(null)
  }

  return (
    <div className="app">
      <Navbar
        user={user}
        onLoginClick={() => setCurrentView('login')}
        onSignupClick={() => setCurrentView('signup')}
        onLogoutClick={handleLogout}
      />

      {currentView === 'login' && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'signup' && (
        <Signup onSignupSuccess={() => setCurrentView('login')} />
      )}

      {currentView === 'home' && (
        <>
          <Hero />

          {/* Temporary dev-only status bar — will be removed before launch */}
          <section className="connection-status">
            <p>
              Backend status: <strong>{apiStatus}</strong> — {apiMessage}
            </p>
          </section>

          <section className="services-section">
            <h2>Our Services</h2>

            {servicesError && <p className="error-text">{servicesError}</p>}

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
          </section>
        </>
      )}

      <Footer />
    </div>
  )
}

export default App