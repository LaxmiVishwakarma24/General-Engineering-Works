import { useState, useEffect } from 'react'

function ProductForm({ product, categories, onSaved, onCancel }) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [minimumStock, setMinimumStock] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(product)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setSku(product.sku)
      setDescription(product.description || '')
      setPrice(product.price)
      setCategoryId(product.category.id)
      setStockQuantity(product.stock_quantity)
      setMinimumStock(5)
    }
  }, [product])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    const requestBody = {
      name,
      sku,
      description,
      price: parseFloat(price),
      category_id: parseInt(categoryId),
      stock_quantity: parseInt(stockQuantity),
      minimum_stock: parseInt(minimumStock),
    }

    const url = isEditing
      ? `http://localhost:5000/api/admin/products/${product.id}`
      : 'http://localhost:5000/api/admin/products'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Could not save product')
        setSaving(false)
        return
      }

      onSaved()
    } catch (err) {
      setError('Could not connect to the server')
      console.error('Save product error:', err)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEditing ? 'Edit Product' : 'Add Product'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>
            SKU
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </label>

          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>

          <label>
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>

          <label>
            Price (₹)
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>

          <label>
            Stock Quantity
            <input type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required />
          </label>

          <label>
            Minimum Stock (for low-stock alerts)
            <input type="number" min="0" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} required />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="modal-cancel-btn">Cancel</button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm