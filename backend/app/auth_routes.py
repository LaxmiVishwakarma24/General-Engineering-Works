"""
auth_routes.py

Handles signup and login for Customers and Admins.
Uses Werkzeug for password hashing and Flask-Login for session management.
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user

from app import db
from app.models import Customer, Admin

auth = Blueprint("auth", __name__)


# ---------- Customer Auth ----------

@auth.route("/api/customer/signup", methods=["POST"])
def customer_signup():
    """Create a new customer account."""
    data = request.get_json()

    required_fields = ["name", "email", "password", "phone"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    existing = Customer.query.filter_by(email=data["email"]).first()
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed_password = generate_password_hash(data["password"])

    new_customer = Customer(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_password,
        phone=data["phone"],
        company_name=data.get("company_name"),
    )

    db.session.add(new_customer)
    db.session.commit()

    return jsonify({"message": "Customer account created successfully"}), 201


@auth.route("/api/customer/login", methods=["POST"])
def customer_login():
    """Log in an existing customer."""
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    customer = Customer.query.filter_by(email=email).first()

    if not customer or not check_password_hash(customer.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    login_user(customer)

    return jsonify({
        "message": "Login successful",
        "user": {"id": customer.id, "name": customer.name, "email": customer.email, "type": "customer"}
    }), 200


@auth.route("/api/customer/logout", methods=["POST"])
@login_required
def customer_logout():
    """Log out the currently logged-in customer."""
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


# ---------- Admin Auth ----------

@auth.route("/api/admin/signup", methods=["POST"])
def admin_signup():
    """Create a new admin account."""
    data = request.get_json()

    required_fields = ["name", "email", "password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    existing = Admin.query.filter_by(email=data["email"]).first()
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed_password = generate_password_hash(data["password"])

    new_admin = Admin(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_password,
    )

    db.session.add(new_admin)
    db.session.commit()

    return jsonify({"message": "Admin account created successfully"}), 201


@auth.route("/api/admin/login", methods=["POST"])
def admin_login():
    """Log in an existing admin."""
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    admin = Admin.query.filter_by(email=email).first()

    if not admin or not check_password_hash(admin.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    login_user(admin)

    return jsonify({
        "message": "Login successful",
        "user": {"id": admin.id, "name": admin.name, "email": admin.email, "type": "admin"}
    }), 200


@auth.route("/api/admin/logout", methods=["POST"])
@login_required
def admin_logout():
    """Log out the currently logged-in admin."""
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200