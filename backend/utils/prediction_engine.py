import math
from datetime import datetime, timedelta, timezone
from collections import defaultdict


def _to_dt(val):
    if isinstance(val, datetime):
        return val.replace(tzinfo=timezone.utc) if val.tzinfo is None else val
    if isinstance(val, str):
        for fmt in (
            '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%d %H:%M:%S.%f', '%Y-%m-%d %H:%M:%S',
        ):
            try:
                return datetime.strptime(val, fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                pass
    raise ValueError(f'Cannot parse timestamp: {val!r}')


def _risk(record):
    return max(record.get('toxicity_score') or 0.0, record.get('cyberbullying_prob') or 0.0)


def _linear_slope(series):
    n = len(series)
    if n < 2:
        return 0.0
    xs = list(range(n))
    mx = sum(xs) / n
    my = sum(series) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, series))
    den = sum((x - mx) ** 2 for x in xs)
    return num / den if den else 0.0


def _week_key(dt):
    monday = dt - timedelta(days=dt.weekday())
    return monday.strftime('%Y-%m-%d')


def _per_day_rate(group):
    if len(group) < 2:
        return float(len(group))
    span = (_to_dt(group[-1]['created_at']) - _to_dt(group[0]['created_at'])).total_seconds()
    return len(group) / max(span / 86400.0, 1.0)


def predict_behavior(records):
    """
    Analyse a user's analysis_history and return a structured prediction dict.

    Parameters
    ----------
    records : list[dict]
        Rows from analysis_history.  Each must contain at minimum:
        toxicity_score, cyberbullying_prob, sentiment, result_sarcasm, created_at.

    Returns
    -------
    dict
    """
    MIN_RECORDS = 3

    if len(records) < MIN_RECORDS:
        return {
            'insufficient_data': True,
            'data_points': len(records),
            'min_required': MIN_RECORDS,
            'message': (
                f'Need at least {MIN_RECORDS} analyses to generate a meaningful prediction. '
                f'You currently have {len(records)}.'
            ),
        }

    # ── Sort oldest → newest ─────────────────────────────────────────────────
    records = sorted(records, key=lambda r: _to_dt(r['created_at']))
    n = len(records)
    risk_series = [_risk(r) for r in records]

    # ── Recent vs historical split ────────────────────────────────────────────
    recent_n = min(10, max(3, n // 3))
    recent = records[-recent_n:]
    historical = records[:-recent_n] if n > recent_n else records

    recent_avg = sum(_risk(r) for r in recent) / len(recent)
    hist_avg = sum(_risk(r) for r in historical) / len(historical)
    delta = recent_avg - hist_avg  # positive = getting worse

    # ── Trend slope ──────────────────────────────────────────────────────────
    slope = _linear_slope(risk_series)

    # ── Toxic / high-risk counts ──────────────────────────────────────────────
    toxic_count = sum(1 for r in records if _risk(r) > 0.5)
    high_risk_count = sum(1 for r in records if _risk(r) > 0.7)
    toxic_rate = toxic_count / n
    high_risk_rate = high_risk_count / n
    recent_toxic_rate = sum(1 for r in recent if _risk(r) > 0.5) / len(recent)
    recent_high_rate = sum(1 for r in recent if _risk(r) > 0.7) / len(recent)

    # ── Sentiment trend ───────────────────────────────────────────────────────
    neg_recent = sum(1 for r in recent if r.get('sentiment') == 'negative') / len(recent)
    neg_hist = sum(1 for r in historical if r.get('sentiment') == 'negative') / len(historical)
    neg_delta = neg_recent - neg_hist

    # ── Posting frequency trend ───────────────────────────────────────────────
    half = n // 2
    freq_delta = _per_day_rate(records[half:]) - _per_day_rate(records[:half]) if half > 0 else 0.0

    # ── 7-day rolling comparison ──────────────────────────────────────────────
    now = datetime.now(tz=timezone.utc)
    last7 = [r for r in records if (now - _to_dt(r['created_at'])).days < 7]
    prev7 = [r for r in records if 7 <= (now - _to_dt(r['created_at'])).days < 14]
    last7_avg = (sum(_risk(r) for r in last7) / len(last7)) if last7 else 0.0
    prev7_avg = (sum(_risk(r) for r in prev7) / len(prev7)) if prev7 else hist_avg

    # ── Weekly trend buckets ──────────────────────────────────────────────────
    buckets: dict = defaultdict(list)
    for r in records:
        buckets[_week_key(_to_dt(r['created_at']))].append(_risk(r))

    weekly_trend = sorted(
        [
            {
                'week': wk,
                'avg_risk': round(sum(v) / len(v), 4),
                'count': len(v),
                'toxic_count': sum(1 for x in v if x > 0.5),
            }
            for wk, v in buckets.items()
        ],
        key=lambda x: x['week'],
    )

    # ── Composite risk score ──────────────────────────────────────────────────
    # 40% recent average risk
    # 25% trend slope contribution (scaled, clamped 0–1)
    # 20% delta contribution (recent vs historical, clamped)
    #  10% recent toxic frequency
    #   5% negative sentiment deterioration
    slope_contrib = min(max(slope * 8.0, 0.0), 1.0)
    delta_contrib = min(max(delta * 2.0, 0.0), 1.0)
    sentiment_contrib = min(max(neg_delta * 2.0, 0.0), 1.0)

    raw_score = (
        0.40 * recent_avg
        + 0.25 * slope_contrib
        + 0.20 * delta_contrib
        + 0.10 * recent_toxic_rate
        + 0.05 * sentiment_contrib
    )
    risk_score = round(min(1.0, max(0.0, raw_score)), 4)

    # ── Risk level ────────────────────────────────────────────────────────────
    if risk_score >= 0.70:
        risk_level = 'CRITICAL'
    elif risk_score >= 0.50:
        risk_level = 'HIGH'
    elif risk_score >= 0.30:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'LOW'

    # ── Trend direction ───────────────────────────────────────────────────────
    if slope > 0.008:
        trend_direction = 'increasing'
    elif slope < -0.008:
        trend_direction = 'decreasing'
    else:
        trend_direction = 'stable'

    # ── Confidence score ──────────────────────────────────────────────────────
    confidence = round(min(1.0, 0.35 + (n / 60.0) * 0.65), 2)

    # ── Risk factors ──────────────────────────────────────────────────────────
    factors = []

    if recent_avg >= 0.7:
        factors.append({'factor': 'High recent toxicity scores', 'impact': 'critical', 'value': round(recent_avg, 2), 'description': f'Average risk score across recent posts: {round(recent_avg * 100)}%'})
    elif recent_avg >= 0.5:
        factors.append({'factor': 'Elevated recent toxicity', 'impact': 'high', 'value': round(recent_avg, 2), 'description': f'Recent average risk score: {round(recent_avg * 100)}%'})
    elif recent_avg >= 0.3:
        factors.append({'factor': 'Moderate toxicity in recent posts', 'impact': 'medium', 'value': round(recent_avg, 2), 'description': f'Recent average risk score: {round(recent_avg * 100)}%'})

    if delta > 0.2:
        pct = round(delta / max(hist_avg, 0.01) * 100)
        factors.append({'factor': 'Sharp behavioral escalation', 'impact': 'critical', 'value': round(delta, 2), 'description': f'Toxicity has spiked ~{pct}% above the historical baseline'})
    elif delta > 0.1:
        factors.append({'factor': 'Rising harmful content', 'impact': 'high', 'value': round(delta, 2), 'description': 'Recent posts are notably more toxic than the historical baseline'})
    elif delta > 0.03:
        factors.append({'factor': 'Slight upward shift', 'impact': 'medium', 'value': round(delta, 2), 'description': 'Minor increase in toxicity compared to earlier behavior'})
    elif delta < -0.1:
        factors.append({'factor': 'Improving behavioral pattern', 'impact': 'positive', 'value': round(abs(delta), 2), 'description': 'Recent posts are significantly less toxic than historical baseline'})

    if high_risk_rate >= 0.3:
        factors.append({'factor': f'{round(high_risk_rate * 100)}% of posts rated high risk', 'impact': 'critical', 'value': round(high_risk_rate, 2), 'description': f'{high_risk_count} out of {n} posts exceeded the high-risk threshold'})
    elif high_risk_rate >= 0.15:
        factors.append({'factor': f'{round(high_risk_rate * 100)}% of posts rated high risk', 'impact': 'high', 'value': round(high_risk_rate, 2), 'description': f'{high_risk_count} posts were flagged as high risk'})

    if toxic_rate >= 0.5:
        factors.append({'factor': f'{round(toxic_rate * 100)}% of content flagged toxic', 'impact': 'high', 'value': round(toxic_rate, 2), 'description': 'More than half of all analyzed posts exceeded the toxicity threshold'})
    elif toxic_rate >= 0.25:
        factors.append({'factor': f'{round(toxic_rate * 100)}% of content flagged toxic', 'impact': 'medium', 'value': round(toxic_rate, 2), 'description': f'{toxic_count} posts contained potentially harmful language'})

    if slope > 0.015:
        factors.append({'factor': 'Strong upward toxicity trend', 'impact': 'high', 'value': round(slope, 4), 'description': 'Risk scores have been consistently rising across the post history'})
    elif slope > 0.005:
        factors.append({'factor': 'Gradual upward trend', 'impact': 'medium', 'value': round(slope, 4), 'description': 'A slow but measurable increase in toxicity over time'})
    elif slope < -0.008:
        factors.append({'factor': 'Declining toxicity trend', 'impact': 'positive', 'value': round(abs(slope), 4), 'description': 'Toxicity scores are on a downward trajectory'})

    if neg_delta > 0.2:
        factors.append({'factor': 'Significant sentiment deterioration', 'impact': 'high', 'value': round(neg_delta, 2), 'description': 'Recent posts show a marked increase in negative emotional tone'})
    elif neg_delta > 0.1:
        factors.append({'factor': 'Negative sentiment increasing', 'impact': 'medium', 'value': round(neg_delta, 2), 'description': 'Emotional tone of recent posts has shifted more negative'})

    if freq_delta > 0.5 and toxic_rate > 0.2:
        factors.append({'factor': 'Posting frequency increasing', 'impact': 'medium', 'value': round(freq_delta, 2), 'description': 'Higher posting rate combined with elevated toxicity amplifies overall exposure'})

    if not factors:
        factors.append({'factor': 'Behavior appears stable and healthy', 'impact': 'positive', 'value': round(1.0 - recent_avg, 2), 'description': 'No significant risk patterns detected in the post history'})

    # ── Warnings ──────────────────────────────────────────────────────────────
    warnings = []
    if risk_level == 'CRITICAL':
        warnings.append('Critical risk indicators detected — a significant pattern of harmful content has emerged.')
    if delta > 0.2:
        pct = round(delta / max(hist_avg, 0.01) * 100)
        warnings.append(f'Toxicity has escalated by approximately {pct}% above the historical baseline.')
    if trend_direction == 'increasing' and slope > 0.01:
        warnings.append('Risk scores are on a consistent upward trajectory — the behavioral trend is worsening.')
    if recent_toxic_rate > 0.6:
        warnings.append(f'{round(recent_toxic_rate * 100)}% of the most recent posts contain toxic content.')
    if high_risk_count >= 3:
        warnings.append(f'{high_risk_count} posts have been rated high risk — above the threshold for serious harm.')
    if neg_delta > 0.15:
        warnings.append('The emotional tone of recent posts has shifted noticeably more negative.')
    if last7_avg > prev7_avg * 1.3 and last7:
        warnings.append(f'This week\'s average risk ({round(last7_avg * 100)}%) is higher than last week ({round(prev7_avg * 100)}%).')

    # ── Next move prediction ──────────────────────────────────────────────────
    if risk_level == 'CRITICAL' and trend_direction == 'increasing':
        next_move = 'Likely to post highly aggressive or hostile content in the near future. Immediate monitoring recommended.'
        next_move_type = 'aggressive'
    elif risk_level == 'HIGH' and trend_direction == 'increasing':
        next_move = 'Showing signs of escalating distress or retaliation. Next posts are likely to be confrontational or emotionally charged.'
        next_move_type = 'escalating'
    elif risk_level == 'HIGH' and trend_direction == 'stable':
        next_move = 'Sustained pattern of harmful content. Behavior is entrenched — next posts likely to mirror recent activity.'
        next_move_type = 'sustained'
    elif risk_level == 'MEDIUM' and trend_direction == 'increasing':
        next_move = 'Pattern is deteriorating. Next posts may show increased frustration or negativity if the trend continues.'
        next_move_type = 'deteriorating'
    elif risk_level == 'MEDIUM' and trend_direction == 'stable':
        next_move = 'Moderate risk with no clear direction. Could escalate or improve — close monitoring advised.'
        next_move_type = 'uncertain'
    elif trend_direction == 'decreasing':
        next_move = 'Behavior is showing improvement. Next posts are likely to be less harmful than recent history.'
        next_move_type = 'improving'
    else:
        next_move = 'No significant risk signals detected. Next posts are likely to follow the established safe pattern.'
        next_move_type = 'stable'

    # ── Recommendations ───────────────────────────────────────────────────────
    recs = []
    if risk_level in ('HIGH', 'CRITICAL'):
        recs.append('Increase monitoring frequency for this profile — check for new posts at shorter intervals.')
        recs.append('Review the high-risk posts in detail to identify what type of content is triggering the alerts.')
    if trend_direction == 'increasing':
        recs.append('The escalating pattern warrants closer attention — consider flagging for manual review.')
    if neg_delta > 0.1:
        recs.append('The emotional tone is deteriorating — this may indicate the person is experiencing distress or provocation.')
    if high_risk_count > 0:
        recs.append(f'Investigate the {high_risk_count} high-risk post(s) to understand the context and determine if intervention is appropriate.')
    if risk_level == 'LOW' and trend_direction != 'increasing':
        recs.append('No immediate action required. Continue periodic monitoring to catch any future changes early.')
    if not recs:
        recs.append('Continue regular automated checks to maintain behavioral awareness and detect any pattern shifts.')

    # ── Prediction window ─────────────────────────────────────────────────────
    try:
        window_days = max((_to_dt(records[-1]['created_at']) - _to_dt(records[0]['created_at'])).days, 1)
    except Exception:
        window_days = 0

    return {
        'insufficient_data': False,
        'risk_score': risk_score,
        'risk_level': risk_level,
        'trend_direction': trend_direction,
        'trend_slope': round(slope, 6),
        'confidence': confidence,
        'next_move': next_move,
        'next_move_type': next_move_type,
        'risk_factors': factors,
        'warnings': warnings,
        'recommendations': recs,
        'weekly_trend': weekly_trend,
        'stats': {
            'total_analyzed': n,
            'toxic_count': toxic_count,
            'high_risk_count': high_risk_count,
            'toxic_rate': round(toxic_rate, 4),
            'high_risk_rate': round(high_risk_rate, 4),
            'recent_avg': round(recent_avg, 4),
            'historical_avg': round(hist_avg, 4),
            'delta': round(delta, 4),
            'last7_avg': round(last7_avg, 4),
            'prev7_avg': round(prev7_avg, 4),
            'last7_count': len(last7),
            'prev7_count': len(prev7),
        },
        'data_points': n,
        'analysis_window_days': window_days,
    }
