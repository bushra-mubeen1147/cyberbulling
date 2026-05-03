from flask import Blueprint, request
from backend.controllers.trends_controller import TrendsController

trends_bp = Blueprint('trends', __name__)


@trends_bp.route('/trends', methods=['GET'])
def get_trends():
    location = request.args.get('location', 'worldwide')
    return TrendsController.get_trends(location)


@trends_bp.route('/trends/locations', methods=['GET'])
def get_locations():
    return TrendsController.get_locations()
