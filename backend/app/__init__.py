from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # CORS: Allow Frontend to talk to Backend
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Database: Default to SQLite for local, ready for Postgres
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Security: Hardcoded keys to prevent 422 loops
    app.config['SECRET_KEY'] = 'static-mac-secret-key-123'
    app.config['JWT_SECRET_KEY'] = 'static-mac-jwt-key-456'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
    
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from .routes import api
    app.register_blueprint(api, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app