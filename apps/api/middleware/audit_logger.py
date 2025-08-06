"""
Audit Logger Middleware for C&C CRM
Automatic audit trail logging for all operations
"""

from fastapi import Request, Response
from typing import Dict, Any, Optional
import logging
import json
import hashlib
from datetime import datetime
from contextvars import ContextVar
import asyncio

logger = logging.getLogger(__name__)

# ===== CONTEXT VARIABLES =====

# Store audit context
current_audit_context: ContextVar[Optional[Dict[str, Any]]] = ContextVar('current_audit_context', default=None)

# ===== AUDIT CONTEXT MANAGER =====

class AuditContext:
    """Context manager for audit logging"""
    
    def __init__(self, user_id: str, client_id: str, location_id: str):
        self.user_id = user_id
        self.client_id = client_id
        self.location_id = location_id
        self.actions = []
        self._token = None
    
    def __enter__(self):
        """Set audit context"""
        context = {
            "user_id": self.user_id,
            "client_id": self.client_id,
            "location_id": self.location_id,
            "actions": self.actions,
            "start_time": datetime.utcnow()
        }
        self._token = current_audit_context.set(context)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clear audit context and log actions"""
        if self._token:
            current_audit_context.reset(self._token)
        
        # Log all actions
        if self.actions:
            asyncio.create_task(self._log_audit_actions())
    
    async def _log_audit_actions(self):
        """Log all audit actions to database"""
        try:
            from prisma import Prisma
            prisma = Prisma()
            
            for action in self.actions:
                await prisma.auditentry.create(data=action)
                
        except Exception as e:
            logger.error(f"Failed to log audit actions: {e}")
    
    def add_action(self, action: str, entity: str, entity_id: str, diff: Optional[Dict[str, Any]] = None):
        """Add an audit action"""
        action_data = {
            "action": action,
            "entity": entity,
            "entityId": entity_id,
            "userId": self.user_id,
            "locationId": self.location_id,
            "clientId": self.client_id,
            "timestamp": datetime.utcnow(),
            "diff": diff
        }
        self.actions.append(action_data)

# ===== AUDIT UTILITIES =====

def get_current_audit_context() -> Optional[Dict[str, Any]]:
    """Get current audit context"""
    return current_audit_context.get()

def create_audit_hash(data: Dict[str, Any]) -> str:
    """Create hash for audit data integrity"""
    data_str = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(data_str.encode()).hexdigest()

def calculate_diff(before: Dict[str, Any], after: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate diff between before and after states"""
    diff = {
        "added": {},
        "modified": {},
        "removed": {}
    }
    
    # Find added and modified fields
    for key, value in after.items():
        if key not in before:
            diff["added"][key] = value
        elif before[key] != value:
            diff["modified"][key] = {
                "before": before[key],
                "after": value
            }
    
    # Find removed fields
    for key, value in before.items():
        if key not in after:
            diff["removed"][key] = value
    
    return diff

# ===== AUDIT DECORATORS =====

def audit_action(action: str, entity: str):
    """Decorator to audit an action"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Get audit context
            audit_context = get_current_audit_context()
            
            if not audit_context:
                # No audit context - just execute function
                return await func(*args, **kwargs)
            
            # Capture before state if it's an update/delete
            before_state = None
            if action in ["UPDATE", "DELETE"]:
                # Try to get entity ID from args/kwargs
                entity_id = None
                if "id" in kwargs:
                    entity_id = kwargs["id"]
                elif len(args) > 1:
                    entity_id = args[1]  # Assuming second arg is ID
                
                if entity_id:
                    try:
                        from prisma import Prisma
                        prisma = Prisma()
                        
                        # Get current state
                        if entity == "User":
                            before_state = await prisma.user.find_unique(where={"id": entity_id})
                        elif entity == "TruckJourney":
                            before_state = await prisma.truckjourney.find_unique(where={"id": entity_id})
                        elif entity == "JourneyEntry":
                            before_state = await prisma.journeyentry.find_unique(where={"id": entity_id})
                        elif entity == "Media":
                            before_state = await prisma.media.find_unique(where={"id": entity_id})
                        # Add more entities as needed
                        
                    except Exception as e:
                        logger.warning(f"Could not capture before state: {e}")
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Capture after state if it's a create/update
            after_state = None
            if action in ["CREATE", "UPDATE"] and result:
                after_state = result
            
            # Calculate diff
            diff = None
            if before_state and after_state:
                diff = calculate_diff(before_state, after_state)
            
            # Get entity ID
            entity_id = None
            if result and hasattr(result, "id"):
                entity_id = result.id
            elif "id" in kwargs:
                entity_id = kwargs["id"]
            elif len(args) > 1:
                entity_id = args[1]
            
            # Add audit action
            if entity_id and audit_context:
                audit_context_obj = AuditContext(
                    audit_context["user_id"],
                    audit_context["client_id"],
                    audit_context["location_id"]
                )
                audit_context_obj.add_action(action, entity, entity_id, diff)
            
            return result
        
        return wrapper
    return decorator

# ===== MIDDLEWARE CLASS =====

class AuditLoggerMiddleware:
    """Audit logging middleware for FastAPI"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """Process request through audit middleware"""
        if scope["type"] == "http":
            # Extract user info
            user_info = scope.get("user")
            
            if user_info:
                # Create audit context
                audit_context = AuditContext(
                    user_id=user_info.get("sub"),
                    client_id=user_info.get("client_id"),
                    location_id=user_info.get("location_id")
                )
                
                # Process request with audit context
                with audit_context:
                    await self.app(scope, receive, send)
            else:
                # No user info - just process normally
                await self.app(scope, receive, send)
        else:
            await self.app(scope, receive, send)

# ===== AUDIT LOGGING FUNCTIONS =====

async def log_audit_entry(
    action: str,
    entity: str,
    entity_id: str,
    user_id: str,
    client_id: str,
    location_id: str,
    diff: Optional[Dict[str, Any]] = None
):
    """Log an audit entry directly"""
    try:
        from prisma import Prisma
        prisma = Prisma()
        
        await prisma.auditentry.create(data={
            "action": action,
            "entity": entity,
            "entityId": entity_id,
            "userId": user_id,
            "locationId": location_id,
            "clientId": client_id,
            "timestamp": datetime.utcnow(),
            "diff": diff
        })
        
    except Exception as e:
        logger.error(f"Failed to log audit entry: {e}")

def log_view_access(entity: str, entity_id: str):
    """Log view access to entity"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Execute function
            result = await func(*args, **kwargs)
            
            # Log view access
            audit_context = get_current_audit_context()
            if audit_context:
                await log_audit_entry(
                    action="VIEW",
                    entity=entity,
                    entity_id=entity_id,
                    user_id=audit_context["user_id"],
                    client_id=audit_context["client_id"],
                    location_id=audit_context["location_id"]
                )
            
            return result
        return wrapper
    return decorator

# ===== AUDIT REPORTING =====

async def generate_audit_report(
    client_id: str,
    location_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[str] = None,
    entity: Optional[str] = None
) -> Dict[str, Any]:
    """Generate audit report"""
    try:
        from prisma import Prisma
        prisma = Prisma()
        
        # Build where clause
        where_clause = {"clientId": client_id}
        
        if location_id:
            where_clause["locationId"] = location_id
        
        if start_date:
            where_clause["timestamp"] = {"gte": start_date}
        
        if end_date:
            if "timestamp" in where_clause:
                where_clause["timestamp"]["lte"] = end_date
            else:
                where_clause["timestamp"] = {"lte": end_date}
        
        if user_id:
            where_clause["userId"] = user_id
        
        if entity:
            where_clause["entity"] = entity
        
        # Get audit entries
        entries = await prisma.auditentry.find_many(
            where=where_clause,
            include={
                "user": True,
                "location": True
            },
            order={"timestamp": "desc"}
        )
        
        # Generate summary
        summary = {
            "total_entries": len(entries),
            "actions": {},
            "entities": {},
            "users": {},
            "time_period": {
                "start": start_date,
                "end": end_date
            }
        }
        
        for entry in entries:
            # Count actions
            action = entry.action
            summary["actions"][action] = summary["actions"].get(action, 0) + 1
            
            # Count entities
            entity_name = entry.entity
            summary["entities"][entity_name] = summary["entities"].get(entity_name, 0) + 1
            
            # Count users
            user_name = entry.user.name if entry.user else "Unknown"
            summary["users"][user_name] = summary["users"].get(user_name, 0) + 1
        
        return {
            "success": True,
            "summary": summary,
            "entries": entries
        }
        
    except Exception as e:
        logger.error(f"Failed to generate audit report: {e}")
        return {
            "success": False,
            "error": str(e)
        } 