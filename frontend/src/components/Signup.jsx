import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Customer signup form. Public page — Admin accounts are never created here.
 */
function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    const requestBody = { name, email, password, phone, company_name: companyName }

    try {
      const response = await fetch('http://localhost:5000/api/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      setSuccessMessage('Account created successfully! Redirecting to login...')

      // Give the user a moment to see the success message, then redirect to login
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Signup error:', err)
    }

    setLoading(false)
  }

  return (
    <div className="auth-form-container">
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Full Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        <label>
          Phone
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>

        <label>
          Company Name (optional)
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {successMessage && <p className="auth-success">{successMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}

export default Signup