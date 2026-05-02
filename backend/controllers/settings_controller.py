from flask_jwt_extended import get_jwt_identity
from database.connection import get_db_connection
from backend.utils.helpers import format_response, format_error


class SettingsController:
    @staticmethod
    def save_user_settings(data):
        """Save user dashboard settings to the database"""
        user_id = get_jwt_identity()

        theme = data.get('theme', 'dark')
        notifications_enabled = data.get('notifications_enabled', True)
        email_alerts = data.get('email_alerts', True)
        auto_save = data.get('auto_save', True)
        privacy_mode = data.get('privacy_mode', False)
        data_collection = data.get('data_collection', True)
        api_rate_limit = data.get('api_rate_limit', 'standard')
        analysis_threshold = data.get('analysis_threshold', 'medium')
        profile_visibility = data.get('profile_visibility', 'private')
        share_analytics = data.get('share_analytics', False)
        data_retention = data.get('data_retention', '90days')
        weekly_reports = data.get('weekly_reports', False)
        push_notifications = data.get('push_notifications', True)
        product_updates = data.get('product_updates', True)
        security_alerts = data.get('security_alerts', True)
        analysis_complete = data.get('analysis_complete', True)
        high_risk_alerts = data.get('high_risk_alerts', True)

        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute('''
                    INSERT INTO user_settings
                        (user_id, theme, notifications_enabled, email_alerts, auto_save,
                         privacy_mode, data_collection, api_rate_limit, analysis_threshold,
                         profile_visibility, share_analytics, data_retention, weekly_reports,
                         push_notifications, product_updates, security_alerts, analysis_complete,
                         high_risk_alerts, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (user_id) DO UPDATE SET
                        theme = EXCLUDED.theme,
                        notifications_enabled = EXCLUDED.notifications_enabled,
                        email_alerts = EXCLUDED.email_alerts,
                        auto_save = EXCLUDED.auto_save,
                        privacy_mode = EXCLUDED.privacy_mode,
                        data_collection = EXCLUDED.data_collection,
                        api_rate_limit = EXCLUDED.api_rate_limit,
                        analysis_threshold = EXCLUDED.analysis_threshold,
                        profile_visibility = EXCLUDED.profile_visibility,
                        share_analytics = EXCLUDED.share_analytics,
                        data_retention = EXCLUDED.data_retention,
                        weekly_reports = EXCLUDED.weekly_reports,
                        push_notifications = EXCLUDED.push_notifications,
                        product_updates = EXCLUDED.product_updates,
                        security_alerts = EXCLUDED.security_alerts,
                        analysis_complete = EXCLUDED.analysis_complete,
                        high_risk_alerts = EXCLUDED.high_risk_alerts,
                        updated_at = NOW()
                    RETURNING *
                ''', (user_id, theme, notifications_enabled, email_alerts, auto_save,
                      privacy_mode, data_collection, api_rate_limit, analysis_threshold,
                      profile_visibility, share_analytics, data_retention, weekly_reports,
                      push_notifications, product_updates, security_alerts, analysis_complete,
                      high_risk_alerts))
                row = cur.fetchone()
                conn.commit()
                settings = dict(row)
                if settings.get('updated_at'):
                    settings['updated_at'] = settings['updated_at'].isoformat()

            return format_response(settings, 'Settings saved successfully')
        except Exception as e:
            return format_error(f'Failed to save settings: {str(e)}', 500)

    @staticmethod
    def get_user_settings():
        """Get user dashboard settings from the database"""
        user_id = get_jwt_identity()

        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute('SELECT * FROM user_settings WHERE user_id = %s', (user_id,))
                row = cur.fetchone()

            if row:
                settings = dict(row)
                if settings.get('updated_at'):
                    settings['updated_at'] = settings['updated_at'].isoformat()
            else:
                settings = {
                    'theme': 'dark',
                    'notifications_enabled': True,
                    'email_alerts': True,
                    'auto_save': True,
                    'privacy_mode': False,
                    'data_collection': True,
                    'api_rate_limit': 'standard',
                    'analysis_threshold': 'medium',
                    'profile_visibility': 'private',
                    'share_analytics': False,
                    'data_retention': '90days',
                    'weekly_reports': False,
                    'push_notifications': True,
                    'product_updates': True,
                    'security_alerts': True,
                    'analysis_complete': True,
                    'high_risk_alerts': True,
                }

            return format_response(settings, 'Settings retrieved successfully')
        except Exception as e:
            return format_error(f'Failed to retrieve settings: {str(e)}', 500)
