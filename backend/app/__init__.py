from flask import Flask
from flask_cors import CORS

def create_app():
    """
    Application factory: builds and configures the Flask app.
    """
    app = Flask(__name__)
    CORS(app)

    from app.routes import main
    app.register_blueprint(main)

    return app