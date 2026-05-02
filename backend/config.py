import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('JWT_SECRET_KEY', os.environ.get('SESSION_SECRET', 'dev-secret-key'))
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', os.environ.get('SESSION_SECRET', 'jwt-secret-key'))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    CORS_ORIGINS = [
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
