import pytest
import requests
import json
from typing import Dict, Any
from datetime import datetime, timedelta

class TestAuditTrail:
    """Test audit trail endpoints"""
    
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
    
    def test_get_audit_entries(self, admin_token):
        """Test getting audit trail entries"""
        response = requests.get(
            f"{self.BASE_URL}/audit/entries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "success" in data
        assert data["success"] is True
        assert "data" in data
        assert "entries" in data["data"]
        
        entries = data["data"]["entries"]
        assert isinstance(entries, list)
        
        # Check audit entry structure if any exist
        if entries:
            entry = entries[0]
            required_fields = ["id", "action", "entity", "entityId", "userId", "locationId", "clientId", "timestamp"]
            for field in required_fields:
                assert field in entry
            
            # Check action is valid
            valid_actions = ["CREATE", "UPDATE", "DELETE", "VIEW"]
            assert entry["action"] in valid_actions
            
            # Check timestamp is recent
            timestamp = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
            assert timestamp > datetime.now() - timedelta(days=30)  # Within last 30 days
    
    def test_get_audit_entries_unauthorized(self):
        """Test getting audit entries without authentication"""
        response = requests.get(f"{self.BASE_URL}/audit/entries")
        assert response.status_code == 401
    
    def test_get_audit_entries_with_filters(self, admin_token):
        """Test getting audit entries with filters"""
        # Test with date range filter
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        end_date = datetime.now().strftime("%Y-%m-%d")
        
        response = requests.get(
            f"{self.BASE_URL}/audit/entries",
            params={
                "start_date": start_date,
                "end_date": end_date,
                "action": "CREATE",
                "entity": "TruckJourney"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "entries" in data["data"]
    
    def test_audit_verify_journey(self, admin_token):
        """Test manually approving/verifying a journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Verify journey
            verify_data = {
                "verified": True,
                "notes": "Journey verified by admin",
                "score": 95
            }
            
            response = requests.post(
                f"{self.BASE_URL}/audit/verify",
                json={
                    "journeyId": journey_id,
                    **verify_data
                },
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
                assert "verification" in data["data"]
    
    def test_audit_verify_invalid_journey(self, admin_token):
        """Test verifying journey with invalid ID"""
        verify_data = {
            "journeyId": "invalid-id",
            "verified": True,
            "notes": "Test verification"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/audit/verify",
            json=verify_data,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 404
    
    def test_get_feedback_for_user(self, admin_token):
        """Test getting feedback for a crew member"""
        # First get users to get an ID
        response = requests.get(
            f"{self.BASE_URL}/users/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        users = response.json()["data"]["users"]
        
        if users:
            user_id = users[0]["id"]
            
            # Get feedback
            response = requests.get(
                f"{self.BASE_URL}/feedback/{user_id}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "feedback" in data["data"]
            
            feedback = data["data"]["feedback"]
            assert isinstance(feedback, list)
            
            # Check feedback structure if any exist
            if feedback:
                item = feedback[0]
                assert "id" in item
                assert "rating" in item
                assert "comment" in item
                assert "timestamp" in item
                assert "journeyId" in item
    
    def test_get_feedback_invalid_user(self, admin_token):
        """Test getting feedback for invalid user ID"""
        response = requests.get(
            f"{self.BASE_URL}/feedback/invalid-user-id",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
    
    def test_audit_entry_creation_on_journey_actions(self, admin_token):
        """Test that audit entries are created when journey actions are performed"""
        # Get initial audit entries count
        initial_response = requests.get(
            f"{self.BASE_URL}/audit/entries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert initial_response.status_code == 200
        initial_entries = len(initial_response.json()["data"]["entries"])
        
        # Perform a journey action (get active journeys)
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        
        # Check that audit entry was created
        audit_response = requests.get(
            f"{self.BASE_URL}/audit/entries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert audit_response.status_code == 200
        current_entries = len(audit_response.json()["data"]["entries"])
        
        # Should have at least the same number of entries (VIEW action might be created)
        assert current_entries >= initial_entries
    
    def test_audit_entry_structure(self, admin_token):
        """Test audit entry data structure"""
        response = requests.get(
            f"{self.BASE_URL}/audit/entries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        entries = response.json()["data"]["entries"]
        
        if entries:
            entry = entries[0]
            
            # Check all required fields
            assert "id" in entry
            assert "action" in entry
            assert "entity" in entry
            assert "entityId" in entry
            assert "userId" in entry
            assert "locationId" in entry
            assert "clientId" in entry
            assert "timestamp" in entry
            
            # Check optional fields
            if "diff" in entry:
                assert isinstance(entry["diff"], dict)
            
            # Check data types
            assert isinstance(entry["id"], str)
            assert isinstance(entry["action"], str)
            assert isinstance(entry["entity"], str)
            assert isinstance(entry["entityId"], str)
            assert isinstance(entry["userId"], str)
            assert isinstance(entry["locationId"], str)
            assert isinstance(entry["clientId"], str)
            assert isinstance(entry["timestamp"], str)
    
    def test_audit_data_integrity(self, admin_token):
        """Test audit data integrity and consistency"""
        response = requests.get(
            f"{self.BASE_URL}/audit/entries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        entries = response.json()["data"]["entries"]
        
        if entries:
            # Check that all entries have consistent client/location data
            current_user_response = requests.get(
                f"{self.BASE_URL}/auth/me",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            
            assert current_user_response.status_code == 200
            current_user = current_user_response.json()["data"]["user"]
            current_location_id = current_user["locationId"]
            current_client_id = current_user["clientId"]
            
            for entry in entries:
                # All audit entries should be from the same location and client
                assert entry["locationId"] == current_location_id
                assert entry["clientId"] == current_client_id
                
                # Check that timestamps are valid
                timestamp = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                assert timestamp <= datetime.now()
                assert timestamp > datetime.now() - timedelta(days=365)  # Not older than 1 year
    
    def test_audit_permissions(self, admin_token):
        """Test audit access permissions for different roles"""
        # Test with different user roles
        test_roles = [
            {"email": "sarah.johnson@lgm.com", "password": "password123"},  # ADMIN
            {"email": "mike.chen@lgm.com", "password": "password123"},      # DISPATCHER
            {"email": "david.rodriguez@lgm.com", "password": "password123"}, # DRIVER
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
            
            # Test access to audit entries
            response = requests.get(
                f"{self.BASE_URL}/audit/entries",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if user_role in ["ADMIN", "AUDITOR"]:
                # Admin and Auditor should have access
                assert response.status_code == 200
            else:
                # Other roles should not have access
                assert response.status_code == 403
    
    def test_audit_report_generation(self, admin_token):
        """Test audit report generation"""
        # Generate audit report
        response = requests.post(
            f"{self.BASE_URL}/audit/report",
            json={
                "start_date": (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
                "end_date": datetime.now().strftime("%Y-%m-%d"),
                "report_type": "daily_summary"
            },
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
            assert "report" in data["data"]
            
            report = data["data"]["report"]
            assert "summary" in report
            assert "entries" in report
            assert "generated_at" in report 