import { useState } from 'react'

function DelayForm({ order, onSaved, onCancel }) {
  const [delayReason, setDelayReason] = useState(order.delay_reason || '')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    order.expected_delivery_date ? order.expected_delivery_date.slice(0, 10) : ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    const requestBody = {
      status: order.status,
      delay_reason: delayReason,
      expected_delivery_date: expectedDeliveryDate || null,
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Could not save delay info')
        setSaving(false)
        return
      }

      onSaved()
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Delay form submit error:', err)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Set Delay — Order #{order.id}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Delay Reason
            <textarea
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              rows={3}
              placeholder="e.g. Waiting on a raw material delivery"
            />
          </label>

          <label>
            Expected Delivery Date
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="modal-cancel-btn">Cancel</button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Delay Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DelayForm