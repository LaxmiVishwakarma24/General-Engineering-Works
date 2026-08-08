"""
contact_routes.py

Public endpoint for the Contact page — no login required, so anyone
visiting the site (with or without an account) can send a message.
"""

from flask import Blueprint, request, jsonify

from app import db
from app.models import ContactMessage

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/api/contact", methods=["POST"])
def create_contact_message():
    """Submit a new contact message. Public — no login required."""
    data = request.get_json()

    required_fields = ["name", "email", "message"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    contact_message = ContactMessage(
        name=data["name"],
        email=data["email"],
        message=data["message"],
    )

    db.session.add(contact_message)
    db.session.commit()

    return jsonify({"message": "Your message has been sent successfully"}), 201