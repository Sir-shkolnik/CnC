from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import os

router = APIRouter(tags=["Locations"])

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "postgres"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "c_and_c_crm"),
    "user": os.getenv("DB_USER", "c_and_c_user"),
    "password": os.getenv("DB_PASSWORD", "c_and_c_password")
}

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

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

@router.get("/locations/{location_id}")
async def get_location(location_id: str) -> Dict[str, Any]:
    """Get a specific location by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, name, "clientId", timezone, address, "createdAt", "updatedAt"
            FROM "Location" 
            WHERE id = %s
        """, (location_id,))
        
        location = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")
        
        return {
            "success": True,
            "data": dict(location)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/locations/{location_id}/users")
async def get_location_users(location_id: str) -> Dict[str, Any]:
    """Get all users for a specific location"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, name, email, role, status, "createdAt", "updatedAt"
            FROM "User" 
            WHERE "locationId" = %s AND status = 'ACTIVE'
            ORDER BY name
        """, (location_id,))
        
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [dict(user) for user in users]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 