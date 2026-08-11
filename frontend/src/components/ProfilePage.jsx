import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfilePage({ user }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      navigate('/login')
      return
    }

    fetch('http://localhost:5000/api/customer/profile', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setName(data.name)
        setEmail(data.email)
        setPhone(data.phone)
        setCompanyName(data.company_name || '')
      })
      .catch((err) => console.error('Error fetching profile:', err))
  }, [user])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileMessage('')
    setSavingProfile(true)

    try {
      const response = await fetch('http://localhost:5000/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, phone, company_name: companyName }),
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileError(data.error || 'Could not update profile')
      } else {
        setProfileMessage('Profile updated successfully!')
      }
    } catch (err) {
      setProfileError('Could not connect to the server')
      console.error('Profile update error:', err)
    }

    setSavingProfile(false)
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <section className="profile-section">
        <h2>Profile Information</h2>
        <form onSubmit={handleProfileSubmit} className="auth-form">
          <label>
            Full Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>
            Email (cannot be changed)
            <input type="email" value={email} disabled />
          </label>

          <label>
            Phone
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>

          <label>
            Company Name (optional)
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </label>

          {profileError && <p className="auth-error">{profileError}</p>}
          {profileMessage && <p className="auth-success">{profileMessage}</p>}

          <button type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ProfilePage