"""
admin_product_routes.py

Admin-only endpoints for managing the product catalog (create, update, delete).
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import Product, Category
from app.notification_helpers import check_low_stock_and_notify

admin_products_bp = Blueprint("admin_products", __name__)


def require_admin():
    """Returns an error response if the current user isn't an Admin, else None."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    return None


@admin_products_bp.route("/api/admin/products", methods=["POST"])
@login_required
def create_product():
    """Create a new product."""
    error = require_admin()
    if error:
        return error

    data = request.get_json()

    required_fields = ["name", "sku", "price", "category_id"]
    for field in required_fields:
        if data.get(field) in (None, ""):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    existing = Product.query.filter_by(sku=data["sku"]).first()
    if existing:
        return jsonify({"error": "A product with this SKU already exists"}), 409

    category = Category.query.get(data["category_id"])
    if not category:
        return jsonify({"error": "Category not found"}), 404

    product = Product(
        name=data["name"],
        description=data.get("description"),
        sku=data["sku"],
        price=data["price"],
        category_id=data["category_id"],
        image_url=data.get("image_url"),
        stock_quantity=data.get("stock_quantity", 0),
        minimum_stock=data.get("minimum_stock", 5),
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"message": "Product created successfully", "id": product.id}), 201


@admin_products_bp.route("/api/admin/products/<int:product_id>", methods=["PUT"])
@login_required
def update_product(product_id):
    """Edit an existing product."""
    error = require_admin()
    if error:
        return error

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    if "name" in data:
        product.name = data["name"]
    if "description" in data:
        product.description = data["description"]
    if "price" in data:
        product.price = data["price"]
    if "category_id" in data:
        category = Category.query.get(data["category_id"])
        if not category:
            return jsonify({"error": "Category not found"}), 404
        product.category_id = data["category_id"]
    if "image_url" in data:
        product.image_url = data["image_url"]
    if "stock_quantity" in data:
        product.stock_quantity = data["stock_quantity"]
    if "minimum_stock" in data:
        product.minimum_stock = data["minimum_stock"]

    check_low_stock_and_notify(product)

    db.session.commit()

    return jsonify({"message": "Product updated successfully"}), 200


@admin_products_bp.route("/api/admin/products/<int:product_id>", methods=["DELETE"])
@login_required
def delete_product(product_id):
    """Delete a product."""
    error = require_admin()
    if error:
        return error

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted successfully"}), 200