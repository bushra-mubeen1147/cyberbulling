from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from backend.controllers.history_controller import HistoryController

history_bp = Blueprint('history', __name__)

@history_bp.route('/history/add', methods=['POST'])
@jwt_required()
def add_history():
    data = request.get_json()
    return HistoryController.add_history(data)

@history_bp.route('/history/<int:user_id>', methods=['GET'])
@jwt_required()
def get_history(user_id):
    return HistoryController.get_user_history(user_id)
