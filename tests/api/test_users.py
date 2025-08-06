import pytest
import requests
import json
from typing import Dict, Any

class TestUserManagement:
    """Test user management endpoints"""
    
    BASE_URL = "http://localhost:8000"
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token for testing"""
        credentials = {
            "email": "sarah.johnson@lgm.com",
            "password": "password123"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json=credentials,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        return response.json()["data"]["access_token"]
    
    def test_get_users(self, admin_token):
        """Test getting users for current location"""
        response = requests.get(
            f"{self.BASE_URL}/users/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "success" in data
        assert data["success"] is True
        assert "data" in data
        assert "users" in data["data"]
        
        users = data["data"]["users"]
        assert isinstance(users, list)
        
        # Check user structure if any exist
        if users:
            user = users[0]
            required_fields = ["id", "name", "email", "role", "locationId", "clientId", "status"]
            for field in required_fields:
                assert field in user
            
            # Check role is valid
            valid_roles = ["ADMIN", "DISPATCHER", "DRIVER", "MOVER", "MANAGER", "AUDITOR"]
            assert user["role"] in valid_roles
            
            # Check status is valid
            valid_statuses = ["ACTIVE", "INACTIVE", "SUSPENDED"]
            assert user["status"] in valid_statuses
    
    def test_get_users_unauthorized(self):
        """Test getting users without authentication"""
        response = requests.get(f"{self.BASE_URL}/users/")
        assert response.status_code == 401
    
    def test_create_user(self, admin_token):
        """Test creating a new user"""
        user_data = {
            "name": "Test User",
            "email": "test.user@example.com",
            "role": "DRIVER",
            "locationId": "loc_123",
            "clientId": "client_123",
            "password": "securepassword123"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/users/",
            json=user_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        # Should either succeed or return 403 if role doesn't have permission
        assert response.status_code in [200, 403]
        
        if response.status_code == 200:
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "user" in data["data"]
            
            user = data["data"]["user"]
            assert user["name"] == user_data["name"]
            assert user["email"] == user_data["email"]
            assert user["role"] == user_data["role"]
    
    def test_create_user_invalid_data(self, admin_token):
        """Test creating user with invalid data"""
        # Missing required fields
        invalid_data = {
            "name": "Test User"
            # Missing email, role, locationId, clientId
        }
        
        response = requests.post(
            f"{self.BASE_URL}/users/",
            json=invalid_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 422
    
    def test_create_user_duplicate_email(self, admin_token):
        """Test creating user with duplicate email"""
        user_data = {
            "name": "Duplicate User",
            "email": "sarah.johnson@lgm.com",  # Existing email
            "role": "DRIVER",
            "locationId": "loc_123",
            "clientId": "client_123",
            "password": "securepassword123"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/users/",
            json=user_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        # Should fail due to duplicate email
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert "email" in data["message"].lower()
    
    def test_update_user(self, admin_token):
        """Test updating user information"""
        # First get users to get an ID
        response = requests.get(
            f"{self.BASE_URL}/users/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        users = response.json()["data"]["users"]
        
        if users:
            user_id = users[0]["id"]
            
            # Update user
            update_data = {
                "name": "Updated Name",
                "role": "MOVER",
                "status": "ACTIVE"
            }
            
            response = requests.patch(
                f"{self.BASE_URL}/users/{user_id}",
                json=update_data,
                headers={
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                }
            )
            
            # Should either succeed or return 403 if role doesn't have permission
            assert response.status_code in [200, 403]
            
            if response.status_code == 200:
                data = response.json()
                assert data["success"] is True
                assert "data" in data
                assert "user" in data["data"]
                
                user = data["data"]["user"]
                assert user["name"] == update_data["name"]
                assert user["role"] == update_data["role"]
    
    def test_update_user_invalid_id(self, admin_token):
        """Test updating user with invalid ID"""
        update_data = {
            "name": "Updated Name"
        }
        
        response = requests.patch(
            f"{self.BASE_URL}/users/invalid-id",
            json=update_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 404
    
    def test_get_crew_scoreboard(self, admin_token):
        """Test getting crew scoreboard"""
        response = requests.get(
            f"{self.BASE_URL}/crew/scoreboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "success" in data
        assert data["success"] is True
        assert "data" in data
        assert "crew" in data["data"]
        
        crew = data["data"]["crew"]
        assert isinstance(crew, list)
        
        # Check crew member structure if any exist
        if crew:
            member = crew[0]
            assert "id" in member
            assert "name" in member
            assert "role" in member
            assert "performance" in member
            assert "rating" in member
    
    def test_get_crew_scoreboard_unauthorized(self):
        """Test getting crew scoreboard without authentication"""
        response = requests.get(f"{self.BASE_URL}/crew/scoreboard")
        assert response.status_code == 401
    
    def test_user_roles_and_permissions(self, admin_token):
        """Test that different user roles have different permissions"""
        # Test with different user roles
        test_roles = [
            {"email": "sarah.johnson@lgm.com", "password": "password123"},  # ADMIN
            {"email": "mike.chen@lgm.com", "password": "password123"},      # DISPATCHER
            {"email": "david.rodriguez@lgm.com", "password": "password123"}, # DRIVER
            {"email": "frank.williams@lgmhamilton.com", "password": "password123"} # FRANCHISE_OWNER
        ]
        
        for credentials in test_roles:
            # Login
            login_response = requests.post(
                f"{self.BASE_URL}/auth/login",
                json=credentials,
                headers={"Content-Type": "application/json"}
            )
            
            assert login_response.status_code == 200
            token = login_response.json()["data"]["token"]
            user_role = login_response.json()["data"]["user"]["role"]
            
            # Test access to user management (should be restricted to admin)
            response = requests.get(
                f"{self.BASE_URL}/users/",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if user_role == "ADMIN":
                assert response.status_code == 200
            else:
                # Non-admin users should not have access to user management
                assert response.status_code == 403
    
    def test_user_data_isolation(self, admin_token):
        """Test that users can only see data from their location"""
        # Get current user info
        response = requests.get(
            f"{self.BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        current_user = response.json()["data"]["user"]
        current_location_id = current_user["locationId"]
        current_client_id = current_user["clientId"]
        
        # Get users
        response = requests.get(
            f"{self.BASE_URL}/users/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        users = response.json()["data"]["users"]
        
        # All users should be from the same location and client
        for user in users:
            assert user["locationId"] == current_location_id
            assert user["clientId"] == current_client_id
    
    def test_user_validation(self, admin_token):
        """Test user data validation"""
        # Test invalid email format
        invalid_user_data = {
            "name": "Test User",
            "email": "invalid-email",
            "role": "DRIVER",
            "locationId": "loc_123",
            "clientId": "client_123",
            "password": "securepassword123"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/users/",
            json=invalid_user_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 422
        
        # Test invalid role
        invalid_role_data = {
            "name": "Test User",
            "email": "test@example.com",
            "role": "INVALID_ROLE",
            "locationId": "loc_123",
            "clientId": "client_123",
            "password": "securepassword123"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/users/",
            json=invalid_role_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 422
        
        # Test weak password
        weak_password_data = {
            "name": "Test User",
            "email": "test@example.com",
            "role": "DRIVER",
            "locationId": "loc_123",
            "clientId": "client_123",
            "password": "123"  # Too short
        }
        
        response = requests.post(
            f"{self.BASE_URL}/users/",
            json=weak_password_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 422 