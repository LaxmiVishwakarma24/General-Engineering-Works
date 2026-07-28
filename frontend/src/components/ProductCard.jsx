import { useState } from 'react'

/**
 * ProductCard displays a single product: name, price, stock status badge, description,
 * and an Add to Cart button (disabled if out of stock).
 */
function ProductCard({ product, onAddToCart }) {
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  const statusLabels = {
    available: { text: 'In Stock', className: 'status-available' },
    low_stock: { text: 'Low Stock', className: 'status-low' },
    out_of_stock: { text: 'Out of Stock', className: 'status-out' },
  }

  const status = statusLabels[product.status] || statusLabels.available
  const isOutOfStock = product.status === 'out_of_stock'

  const handleAddToCart = async () => {
    setAdding(true)
    setMessage('')

    const result = await onAddToCart(product.id)

    if (result.success) {
      setMessage('Added!')
    } else {
      setMessage(result.error || 'Could not add to cart')
    }

    setAdding(false)
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="product-card">
      <div className="product-card-header">
        <h3 className="product-card-title">{product.name}</h3>
        <span className={`status-badge ${status.className}`}>{status.text}</span>
      </div>

      <p className="product-card-description">{product.description}</p>

      <div className="product-card-footer">
        <span className="product-card-sku">SKU: {product.sku}</span>
        <span className="product-card-price">₹{product.price.toFixed(2)}</span>
      </div>

      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={isOutOfStock || adding}
      >
        {isOutOfStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
      </button>

      {message && <p className="add-to-cart-message">{message}</p>}
    </div>
  )
}

export default ProductCard