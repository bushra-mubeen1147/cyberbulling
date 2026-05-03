from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from backend.controllers.victim_controller import VictimController

victims_bp = Blueprint('victims', __name__)


@victims_bp.route('/victims', methods=['POST'])
@jwt_required()
def add_victim():
    return VictimController.add_victim(request.get_json() or {})


@victims_bp.route('/victims', methods=['GET'])
@jwt_required()
def list_victims():
    return VictimController.list_victims()


@victims_bp.route('/victims/<int:victim_id>', methods=['DELETE'])
@jwt_required()
def remove_victim(victim_id):
    return VictimController.remove_victim(victim_id)


@victims_bp.route('/victims/<int:victim_id>/tweets', methods=['GET'])
@jwt_required()
def get_victim_tweets(victim_id):
    return VictimController.get_victim_tweets(victim_id)


@victims_bp.route('/victims/<int:victim_id>/check', methods=['POST'])
@jwt_required()
def check_new_tweets(victim_id):
    return VictimController.check_new_tweets(victim_id)
