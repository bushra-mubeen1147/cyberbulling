from backend.models.database import get_db_connection
from datetime import datetime

class AnalysisHistory:
    @staticmethod
    def create(user_id, input_text, toxicity_score, cyberbullying_prob, result_sarcasm, sentiment):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''INSERT INTO analysis_history 
                       (user_id, input_text, toxicity_score, cyberbullying_prob, result_sarcasm, sentiment, created_at) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s) 
                       RETURNING id, user_id, input_text, toxicity_score, cyberbullying_prob, result_sarcasm, sentiment, created_at''',
                    (user_id, input_text, toxicity_score, cyberbullying_prob, result_sarcasm, sentiment, datetime.utcnow())
                )
                history = cur.fetchone()
                conn.commit()
                return dict(history)
            finally:
                cur.close()
    
    @staticmethod
    def get_by_user_id(user_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''SELECT id, user_id, input_text, toxicity_score, cyberbullying_prob, result_sarcasm, sentiment, created_at 
                       FROM analysis_history 
                       WHERE user_id = %s 
                       ORDER BY created_at DESC''',
                    (user_id,)
                )
                history = cur.fetchall()
                return [dict(h) for h in history]
            finally:
                cur.close()
    
    @staticmethod
    def get_all():
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute(
                    '''SELECT ah.id, ah.user_id, ah.input_text, ah.toxicity_score, ah.cyberbullying_prob, 
                              ah.result_sarcasm, ah.sentiment, ah.created_at, u.name as user_name, u.email as user_email
                       FROM analysis_history ah
                       LEFT JOIN users u ON ah.user_id = u.id
                       ORDER BY ah.created_at DESC'''
                )
                history = cur.fetchall()
                return [dict(h) for h in history]
            finally:
                cur.close()
    
    @staticmethod
    def delete(history_id):
        with get_db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute('DELETE FROM analysis_history WHERE id = %s RETURNING id', (history_id,))
                deleted = cur.fetchone()
                conn.commit()
                return deleted is not None
            finally:
                cur.close()
