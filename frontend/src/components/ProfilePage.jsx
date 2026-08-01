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

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setChangingPassword(true)

    try {
      const response = await fetch('http://localhost:5000/api/customer/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || 'Could not change password')
      } else {
        setPasswordMessage('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setPasswordError('Could not connect to the server')
      console.error('Password change error:', err)
    }

    setChangingPassword(false)
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

      <section className="profile-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="auth-form">
          <label>
            Current Password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <label>
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {passwordError && <p className="auth-error">{passwordError}</p>}
          {passwordMessage && <p className="auth-success">{passwordMessage}</p>}

          <button type="submit" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ProfilePage