from flask_jwt_extended import get_jwt_identity
from database.connection import get_db_connection
from backend.utils.helpers import format_response, format_error


class ContactController:
    @staticmethod
    def send_contact_message(data):
        """Save contact form message to the database"""
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        category = data.get('category', 'general')

        if not all([name, email, message]):
            return format_error('Name, email, and message are required', 400)

        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    '''INSERT INTO contact_messages (name, email, subject, message, category)
                       VALUES (%s, %s, %s, %s, %s)
                       RETURNING id, name, email, subject, message, category, created_at''',
                    (name, email, subject or 'No subject', message, category)
                )
                row = cur.fetchone()
                conn.commit()

            result = dict(row)
            result['created_at'] = result['created_at'].isoformat() if result.get('created_at') else None

            return format_response(result, 'Your message has been received. We will get back to you soon.', 201)
        except Exception as e:
            return format_error(f'Failed to send message: {str(e)}', 500)

    @staticmethod
    def send_support_ticket(data):
        """Save support ticket to the database"""
        user_id = get_jwt_identity()
        title = (data.get('title') or data.get('subject') or '').strip()
        description = (data.get('description') or data.get('message') or '').strip()
        priority = data.get('priority', 'medium')
        category = data.get('category', 'general')
        ticket_type = data.get('type', 'feedback')

        if not all([title, description]):
            return format_error('Title and description are required', 400)

        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    '''INSERT INTO support_tickets (user_id, title, description, type, priority, category, status)
                       VALUES (%s, %s, %s, %s, %s, %s, 'open')
                       RETURNING id, user_id, title, description, type, priority, category, status, created_at''',
                    (user_id, title, description, ticket_type, priority, category)
                )
                row = cur.fetchone()
                conn.commit()

            result = dict(row)
            result['created_at'] = result['created_at'].isoformat() if result.get('created_at') else None

            return format_response(result, 'Support ticket created successfully', 201)
        except Exception as e:
            return format_error(f'Failed to create support ticket: {str(e)}', 500)
