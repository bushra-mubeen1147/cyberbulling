from backend.utils.classifier import classify_text
from backend.utils.helpers import format_response, format_error

class AnalysisController:
    @staticmethod
    def analyze_text(data):
        text = data.get('text')
        
        if not text or not text.strip():
            return format_error('Text is required for analysis', 400)
        
        try:
            result = classify_text(text)
            return format_response(result, 'Analysis completed successfully')
        except Exception as e:
            return format_error(f'Analysis failed: {str(e)}', 500)
