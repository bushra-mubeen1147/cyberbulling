from flask_jwt_extended import get_jwt_identity
from backend.models.analysis_history import AnalysisHistory
from backend.utils.helpers import format_response, format_error

class HistoryController:
    @staticmethod
    def add_history(data):
        user_id = get_jwt_identity()
        input_text = data.get('text')
        toxicity_score = data.get('toxicity_score')
        cyberbullying_prob = data.get('cyberbullying_prob')
        result_sarcasm = data.get('sarcasm')
        sentiment = data.get('sentiment')
        
        if not input_text:
            return format_error('Text is required', 400)
        
        try:
            history = AnalysisHistory.create(
                int(user_id),
                input_text,
                toxicity_score,
                cyberbullying_prob,
                result_sarcasm,
                sentiment
            )
            
            history['created_at'] = history['created_at'].isoformat() if history['created_at'] else None
            
            return format_response(history, 'History saved successfully', 201)
        except Exception as e:
            return format_error(f'Failed to save history: {str(e)}', 500)
    
    @staticmethod
    def get_user_history(user_id):
        current_user_id = get_jwt_identity()
        
        try:
            history = AnalysisHistory.get_by_user_id(user_id)
            
            for item in history:
                if item['created_at']:
                    item['created_at'] = item['created_at'].isoformat()
            
            return format_response(history)
        except Exception as e:
            return format_error(f'Failed to fetch history: {str(e)}', 500)
