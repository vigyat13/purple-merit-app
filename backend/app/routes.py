from flask import Blueprint, request, jsonify
from . import db, bcrypt
from .models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from .utils import admin_required
import re

api = Blueprint('api', __name__)

def validate_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def validate_password(password):
    return len(password) >= 8

# --- Auth ---
@api.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not validate_email(data.get('email', '')): return jsonify({'error': 'Invalid email'}), 400
    if not validate_password(data.get('password', '')): return jsonify({'error': 'Password min 8 chars'}), 400
    if User.query.filter_by(email=data['email']).first(): return jsonify({'error': 'Email exists'}), 400

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    # Default first user to admin for testing? Change role='admin' manually in DB if needed.
    new_user = User(full_name=data['full_name'], email=data['email'], password_hash=hashed_pw, role='user')
    
    db.session.add(new_user)
    db.session.commit()
    token = create_access_token(identity=str(new_user.id))
    return jsonify({'message': 'User created', 'token': token, 'user': new_user.to_dict()}), 201

@api.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        if user.status == 'inactive': return jsonify({'error': 'Account inactive'}), 403
        user.last_login = datetime.utcnow()
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token, 'user': user.to_dict()}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

# --- User ---
@api.route('/user/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if request.method == 'GET':
        return jsonify(user.to_dict()), 200
    
    data = request.get_json()
    if 'full_name' in data: user.full_name = data['full_name']
    if 'email' in data: user.email = data['email']
    if 'password' in data and data['password']:
        user.password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    db.session.commit()
    return jsonify({'message': 'Updated', 'user': user.to_dict()}), 200

# --- Admin ---
@api.route('/admin/users', methods=['GET'])
@admin_required()
def get_users():
    page = request.args.get('page', 1, type=int)
    users = User.query.paginate(page=page, per_page=10)
    return jsonify({'users': [u.to_dict() for u in users.items], 'total': users.total, 'pages': users.pages}), 200

@api.route('/admin/users/<int:user_id>/status', methods=['PATCH'])
@admin_required()
def user_status(user_id):
    user = User.query.get_or_404(user_id)
    status = request.get_json().get('status')
    if status in ['active', 'inactive']:
        user.status = status
        db.session.commit()
        return jsonify({'message': 'Status updated'}), 200
    return jsonify({'error': 'Invalid status'}), 400