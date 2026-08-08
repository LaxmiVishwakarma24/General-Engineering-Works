"""
quote_routes.py

Customer-facing endpoint for submitting a quote request, optionally with
an attachment (drawing/blueprint) uploaded via /api/customer/upload-attachment.
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import QuoteRequest, Service

quote_bp = Blueprint("quote", __name__)


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