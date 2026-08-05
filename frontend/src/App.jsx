import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import ServiceCard from './components/ServiceCard'
import CustomerLogin from './components/CustomerLogin'
import AdminLogin from './components/AdminLogin'
import Signup from './components/Signup'
import ProductsPage from './components/ProductsPage'
import CartPage from './components/CartPage'
import OrdersPage from './components/OrdersPage'
import ProfilePage from './components/ProfilePage'
import AdminProductsPage from './components/AdminProductsPage'
import AdminOrdersPage from './components/AdminOrdersPage'
import InvoicePage from './components/InvoicePage'
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

function HomePage({ apiStatus, apiMessage, services, servicesError }) {
  return (
    <>
      <Hero />

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
  )
}

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...')
  const [apiStatus, setApiStatus] = useState('checking')

  const [services, setServices] = useState([])
  const [servicesError, setServicesError] = useState(null)

  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
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
    fetch('http://localhost:5000/api/services')
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
  }

  const handleLogout = async () => {
    const endpoint = user.type === 'admin'
      ? 'http://localhost:5000/api/admin/logout'
      : 'http://localhost:5000/api/customer/logout'

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
    <BrowserRouter>
      <div className="app">
        <Navbar user={user} onLogoutClick={handleLogout} />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                apiStatus={apiStatus}
                apiMessage={apiMessage}
                services={services}
                servicesError={servicesError}
              />
            }
          />
          <Route path="/login" element={<CustomerLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/products" element={<ProductsPage user={user} />} />
          <Route path="/cart" element={<CartPage user={user} />} />
          <Route path="/orders" element={<OrdersPage user={user} />} />
          <Route path="/orders/:orderId/invoice" element={<InvoicePage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/admin/products" element={<AdminProductsPage user={user} />} />
          <Route path="/admin/orders" element={<AdminOrdersPage user={user} />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App