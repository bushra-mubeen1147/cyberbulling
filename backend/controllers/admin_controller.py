from flask_jwt_extended import get_jwt_identity
from backend.models.user import User
from backend.models.analysis_history import AnalysisHistory
from backend.utils.helpers import format_response, format_error

class AdminController:
    @staticmethod
    def get_all_users():
        current_user_id = get_jwt_identity()
        current_user = User.find_by_id(int(current_user_id))
        
        if not current_user or current_user['role'] != 'admin':
            return format_error('Admin access required', 403)
        
        try:
            users = User.get_all()
            
            for user in users:
                if user['created_at']:
                    user['created_at'] = user['created_at'].isoformat()
            
            return format_response(users)
        except Exception as e:
            return format_error(f'Failed to fetch users: {str(e)}', 500)
    
    @staticmethod
    def get_all_history():
        current_user_id = get_jwt_identity()
        current_user = User.find_by_id(int(current_user_id))
        
        if not current_user or current_user['role'] != 'admin':
            return format_error('Admin access required', 403)
        
        try:
            history = AnalysisHistory.get_all()
            
            for item in history:
                if item['created_at']:
                    item['created_at'] = item['created_at'].isoformat()
            
            return format_response(history)
        except Exception as e:
            return format_error(f'Failed to fetch history: {str(e)}', 500)
    
    @staticmethod
    def delete_user(user_id):
        current_user_id = get_jwt_identity()
        current_user = User.find_by_id(int(current_user_id))
        
        if not current_user or current_user['role'] != 'admin':
            return format_error('Admin access required', 403)
        
        if int(current_user_id) == user_id:
            return format_error('Cannot delete your own account', 400)
        
        try:
            deleted = User.delete(user_id)
            
            if deleted:
                return format_response({'id': user_id}, 'User deleted successfully')
            else:
                return format_error('User not found', 404)
        except Exception as e:
            return format_error(f'Failed to delete user: {str(e)}', 500)
