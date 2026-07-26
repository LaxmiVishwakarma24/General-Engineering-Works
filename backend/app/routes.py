from flask import Blueprint, jsonify
from app.models import Service

main = Blueprint('main', __name__)


@main.route('/api/health')
def health_check():
    """Simple endpoint to confirm the API is running."""
    return jsonify({"status": "ok", "message": "General Engineering Works API is running"})


@main.route('/api/services')
def get_services():
    """Return all services from the database as JSON."""
    services = Service.query.all()

    # Convert each Service object into a plain dictionary,
    # since jsonify() can't directly serialize SQLAlchemy model objects.
    services_list = [
        {
            "id": service.id,
            "name": service.name,
            "description": service.description,
        }
        for service in services
    ]

    return jsonify(services_list)