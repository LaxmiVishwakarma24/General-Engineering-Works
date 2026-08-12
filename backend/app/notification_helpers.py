"""
notification_helpers.py

Small reusable functions for creating in-app Notification records.
Called from order_routes.py, quote_routes.py, and admin_product_routes.py
whenever something happens that a customer or admin should be alerted to.
"""

from app import db
from app.models import Notification, Admin


def create_notification(recipient_type, recipient_id, message, notification_type,
                         related_order_id=None, related_quote_id=None, related_product_id=None):
    """
    Create a single notification for one recipient (a customer or one admin).
    Does NOT commit -- caller is expected to commit as part of its own
    transaction (so the notification is only saved if the rest of the
    update succeeds too).
    """
    notification = Notification(
        recipient_type=recipient_type,
        recipient_id=recipient_id,
        message=message,
        notification_type=notification_type,
        related_order_id=related_order_id,
        related_quote_id=related_quote_id,
        related_product_id=related_product_id,
    )
    db.session.add(notification)


def notify_all_admins(message, notification_type, related_product_id=None):
    """
    Create the same notification for every Admin account. Used for things
    like low-stock alerts, which aren't tied to one specific admin.
    Does NOT commit -- same reasoning as create_notification.
    """
    admins = Admin.query.all()
    for admin in admins:
        create_notification(
            recipient_type="admin",
            recipient_id=admin.id,
            message=message,
            notification_type=notification_type,
            related_product_id=related_product_id,
        )


def check_low_stock_and_notify(product):
    """
    Call this any time a product's stock_quantity may have changed
    (checkout reservation or admin edit). If the product is now at or
    below its minimum_stock, notify all admins. Does NOT commit.
    """
    if product.stock_quantity <= product.minimum_stock:
        notify_all_admins(
            message=f"Low stock alert: {product.name} is down to {product.stock_quantity} unit(s)",
            notification_type="low_stock",
            related_product_id=product.id,
        )