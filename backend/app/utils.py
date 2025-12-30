from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity  # <--- Added verify_jwt_in_request
from .models import User

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()  # <--- CRITICAL FIX: Verify token exists first!
                current_user_id = get_jwt_identity()
                user = User.query.get(int(current_user_id))
                
                if not user or user.role != 'admin':
                    return jsonify({'error': 'Admin access required'}), 403
                    
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Unauthorized', 'details': str(e)}), 401
        return decorator
    return wrapper