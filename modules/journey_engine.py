"""
Journey Management Engine - Core business logic for TruckJourney operations
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid

# ===== ENUMS =====

class JourneyStatus(str, Enum):
    MORNING_PREP = "MORNING_PREP"
    EN_ROUTE = "EN_ROUTE"
    ONSITE = "ONSITE"
    COMPLETED = "COMPLETED"
    AUDITED = "AUDITED"

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    DISPATCHER = "DISPATCHER"
    DRIVER = "DRIVER"
    MOVER = "MOVER"
    MANAGER = "MANAGER"
    AUDITOR = "AUDITOR"

class CrewStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    CONFIRMED = "CONFIRMED"
    ON_SITE = "ON_SITE"
    COMPLETED = "COMPLETED"

# ===== VALIDATION RULES =====

JOURNEY_VALIDATION_RULES = {
    "statusTransitions": {
        JourneyStatus.MORNING_PREP: [JourneyStatus.EN_ROUTE],
        JourneyStatus.EN_ROUTE: [JourneyStatus.ONSITE],
        JourneyStatus.ONSITE: [JourneyStatus.COMPLETED],
        JourneyStatus.COMPLETED: [JourneyStatus.AUDITED]
    },
    
    "requiredFields": {
        JourneyStatus.MORNING_PREP: ["crew", "truckNumber"],
        JourneyStatus.EN_ROUTE: ["startTime", "gps"],
        JourneyStatus.ONSITE: ["arrivalTime"],
        JourneyStatus.COMPLETED: ["endTime", "customerSignature"]
    },
    
    "requiredMedia": {
        JourneyStatus.MORNING_PREP: ["vehicleInspection"],
        JourneyStatus.ONSITE: ["sitePhotos"],
        JourneyStatus.COMPLETED: ["completionPhotos", "customerSignature"]
    }
}

JOURNEY_PERMISSIONS = {
    UserRole.DISPATCHER: {
        "create": True,
        "read": True,
        "update": True,
        "delete": False,
        "assignCrew": True,
        "updateStatus": [JourneyStatus.MORNING_PREP, JourneyStatus.EN_ROUTE, JourneyStatus.ONSITE, JourneyStatus.COMPLETED]
    },
    UserRole.DRIVER: {
        "create": False,
        "read": True,
        "update": ["status", "notes", "gps"],
        "delete": False,
        "assignCrew": False,
        "updateStatus": [JourneyStatus.EN_ROUTE, JourneyStatus.ONSITE, JourneyStatus.COMPLETED]
    },
    UserRole.MOVER: {
        "create": False,
        "read": True,
        "update": ["notes", "media"],
        "delete": False,
        "assignCrew": False,
        "updateStatus": [JourneyStatus.ONSITE, JourneyStatus.COMPLETED]
    }
}

# ===== JOURNEY ENGINE =====

class JourneyEngine:
    """Core business logic for journey management"""
    
    def __init__(self):
        self.journeys = {}  # TODO: Replace with database storage
    
    def create_journey(self, journey_data: Dict[str, Any], user_id: str, user_role: UserRole) -> Tuple[bool, Dict[str, Any], str]:
        """Create a new journey with validation"""
        
        # Check permissions
        if not JOURNEY_PERMISSIONS.get(user_role, {}).get("create", False):
            return False, {}, "User does not have permission to create journeys"
        
        # Validate required fields
        required_fields = ["locationId", "clientId", "date"]
        for field in required_fields:
            if field not in journey_data:
                return False, {}, f"Missing required field: {field}"
        
        # Generate journey ID
        journey_id = f"journey_{uuid.uuid4().hex[:8]}"
        
        # Create journey object
        journey = {
            "id": journey_id,
            "locationId": journey_data["locationId"],
            "clientId": journey_data["clientId"],
            "date": journey_data["date"],
            "status": JourneyStatus.MORNING_PREP,
            "truckNumber": journey_data.get("truckNumber"),
            "moveSourceId": journey_data.get("moveSourceId"),
            "startTime": None,
            "endTime": None,
            "notes": journey_data.get("notes"),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
            "assignedCrew": [],
            "entries": [],
            "media": [],
            "createdBy": user_id
        }
        
        # Store journey
        self.journeys[journey_id] = journey
        
        return True, journey, "Journey created successfully"
    
    def update_journey_status(self, journey_id: str, new_status: JourneyStatus, user_id: str, user_role: UserRole, **kwargs) -> Tuple[bool, Dict[str, Any], str]:
        """Update journey status with validation"""
        
        # Get journey
        journey = self.journeys.get(journey_id)
        if not journey:
            return False, {}, "Journey not found"
        
        # Check permissions
        user_permissions = JOURNEY_PERMISSIONS.get(user_role, {})
        if new_status not in user_permissions.get("updateStatus", []):
            return False, {}, f"User cannot update status to {new_status}"
        
        # Validate status transition
        current_status = JourneyStatus(journey["status"])
        allowed_transitions = JOURNEY_VALIDATION_RULES["statusTransitions"].get(current_status, [])
        if new_status not in allowed_transitions:
            return False, {}, f"Invalid status transition from {current_status} to {new_status}"
        
        # Update status
        old_status = journey["status"]
        journey["status"] = new_status.value
        journey["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        # Handle status-specific logic
        if new_status == JourneyStatus.EN_ROUTE:
            journey["startTime"] = kwargs.get("timestamp") or datetime.utcnow().isoformat() + "Z"
        elif new_status == JourneyStatus.COMPLETED:
            journey["endTime"] = kwargs.get("timestamp") or datetime.utcnow().isoformat() + "Z"
        
        # Add status change entry
        self._add_journey_entry(journey_id, {
            "type": "STATUS_CHANGE",
            "data": {
                "oldStatus": old_status,
                "newStatus": new_status.value,
                "timestamp": journey["updatedAt"],
                "userId": user_id
            }
        })
        
        return True, journey, f"Journey status updated to {new_status.value}"
    
    def assign_crew(self, journey_id: str, crew_assignments: List[Dict[str, Any]], user_id: str, user_role: UserRole) -> Tuple[bool, Dict[str, Any], str]:
        """Assign crew to journey"""
        
        # Check permissions
        if not JOURNEY_PERMISSIONS.get(user_role, {}).get("assignCrew", False):
            return False, {}, "User does not have permission to assign crew"
        
        # Get journey
        journey = self.journeys.get(journey_id)
        if not journey:
            return False, {}, "Journey not found"
        
        # Validate crew assignments
        for assignment in crew_assignments:
            if "userId" not in assignment or "role" not in assignment:
                return False, {}, "Invalid crew assignment format"
        
        # Clear existing crew
        journey["assignedCrew"] = []
        
        # Add new crew assignments
        for assignment in crew_assignments:
            crew_member = {
                "id": f"crew_{uuid.uuid4().hex[:8]}",
                "journeyId": journey_id,
                "userId": assignment["userId"],
                "role": assignment["role"],
                "assignedAt": datetime.utcnow().isoformat() + "Z",
                "status": CrewStatus.ASSIGNED.value,
                "assignedBy": user_id
            }
            journey["assignedCrew"].append(crew_member)
        
        journey["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        return True, journey, "Crew assigned successfully"
    
    def update_crew_status(self, journey_id: str, crew_id: str, new_status: CrewStatus, user_id: str) -> Tuple[bool, Dict[str, Any], str]:
        """Update crew member status"""
        
        journey = self.journeys.get(journey_id)
        if not journey:
            return False, {}, "Journey not found"
        
        # Find crew member
        crew_member = next((c for c in journey["assignedCrew"] if c["id"] == crew_id), None)
        if not crew_member:
            return False, {}, "Crew member not found"
        
        # Update status
        crew_member["status"] = new_status.value
        crew_member["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        journey["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        return True, journey, f"Crew status updated to {new_status.value}"
    
    def add_journey_entry(self, journey_id: str, entry_data: Dict[str, Any], user_id: str) -> Tuple[bool, Dict[str, Any], str]:
        """Add entry to journey (GPS, notes, media, etc.)"""
        
        journey = self.journeys.get(journey_id)
        if not journey:
            return False, {}, "Journey not found"
        
        entry = self._add_journey_entry(journey_id, entry_data)
        
        return True, entry, "Entry added successfully"
    
    def _add_journey_entry(self, journey_id: str, entry_data: Dict[str, Any]) -> Dict[str, Any]:
        """Internal method to add journey entry"""
        
        entry = {
            "id": f"entry_{uuid.uuid4().hex[:8]}",
            "journeyId": journey_id,
            "createdBy": entry_data.get("createdBy", "system"),
            "type": entry_data["type"],
            "data": entry_data["data"],
            "tag": entry_data.get("tag"),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        journey = self.journeys[journey_id]
        journey["entries"].append(entry)
        journey["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        return entry
    
    def get_journey(self, journey_id: str, user_id: str, user_role: UserRole) -> Tuple[bool, Dict[str, Any], str]:
        """Get journey by ID with permission check"""
        
        journey = self.journeys.get(journey_id)
        if not journey:
            return False, {}, "Journey not found"
        
        # Check read permissions
        if not JOURNEY_PERMISSIONS.get(user_role, {}).get("read", False):
            return False, {}, "User does not have permission to read journeys"
        
        return True, journey, "Journey retrieved successfully"
    
    def get_journeys_by_location(self, location_id: str, user_id: str, user_role: UserRole, filters: Dict[str, Any] = None) -> Tuple[bool, List[Dict[str, Any]], str]:
        """Get journeys for a specific location with filtering"""
        
        # Check read permissions
        if not JOURNEY_PERMISSIONS.get(user_role, {}).get("read", False):
            return False, [], "User does not have permission to read journeys"
        
        # Filter journeys by location
        journeys = [j for j in self.journeys.values() if j["locationId"] == location_id]
        
        # Apply additional filters
        if filters:
            if "status" in filters:
                journeys = [j for j in journeys if j["status"] in filters["status"]]
            if "date" in filters:
                target_date = filters["date"]
                journeys = [j for j in journeys if j["date"].startswith(target_date)]
            if "crew" in filters:
                crew_id = filters["crew"]
                journeys = [j for j in journeys if any(c["userId"] == crew_id for c in j["assignedCrew"])]
        
        return True, journeys, f"Found {len(journeys)} journeys"
    
    def delete_journey(self, journey_id: str, user_id: str, user_role: UserRole) -> Tuple[bool, str]:
        """Delete journey with permission check"""
        
        # Check delete permissions
        if not JOURNEY_PERMISSIONS.get(user_role, {}).get("delete", False):
            return False, "User does not have permission to delete journeys"
        
        if journey_id not in self.journeys:
            return False, "Journey not found"
        
        del self.journeys[journey_id]
        return True, "Journey deleted successfully"
    
    def validate_journey_completion(self, journey_id: str) -> Tuple[bool, List[str]]:
        """Validate if journey meets completion requirements"""
        
        journey = self.journeys.get(journey_id)
        if not journey:
            return False, ["Journey not found"]
        
        errors = []
        
        # Check required fields for completion
        required_fields = JOURNEY_VALIDATION_RULES["requiredFields"].get(JourneyStatus.COMPLETED, [])
        for field in required_fields:
            if field == "endTime" and not journey.get("endTime"):
                errors.append("End time is required for completion")
            elif field == "customerSignature":
                # Check if customer signature exists in media
                has_signature = any(m.get("type") == "SIGNATURE" for m in journey.get("media", []))
                if not has_signature:
                    errors.append("Customer signature is required for completion")
        
        # Check required media for completion
        required_media = JOURNEY_VALIDATION_RULES["requiredMedia"].get(JourneyStatus.COMPLETED, [])
        for media_type in required_media:
            if media_type == "completionPhotos":
                has_photos = any(m.get("type") == "PHOTO" for m in journey.get("media", []))
                if not has_photos:
                    errors.append("Completion photos are required")
            elif media_type == "customerSignature":
                has_signature = any(m.get("type") == "SIGNATURE" for m in journey.get("media", []))
                if not has_signature:
                    errors.append("Customer signature is required")
        
        return len(errors) == 0, errors

# ===== INSTANCE =====

journey_engine = JourneyEngine() 