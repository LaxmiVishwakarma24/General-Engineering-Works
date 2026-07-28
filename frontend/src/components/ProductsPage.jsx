import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from './ProductCard'

function ProductsPage({ user }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err))

    fetch('http://localhost:5000/api/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        setError('Could not load products')
        console.error('Error fetching products:', err)
      })
  }, [])

  const handleAddToCart = async (productId) => {
    if (!user || user.type !== 'customer') {
      navigate('/login')
      return { success: false, error: 'Please log in as a customer first' }
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Could not add to cart' }
      }

      return { success: true }
    } catch (err) {
      console.error('Add to cart error:', err)
      return { success: false, error: 'Could not connect to the server' }
    }
  }

  return (
    <div className="products-page">
      <h1 className="products-page-title">Product Catalog</h1>
      <p className="products-page-subtitle">Standard parts and materials, available for direct order.</p>

      {error && <p className="error-text">{error}</p>}

      {categories.map((category) => {
        const categoryProducts = products.filter((p) => p.category.id === category.id)

        if (categoryProducts.length === 0) return null

        return (
          <section key={category.id} className="product-category-section">
            <h2>{category.name}</h2>
            <div className="products-grid">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default ProductsPage