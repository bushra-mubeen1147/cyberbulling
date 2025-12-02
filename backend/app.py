from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.models.database import init_db
from backend.routes import auth_bp, analysis_bp, history_bp, admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    JWTManager(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(admin_bp)
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'message': 'SafeText AI Backend is running'}
    
    with app.app_context():
        init_db()
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
