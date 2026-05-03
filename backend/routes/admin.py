from flask import Blueprint, request
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


@admin_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_stats():
    return AdminController.get_stats()


@admin_bp.route('/admin/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    days = request.args.get('days', 7, type=int)
    return AdminController.get_analytics(days)


@admin_bp.route('/admin/user/<int:user_id>/details', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    return AdminController.get_user_details(user_id)


@admin_bp.route('/admin/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    return AdminController.get_notifications()


@admin_bp.route('/admin/notifications/send', methods=['POST'])
@jwt_required()
def send_notification():
    return AdminController.send_notification(request.json or {})


@admin_bp.route('/admin/notification/<int:notif_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notif_id):
    return AdminController.delete_notification(notif_id)


@admin_bp.route('/admin/user/<int:user_id>/role', methods=['PATCH'])
@jwt_required()
def change_user_role(user_id):
    return AdminController.change_user_role(user_id, request.json or {})


@admin_bp.route('/admin/reports', methods=['GET'])
@jwt_required()
def get_reports():
    return AdminController.get_reports()


@admin_bp.route('/admin/ticket/<int:ticket_id>/status', methods=['PATCH'])
@jwt_required()
def update_ticket_status(ticket_id):
    return AdminController.update_ticket_status(ticket_id, request.json or {})


@admin_bp.route('/admin/history/<int:history_id>', methods=['DELETE'])
@jwt_required()
def delete_history_item(history_id):
    return AdminController.delete_history_item(history_id)
