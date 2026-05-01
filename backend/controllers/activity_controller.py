from flask import request, jsonify
from datetime import datetime, timedelta
import random

class ActivityController:
    @staticmethod
    def get_user_activities(user_id):
        """Get all activities for a user"""
        try:
            from database.connection import supabase_client
            
            activities = supabase_client.table('activities').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            
            return {
                'success': True,
                'data': activities.data,
                'count': len(activities.data)
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
            from database.connection import supabase_client
            
            activity_data = {
                'user_id': user_id,
                'type': activity_type,
                'description': description,
                'metadata': metadata,
                'created_at': datetime.utcnow().isoformat()
            }
            
            result = supabase_client.table('activities').insert(activity_data).execute()
            
            return {
                'success': True,
                'data': result.data[0] if result.data else None
            }, 201
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500

    @staticmethod
    def get_dashboard_summary(user_id):
        """Get dashboard summary with recent activities"""
        try:
            from database.connection import supabase_client
            
            # Get recent analyses
            analyses = supabase_client.table('analysis_history').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(5).execute()
            
            # Get recent alerts
            alerts = supabase_client.table('alerts').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(5).execute()
            
            # Get activity count
            total_analyses = supabase_client.table('analysis_history').select('id').eq('user_id', user_id).execute()
            
            return {
                'success': True,
                'data': {
                    'recent_analyses': analyses.data,
                    'recent_alerts': alerts.data,
                    'total_analyses': len(total_analyses.data),
                    'timestamp': datetime.utcnow().isoformat()
                }
            }, 200
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500
