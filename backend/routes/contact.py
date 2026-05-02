from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from backend.controllers.contact_controller import ContactController

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/send', methods=['POST'])
def send_contact_message():
    data = request.get_json()
    return ContactController.send_contact_message(data)

@contact_bp.route('/support/ticket', methods=['POST'])
@jwt_required()
def create_support_ticket():
    data = request.get_json()
    return ContactController.send_support_ticket(data)
