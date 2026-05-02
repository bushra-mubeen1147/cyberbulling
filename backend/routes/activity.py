from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from backend.controllers.activity_controller import ActivityController

activity_bp = Blueprint('activity', __name__)

@activity_bp.route('/activity/<int:user_id>', methods=['GET'])
@jwt_required()
def get_activities(user_id):
    return ActivityController.get_user_activities(user_id)

@activity_bp.route('/activity/log', methods=['POST'])
@jwt_required()
def log_activity():
    data = request.get_json()
    return ActivityController.log_activity(
        data.get('user_id'),
        data.get('type'),
        data.get('description'),
        data.get('metadata')
    )

@activity_bp.route('/alerts/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_alerts(user_id):
    return ActivityController.get_user_alerts(user_id)