from flask_jwt_extended import get_jwt_identity
from backend.models.analysis_history import AnalysisHistory
from backend.utils.helpers import format_response, format_error
from database.connection import get_db_connection


class HistoryController:
    @staticmethod
    def add_history(data):
        user_id = get_jwt_identity()
        input_text = data.get('text')
        toxicity_score = data.get('toxicity_score')
        cyberbullying_prob = data.get('cyberbullying_prob')
        result_sarcasm = data.get('sarcasm')
        sentiment = data.get('sentiment')
        tweet_url = data.get('tweet_url')

        if not input_text:
            return format_error('Text is required', 400)

        try:
            history = AnalysisHistory.create(
                int(user_id),
                input_text,
                toxicity_score,
                cyberbullying_prob,
                result_sarcasm,
                sentiment,
                tweet_url
            )

            # Auto-create alert when content is toxic
            tox = float(toxicity_score) if toxicity_score is not None else 0.0
            bully = float(cyberbullying_prob) if cyberbullying_prob is not None else 0.0
            max_score = max(tox, bully)

            if max_score > 0.5:
                if max_score > 0.7:
                    severity = 'critical'
                    alert_type = 'high_risk'
                    content = f'High-risk content detected — Toxicity: {tox*100:.0f}%, Cyberbullying: {bully*100:.0f}%'
                else:
                    severity = 'high'
                    alert_type = 'toxic_content'
                    content = f'Toxic content flagged — Toxicity: {tox*100:.0f}%, Cyberbullying: {bully*100:.0f}%'

                try:
                    with get_db_connection() as conn:
                        cur = conn.cursor()
                        cur.execute(
                            '''INSERT INTO alerts (user_id, alert_type, content, severity, is_read)
                               VALUES (%s, %s, %s, %s, FALSE)''',
                            (int(user_id), alert_type, content, severity)
                        )
                        conn.commit()
                except Exception:
                    pass  # Don't fail the history save if alert creation fails

            history['created_at'] = history['created_at'].isoformat() if history['created_at'] else None

            return format_response(history, 'History saved successfully', 201)
        except Exception as e:
            return format_error(f'Failed to save history: {str(e)}', 500)

    @staticmethod
    def delete_history(history_id):
        user_id = get_jwt_identity()
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                # Only delete if it belongs to this user (or user is admin)
                cur.execute('SELECT role FROM users WHERE id = %s', (int(user_id),))
                role_row = cur.fetchone()
                role = role_row['role'] if role_row else 'user'

                if role == 'admin':
                    cur.execute('DELETE FROM analysis_history WHERE id = %s RETURNING id', (history_id,))
                else:
                    cur.execute(
                        'DELETE FROM analysis_history WHERE id = %s AND user_id = %s RETURNING id',
                        (history_id, int(user_id))
                    )
                deleted = cur.fetchone()
                conn.commit()

            if not deleted:
                return format_error('History item not found or unauthorized', 404)
            return format_response({'id': history_id}, 'Deleted successfully')
        except Exception as e:
            return format_error(f'Failed to delete: {str(e)}', 500)

    @staticmethod
    def get_user_history(user_id):
        current_user_id = get_jwt_identity()

        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute('SELECT role FROM users WHERE id = %s', (int(current_user_id),))
                user_role_row = cur.fetchone()
                user_role = user_role_row['role'] if user_role_row else 'user'

            if user_role != 'admin' and int(current_user_id) != int(user_id):
                return format_error('Unauthorized: Cannot access other users\' history', 403)

            history = AnalysisHistory.get_by_user_id(user_id)

            for item in history:
                if item['created_at']:
                    item['created_at'] = item['created_at'].isoformat()

            return format_response(history)
        except Exception as e:
            return format_error(f'Failed to fetch history: {str(e)}', 500)
