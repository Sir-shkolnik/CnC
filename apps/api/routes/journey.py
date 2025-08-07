from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
import sys
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Import authentication
from .auth import verify_token

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'modules'))

# Import business logic modules
try:
    from journey_engine import journey_engine, JourneyStatus, UserRole, CrewStatus
    from media_upload import media_handler, MediaType
    from websocket_server import journey_event_broadcaster
    from gps_tracking import gps_tracker, location_service
    from notifications import notification_service, NotificationType
    from validation import business_logic_validator
except ImportError as e:
    print(f"Warning: Could not import business logic modules: {e}")
    # Create placeholder classes for development
    from enum import Enum
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
    
    class MediaType(str, Enum):
        PHOTO = "PHOTO"
        VIDEO = "VIDEO"
        DOCUMENT = "DOCUMENT"
        SIGNATURE = "SIGNATURE"
    
    class NotificationType(str, Enum):
        JOURNEY_STATUS_CHANGE = "journey_status_change"
        CREW_ASSIGNMENT = "crew_assignment"
        MEDIA_UPLOAD = "media_upload"
        GPS_UPDATE = "gps_update"
        CHAT_MESSAGE = "chat_message"
        SYSTEM_ALERT = "system_alert"
        PERFORMANCE_ALERT = "performance_alert"
        COMPLIANCE_ALERT = "compliance_alert"
    
    # Create placeholder instances
    journey_engine = None
    media_handler = None
    journey_event_broadcaster = None
    gps_tracker = None
    location_service = None
    notification_service = None
    business_logic_validator = None

router = APIRouter()

# ===== PYDANTIC MODELS =====

class JourneyCreate(BaseModel):
    locationId: str
    clientId: str
    date: str
    truckNumber: Optional[str] = None
    moveSourceId: Optional[str] = None
    notes: Optional[str] = None

class JourneyUpdate(BaseModel):
    status: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    notes: Optional[str] = None

class JourneyStatusUpdate(BaseModel):
    status: str
    timestamp: Optional[str] = None
    location: Optional[Dict[str, float]] = None
    notes: Optional[str] = None

class CrewAssignment(BaseModel):
    crewAssignments: List[Dict[str, str]]

class CrewStatusUpdate(BaseModel):
    status: str
    timestamp: Optional[str] = None

class JourneyEntry(BaseModel):
    type: str
    data: Dict[str, Any]
    tag: Optional[str] = None

class GPSUpdate(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = None
    accuracy: Optional[float] = None

# ===== HELPER FUNCTIONS =====

def get_db_connection():
    """Get database connection"""
    import os
    from urllib.parse import urlparse
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    if DATABASE_URL:
        # Parse DATABASE_URL for psycopg2
        parsed = urlparse(DATABASE_URL)
        return psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],  # Remove leading slash
            user=parsed.username,
            password=parsed.password
        )
    else:
        # Fallback to individual environment variables
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "postgres"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "c_and_c_crm"),
            user=os.getenv("DB_USER", "c_and_c_user"),
            password=os.getenv("DB_PASSWORD", "c_and_c_password")
        )

def get_current_user(current_user: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
    """Get current user from JWT token"""
    return current_user

# ===== JOURNEY CRUD ENDPOINTS =====

@router.get("/active")
async def get_active_journeys(current_user: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
    """Get all active journeys for the current location"""
    
    try:
        # Check if business logic modules are available
        if journey_engine is None:
            # Return empty list when no business logic available
            return {
                "success": True,
                "data": [],
                "message": "No active journeys found"
            }
        
        # Handle super admin vs regular user
        if current_user.get("user_type") == "super_admin":
            # Super admin can see all journeys
            success, journeys, message = journey_engine.get_all_journeys(
                current_user["id"],
                UserRole(current_user["role"])
            )
        else:
            # Regular users can only see journeys from their location
            location_id = current_user.get("locationId") or current_user.get("location_id")
            if not location_id:
                return {
                    "success": False,
                    "error": "Missing tenant information",
                    "message": "User must be associated with a client and location"
                }
            
            success, journeys, message = journey_engine.get_journeys_by_location(
                location_id,
                current_user["id"],
                UserRole(current_user["role"])
            )
        
        if not success:
            return {
                "success": False,
                "error": "Failed to retrieve journeys",
                "message": message
            }
        
        return {
            "success": True,
            "data": journeys,
            "message": message
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": "Database error",
            "message": str(e)
        }

@router.get("/{journey_id}")
async def get_journey(journey_id: str) -> Dict[str, Any]:
    """Get a specific journey by ID"""
    current_user = get_current_user()
    
    success, journey, message = journey_engine.get_journey(
        journey_id,
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Journey not found",
            "message": message
        }
    
    # Get journey media
    media_success, media, _ = media_handler.get_journey_media(journey_id)
    if media_success:
        journey["media"] = media
    
    # Get GPS tracking data
    gps_summary = gps_tracker.get_track_summary(journey_id)
    if gps_summary:
        journey["gps_tracking"] = gps_summary
    
    return {
        "success": True,
        "data": journey,
        "message": "Journey retrieved successfully"
    }

@router.post("/")
async def create_journey(journey: JourneyCreate) -> Dict[str, Any]:
    """Create a new journey"""
    
    # Check if business logic modules are available
    if journey_engine is None:
        # Return demo response if modules not available
        new_journey = {
            "id": f"journey_{datetime.utcnow().timestamp():.0f}",
            "locationId": journey.locationId,
            "clientId": journey.clientId,
            "date": journey.date,
            "status": "MORNING_PREP",
            "truckNumber": journey.truckNumber,
            "moveSourceId": journey.moveSourceId,
            "startTime": None,
            "endTime": None,
            "notes": journey.notes,
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
            "assignedCrew": [],
            "entries": [],
            "media": []
        }
        
        return {
            "success": True,
            "data": new_journey,
            "message": "Journey created successfully (demo mode)"
        }
    
    current_user = get_current_user()
    
    # Validate permissions
    if not business_logic_validator.validate_permissions(
        current_user["role"], "create", "journey"
    ):
        return {
            "success": False,
            "error": "Permission denied",
            "message": "User does not have permission to create journeys"
        }
    
    # Validate journey data
    is_valid, errors = business_logic_validator.journey_validator.validate_journey_creation(
        journey.dict()
    )
    
    if not is_valid:
        return {
            "success": False,
            "error": "Validation failed",
            "message": "Invalid journey data",
            "errors": errors
        }
    
    # Create journey
    success, journey_data, message = journey_engine.create_journey(
        journey.dict(),
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to create journey",
            "message": message
        }
    
    # Broadcast journey creation event
    await journey_event_broadcaster.journey_created(journey_data)
    
    # Send notification to relevant users
    notification_service.create_notification(
        NotificationType.JOURNEY_STATUS_CHANGE,
        current_user["id"],
        {
            "journey_id": journey_data["id"],
            "old_status": "NONE",
            "new_status": journey_data["status"]
        }
    )
    
    return {
        "success": True,
        "data": journey_data,
        "message": "Journey created successfully"
    }

@router.patch("/{journey_id}")
async def update_journey(journey_id: str, updates: JourneyUpdate) -> Dict[str, Any]:
    """Update a journey"""
    current_user = get_current_user()
    
    # Validate permissions
    if not business_logic_validator.validate_permissions(
        current_user["role"], "update", "journey"
    ):
        return {
            "success": False,
            "error": "Permission denied",
            "message": "User does not have permission to update journeys"
        }
    
    # Get current journey
    success, journey, message = journey_engine.get_journey(
        journey_id,
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Journey not found",
            "message": message
        }
    
    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        journey[field] = value
    
    journey["updatedAt"] = datetime.utcnow().isoformat() + "Z"
    
    return {
        "success": True,
        "data": journey,
        "message": "Journey updated successfully"
    }

@router.delete("/{journey_id}")
async def delete_journey(journey_id: str) -> Dict[str, Any]:
    """Delete a journey"""
    current_user = get_current_user()
    
    # Validate permissions
    if not business_logic_validator.validate_permissions(
        current_user["role"], "delete", "journey"
    ):
        return {
            "success": False,
            "error": "Permission denied",
            "message": "User does not have permission to delete journeys"
        }
    
    success, message = journey_engine.delete_journey(
        journey_id,
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to delete journey",
            "message": message
        }
    
    return {
        "success": True,
        "message": "Journey deleted successfully"
    }

# ===== STATUS MANAGEMENT ENDPOINTS =====

@router.patch("/{journey_id}/status")
async def update_journey_status(journey_id: str, status_update: JourneyStatusUpdate) -> Dict[str, Any]:
    """Update journey status"""
    
    # Check if business logic modules are available
    if journey_engine is None:
        # Return demo response if modules not available
        return {
            "success": True,
            "data": {
                "id": journey_id,
                "status": status_update.status,
                "updatedAt": datetime.utcnow().isoformat() + "Z"
            },
            "message": f"Journey status updated to {status_update.status} (demo mode)"
        }
    
    current_user = get_current_user()
    
    # Get current journey
    success, journey, message = journey_engine.get_journey(
        journey_id,
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Journey not found",
            "message": message
        }
    
    # Update status
    old_status = journey["status"]
    success, updated_journey, message = journey_engine.update_journey_status(
        journey_id,
        JourneyStatus(status_update.status),
        current_user["id"],
        UserRole(current_user["role"]),
        timestamp=status_update.timestamp
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to update status",
            "message": message
        }
    
    # Broadcast status update
    await journey_event_broadcaster.journey_status_updated(
        journey_id, old_status, status_update.status, current_user["id"]
    )
    
    # Handle GPS tracking
    if status_update.location:
        gps_tracker.add_tracking_point(journey_id, status_update.location)
        
        # Broadcast GPS update
        await journey_event_broadcaster.entry_added(
            journey_id,
            {
                "type": "GPS",
                "data": status_update.location
            },
            current_user["id"]
        )
    
    # Send notifications
    notification_service.create_notification(
        NotificationType.JOURNEY_STATUS_CHANGE,
        current_user["id"],
        {
            "journey_id": journey_id,
            "old_status": old_status,
            "new_status": status_update.status
        }
    )
    
    return {
        "success": True,
        "data": updated_journey,
        "message": f"Journey status updated to {status_update.status}"
    }

# ===== CREW MANAGEMENT ENDPOINTS =====

@router.post("/{journey_id}/crew")
async def assign_crew(journey_id: str, crew_assignment: CrewAssignment) -> Dict[str, Any]:
    """Assign crew to journey"""
    
    # Check if business logic modules are available
    if journey_engine is None:
        # Return demo response if modules not available
        crew_data = []
        for assignment in crew_assignment.crewAssignments:
            crew_data.append({
                "id": f"crew_{len(crew_data) + 1:03d}",
                "journeyId": journey_id,
                "userId": assignment["userId"],
                "role": assignment["role"],
                "assignedAt": datetime.utcnow().isoformat() + "Z",
                "status": "ASSIGNED"
            })
        
        return {
            "success": True,
            "data": {
                "id": journey_id,
                "assignedCrew": crew_data,
                "updatedAt": datetime.utcnow().isoformat() + "Z"
            },
            "message": "Crew assigned successfully (demo mode)"
        }
    
    current_user = get_current_user()
    
    # Validate permissions
    if not business_logic_validator.validate_permissions(
        current_user["role"], "assign", "crew"
    ):
        return {
            "success": False,
            "error": "Permission denied",
            "message": "User does not have permission to assign crew"
        }
    
    # Validate crew assignment
    is_valid, errors = business_logic_validator.journey_validator.validate_crew_assignment(
        crew_assignment.crewAssignments
    )
    
    if not is_valid:
        return {
            "success": False,
            "error": "Validation failed",
            "message": "Invalid crew assignment",
            "errors": errors
        }
    
    # Assign crew
    success, journey, message = journey_engine.assign_crew(
        journey_id,
        crew_assignment.crewAssignments,
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to assign crew",
            "message": message
        }
    
    # Broadcast crew assignment
    await journey_event_broadcaster.crew_assigned(
        journey_id, crew_assignment.crewAssignments, current_user["id"]
    )
    
    # Send notifications to assigned crew
    for assignment in crew_assignment.crewAssignments:
        notification_service.create_notification(
            NotificationType.CREW_ASSIGNMENT,
            assignment["userId"],
            {
                "journey_id": journey_id,
                "role": assignment["role"]
            }
        )
    
    return {
        "success": True,
        "data": journey,
        "message": "Crew assigned successfully"
    }

@router.patch("/{journey_id}/crew/{crew_id}")
async def update_crew_status(journey_id: str, crew_id: str, status_update: CrewStatusUpdate) -> Dict[str, Any]:
    """Update crew member status"""
    current_user = get_current_user()
    
    success, journey, message = journey_engine.update_crew_status(
        journey_id,
        crew_id,
        CrewStatus(status_update.status),
        current_user["id"]
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to update crew status",
            "message": message
        }
    
    return {
        "success": True,
        "data": journey,
        "message": f"Crew status updated to {status_update.status}"
    }

# ===== MEDIA UPLOAD ENDPOINTS =====

@router.post("/{journey_id}/media")
async def upload_media(
    journey_id: str,
    files: List[UploadFile] = File(...),
    media_type: str = Form(...),
    tags: Optional[str] = Form(None),
    notes: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """Upload media files for a journey"""
    current_user = get_current_user()
    
    # Validate permissions
    if not business_logic_validator.validate_permissions(
        current_user["role"], "upload", "media"
    ):
        return {
            "success": False,
            "error": "Permission denied",
            "message": "User does not have permission to upload media"
        }
    
    # Process files
    file_data_list = []
    for file in files:
        file_data = {
            "filename": file.filename,
            "size": 0,  # Would get actual size in production
            "mimeType": file.content_type or "application/octet-stream"
        }
        
        # Validate file
        is_valid, error_msg = media_handler._validate_file(file_data, MediaType(media_type))
        if not is_valid:
            return {
                "success": False,
                "error": "File validation failed",
                "message": error_msg
            }
        
        file_data_list.append(file_data)
    
    # Upload media
    success, uploaded_media, message = media_handler.upload_media(
        journey_id,
        file_data_list,
        MediaType(media_type),
        current_user["id"],
        tags=tags.split(",") if tags else None,
        notes=notes
    )
    
    if not success:
        return {
            "success": False,
            "error": "Upload failed",
            "message": message
        }
    
    # Broadcast media upload
    await journey_event_broadcaster.media_uploaded(
        journey_id, uploaded_media, current_user["id"]
    )
    
    # Send notification
    notification_service.create_notification(
        NotificationType.MEDIA_UPLOAD,
        current_user["id"],
        {
            "journey_id": journey_id,
            "media_count": len(uploaded_media)
        }
    )
    
    return {
        "success": True,
        "data": uploaded_media,
        "message": message
    }

@router.get("/{journey_id}/media")
async def get_journey_media(
    journey_id: str,
    media_type: Optional[str] = None,
    tags: Optional[str] = None
) -> Dict[str, Any]:
    """Get media for a journey"""
    current_user = get_current_user()
    
    # Validate permissions
    if not business_logic_validator.validate_permissions(
        current_user["role"], "read", "media"
    ):
        return {
            "success": False,
            "error": "Permission denied",
            "message": "User does not have permission to view media"
        }
    
    # Get media
    success, media, message = media_handler.get_journey_media(
        journey_id,
        MediaType(media_type) if media_type else None,
        tags.split(",") if tags else None
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to retrieve media",
            "message": message
        }
    
    return {
        "success": True,
        "data": media,
        "message": message
    }

# ===== GPS TRACKING ENDPOINTS =====

@router.post("/{journey_id}/gps")
async def update_gps(journey_id: str, gps_update: GPSUpdate) -> Dict[str, Any]:
    """Update GPS location for a journey"""
    
    # Check if business logic modules are available
    if gps_tracker is None:
        # Return demo response if modules not available
        return {
            "success": True,
            "message": "GPS location updated successfully (demo mode)",
            "data": {
                "journey_id": journey_id,
                "latitude": gps_update.latitude,
                "longitude": gps_update.longitude,
                "speed": gps_update.speed,
                "accuracy": gps_update.accuracy,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    
    current_user = get_current_user()
    
    location = {
        "lat": gps_update.latitude,
        "lng": gps_update.longitude
    }
    
    # Add GPS tracking point
    success = gps_tracker.add_tracking_point(
        journey_id,
        location,
        speed=gps_update.speed,
        accuracy=gps_update.accuracy
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to update GPS",
            "message": "Journey not found or tracking not active"
        }
    
    # Add journey entry
    entry_data = {
        "type": "GPS",
        "data": {
            "latitude": gps_update.latitude,
            "longitude": gps_update.longitude,
            "speed": gps_update.speed,
            "accuracy": gps_update.accuracy
        },
        "createdBy": current_user["id"]
    }
    
    journey_engine.add_journey_entry(journey_id, entry_data, current_user["id"])
    
    # Broadcast GPS update
    await journey_event_broadcaster.entry_added(journey_id, entry_data, current_user["id"])
    
    return {
        "success": True,
        "message": "GPS location updated successfully"
    }

@router.get("/{journey_id}/gps")
async def get_gps_tracking(journey_id: str) -> Dict[str, Any]:
    """Get GPS tracking data for a journey"""
    current_user = get_current_user()
    
    # Get tracking summary
    summary = gps_tracker.get_track_summary(journey_id)
    
    if not summary:
        return {
            "success": False,
            "error": "GPS tracking not found",
            "message": "No GPS tracking data available for this journey"
        }
    
    # Get tracking points
    points = gps_tracker.get_track_points(journey_id, limit=100)
    
    return {
        "success": True,
        "data": {
            "summary": summary,
            "points": points
        },
        "message": "GPS tracking data retrieved successfully"
    }

# ===== JOURNEY ENTRIES ENDPOINTS =====

@router.post("/{journey_id}/entries")
async def add_journey_entry(journey_id: str, entry: JourneyEntry) -> Dict[str, Any]:
    """Add entry to journey"""
    current_user = get_current_user()
    
    entry_data = {
        "type": entry.type,
        "data": entry.data,
        "tag": entry.tag,
        "createdBy": current_user["id"]
    }
    
    success, entry_result, message = journey_engine.add_journey_entry(
        journey_id,
        entry_data,
        current_user["id"]
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to add entry",
            "message": message
        }
    
    # Broadcast entry addition
    await journey_event_broadcaster.entry_added(journey_id, entry_data, current_user["id"])
    
    return {
        "success": True,
        "data": entry_result,
        "message": "Entry added successfully"
    }

@router.get("/{journey_id}/entries")
async def get_journey_entries(journey_id: str) -> Dict[str, Any]:
    """Get all entries for a journey"""
    current_user = get_current_user()
    
    # Get journey
    success, journey, message = journey_engine.get_journey(
        journey_id,
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Journey not found",
            "message": message
        }
    
    return {
        "success": True,
        "data": journey.get("entries", []),
        "message": "Journey entries retrieved successfully"
    }

# ===== VALIDATION ENDPOINTS =====

@router.post("/{journey_id}/validate")
async def validate_journey(journey_id: str) -> Dict[str, Any]:
    """Validate journey completion requirements"""
    
    # Check if business logic modules are available
    if business_logic_validator is None:
        # Return demo validation response if modules not available
        return {
            "success": True,
            "data": {
                "is_valid": True,
                "errors": [],
                "journey_id": journey_id,
                "validation_mode": "demo"
            },
            "message": "Journey validation completed (demo mode)"
        }
    
    current_user = get_current_user()
    
    # Get journey
    success, journey, message = journey_engine.get_journey(
        journey_id,
        current_user["id"],
        UserRole(current_user["role"])
    )
    
    if not success:
        return {
            "success": False,
            "error": "Journey not found",
            "message": message
        }
    
    # Validate completion
    is_valid, errors = business_logic_validator.validate_journey_completion(journey)
    
    return {
        "success": True,
        "data": {
            "is_valid": is_valid,
            "errors": errors,
            "journey_id": journey_id
        },
        "message": "Journey validation completed"
    }
