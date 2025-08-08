from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
from datetime import datetime

router = APIRouter(tags=["Journey Steps"])

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

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

@router.get("/journeys/{journey_id}/steps")
async def get_journey_steps(journey_id: str) -> Dict[str, Any]:
    """Get all steps for a specific journey"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 
                js.id, js.step_number, js.step_name, js.status,
                js.started_at, js.completed_at, js.approved_at,
                u.name as approver_name
            FROM "JourneyStep" js
            LEFT JOIN "User" u ON js.approved_by = u.id
            WHERE js.journey_id = %s
            ORDER BY js.step_number
        """, (journey_id,))
        
        steps = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [dict(step) for step in steps]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/journeys/{journey_id}/steps/{step_number}")
async def get_journey_step(journey_id: str, step_number: int) -> Dict[str, Any]:
    """Get a specific step for a journey"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 
                js.id, js.step_number, js.step_name, js.status,
                js.started_at, js.completed_at, js.approved_at,
                u.name as approver_name
            FROM "JourneyStep" js
            LEFT JOIN "User" u ON js.approved_by = u.id
            WHERE js.journey_id = %s AND js.step_number = %s
        """, (journey_id, step_number))
        
        step = cursor.fetchone()
        if not step:
            raise HTTPException(status_code=404, detail="Step not found")
        
        # Get activities for this step
        cursor.execute("""
            SELECT 
                sa.id, sa.activity_type, sa.data, sa.created_at,
                u.name as creator_name, u.role as creator_role
            FROM "StepActivity" sa
            JOIN "User" u ON sa.created_by = u.id
            WHERE sa.step_id = %s
            ORDER BY sa.created_at
        """, (step['id'],))
        
        activities = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "step": dict(step),
                "activities": [dict(activity) for activity in activities]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/journeys/{journey_id}/steps/{step_number}/start")
async def start_journey_step(journey_id: str, step_number: int) -> Dict[str, Any]:
    """Start a journey step"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if step exists
        cursor.execute("""
            SELECT id, status FROM "JourneyStep" 
            WHERE journey_id = %s AND step_number = %s
        """, (journey_id, step_number))
        
        step = cursor.fetchone()
        if not step:
            # Create the step if it doesn't exist
            step_names = {
                1: "Ready to Go",
                2: "Points A", 
                3: "New Location",
                4: "Back to Dispatcher"
            }
            
            cursor.execute("""
                INSERT INTO "JourneyStep" (id, journey_id, step_number, step_name, status, started_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                f"step_{journey_id}_{step_number}",
                journey_id,
                step_number,
                step_names.get(step_number, f"Step {step_number}"),
                "IN_PROGRESS",
                datetime.now()
            ))
            
            step_id = cursor.fetchone()['id']
        else:
            # Update existing step
            cursor.execute("""
                UPDATE "JourneyStep" 
                SET status = %s, started_at = %s
                WHERE id = %s
            """, ("IN_PROGRESS", datetime.now(), step['id']))
            step_id = step['id']
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": f"Step {step_number} started successfully",
            "data": {"step_id": step_id}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/journeys/{journey_id}/steps/{step_number}/complete")
async def complete_journey_step(journey_id: str, step_number: int) -> Dict[str, Any]:
    """Complete a journey step"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            UPDATE "JourneyStep" 
            SET status = %s, completed_at = %s
            WHERE journey_id = %s AND step_number = %s
        """, ("COMPLETED", datetime.now(), journey_id, step_number))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": f"Step {step_number} completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/journeys/{journey_id}/steps/{step_number}/approve")
async def approve_journey_step(journey_id: str, step_number: int, approver_id: str) -> Dict[str, Any]:
    """Approve a journey step (Manager only)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            UPDATE "JourneyStep" 
            SET status = %s, approved_by = %s, approved_at = %s
            WHERE journey_id = %s AND step_number = %s
        """, ("APPROVED", approver_id, datetime.now(), journey_id, step_number))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": f"Step {step_number} approved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/journeys/{journey_id}/steps/{step_number}/activities")
async def add_step_activity(
    journey_id: str, 
    step_number: int, 
    activity_type: str,
    data: Dict[str, Any],
    creator_id: str
) -> Dict[str, Any]:
    """Add an activity to a journey step"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get the step ID
        cursor.execute("""
            SELECT id FROM "JourneyStep" 
            WHERE journey_id = %s AND step_number = %s
        """, (journey_id, step_number))
        
        step = cursor.fetchone()
        if not step:
            raise HTTPException(status_code=404, detail="Step not found")
        
        # Add the activity
        cursor.execute("""
            INSERT INTO "StepActivity" (id, step_id, activity_type, data, created_by)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            f"activity_{step['id']}_{datetime.now().timestamp()}",
            step['id'],
            activity_type,
            json.dumps(data),
            creator_id
        ))
        
        activity_id = cursor.fetchone()['id']
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "Activity added successfully",
            "data": {"activity_id": activity_id}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/role-permissions")
async def get_role_permissions() -> Dict[str, Any]:
    """Get role-based permissions for journey steps"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT role, step_number, can_edit, can_approve, can_view
            FROM "RolePermission"
            ORDER BY role, step_number
        """)
        
        permissions = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [dict(permission) for permission in permissions]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 