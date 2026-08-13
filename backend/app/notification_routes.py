"""
notification_routes.py

Endpoints for the logged-in user (customer or admin) to view and manage
their own notifications.
"""

from flask import Blueprint, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import Notification

notification_bp = Blueprint("notification", __name__)


def serialize_notification(n):
    return {
        "id": n.id,
        "message": n.message,
        "notification_type": n.notification_type,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat(),
        "related_order_id": n.related_order_id,
        "related_quote_id": n.related_quote_id,
        "related_product_id": n.related_product_id,
    }


@notification_bp.route("/api/notifications", methods=["GET"])
@login_required
def get_notifications():
    """Return the logged-in user's notifications, most recent first (latest 20)."""
    recipient_type, recipient_id = current_user.get_id().split("-")

    notifications = (
        Notification.query
        .filter_by(recipient_type=recipient_type, recipient_id=int(recipient_id))
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )

    unread_count = Notification.query.filter_by(
        recipient_type=recipient_type, recipient_id=int(recipient_id), is_read=False
    ).count()

    return jsonify({
        "notifications": [serialize_notification(n) for n in notifications],
        "unread_count": unread_count,
    }), 200


@notification_bp.route("/api/notifications/<int:notification_id>/read", methods=["PUT"])
@login_required
def mark_notification_read(notification_id):
    """Mark one of the logged-in user's own notifications as read."""
    recipient_type, recipient_id = current_user.get_id().split("-")

    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    # Make sure this notification actually belongs to the logged-in user --
    # otherwise anyone logged in could mark anyone else's notifications as read.
    if notification.recipient_type != recipient_type or notification.recipient_id != int(recipient_id):
        return jsonify({"error": "This notification does not belong to you"}), 403

    notification.is_read = True
    db.session.commit()

    return jsonify({"message": "Marked as read"}), 200