"""
order_routes.py

API endpoints for placing and viewing orders.
"""

from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user

from app import db
from app.models import Cart, Order, OrderItem

orders_bp = Blueprint("orders", __name__)


def serialize_order(order):
    """Converts an Order object (with its items) into a JSON-friendly dictionary."""
    items = [
        {
            "product_id": item.product_id,
            "name": item.product.name,
            "quantity": item.quantity,
            "price_at_purchase": float(item.price_at_purchase),
            "subtotal": float(item.price_at_purchase) * item.quantity,
        }
        for item in order.items
    ]

    return {
        "id": order.id,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "created_at": order.created_at.isoformat(),
        "cancel_deadline": order.cancel_deadline.isoformat(),
        "can_cancel": order.can_cancel,
        "delay_reason": order.delay_reason,
        "expected_delivery_date": order.expected_delivery_date.isoformat() if order.expected_delivery_date else None,
        "items": items,
    }


@orders_bp.route("/api/orders/checkout", methods=["POST"])
@login_required
def checkout():
    """Convert the logged-in customer's cart into a real order."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers can place orders"}), 403

    cart = Cart.query.filter_by(customer_id=current_user.id).first()

    if not cart or len(cart.items) == 0:
        return jsonify({"error": "Your cart is empty"}), 400

    any_out_of_stock = any(item.product.stock_quantity == 0 for item in cart.items)
    initial_status = "Waiting for Stock" if any_out_of_stock else "Pending"

    total_amount = sum(item.product.price * item.quantity for item in cart.items)

    new_order = Order(
        customer_id=current_user.id,
        status=initial_status,
        total_amount=total_amount,
        cancel_deadline=datetime.utcnow() + timedelta(hours=24),
    )
    db.session.add(new_order)
    db.session.flush()

    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price_at_purchase=cart_item.product.price,
        )
        db.session.add(order_item)

    for cart_item in cart.items:
        db.session.delete(cart_item)

    db.session.commit()

    return jsonify(serialize_order(new_order)), 201


@orders_bp.route("/api/orders", methods=["GET"])
@login_required
def list_orders():
    """Return all orders belonging to the logged-in customer, most recent first."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers have orders"}), 403

    orders = Order.query.filter_by(customer_id=current_user.id).order_by(Order.created_at.desc()).all()

    return jsonify([serialize_order(o) for o in orders]), 200


@orders_bp.route("/api/orders/<int:order_id>/cancel", methods=["POST"])
@login_required
def cancel_order(order_id):
    """Cancel an order, only if it belongs to the customer and is still within the 24-hour window."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers can cancel orders"}), 403

    order = Order.query.get(order_id)

    if not order or order.customer_id != current_user.id:
        return jsonify({"error": "Order not found"}), 404

    if not order.can_cancel:
        return jsonify({"error": "This order can no longer be cancelled (past the 24-hour window)"}), 400

    order.status = "Cancelled"
    db.session.commit()

    return jsonify(serialize_order(order)), 200


VALID_STATUSES = [
    "Pending", "Confirmed", "Waiting for Stock", "In Production",
    "Quality Check", "Ready for Dispatch", "Dispatched", "Delivered", "Cancelled"
]


@orders_bp.route("/api/admin/orders", methods=["GET"])
@login_required
def admin_list_orders():
    """Admin: view all orders from every customer, most recent first."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        order_data = serialize_order(order)
        order_data["customer_name"] = order.customer.name
        order_data["customer_email"] = order.customer.email
        result.append(order_data)

    return jsonify(result), 200


@orders_bp.route("/api/admin/orders/<int:order_id>/status", methods=["PUT"])
@login_required
def admin_update_order_status(order_id):
    """Admin: update an order's status, and optionally set delay info."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"}), 400

    order.status = new_status

    if "delay_reason" in data:
        order.delay_reason = data["delay_reason"]
    if "expected_delivery_date" in data:
        order.expected_delivery_date = datetime.fromisoformat(data["expected_delivery_date"]) if data["expected_delivery_date"] else None

    db.session.commit()

    return jsonify(serialize_order(order)), 200