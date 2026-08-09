import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import ServicesPreview from './components/ServicesPreview'
import CustomerLogin from './components/CustomerLogin'
import AdminLogin from './components/AdminLogin'
import Signup from './components/Signup'
import ProductsPage from './components/ProductsPage'
import ServicesPage from './components/ServicesPage'
import MachinesPage from './components/MachinesPage'
import CartPage from './components/CartPage'
import OrdersPage from './components/OrdersPage'
import ProfilePage from './components/ProfilePage'
import AdminProductsPage from './components/AdminProductsPage'
import AdminOrdersPage from './components/AdminOrdersPage'
import AdminDashboardPage from './components/AdminDashboardPage'
import InvoicePage from './components/InvoicePage'
import QuoteRequestPage from './components/QuoteRequestPage'
import ContactPage from './components/ContactPage'
import AdminQuoteRequestsPage from './components/AdminQuoteRequestsPage'
import './App.css'

function HomePage({ apiStatus, apiMessage }) {
  return (
    <>
      <Hero />

      <ServicesPreview />

      <section className="connection-status">
        <p>
          Backend status: <strong>{apiStatus}</strong> — {apiMessage}
        </p>
      </section>
    </>
  )
}

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...')
  const [apiStatus, setApiStatus] = useState('checking')

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
            element={<HomePage apiStatus={apiStatus} apiMessage={apiMessage} />}
          />
          <Route path="/login" element={<CustomerLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/products" element={<ProductsPage user={user} />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/cart" element={<CartPage user={user} />} />
          <Route path="/orders" element={<OrdersPage user={user} />} />
          <Route path="/orders/:orderId/invoice" element={<InvoicePage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage user={user} />} />
          <Route path="/admin/products" element={<AdminProductsPage user={user} />} />
          <Route path="/admin/orders" element={<AdminOrdersPage user={user} />} />
          <Route path="/request-quote" element={<QuoteRequestPage user={user} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/quote-requests" element={<AdminQuoteRequestsPage user={user} />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App