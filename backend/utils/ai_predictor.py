import os
import json
from google import genai
from google.genai import types

# Try models in order — first available quota wins
_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
]


def _strip_code_fence(text: str) -> str:
    text = text.strip()
    if text.startswith('```'):
        parts = text.split('```')
        inner = parts[1] if len(parts) > 1 else text
        if inner.lower().startswith('json'):
            inner = inner[4:]
        return inner.strip()
    return text


def analyze_victim_with_ai(username: str, tweets: list, stats: dict,
                            risk_level: str, trend_direction: str) -> dict | None:
    """
    Call Gemini to generate a natural-language behavioral prediction for a victim.
    Tries multiple models in order; returns dict on success, None on failure.
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return None

    client = genai.Client(api_key=api_key)

    samples = []
    for t in tweets[-10:]:
        text = (t.get('input_text') or '').strip()
        risk = round(max(t.get('toxicity_score') or 0, t.get('cyberbullying_prob') or 0) * 100)
        sentiment = t.get('sentiment') or 'neutral'
        if text:
            samples.append({'text': text[:200], 'risk_pct': risk, 'sentiment': sentiment})

    week_delta = round((stats['last7_avg'] - stats['prev7_avg']) * 100)

    prompt = f"""You are a cyberbullying and online-behaviour analyst assisting a moderation team.
Analyse the Twitter/X profile @{username} based on the data below and predict their likely next behaviour.

=== STATISTICAL SUMMARY ===
Risk level       : {risk_level}
Trend            : {trend_direction}
Posts analysed   : {stats['total_analyzed']}
Toxic posts      : {round(stats['toxic_rate'] * 100)}%
High-risk posts  : {stats['high_risk_count']}
Recent avg risk  : {round(stats['recent_avg'] * 100)}%
Historical avg   : {round(stats['historical_avg'] * 100)}%
7-day change     : {week_delta:+}%

=== RECENT POSTS (most recent last) ===
{json.dumps(samples, indent=2)}

Respond ONLY with valid JSON — no markdown, no extra text — using exactly this schema:
{{
  "behavioral_summary": "2-3 sentences describing the overall pattern observed in this person's posts.",
  "next_move_prediction": "A specific, concrete prediction of what this person is likely to post or do next.",
  "psychological_indicators": [
    "Short phrase describing an observed psychological signal",
    "Another indicator"
  ],
  "warning_signs": [
    "Specific observable warning sign 1",
    "Specific observable warning sign 2"
  ],
  "intervention_strategy": "One actionable recommendation for a moderator or concerned party.",
  "confidence_note": "Brief note on prediction reliability given the available data."
}}"""

    last_error = None
    for model in _MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=1200,
                ),
            )
            raw = _strip_code_fence(response.text)
            return json.loads(raw)
        except Exception as exc:
            last_error = exc
            # Only retry on quota errors; bail immediately on auth / bad-request errors
            err_str = str(exc)
            if '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                continue   # try next model
            break          # non-quota error — stop retrying

    # Log the final error so it appears in backend logs
    print(f'[ai_predictor] All models failed. Last error: {last_error}')
    return None
