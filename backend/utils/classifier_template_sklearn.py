# Example: Scikit-learn Model Integration Template
# Replace this file content in backend/utils/classifier.py

import joblib
import os
import logging
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CyberbullyingClassifier:
    """
    Scikit-learn based classifier for cyberbullying detection.
    Works with any sklearn model (SVM, Random Forest, Logistic Regression, etc.)
    """
    
    def __init__(self):
        try:
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
            
            # CHANGE THESE to match your saved model filenames
            model_path = os.path.join(model_dir, 'cyberbullying_model.pkl')
            vectorizer_path = os.path.join(model_dir, 'tfidf_vectorizer.pkl')
            
            logger.info(f"Loading model from {model_path}...")
            
            # Load your trained model
            self.model = joblib.load(model_path)
            
            # Load your vectorizer (TF-IDF, CountVectorizer, etc.)
            self.vectorizer = joblib.load(vectorizer_path)
            
            # Optional: Load additional models for sentiment/sarcasm
            # self.sentiment_model = joblib.load(os.path.join(model_dir, 'sentiment_model.pkl'))
            # self.sarcasm_model = joblib.load(os.path.join(model_dir, 'sarcasm_model.pkl'))
            
            logger.info("Model loaded successfully")
            
        except FileNotFoundError as e:
            logger.error(f"Model file not found: {e}")
            raise
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
            # Vectorize the input text
            text_vector = self.vectorizer.transform([text])
            
            # Get prediction probability
            # ADJUST THIS based on your model output
            
            # For binary classification (safe=0, toxic=1):
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(text_vector)[0]
                toxicity_score = probabilities[1]  # Probability of toxic class
            else:
                # For models without predict_proba (e.g., SVM with linear kernel)
                prediction = self.model.predict(text_vector)[0]
                toxicity_score = float(prediction)
            
            # Calculate cyberbullying probability
            cyberbullying_prob = min(toxicity_score * 0.92, 1.0)
            
            # Get sentiment
            sentiment = self._predict_sentiment(text, toxicity_score)
            
            # Get sarcasm
            sarcasm = self._predict_sarcasm(text)
            
            return {
                "toxicity_score": round(float(toxicity_score), 2),
                "cyberbullying_prob": round(float(cyberbullying_prob), 2),
                "sarcasm": sarcasm,
                "sentiment": sentiment
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "toxicity_score": 0.0,
                "cyberbullying_prob": 0.0,
                "sarcasm": False,
                "sentiment": "neutral"
            }
    
    def _predict_sentiment(self, text, toxicity_score):
        """
        Predict sentiment.
        Replace with your own sentiment model if you have one.
        """
        # If you have a separate sentiment model:
        # try:
        #     sentiment_vector = self.vectorizer.transform([text])
        #     sentiment_class = self.sentiment_model.predict(sentiment_vector)[0]
        #     return sentiment_class  # e.g., 'positive', 'negative', 'neutral'
        # except:
        #     pass
        
        # Simple rule-based sentiment
        if toxicity_score > 0.6:
            return "negative"
        elif toxicity_score < 0.3:
            return "positive"
        else:
            return "neutral"
    
    def _predict_sarcasm(self, text):
        """
        Predict sarcasm.
        Replace with your own sarcasm detection model if you have one.
        """
        # If you have a sarcasm detection model:
        # try:
        #     sarcasm_vector = self.vectorizer.transform([text])
        #     sarcasm_pred = self.sarcasm_model.predict(sarcasm_vector)[0]
        #     return bool(sarcasm_pred)
        # except:
        #     pass
        
        # Simple rule-based sarcasm detection
        sarcasm_indicators = [
            'oh yeah', 'sure', 'right', 'totally', 'obviously',
            'of course', 'yeah right', 'great job', 'brilliant'
        ]
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in sarcasm_indicators)

# Initialize classifier once
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

# Example of how to save your trained model:
"""
# After training your model:
import joblib

# Save model
joblib.dump(your_trained_model, 'backend/models/cyberbullying_model.pkl')

# Save vectorizer
joblib.dump(your_fitted_vectorizer, 'backend/models/tfidf_vectorizer.pkl')

# Optional: Save other models
joblib.dump(sentiment_model, 'backend/models/sentiment_model.pkl')
joblib.dump(sarcasm_model, 'backend/models/sarcasm_model.pkl')
"""
