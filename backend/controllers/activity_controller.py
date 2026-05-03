from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timedelta, date
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

    @staticmethod
    def mark_all_alerts_read():
        """Mark all alerts as read for the current JWT user."""
        try:
            user_id = int(get_jwt_identity())
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    'UPDATE alerts SET is_read = TRUE WHERE user_id = %s AND is_read = FALSE',
                    (user_id,)
                )
                conn.commit()
            return {'success': True}, 200
        except Exception as e:
            return {'success': False, 'error': str(e)}, 500

    @staticmethod
    def get_user_analytics():
        """Personal analytics for the current JWT user — 30-day heatmap, sentiment, toxicity."""
        try:
            user_id = int(get_jwt_identity())
            with get_db_connection() as conn:
                cur = conn.cursor()

                # 30-day daily counts
                cur.execute("""
                    SELECT DATE(created_at) as day,
                           COUNT(*) as total,
                           SUM(CASE WHEN toxicity_score > 0.5 OR cyberbullying_prob > 0.5 THEN 1 ELSE 0 END) as flagged
                    FROM analysis_history
                    WHERE user_id = %s AND created_at >= NOW() - INTERVAL '30 days'
                    GROUP BY DATE(created_at)
                    ORDER BY day ASC
                """, (user_id,))
                daily = [
                    {'day': dict(r)['day'].isoformat(),
                     'total': int(dict(r)['total'] or 0),
                     'flagged': int(dict(r)['flagged'] or 0)}
                    for r in cur.fetchall()
                ]

                # Sentiment breakdown
                cur.execute("""
                    SELECT COALESCE(sentiment, 'neutral') as sentiment, COUNT(*) as count
                    FROM analysis_history WHERE user_id = %s
                    GROUP BY COALESCE(sentiment, 'neutral')
                """, (user_id,))
                sentiment = [
                    {'sentiment': dict(r)['sentiment'], 'count': int(dict(r)['count'] or 0)}
                    for r in cur.fetchall()
                ]

                # Toxicity buckets + averages
                cur.execute("""
                    SELECT
                        COUNT(*) as total,
                        SUM(CASE WHEN toxicity_score <= 0.3 THEN 1 ELSE 0 END) as low,
                        SUM(CASE WHEN toxicity_score > 0.3 AND toxicity_score <= 0.6 THEN 1 ELSE 0 END) as medium,
                        SUM(CASE WHEN toxicity_score > 0.6 THEN 1 ELSE 0 END) as high,
                        ROUND(COALESCE(AVG(toxicity_score), 0)::numeric * 100, 1) as avg_pct
                    FROM analysis_history WHERE user_id = %s
                """, (user_id,))
                tox = dict(cur.fetchone())

                # This week vs last week
                cur.execute("""
                    SELECT
                        SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as this_week,
                        SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days'
                                  AND created_at < NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as last_week,
                        COUNT(*) as total_all
                    FROM analysis_history WHERE user_id = %s
                """, (user_id,))
                weekly = dict(cur.fetchone())

                # Days with any analysis (for streak)
                cur.execute("""
                    SELECT DATE(created_at) as day FROM analysis_history
                    WHERE user_id = %s GROUP BY DATE(created_at)
                    ORDER BY day DESC LIMIT 60
                """, (user_id,))
                active_days = [dict(r)['day'] for r in cur.fetchall()]

            # Compute streak
            streak = 0
            today = datetime.utcnow().date()
            for i, d in enumerate(active_days):
                if d == today - timedelta(days=i):
                    streak += 1
                else:
                    break

            return {
                'success': True,
                'data': {
                    'daily': daily,
                    'sentiment': sentiment,
                    'toxicity': {
                        'total': int(tox.get('total') or 0),
                        'low':   int(tox.get('low')   or 0),
                        'medium':int(tox.get('medium') or 0),
                        'high':  int(tox.get('high')  or 0),
                        'avg_pct': float(tox.get('avg_pct') or 0),
                    },
                    'weekly': {
                        'this_week': int(weekly.get('this_week') or 0),
                        'last_week': int(weekly.get('last_week') or 0),
                        'total_all': int(weekly.get('total_all') or 0),
                    },
                    'streak': streak,
                }
            }, 200
        except Exception as e:
            return {'success': False, 'error': str(e)}, 500
