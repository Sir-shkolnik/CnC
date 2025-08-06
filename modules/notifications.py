"""
Notifications Module - Alert system and user notifications
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import asyncio

# ===== ENUMS =====

class NotificationType(str, Enum):
    JOURNEY_STATUS_CHANGE = "journey_status_change"
    CREW_ASSIGNMENT = "crew_assignment"
    MEDIA_UPLOAD = "media_upload"
    GPS_UPDATE = "gps_update"
    CHAT_MESSAGE = "chat_message"
    SYSTEM_ALERT = "system_alert"
    PERFORMANCE_ALERT = "performance_alert"
    COMPLIANCE_ALERT = "compliance_alert"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

# ===== NOTIFICATION SYSTEM =====

class NotificationService:
    """Notification and alert management system"""
    
    def __init__(self):
        self.notifications = {}  # notification_id -> notification_data
        self.user_notifications = {}  # user_id -> list of notification_ids
        self.notification_templates = self._load_templates()
        self.websocket_server = None  # Will be set by main app
    
    def _load_templates(self) -> Dict[str, Dict[str, str]]:
        """Load notification templates"""
        
        return {
            NotificationType.JOURNEY_STATUS_CHANGE: {
                "title": "Journey Status Updated",
                "body": "Journey {journey_id} status changed from {old_status} to {new_status}",
                "priority": NotificationPriority.MEDIUM
            },
            NotificationType.CREW_ASSIGNMENT: {
                "title": "Crew Assignment",
                "body": "You have been assigned to journey {journey_id} as {role}",
                "priority": NotificationPriority.HIGH
            },
            NotificationType.MEDIA_UPLOAD: {
                "title": "Media Uploaded",
                "body": "{media_count} new media files uploaded to journey {journey_id}",
                "priority": NotificationPriority.LOW
            },
            NotificationType.GPS_UPDATE: {
                "title": "Location Update",
                "body": "Journey {journey_id} location updated",
                "priority": NotificationPriority.LOW
            },
            NotificationType.CHAT_MESSAGE: {
                "title": "New Message",
                "body": "New message from {sender_name} in journey {journey_id}",
                "priority": NotificationPriority.MEDIUM
            },
            NotificationType.SYSTEM_ALERT: {
                "title": "System Alert",
                "body": "{message}",
                "priority": NotificationPriority.HIGH
            },
            NotificationType.PERFORMANCE_ALERT: {
                "title": "Performance Alert",
                "body": "Performance issue detected: {message}",
                "priority": NotificationPriority.HIGH
            },
            NotificationType.COMPLIANCE_ALERT: {
                "title": "Compliance Alert",
                "body": "Compliance issue detected: {message}",
                "priority": NotificationPriority.URGENT
            }
        }
    
    def create_notification(self, notification_type: NotificationType, 
                           user_id: str, data: Dict[str, Any], 
                           priority: Optional[NotificationPriority] = None) -> str:
        """Create a new notification"""
        
        notification_id = f"notification_{uuid.uuid4().hex[:8]}"
        
        # Get template
        template = self.notification_templates.get(notification_type, {})
        
        # Format message
        title = template.get("title", "Notification")
        body = template.get("body", "")
        
        # Replace placeholders in body
        for key, value in data.items():
            body = body.replace(f"{{{key}}}", str(value))
        
        # Set priority
        if priority is None:
            priority = NotificationPriority(template.get("priority", NotificationPriority.MEDIUM))
        
        notification_data = {
            "id": notification_id,
            "type": notification_type.value,
            "user_id": user_id,
            "title": title,
            "body": body,
            "data": data,
            "priority": priority.value,
            "status": NotificationStatus.PENDING.value,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "sent_at": None,
            "delivered_at": None,
            "read_at": None
        }
        
        # Store notification
        self.notifications[notification_id] = notification_data
        
        # Add to user's notification list
        if user_id not in self.user_notifications:
            self.user_notifications[user_id] = []
        self.user_notifications[user_id].append(notification_id)
        
        return notification_id
    
    def send_notification(self, notification_id: str) -> bool:
        """Send a notification"""
        
        if notification_id not in self.notifications:
            return False
        
        notification = self.notifications[notification_id]
        
        try:
            # Update status
            notification["status"] = NotificationStatus.SENT.value
            notification["sent_at"] = datetime.utcnow().isoformat() + "Z"
            
            # Send via WebSocket if available
            if self.websocket_server:
                asyncio.create_task(self.websocket_server.send_to_user(
                    notification["user_id"],
                    {
                        "type": "notification",
                        "data": {
                            "id": notification["id"],
                            "title": notification["title"],
                            "body": notification["body"],
                            "priority": notification["priority"],
                            "timestamp": notification["sent_at"]
                        }
                    }
                ))
            
            return True
            
        except Exception as e:
            notification["status"] = NotificationStatus.FAILED.value
            return False
    
    def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        
        if notification_id not in self.notifications:
            return False
        
        notification = self.notifications[notification_id]
        
        if notification["user_id"] != user_id:
            return False
        
        notification["status"] = NotificationStatus.READ.value
        notification["read_at"] = datetime.utcnow().isoformat() + "Z"
        
        return True
    
    def get_user_notifications(self, user_id: str, limit: int = 50, 
                              unread_only: bool = False) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        
        if user_id not in self.user_notifications:
            return []
        
        user_notification_ids = self.user_notifications[user_id]
        notifications = []
        
        for notification_id in user_notification_ids[-limit:]:  # Get most recent
            if notification_id in self.notifications:
                notification = self.notifications[notification_id]
                
                if unread_only and notification["status"] == NotificationStatus.READ.value:
                    continue
                
                notifications.append(notification)
        
        return sorted(notifications, key=lambda x: x["created_at"], reverse=True)
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for a user"""
        
        notifications = self.get_user_notifications(user_id, unread_only=True)
        return len(notifications)
    
    def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification"""
        
        if notification_id not in self.notifications:
            return False
        
        notification = self.notifications[notification_id]
        
        if notification["user_id"] != user_id:
            return False
        
        # Remove from user's notification list
        if user_id in self.user_notifications:
            self.user_notifications[user_id] = [
                nid for nid in self.user_notifications[user_id] 
                if nid != notification_id
            ]
        
        # Remove notification
        del self.notifications[notification_id]
        
        return True
    
    def cleanup_old_notifications(self, days_old: int = 30):
        """Clean up old notifications"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        notifications_to_delete = []
        
        for notification_id, notification in self.notifications.items():
            created_at = datetime.fromisoformat(notification["created_at"].replace("Z", "+00:00"))
            if created_at < cutoff_date:
                notifications_to_delete.append(notification_id)
        
        for notification_id in notifications_to_delete:
            notification = self.notifications[notification_id]
            user_id = notification["user_id"]
            
            # Remove from user's notification list
            if user_id in self.user_notifications:
                self.user_notifications[user_id] = [
                    nid for nid in self.user_notifications[user_id] 
                    if nid != notification_id
                ]
            
            # Remove notification
            del self.notifications[notification_id]

# ===== ALERT SYSTEM =====

class AlertSystem:
    """System-wide alert management"""
    
    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service
        self.alert_rules = self._load_alert_rules()
        self.active_alerts = {}  # alert_id -> alert_data
    
    def _load_alert_rules(self) -> Dict[str, Dict[str, Any]]:
        """Load alert rules"""
        
        return {
            "journey_delayed": {
                "condition": "journey_duration > estimated_duration * 1.2",
                "notification_type": NotificationType.PERFORMANCE_ALERT,
                "priority": NotificationPriority.HIGH,
                "message": "Journey {journey_id} is running behind schedule"
            },
            "missing_media": {
                "condition": "required_media_missing",
                "notification_type": NotificationType.COMPLIANCE_ALERT,
                "priority": NotificationPriority.HIGH,
                "message": "Required media missing for journey {journey_id}"
            },
            "crew_unresponsive": {
                "condition": "crew_no_activity > 2_hours",
                "notification_type": NotificationType.PERFORMANCE_ALERT,
                "priority": NotificationPriority.MEDIUM,
                "message": "Crew member {crew_name} has been inactive for {duration}"
            },
            "gps_signal_lost": {
                "condition": "gps_signal_lost > 15_minutes",
                "notification_type": NotificationType.SYSTEM_ALERT,
                "priority": NotificationPriority.HIGH,
                "message": "GPS signal lost for journey {journey_id}"
            }
        }
    
    def check_journey_alerts(self, journey_data: Dict[str, Any]) -> List[str]:
        """Check for alerts related to a journey"""
        
        alert_ids = []
        
        # Check for delays
        if self._is_journey_delayed(journey_data):
            alert_id = self._create_journey_alert(
                "journey_delayed", 
                journey_data["id"], 
                journey_data.get("dispatcher_id")
            )
            alert_ids.append(alert_id)
        
        # Check for missing media
        if self._has_missing_media(journey_data):
            alert_id = self._create_journey_alert(
                "missing_media", 
                journey_data["id"], 
                journey_data.get("dispatcher_id")
            )
            alert_ids.append(alert_id)
        
        return alert_ids
    
    def _is_journey_delayed(self, journey_data: Dict[str, Any]) -> bool:
        """Check if journey is delayed"""
        
        # Simple delay check (in production, use more sophisticated logic)
        if journey_data.get("status") == "EN_ROUTE":
            start_time = journey_data.get("startTime")
            if start_time:
                start_dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                current_time = datetime.utcnow()
                duration = (current_time - start_dt).total_seconds() / 3600  # hours
                
                # Assume 2 hours is normal duration
                return duration > 2.4  # 20% over normal
        return False
    
    def _has_missing_media(self, journey_data: Dict[str, Any]) -> bool:
        """Check if journey has missing required media"""
        
        # Simple check (in production, use media validation logic)
        media_count = len(journey_data.get("media", []))
        return media_count == 0 and journey_data.get("status") in ["ONSITE", "COMPLETED"]
    
    def _create_journey_alert(self, alert_type: str, journey_id: str, user_id: str) -> str:
        """Create a journey-related alert"""
        
        rule = self.alert_rules.get(alert_type, {})
        
        notification_id = self.notification_service.create_notification(
            notification_type=NotificationType(rule["notification_type"]),
            user_id=user_id,
            data={
                "journey_id": journey_id,
                "message": rule["message"].format(journey_id=journey_id)
            },
            priority=NotificationPriority(rule["priority"])
        )
        
        # Send notification
        self.notification_service.send_notification(notification_id)
        
        return notification_id
    
    def create_system_alert(self, message: str, priority: NotificationPriority = NotificationPriority.MEDIUM, 
                           target_users: List[str] = None) -> List[str]:
        """Create system-wide alert"""
        
        notification_ids = []
        
        if target_users:
            users_to_notify = target_users
        else:
            # Notify all users (in production, filter by role/permissions)
            users_to_notify = list(self.notification_service.user_notifications.keys())
        
        for user_id in users_to_notify:
            notification_id = self.notification_service.create_notification(
                notification_type=NotificationType.SYSTEM_ALERT,
                user_id=user_id,
                data={"message": message},
                priority=priority
            )
            
            self.notification_service.send_notification(notification_id)
            notification_ids.append(notification_id)
        
        return notification_ids

# ===== PUSH NOTIFICATIONS =====

class PushNotificationService:
    """Push notification service (placeholder for mobile notifications)"""
    
    def __init__(self):
        self.device_tokens = {}  # user_id -> device_tokens
        self.push_providers = {
            "ios": None,  # Would be Firebase/APNS
            "android": None,  # Would be Firebase/FCM
            "web": None  # Would be service worker
        }
    
    def register_device(self, user_id: str, device_token: str, platform: str):
        """Register device for push notifications"""
        
        if user_id not in self.device_tokens:
            self.device_tokens[user_id] = {}
        
        self.device_tokens[user_id][platform] = device_token
    
    def send_push_notification(self, user_id: str, title: str, body: str, 
                              data: Dict[str, Any] = None) -> bool:
        """Send push notification to user's devices"""
        
        if user_id not in self.device_tokens:
            return False
        
        # In production, this would send to Firebase/APNS/FCM
        # For now, just log the notification
        print(f"Push notification to {user_id}: {title} - {body}")
        
        return True
    
    def unregister_device(self, user_id: str, platform: str):
        """Unregister device"""
        
        if user_id in self.device_tokens and platform in self.device_tokens[user_id]:
            del self.device_tokens[user_id][platform]

# ===== INSTANCES =====

notification_service = NotificationService()
alert_system = AlertSystem(notification_service)
push_notification_service = PushNotificationService() 