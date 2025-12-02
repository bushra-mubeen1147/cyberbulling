import random
import re

def classify_text(text):
    """
    Mock classifier function for cyberbullying and sarcasm detection.
    This will be replaced with a real BERT model later.
    
    Returns:
        dict: Classification results including toxicity, cyberbullying probability,
              sarcasm detection, and sentiment analysis.
    """
    text_lower = text.lower()
    
    toxic_words = [
        'hate', 'stupid', 'idiot', 'dumb', 'ugly', 'loser', 'die', 'kill',
        'awful', 'terrible', 'horrible', 'pathetic', 'worthless', 'trash',
        'annoying', 'shut up', 'get lost', 'go away', 'nobody likes'
    ]
    
    positive_words = [
        'love', 'great', 'amazing', 'wonderful', 'beautiful', 'awesome',
        'fantastic', 'excellent', 'brilliant', 'perfect', 'happy', 'good',
        'nice', 'kind', 'helpful', 'thank', 'appreciate'
    ]
    
    sarcasm_indicators = [
        'oh yeah', 'sure', 'right', 'totally', 'obviously', 'clearly',
        'of course', 'yeah right', 'brilliant', 'genius', 'great job',
        'wow', 'thanks a lot', 'how wonderful'
    ]
    
    toxic_count = sum(1 for word in toxic_words if word in text_lower)
    positive_count = sum(1 for word in positive_words if word in text_lower)
    sarcasm_count = sum(1 for indicator in sarcasm_indicators if indicator in text_lower)
    
    has_exclamation = '!' in text
    has_caps = any(c.isupper() for c in text) and len(text) > 3
    word_count = len(text.split())
    
    base_toxicity = min(toxic_count * 0.15, 0.6)
    base_toxicity -= positive_count * 0.1
    base_toxicity += random.uniform(-0.1, 0.15)
    toxicity_score = max(0.0, min(1.0, base_toxicity + 0.05))
    
    cyberbullying_prob = max(0.0, min(1.0, toxicity_score * 0.9 + random.uniform(-0.05, 0.1)))
    
    sarcasm = sarcasm_count >= 1 or (has_exclamation and sarcasm_count >= 0 and random.random() > 0.7)
    
    if positive_count > toxic_count and toxic_count == 0:
        sentiment = "positive"
        toxicity_score = max(0.02, toxicity_score * 0.3)
        cyberbullying_prob = max(0.01, cyberbullying_prob * 0.2)
    elif toxic_count > positive_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"
        if toxicity_score > 0.3:
            toxicity_score *= 0.7
    
    toxicity_score = round(toxicity_score, 2)
    cyberbullying_prob = round(cyberbullying_prob, 2)
    
    return {
        "toxicity_score": toxicity_score,
        "cyberbullying_prob": cyberbullying_prob,
        "sarcasm": sarcasm,
        "sentiment": sentiment
    }
