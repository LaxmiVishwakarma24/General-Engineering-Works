"""
quote_routes.py

Customer-facing endpoint for submitting a quote request, optionally with
an attachment (drawing/blueprint) uploaded via /api/customer/upload-attachment.

Also includes admin-only endpoints for viewing and updating quote requests,
and a customer endpoint for re-uploading a revised drawing when the admin
has requested changes.
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import QuoteRequest, Service
from app.notification_helpers import create_notification

quote_bp = Blueprint("quote", __name__)


def serialize_quote_request(qr):
    """Converts a QuoteRequest object into a JSON-friendly dictionary."""
    return {
        "id": qr.id,
        "service_id": qr.service_id,
        "service_name": qr.service.name,
        "details": qr.details,
        "attachment_url": qr.attachment_url,
        "status": qr.status,
        "admin_notes": qr.admin_notes,
        "created_at": qr.created_at.isoformat(),
    }


@quote_bp.route("/api/quote-requests", methods=["POST"])
@login_required
def create_quote_request():
    """Customer-only: submit a new quote request."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Customer access required"}), 403

    data = request.get_json()

    if not data.get("service_id"):
        return jsonify({"error": "Missing required field: service_id"}), 400

    service = Service.query.get(data["service_id"])
    if not service:
        return jsonify({"error": "Service not found"}), 404

    quote_request = QuoteRequest(
        customer_id=current_user.id,
        service_id=data["service_id"],
        details=data.get("details"),
        attachment_url=data.get("attachment_url"),
    )

    db.session.add(quote_request)
    db.session.commit()

    return jsonify({
        "message": "Quote request submitted successfully",
        "id": quote_request.id,
    }), 201


@quote_bp.route("/api/quote-requests/mine", methods=["GET"])
@login_required
def list_my_quote_requests():
    """Customer-only: view all of the logged-in customer's own quote requests."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Customer access required"}), 403

    quote_requests = (
        QuoteRequest.query
        .filter_by(customer_id=current_user.id)
        .order_by(QuoteRequest.created_at.desc())
        .all()
    )

    return jsonify([serialize_quote_request(qr) for qr in quote_requests]), 200


@quote_bp.route("/api/quote-requests/<int:quote_request_id>", methods=["GET"])
@login_required
def get_quote_request(quote_request_id):
    """Customer-only: view one of their own quote requests, including admin notes."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Customer access required"}), 403

    quote_request = QuoteRequest.query.get(quote_request_id)

    if not quote_request or quote_request.customer_id != current_user.id:
        return jsonify({"error": "Quote request not found"}), 404

    return jsonify(serialize_quote_request(quote_request)), 200


@quote_bp.route("/api/quote-requests/<int:quote_request_id>/attachment", methods=["PUT"])
@login_required
def update_quote_request_attachment(quote_request_id):
    """
    Customer-only: re-upload a revised drawing/attachment on their own quote
    request, and move status back to "new" so the admin knows to review it
    again. Only allowed while status is "changes_requested".
    """
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Customer access required"}), 403

    quote_request = QuoteRequest.query.get(quote_request_id)

    if not quote_request or quote_request.customer_id != current_user.id:
        return jsonify({"error": "Quote request not found"}), 404

    if quote_request.status != "changes_requested":
        return jsonify({"error": "You can only re-upload when changes have been requested"}), 400

    data = request.get_json()
    if not data.get("attachment_url"):
        return jsonify({"error": "attachment_url is required"}), 400

    quote_request.attachment_url = data["attachment_url"]
    quote_request.status = "new"

    db.session.commit()

    return jsonify(serialize_quote_request(quote_request)), 200


VALID_QUOTE_STATUSES = ["new", "reviewed", "quoted", "approved", "changes_requested", "rejected", "closed"]


@quote_bp.route("/api/admin/quote-requests", methods=["GET"])
@login_required
def admin_list_quote_requests():
    """Admin: view all quote requests from every customer, most recent first."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    quote_requests = QuoteRequest.query.order_by(QuoteRequest.created_at.desc()).all()

    result = []
    for qr in quote_requests:
        qr_data = serialize_quote_request(qr)
        qr_data["customer_name"] = qr.customer.name
        qr_data["customer_email"] = qr.customer.email
        result.append(qr_data)

    return jsonify(result), 200


@quote_bp.route("/api/admin/quote-requests/<int:quote_request_id>/status", methods=["PUT"])
@login_required
def admin_update_quote_request_status(quote_request_id):
    """Admin: update a quote request's status, optionally with review notes."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    quote_request = QuoteRequest.query.get(quote_request_id)
    if not quote_request:
        return jsonify({"error": "Quote request not found"}), 404

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in VALID_QUOTE_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(VALID_QUOTE_STATUSES)}"}), 400

    quote_request.status = new_status

    if "admin_notes" in data:
        quote_request.admin_notes = data["admin_notes"]

    create_notification(
        recipient_type="customer",
        recipient_id=quote_request.customer_id,
        message=f"Your quote request for {quote_request.service.name} is now {new_status}",
        notification_type="quote_status",
        related_quote_id=quote_request.id,
    )

    db.session.commit()

    return jsonify(serialize_quote_request(quote_request)), 200