"""
SafeText AI — Cyberbullying Classifier
Multi-layer pipeline:
  1. Text normalization   (obfuscation: A$$ → ass, SCHITT → shit)
  2. Local BERT model     (fine-tuned bert-base-uncased — trained on Davidson dataset)
  3. Gemini API           (sarcasm + sentiment, temperature=0)
  4. Keyword fallback     (zero randomness, if all else fails)

Results cached by SHA-256 so same text always returns same scores.
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

# ── Local BERT model (your trained model) ─────────────────────────────────────
_LOCAL_MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'bert_model')
_LOCAL_MODEL_PATH = os.path.normpath(_LOCAL_MODEL_PATH)

_bert_pipeline = None   # loaded once on first call

def _load_local_bert():
    """Load the locally trained BERT model (runs once, cached in _bert_pipeline)."""
    global _bert_pipeline
    if _bert_pipeline is not None:
        return _bert_pipeline

    if not os.path.isdir(_LOCAL_MODEL_PATH):
        return None

    required = ['config.json']
    if not all(os.path.exists(os.path.join(_LOCAL_MODEL_PATH, f)) for f in required):
        return None

    try:
        from transformers import pipeline as hf_pipeline
        import torch
        device = 0 if torch.cuda.is_available() else -1
        _bert_pipeline = hf_pipeline(
            'text-classification',
            model=_LOCAL_MODEL_PATH,
            tokenizer=_LOCAL_MODEL_PATH,
            device=device,
            truncation=True,
            max_length=128,
        )
        print(f'[classifier] ✅ Loaded local BERT model from {_LOCAL_MODEL_PATH}')
        return _bert_pipeline
    except Exception as e:
        print(f'[classifier] Local BERT load failed: {e}')
        return None


# ── in-process result cache ───────────────────────────────────────────────────
_cache: dict[str, dict] = {}

# ── HuggingFace Inference API fallback (if local model not available) ─────────
_HF_URL = 'https://api-inference.huggingface.co/models/martin-ha/toxic-comment-model'

# ── Gemini model cascade ──────────────────────────────────────────────────────
_GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
]

# ─────────────────────────────────────────────────────────────────────────────
# LAYER 1 — Text Normaliser (obfuscation handling)
# ─────────────────────────────────────────────────────────────────────────────
_OBFUSCATION = [
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
# LAYER 2A — Local trained BERT model
# ─────────────────────────────────────────────────────────────────────────────
def _local_bert_toxicity(text: str) -> dict | None:
    pipe = _load_local_bert()
    if pipe is None:
        return None
    try:
        result = pipe(text)[0]
        label  = result['label'].upper()
        score  = result['score']

        if label == 'HARMFUL' or label == 'LABEL_1' or label == '1':
            toxicity_score     = round(score, 2)
            cyberbullying_prob = round(score * 0.90, 2)
        else:
            toxicity_score     = round(1 - score, 2)
            cyberbullying_prob = round((1 - score) * 0.85, 2)

        # Boost cyberbullying if text contains direct personal attack markers
        text_lower = text.lower()
        attack_words = ['you ', 'ur ', 'u ', 'your ']
        if any(w in text_lower for w in attack_words) and toxicity_score > 0.4:
            cyberbullying_prob = min(1.0, cyberbullying_prob + 0.10)

        return {
            'toxicity_score':     round(min(1.0, max(0.0, toxicity_score)), 2),
            'cyberbullying_prob': round(min(1.0, max(0.0, cyberbullying_prob)), 2),
        }
    except Exception as e:
        print(f'[classifier] Local BERT inference error: {e}')
        return None


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 2B — HuggingFace API fallback (if local model not present)
# ─────────────────────────────────────────────────────────────────────────────
def _hf_api_toxicity(text: str) -> dict | None:
    headers = {'Content-Type': 'application/json'}
    hf_token = os.getenv('HF_TOKEN') or os.getenv('HUGGINGFACE_TOKEN')
    if hf_token:
        headers['Authorization'] = f'Bearer {hf_token}'
    try:
        resp = requests.post(_HF_URL, headers=headers,
                             json={'inputs': text}, timeout=20)
        if resp.status_code != 200:
            return None
        data  = resp.json()
        items = data[0] if isinstance(data[0], list) else data
        scores = {d['label'].lower(): d['score'] for d in items}

        toxic        = scores.get('toxic', 0.0)
        severe_toxic = scores.get('severe_toxic', 0.0)
        obscene      = scores.get('obscene', 0.0)
        threat       = scores.get('threat', 0.0)
        insult       = scores.get('insult', 0.0)
        identity_hate = scores.get('identity_hate', 0.0)

        toxicity_score     = min(1.0, max(toxic, severe_toxic, obscene * 0.9))
        cyberbullying_prob = min(1.0,
            insult * 0.50 + threat * 0.80 + severe_toxic * 0.60 + identity_hate * 0.40)

        return {
            'toxicity_score':     round(toxicity_score, 2),
            'cyberbullying_prob': round(cyberbullying_prob, 2),
        }
    except Exception as exc:
        print(f'[classifier] HF API error: {exc}')
        return None


def _bert_toxicity(text: str) -> dict | None:
    """Try local model first, fall back to HF API."""
    return _local_bert_toxicity(text) or _hf_api_toxicity(text)


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 3 — Gemini (sarcasm + sentiment)
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
  ⚑ Obfuscated words (A$$, SCHITT, f*ck) count the same as the real word.
  ⚑ Wishing harm on a named person is at minimum 0.75.

cyberbullying_prob (0.00–1.00)
  HIGH when: direct attack on a named person, humiliation, threats, personal insults.
  LOW when: general political commentary, criticism of ideas, venting at a situation.

sarcasm (true/false)
  true → author clearly means the opposite, tone is mockingly ironic.

sentiment ("positive" | "negative" | "neutral")

EXAMPLES:
"Jack, FUCK OFF, piece of shit!" → {{"toxicity_score":0.92,"cyberbullying_prob":0.90,"sarcasm":false,"sentiment":"negative"}}
"Politicians don't give a damn." → {{"toxicity_score":0.28,"cyberbullying_prob":0.02,"sarcasm":false,"sentiment":"negative"}}
"Oh sure, brilliant plan genius." → {{"toxicity_score":0.12,"cyberbullying_prob":0.08,"sarcasm":true,"sentiment":"negative"}}
"You are amazing, thank you!"     → {{"toxicity_score":0.00,"cyberbullying_prob":0.00,"sarcasm":false,"sentiment":"positive"}}

Respond ONLY with valid JSON — no markdown:
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
                config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=150),
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
            if '429' in str(exc) or 'RESOURCE_EXHAUSTED' in str(exc):
                continue
            break
    return None


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 4 — Deterministic keyword fallback
# ─────────────────────────────────────────────────────────────────────────────
def _keyword_classify(text: str) -> dict:
    t = text.lower()
    extreme  = ['kill yourself', 'kys', 'go die', 'hope you die', 'hoping you fail',
                'hoping u fail', 'i hope you fail', 'fail miserably']
    severe   = ['motherfucker', 'mother fucker', 'cunt', 'nigger', 'asshole',
                'piece of shit', 'fuck off', 'go fuck yourself']
    moderate = ['fuck', 'shit', 'bitch', 'bastard', 'dick', 'ass', 'stupid',
                'idiot', 'dumb', 'loser', 'pathetic', 'worthless', 'trash', 'moron']
    attack   = ["you're a", 'you are a', 'shut up', 'nobody likes you', 'go away']
    positive = ['love', 'great', 'amazing', 'wonderful', 'awesome', 'fantastic',
                'excellent', 'perfect', 'happy', 'good', 'nice', 'thank', 'appreciate']
    sarcasm_indicators = ['oh yeah', 'sure', 'yeah right', 'how wonderful',
                          'great job genius', 'brilliant plan']

    ec = sum(1 for w in extreme   if w in t)
    sc = sum(1 for w in severe    if w in t)
    mc = sum(1 for w in moderate  if w in t)
    ac = sum(1 for w in attack    if w in t)
    pc = sum(1 for w in positive  if w in t)
    sarc = sum(1 for s in sarcasm_indicators if s in t) >= 1

    if ec:
        tox  = min(1.0, 0.80 + ec * 0.05)
        cyber = min(1.0, 0.75 + ec * 0.05 + ac * 0.05)
    elif sc:
        tox  = min(1.0, 0.60 + sc * 0.08)
        cyber = min(1.0, tox * 0.6 + ac * 0.10)
    elif mc:
        tox  = min(0.55, 0.28 + (mc - 1) * 0.08 - pc * 0.04)
        cyber = min(1.0, tox * 0.4 + ac * 0.12)
    else:
        tox  = max(0.0, 0.02 - pc * 0.01)
        cyber = 0.01

    if pc > (ec + sc + mc) and not (ec + sc):
        sentiment = 'positive'
        tox  = max(0.01, round(tox  * 0.3, 2))
        cyber = max(0.01, round(cyber * 0.2, 2))
    elif ec or sc or mc:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'

    return {
        'toxicity_score':     round(max(0.0, tox), 2),
        'cyberbullying_prob': round(max(0.0, cyber), 2),
        'sarcasm':   sarc,
        'sentiment': sentiment,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
def classify_text(text: str) -> dict:
    """
    Main classifier — 4-layer pipeline:
    1. Normalize obfuscated text
    2. BERT (local trained model → HF API fallback) for toxicity + cyberbullying
    3. Gemini for sarcasm + sentiment
    4. Keyword rules if all APIs fail
    """
    cache_key = hashlib.sha256(text.encode('utf-8')).hexdigest()
    if cache_key in _cache:
        return _cache[cache_key]

    clean = _normalize(text)

    bert_result   = _bert_toxicity(clean)
    gemini_result = _gemini_classify(clean)

    if bert_result and gemini_result:
        result = {
            'toxicity_score':     bert_result['toxicity_score'],
            'cyberbullying_prob': bert_result['cyberbullying_prob'],
            'sarcasm':   gemini_result['sarcasm'],
            'sentiment': gemini_result['sentiment'],
        }
    elif bert_result:
        kw = _keyword_classify(clean)
        result = {**bert_result, 'sarcasm': kw['sarcasm'], 'sentiment': kw['sentiment']}
    elif gemini_result:
        result = gemini_result
    else:
        result = _keyword_classify(clean)

    _cache[cache_key] = result
    return result
