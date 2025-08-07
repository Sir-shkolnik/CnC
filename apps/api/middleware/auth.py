"""
Authentication Middleware for C&C CRM
JWT-based authentication with role-based access control
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timedelta
import os

# Import Prisma client
# from prisma import Prisma

logger = logging.getLogger(__name__)

# ===== CONFIGURATION =====

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12  # 12 hours

# ===== SECURITY SCHEMES =====

security = HTTPBearer()

# ===== TOKEN UTILITIES =====

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

# ===== USER MODEL =====

class AuthenticatedUser:
    """Authenticated user model with role-based permissions"""
    
    def __init__(self, user_data: Dict[str, Any]):
        self.id = user_data.get("id")
        self.email = user_data.get("email")
        self.name = user_data.get("name")
        self.role = user_data.get("role")
        self.client_id = user_data.get("client_id")
        self.location_id = user_data.get("location_id")
        self.status = user_data.get("status")
    
    def has_role(self, *roles: str) -> bool:
        """Check if user has any of the specified roles"""
        return self.role in roles
    
    def can_access_location(self, location_id: str) -> bool:
        """Check if user can access specific location"""
        if self.role == "ADMIN":
            return True
        return self.location_id == location_id
    
    def can_access_client(self, client_id: str) -> bool:
        """Check if user can access specific client"""
        if self.role == "ADMIN":
            return True
        return self.client_id == client_id
    
    def is_active(self) -> bool:
        """Check if user account is active"""
        return self.status == "ACTIVE"

# ===== AUTHENTICATION DEPENDENCIES =====

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """Get current authenticated user from JWT token"""
    try:
        # Verify token and return payload directly
        payload = verify_token(credentials.credentials)
        
        # Return the payload as a dictionary for compatibility
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role"),
            "client_id": payload.get("company_id"),  # Map company_id to client_id
            "location_id": payload.get("location_id"),
            "status": "ACTIVE"  # Assume active for now
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )

# ===== ROLE-BASED ACCESS CONTROL =====

def require_roles(*roles: str):
    """Decorator to require specific roles for endpoint access"""
    def role_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if not user.has_role(*roles):
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {', '.join(roles)}"
            )
        return user
    return role_checker

def require_admin(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Require admin role"""
    if not user.has_role("ADMIN"):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return user

def require_dispatcher(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Require dispatcher role"""
    if not user.has_role("DISPATCHER", "ADMIN"):
        raise HTTPException(
            status_code=403,
            detail="Dispatcher access required"
        )
    return user

def require_driver(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Require driver role"""
    if not user.has_role("DRIVER", "DISPATCHER", "ADMIN"):
        raise HTTPException(
            status_code=403,
            detail="Driver access required"
        )
    return user

def require_mover(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Require mover role"""
    if not user.has_role("MOVER", "DRIVER", "DISPATCHER", "ADMIN"):
        raise HTTPException(
            status_code=403,
            detail="Mover access required"
        )
    return user

def require_manager(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Require manager role"""
    if not user.has_role("MANAGER", "ADMIN"):
        raise HTTPException(
            status_code=403,
            detail="Manager access required"
        )
    return user

# ===== LOCATION ACCESS CONTROL =====

def require_location_access(location_id: str):
    """Decorator to require access to specific location"""
    def location_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if not user.can_access_location(location_id):
            raise HTTPException(
                status_code=403,
                detail="Access denied to this location"
            )
        return user
    return location_checker

# ===== CLIENT ACCESS CONTROL =====

def require_client_access(client_id: str):
    """Decorator to require access to specific client"""
    def client_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if not user.can_access_client(client_id):
            raise HTTPException(
                status_code=403,
                detail="Access denied to this client"
            )
        return user
    return client_checker

# ===== MIDDLEWARE CLASS =====

class AuthMiddleware:
    """Authentication middleware for FastAPI"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """Process request through authentication middleware"""
        if scope["type"] == "http":
            # Skip auth for health check, docs, and CORS preflight
            path = scope.get("path", "")
            method = scope.get("method", "")
            
            # Allow OPTIONS requests (CORS preflight) without authentication
            if method == "OPTIONS":
                await self.app(scope, receive, send)
                return
            
            # Skip auth for public endpoints
            if path in ["/health", "/docs", "/redoc", "/openapi.json"] or path.startswith("/mobile/health"):
                await self.app(scope, receive, send)
                return
            
            # Allow unauthenticated access to auth endpoints
            if path.startswith("/auth/"):
                await self.app(scope, receive, send)
                return
            
            # Allow unauthenticated access to mobile auth endpoints
            if path.startswith("/mobile/auth/"):
                await self.app(scope, receive, send)
                return
            
            # Allow unauthenticated access to super admin auth endpoints
            if path.startswith("/super-admin/auth/"):
                await self.app(scope, receive, send)
                return
            
            # Skip auth for all super admin endpoints (they have their own auth)
            if path.startswith("/super-admin/"):
                await self.app(scope, receive, send)
                return
            
            # Extract authorization header
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()
            
            if not auth_header.startswith("Bearer "):
                # Return 401 for other endpoints without auth
                response = {
                    "success": False,
                    "error": "Authentication required",
                    "message": "Bearer token required"
                }
                await self.send_unauthorized_response(send, response)
                return
            
            # Validate token
            try:
                token = auth_header.split(" ")[1]
                payload = verify_token(token)
                scope["user"] = payload
                await self.app(scope, receive, send)
            except Exception as e:
                response = {
                    "success": False,
                    "error": "Invalid token",
                    "message": str(e)
                }
                await self.send_unauthorized_response(send, response)
        else:
            await self.app(scope, receive, send)
    
    async def send_unauthorized_response(self, send, response):
        """Send unauthorized response"""
        await send({
            "type": "http.response.start",
            "status": 401,
            "headers": [
                (b"content-type", b"application/json"),
            ]
        })
        await send({
            "type": "http.response.body",
            "body": str(response).encode()
        }) 