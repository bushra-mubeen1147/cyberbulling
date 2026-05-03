from database.connection import get_db_connection


class MonitoredProfile:
    @staticmethod
    def create(user_id, username, display_name=None):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''INSERT INTO monitored_profiles (user_id, twitter_username, display_name)
                       VALUES (%s, %s, %s)
                       ON CONFLICT (user_id, twitter_username)
                       DO UPDATE SET display_name = COALESCE(EXCLUDED.display_name, monitored_profiles.display_name)
                       RETURNING id, user_id, twitter_username, display_name, added_at, last_checked_at''',
                    (user_id, username.lower().lstrip('@'), display_name)
                )
                row = cur.fetchone()
                conn.commit()
                return dict(row)
            finally:
                cur.close()

    @staticmethod
    def get_by_user(user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''SELECT id, user_id, twitter_username, display_name, added_at, last_checked_at
                       FROM monitored_profiles
                       WHERE user_id = %s
                       ORDER BY added_at DESC''',
                    (user_id,)
                )
                return [dict(r) for r in cur.fetchall()]
            finally:
                cur.close()

    @staticmethod
    def get_by_id(profile_id, user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''SELECT id, user_id, twitter_username, display_name, added_at, last_checked_at
                       FROM monitored_profiles
                       WHERE id = %s AND user_id = %s''',
                    (profile_id, user_id)
                )
                row = cur.fetchone()
                return dict(row) if row else None
            finally:
                cur.close()

    @staticmethod
    def delete(profile_id, user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''DELETE FROM monitored_profiles WHERE id = %s AND user_id = %s RETURNING id''',
                    (profile_id, user_id)
                )
                deleted = cur.fetchone()
                conn.commit()
                return deleted is not None
            finally:
                cur.close()

    @staticmethod
    def update_last_checked(profile_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    'UPDATE monitored_profiles SET last_checked_at = NOW() WHERE id = %s',
                    (profile_id,)
                )
                conn.commit()
            finally:
                cur.close()
