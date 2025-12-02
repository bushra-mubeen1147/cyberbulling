from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from backend.controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    return AuthController.signup(data)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return AuthController.login(data)

@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    return AuthController.get_current_user()
