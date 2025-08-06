"""
User Management API Routes
Handles user CRUD operations, crew management, and multi-tenant user access
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any, Optional, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import os

# Import authentication
from .auth import verify_token

router = APIRouter(tags=["Users"])

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "postgres"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "c_and_c_crm"),
        user=os.getenv("DB_USER", "c_and_c_user"),
        password=os.getenv("DB_PASSWORD", "c_and_c_password")
    )

@router.get("/")
async def get_users(
    client_id: Optional[str] = None,
    location_id: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get users with optional filtering
    Supports multi-tenant filtering by client_id and location_id
    """
    try:
        # Check if user is super admin or has permission
        if current_user.get("user_type") == "super_admin":
            # Super admin can see all users
            location_id = None
            client_id = None
        else:
            # Regular users can only see users from their location
            if not current_user.get("locationId"):
                return {
                    "success": False,
                    "error": "Missing tenant information",
                    "message": "User must be associated with a client and location"
                }
            location_id = current_user.get("locationId")
            client_id = current_user.get("clientId")
        
        # Query real users from database
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            # Build query based on user type and filters
            query = 'SELECT id, name, email, role, "clientId", "locationId", status, "createdAt", "updatedAt" FROM "User" WHERE 1=1'
            params = []
            
            if current_user.get("user_type") != "super_admin":
                # Regular users can only see users from their location
                query += ' AND "locationId" = %s'
                params.append(current_user.get("locationId"))
            
            if role:
                query += ' AND role = %s'
                params.append(role)
            
            if status:
                query += ' AND status = %s'
                params.append(status)
            
            query += ' ORDER BY name'
            
            cursor.execute(query, params)
            users = cursor.fetchall()
            
            # Convert to list of dictionaries
            user_list = []
            for user in users:
                user_dict = dict(user)
                user_dict["lastLogin"] = user_dict["updatedAt"].isoformat() if user_dict["updatedAt"] else None
                user_dict["createdAt"] = user_dict["createdAt"].isoformat() if user_dict["createdAt"] else None
                user_dict["updatedAt"] = user_dict["updatedAt"].isoformat() if user_dict["updatedAt"] else None
                user_list.append(user_dict)
            
            return {
                "success": True,
                "data": user_list,
                "message": f"Retrieved {len(user_list)} users successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": "Database error",
                "message": str(e)
            }
        finally:
            cursor.close()
            conn.close()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve users: {str(e)}"
        )

@router.post("/")
async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new user
    Required fields: name, email, role, password, clientId, locationId
    """
    try:
        # TODO: Replace with database user creation
        # This should insert into the User table with proper validation
        return {
            "success": False,
            "error": "Database integration needed",
            "message": "User creation not implemented - database integration required"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.get("/{user_id}")
async def get_user(user_id: str) -> Dict[str, Any]:
    """
    Get a specific user by ID
    """
    try:
        # TODO: Replace with database query
        # This should query the User table by ID
        return {
            "success": False,
            "error": "Database integration needed",
            "message": "User retrieval not implemented - database integration required"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user: {str(e)}"
        )

@router.patch("/{user_id}")
async def update_user(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update a user's information
    """
    try:
        # TODO: Replace with database update
        # This should update the User table with proper validation
        return {
            "success": False,
            "error": "Database integration needed",
            "message": "User update not implemented - database integration required"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/{user_id}")
async def delete_user(user_id: str) -> Dict[str, Any]:
    """
    Delete a user (soft delete by setting status to INACTIVE)
    """
    try:
        # TODO: Replace with database soft delete
        # This should update the User table status to INACTIVE
        return {
            "success": False,
            "error": "Database integration needed",
            "message": "User deletion not implemented - database integration required"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

@router.get("/crew/scoreboard")
async def get_crew_scoreboard(
    client_id: Optional[str] = None,
    location_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get crew performance scoreboard
    Shows metrics for drivers and movers
    """
    try:
        # TODO: Replace with database aggregation queries
        # This should calculate performance metrics from journey data
        return {
            "success": False,
            "error": "Database integration needed",
            "message": "Crew scoreboard not implemented - database integration required"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve crew scoreboard: {str(e)}"
        ) 