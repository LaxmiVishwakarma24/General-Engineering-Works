import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductForm from './ProductForm'

function AdminProductsPage({ user }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const navigate = useNavigate()

  const loadProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        setError('Could not load products')
        console.error(err)
      })
  }

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/admin-login')
      return
    }

    loadProducts()

    fetch('http://localhost:5000/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err))
  }, [user])

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        loadProducts()
      } else {
        const data = await response.json()
        alert(data.error || 'Could not delete product')
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const openAddForm = () => {
    console.log('DEBUG - Add Product button clicked')
    setEditingProduct(null)
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleFormSaved = () => {
    closeForm()
    loadProducts()
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Products</h1>
        <button className="admin-add-btn" onClick={openAddForm}>+ Add Product</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.category.name}</td>
              <td>₹{product.price.toFixed(2)}</td>
              <td>{product.stock_quantity}</td>
              <td>
                <span className={`status-badge status-${product.status.replace(/_/g, '-')}`}>
                  {product.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td>
                <button className="admin-edit-btn" onClick={() => openEditForm(product)}>Edit</button>
                <button className="admin-delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <>
          
               <ProductForm
            product={editingProduct}
            categories={categories}
            onSaved={handleFormSaved}
            onCancel={closeForm}
          />
        </>
      )}
    </div>
  )
}

export default AdminProductsPage