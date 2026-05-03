"""
Multi-layer text classifier for cyberbullying / toxicity detection.

Pipeline (in priority order):
  1. Normalize obfuscated text  (A$$ → ass, SCHITT → shit …)
  2. HuggingFace BERT model     (martin-ha/toxic-comment-model)
     → toxicity_score, cyberbullying_prob
  3. Gemini API (temperature=0) → sarcasm, sentiment
     (also used as toxicity fallback if HF is unavailable)
  4. Deterministic keyword rules → final fallback, zero randomness

Results are cached per unique text so repeated calls are instant and identical.
"""

import os
import re
import json
import hashlib

import requests

try:
    from google import genai
    from google.genai import types
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False

# ── in-process cache ──────────────────────────────────────────────────────────
_cache: dict[str, dict] = {}

# ── HuggingFace model ─────────────────────────────────────────────────────────
_HF_MODEL = 'martin-ha/toxic-comment-model'
_HF_URL   = f'https://api-inference.huggingface.co/models/{_HF_MODEL}'

# ── Gemini model cascade ──────────────────────────────────────────────────────
_GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
]

# ─────────────────────────────────────────────────────────────────────────────
# 1. TEXT NORMALISER
# ─────────────────────────────────────────────────────────────────────────────
_OBFUSCATION = [
    # pattern                        replacement
    (r'\bA[\$@][\$@]-?WH[O0]LE\b',  'asshole'),
    (r'\bA[\$@][\$@]\b',            'ass'),
    (r'\bSCH[I1]TT?\b',             'shit'),
    (r'\bSH[\*!1]T\b',              'shit'),
    (r'\bSH[\*!]+T\b',              'shit'),
    (r'\bF[\*!]+CK\b',              'fuck'),
    (r'\bF[\*!]+K\b',               'fuck'),
    (r'\bMOTHER\s*F[\*U!]+CKER\b',  'motherfucker'),
    (r'\bMOTH?AF[\*U!]+KA?\b',      'motherfucker'),
    (r'\bB[\*!1]TCH\b',             'bitch'),
    (r'\bB1[T7]CH\b',               'bitch'),
    (r'\bD[1!][C<]K\b',             'dick'),
    (r'\bP[\*!]+SSY\b',             'pussy'),
    (r'\bC[\*!]+NT\b',              'cunt'),
    (r'\bWH[\*!]+RE\b',             'whore'),
    (r'\bN[\*!1]+GG[AE]R?\b',       'nigger'),
    (r'\bK[Y1!]S\b',                'kill yourself'),
    (r'\bPIECE\s+OF\s+SCH?[I1]TT?\b', 'piece of shit'),
]
_OBFUSCATION_COMPILED = [(re.compile(p, re.IGNORECASE), r) for p, r in _OBFUSCATION]


def _normalize(text: str) -> str:
    for pattern, replacement in _OBFUSCATION_COMPILED:
        text = pattern.sub(replacement, text)
    return text


# ─────────────────────────────────────────────────────────────────────────────
# 2. HuggingFace BERT toxicity model
# ─────────────────────────────────────────────────────────────────────────────
def _hf_toxicity(text: str) -> dict | None:
    """
    Calls martin-ha/toxic-comment-model via HF Inference API.
    Returns {toxicity_score, cyberbullying_prob} or None on failure.
    Labels returned: toxic, severe_toxic, obscene, threat, insult, identity_hate
    """
    headers = {'Content-Type': 'application/json'}
    hf_token = os.getenv('HF_TOKEN') or os.getenv('HUGGINGFACE_TOKEN')
    if hf_token:
        headers['Authorization'] = f'Bearer {hf_token}'

    try:
        resp = requests.post(
            _HF_URL,
            headers=headers,
            json={'inputs': text},
            timeout=20,
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        # Response shape: [[{label, score}, ...]]
        if not isinstance(data, list) or not data:
            return None
        items = data[0] if isinstance(data[0], list) else data
        scores = {d['label'].lower(): d['score'] for d in items}

        toxic         = scores.get('toxic', 0.0)
        severe_toxic  = scores.get('severe_toxic', 0.0)
        obscene       = scores.get('obscene', 0.0)
        threat        = scores.get('threat', 0.0)
        insult        = scores.get('insult', 0.0)
        identity_hate = scores.get('identity_hate', 0.0)

        # Overall toxicity: highest of toxic / severe / obscene
        toxicity_score = min(1.0, max(toxic, severe_toxic, obscene * 0.9))

        # Cyberbullying: direct targeting, threats, insults, identity attacks
        cyberbullying_prob = min(1.0,
            insult * 0.50 + threat * 0.80 + severe_toxic * 0.60 + identity_hate * 0.40
        )

        return {
            'toxicity_score':     round(toxicity_score, 2),
            'cyberbullying_prob': round(cyberbullying_prob, 2),
        }
    except Exception as exc:
        print(f'[classifier] HF API error: {exc}')
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 3. Gemini — sarcasm + sentiment (and fallback toxicity)
# ─────────────────────────────────────────────────────────────────────────────
_GEMINI_PROMPT = '''You are a professional online-safety classifier. Analyze the social-media text below.

TEXT:
"""{text}"""

━━━ SCORING RULES ━━━

toxicity_score (0.00–1.00)
  0.00–0.09 → Completely clean
  0.10–0.29 → Mild: occasional mild profanity or rudeness
  0.30–0.54 → Moderate: clear profanity, insults, aggressive tone
  0.55–0.74 → High: targeted harassment, dehumanising language
  0.75–1.00 → Severe: threats, extreme hate, calls for violence or self-harm
  ⚑ NOTE: obfuscated words (A$$, SCHITT, f*ck, etc.) count the same as the real word.
  ⚑ NOTE: wishing harm on a named person is at minimum 0.75.

cyberbullying_prob (0.00–1.00)
  HIGH when: direct attack on a named/implied person, humiliation, threats, personal insults.
  LOW when: general political commentary, criticism of ideas, frustrated venting at a situation.

sarcasm (true/false)
  true → author clearly means the opposite, tone is mockingly ironic.
  false → author is sincere even if angry or offensive.

sentiment ("positive" | "negative" | "neutral")
  positive → supportive, hopeful, happy.
  negative → angry, hostile, sad, contemptuous.
  neutral  → factual/balanced without dominant emotion.

EXAMPLES:
"Jack, FUCK OFF, piece of shit!" → {{"toxicity_score":0.92,"cyberbullying_prob":0.90,"sarcasm":false,"sentiment":"negative"}}
"I hope you fail at everything in life" → {{"toxicity_score":0.78,"cyberbullying_prob":0.82,"sarcasm":false,"sentiment":"negative"}}
"Politicians don't give a damn — terrible policy." → {{"toxicity_score":0.28,"cyberbullying_prob":0.02,"sarcasm":false,"sentiment":"negative"}}
"Oh sure, brilliant plan genius." → {{"toxicity_score":0.12,"cyberbullying_prob":0.08,"sarcasm":true,"sentiment":"negative"}}
"You are amazing, thank you!" → {{"toxicity_score":0.00,"cyberbullying_prob":0.00,"sarcasm":false,"sentiment":"positive"}}

Respond with ONLY valid JSON — no markdown, no extra text:
{{"toxicity_score":X.XX,"cyberbullying_prob":X.XX,"sarcasm":true_or_false,"sentiment":"..."}}'''


def _strip_fence(text: str) -> str:
    text = text.strip()
    if text.startswith('```'):
        parts = text.split('```')
        inner = parts[1] if len(parts) > 1 else text
        if inner.lower().startswith('json'):
            inner = inner[4:]
        return inner.strip()
    return text


def _gemini_classify(text: str) -> dict | None:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or not _GENAI_AVAILABLE:
        return None

    client = genai.Client(api_key=api_key)
    prompt = _GEMINI_PROMPT.format(text=text.replace('"', '\\"'))

    for model in _GEMINI_MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    max_output_tokens=150,
                ),
            )
            data = json.loads(_strip_fence(response.text))
            sentiment = data.get('sentiment', 'neutral')
            if sentiment not in ('positive', 'negative', 'neutral'):
                sentiment = 'neutral'
            return {
                'toxicity_score':     round(min(1.0, max(0.0, float(data.get('toxicity_score',     0)))), 2),
                'cyberbullying_prob': round(min(1.0, max(0.0, float(data.get('cyberbullying_prob', 0)))), 2),
                'sarcasm':   bool(data.get('sarcasm', False)),
                'sentiment': sentiment,
            }
        except Exception as exc:
            err = str(exc)
            if '429' in err or 'RESOURCE_EXHAUSTED' in err:
                continue
            break

    return None


# ─────────────────────────────────────────────────────────────────────────────
# 4. Deterministic keyword fallback
# ─────────────────────────────────────────────────────────────────────────────
def _keyword_classify(text: str) -> dict:
    t = text.lower()

    extreme = ['kill yourself', 'kys', 'go die', 'i will kill you', 'i will hurt you',
               'hope you die', 'hoping you fail', 'hoping u fail', 'i hope you fail']
    severe  = ['motherfucker', 'mother fucker', 'cunt', 'nigger', 'rape',
               'asshole', 'piece of shit', 'fuck off', 'go fuck yourself']
    moderate = ['fuck', 'shit', 'bitch', 'bastard', 'dick', 'ass', 'piss',
                'stupid', 'idiot', 'dumb', 'ugly', 'loser', 'pathetic',
                'worthless', 'trash', 'moron', 'scum', 'freak']
    attack  = ["you're a", 'you are a', 'shut up', 'nobody likes you',
               'go away', 'get lost', 'you piece']
    positive = ['love', 'great', 'amazing', 'wonderful', 'awesome', 'fantastic',
                'excellent', 'perfect', 'happy', 'good', 'nice', 'kind',
                'helpful', 'thank', 'appreciate', 'glad']
    sarcasm_indicators = ['oh yeah', 'sure', 'yeah right', 'of course',
                          'how wonderful', 'great job genius', 'brilliant plan']

    extreme_c  = sum(1 for w in extreme   if w in t)
    severe_c   = sum(1 for w in severe    if w in t)
    moderate_c = sum(1 for w in moderate  if w in t)
    attack_c   = sum(1 for w in attack    if w in t)
    positive_c = sum(1 for w in positive  if w in t)
    sarcasm_c  = sum(1 for s in sarcasm_indicators if s in t)

    if extreme_c:
        toxicity_score    = min(1.0, 0.80 + extreme_c * 0.05)
        cyberbullying_prob = min(1.0, 0.75 + extreme_c * 0.05 + attack_c * 0.05)
    elif severe_c:
        toxicity_score    = min(1.0, 0.60 + severe_c * 0.08)
        cyberbullying_prob = min(1.0, toxicity_score * 0.6 + attack_c * 0.10)
    elif moderate_c:
        toxicity_score    = min(0.55, 0.28 + (moderate_c - 1) * 0.08 - positive_c * 0.04)
        cyberbullying_prob = min(1.0, toxicity_score * 0.4 + attack_c * 0.12)
    else:
        toxicity_score    = max(0.0, 0.02 - positive_c * 0.01)
        cyberbullying_prob = 0.01

    toxicity_score     = max(0.0, round(toxicity_score, 2))
    cyberbullying_prob = max(0.0, round(cyberbullying_prob, 2))
    sarcasm = sarcasm_c >= 1

    if positive_c > (extreme_c + severe_c + moderate_c) and not (extreme_c + severe_c):
        sentiment = 'positive'
        toxicity_score     = max(0.01, round(toxicity_score * 0.3, 2))
        cyberbullying_prob = max(0.01, round(cyberbullying_prob * 0.2, 2))
    elif extreme_c or severe_c or moderate_c:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'

    return {
        'toxicity_score':     toxicity_score,
        'cyberbullying_prob': cyberbullying_prob,
        'sarcasm':   sarcasm,
        'sentiment': sentiment,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
def classify_text(text: str) -> dict:
    """
    Classify text through a 4-layer pipeline:
      1. Normalise obfuscated words
      2. HuggingFace BERT model for toxicity + cyberbullying
      3. Gemini for sarcasm + sentiment (and toxicity if HF unavailable)
      4. Keyword fallback if all APIs are down

    Result is cached by SHA-256 of the original text.
    """
    cache_key = hashlib.sha256(text.encode('utf-8')).hexdigest()
    if cache_key in _cache:
        return _cache[cache_key]

    clean_text = _normalize(text)

    # ── Layer 2: BERT via HuggingFace API ────────────────────────────────────
    hf_result = _hf_toxicity(clean_text)

    # ── Layer 3: Gemini ───────────────────────────────────────────────────────
    gemini_result = _gemini_classify(clean_text)

    # ── Merge results ─────────────────────────────────────────────────────────
    if hf_result and gemini_result:
        # HF is more accurate for toxicity/cyberbullying scores
        # Gemini is more accurate for sarcasm and sentiment
        result = {
            'toxicity_score':     hf_result['toxicity_score'],
            'cyberbullying_prob': hf_result['cyberbullying_prob'],
            'sarcasm':   gemini_result['sarcasm'],
            'sentiment': gemini_result['sentiment'],
        }
    elif hf_result:
        # HF only — use keyword-based sarcasm/sentiment
        kw = _keyword_classify(clean_text)
        result = {
            'toxicity_score':     hf_result['toxicity_score'],
            'cyberbullying_prob': hf_result['cyberbullying_prob'],
            'sarcasm':   kw['sarcasm'],
            'sentiment': kw['sentiment'],
        }
    elif gemini_result:
        # Gemini only
        result = gemini_result
    else:
        # Full fallback
        result = _keyword_classify(clean_text)

    _cache[cache_key] = result
    return result
