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

        # Create users table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                bio TEXT,
                location VARCHAR(255),
                website VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Add missing columns if the table was created with an older schema
        for col, defn in [
            ('bio',        'TEXT'),
            ('location',   'VARCHAR(255)'),
            ('website',    'VARCHAR(255)'),
            ('updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
            ('role',       "VARCHAR(50) DEFAULT 'user'"),
        ]:
            cur.execute(f'''
                ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} {defn}
            ''')
        
        # Create analysis_history table with tweet_url
        cur.execute('''
            CREATE TABLE IF NOT EXISTS analysis_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                input_text TEXT NOT NULL,
                toxicity_score FLOAT,
                cyberbullying_prob FLOAT,
                result_sarcasm BOOLEAN,
                sentiment VARCHAR(50),
                tweet_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create activities table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS activities (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                activity_type VARCHAR(100) NOT NULL,
                description TEXT,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create alerts table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                alert_type VARCHAR(100) NOT NULL,
                content TEXT NOT NULL,
                severity VARCHAR(50) DEFAULT 'medium',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create user_settings table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user_settings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                theme VARCHAR(50) DEFAULT 'dark',
                notifications_enabled BOOLEAN DEFAULT TRUE,
                email_alerts BOOLEAN DEFAULT TRUE,
                auto_save BOOLEAN DEFAULT TRUE,
                privacy_mode BOOLEAN DEFAULT FALSE,
                data_collection BOOLEAN DEFAULT TRUE,
                api_rate_limit VARCHAR(50) DEFAULT 'standard',
                analysis_threshold VARCHAR(50) DEFAULT 'medium',
                profile_visibility VARCHAR(50) DEFAULT 'private',
                share_analytics BOOLEAN DEFAULT FALSE,
                data_retention VARCHAR(50) DEFAULT '90days',
                weekly_reports BOOLEAN DEFAULT FALSE,
                push_notifications BOOLEAN DEFAULT TRUE,
                product_updates BOOLEAN DEFAULT TRUE,
                security_alerts BOOLEAN DEFAULT TRUE,
                analysis_complete BOOLEAN DEFAULT TRUE,
                high_risk_alerts BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create contact_messages table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(500),
                message TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create support_tickets table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(500) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'feedback',
                priority VARCHAR(50) DEFAULT 'medium',
                category VARCHAR(100) DEFAULT 'general',
                status VARCHAR(50) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create user_api_keys table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user_api_keys (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                key_value VARCHAR(64) NOT NULL UNIQUE,
                environment VARCHAR(50) DEFAULT 'development',
                status VARCHAR(50) DEFAULT 'active',
                calls_count INTEGER DEFAULT 0,
                last_used_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create indexes
        cur.execute('CREATE INDEX IF NOT EXISTS idx_analysis_user ON analysis_history(user_id)')
        cur.execute('CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id)')
        cur.execute('CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id)')

        conn.commit()
        cur.close()
        print("Database initialized successfully!")
