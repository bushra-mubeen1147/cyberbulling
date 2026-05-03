import tweepy
from backend.utils.twitter_fetcher import parse_twitter_url, fetch_by_tweet_id, fetch_by_username
from backend.utils.classifier import classify_text
from backend.utils.helpers import format_response, format_error


def _aggregate(analyzed_tweets):
    n = len(analyzed_tweets)
    if n == 0:
        return {
            'total_tweets': 0, 'avg_toxicity': 0, 'avg_cyberbullying': 0,
            'toxic_tweet_count': 0, 'cyberbullying_tweet_count': 0, 'sarcasm_count': 0,
            'toxicity_rate': 0, 'cyberbullying_rate': 0, 'sarcasm_rate': 0,
            'max_toxicity': 0, 'max_cyberbullying': 0, 'sentiment_breakdown': {},
        }

    tox_scores = [t['analysis']['toxicity_score'] for t in analyzed_tweets]
    bully_scores = [t['analysis']['cyberbullying_prob'] for t in analyzed_tweets]
    sarcasm_count = sum(1 for t in analyzed_tweets if t['analysis']['sarcasm'])
    toxic_count = sum(1 for s in tox_scores if s > 0.5)
    bully_count = sum(1 for s in bully_scores if s > 0.5)

    sentiments = {}
    for t in analyzed_tweets:
        s = t['analysis']['sentiment']
        sentiments[s] = sentiments.get(s, 0) + 1

    return {
        'total_tweets': n,
        'avg_toxicity': round(sum(tox_scores) / n, 3),
        'avg_cyberbullying': round(sum(bully_scores) / n, 3),
        'toxic_tweet_count': toxic_count,
        'cyberbullying_tweet_count': bully_count,
        'sarcasm_count': sarcasm_count,
        'toxicity_rate': round(toxic_count / n, 3),
        'cyberbullying_rate': round(bully_count / n, 3),
        'sarcasm_rate': round(sarcasm_count / n, 3),
        'max_toxicity': round(max(tox_scores), 3),
        'max_cyberbullying': round(max(bully_scores), 3),
        'sentiment_breakdown': sentiments,
    }


class TwitterController:
    @staticmethod
    def analyze_url(data):
        url = (data.get('url') or '').strip()
        if not url:
            return format_error('Twitter/X URL is required.', 400)

        parsed = parse_twitter_url(url)
        if not parsed:
            return format_error(
                'Invalid Twitter/X URL. Paste a tweet link like '
                'https://twitter.com/username/status/123 or a profile URL.', 400
            )

        try:
            if parsed['type'] == 'tweet':
                raw = fetch_by_tweet_id(parsed['tweet_id'], url)
            else:
                raw = fetch_by_username(parsed['username'])

            if not raw:
                return format_error(
                    'Twitter data not found. The account may be private or the tweet deleted.', 404
                )

            analyzed_tweets = []
            for tweet in raw['tweets']:
                analysis = classify_text(tweet['text'])
                analyzed_tweets.append({**tweet, 'analysis': analysis})

            featured = None
            if raw.get('featured_tweet'):
                featured = {
                    **raw['featured_tweet'],
                    'analysis': classify_text(raw['featured_tweet']['text']),
                }

            timeline_note = raw.get('timeline_note')
            note_msg = None
            if timeline_note in ('timeline_access_denied', 'timeline_requires_paid_tier'):
                note_msg = 'Tweet history requires Twitter API Basic access. Showing the featured tweet only.'
            elif timeline_note == 'unauthorized':
                note_msg = 'Twitter API credentials are invalid or expired. Check your Bearer Token.'
            elif timeline_note == 'timeline_unavailable':
                note_msg = 'Could not load tweet history. Showing the featured tweet only.'

            return format_response({
                'url': url,
                'author': raw.get('author'),
                'featured_tweet': featured,
                'tweets': analyzed_tweets,
                'aggregate': _aggregate(analyzed_tweets),
                'note': note_msg,
            }, 'Twitter analysis completed successfully')

        except RuntimeError as e:
            return format_error(str(e), 503)
        except tweepy.Unauthorized:
            return format_error('Twitter API credentials are invalid. Please check your Bearer Token.', 401)
        except tweepy.Forbidden:
            return format_error('Twitter API access denied. Your API plan may not support this operation.', 403)
        except tweepy.TooManyRequests:
            return format_error('Twitter API rate limit reached. Please try again in a few minutes.', 429)
        except tweepy.NotFound:
            return format_error('Tweet or user not found on Twitter.', 404)
        except tweepy.TweepyException as e:
            return format_error(f'Twitter API error: {str(e)}', 502)
        except Exception as e:
            return format_error(f'Twitter analysis failed: {str(e)}', 500)
