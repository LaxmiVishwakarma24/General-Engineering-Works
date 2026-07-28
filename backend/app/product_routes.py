"""
product_routes.py

API endpoints for browsing the product catalog (categories and products).
"""

from flask import Blueprint, jsonify
from app.models import Category, Product

products_bp = Blueprint("products", __name__)


@products_bp.route("/api/categories")
def get_categories():
    """Return all product categories as JSON."""
    categories = Category.query.all()

    categories_list = [
        {"id": c.id, "name": c.name, "description": c.description}
        for c in categories
    ]

    return jsonify(categories_list)


@products_bp.route("/api/products")
def get_products():
    """Return all products as JSON, including their calculated stock status."""
    products = Product.query.all()

    products_list = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "sku": p.sku,
            "price": float(p.price),  # Convert from Decimal to float for JSON
            "image_url": p.image_url,
            "stock_quantity": p.stock_quantity,
            "status": p.status,  # uses our @property, calculated fresh each time
            "category": {"id": p.category.id, "name": p.category.name},
        }
        for p in products
    ]

    return jsonify(products_list)