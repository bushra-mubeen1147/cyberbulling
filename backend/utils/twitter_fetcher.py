import re
import os
import html
import json
import xml.etree.ElementTree as ET
import urllib.request
import urllib.parse
from email.utils import parsedate_to_datetime
import tweepy

# Nitter instances tried in order — first one that responds wins
_NITTER_INSTANCES = [
    'https://nitter.privacyredirect.com',
    'https://nitter.poast.org',
    'https://nitter.d420.de',
    'https://nitter.1d4.us',
    'https://nitter.net',
]


def fetch_nitter_rss(username: str):
    """
    Fetch a user's recent tweets via Nitter RSS (free, no API key needed).
    Tries multiple public Nitter instances; returns a list of tweet dicts or None.
    Each dict has: id, text, tweet_url, created_at.
    Retweets are excluded.
    """
    username = username.lower().strip('@')

    for base in _NITTER_INSTANCES:
        try:
            rss_url = f'{base}/{username}/rss'
            req = urllib.request.Request(
                rss_url,
                headers={'User-Agent': 'Mozilla/5.0 (compatible; RSS/2.0)'},
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status != 200:
                    continue
                raw_xml = resp.read().decode('utf-8', errors='replace')

            root = ET.fromstring(raw_xml)
            channel = root.find('channel')
            if channel is None:
                continue

            tweets = []
            for item in channel.findall('item'):
                title_el = item.find('title')
                link_el  = item.find('link')
                desc_el  = item.find('description')
                date_el  = item.find('pubDate')

                if link_el is None:
                    continue

                # Skip retweets
                title_text = (title_el.text or '') if title_el is not None else ''
                if title_text.startswith('RT by '):
                    continue

                nitter_url = link_el.text or ''
                id_match = re.search(r'/status/(\d+)', nitter_url)
                if not id_match:
                    continue
                tweet_id = id_match.group(1)

                # Prefer description (has full text) over title
                raw_text = ''
                if desc_el is not None and desc_el.text:
                    raw_text = desc_el.text
                elif title_el is not None and title_el.text:
                    raw_text = title_el.text

                clean = html.unescape(re.sub(r'<[^>]+>', ' ', raw_text))
                clean = re.sub(r'\s+', ' ', clean).strip()
                if not clean:
                    continue

                created_at = None
                if date_el is not None and date_el.text:
                    try:
                        created_at = parsedate_to_datetime(date_el.text).isoformat()
                    except Exception:
                        pass

                tweets.append({
                    'id':         tweet_id,
                    'text':       clean,
                    'tweet_url':  f'https://twitter.com/{username}/status/{tweet_id}',
                    'created_at': created_at,
                    'metrics':    {},
                })

            if tweets:
                return tweets   # First working instance wins

        except Exception:
            continue            # Try next instance

    return None                 # All instances failed


# ── Twitter oEmbed (free, no API key needed) ─────────────────────────────────

def _oembed_fetch(tweet_url: str):
    """
    Use Twitter's public oEmbed endpoint to get tweet text without API auth.
    Works on the free tier — no credentials required.
    """
    try:
        encoded = urllib.parse.quote(tweet_url, safe='')
        url = f'https://publish.twitter.com/oembed?url={encoded}&omit_script=true'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))

        # Extract plain text from the HTML snippet
        raw_html = data.get('html', '')
        p_match = re.search(r'<p[^>]*>(.*?)</p>', raw_html, re.DOTALL)
        tweet_text = ''
        if p_match:
            tweet_text = re.sub(r'<[^>]+>', ' ', p_match.group(1))
            tweet_text = html.unescape(tweet_text)
            tweet_text = re.sub(r'\s+', ' ', tweet_text).strip()

        author_url = data.get('author_url', '')
        username = author_url.rstrip('/').split('/')[-1] if author_url else ''

        return {
            'author_name': data.get('author_name', ''),
            'username': username,
            'tweet_text': tweet_text,
        }
    except Exception:
        return None


# ── Twitter API v2 (paid tier) ────────────────────────────────────────────────

def _get_client():
    bearer     = os.getenv('TWITTER_BEARER_TOKEN')
    api_key    = os.getenv('TWITTER_API_KEY')
    api_secret = os.getenv('TWITTER_API_SECRET')
    acc_token  = os.getenv('TWITTER_ACCESS_TOKEN') or None
    acc_secret = os.getenv('TWITTER_ACCESS_SECRET') or None

    if not any([bearer, api_key]):
        raise RuntimeError('Twitter API credentials are not configured.')

    return tweepy.Client(
        bearer_token=bearer,
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=acc_token,
        access_token_secret=acc_secret,
        wait_on_rate_limit=False,
    )


def _is_paid_error(exc):
    msg = str(exc).lower()
    return ('402' in msg or 'payment required' in msg or 'no credits' in msg
            or 'client-not-enrolled' in msg or 'not-enrolled' in msg)


def _serialize_tweet(t):
    metrics = {}
    if hasattr(t, 'public_metrics') and t.public_metrics:
        metrics = dict(t.public_metrics)
    return {
        'id': str(t.id),
        'text': t.text,
        'created_at': t.created_at.isoformat() if getattr(t, 'created_at', None) else None,
        'metrics': metrics,
    }


def _serialize_user(u):
    metrics = {}
    if hasattr(u, 'public_metrics') and u.public_metrics:
        metrics = dict(u.public_metrics)
    return {
        'id': str(u.id),
        'name': u.name,
        'username': u.username,
        'description': getattr(u, 'description', '') or '',
        'metrics': metrics,
    }


def _fetch_timeline(client, user_id):
    try:
        tl = client.get_users_tweets(
            user_id,
            max_results=50,
            tweet_fields=['created_at', 'text', 'public_metrics'],
            exclude=['retweets', 'replies'],
        )
        return (tl.data or []), None
    except Exception as e:
        if _is_paid_error(e):
            return [], 'timeline_requires_paid_tier'
        return [], 'timeline_unavailable'


# ── Public entry points ───────────────────────────────────────────────────────

def parse_twitter_url(url: str):
    url = url.strip()
    tweet_m = re.search(r'(?:twitter\.com|x\.com)/([^/?#]+)/status/(\d+)', url)
    if tweet_m:
        return {'type': 'tweet', 'username': tweet_m.group(1), 'tweet_id': tweet_m.group(2)}

    user_m = re.search(r'(?:twitter\.com|x\.com)/([^/?#]+)(?:[/?#].*)?$', url)
    if user_m:
        username = user_m.group(1)
        _reserved = {'home', 'explore', 'notifications', 'messages', 'settings',
                     'i', 'search', 'compose', 'intent', 'share', 'oauth'}
        if username.lower() not in _reserved:
            return {'type': 'user', 'username': username}
    return None


def fetch_by_tweet_id(tweet_id: str, original_url: str):
    """
    Fetch tweet data. Always succeeds for public tweets via oEmbed.
    Tries Twitter API v2 (paid) for richer data; falls back to oEmbed.
    """
    # Step 1 — try oEmbed (always free)
    oembed = _oembed_fetch(original_url)

    # Step 2 — try paid API for timeline + metrics
    try:
        client = _get_client()
        tweet_resp = client.get_tweet(
            tweet_id,
            expansions=['author_id'],
            tweet_fields=['created_at', 'text', 'public_metrics'],
            user_fields=['name', 'username', 'description', 'public_metrics'],
        )

        if tweet_resp.data:
            tweet = tweet_resp.data
            author = None
            if tweet_resp.includes and 'users' in tweet_resp.includes:
                author = tweet_resp.includes['users'][0]

            timeline_tweets, timeline_note = [], None
            if author:
                timeline_tweets, timeline_note = _fetch_timeline(client, author.id)

            return {
                'featured_tweet': _serialize_tweet(tweet),
                'author': _serialize_user(author) if author else None,
                'tweets': [_serialize_tweet(t) for t in timeline_tweets],
                'timeline_note': timeline_note,
                'source': 'api',
            }
    except Exception as e:
        if not _is_paid_error(e) and not isinstance(e, (tweepy.Forbidden, tweepy.Unauthorized)):
            raise

    # Step 3 — fall back to oEmbed result
    if not oembed:
        return None

    tweet_text = oembed['tweet_text']
    author_info = {
        'id': None,
        'name': oembed['author_name'],
        'username': oembed['username'],
        'description': '',
        'metrics': {},
    } if oembed['username'] else None

    return {
        'featured_tweet': {
            'id': tweet_id,
            'text': tweet_text,
            'created_at': None,
            'metrics': {},
        },
        'author': author_info,
        'tweets': [],
        'timeline_note': 'timeline_requires_paid_tier',
        'source': 'oembed',
    }


def fetch_by_username(username: str):
    """Fetch user profile + tweet history (requires paid Twitter API tier)."""
    try:
        client = _get_client()
        user_resp = client.get_user(
            username=username,
            user_fields=['name', 'username', 'description', 'public_metrics'],
        )
    except Exception as e:
        if _is_paid_error(e) or isinstance(e, (tweepy.Forbidden, tweepy.Unauthorized)):
            raise RuntimeError(
                'Reading user profiles requires Twitter API Basic access ($100/month). '
                'To use this feature, upgrade your plan at developer.twitter.com. '
                'Alternatively, paste a direct tweet URL to analyze a specific tweet for free.'
            )
        raise

    if not user_resp.data:
        return None

    user = user_resp.data
    timeline_tweets, timeline_note = _fetch_timeline(client, user.id)

    return {
        'featured_tweet': None,
        'author': _serialize_user(user),
        'tweets': [_serialize_tweet(t) for t in timeline_tweets],
        'timeline_note': timeline_note,
        'source': 'api',
    }
