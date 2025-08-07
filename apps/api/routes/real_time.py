from fastapi import APIRouter, Depends, HTTPException
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import json
from datetime import datetime, timedelta

from apps.api.middleware.auth import get_current_user
from apps.api.database import get_db_connection

router = APIRouter()

@router.get("/dashboard")
async def get_real_time_dashboard(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get real-time dashboard data for the current user"""
    try:
        # Debug: Log the current_user object
        print(f"DEBUG: current_user = {current_user}")
        
        # For now, return a simple response to test
        return {
            "success": True,
            "data": {
                "activeJourneys": 5,
                "unreadMessages": 2,
                "pendingAudits": 1,
                "newFeedback": 0,
                "activeFieldOps": 3,
                "pendingApprovals": 2,
                "systemAlerts": 1,
                "locationUpdates": 15,
                "lastUpdated": datetime.now().isoformat()
            },
            "debug": {
                "user_id": current_user.get("id"),
                "user_role": current_user.get("role"),
                "client_id": current_user.get("client_id"),
                "location_id": current_user.get("location_id")
            }
        }
        
        # Initialize dashboard data
        dashboard_data = {
            "activeJourneys": 0,
            "unreadMessages": 0,
            "pendingAudits": 0,
            "newFeedback": 0,
            "activeFieldOps": 0,
            "pendingApprovals": 0,
            "systemAlerts": 0,
            "locationUpdates": 0,
            "lastUpdated": datetime.now().isoformat()
        }
        
        # Get active journeys count
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM "TruckJourney" 
            WHERE "clientId" = %s AND "locationId" = %s AND status != 'COMPLETED'
        """, (client_id, location_id))
        result = cursor.fetchone()
        dashboard_data["activeJourneys"] = result["count"] if result else 0
        
        # Get en-route journeys (active field ops)
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM "TruckJourney" 
            WHERE "clientId" = %s AND "locationId" = %s AND status = 'EN_ROUTE'
        """, (client_id, location_id))
        result = cursor.fetchone()
        dashboard_data["activeFieldOps"] = result["count"] if result else 0
        
        # Get pending audits (based on user role)
        if user_role in ["MANAGER", "ADMIN", "AUDITOR"]:
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM "AuditEntry" 
                WHERE "clientId" = %s AND "locationId" = %s AND status = 'PENDING'
            """, (client_id, location_id))
            result = cursor.fetchone()
            dashboard_data["pendingAudits"] = result["count"] if result else 0
        
        # Get pending approvals (for managers and admins)
        if user_role in ["MANAGER", "ADMIN"]:
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM "JourneyStep" 
                WHERE "clientId" = %s AND "locationId" = %s AND status = 'PENDING_APPROVAL'
            """, (client_id, location_id))
            result = cursor.fetchone()
            dashboard_data["pendingApprovals"] = result["count"] if result else 0
        
        # Get system alerts (for all users)
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM "MobileNotification" 
            WHERE "clientId" = %s AND "locationId" = %s AND type = 'ALERT' AND read = false
        """, (client_id, location_id))
        result = cursor.fetchone()
        dashboard_data["systemAlerts"] = result["count"] if result else 0
        
        # Get recent location updates (last 24 hours)
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM "MobileJourneyUpdate" 
            WHERE "clientId" = %s AND "locationId" = %s 
            AND "createdAt" >= %s
        """, (client_id, location_id, datetime.now() - timedelta(hours=24)))
        result = cursor.fetchone()
        dashboard_data["locationUpdates"] = result["count"] if result else 0
        
        # Get unread messages (simulated for now)
        # TODO: Implement real chat system
        dashboard_data["unreadMessages"] = 0
        
        # Get new feedback (simulated for now)
        # TODO: Implement real feedback system
        dashboard_data["newFeedback"] = 0
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": dashboard_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")

@router.get("/journey/{journey_id}/updates")
async def get_journey_updates(
    journey_id: str, 
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get real-time updates for a specific journey"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verify user has access to this journey
        cursor.execute("""
            SELECT id, status, "clientId", "locationId" 
            FROM "TruckJourney" 
            WHERE id = %s
        """, (journey_id,))
        journey = cursor.fetchone()
        
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        # Check user permissions
        if current_user["role"] not in ["ADMIN"] and journey["clientId"] != current_user["client_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get recent updates
        cursor.execute("""
            SELECT 
                mju.id,
                mju."journeyId",
                mju."updateType",
                mju."updateData",
                mju."createdAt",
                u.name as "userName",
                u.role as "userRole"
            FROM "MobileJourneyUpdate" mju
            JOIN "User" u ON mju."userId" = u.id
            WHERE mju."journeyId" = %s
            ORDER BY mju."createdAt" DESC
            LIMIT 50
        """, (journey_id,))
        
        updates = cursor.fetchall()
        
        # Get current journey status
        cursor.execute("""
            SELECT 
                tj.id,
                tj.status,
                tj."pickupAddress",
                tj."deliveryAddress",
                tj."scheduledDate",
                tj."estimatedDuration",
                tj."actualDuration",
                tj."createdAt",
                tj."updatedAt"
            FROM "TruckJourney" tj
            WHERE tj.id = %s
        """, (journey_id,))
        
        journey_details = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "journey": dict(journey_details) if journey_details else None,
                "updates": [dict(update) for update in updates],
                "lastUpdated": datetime.now().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch journey updates: {str(e)}")

@router.get("/notifications")
async def get_notifications(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get real-time notifications for the current user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        user_id = current_user["id"]
        client_id = current_user["client_id"]
        location_id = current_user["location_id"]
        
        # Get unread notifications
        cursor.execute("""
            SELECT 
                id,
                type,
                title,
                message,
                "createdAt",
                read
            FROM "MobileNotification"
            WHERE "userId" = %s AND read = false
            ORDER BY "createdAt" DESC
            LIMIT 20
        """, (user_id,))
        
        notifications = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "notifications": [dict(notification) for notification in notifications],
                "unreadCount": len(notifications),
                "lastUpdated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Mark a notification as read"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update notification
        cursor.execute("""
            UPDATE "MobileNotification"
            SET read = true, "updatedAt" = %s
            WHERE id = %s AND "userId" = %s
        """, (datetime.now(), notification_id, current_user["id"]))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "Notification marked as read"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark notification as read: {str(e)}")

@router.get("/system-status")
async def get_system_status(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get overall system status and health"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        client_id = current_user["client_id"]
        location_id = current_user["location_id"]
        
        # Get system statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_journeys,
                COUNT(CASE WHEN status = 'EN_ROUTE' THEN 1 END) as active_journeys,
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_journeys,
                COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_journeys
            FROM "TruckJourney"
            WHERE "clientId" = %s AND "locationId" = %s
        """, (client_id, location_id))
        
        journey_stats = cursor.fetchone()
        
        # Get user statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'DRIVER' THEN 1 END) as drivers,
                COUNT(CASE WHEN role = 'MOVER' THEN 1 END) as movers,
                COUNT(CASE WHEN role = 'DISPATCHER' THEN 1 END) as dispatchers
            FROM "User"
            WHERE "clientId" = %s AND "locationId" = %s AND status = 'ACTIVE'
        """, (client_id, location_id))
        
        user_stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "journeys": dict(journey_stats) if journey_stats else {},
                "users": dict(user_stats) if user_stats else {},
                "systemHealth": "operational",
                "lastUpdated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch system status: {str(e)}") 