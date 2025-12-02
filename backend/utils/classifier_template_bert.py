# Example: BERT Model Integration Template
# Replace this file content in backend/utils/classifier.py

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CyberbullyingClassifier:
    """
    Custom BERT-based classifier for cyberbullying detection.
    Replace model_name with your model path or Hugging Face model ID.
    """
    
    def __init__(self):
        try:
            # CHANGE THIS to your model path or Hugging Face model ID
            model_name = "path/to/your/model"  # e.g., "bert-base-uncased" or "./models/my_bert_model"
            
            logger.info(f"Loading model from {model_name}...")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.model.eval()
            
            # Set device (GPU if available)
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.model.to(self.device)
            
            logger.info(f"Model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def predict(self, text):
        """
        Predict toxicity and cyberbullying for input text.
        
        Args:
            text (str): Input text to analyze
            
        Returns:
            dict: Prediction results
        """
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors='pt',
                max_length=512,
                truncation=True,
                padding=True
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=1)
            
            # ADJUST THIS based on your model's output format
            # Example for binary classification: [not_toxic, toxic]
            toxicity_score = probabilities[0][1].item()
            
            # Or for multi-label, extract relevant scores:
            # toxicity_score = probabilities[0][0].item()
            # hate_score = probabilities[0][1].item()
            # offensive_score = probabilities[0][2].item()
            
            # Calculate cyberbullying probability
            cyberbullying_prob = min(toxicity_score * 0.95, 1.0)
            
            # Determine sentiment
            sentiment = self._analyze_sentiment(text, toxicity_score)
            
            # Detect sarcasm (implement your logic or use a separate model)
            sarcasm = self._detect_sarcasm(text)
            
            return {
                "toxicity_score": round(toxicity_score, 2),
                "cyberbullying_prob": round(cyberbullying_prob, 2),
                "sarcasm": sarcasm,
                "sentiment": sentiment
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            # Return safe defaults on error
            return {
                "toxicity_score": 0.0,
                "cyberbullying_prob": 0.0,
                "sarcasm": False,
                "sentiment": "neutral"
            }
    
    def _analyze_sentiment(self, text, toxicity_score):
        """
        Analyze sentiment based on toxicity score.
        Replace with your own sentiment model if available.
        """
        if toxicity_score > 0.6:
            return "negative"
        elif toxicity_score < 0.3:
            return "positive"
        else:
            return "neutral"
    
    def _detect_sarcasm(self, text):
        """
        Basic sarcasm detection.
        Replace with your own sarcasm detection model if available.
        """
        sarcasm_indicators = [
            'oh yeah', 'sure', 'right', 'totally', 'obviously', 'clearly',
            'of course', 'yeah right', 'wow', 'great job', 'brilliant'
        ]
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in sarcasm_indicators)

# Initialize classifier once (singleton pattern)
try:
    classifier = CyberbullyingClassifier()
    logger.info("Classifier initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize classifier: {e}")
    classifier = None

def classify_text(text):
    """
    Main function called by the API endpoint.
    
    Args:
        text (str): Text to analyze
        
    Returns:
        dict: Classification results
    """
    if classifier is None:
        logger.error("Classifier not initialized")
        return {
            "toxicity_score": 0.0,
            "cyberbullying_prob": 0.0,
            "sarcasm": False,
            "sentiment": "neutral",
            "error": "Model not loaded"
        }
    
    return classifier.predict(text)
