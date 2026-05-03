from flask import Blueprint
from flask_jwt_extended import jwt_required
from backend.controllers.prediction_controller import PredictionController

prediction_bp = Blueprint('prediction', __name__)


@prediction_bp.route('/predictions/victim/<int:victim_id>', methods=['GET'])
@jwt_required()
def get_victim_prediction(victim_id):
    return PredictionController.get_victim_prediction(victim_id)
