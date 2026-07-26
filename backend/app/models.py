"""
models.py

Defines the database tables for General Engineering Works as Python classes.
Each class = one table. Each class attribute = one column.
SQLAlchemy uses these definitions to create and interact with the actual
PostgreSQL tables.
"""

from datetime import datetime
from app import db  # 'db' is the SQLAlchemy object we will create in __init__.py


class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True)
    phone = db.Column(db.String(20), nullable=False)
    company_name = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One customer can have many quote requests.
    # This does not create a column — it creates a convenient Python-side
    # link so we can write customer.quote_requests to get all their requests.
    quote_requests = db.relationship("QuoteRequest", backref="customer", lazy=True)


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    quote_requests = db.relationship("QuoteRequest", backref="service", lazy=True)


class Machine(db.Model):
    __tablename__ = "machines"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(300), nullable=True)
    specs = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class QuoteRequest(db.Model):
    __tablename__ = "quote_requests"

    id = db.Column(db.Integer, primary_key=True)

    # Foreign keys — these columns store the id of a row in another table,
    # linking this quote request to a specific customer and service.
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)

    details = db.Column(db.Text, nullable=True)
    attachment_url = db.Column(db.String(300), nullable=True)
    status = db.Column(db.String(50), nullable=False, default="new")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="staff")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)