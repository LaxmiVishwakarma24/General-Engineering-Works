import { useState } from 'react'

/**
 * Login form with a dropdown to choose between Customer and Admin.
 * Calls the appropriate backend endpoint based on the selected type.
 */
function Login({ onLoginSuccess }) {
  const [userType, setUserType] = useState('customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = userType === 'admin'
      ? 'http://127.0.0.1:5000/api/admin/login'
      : 'http://127.0.0.1:5000/api/customer/login'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      onLoginSuccess(data.user)
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Login error:', err)
    }

    setLoading(false)
  }

  return (
    <div className="auth-form-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Login as
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Employee</option>
          </select>
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login