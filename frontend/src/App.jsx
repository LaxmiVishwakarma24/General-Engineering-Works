import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...')
  const [apiStatus, setApiStatus] = useState('checking')

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

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>General Engineering Works</h1>
      <h2>Frontend + Backend Connection Test</h2>
      <p>
        Backend status: <strong>{apiStatus}</strong>
      </p>
      <p>
        Message from Flask API: <strong>{apiMessage}</strong>
      </p>
    </div>
  )
}

export default App