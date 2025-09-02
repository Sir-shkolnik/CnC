from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from apps.api.dependencies import get_current_user
from apps.api.models.user import User
from prisma import Prisma

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """Get dashboard statistics for the current user's location"""
    try:
        db = Prisma()
        await db.connect()
        
        # Get stats for the user's location
        location_id = current_user.locationId
        client_id = current_user.clientId
        
        # Count total users at this location
        total_users = await db.user.count(
            where={
                "locationId": location_id,
                "status": "ACTIVE"
            }
        )
        
        # Count active journeys today
        today = date.today()
        active_journeys = await db.truckjourney.count(
            where={
                "locationId": location_id,
                "date": {
                    "gte": datetime.combine(today, datetime.min.time()),
                    "lt": datetime.combine(today, datetime.max.time())
                },
                "status": {
                    "in": ["MORNING_PREP", "ON_ROAD", "ON_SITE", "RETURNING"]
                }
            }
        )
        
        # Count completed journeys today
        completed_today = await db.truckjourney.count(
            where={
                "locationId": location_id,
                "date": {
                    "gte": datetime.combine(today, datetime.min.time()),
                    "lt": datetime.combine(today, datetime.max.time())
                },
                "status": "COMPLETED"
            }
        )
        
        # Count pending jobs (jobs without assignments)
        pending_jobs = await db.job.count(
            where={
                "branch": {
                    "locationId": location_id
                },
                "assignments": {
                    "none": {}
                }
            }
        )
        
        # Count total locations for this client
        total_locations = await db.location.count(
            where={
                "clientId": client_id
            }
        )
        
        # Count active drivers (users with DRIVER role who are active)
        active_drivers = await db.user.count(
            where={
                "locationId": location_id,
                "role": "DRIVER",
                "status": "ACTIVE"
            }
        )
        
        await db.disconnect()
        
        return {
            "totalUsers": total_users,
            "activeJourneys": active_journeys,
            "completedToday": completed_today,
            "pendingJobs": pending_jobs,
            "totalLocations": total_locations,
            "activeDrivers": active_drivers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

@router.get("/recent-journeys")
async def get_recent_journeys(current_user: User = Depends(get_current_user)):
    """Get recent journeys for the current user's location"""
    try:
        db = Prisma()
        await db.connect()
        
        location_id = current_user.locationId
        
        # Get recent journeys from the last 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        
        recent_journeys = await db.truckjourney.find_many(
            where={
                "locationId": location_id,
                "date": {
                    "gte": seven_days_ago
                }
            },
            include={
                "assignedCrew": {
                    include: {
                        "user": True
                    }
                },
                "location": True
            },
            order={
                "date": "desc"
            },
            take=10
        )
        
        # Format the response
        formatted_journeys = []
        for journey in recent_journeys:
            # Get driver name
            driver_name = "Unassigned"
            if journey.assignedCrew:
                driver = next((crew.user for crew in journey.assignedCrew if crew.role == "DRIVER"), None)
                if driver:
                    driver_name = f"{driver.firstName} {driver.lastName}"
            
            # Count jobs
            job_count = await db.job.count(
                where={
                    "branch": {
                        "locationId": location_id
                    },
                    "scheduledDate": journey.date
                }
            )
            
            formatted_journeys.append({
                "id": journey.id,
                "truckNumber": journey.truckNumber or "TBD",
                "status": journey.status.value if hasattr(journey.status, 'value') else str(journey.status),
                "date": journey.date.isoformat(),
                "driver": driver_name,
                "location": journey.location.name,
                "jobs": job_count
            })
        
        await db.disconnect()
        return formatted_journeys
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recent journeys: {str(e)}")

@router.get("/quick-actions")
async def get_quick_actions(current_user: User = Depends(get_current_user)):
    """Get available quick actions based on user role"""
    try:
        role = current_user.role
        
        # Define actions based on role
        actions = {
            "SUPER_ADMIN": [
                {"id": "new_journey", "label": "New Journey", "icon": "plus", "permission": True},
                {"id": "assign_crew", "label": "Assign Crew", "icon": "users", "permission": True},
                {"id": "schedule_jobs", "label": "Schedule Jobs", "icon": "calendar", "permission": True},
                {"id": "view_reports", "label": "View Reports", "icon": "trending-up", "permission": True},
                {"id": "manage_users", "label": "Manage Users", "icon": "user-plus", "permission": True},
                {"id": "company_settings", "label": "Company Settings", "icon": "settings", "permission": True}
            ],
            "ADMIN": [
                {"id": "new_journey", "label": "New Journey", "icon": "plus", "permission": True},
                {"id": "assign_crew", "label": "Assign Crew", "icon": "users", "permission": True},
                {"id": "schedule_jobs", "label": "Schedule Jobs", "icon": "calendar", "permission": True},
                {"id": "view_reports", "label": "View Reports", "icon": "trending-up", "permission": True},
                {"id": "manage_users", "label": "Manage Users", "icon": "user-plus", "permission": True}
            ],
            "DISPATCHER": [
                {"id": "new_journey", "label": "New Journey", "icon": "plus", "permission": True},
                {"id": "assign_crew", "label": "Assign Crew", "icon": "users", "permission": True},
                {"id": "schedule_jobs", "label": "Schedule Jobs", "icon": "calendar", "permission": True},
                {"id": "view_reports", "label": "View Reports", "icon": "trending-up", "permission": False}
            ],
            "DRIVER": [
                {"id": "new_journey", "label": "New Journey", "icon": "plus", "permission": False},
                {"id": "assign_crew", "label": "Assign Crew", "icon": "users", "permission": False},
                {"id": "schedule_jobs", "label": "Schedule Jobs", "icon": "calendar", "permission": False},
                {"id": "view_reports", "label": "View Reports", "icon": "trending-up", "permission": False}
            ],
            "MOVER": [
                {"id": "new_journey", "label": "New Journey", "icon": "plus", "permission": False},
                {"id": "assign_crew", "label": "Assign Crew", "icon": "users", "permission": False},
                {"id": "schedule_jobs", "label": "Schedule Jobs", "icon": "calendar", "permission": False},
                {"id": "view_reports", "label": "View Reports", "icon": "trending-up", "permission": False}
            ]
        }
        
        return actions.get(role, [])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quick actions: {str(e)}")
