from backend.utils.trends_fetcher import fetch_twitter_trends, SUPPORTED_LOCATIONS, LOCATION_LABELS
from backend.utils.helpers import format_response, format_error


class TrendsController:

    @staticmethod
    def get_trends(location: str = 'worldwide'):
        try:
            data = fetch_twitter_trends(location)
            return format_response(data)
        except RuntimeError as e:
            return format_error(str(e), 503)
        except Exception as e:
            return format_error(f'Failed to fetch trends: {str(e)}', 500)

    @staticmethod
    def get_locations():
        locations = [
            {'value': k, 'label': LOCATION_LABELS[k]}
            for k in SUPPORTED_LOCATIONS
        ]
        return format_response(locations)
