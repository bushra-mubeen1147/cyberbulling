from flask import Blueprint
from flask_jwt_extended import jwt_required
from backend.controllers.admin_controller import AdminController

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    return AdminController.get_all_users()

@admin_bp.route('/admin/history', methods=['GET'])
@jwt_required()
def get_all_history():
    return AdminController.get_all_history()

@admin_bp.route('/admin/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    return AdminController.delete_user(user_id)
