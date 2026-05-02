from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from backend.controllers.api_keys_controller import ApiKeysController

api_keys_bp = Blueprint('api_keys', __name__)

@api_keys_bp.route('/apikeys', methods=['GET'])
@jwt_required()
def get_keys():
    return ApiKeysController.get_keys()

@api_keys_bp.route('/apikeys', methods=['POST'])
@jwt_required()
def create_key():
    return ApiKeysController.create_key(request.get_json() or {})

@api_keys_bp.route('/apikeys/<int:key_id>', methods=['DELETE'])
@jwt_required()
def delete_key(key_id):
    return ApiKeysController.delete_key(key_id)

@api_keys_bp.route('/apikeys/<int:key_id>/regenerate', methods=['POST'])
@jwt_required()
def regenerate_key(key_id):
    return ApiKeysController.regenerate_key(key_id)
