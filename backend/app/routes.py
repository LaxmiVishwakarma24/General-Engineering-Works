from flask import Blueprint, jsonify

main = Blueprint('main', __name__)

@main.route('/api/health')
def health_check():
    """Simple endpoint to confirm the API is running."""
    return jsonify({"status": "ok", "message": "General Engineering Works API is running"})