from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from backend.controllers.settings_controller import SettingsController

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/save', methods=['POST'])
@jwt_required()
def save_settings():
    data = request.get_json()
    return SettingsController.save_user_settings(data)

@settings_bp.route('/get', methods=['GET'])
@jwt_required()
def get_settings():
    return SettingsController.get_user_settings()
