from flask_jwt_extended import get_jwt_identity
from backend.models.user import User
from backend.models.analysis_history import AnalysisHistory
from backend.utils.helpers import format_response, format_error
from database.connection import get_db_connection


def _require_admin():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(int(current_user_id))
    if not current_user or current_user['role'] != 'admin':
        return None, format_error('Admin access required', 403)
    return current_user, None


class AdminController:

    @staticmethod
    def get_all_users():
        _, err = _require_admin()
        if err:
            return err
        try:
            users = User.get_all()
            for u in users:
                if u.get('created_at'):
                    u['created_at'] = u['created_at'].isoformat()
            return format_response(users)
        except Exception as e:
            return format_error(f'Failed to fetch users: {str(e)}', 500)

    @staticmethod
    def get_all_history():
        _, err = _require_admin()
        if err:
            return err
        try:
            history = AnalysisHistory.get_all()
            for item in history:
                if item.get('created_at'):
                    item['created_at'] = item['created_at'].isoformat()
            return format_response(history)
        except Exception as e:
            return format_error(f'Failed to fetch history: {str(e)}', 500)

    @staticmethod
    def delete_user(user_id):
        current_user, err = _require_admin()
        if err:
            return err
        if current_user['id'] == user_id:
            return format_error('Cannot delete your own account', 400)
        try:
            deleted = User.delete(user_id)
            if deleted:
                return format_response({'id': user_id}, 'User deleted successfully')
            return format_error('User not found', 404)
        except Exception as e:
            return format_error(f'Failed to delete user: {str(e)}', 500)

    @staticmethod
    def get_stats():
        _, err = _require_admin()
        if err:
            return err
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()

                cur.execute("""
                    SELECT COUNT(*) as total,
                           SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END) as today
                    FROM users
                """)
                users_row = dict(cur.fetchone())

                cur.execute("""
                    SELECT COUNT(*) as total,
                           SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END) as today,
                           SUM(CASE WHEN toxicity_score > 0.5 OR cyberbullying_prob > 0.5 THEN 1 ELSE 0 END) as flagged,
                           SUM(CASE WHEN (toxicity_score > 0.5 OR cyberbullying_prob > 0.5)
                                    AND created_at::date = CURRENT_DATE THEN 1 ELSE 0 END) as flagged_today
                    FROM analysis_history
                """)
                analysis_row = dict(cur.fetchone())

                cur.execute("SELECT COUNT(*) as total FROM contact_messages WHERE created_at::date = CURRENT_DATE")
                contact_row = dict(cur.fetchone())

                cur.execute("SELECT COUNT(*) as open FROM support_tickets WHERE status = 'open'")
                tickets_row = dict(cur.fetchone())

                cur.execute("SELECT COUNT(*) as total FROM admin_notifications WHERE created_at::date = CURRENT_DATE")
                notifs_row = dict(cur.fetchone())

            total_analyses = int(analysis_row.get('total') or 0)
            total_flagged = int(analysis_row.get('flagged') or 0)
            detection_rate = round((total_flagged / total_analyses * 100) if total_analyses > 0 else 0, 1)

            return format_response({
                'users': {
                    'total': int(users_row.get('total') or 0),
                    'today': int(users_row.get('today') or 0),
                },
                'analyses': {
                    'total': total_analyses,
                    'today': int(analysis_row.get('today') or 0),
                },
                'flagged': {
                    'total': total_flagged,
                    'today': int(analysis_row.get('flagged_today') or 0),
                },
                'detection_rate': detection_rate,
                'open_tickets': int(tickets_row.get('open') or 0),
                'messages_today': int(contact_row.get('total') or 0),
                'notifications_today': int(notifs_row.get('total') or 0),
            })
        except Exception as e:
            return format_error(f'Failed to fetch stats: {str(e)}', 500)

    @staticmethod
    def get_user_details(user_id):
        _, err = _require_admin()
        if err:
            return err
        try:
            user = User.find_by_id(user_id)
            if not user:
                return format_error('User not found', 404)
            if user.get('created_at'):
                user['created_at'] = user['created_at'].isoformat()
            user.pop('password_hash', None)

            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute("""
                    SELECT COUNT(*) as total,
                           SUM(CASE WHEN toxicity_score > 0.5 OR cyberbullying_prob > 0.5 THEN 1 ELSE 0 END) as flagged,
                           ROUND(COALESCE(AVG(toxicity_score), 0)::numeric, 3) as avg_toxicity,
                           MAX(created_at) as last_active,
                           SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
                           SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative
                    FROM analysis_history WHERE user_id = %s
                """, (user_id,))
                stats = dict(cur.fetchone())

                cur.execute("""
                    SELECT id, input_text, toxicity_score, cyberbullying_prob, sentiment, created_at
                    FROM analysis_history WHERE user_id = %s
                    ORDER BY created_at DESC LIMIT 5
                """, (user_id,))
                recent = [dict(r) for r in cur.fetchall()]

                cur.execute("""
                    SELECT DATE(created_at) as day, COUNT(*) as count
                    FROM analysis_history WHERE user_id = %s
                    AND created_at >= NOW() - INTERVAL '14 days'
                    GROUP BY DATE(created_at) ORDER BY day ASC
                """, (user_id,))
                activity = [{'day': dict(r)['day'].isoformat(), 'count': int(dict(r)['count'] or 0)} for r in cur.fetchall()]

            stats['total'] = int(stats.get('total') or 0)
            stats['flagged'] = int(stats.get('flagged') or 0)
            stats['avg_toxicity'] = round(float(stats.get('avg_toxicity') or 0) * 100, 1)
            stats['positive'] = int(stats.get('positive') or 0)
            stats['negative'] = int(stats.get('negative') or 0)
            stats['last_active'] = stats['last_active'].isoformat() if stats.get('last_active') else None

            for r in recent:
                if r.get('created_at'):
                    r['created_at'] = r['created_at'].isoformat()
                r['toxicity_score'] = float(r.get('toxicity_score') or 0)
                r['cyberbullying_prob'] = float(r.get('cyberbullying_prob') or 0)

            return format_response({'user': user, 'stats': stats, 'recent': recent, 'activity': activity})
        except Exception as e:
            return format_error(f'Failed to fetch user details: {str(e)}', 500)

    @staticmethod
    def get_analytics(days=7):
        _, err = _require_admin()
        if err:
            return err
        days = max(1, min(int(days), 90))
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()

                cur.execute(f"""
                    SELECT DATE(created_at) as day,
                           COUNT(*) as total,
                           SUM(CASE WHEN toxicity_score > 0.5 OR cyberbullying_prob > 0.5 THEN 1 ELSE 0 END) as flagged,
                           SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
                           SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
                           SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral
                    FROM analysis_history
                    WHERE created_at >= NOW() - INTERVAL '{days} days'
                    GROUP BY DATE(created_at)
                    ORDER BY day ASC
                """)
                daily_rows = [dict(r) for r in cur.fetchall()]

                cur.execute(f"""
                    SELECT DATE(created_at) as day, COUNT(*) as count
                    FROM users
                    WHERE created_at >= NOW() - INTERVAL '{days} days'
                    GROUP BY DATE(created_at)
                    ORDER BY day ASC
                """)
                reg_map = {}
                for r in cur.fetchall():
                    d = dict(r)
                    reg_map[d['day'].isoformat()] = int(d.get('count') or 0)

                cur.execute("""
                    SELECT sentiment, COUNT(*) as count
                    FROM analysis_history
                    GROUP BY sentiment
                """)
                sentiment_dist = [dict(r) for r in cur.fetchall()]

            daily = []
            for r in daily_rows:
                day_str = r['day'].isoformat()
                daily.append({
                    'day': day_str,
                    'label': r['day'].strftime('%a %d'),
                    'total': int(r.get('total') or 0),
                    'flagged': int(r.get('flagged') or 0),
                    'positive': int(r.get('positive') or 0),
                    'negative': int(r.get('negative') or 0),
                    'neutral': int(r.get('neutral') or 0),
                    'new_users': reg_map.get(day_str, 0),
                })

            for s in sentiment_dist:
                s['count'] = int(s.get('count') or 0)

            return format_response({'daily': daily, 'sentiment_dist': sentiment_dist})
        except Exception as e:
            return format_error(f'Failed to fetch analytics: {str(e)}', 500)

    @staticmethod
    def send_notification(data):
        current_user, err = _require_admin()
        if err:
            return err

        title = (data.get('title') or '').strip()
        message = (data.get('message') or '').strip()
        notif_type = data.get('type', 'info')
        recipient_id = data.get('recipient_id')

        if not title or not message:
            return format_error('Title and message are required', 400)
        if notif_type not in ('info', 'warning', 'success', 'alert'):
            notif_type = 'info'

        severity_map = {'info': 'low', 'warning': 'high', 'success': 'low', 'alert': 'critical'}
        severity = severity_map[notif_type]
        content = f"{title}\n\n{message}"

        try:
            with get_db_connection() as conn:
                cur = conn.cursor()

                cur.execute("""
                    INSERT INTO admin_notifications (sender_id, recipient_id, title, message, type)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, created_at
                """, (current_user['id'], recipient_id if recipient_id else None, title, message, notif_type))
                notif_row = dict(cur.fetchone())

                if recipient_id:
                    cur.execute("""
                        INSERT INTO alerts (user_id, alert_type, content, severity)
                        VALUES (%s, 'admin_notification', %s, %s)
                    """, (recipient_id, content, severity))
                else:
                    cur.execute("SELECT id FROM users")
                    all_users = cur.fetchall()
                    for u in all_users:
                        cur.execute("""
                            INSERT INTO alerts (user_id, alert_type, content, severity)
                            VALUES (%s, 'admin_notification', %s, %s)
                        """, (u['id'], content, severity))

                conn.commit()

            notif_row['created_at'] = notif_row['created_at'].isoformat()
            return format_response(notif_row, 'Notification sent successfully', 201)
        except Exception as e:
            return format_error(f'Failed to send notification: {str(e)}', 500)

    @staticmethod
    def get_notifications():
        _, err = _require_admin()
        if err:
            return err
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute("""
                    SELECT an.id, an.title, an.message, an.type, an.created_at,
                           u.name as recipient_name, u.email as recipient_email
                    FROM admin_notifications an
                    LEFT JOIN users u ON an.recipient_id = u.id
                    ORDER BY an.created_at DESC
                    LIMIT 200
                """)
                rows = [dict(r) for r in cur.fetchall()]
                for r in rows:
                    if r.get('created_at'):
                        r['created_at'] = r['created_at'].isoformat()
            return format_response(rows)
        except Exception as e:
            return format_error(f'Failed to fetch notifications: {str(e)}', 500)

    @staticmethod
    def delete_notification(notif_id):
        _, err = _require_admin()
        if err:
            return err
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute("DELETE FROM admin_notifications WHERE id = %s RETURNING id", (notif_id,))
                deleted = cur.fetchone()
                conn.commit()
            if deleted:
                return format_response({'id': notif_id}, 'Notification deleted')
            return format_error('Notification not found', 404)
        except Exception as e:
            return format_error(f'Failed to delete notification: {str(e)}', 500)

    @staticmethod
    def change_user_role(user_id, data):
        current_user, err = _require_admin()
        if err:
            return err
        new_role = data.get('role')
        if new_role not in ('user', 'admin'):
            return format_error('Role must be "user" or "admin"', 400)
        if current_user['id'] == user_id:
            return format_error('Cannot change your own role', 400)
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute("""
                    UPDATE users SET role = %s, updated_at = NOW()
                    WHERE id = %s
                    RETURNING id, name, email, role
                """, (new_role, user_id))
                row = cur.fetchone()
                conn.commit()
            if row:
                return format_response(dict(row), f'Role updated to {new_role}')
            return format_error('User not found', 404)
        except Exception as e:
            return format_error(f'Failed to change role: {str(e)}', 500)

    @staticmethod
    def get_reports():
        _, err = _require_admin()
        if err:
            return err
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()

                cur.execute("""
                    SELECT id, name, email, subject, message, category, created_at
                    FROM contact_messages
                    ORDER BY created_at DESC
                    LIMIT 100
                """)
                contacts = [dict(r) for r in cur.fetchall()]
                for r in contacts:
                    if r.get('created_at'):
                        r['created_at'] = r['created_at'].isoformat()

                cur.execute("""
                    SELECT st.id, st.title, st.description, st.type, st.priority,
                           st.category, st.status, st.created_at,
                           u.name as user_name, u.email as user_email
                    FROM support_tickets st
                    LEFT JOIN users u ON st.user_id = u.id
                    ORDER BY st.created_at DESC
                    LIMIT 100
                """)
                tickets = [dict(r) for r in cur.fetchall()]
                for r in tickets:
                    if r.get('created_at'):
                        r['created_at'] = r['created_at'].isoformat()

            return format_response({'contacts': contacts, 'tickets': tickets})
        except Exception as e:
            return format_error(f'Failed to fetch reports: {str(e)}', 500)

    @staticmethod
    def update_ticket_status(ticket_id, data):
        _, err = _require_admin()
        if err:
            return err
        status = data.get('status')
        if status not in ('open', 'in_progress', 'resolved', 'closed'):
            return format_error('Invalid status', 400)
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute("""
                    UPDATE support_tickets SET status = %s WHERE id = %s
                    RETURNING id, status
                """, (status, ticket_id))
                row = cur.fetchone()
                conn.commit()
            if row:
                return format_response(dict(row), 'Ticket status updated')
            return format_error('Ticket not found', 404)
        except Exception as e:
            return format_error(f'Failed to update ticket: {str(e)}', 500)

    @staticmethod
    def delete_history_item(history_id):
        _, err = _require_admin()
        if err:
            return err
        try:
            deleted = AnalysisHistory.delete(history_id)
            if deleted:
                return format_response({'id': history_id}, 'Record deleted')
            return format_error('Record not found', 404)
        except Exception as e:
            return format_error(f'Failed to delete record: {str(e)}', 500)
