"""
Super Admin Authentication Middleware
Handles authentication and authorization for super admin users
"""

import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import psycopg2
from psycopg2.extras import RealDictCursor

# Security scheme for super admin authentication
super_admin_security = HTTPBearer()

class SuperAdminAuth:
    def __init__(self, db_connection_string: str):
        self.db_connection_string = db_connection_string
        self.secret_key = "super_admin_secret_key_change_in_production"
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 60 * 24  # 24 hours

    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(self.db_connection_string)

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    async def authenticate_super_admin(self, username: str, password: str) -> Dict[str, Any]:
        """Authenticate super admin user"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Get super admin user
                    cur.execute("""
                        SELECT id, username, email, password_hash, role, permissions, status
                        FROM super_admin_users 
                        WHERE username = %s AND status = 'ACTIVE'
                    """, (username,))
                    
                    user = cur.fetchone()
                    if not user:
                        raise HTTPException(status_code=401, detail="Invalid credentials")

                    # Verify password
                    if not self.verify_password(password, user['password_hash']):
                        raise HTTPException(status_code=401, detail="Invalid credentials")

                    # Create session token
                    session_token = str(uuid.uuid4())
                    expires_at = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)

                    # Create session
                    cur.execute("""
                        INSERT INTO super_admin_sessions 
                        (super_admin_id, session_token, expires_at)
                        VALUES (%s, %s, %s)
                    """, (user['id'], session_token, expires_at))

                    # Update last login
                    cur.execute("""
                        UPDATE super_admin_users 
                        SET last_login = NOW() 
                        WHERE id = %s
                    """, (user['id'],))

                    conn.commit()

                    # Log access
                    self.log_access(user['id'], None, 'LOGIN', {
                        'username': username,
                        'ip_address': None,
                        'user_agent': None
                    })

                    return {
                        "success": True,
                        "message": "Login successful",
                        "data": {
                            "access_token": session_token,
                            "super_admin": {
                                "id": str(user['id']),
                                "username": user['username'],
                                "email": user['email'],
                                "role": user['role'],
                                "permissions": user['permissions'],
                                "current_company_id": None
                            },
                            "expires_in": self.access_token_expire_minutes * 60
                        }
                    }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

    async def get_current_super_admin(self, credentials: HTTPAuthorizationCredentials = Depends(super_admin_security)) -> Dict[str, Any]:
        """Get current super admin from token"""
        token = credentials.credentials
        
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Validate session
                    cur.execute("""
                        SELECT 
                            sas.expires_at > NOW() as is_valid,
                            sau.id as super_admin_id,
                            sau.username,
                            sau.role,
                            sau.permissions,
                            sas.current_company_id
                        FROM super_admin_sessions sas
                        JOIN super_admin_users sau ON sas.super_admin_id = sau.id
                        WHERE sas.session_token = %s AND sau.status = 'ACTIVE'
                    """, (token,))
                    
                    session = cur.fetchone()
                    if not session or not session['is_valid']:
                        raise HTTPException(status_code=401, detail="Invalid or expired session")

                    # Update last activity
                    cur.execute("""
                        UPDATE super_admin_sessions 
                        SET last_activity = NOW() 
                        WHERE session_token = %s
                    """, (token,))
                    
                    conn.commit()

                    return {
                        "id": str(session['super_admin_id']),
                        "username": session['username'],
                        "role": session['role'],
                        "permissions": session['permissions'],
                        "current_company_id": str(session['current_company_id']) if session['current_company_id'] else None,
                        "session_token": token
                    }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Session validation error: {str(e)}")

    async def switch_company_context(self, super_admin_id: str, company_id: str, session_token: str) -> Dict[str, Any]:
        """Switch company context for super admin"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Verify company exists
                    cur.execute("SELECT id, name, type FROM \"Client\" WHERE id = %s", (company_id,))
                    company = cur.fetchone()
                    if not company:
                        raise HTTPException(status_code=404, detail="Company not found")

                    # Update session with new company context
                    cur.execute("""
                        UPDATE super_admin_sessions 
                        SET current_company_id = %s 
                        WHERE super_admin_id = %s AND session_token = %s
                    """, (company_id, super_admin_id, session_token))

                    conn.commit()

                    # Log company switch
                    self.log_access(super_admin_id, company_id, 'COMPANY_SWITCH', {
                        'company_name': company['name'],
                        'company_type': company['type']
                    })

                    return {
                        "success": True,
                        "message": f"Switched to company: {company['name']}",
                        "data": {
                            "current_company": {
                                "id": str(company['id']),
                                "name": company['name'],
                                "type": company['type'],
                                "status": "ACTIVE"
                            }
                        }
                    }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Company switch error: {str(e)}")

    def log_access(self, super_admin_id: str, company_id: str, action_type: str, action_details: Dict[str, Any] = None):
        """Log super admin access"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO company_access_logs 
                        (super_admin_id, company_id, action_type, action_details)
                        VALUES (%s, %s, %s, %s)
                    """, (super_admin_id, company_id, action_type, action_details))
                    conn.commit()
        except Exception as e:
            # Log error but don't fail the main operation
            print(f"Failed to log access: {str(e)}")

    def check_permission(self, super_admin: Dict[str, Any], required_permission: str) -> bool:
        """Check if super admin has required permission"""
        permissions = super_admin.get('permissions', [])
        return required_permission in permissions

    async def require_permission(self, super_admin: Dict[str, Any], required_permission: str):
        """Require specific permission or raise HTTPException"""
        if not self.check_permission(super_admin, required_permission):
            raise HTTPException(
                status_code=403, 
                detail=f"Permission denied: {required_permission}"
            )

    async def logout(self, session_token: str) -> Dict[str, Any]:
        """Logout super admin"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Get session info before deleting
                    cur.execute("""
                        SELECT super_admin_id, current_company_id 
                        FROM super_admin_sessions 
                        WHERE session_token = %s
                    """, (session_token,))
                    
                    session = cur.fetchone()
                    if session:
                        # Log logout
                        self.log_access(
                            str(session['super_admin_id']), 
                            str(session['current_company_id']) if session['current_company_id'] else None,
                            'LOGOUT'
                        )

                    # Delete session
                    cur.execute("DELETE FROM super_admin_sessions WHERE session_token = %s", (session_token,))
                    conn.commit()

                    return {
                        "success": True,
                        "message": "Logout successful"
                    }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Logout error: {str(e)}")

    async def get_available_companies(self, super_admin: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get all available companies for super admin"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, name, type, contact_email, contact_phone, address, status, created_at
                        FROM "Client" 
                        ORDER BY name
                    """)
                    
                    companies = cur.fetchall()
                    return [
                        {
                            "id": str(company['id']),
                            "name": company['name'],
                            "type": company['type'],
                            "contact_email": company['contact_email'],
                            "contact_phone": company['contact_phone'],
                            "address": company['address'],
                            "status": company['status'],
                            "created_at": company['created_at'].isoformat() if company['created_at'] else None
                        }
                        for company in companies
                    ]

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get companies: {str(e)}")

# Global instance
# Initialize with environment variable or default to production database
import os
database_url = os.getenv("DATABASE_URL", "postgresql://c_and_c_user:c_and_c_password@dpg-d29kpcfgi27c73cnano0-a.oregon-postgres.render.com/c_and_c_crm?sslmode=require")
super_admin_auth = SuperAdminAuth(database_url)

# Dependency functions
async def get_current_super_admin(super_admin: Dict[str, Any] = Depends(super_admin_auth.get_current_super_admin)):
    return super_admin

def require_super_admin_permission(permission: str):
    """Dependency to require specific permission"""
    async def permission_checker(super_admin: Dict[str, Any] = Depends(get_current_super_admin)):
        await super_admin_auth.require_permission(super_admin, permission)
        return super_admin
    return permission_checker 