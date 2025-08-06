import pytest
import requests
from typing import Dict, Any

class TestHealthEndpoint:
    """Test the health check endpoint"""
    
    BASE_URL = "http://localhost:8000"
    
    def test_health_check(self):
        """Test that the health endpoint returns correct status"""
        response = requests.get(f"{self.BASE_URL}/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "success" in data
        assert "message" in data
        assert "status" in data
        assert "version" in data
        assert "modules" in data
        
        # Check values
        assert data["success"] is True
        assert data["status"] == "operational"
        assert data["version"] == "1.0.0"
        assert "C&C CRM API is healthy" in data["message"]
        
        # Check modules
        modules = data["modules"]
        assert "auth" in modules
        assert "journey" in modules
        assert "audit" in modules
        assert "multi_tenant" in modules
        
        # All modules should be active
        for module, status in modules.items():
            assert status == "active"
    
    def test_health_response_time(self):
        """Test that health endpoint responds quickly"""
        import time
        start_time = time.time()
        response = requests.get(f"{self.BASE_URL}/health")
        end_time = time.time()
        
        assert response.status_code == 200
        assert (end_time - start_time) < 1.0  # Should respond in under 1 second 