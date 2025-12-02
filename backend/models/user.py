from backend.models.database import get_db_connection
import bcrypt
from datetime import datetime

class User:
    @staticmethod
    def create(name, email, password, role='user'):
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''INSERT INTO users (name, email, password_hash, role, created_at) 
                       VALUES (%s, %s, %s, %s, %s) RETURNING id, name, email, role, created_at''',
                    (name, email, password_hash, role, datetime.utcnow())
                )
                user = cur.fetchone()
                conn.commit()
                return dict(user)
            finally:
                cur.close()
    
    @staticmethod
    def find_by_email(email):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute('SELECT * FROM users WHERE email = %s', (email,))
                user = cur.fetchone()
                return dict(user) if user else None
            finally:
                cur.close()
    
    @staticmethod
    def find_by_id(user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute('SELECT id, name, email, role, created_at FROM users WHERE id = %s', (user_id,))
                user = cur.fetchone()
                return dict(user) if user else None
            finally:
                cur.close()
    
    @staticmethod
    def get_all():
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
                users = cur.fetchall()
                return [dict(user) for user in users]
            finally:
                cur.close()
    
    @staticmethod
    def delete(user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute('DELETE FROM users WHERE id = %s RETURNING id', (user_id,))
                deleted = cur.fetchone()
                conn.commit()
                return deleted is not None
            finally:
                cur.close()
    
    @staticmethod
    def verify_password(stored_hash, password):
        return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
