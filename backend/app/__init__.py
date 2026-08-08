import os

import cloudinary
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from dotenv import load_dotenv

# Load variables from the .env file (like DATABASE_URL, SECRET_KEY) into the environment
load_dotenv()

# Create the SQLAlchemy object here, at module level, so other files
# (like models.py) can import it with "from app import db"
db = SQLAlchemy()

# Create the Flask-Login manager here too, for the same reason
login_manager = LoginManager()

# Configure Cloudinary once, at module load time, using credentials from .env
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True,
)


def create_app():
    """
    Application factory: builds and configures the Flask app.
    """
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    # Tell Flask-SQLAlchemy which database to connect to
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Secret key used to securely sign session cookies (required by Flask-Login)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

    # Connect the db object to this specific Flask app
    db.init_app(app)

    # Connect Flask-Login to this app
    login_manager.init_app(app)

    from app.routes import main
    app.register_blueprint(main)

    from app.auth_routes import auth
    app.register_blueprint(auth)

    from app.product_routes import products_bp
    app.register_blueprint(products_bp)

    from app.cart_routes import cart_bp
    app.register_blueprint(cart_bp)

    from app.order_routes import orders_bp
    app.register_blueprint(orders_bp)

    from app.admin_product_routes import admin_products_bp
    app.register_blueprint(admin_products_bp)

    from app.payment_routes import payments_bp
    app.register_blueprint(payments_bp)

    from app.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp)

    from app.upload_routes import upload_bp
    app.register_blueprint(upload_bp)

    from app.quote_routes import quote_bp
    app.register_blueprint(quote_bp)

    from app import models

    # Tells Flask-Login how to load a user from the session.
    # Our user_id is a combined string like "admin-3" or "customer-7",
    # so we split it apart to know which table to query.
    @login_manager.user_loader
    def load_user(combined_id):
        user_type, user_id = combined_id.split("-")
        if user_type == "admin":
            return models.Admin.query.get(int(user_id))
        elif user_type == "customer":
            return models.Customer.query.get(int(user_id))
        return None

    return app