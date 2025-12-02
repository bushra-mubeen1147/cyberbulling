from flask import jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from backend.models.user import User
from backend.utils.helpers import format_response, format_error

class AuthController:
    @staticmethod
    def signup(data):
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        if not all([name, email, password]):
            return format_error('Name, email, and password are required', 400)
        
        if len(password) < 6:
            return format_error('Password must be at least 6 characters', 400)
        
        existing_user = User.find_by_email(email)
        if existing_user:
            return format_error('Email already registered', 400)
        
        try:
            user = User.create(name, email, password)
            access_token = create_access_token(identity=str(user['id']))
            
            return format_response({
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'role': user['role']
                },
                'access_token': access_token
            }, 'User registered successfully', 201)
        except Exception as e:
            return format_error(f'Registration failed: {str(e)}', 500)
    
    @staticmethod
    def login(data):
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return format_error('Email and password are required', 400)
        
        user = User.find_by_email(email)
        if not user:
            return format_error('Invalid email or password', 401)
        
        if not User.verify_password(user['password_hash'], password):
            return format_error('Invalid email or password', 401)
        
        access_token = create_access_token(identity=str(user['id']))
        
        return format_response({
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            },
            'access_token': access_token
        }, 'Login successful')
    
    @staticmethod
    def get_current_user():
        user_id = get_jwt_identity()
        user = User.find_by_id(int(user_id))
        
        if not user:
            return format_error('User not found', 404)
        
        return format_response({
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'created_at': user['created_at'].isoformat() if user['created_at'] else None
        })
