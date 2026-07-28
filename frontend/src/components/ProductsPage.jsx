import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err))

    fetch('http://127.0.0.1:5000/api/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        setError('Could not load products')
        console.error('Error fetching products:', err)
      })
  }, [])

  return (
    <div className="products-page">
      <h1 className="products-page-title">Product Catalog</h1>
      <p className="products-page-subtitle">Standard parts and materials, available for direct order.</p>

      {error && <p className="error-text">{error}</p>}

      {categories.map((category) => {
        // Filter products belonging to this specific category
        const categoryProducts = products.filter((p) => p.category.id === category.id)

        if (categoryProducts.length === 0) return null

        return (
          <section key={category.id} className="product-category-section">
            <h2>{category.name}</h2>
            <div className="products-grid">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default ProductsPage