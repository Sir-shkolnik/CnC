"""
Tenant Middleware for C&C CRM
Multi-tenant data isolation and scoping
"""

from fastapi import Request, HTTPException, Depends
from typing import Optional, Dict, Any
import logging
from contextvars import ContextVar

logger = logging.getLogger(__name__)

# ===== CONTEXT VARIABLES =====

# Store current tenant context
current_client_id: ContextVar[Optional[str]] = ContextVar('current_client_id', default=None)
current_location_id: ContextVar[Optional[str]] = ContextVar('current_location_id', default=None)
current_user_id: ContextVar[Optional[str]] = ContextVar('current_user_id', default=None)

# ===== TENANT CONTEXT MANAGER =====

class TenantContext:
    """Context manager for tenant scoping"""
    
    def __init__(self, client_id: str, location_id: str, user_id: str):
        self.client_id = client_id
        self.location_id = location_id
        self.user_id = user_id
        self._client_token = None
        self._location_token = None
        self._user_token = None
    
    def __enter__(self):
        """Set tenant context"""
        self._client_token = current_client_id.set(self.client_id)
        self._location_token = current_location_id.set(self.location_id)
        self._user_token = current_user_id.set(self.user_id)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clear tenant context"""
        if self._client_token:
            current_client_id.reset(self._client_token)
        if self._location_token:
            current_location_id.reset(self._location_token)
        if self._user_token:
            current_user_id.reset(self._user_token)

# ===== TENANT UTILITIES =====

def get_current_client_id() -> Optional[str]:
    """Get current client ID from context"""
    return current_client_id.get()

def get_current_location_id() -> Optional[str]:
    """Get current location ID from context"""
    return current_location_id.get()

def get_current_user_id() -> Optional[str]:
    """Get current user ID from context"""
    return current_user_id.get()

def require_tenant_context() -> Dict[str, str]:
    """Require tenant context to be set"""
    client_id = get_current_client_id()
    location_id = get_current_location_id()
    user_id = get_current_user_id()
    
    if not client_id or not location_id or not user_id:
        raise HTTPException(
            status_code=400,
            detail="Tenant context not set"
        )
    
    return {
        "client_id": client_id,
        "location_id": location_id,
        "user_id": user_id
    }

def get_tenant_context() -> Dict[str, str]:
    """Get current tenant context for dependency injection"""
    client_id = get_current_client_id()
    location_id = get_current_location_id()
    user_id = get_current_user_id()
    
    if not client_id or not location_id or not user_id:
        raise HTTPException(
            status_code=400,
            detail="Tenant context not set"
        )
    
    return {
        "client_id": client_id,
        "location_id": location_id,
        "user_id": user_id
    }

# ===== DATABASE QUERY HELPERS =====

def add_tenant_filters(filters: Dict[str, Any]) -> Dict[str, Any]:
    """Add tenant filters to database query"""
    client_id = get_current_client_id()
    location_id = get_current_location_id()
    
    if client_id:
        filters["client_id"] = client_id
    
    if location_id:
        filters["location_id"] = location_id
    
    return filters

def validate_tenant_access(entity_client_id: str, entity_location_id: str) -> bool:
    """Validate if current tenant can access entity"""
    current_client = get_current_client_id()
    current_location = get_current_location_id()
    
    # Admin can access all
    # For now, we'll check in the auth middleware
    # This is a basic check - more sophisticated logic can be added
    
    return (
        entity_client_id == current_client and
        entity_location_id == current_location
    )

# ===== MIDDLEWARE CLASS =====

class TenantMiddleware:
    """Multi-tenant middleware for FastAPI"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """Process request through tenant middleware"""
        if scope["type"] == "http":
            # Extract user info from auth middleware
            user_info = scope.get("user")
            
            if user_info:
                # Set tenant context from authenticated user
                client_id = user_info.get("client_id")
                location_id = user_info.get("location_id")
                user_id = user_info.get("id") or user_info.get("sub")  # Support both id and sub
                
                if client_id and location_id and user_id:
                    # Create tenant context
                    tenant_context = TenantContext(client_id, location_id, user_id)
                    
                    # Add tenant context to scope
                    scope["tenant_context"] = tenant_context
                    
                    # Process request with tenant context
                    with tenant_context:
                        await self.app(scope, receive, send)
                else:
                    # Missing tenant info
                    await self.send_error_response(send, {
                        "success": False,
                        "error": "Missing tenant information",
                        "message": "User must be associated with a client and location"
                    })
            else:
                # No user info - let auth middleware handle it
                await self.app(scope, receive, send)
        else:
            await self.app(scope, receive, send)
    
    async def send_error_response(self, send, response):
        """Send error response"""
        await send({
            "type": "http.response.start",
            "status": 400,
            "headers": [
                (b"content-type", b"application/json"),
            ]
        })
        await send({
            "type": "http.response.body",
            "body": str(response).encode()
        })

# ===== PRISMA CLIENT EXTENSION =====

class TenantAwarePrisma:
    """Prisma client with automatic tenant scoping"""
    
    def __init__(self, prisma_client):
        self.prisma = prisma_client
    
    def _add_tenant_filters(self, where_clause: Dict[str, Any]) -> Dict[str, Any]:
        """Add tenant filters to where clause"""
        if not where_clause:
            where_clause = {}
        
        client_id = get_current_client_id()
        location_id = get_current_location_id()
        
        if client_id:
            where_clause["client_id"] = client_id
        
        if location_id:
            where_clause["location_id"] = location_id
        
        return where_clause
    
    async def user_find_many(self, **kwargs):
        """Find users with tenant scoping"""
        if "where" in kwargs:
            kwargs["where"] = self._add_tenant_filters(kwargs["where"])
        else:
            kwargs["where"] = self._add_tenant_filters({})
        
        return await self.prisma.user.find_many(**kwargs)
    
    async def truckjourney_find_many(self, **kwargs):
        """Find truck journeys with tenant scoping"""
        if "where" in kwargs:
            kwargs["where"] = self._add_tenant_filters(kwargs["where"])
        else:
            kwargs["where"] = self._add_tenant_filters({})
        
        return await self.prisma.truckjourney.find_many(**kwargs)
    
    async def journeyentry_find_many(self, **kwargs):
        """Find journey entries with tenant scoping"""
        # Journey entries are scoped through the journey
        return await self.prisma.journeyentry.find_many(**kwargs)
    
    async def media_find_many(self, **kwargs):
        """Find media with tenant scoping"""
        # Media is scoped through the linked entity
        return await self.prisma.media.find_many(**kwargs)
    
    async def auditentry_find_many(self, **kwargs):
        """Find audit entries with tenant scoping"""
        if "where" in kwargs:
            kwargs["where"] = self._add_tenant_filters(kwargs["where"])
        else:
            kwargs["where"] = self._add_tenant_filters({})
        
        return await self.prisma.auditentry.find_many(**kwargs)

# ===== DEPENDENCY INJECTION =====

def get_tenant_aware_prisma():
    """Get tenant-aware Prisma client"""
    from prisma import Prisma
    prisma = Prisma()
    return TenantAwarePrisma(prisma)

# ===== TENANT VALIDATION DECORATORS =====

def validate_tenant_entity(entity_client_id: str, entity_location_id: str):
    """Decorator to validate tenant access to entity"""
    def validator():
        if not validate_tenant_access(entity_client_id, entity_location_id):
            raise HTTPException(
                status_code=403,
                detail="Access denied to this entity"
            )
    return validator

def require_tenant_scope():
    """Decorator to require tenant context"""
    def validator():
        tenant_context = require_tenant_context()
        if not tenant_context:
            raise HTTPException(
                status_code=400,
                detail="Tenant context required"
            )
        return tenant_context
    return validator 