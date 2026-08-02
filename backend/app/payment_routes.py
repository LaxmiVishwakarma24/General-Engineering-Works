"""
payment_routes.py

Mock payment processing — simulates a payment gateway without any real
external service. No real money or real card data is ever processed here.
"""

import random
import string
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import Order, Payment, PaymentTransaction

payments_bp = Blueprint("payments", __name__)


def generate_transaction_reference():
    """Generates a fake transaction reference, similar in style to a real gateway's."""
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return f"TXN-{random_part}"


@payments_bp.route("/api/orders/<int:order_id>/pay", methods=["POST"])
@login_required
def process_payment(order_id):
    """
    Simulates processing a payment for an order.
    This is a MOCK implementation — no real card data is sent anywhere,
    no real money moves. It always succeeds, for demonstration purposes.
    """
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers can make payments"}), 403

    order = Order.query.get(order_id)
    if not order or order.customer_id != current_user.id:
        return jsonify({"error": "Order not found"}), 404

    if order.payment and order.payment.status == "Paid":
        return jsonify({"error": "This order has already been paid"}), 400

    data = request.get_json()
    payment_method = data.get("payment_method", "Card")

    # Create (or reuse) the Payment record for this order
    payment = order.payment
    if not payment:
        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            payment_method=payment_method,
        )
        db.session.add(payment)
        db.session.flush()

    # Simulate a successful payment (a real gateway integration would call
    # an external API here instead, and handle its response)
    payment.status = "Paid"
    payment.payment_method = payment_method

    transaction = PaymentTransaction(
        payment_id=payment.id,
        transaction_reference=generate_transaction_reference(),
        status="success",
    )
    db.session.add(transaction)

    db.session.commit()

    return jsonify({
        "message": "Payment successful",
        "payment": {
            "id": payment.id,
            "status": payment.status,
            "amount": float(payment.amount),
            "transaction_reference": transaction.transaction_reference,
        }
    }), 200


@payments_bp.route("/api/orders/<int:order_id>/payment", methods=["GET"])
@login_required
def get_payment_status(order_id):
    """Returns the payment status for a given order."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Only customers can view this"}), 403

    order = Order.query.get(order_id)
    if not order or order.customer_id != current_user.id:
        return jsonify({"error": "Order not found"}), 404

    if not order.payment:
        return jsonify({"status": "Pending", "amount": float(order.total_amount)}), 200

    return jsonify({
        "status": order.payment.status,
        "amount": float(order.payment.amount),
        "payment_method": order.payment.payment_method,
    }), 200