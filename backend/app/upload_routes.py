"""
upload_routes.py

Handles file uploads to Cloudinary (product images, and later quote attachments).
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