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
                    'id': user.get('id'),
                    'name': user.get('name'),
                    'email': user.get('email'),
                    'role': user.get('role')
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
        
        if not User.verify_password(user.get('password_hash', ''), password):
            return format_error('Invalid email or password', 401)
        
        access_token = create_access_token(identity=str(user['id']))
        
        return format_response({
            'user': {
                'id': user.get('id'),
                'name': user.get('name'),
                'email': user.get('email'),
                'role': user.get('role')
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
            'id': user.get('id'),
            'name': user.get('name'),
            'email': user.get('email'),
            'role': user.get('role'),
            'bio': user.get('bio'),
            'location': user.get('location'),
            'website': user.get('website'),
            'created_at': user.get('created_at')
        })
    
    @staticmethod
    def update_profile(data):
        user_id = get_jwt_identity()
        name = data.get('name')
        bio = data.get('bio')
        location = data.get('location')
        website = data.get('website')
        
        try:
            update_fields = {}
            if name:
                update_fields['name'] = name
            if bio is not None:
                update_fields['bio'] = bio
            if location is not None:
                update_fields['location'] = location
            if website is not None:
                update_fields['website'] = website
            
            if not update_fields:
                return format_error('No fields to update', 400)
            
            user = User.update(int(user_id), **update_fields)
            
            return format_response({
                'id': user.get('id'),
                'name': user.get('name'),
                'email': user.get('email'),
                'bio': user.get('bio'),
                'location': user.get('location'),
                'website': user.get('website'),
                'role': user.get('role')
            }, 'Profile updated successfully')
        except Exception as e:
            return format_error(f'Failed to update profile: {str(e)}', 500)
    
    @staticmethod
    def update_password(data):
        user_id = get_jwt_identity()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not all([current_password, new_password]):
            return format_error('Current and new password are required', 400)
        
        if len(new_password) < 6:
            return format_error('New password must be at least 6 characters', 400)
        
        try:
            user = User.find_by_id(int(user_id))
            if not user:
                return format_error('User not found', 404)
            
            if not User.verify_password(user.get('password_hash', ''), current_password):
                return format_error('Current password is incorrect', 401)
            
            User.update_password(int(user_id), new_password)
            
            return format_response({}, 'Password updated successfully')
        except Exception as e:
            return format_error(f'Failed to update password: {str(e)}', 500)
