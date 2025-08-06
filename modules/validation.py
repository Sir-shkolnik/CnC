"""
Validation Module - Business logic validation and rules
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import re

# ===== VALIDATION RULES =====

class ValidationRule:
    """Base validation rule"""
    
    def __init__(self, field: str, rule_type: str, message: str, **kwargs):
        self.field = field
        self.rule_type = rule_type
        self.message = message
        self.kwargs = kwargs
    
    def validate(self, value: Any) -> Tuple[bool, str]:
        """Validate a value"""
        raise NotImplementedError

class RequiredRule(ValidationRule):
    """Required field validation"""
    
    def __init__(self, field: str, message: str = None):
        super().__init__(field, "required", message or f"{field} is required")
    
    def validate(self, value: Any) -> Tuple[bool, str]:
        if value is None or (isinstance(value, str) and not value.strip()):
            return False, self.message
        return True, ""

class EmailRule(ValidationRule):
    """Email format validation"""
    
    def __init__(self, field: str, message: str = None):
        super().__init__(field, "email", message or f"{field} must be a valid email address")
    
    def validate(self, value: Any) -> Tuple[bool, str]:
        if not value:
            return True, ""  # Empty is OK, use RequiredRule for required emails
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, str(value)):
            return False, self.message
        return True, ""

class MinLengthRule(ValidationRule):
    """Minimum length validation"""
    
    def __init__(self, field: str, min_length: int, message: str = None):
        super().__init__(field, "min_length", message or f"{field} must be at least {min_length} characters")
        self.min_length = min_length
    
    def validate(self, value: Any) -> Tuple[bool, str]:
        if not value:
            return True, ""  # Empty is OK, use RequiredRule for required fields
        
        if len(str(value)) < self.min_length:
            return False, self.message
        return True, ""

class MaxLengthRule(ValidationRule):
    """Maximum length validation"""
    
    def __init__(self, field: str, max_length: int, message: str = None):
        super().__init__(field, "max_length", message or f"{field} must be no more than {max_length} characters")
        self.max_length = max_length
    
    def validate(self, value: Any) -> Tuple[bool, str]:
        if not value:
            return True, ""  # Empty is OK
        
        if len(str(value)) > self.max_length:
            return False, self.message
        return True, ""

class DateRule(ValidationRule):
    """Date validation"""
    
    def __init__(self, field: str, min_date: datetime = None, max_date: datetime = None, message: str = None):
        super().__init__(field, "date", message or f"{field} must be a valid date")
        self.min_date = min_date
        self.max_date = max_date
    
    def validate(self, value: Any) -> Tuple[bool, str]:
        if not value:
            return True, ""
        
        try:
            if isinstance(value, str):
                date_value = datetime.fromisoformat(value.replace("Z", "+00:00"))
            elif isinstance(value, datetime):
                date_value = value
            else:
                return False, self.message
            
            if self.min_date and date_value < self.min_date:
                return False, f"{self.field} must be after {self.min_date.strftime('%Y-%m-%d')}"
            
            if self.max_date and date_value > self.max_date:
                return False, f"{self.field} must be before {self.max_date.strftime('%Y-%m-%d')}"
            
            return True, ""
            
        except (ValueError, TypeError):
            return False, self.message

class EnumRule(ValidationRule):
    """Enum value validation"""
    
    def __init__(self, field: str, enum_class, message: str = None):
        super().__init__(field, "enum", message or f"{self.field} must be one of {list(enum_class)}")
        self.enum_class = enum_class
    
    def validate(self, value: Any) -> Tuple[bool, str]:
        if not value:
            return True, ""
        
        try:
            if isinstance(value, str):
                self.enum_class(value)
            elif isinstance(value, self.enum_class):
                pass
            else:
                return False, self.message
            return True, ""
        except ValueError:
            return False, self.message

# ===== JOURNEY VALIDATION =====

class JourneyValidator:
    """Journey-specific validation"""
    
    def __init__(self):
        self.rules = self._load_journey_rules()
    
    def _load_journey_rules(self) -> Dict[str, List[ValidationRule]]:
        """Load validation rules for journeys"""
        
        return {
            "create": [
                RequiredRule("locationId"),
                RequiredRule("clientId"),
                RequiredRule("date"),
                DateRule("date", min_date=datetime.utcnow().date()),
                MaxLengthRule("truckNumber", 20),
                MaxLengthRule("notes", 1000)
            ],
            "update": [
                MaxLengthRule("notes", 1000)
            ],
            "status_update": [
                RequiredRule("status"),
                EnumRule("status", JourneyStatus)
            ]
        }
    
    def validate_journey_creation(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validate journey creation data"""
        
        errors = {}
        
        for rule in self.rules["create"]:
            is_valid, error_message = rule.validate(data.get(rule.field))
            if not is_valid:
                errors[rule.field] = error_message
        
        return len(errors) == 0, errors
    
    def validate_journey_update(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validate journey update data"""
        
        errors = {}
        
        for rule in self.rules["update"]:
            if rule.field in data:  # Only validate provided fields
                is_valid, error_message = rule.validate(data.get(rule.field))
                if not is_valid:
                    errors[rule.field] = error_message
        
        return len(errors) == 0, errors
    
    def validate_status_transition(self, current_status: str, new_status: str) -> Tuple[bool, str]:
        """Validate journey status transition"""
        
        valid_transitions = {
            "MORNING_PREP": ["EN_ROUTE"],
            "EN_ROUTE": ["ONSITE"],
            "ONSITE": ["COMPLETED"],
            "COMPLETED": ["AUDITED"]
        }
        
        allowed_next_statuses = valid_transitions.get(current_status, [])
        
        if new_status not in allowed_next_statuses:
            return False, f"Invalid status transition from {current_status} to {new_status}"
        
        return True, ""
    
    def validate_crew_assignment(self, crew_data: List[Dict[str, Any]]) -> Tuple[bool, Dict[str, str]]:
        """Validate crew assignment data"""
        
        errors = {}
        
        if not crew_data:
            errors["crew"] = "At least one crew member must be assigned"
            return False, errors
        
        for i, crew_member in enumerate(crew_data):
            if "userId" not in crew_member:
                errors[f"crew[{i}].userId"] = "User ID is required"
            
            if "role" not in crew_member:
                errors[f"crew[{i}].role"] = "Role is required"
            else:
                try:
                    UserRole(crew_member["role"])
                except ValueError:
                    errors[f"crew[{i}].role"] = f"Invalid role: {crew_member['role']}"
        
        return len(errors) == 0, errors

# ===== MEDIA VALIDATION =====

class MediaValidator:
    """Media-specific validation"""
    
    def __init__(self):
        self.max_file_sizes = {
            "PHOTO": 10 * 1024 * 1024,  # 10MB
            "VIDEO": 100 * 1024 * 1024,  # 100MB
            "DOCUMENT": 50 * 1024 * 1024,  # 50MB
            "SIGNATURE": 5 * 1024 * 1024,  # 5MB
        }
        
        self.allowed_mime_types = {
            "PHOTO": ["image/jpeg", "image/png", "image/webp"],
            "VIDEO": ["video/mp4", "video/mov", "video/avi"],
            "DOCUMENT": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            "SIGNATURE": ["image/png", "image/jpeg", "application/pdf"],
        }
    
    def validate_media_upload(self, file_data: Dict[str, Any], media_type: str) -> Tuple[bool, str]:
        """Validate media upload"""
        
        # Check file size
        max_size = self.max_file_sizes.get(media_type, 10 * 1024 * 1024)
        file_size = file_data.get("size", 0)
        if file_size > max_size:
            return False, f"File size {file_size} exceeds maximum {max_size} for {media_type}"
        
        # Check mime type
        mime_type = file_data.get("mimeType", "")
        allowed_types = self.allowed_mime_types.get(media_type, [])
        if mime_type not in allowed_types:
            return False, f"Mime type {mime_type} not allowed for {media_type}"
        
        # Check filename
        filename = file_data.get("filename", "")
        if not filename or len(filename) > 255:
            return False, "Invalid filename"
        
        return True, ""

# ===== USER VALIDATION =====

class UserValidator:
    """User-specific validation"""
    
    def __init__(self):
        self.rules = self._load_user_rules()
    
    def _load_user_rules(self) -> Dict[str, List[ValidationRule]]:
        """Load validation rules for users"""
        
        return {
            "create": [
                RequiredRule("name"),
                RequiredRule("email"),
                EmailRule("email"),
                RequiredRule("role"),
                EnumRule("role", UserRole),
                RequiredRule("locationId"),
                RequiredRule("clientId")
            ],
            "update": [
                EmailRule("email"),
                EnumRule("role", UserRole)
            ]
        }
    
    def validate_user_creation(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validate user creation data"""
        
        errors = {}
        
        for rule in self.rules["create"]:
            is_valid, error_message = rule.validate(data.get(rule.field))
            if not is_valid:
                errors[rule.field] = error_message
        
        return len(errors) == 0, errors
    
    def validate_user_update(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validate user update data"""
        
        errors = {}
        
        for rule in self.rules["update"]:
            if rule.field in data:  # Only validate provided fields
                is_valid, error_message = rule.validate(data.get(rule.field))
                if not is_valid:
                    errors[rule.field] = error_message
        
        return len(errors) == 0, errors

# ===== BUSINESS LOGIC VALIDATION =====

class BusinessLogicValidator:
    """Business logic validation"""
    
    def __init__(self):
        self.journey_validator = JourneyValidator()
        self.media_validator = MediaValidator()
        self.user_validator = UserValidator()
    
    def validate_journey_completion(self, journey_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate if journey can be completed"""
        
        errors = []
        
        # Check if journey has required media
        media_count = len(journey_data.get("media", []))
        if media_count == 0:
            errors.append("Journey must have at least one media file to be completed")
        
        # Check if journey has crew assigned
        crew_count = len(journey_data.get("assignedCrew", []))
        if crew_count == 0:
            errors.append("Journey must have at least one crew member assigned to be completed")
        
        # Check if journey has start time
        if not journey_data.get("startTime"):
            errors.append("Journey must have a start time to be completed")
        
        return len(errors) == 0, errors
    
    def validate_journey_start(self, journey_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate if journey can be started"""
        
        errors = []
        
        # Check if journey has crew assigned
        crew_count = len(journey_data.get("assignedCrew", []))
        if crew_count == 0:
            errors.append("Journey must have at least one crew member assigned to be started")
        
        # Check if journey has truck number
        if not journey_data.get("truckNumber"):
            errors.append("Journey must have a truck number to be started")
        
        return len(errors) == 0, errors
    
    def validate_permissions(self, user_role: str, action: str, resource: str) -> bool:
        """Validate user permissions"""
        
        permission_matrix = {
            "DISPATCHER": {
                "journey": ["create", "read", "update", "delete"],
                "crew": ["assign", "read"],
                "media": ["read", "upload"],
                "user": ["read"]
            },
            "DRIVER": {
                "journey": ["read", "update_status"],
                "crew": ["read"],
                "media": ["read", "upload"],
                "user": ["read"]
            },
            "MOVER": {
                "journey": ["read"],
                "crew": ["read"],
                "media": ["read", "upload"],
                "user": ["read"]
            },
            "ADMIN": {
                "journey": ["create", "read", "update", "delete"],
                "crew": ["assign", "read", "update"],
                "media": ["read", "upload", "delete"],
                "user": ["create", "read", "update", "delete"]
            }
        }
        
        user_permissions = permission_matrix.get(user_role, {})
        resource_permissions = user_permissions.get(resource, [])
        
        return action in resource_permissions

# ===== INSTANCES =====

journey_validator = JourneyValidator()
media_validator = MediaValidator()
user_validator = UserValidator()
business_logic_validator = BusinessLogicValidator() 