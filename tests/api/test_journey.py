import pytest
import requests
import json
from typing import Dict, Any
from datetime import datetime, timedelta

class TestJourneyManagement:
    """Test journey management endpoints"""
    
    BASE_URL = "http://localhost:8000"
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for testing"""
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
    
    def test_get_active_journeys(self, auth_token):
        """Test getting active journeys"""
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "success" in data
        assert data["success"] is True
        assert "data" in data
        
        journeys = data["data"]
        assert isinstance(journeys, list)
        
        # Check journey structure if any exist
        if journeys:
            journey = journeys[0]
            required_fields = ["id", "locationId", "clientId", "date", "status"]
            for field in required_fields:
                assert field in journey
            
            # Check status is valid
            valid_statuses = ["MORNING_PREP", "EN_ROUTE", "ONSITE", "COMPLETED", "AUDITED"]
            assert journey["status"] in valid_statuses
    
    def test_get_active_journeys_unauthorized(self):
        """Test getting active journeys without authentication"""
        response = requests.get(f"{self.BASE_URL}/journey/active")
        assert response.status_code == 401
    
    def test_create_journey(self, auth_token):
        """Test creating a new journey"""
        journey_data = {
            "locationId": "loc_123",
            "clientId": "client_123",
            "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            "truckNumber": "TRUCK-001",
            "notes": "Test journey creation"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/journey/",
            json=journey_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        
        # Should either succeed or return 403 if role doesn't have permission
        assert response.status_code in [200, 403]
        
        if response.status_code == 200:
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "id" in data["data"]
            assert data["data"]["status"] == "MORNING_PREP"  # Default status
    
    def test_create_journey_invalid_data(self, auth_token):
        """Test creating journey with invalid data"""
        # Missing required fields
        invalid_data = {
            "date": "2024-01-15"
            # Missing locationId and clientId
        }
        
        response = requests.post(
            f"{self.BASE_URL}/journey/",
            json=invalid_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 422
    
    def test_get_journey_by_id(self, auth_token):
        """Test getting a specific journey by ID"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Get specific journey
            response = requests.get(
                f"{self.BASE_URL}/journey/{journey_id}",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "journey" in data["data"]
            
            journey = data["data"]["journey"]
            assert journey["id"] == journey_id
    
    def test_get_journey_invalid_id(self, auth_token):
        """Test getting journey with invalid ID"""
        response = requests.get(
            f"{self.BASE_URL}/journey/invalid-id",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 404
    
    def test_update_journey_status(self, auth_token):
        """Test updating journey status"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Update status
            status_update = {
                "status": "EN_ROUTE",
                "notes": "Journey started"
            }
            
            response = requests.patch(
                f"{self.BASE_URL}/journey/{journey_id}/status",
                json=status_update,
                headers={
                    "Authorization": f"Bearer {auth_token}",
                    "Content-Type": "application/json"
                }
            )
            
            # Should either succeed or return 403 if role doesn't have permission
            assert response.status_code in [200, 403]
            
            if response.status_code == 200:
                data = response.json()
                assert data["success"] is True
    
    def test_update_journey_status_invalid(self, auth_token):
        """Test updating journey status with invalid status"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Invalid status
            status_update = {
                "status": "INVALID_STATUS"
            }
            
            response = requests.patch(
                f"{self.BASE_URL}/journey/{journey_id}/status",
                json=status_update,
                headers={
                    "Authorization": f"Bearer {auth_token}",
                    "Content-Type": "application/json"
                }
            )
            
            assert response.status_code == 422
    
    def test_assign_crew(self, auth_token):
        """Test assigning crew to journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Assign crew
            crew_assignment = {
                "crewAssignments": [
                    {
                        "userId": "user_123",
                        "role": "DRIVER"
                    },
                    {
                        "userId": "user_456",
                        "role": "MOVER"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.BASE_URL}/journey/{journey_id}/crew",
                json=crew_assignment,
                headers={
                    "Authorization": f"Bearer {auth_token}",
                    "Content-Type": "application/json"
                }
            )
            
            # Should either succeed or return 403 if role doesn't have permission
            assert response.status_code in [200, 403]
            
            if response.status_code == 200:
                data = response.json()
                assert data["success"] is True
    
    def test_upload_media(self, auth_token):
        """Test uploading media for journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Create a test file
            import io
            test_file = io.BytesIO(b"test image content")
            
            # Upload media
            files = {"files": ("test.jpg", test_file, "image/jpeg")}
            data = {
                "media_type": "PHOTO",
                "tags": "test,upload",
                "notes": "Test media upload"
            }
            
            response = requests.post(
                f"{self.BASE_URL}/journey/{journey_id}/media",
                files=files,
                data=data,
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            # Should either succeed or return 403 if role doesn't have permission
            assert response.status_code in [200, 403]
            
            if response.status_code == 200:
                data = response.json()
                assert data["success"] is True
    
    def test_get_journey_media(self, auth_token):
        """Test getting media for journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Get media
            response = requests.get(
                f"{self.BASE_URL}/journey/{journey_id}/media",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "media" in data["data"]
            
            media = data["data"]["media"]
            assert isinstance(media, list)
    
    def test_update_gps(self, auth_token):
        """Test updating GPS location for journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Update GPS
            gps_update = {
                "latitude": 43.6532,
                "longitude": -79.3832,
                "speed": 25.5,
                "accuracy": 5.0
            }
            
            response = requests.post(
                f"{self.BASE_URL}/journey/{journey_id}/gps",
                json=gps_update,
                headers={
                    "Authorization": f"Bearer {auth_token}",
                    "Content-Type": "application/json"
                }
            )
            
            # Should either succeed or return 403 if role doesn't have permission
            assert response.status_code in [200, 403]
            
            if response.status_code == 200:
                data = response.json()
                assert data["success"] is True
    
    def test_get_gps_tracking(self, auth_token):
        """Test getting GPS tracking data for journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Get GPS tracking
            response = requests.get(
                f"{self.BASE_URL}/journey/{journey_id}/gps",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "gps_data" in data["data"]
            
            gps_data = data["data"]["gps_data"]
            assert isinstance(gps_data, list)
    
    def test_add_journey_entry(self, auth_token):
        """Test adding entry to journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Add entry
            entry = {
                "type": "NOTE",
                "data": {
                    "content": "Test journey entry",
                    "timestamp": datetime.now().isoformat()
                },
                "tag": "FEEDBACK"
            }
            
            response = requests.post(
                f"{self.BASE_URL}/journey/{journey_id}/entries",
                json=entry,
                headers={
                    "Authorization": f"Bearer {auth_token}",
                    "Content-Type": "application/json"
                }
            )
            
            # Should either succeed or return 403 if role doesn't have permission
            assert response.status_code in [200, 403]
            
            if response.status_code == 200:
                data = response.json()
                assert data["success"] is True
    
    def test_get_journey_entries(self, auth_token):
        """Test getting entries for journey"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Get entries
            response = requests.get(
                f"{self.BASE_URL}/journey/{journey_id}/entries",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "entries" in data["data"]
            
            entries = data["data"]["entries"]
            assert isinstance(entries, list)
    
    def test_validate_journey(self, auth_token):
        """Test journey validation"""
        # First get active journeys to get an ID
        response = requests.get(
            f"{self.BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        journeys = response.json()["data"]["journeys"]
        
        if journeys:
            journey_id = journeys[0]["id"]
            
            # Validate journey
            response = requests.post(
                f"{self.BASE_URL}/journey/{journey_id}/validate",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "data" in data
            assert "validation" in data["data"]
            
            validation = data["data"]["validation"]
            assert "isValid" in validation
            assert "errors" in validation
            assert "warnings" in validation 