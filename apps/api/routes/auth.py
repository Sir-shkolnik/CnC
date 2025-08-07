from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
import jwt
import datetime
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
import hashlib

router = APIRouter()
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720  # 12 hours

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Parse DATABASE_URL for psycopg2
    from urllib.parse import urlparse
    parsed = urlparse(DATABASE_URL)
    DB_CONFIG = {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path[1:],  # Remove leading slash
        "user": parsed.username,
        "password": parsed.password
    }
else:
    # Fallback to individual environment variables
    DB_CONFIG = {
        "host": os.getenv("DB_HOST", "postgres"),
        "port": os.getenv("DB_PORT", "5432"),
        "database": os.getenv("DB_NAME", "c_and_c_crm"),
        "user": os.getenv("DB_USER", "c_and_c_user"),
        "password": os.getenv("DB_PASSWORD", "c_and_c_password")
    }

class LoginRequest(BaseModel):
    email: str
    password: str
    company_id: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

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
        user_type = payload.get("user_type", "regular")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user from database
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(
            "SELECT id, name, email, role, \"clientId\", \"locationId\", status FROM \"User\" WHERE id = %s AND status = 'ACTIVE'",
            (user_id,)
        )
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found or inactive")
        
        return dict(user)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/login")
async def login(request: LoginRequest) -> Dict[str, Any]:
    """Unified login endpoint for all user types"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # First, check if it's a super admin user
        cursor.execute(
            """
            SELECT id, username, email, role, permissions, status
            FROM super_admin_users 
            WHERE (username = %s OR email = %s) AND status = 'ACTIVE'
            """,
            (request.email, request.email)
        )
        
        super_admin = cursor.fetchone()
        
        if super_admin:
            # Check super admin password (for demo purposes, accept specific password)
            if request.password == "Id200633048!":
                # Create super admin token
                access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = create_access_token(
                    data={
                        "sub": str(super_admin["id"]),
                        "user_type": "super_admin",
                        "email": super_admin["email"],
                        "role": super_admin["role"],
                        "company_id": None,
                        "location_id": None
                    },
                    expires_delta=access_token_expires
                )
                
                return {
                    "success": True,
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": super_admin["id"],
                        "name": super_admin["username"],
                        "email": super_admin["email"],
                        "role": super_admin["role"],
                        "company_id": None,
                        "company_name": None,
                        "location_id": None,
                        "location_name": None,
                        "user_type": "super_admin"
                    }
                }
        
        # If not super admin, check regular users
        if request.company_id:
            # Company-specific login
            cursor.execute(
                """
                SELECT u.id, u.name, u.email, u.role, u."clientId", u."locationId", u.status,
                       c.name as company_name, l.name as location_name
                FROM "User" u
                JOIN "Client" c ON u."clientId" = c.id
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u.email = %s AND u."clientId" = %s AND u.status = 'ACTIVE'
                """,
                (request.email, request.company_id)
            )
        else:
            # Search across all companies
            cursor.execute(
                """
                SELECT u.id, u.name, u.email, u.role, u."clientId", u."locationId", u.status,
                       c.name as company_name, l.name as location_name
                FROM "User" u
                JOIN "Client" c ON u."clientId" = c.id
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u.email = %s AND u.status = 'ACTIVE'
                """,
                (request.email,)
            )
        
        user = cursor.fetchone()
        
        if user:
            # For demo purposes, accept any password for regular users
            # In production, you would hash and verify the password
            if request.password == "1234" or request.password == "password123":
                # Create regular user token
                access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = create_access_token(
                    data={
                        "sub": str(user["id"]),
                        "user_type": "regular",
                        "email": user["email"],
                        "role": user["role"],
                        "company_id": user["clientId"],
                        "location_id": user["locationId"]
                    },
                    expires_delta=access_token_expires
                )
                
                return {
                    "success": True,
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": user["id"],
                        "name": user["name"],
                        "email": user["email"],
                        "role": user["role"],
                        "company_id": user["clientId"],
                        "company_name": user["company_name"],
                        "location_id": user["locationId"],
                        "location_name": user["location_name"],
                        "user_type": "regular"
                    }
                }
        
        cursor.close()
        conn.close()
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@router.get("/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
    """Get current user information"""
    return {
        "success": True,
        "data": current_user
    }

@router.post("/logout")
async def logout() -> Dict[str, Any]:
    """Logout user (client-side token removal)"""
    return {
        "success": True,
        "message": "Logout successful"
    }

@router.get("/companies")
async def get_companies() -> Dict[str, Any]:
    """Get all companies (clients) for login selection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, name, industry, "isFranchise", "createdAt"
            FROM "Client" 
            ORDER BY name
        """)
        
        companies = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [dict(company) for company in companies]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/companies/{company_id}/users")
async def get_company_users(company_id: str) -> Dict[str, Any]:
    """Get all users for a specific company"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.role, u."locationId", u.status,
                   l.name as location_name,
                   CASE WHEN l.id LIKE '%corporate%' THEN 'CORPORATE' ELSE 'FRANCHISE' END as location_type
            FROM "User" u
            JOIN "Location" l ON u."locationId" = l.id
            WHERE u."clientId" = %s AND u.status = 'ACTIVE'
            ORDER BY u.name
        """, (company_id,))
        
        users = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [
                {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "locationId": user["locationId"],
                    "status": user["status"],
                    "locationName": user["location_name"],
                    "locationType": user["location_type"]
                }
                for user in users
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

@router.get("/locations")
async def get_locations(
    client_id: Optional[str] = Query(None, description="Filter by client ID")
) -> Dict[str, Any]:
    """Get all locations for mobile app"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if client_id:
            cursor.execute("""
                SELECT id, name, "clientId", timezone, address, "createdAt", "updatedAt"
                FROM "Location" 
                WHERE "clientId" = %s
                ORDER BY name
            """, (client_id,))
        else:
            cursor.execute("""
                SELECT id, name, "clientId", timezone, address, "createdAt", "updatedAt"
                FROM "Location" 
                ORDER BY name
            """)
        
        locations = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [dict(location) for location in locations]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
