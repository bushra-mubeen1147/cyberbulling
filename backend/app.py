from flask import Flask, request, make_response, jsonify
from flask_jwt_extended import JWTManager
from backend.config import Config
from database.connection import init_db
from backend.routes import (
    auth_bp, analysis_bp, history_bp, admin_bp,
    activity_bp, settings_bp, contact_bp, api_keys_bp, twitter_bp, victims_bp, trends_bp,
    prediction_bp,
)
import os


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS ────────────────────────────────────────────────────────────────
    # We use JWT in the Authorization header (not cookies), so we don't need
    # credentials mode.  Adding headers directly on every response is the
    # simplest approach that never fails regardless of flask-cors version.

    @app.after_request
    def add_cors(response):
        origin = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = \
            'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = \
            'Content-Type, Authorization, Accept, X-Requested-With'
        response.headers['Access-Control-Max-Age'] = '86400'
        return response

    @app.before_request
    def handle_options():
        """Return 200 immediately for every preflight OPTIONS request."""
        if request.method == 'OPTIONS':
            resp = make_response()
            origin = request.headers.get('Origin', '*')
            resp.headers['Access-Control-Allow-Origin'] = origin
            resp.headers['Access-Control-Allow-Methods'] = \
                'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            resp.headers['Access-Control-Allow-Headers'] = \
                'Content-Type, Authorization, Accept, X-Requested-With'
            resp.headers['Access-Control-Max-Age'] = '86400'
            return resp, 200
    # ────────────────────────────────────────────────────────────────────────

    JWTManager(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(settings_bp,  url_prefix='/settings')
    app.register_blueprint(contact_bp,   url_prefix='/contact')
    app.register_blueprint(api_keys_bp)
    app.register_blueprint(twitter_bp)
    app.register_blueprint(victims_bp)
    app.register_blueprint(trends_bp)
    app.register_blueprint(prediction_bp)

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'SafeText AI Backend running'})

    if os.getenv('SKIP_DB_INIT') == '1':
        print('Skipping DB init.')
    else:
        try:
            init_db()
            print('Database initialized successfully.')
        except Exception as e:
            print(f'DB init failed: {e}  — continuing anyway.')

    return app


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
