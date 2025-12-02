from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.models.database import init_db
from backend.routes import auth_bp, analysis_bp, history_bp, admin_bp
import os

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
        return {'status': 'healthy', 'db_init': os.getenv('SKIP_DB_INIT') == '1', 'message': 'SafeText AI Backend running'}

    if os.getenv('SKIP_DB_INIT') == '1':
        print('Skipping database initialization (SKIP_DB_INIT=1).')
    else:
        try:
            init_db()
        except Exception as e:
            print(f'Database initialization failed: {e}\nContinuing without DB. Set SKIP_DB_INIT=1 to suppress this attempt.')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
