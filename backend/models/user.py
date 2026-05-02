import bcrypt
from database.connection import get_db_connection


class User:
    """User model using direct psycopg2 — no Supabase REST API dependency."""

    @staticmethod
    def create(name, email, password, role='user'):
        password_hash = bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                '''INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
                   VALUES (%s, %s, %s, %s, NOW(), NOW())
                   RETURNING id, name, email, role, bio, location, website, created_at''',
                (name, email, password_hash, role)
            )
            row = cur.fetchone()
            conn.commit()

        return dict(row)

    @staticmethod
    def find_by_email(email):
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                '''SELECT id, name, email, password_hash, role, bio, location, website, created_at
                   FROM users WHERE email = %s''',
                (email,)
            )
            row = cur.fetchone()
        return dict(row) if row else None

    @staticmethod
    def find_by_id(user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                '''SELECT id, name, email, password_hash, role, bio, location, website, created_at
                   FROM users WHERE id = %s''',
                (user_id,)
            )
            row = cur.fetchone()
        return dict(row) if row else None

    @staticmethod
    def get_all():
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                '''SELECT id, name, email, role, bio, location, website, created_at
                   FROM users ORDER BY created_at DESC'''
            )
            rows = cur.fetchall()
        return [dict(r) for r in rows]

    @staticmethod
    def update(user_id, **fields):
        allowed = {'name', 'bio', 'location', 'website'}
        updates = {k: v for k, v in fields.items() if k in allowed}
        if not updates:
            return None

        set_clause = ', '.join(f'{k} = %s' for k in updates)
        values = list(updates.values()) + [user_id]

        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                f'''UPDATE users SET {set_clause}, updated_at = NOW()
                    WHERE id = %s
                    RETURNING id, name, email, role, bio, location, website, created_at''',
                values
            )
            row = cur.fetchone()
            conn.commit()

        return dict(row) if row else None

    @staticmethod
    def update_password(user_id, new_password):
        password_hash = bcrypt.hashpw(
            new_password.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                'UPDATE users SET password_hash = %s, updated_at = NOW() WHERE id = %s',
                (password_hash, user_id)
            )
            conn.commit()

        return True

    @staticmethod
    def delete(user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute('DELETE FROM users WHERE id = %s RETURNING id', (user_id,))
            deleted = cur.fetchone()
            conn.commit()
        return deleted is not None

    @staticmethod
    def verify_password(password_hash, plain_password):
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                password_hash.encode('utf-8')
            )
        except Exception:
            return False
