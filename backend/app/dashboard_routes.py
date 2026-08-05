"""
dashboard_routes.py

Admin-only endpoint providing summary statistics for the dashboard.
"""

from flask import Blueprint, jsonify
from flask_login import login_required, current_user

from app.models import Customer, Order, Product, Payment

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/admin/dashboard", methods=["GET"])
@login_required
def get_dashboard_stats():
    """Return summary statistics for the Admin dashboard."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    total_customers = Customer.query.count()
    total_orders = Order.query.count()

    pending_orders = Order.query.filter(
        Order.status.notin_(["Delivered", "Cancelled"])
    ).count()

    total_revenue = sum(
        float(p.amount) for p in Payment.query.filter_by(status="Paid").all()
    )

    all_products = Product.query.all()
    low_stock_count = sum(1 for p in all_products if p.status in ("low_stock", "out_of_stock"))

    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    recent_orders_data = [
        {
            "id": o.id,
            "customer_name": o.customer.name,
            "total_amount": float(o.total_amount),
            "status": o.status,
            "created_at": o.created_at.isoformat(),
        }
        for o in recent_orders
    ]

    return jsonify({
        "total_customers": total_customers,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue,
        "low_stock_count": low_stock_count,
        "recent_orders": recent_orders_data,
    }), 200