"""
cart_routes.py

API endpoints for managing a customer's shopping cart.
All routes require the customer to be logged in.
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import Cart, CartItem, Product

cart_bp = Blueprint("cart", __name__)


def get_or_create_cart():
    """
    Returns the current customer's cart, creating one if it doesn't exist yet.
    Assumes current_user is a logged-in Customer (checked by the route itself).
    """
    cart = Cart.query.filter_by(customer_id=current_user.id).first()
    if not cart:
        cart = Cart(customer_id=current_user.id)
        db.session.add(cart)
        db.session.commit()
    return cart


def serialize_cart(cart):
    """Converts a Cart object (with its items) into a JSON-friendly dictionary."""
    items = []
    total = 0

    for item in cart.items:
        subtotal = float(item.product.price) * item.quantity
        total += subtotal

        items.append({
            "item_id": item.id,
            "product_id": item.product.id,
            "name": item.product.name,
            "price": float(item.product.price),
            "quantity": item.quantity,
            "subtotal": subtotal,
            "stock_quantity": item.product.stock_quantity,
        })

    return {"cart_id": cart.id, "items": items, "total": total}


@cart_bp.route("/api/cart", methods=["GET"])
@login_required
def view_cart():
    """Return the logged-in customer's cart."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers have a cart"}), 403

    cart = get_or_create_cart()
    return jsonify(serialize_cart(cart)), 200


@cart_bp.route("/api/cart/add", methods=["POST"])
@login_required
def add_to_cart():
    """Add a product to the cart, or increase its quantity if already present."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers can add to a cart"}), 403

    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not product_id or quantity < 1:
        return jsonify({"error": "A valid product_id and quantity are required"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    cart = get_or_create_cart()

    existing_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    if existing_item:
        existing_item.quantity += quantity
    else:
        existing_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.session.add(existing_item)

    db.session.commit()

    return jsonify(serialize_cart(cart)), 200


@cart_bp.route("/api/cart/update/<int:item_id>", methods=["PUT"])
@login_required
def update_cart_item(item_id):
    """Change the quantity of a specific cart item."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers can modify a cart"}), 403

    data = request.get_json()
    quantity = data.get("quantity")

    if not quantity or quantity < 1:
        return jsonify({"error": "A valid quantity is required"}), 400

    item = CartItem.query.get(item_id)

    # Security check: make sure this cart item actually belongs to the
    # currently logged-in customer's cart, not someone else's.
    if not item or item.cart.customer_id != current_user.id:
        return jsonify({"error": "Cart item not found"}), 404

    item.quantity = quantity
    db.session.commit()

    return jsonify(serialize_cart(item.cart)), 200


@cart_bp.route("/api/cart/remove/<int:item_id>", methods=["DELETE"])
@login_required
def remove_cart_item(item_id):
    """Remove an item from the cart entirely."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers can modify a cart"}), 403

    item = CartItem.query.get(item_id)

    if not item or item.cart.customer_id != current_user.id:
        return jsonify({"error": "Cart item not found"}), 404

    cart = item.cart
    db.session.delete(item)
    db.session.commit()

    return jsonify(serialize_cart(cart)), 200