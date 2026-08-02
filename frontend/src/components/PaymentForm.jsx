import { useState } from 'react'

/**
 * PaymentForm is a MOCK payment popup — no real card or UPI processing happens here.
 * It simulates the visual flow of a payment gateway for demonstration purposes.
 */
function PaymentForm({ order, onPaid, onCancel }) {
  const [method, setMethod] = useState('card') // 'card' or 'upi'
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const submitPayment = async (paymentMethodLabel) => {
    setError('')
    setProcessing(true)

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${order.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_method: paymentMethodLabel }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Payment failed')
        setProcessing(false)
        return
      }

      onPaid()
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Payment error:', err)
      setProcessing(false)
    }
  }

  const handleCardSubmit = (event) => {
    event.preventDefault()
    submitPayment('Card')
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Pay for Order #{order.id}</h2>
        <p className="payment-amount">Amount: ₹{order.total_amount.toFixed(2)}</p>
        <p className="payment-mock-notice">This is a demo payment form — no real card or UPI details are processed.</p>

        {/* Payment method tabs */}
        <div className="payment-method-tabs">
          <button
            type="button"
            className={`payment-tab ${method === 'card' ? 'payment-tab-active' : ''}`}
            onClick={() => setMethod('card')}
          >
            Card
          </button>
          <button
            type="button"
            className={`payment-tab ${method === 'upi' ? 'payment-tab-active' : ''}`}
            onClick={() => setMethod('upi')}
          >
            UPI / GPay
          </button>
        </div>

        {method === 'card' && (
          <form onSubmit={handleCardSubmit} className="auth-form">
            <label>
              Card Number
              <input
                type="text"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                required
              />
            </label>

            <label>
              Expiry (MM/YY)
              <input
                type="text"
                placeholder="12/28"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={5}
                required
              />
            </label>

            <label>
              CVV
              <input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={3}
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" onClick={onCancel} className="modal-cancel-btn">Cancel</button>
              <button type="submit" disabled={processing}>
                {processing ? 'Processing...' : `Pay ₹${order.total_amount.toFixed(2)}`}
              </button>
            </div>
          </form>
        )}

        {method === 'upi' && (
          <div className="upi-payment-section">
            <div className="upi-qr-placeholder">
              <svg viewBox="0 0 200 200" width="180" height="180">
                <rect width="200" height="200" fill="#ffffff" />
                {/* A simple pattern that visually resembles a QR code — not a real scannable code */}
                {Array.from({ length: 10 }).map((_, row) =>
                  Array.from({ length: 10 }).map((_, col) => {
                    const seed = (row * 10 + col + order.id) % 3
                    return seed === 0 ? (
                      <rect
                        key={`${row}-${col}`}
                        x={row * 20}
                        y={col * 20}
                        width="18"
                        height="18"
                        fill="#1e2a38"
                      />
                    ) : null
                  })
                )}
              </svg>
            </div>
            <p className="upi-scan-text">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
            <p className="upi-vpa">demo@generalengineeringworks</p>

            {error && <p className="auth-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" onClick={onCancel} className="modal-cancel-btn">Cancel</button>
              <button
                type="button"
                onClick={() => submitPayment('UPI')}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Simulate UPI Payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentForm