from flask import request, jsonify
from datetime import datetime, timedelta
from database.connection import get_db_connection
import json

class ActivityController:
    @staticmethod
    def get_user_activities(user_id):
        """Get all activities for a user"""
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    '''SELECT id, user_id, activity_type, description, metadata, created_at 
                       FROM activities 
                       WHERE user_id = %s 
                       ORDER BY created_at DESC''',
                    (user_id,)
                )
                activities = cur.fetchall()
                activities_list = [dict(a) for a in activities]
                
            return {
                'success': True,
                'data': activities_list,
                'count': len(activities_list)
            }, 200
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500

    @staticmethod
    def log_activity(user_id, activity_type, description, metadata=None):
        """Log an activity"""
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    '''INSERT INTO activities (user_id, activity_type, description, metadata, created_at)
                       VALUES (%s, %s, %s, %s, %s)
                       RETURNING id, user_id, activity_type, description, metadata, created_at''',
                    (user_id, activity_type, description, json.dumps(metadata) if metadata else None, datetime.utcnow())
                )
                activity = cur.fetchone()
                conn.commit()
                
            return {
                'success': True,
                'data': dict(activity) if activity else None
            }, 201
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500

    @staticmethod
    def get_user_alerts(user_id):
        """Get alerts for a user from the alerts table"""
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    '''SELECT id, user_id, alert_type, content, severity, is_read, created_at
                       FROM alerts
                       WHERE user_id = %s
                       ORDER BY created_at DESC
                       LIMIT 20''',
                    (user_id,)
                )
                alerts = [dict(a) for a in cur.fetchall()]
                for a in alerts:
                    if a.get('created_at'):
                        a['created_at'] = a['created_at'].isoformat()

            return {
                'success': True,
                'data': alerts,
                'count': len(alerts)
            }, 200
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500

    @staticmethod
    def get_dashboard_summary(user_id):
        """Get dashboard summary with recent activities"""
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                
                # Get recent analyses
                cur.execute(
                    '''SELECT id, user_id, input_text, toxicity_score, cyberbullying_prob, 
                              result_sarcasm, sentiment, tweet_url, created_at 
                       FROM analysis_history 
                       WHERE user_id = %s 
                       ORDER BY created_at DESC LIMIT 5''',
                    (user_id,)
                )
                analyses = cur.fetchall()
                recent_analyses = [dict(a) for a in analyses]
                
                # Get recent alerts
                cur.execute(
                    '''SELECT id, user_id, alert_type, content, severity, is_read, created_at 
                       FROM alerts 
                       WHERE user_id = %s 
                       ORDER BY created_at DESC LIMIT 5''',
                    (user_id,)
                )
                alerts = cur.fetchall()
                recent_alerts = [dict(a) for a in alerts]
                
                # Get total analyses count
                cur.execute(
                    '''SELECT COUNT(*) as count FROM analysis_history WHERE user_id = %s''',
                    (user_id,)
                )
                total_count = cur.fetchone()
                total_analyses = total_count['count'] if total_count else 0
                
            return {
                'success': True,
                'data': {
                    'recent_analyses': recent_analyses,
                    'recent_alerts': recent_alerts,
                    'total_analyses': total_analyses,
                    'timestamp': datetime.utcnow().isoformat()
                }
            }, 200
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500
