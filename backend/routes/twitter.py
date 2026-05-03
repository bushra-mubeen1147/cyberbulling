from flask import Blueprint, request
from backend.controllers.twitter_controller import TwitterController

twitter_bp = Blueprint('twitter', __name__)


@twitter_bp.route('/twitter/analyze', methods=['POST'])
def analyze_twitter_url():
    data = request.get_json() or {}
    return TwitterController.analyze_url(data)
