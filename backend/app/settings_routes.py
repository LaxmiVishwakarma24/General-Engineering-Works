"""
settings_routes.py

Public endpoint for reading site-wide settings (logo, business hours,
contact info), and an admin-only endpoint for editing them. There is
only ever one row in website_settings (id=1) -- this is a single-business
site, not a multi-tenant platform.
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import WebsiteSettings

settings_bp = Blueprint("settings", __name__)


def serialize_settings(s):
    return {
        "logo_url": s.logo_url,
        "business_hours": s.business_hours,
        "contact_phone": s.contact_phone,
        "contact_email": s.contact_email,
        "contact_address": s.contact_address,
    }


@settings_bp.route("/api/website-settings", methods=["GET"])
def get_settings():
    """Public: anyone visiting the site can read the current settings."""
    settings = WebsiteSettings.query.get(1)

    if not settings:
        # Shouldn't normally happen since we seeded row id=1, but handle it
        # gracefully rather than erroring out the whole site if it's missing.
        return jsonify({
            "logo_url": None,
            "business_hours": None,
            "contact_phone": None,
            "contact_email": None,
            "contact_address": None,
        }), 200

    return jsonify(serialize_settings(settings)), 200


@settings_bp.route("/api/admin/website-settings", methods=["PUT"])
@login_required
def update_settings():
    """Admin-only: edit the site's settings."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    settings = WebsiteSettings.query.get(1)
    if not settings:
        return jsonify({"error": "Settings row not found"}), 404

    data = request.get_json()

    if "logo_url" in data:
        settings.logo_url = data["logo_url"]
    if "business_hours" in data:
        settings.business_hours = data["business_hours"]
    if "contact_phone" in data:
        settings.contact_phone = data["contact_phone"]
    if "contact_email" in data:
        settings.contact_email = data["contact_email"]
    if "contact_address" in data:
        settings.contact_address = data["contact_address"]

    db.session.commit()

    return jsonify(serialize_settings(settings)), 200