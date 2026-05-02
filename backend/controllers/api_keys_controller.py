import secrets
from flask_jwt_extended import get_jwt_identity
from database.connection import get_db_connection
from backend.utils.helpers import format_response, format_error


def _generate_key(env):
    prefix = 'sk_live' if env == 'production' else 'sk_test'
    return f"{prefix}_{secrets.token_hex(16)}"


class ApiKeysController:
    @staticmethod
    def get_keys():
        user_id = get_jwt_identity()
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    '''SELECT id, name, key_value, environment, status, calls_count, last_used_at, created_at
                       FROM user_api_keys WHERE user_id = %s ORDER BY created_at DESC''',
                    (user_id,)
                )
                rows = [dict(r) for r in cur.fetchall()]
            for r in rows:
                if r.get('created_at'):
                    r['created_at'] = r['created_at'].isoformat()
                if r.get('last_used_at'):
                    r['last_used_at'] = r['last_used_at'].isoformat()
            return format_response(rows)
        except Exception as e:
            return format_error(str(e), 500)

    @staticmethod
    def create_key(data):
        user_id = get_jwt_identity()
        name = (data.get('name') or '').strip()
        env = data.get('environment', 'development')
        if not name:
            return format_error('Key name is required', 400)
        key_value = _generate_key(env)
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    '''INSERT INTO user_api_keys (user_id, name, key_value, environment)
                       VALUES (%s, %s, %s, %s)
                       RETURNING id, name, key_value, environment, status, calls_count, created_at''',
                    (user_id, name, key_value, env)
                )
                row = dict(cur.fetchone())
                conn.commit()
            if row.get('created_at'):
                row['created_at'] = row['created_at'].isoformat()
            return format_response(row, 'API key created', 201)
        except Exception as e:
            return format_error(str(e), 500)

    @staticmethod
    def delete_key(key_id):
        user_id = get_jwt_identity()
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    'DELETE FROM user_api_keys WHERE id = %s AND user_id = %s RETURNING id',
                    (key_id, user_id)
                )
                deleted = cur.fetchone()
                conn.commit()
            if not deleted:
                return format_error('Key not found', 404)
            return format_response({'id': key_id}, 'API key deleted')
        except Exception as e:
            return format_error(str(e), 500)

    @staticmethod
    def regenerate_key(key_id):
        user_id = get_jwt_identity()
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    'SELECT environment FROM user_api_keys WHERE id = %s AND user_id = %s',
                    (key_id, user_id)
                )
                row = cur.fetchone()
                if not row:
                    return format_error('Key not found', 404)
                new_value = _generate_key(row['environment'])
                cur.execute(
                    '''UPDATE user_api_keys SET key_value = %s, created_at = NOW()
                       WHERE id = %s AND user_id = %s
                       RETURNING id, name, key_value, environment, status, calls_count, created_at''',
                    (new_value, key_id, user_id)
                )
                updated = dict(cur.fetchone())
                conn.commit()
            if updated.get('created_at'):
                updated['created_at'] = updated['created_at'].isoformat()
            return format_response(updated, 'API key regenerated')
        except Exception as e:
            return format_error(str(e), 500)
