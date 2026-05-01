# Backend Unit Tests
# Run with: pytest backend/tests/ -v

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app


@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SKIP_DB_INIT'] = '1'
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health endpoint returns healthy status"""
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert 'message' in data


class TestAuthRoutes:
    """Test authentication routes"""
    
    def test_signup_missing_fields(self, client):
        """Test signup with missing fields returns error"""
        response = client.post('/signup', json={})
        assert response.status_code in [400, 500]
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields returns error"""
        response = client.post('/login', json={})
        assert response.status_code in [400, 500]


class TestAnalysisRoutes:
    """Test analysis routes"""
    
    def test_analyze_missing_text(self, client):
        """Test analyze endpoint without text"""
        response = client.post('/analyze', json={})
        assert response.status_code in [400, 500]
    
    def test_analyze_with_text(self, client):
        """Test analyze endpoint with text"""
        response = client.post('/analyze', json={'text': 'Hello world'})
        assert response.status_code in [200, 500]


class TestActivityRoutes:
    """Test activity routes"""
    
    def test_activity_requires_auth(self, client):
        """Test activity endpoint requires JWT"""
        response = client.get('/activity/1')
        assert response.status_code == 401


class TestHistoryRoutes:
    """Test history routes"""
    
    def test_history_requires_auth(self, client):
        """Test history endpoint requires JWT"""
        response = client.get('/history/1')
        assert response.status_code == 401


class TestAdminRoutes:
    """Test admin routes"""
    
    def test_admin_users_requires_auth(self, client):
        """Test admin users endpoint requires JWT"""
        response = client.get('/admin/users')
        assert response.status_code == 401


if __name__ == '__main__':
    pytest.main([__file__, '-v'])