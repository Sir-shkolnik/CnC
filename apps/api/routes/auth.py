from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
import jwt
import datetime
import os
from pydantic import BaseModel

router = APIRouter()
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720  # 12 hours

# Demo users (in production, this would come from database)
DEMO_USERS = {
    "sarah.johnson@lgm.com": {
        "id": "user_admin_001",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@lgm.com",
        "role": "ADMIN",
        "clientId": "clm_lgm_corp_001",
        "locationId": "loc_lgm_toronto_001",
        "password": "password123"
    },
    "mike.chen@lgm.com": {
        "id": "user_dispatcher_001",
        "name": "Mike Chen",
        "email": "mike.chen@lgm.com",
        "role": "DISPATCHER",
        "clientId": "clm_lgm_corp_001",
        "locationId": "loc_lgm_toronto_001",
        "password": "password123"
    },
    "david.rodriguez@lgm.com": {
        "id": "user_driver_001",
        "name": "David Rodriguez",
        "email": "david.rodriguez@lgm.com",
        "role": "DRIVER",
        "clientId": "clm_lgm_corp_001",
        "locationId": "loc_lgm_toronto_001",
        "password": "password123"
    },
    "frank.williams@lgmhamilton.com": {
        "id": "user_franchise_001",
        "name": "Frank Williams",
        "email": "frank.williams@lgmhamilton.com",
        "role": "ADMIN",
        "clientId": "clm_lgm_franchise_002",
        "locationId": "loc_lgm_hamilton_019",
        "password": "password123"
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify JWT token and return user info"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Find user in demo data
        for user in DEMO_USERS.values():
            if user["id"] == user_id:
                return user
                
        raise HTTPException(status_code=401, detail="User not found")
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login")
async def login(request: LoginRequest) -> Dict[str, Any]:
    """Authenticate user and return JWT token"""
    # Check if user exists and password matches
    user = DEMO_USERS.get(request.email)
    
    if not user or user["password"] != request.password:
        return {
            "success": False,
            "error": "Invalid email or password",
            "message": "Login failed"
        }
    
    # Create access token
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"],
            "client_id": user["clientId"],
            "location_id": user["locationId"]
        },
        expires_delta=access_token_expires
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "clientId": user["clientId"],
                "locationId": user["locationId"]
            }
        }
    }

@router.get("/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
    """Get current user information"""
    return {
        "success": True,
        "data": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "clientId": current_user["clientId"],
            "locationId": current_user["locationId"],
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
    }

@router.post("/logout")
async def logout() -> Dict[str, Any]:
    """Logout user (client-side token removal)"""
    return {"success": True, "message": "Logged out successfully"}
