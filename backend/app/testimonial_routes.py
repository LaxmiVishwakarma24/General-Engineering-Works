"""
testimonial_routes.py

Public endpoint for displaying testimonials, and admin-only endpoints
for adding/removing them.
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import Testimonial

testimonial_bp = Blueprint("testimonial", __name__)


@testimonial_bp.route("/api/testimonials", methods=["GET"])
def get_testimonials():
    """Public: return all testimonials, most recent first."""
    testimonials = Testimonial.query.order_by(Testimonial.created_at.desc()).all()

    result = [
        {
            "id": t.id,
            "customer_name": t.customer_name,
            "company_name": t.company_name,
            "quote_text": t.quote_text,
            "rating": t.rating,
        }
        for t in testimonials
    ]

    return jsonify(result), 200


@testimonial_bp.route("/api/admin/testimonials", methods=["POST"])
@login_required
def create_testimonial():
    """Admin-only: add a new testimonial."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()

    if not data.get("customer_name") or not data.get("quote_text"):
        return jsonify({"error": "customer_name and quote_text are required"}), 400

    testimonial = Testimonial(
        customer_name=data["customer_name"],
        company_name=data.get("company_name"),
        quote_text=data["quote_text"],
        rating=data.get("rating"),
    )

    db.session.add(testimonial)
    db.session.commit()

    return jsonify({"message": "Testimonial added successfully", "id": testimonial.id}), 201


@testimonial_bp.route("/api/admin/testimonials/<int:testimonial_id>", methods=["DELETE"])
@login_required
def delete_testimonial(testimonial_id):
    """Admin-only: delete a testimonial."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    testimonial = Testimonial.query.get(testimonial_id)
    if not testimonial:
        return jsonify({"error": "Testimonial not found"}), 404

    db.session.delete(testimonial)
    db.session.commit()

    return jsonify({"message": "Testimonial deleted successfully"}), 200