"""
upload_routes.py

Handles file uploads to Cloudinary (product images, and quote attachments).
"""

import cloudinary.uploader
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/api/admin/upload-image", methods=["POST"])
@login_required
def upload_image():
    """Admin-only: upload a product image to Cloudinary, return its public URL."""
    if current_user.get_id().split("-")[0] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        # Upload the file to Cloudinary, in a dedicated folder to keep things organized
        result = cloudinary.uploader.upload(file, folder="general_engineering_works/products")
        return jsonify({"url": result["secure_url"]}), 200
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@upload_bp.route("/api/customer/upload-attachment", methods=["POST"])
@login_required
def upload_attachment():
    """Customer-only: upload a quote request attachment (drawing/blueprint) to Cloudinary,
    return its public URL. Accepts PDF, DWG, DXF, PNG, JPG — resource_type is set to
    'auto' so Cloudinary can store non-image files (PDF/DWG/DXF) as well as images."""
    if current_user.get_id().split("-")[0] != "customer":
        return jsonify({"error": "Customer access required"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        # Separate folder from product images, and resource_type="auto" so Cloudinary
        # accepts non-image files like PDF/DWG/DXF, not just PNG/JPG.
        result = cloudinary.uploader.upload(
            file,
            folder="general_engineering_works/quote_attachments",
            resource_type="auto",
        )
        return jsonify({"url": result["secure_url"]}), 200
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500