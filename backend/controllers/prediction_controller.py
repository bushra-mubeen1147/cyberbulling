from flask_jwt_extended import get_jwt_identity
from backend.utils.helpers import format_response, format_error
from backend.utils.prediction_engine import predict_behavior
from backend.utils.ai_predictor import analyze_victim_with_ai
from database.connection import get_db_connection


def _fetch_history_by_username(user_id: int, username: str) -> list:
    uname = username.lower()
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            '''
            SELECT toxicity_score, cyberbullying_prob, sentiment,
                   result_sarcasm, input_text, tweet_url, created_at
            FROM   analysis_history
            WHERE  user_id = %s
              AND  (LOWER(tweet_url) LIKE %s OR LOWER(tweet_url) LIKE %s)
            ORDER  BY created_at ASC
            ''',
            (user_id,
             f'%twitter.com/{uname}/status/%',
             f'%x.com/{uname}/status/%'),
        )
        rows = cur.fetchall()

    records = []
    for r in rows:
        row = dict(r)
        if row.get('created_at') and hasattr(row['created_at'], 'isoformat'):
            row['created_at'] = row['created_at'].isoformat()
        records.append(row)
    return records


class PredictionController:

    @staticmethod
    def get_victim_prediction(victim_id: int):
        """
        Generate a statistical + AI-powered behavioral prediction for a monitored victim.
        """
        try:
            user_id = int(get_jwt_identity())

            # Verify this victim belongs to the current user
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    'SELECT id, twitter_username, display_name FROM monitored_profiles '
                    'WHERE id = %s AND user_id = %s',
                    (victim_id, user_id),
                )
                profile = cur.fetchone()

            if not profile:
                return format_error('Victim profile not found.', 404)

            profile = dict(profile)
            username = profile['twitter_username']

            records = _fetch_history_by_username(user_id, username)

            if not records:
                return format_response(
                    {
                        'insufficient_data': True,
                        'data_points': 0,
                        'min_required': 3,
                        'message': (
                            f'No analyzed tweets found for @{username}. '
                            'Use the "Check for New Tweets" button on the Victim Monitoring page first.'
                        ),
                        'victim': profile,
                    },
                    'No data available',
                    200,
                )

            # ── Statistical prediction ─────────────────────────────────────────
            result = predict_behavior(records)

            if result.get('insufficient_data'):
                result['victim'] = profile
                return format_response(result, 'Insufficient data', 200)

            # ── AI enrichment via Gemini ───────────────────────────────────────
            ai_insights = analyze_victim_with_ai(
                username=username,
                tweets=records,
                stats=result['stats'],
                risk_level=result['risk_level'],
                trend_direction=result['trend_direction'],
            )

            result['victim'] = profile
            result['ai_insights'] = ai_insights   # None if API unavailable / failed

            return format_response(result, 'Prediction generated successfully', 200)

        except Exception as exc:
            return format_error(f'Failed to generate prediction: {exc}', 500)
