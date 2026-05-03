import re
import tweepy
from flask_jwt_extended import get_jwt_identity
from backend.models.monitored_profile import MonitoredProfile
from backend.models.analysis_history import AnalysisHistory
from backend.utils.helpers import format_response, format_error
from backend.utils.twitter_fetcher import fetch_nitter_rss, fetch_by_username
from backend.utils.classifier import classify_text
from database.connection import get_db_connection


def _parse_username(value: str):
    value = value.strip()
    m = re.search(r'(?:twitter\.com|x\.com)/([^/?#\s]+)', value)
    if m:
        username = m.group(1)
    elif value.startswith('@'):
        username = value[1:]
    else:
        username = value

    username = username.lower().strip()
    _reserved = {'home', 'explore', 'notifications', 'messages', 'settings',
                 'i', 'search', 'compose', 'intent', 'share', 'oauth', 'status'}
    if not username or username in _reserved:
        return None
    if not re.match(r'^[a-z0-9_]{1,50}$', username, re.I):
        return None
    return username


def _get_analyzed_tweets(user_id, username):
    uname = username.lower()
    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute(
                '''SELECT id, input_text, toxicity_score, cyberbullying_prob,
                          result_sarcasm, sentiment, tweet_url, created_at
                   FROM analysis_history
                   WHERE user_id = %s
                     AND (LOWER(tweet_url) LIKE %s OR LOWER(tweet_url) LIKE %s)
                   ORDER BY created_at DESC''',
                (user_id,
                 f'%twitter.com/{uname}/status/%',
                 f'%x.com/{uname}/status/%')
            )
            rows = cur.fetchall()
            result = []
            for r in rows:
                row = dict(r)
                if row.get('created_at'):
                    row['created_at'] = row['created_at'].isoformat()
                result.append(row)
            return result
        finally:
            cur.close()


def _serialize_profile(p):
    return {
        **p,
        'added_at': p['added_at'].isoformat() if p.get('added_at') else None,
        'last_checked_at': p['last_checked_at'].isoformat() if p.get('last_checked_at') else None,
    }


class VictimController:

    @staticmethod
    def add_victim(data):
        user_id = get_jwt_identity()
        value = (data.get('username') or data.get('url') or '').strip()
        if not value:
            return format_error('Twitter username or URL is required.', 400)

        username = _parse_username(value)
        if not username:
            return format_error('Invalid Twitter username or URL.', 400)

        profile = MonitoredProfile.create(int(user_id), username, data.get('display_name'))
        return format_response(_serialize_profile(profile), f'Now monitoring @{username}', 201)

    @staticmethod
    def list_victims():
        user_id = get_jwt_identity()
        profiles = MonitoredProfile.get_by_user(int(user_id))

        result = []
        for p in profiles:
            tweets = _get_analyzed_tweets(int(user_id), p['twitter_username'])
            result.append({
                **_serialize_profile(p),
                'tweet_count': len(tweets),
            })
        return format_response(result)

    @staticmethod
    def remove_victim(victim_id):
        user_id = get_jwt_identity()
        deleted = MonitoredProfile.delete(int(victim_id), int(user_id))
        if not deleted:
            return format_error('Victim profile not found.', 404)
        return format_response({'id': victim_id}, 'Removed from monitoring')

    @staticmethod
    def get_victim_tweets(victim_id):
        user_id = get_jwt_identity()
        profile = MonitoredProfile.get_by_id(int(victim_id), int(user_id))
        if not profile:
            return format_error('Victim profile not found.', 404)

        tweets = _get_analyzed_tweets(int(user_id), profile['twitter_username'])
        return format_response({
            'profile': _serialize_profile(profile),
            'tweets': tweets,
        })

    @staticmethod
    def check_new_tweets(victim_id):
        user_id = get_jwt_identity()
        profile = MonitoredProfile.get_by_id(int(victim_id), int(user_id))
        if not profile:
            return format_error('Victim profile not found.', 404)

        username = profile['twitter_username']

        # ── Step 1: try Nitter RSS (free, no API key needed) ──────────────────
        raw_tweets = fetch_nitter_rss(username)

        # ── Step 2: fall back to paid Twitter API if Nitter failed ────────────
        if raw_tweets is None:
            try:
                raw = fetch_by_username(username)
                if raw:
                    raw_tweets = [
                        {
                            'id':         t['id'],
                            'text':       t['text'],
                            'created_at': t.get('created_at'),
                            'tweet_url':  f'https://twitter.com/{username}/status/{t["id"]}',
                        }
                        for t in (raw.get('tweets') or [])
                    ]
            except Exception:
                pass

        if not raw_tweets:
            MonitoredProfile.update_last_checked(int(victim_id))
            return format_response({
                'new_tweets': [],
                'note': 'Could not reach any data source. The profile may be private or temporarily unavailable.',
            }, 'Check complete')

        existing  = _get_analyzed_tweets(int(user_id), username)
        seen_urls = {t['tweet_url'] for t in existing if t.get('tweet_url')}

        new_tweets = []
        for tweet in raw_tweets:
            url = tweet.get('tweet_url') or f'https://twitter.com/{username}/status/{tweet["id"]}'
            if url in seen_urls:
                continue
            analysis = classify_text(tweet['text'])
            AnalysisHistory.create(
                int(user_id),
                tweet['text'],
                analysis['toxicity_score'],
                analysis['cyberbullying_prob'],
                analysis['sarcasm'],
                analysis['sentiment'],
                url,
            )
            new_tweets.append({
                'text':       tweet['text'],
                'tweet_url':  url,
                'created_at': tweet.get('created_at'),
                'analysis':   analysis,
            })

        MonitoredProfile.update_last_checked(int(victim_id))
        return format_response({
            'new_tweets':    new_tweets,
            'total_checked': len(raw_tweets),
            'note':          None,
        }, f'Found {len(new_tweets)} new tweet(s)')
