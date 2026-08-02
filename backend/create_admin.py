"""
create_admin.py

One-time script to create the single Admin account for General Engineering Works.
This is NOT exposed through the public website — run manually, once, by the business owner.

Usage:
    python create_admin.py
"""

from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import Admin


def create_admin_account():
    existing_admin = Admin.query.first()
    if existing_admin:
        print(f"An admin account already exists: {existing_admin.email}")
        print("Only one Admin account is allowed. Exiting without changes.")
        return

    name = input("Enter Admin name: ")
    email = input("Enter Admin email: ")
    password = input("Enter Admin password: ")

    hashed_password = generate_password_hash(password)

    admin = Admin(name=name, email=email, password_hash=hashed_password)
    db.session.add(admin)
    db.session.commit()

    print(f"\nAdmin account created successfully for {email}.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        create_admin_account()