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


@auth.route("/api/customer/signup", methods=["POST"])
def customer_signup():
    """Create a new customer account."""
    data = request.get_json()

    # Basic validation — make sure required fields were actually sent
    required_fields = ["name", "email", "password", "phone"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Check if a customer with this email already exists
    existing = Customer.query.filter_by(email=data["email"]).first()
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    # Hash the password — NEVER store the real password
    hashed_password = generate_password_hash(data["password"])

    new_customer = Customer(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_password,
        phone=data["phone"],
        company_name=data.get("company_name"),  # optional field
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

    # check_password_hash compares the submitted password against the stored hash.
    # We check "customer exists AND password matches" in one step, on purpose —
    # this avoids revealing whether the email exists at all if login fails.
    if not customer or not check_password_hash(customer.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    login_user(customer)  # Starts the session, sets the login cookie

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