import re
import time
import html as html_module
import urllib.request
import urllib.parse

_cache: dict = {}
CACHE_TTL = 15 * 60  # 15 minutes

# maps location key → URL path suffix (worldwide = root "/")
SUPPORTED_LOCATIONS = {
    'worldwide':      '',
    'united-states':  'united-states',
    'united-kingdom': 'united-kingdom',
    'pakistan':       'pakistan',
    'india':          'india',
    'australia':      'australia',
    'canada':         'canada',
    'germany':        'germany',
    'france':         'france',
    'japan':          'japan',
    'brazil':         'brazil',
    'south-africa':   'south-africa',
    'nigeria':        'nigeria',
}

LOCATION_LABELS = {
    'worldwide':      '🌍 Worldwide',
    'united-states':  '🇺🇸 United States',
    'united-kingdom': '🇬🇧 United Kingdom',
    'pakistan':       '🇵🇰 Pakistan',
    'india':          '🇮🇳 India',
    'australia':      '🇦🇺 Australia',
    'canada':         '🇨🇦 Canada',
    'germany':        '🇩🇪 Germany',
    'france':         '🇫🇷 France',
    'japan':          '🇯🇵 Japan',
    'brazil':         '🇧🇷 Brazil',
    'south-africa':   '🇿🇦 South Africa',
    'nigeria':        '🇳🇬 Nigeria',
}


def fetch_twitter_trends(location: str = 'worldwide'):
    """
    Fetch live Twitter trending topics via trends24.in.
    Results are in-memory cached for 15 minutes.
    Returns a dict with 'trends', 'location', 'fetched_at', 'cached', etc.
    Raises RuntimeError on network/parse failure.
    """
    loc = location.lower().strip()
    if loc not in SUPPORTED_LOCATIONS:
        loc = 'worldwide'

    now = time.time()
    if loc in _cache:
        cached_at, stored = _cache[loc]
        if now - cached_at < CACHE_TTL:
            return {**stored, 'cached': True, 'cache_age_seconds': int(now - cached_at)}

    slug = SUPPORTED_LOCATIONS[loc]
    url = f'https://trends24.in/{slug}/' if slug else 'https://trends24.in/'
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/124.0.0.0 Safari/537.36'
            ),
            'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'identity',
            'Connection':      'keep-alive',
            'Cache-Control':   'no-cache',
        })
        with urllib.request.urlopen(req, timeout=12) as resp:
            page_html = resp.read().decode('utf-8', errors='replace')
    except Exception as exc:
        raise RuntimeError(f'Could not reach trends data source: {exc}')

    trends = _parse_trends(page_html)
    if not trends:
        raise RuntimeError(
            'Could not extract trending topics — the source page may have changed layout. '
            'Try again later.'
        )

    result = {
        'trends':            trends,
        'location':          loc,
        'location_label':    LOCATION_LABELS.get(loc, loc),
        'source':            'trends24.in',
        'fetched_at':        int(now),
        'cached':            False,
        'cache_age_seconds': 0,
        'cache_ttl':         CACHE_TTL,
    }
    _cache[loc] = (now, {**result})
    return result


def _parse_trends(page_html: str):
    """
    Parse the first (most recent) trend-card list from trends24.in HTML.
    Returns up to 25 trend dicts: { rank, name, tweet_count, twitter_url }.
    Tries three extraction strategies for resilience against layout changes.
    """
    # ── Strategy 1: find <ol class="trend-card__list"> ───────────────────────
    list_html = None
    for pat in [
        r'<ol[^>]+class="[^"]*trend-card__list[^"]*"[^>]*>(.*?)</ol>',
        r'class="[^"]*trend-card[^"]*"[^>]*>.*?<ol[^>]*>(.*?)</ol>',
        r'<ol[^>]*>(.*?)</ol>',   # last resort: first ordered list on the page
    ]:
        m = re.search(pat, page_html, re.DOTALL | re.IGNORECASE)
        if m:
            list_html = m.group(1)
            break

    # ── Strategy 2: collect all trend-name links if no list found ────────────
    if not list_html:
        # trends24.in links look like  /india/trending-topics/some-name/
        names = re.findall(
            r'href="[^"]*trending-topics/[^"]*"[^>]*>\s*([^<]{2,80}?)\s*<',
            page_html, re.IGNORECASE
        )
        if not names:
            return []
        trends = []
        seen: set = set()
        for i, raw in enumerate(names[:25], 1):
            name = html_module.unescape(raw.strip())
            if name and name not in seen:
                seen.add(name)
                trends.append({
                    'rank':        i,
                    'name':        name,
                    'tweet_count': None,
                    'twitter_url': f'https://twitter.com/search?q={urllib.parse.quote_plus(name)}&src=trend_click',
                })
        return trends

    # ── Parse <li> items from the list block ─────────────────────────────────
    items = re.findall(r'<li[^>]*>(.*?)</li>', list_html, re.DOTALL | re.IGNORECASE)
    trends = []

    for rank, item_html in enumerate(items[:25], 1):
        # Trend name: try link text (may be nested in <span>), else strip all tags
        name = ''
        # Check for nested span inside anchor
        nested_m = re.search(r'<a[^>]*>.*?<span[^>]*>\s*([^<]+?)\s*</span>', item_html, re.DOTALL)
        if nested_m:
            name = html_module.unescape(nested_m.group(1).strip())
        if not name:
            link_m = re.search(r'<a[^>]*>\s*([^<]+?)\s*</a>', item_html)
            if link_m:
                name = html_module.unescape(link_m.group(1).strip())
        if not name:
            name = html_module.unescape(re.sub(r'<[^>]+>', ' ', item_html))
            name = re.sub(r'\s+', ' ', name).strip()

        if not name or len(name) < 2:
            continue

        # Tweet volume (e.g. "85K", "1.2M Tweets")
        tweet_count = None
        plain = re.sub(r'<[^>]+>', ' ', item_html)
        vol_m = re.search(r'([\d][0-9.,]*\s*[KkMmBb])', plain)
        if vol_m and re.search(r'[KkMmBb]', vol_m.group(1)):
            tweet_count = vol_m.group(1).strip().upper()

        twitter_url = (
            f'https://twitter.com/search?q={urllib.parse.quote_plus(name)}&src=trend_click'
        )
        trends.append({'rank': rank, 'name': name, 'tweet_count': tweet_count, 'twitter_url': twitter_url})

    return trends
