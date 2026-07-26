import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load variables from the .env file (like DATABASE_URL) into the environment
load_dotenv()


# Create the SQLAlchemy object here, at module level, so other files
# (like models.py) can import it with "from app import db"
db = SQLAlchemy()


def create_app():
    """
    Application factory: builds and configures the Flask app.
    """
    app = Flask(__name__)
    CORS(app)

    # Tell Flask-SQLAlchemy which database to connect to
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Connect the db object to this specific Flask app
    db.init_app(app)

    from app.routes import main
    app.register_blueprint(main)

    # Import models here so SQLAlchemy knows about all our tables
    # (this import must happen after db.init_app, and is placed inside
    # create_app to avoid circular import errors)
    from app import models

    return app