"""
Media Upload Handler - File upload, processing, and management
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import uuid
import os
import mimetypes
from enum import Enum

# ===== ENUMS =====

class MediaType(str, Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"
    DOCUMENT = "DOCUMENT"
    SIGNATURE = "SIGNATURE"

class TagType(str, Enum):
    DAMAGE = "DAMAGE"
    COMPLETED = "COMPLETED"
    FEEDBACK = "FEEDBACK"
    ERROR = "ERROR"
    ISSUE = "ISSUE"

# ===== MEDIA CONFIGURATION =====

MEDIA_CONFIG = {
    "maxFileSize": {
        MediaType.PHOTO: 10 * 1024 * 1024,  # 10MB
        MediaType.VIDEO: 100 * 1024 * 1024,  # 100MB
        MediaType.DOCUMENT: 50 * 1024 * 1024,  # 50MB
        MediaType.SIGNATURE: 5 * 1024 * 1024,  # 5MB
    },
    "allowedMimeTypes": {
        MediaType.PHOTO: ["image/jpeg", "image/png", "image/webp"],
        MediaType.VIDEO: ["video/mp4", "video/mov", "video/avi"],
        MediaType.DOCUMENT: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        MediaType.SIGNATURE: ["image/png", "image/jpeg", "application/pdf"],
    },
    "requiredMedia": {
        "MORNING_PREP": [MediaType.PHOTO],  # Vehicle inspection photos
        "ONSITE": [MediaType.PHOTO, MediaType.VIDEO],  # Site photos/videos
        "COMPLETED": [MediaType.PHOTO, MediaType.SIGNATURE],  # Completion photos + signature
    }
}

# ===== MEDIA HANDLER =====

class MediaHandler:
    """Handle media upload, processing, and management"""
    
    def __init__(self):
        self.media = {}  # In-memory storage for demo (replace with database/cloud storage)
        self.upload_dir = "uploads"  # Local upload directory (replace with cloud storage)
        
        # Create upload directory if it doesn't exist
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def upload_media(self, journey_id: str, files: List[Dict[str, Any]], media_type: MediaType, 
                    user_id: str, tags: List[str] = None, notes: str = None) -> Tuple[bool, List[Dict[str, Any]], str]:
        """Upload media files for a journey"""
        
        uploaded_media = []
        errors = []
        
        for file_data in files:
            try:
                # Validate file
                is_valid, error_msg = self._validate_file(file_data, media_type)
                if not is_valid:
                    errors.append(f"File validation failed: {error_msg}")
                    continue
                
                # Process and store file
                media_id = f"media_{uuid.uuid4().hex[:8]}"
                filename = file_data.get("filename", f"file_{media_id}")
                
                # Generate file path (in production, upload to cloud storage)
                file_path = os.path.join(self.upload_dir, f"{media_id}_{filename}")
                
                # Create media record
                media_record = {
                    "id": media_id,
                    "journeyId": journey_id,
                    "entryId": file_data.get("entryId"),
                    "type": media_type.value,
                    "url": file_path,  # In production, this would be cloud storage URL
                    "filename": filename,
                    "size": file_data.get("size", 0),
                    "mimeType": file_data.get("mimeType", "application/octet-stream"),
                    "uploadedBy": user_id,
                    "uploadedAt": datetime.utcnow().isoformat() + "Z",
                    "tags": tags or [],
                    "notes": notes,
                    "metadata": {
                        "originalName": filename,
                        "uploadMethod": "api",
                        "processingStatus": "completed"
                    }
                }
                
                # Store media record
                self.media[media_id] = media_record
                uploaded_media.append(media_record)
                
            except Exception as e:
                errors.append(f"Failed to process file {file_data.get('filename', 'unknown')}: {str(e)}")
        
        if errors:
            return False, uploaded_media, f"Upload completed with errors: {'; '.join(errors)}"
        
        return True, uploaded_media, f"Successfully uploaded {len(uploaded_media)} files"
    
    def _validate_file(self, file_data: Dict[str, Any], media_type: MediaType) -> Tuple[bool, str]:
        """Validate uploaded file"""
        
        # Check file size
        max_size = MEDIA_CONFIG["maxFileSize"].get(media_type, 10 * 1024 * 1024)
        file_size = file_data.get("size", 0)
        if file_size > max_size:
            return False, f"File size {file_size} exceeds maximum {max_size}"
        
        # Check mime type
        mime_type = file_data.get("mimeType", "")
        allowed_types = MEDIA_CONFIG["allowedMimeTypes"].get(media_type, [])
        if mime_type not in allowed_types:
            return False, f"Mime type {mime_type} not allowed for {media_type.value}"
        
        # Check filename
        filename = file_data.get("filename", "")
        if not filename or len(filename) > 255:
            return False, "Invalid filename"
        
        return True, ""
    
    def get_journey_media(self, journey_id: str, media_type: Optional[MediaType] = None, 
                         tags: List[str] = None) -> Tuple[bool, List[Dict[str, Any]], str]:
        """Get media for a specific journey"""
        
        # Filter media by journey
        journey_media = [m for m in self.media.values() if m["journeyId"] == journey_id]
        
        # Apply type filter
        if media_type:
            journey_media = [m for m in journey_media if m["type"] == media_type.value]
        
        # Apply tag filter
        if tags:
            journey_media = [m for m in journey_media if any(tag in m.get("tags", []) for tag in tags)]
        
        return True, journey_media, f"Found {len(journey_media)} media files"
    
    def delete_media(self, media_id: str, user_id: str) -> Tuple[bool, str]:
        """Delete media file"""
        
        if media_id not in self.media:
            return False, "Media not found"
        
        media_record = self.media[media_id]
        
        # Check if user can delete (uploader or admin)
        if media_record["uploadedBy"] != user_id:
            # In production, check admin role here
            return False, "User does not have permission to delete this media"
        
        # Delete file from storage
        try:
            if os.path.exists(media_record["url"]):
                os.remove(media_record["url"])
        except Exception as e:
            # Log error but continue with record deletion
            print(f"Failed to delete file {media_record['url']}: {e}")
        
        # Remove record
        del self.media[media_id]
        
        return True, "Media deleted successfully"
    
    def update_media_tags(self, media_id: str, tags: List[str], user_id: str) -> Tuple[bool, Dict[str, Any], str]:
        """Update media tags"""
        
        if media_id not in self.media:
            return False, {}, "Media not found"
        
        media_record = self.media[media_id]
        media_record["tags"] = tags
        media_record["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        media_record["updatedBy"] = user_id
        
        return True, media_record, "Media tags updated successfully"
    
    def get_media_by_type(self, media_type: MediaType, limit: int = 50) -> Tuple[bool, List[Dict[str, Any]], str]:
        """Get media by type"""
        
        type_media = [m for m in self.media.values() if m["type"] == media_type.value]
        type_media = sorted(type_media, key=lambda x: x["uploadedAt"], reverse=True)[:limit]
        
        return True, type_media, f"Found {len(type_media)} {media_type.value} files"
    
    def validate_journey_media_requirements(self, journey_id: str, journey_status: str) -> Tuple[bool, List[str]]:
        """Validate if journey has required media for its status"""
        
        required_media_types = MEDIA_CONFIG["requiredMedia"].get(journey_status, [])
        if not required_media_types:
            return True, []
        
        # Get journey media
        success, journey_media, _ = self.get_journey_media(journey_id)
        if not success:
            return False, ["Failed to retrieve journey media"]
        
        # Check required media types
        missing_media = []
        for media_type in required_media_types:
            has_media = any(m["type"] == media_type.value for m in journey_media)
            if not has_media:
                missing_media.append(f"Missing {media_type.value}")
        
        return len(missing_media) == 0, missing_media
    
    def get_media_statistics(self, journey_id: str = None) -> Dict[str, Any]:
        """Get media statistics"""
        
        if journey_id:
            media_list = [m for m in self.media.values() if m["journeyId"] == journey_id]
        else:
            media_list = list(self.media.values())
        
        stats = {
            "total": len(media_list),
            "byType": {},
            "totalSize": 0,
            "recentUploads": 0
        }
        
        # Count by type
        for media in media_list:
            media_type = media["type"]
            stats["byType"][media_type] = stats["byType"].get(media_type, 0) + 1
            stats["totalSize"] += media.get("size", 0)
        
        # Count recent uploads (last 24 hours)
        recent_time = datetime.utcnow() - timedelta(hours=24)
        stats["recentUploads"] = len([
            m for m in media_list 
            if datetime.fromisoformat(m["uploadedAt"].replace("Z", "+00:00")) > recent_time
        ])
        
        return stats

# ===== INSTANCE =====

media_handler = MediaHandler() 