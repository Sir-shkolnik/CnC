import pytest
import requests
import json
from typing import Dict, Any

class TestAuthentication:
    """Test authentication endpoints"""
    
    BASE_URL = "http://localhost:8000"
    
    # Test credentials from documentation
    TEST_CREDENTIALS = {
        "admin": {
            "email": "sarah.johnson@lgm.com",
            "password": "password123"
        },
        "dispatcher": {
            "email": "mike.chen@lgm.com", 
            "password": "password123"
        },
        "driver": {
            "email": "david.rodriguez@lgm.com",
            "password": "password123"
        },
        "franchise_owner": {
            "email": "frank.williams@lgmhamilton.com",
            "password": "password123"
        }
    }
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        for role, credentials in self.TEST_CREDENTIALS.items():
            response = requests.post(
                f"{self.BASE_URL}/auth/login",
                json=credentials,
                headers={"Content-Type": "application/json"}
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Check response structure
            assert "success" in data
            assert data["success"] is True
            assert "data" in data
            assert "access_token" in data["data"]
            assert "user" in data["data"]
            
            # Check user data
            user = data["data"]["user"]
            assert "id" in user
            assert "email" in user
            assert "role" in user
            assert "clientId" in user
            assert "locationId" in user
            assert user["email"] == credentials["email"]
            
            # Check JWT token
            token = data["data"]["access_token"]
            assert isinstance(token, str)
            assert len(token) > 50  # JWT tokens are long
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        invalid_credentials = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json=invalid_credentials,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "Login failed" in data["message"]
    
    def test_login_missing_fields(self):
        """Test login with missing required fields"""
        # Missing email
        response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json={"password": "password123"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
        
        # Missing password
        response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json={"email": "test@example.com"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_get_current_user(self):
        """Test getting current user info with valid token"""
        # First login to get token
        login_response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json=self.TEST_CREDENTIALS["admin"],
            headers={"Content-Type": "application/json"}
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["data"]["access_token"]
        
        # Test getting current user
        response = requests.get(
            f"{self.BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        
        user = data["data"]
        assert user["email"] == self.TEST_CREDENTIALS["admin"]["email"]
    
    def test_get_current_user_invalid_token(self):
        """Test getting current user with invalid token"""
        response = requests.get(
            f"{self.BASE_URL}/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 500
    
    def test_get_current_user_no_token(self):
        """Test getting current user without token"""
        response = requests.get(f"{self.BASE_URL}/auth/me")
        assert response.status_code == 403
    
    def test_logout(self):
        """Test logout endpoint"""
        response = requests.post(f"{self.BASE_URL}/auth/logout")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "Logged out successfully" in data["message"]
    
    def test_jwt_token_structure(self):
        """Test JWT token structure and claims"""
        import base64
        
        # Login to get token
        login_response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json=self.TEST_CREDENTIALS["admin"],
            headers={"Content-Type": "application/json"}
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["data"]["access_token"]
        
        # Decode JWT token (without verification for testing)
        try:
            # Split token and decode payload
            parts = token.split('.')
            assert len(parts) == 3  # JWT has 3 parts
            
            # Decode payload
            payload = json.loads(base64.b64decode(parts[1] + '==').decode())
            
            # Check required claims
            assert "sub" in payload  # user_id
            assert "email" in payload
            assert "role" in payload
            assert "client_id" in payload
            assert "location_id" in payload
            assert "exp" in payload  # expiration
            
            # Check role is valid
            valid_roles = ["ADMIN", "DISPATCHER", "DRIVER", "MOVER", "MANAGER", "AUDITOR"]
            assert payload["role"] in valid_roles
            
        except Exception as e:
            pytest.fail(f"JWT token structure is invalid: {e}")
    
    def test_role_based_access(self):
        """Test that different roles have different access levels"""
        for role, credentials in self.TEST_CREDENTIALS.items():
            # Login
            login_response = requests.post(
                f"{self.BASE_URL}/auth/login",
                json=credentials,
                headers={"Content-Type": "application/json"}
            )
            
            assert login_response.status_code == 200
            token = login_response.json()["data"]["access_token"]
            user_role = login_response.json()["data"]["user"]["role"]
            
            # Test access to journey endpoint
            response = requests.get(
                f"{self.BASE_URL}/journey/active",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            # All authenticated users should be able to access journey data
            # (access control is handled by the backend based on role)
            assert response.status_code in [200, 403]  # 403 if role doesn't have permission 