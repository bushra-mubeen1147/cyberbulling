import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SESSION_SECRET', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('SESSION_SECRET', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    CORS_ORIGINS = ["*"]
