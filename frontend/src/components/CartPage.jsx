import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function CartPage({ user }) {
  const [cart, setCart] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      navigate('/login')
      return
    }

    fetch('http://localhost:5000/api/cart', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setCart(data))
      .catch((err) => {
        setError('Could not load cart')
        console.error('Error fetching cart:', err)
      })
  }, [user])

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      const response = await fetch(`http://localhost:5000/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      })

      const data = await response.json()
      if (response.ok) setCart(data)
    } catch (err) {
      console.error('Update quantity error:', err)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()
      if (response.ok) setCart(data)
    } catch (err) {
      console.error('Remove item error:', err)
    }
  }

  if (!cart) {
    return <div className="cart-page"><p>Loading cart...</p></div>
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {error && <p className="error-text">{error}</p>}

      {cart.items.length === 0 ? (
        <p>Your cart is empty. <a href="/products">Browse products</a></p>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.item_id} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>₹{item.price.toFixed(2)} each</p>
                </div>

                <div className="cart-item-quantity">
                  <button onClick={() => handleUpdateQuantity(item.item_id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.item_id, item.quantity + 1)}>+</button>
                </div>

                <div className="cart-item-subtotal">₹{item.subtotal.toFixed(2)}</div>

                <button className="cart-item-remove" onClick={() => handleRemoveItem(item.item_id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <strong>Total: ₹{cart.total.toFixed(2)}</strong>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage