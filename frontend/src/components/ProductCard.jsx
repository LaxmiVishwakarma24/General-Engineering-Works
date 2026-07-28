/**
 * ProductCard displays a single product: name, price, stock status badge, description.
 */
function ProductCard({ product }) {
  const statusLabels = {
    available: { text: 'In Stock', className: 'status-available' },
    low_stock: { text: 'Low Stock', className: 'status-low' },
    out_of_stock: { text: 'Out of Stock', className: 'status-out' },
  }

  const status = statusLabels[product.status] || statusLabels.available

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
    </div>
  )
}

export default ProductCard