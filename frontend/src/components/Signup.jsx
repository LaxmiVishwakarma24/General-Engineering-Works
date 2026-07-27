import { useState } from 'react'

/**
 * Signup form with a dropdown to choose between Customer and Admin.
 * Phone/company fields only apply to Customer signup.
 */
function Signup({ onSignupSuccess }) {
  const [userType, setUserType] = useState('customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    const endpoint = userType === 'admin'
      ? 'http://127.0.0.1:5000/api/admin/signup'
      : 'http://127.0.0.1:5000/api/customer/signup'

    // Build the request body — admin signup doesn't need phone/company_name
    const requestBody = userType === 'admin'
      ? { name, email, password }
      : { name, email, password, phone, company_name: companyName }

    try {
      const response = await fetch(endpoint, {
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

      setSuccessMessage('Account created successfully! You can now log in.')
      if (onSignupSuccess) onSignupSuccess()
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
          Sign up as
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Employee</option>
          </select>
        </label>

        <label>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            minLength={6}
          />
        </label>

        {/* Only show phone and company fields for Customer signup */}
        {userType === 'customer' && (
          <>
            <label>
              Phone
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>

            <label>
              Company Name (optional)
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </label>
          </>
        )}

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