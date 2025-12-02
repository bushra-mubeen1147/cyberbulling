from flask import Blueprint, request
from backend.controllers.analysis_controller import AnalysisController

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    return AnalysisController.analyze_text(data)
