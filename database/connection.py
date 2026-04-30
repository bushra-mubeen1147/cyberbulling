import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

def _dsn_with_ssl(dsn: str | None) -> str:
    if not dsn:
        raise RuntimeError("DATABASE_URL is not set. Provide your Supabase Postgres connection URI in .env")
    # If sslmode already present, return as-is
    if "sslmode=" in dsn:
        return dsn
    # Supabase typically requires SSL; append sslmode=require
    sep = "&" if "?" in dsn else "?"
    return f"{dsn}{sep}sslmode=require"

@contextmanager
def get_db_connection():
    conn = None
    try:
        dsn = _dsn_with_ssl(os.environ.get('DATABASE_URL'))
        conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

@contextmanager
def get_db_cursor(commit=False):
    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            yield cur
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()

def init_db():
    with get_db_connection() as conn:
        cur = conn.cursor()
        
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cur.execute('''
            CREATE TABLE IF NOT EXISTS analysis_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                input_text TEXT NOT NULL,
                toxicity_score FLOAT,
                cyberbullying_prob FLOAT,
                result_sarcasm BOOLEAN,
                sentiment VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        cur.close()
        print("Database initialized successfully!")
