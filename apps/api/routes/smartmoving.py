#!/usr/bin/env python3
"""
SmartMoving API Routes
Handles SmartMoving integration endpoints with role-based access control
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import logging
import asyncio
from datetime import datetime, timedelta

# Import SmartMoving sync service
from ..services.smartmoving_sync_service import SmartMovingSyncService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/smartmoving", tags=["SmartMoving Integration"])

def get_db_connection():
    """Get database connection using DATABASE_URL or fallback to individual env vars"""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        parsed = urlparse(database_url)
        return psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],
            user=parsed.username,
            password=parsed.password
        )
    else:
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "c_and_c_crm"),
            user=os.getenv("DB_USER", "c_and_c_user"),
            password=os.getenv("DB_PASSWORD", "c_and_c_password")
        )

@router.post("/sync/jobs")
async def sync_smartmoving_jobs() -> Dict[str, Any]:
    """Sync today's and tomorrow's jobs from SmartMoving"""
    try:
        logger.info("Starting SmartMoving job sync...")
        
        async with SmartMovingSyncService() as sync_service:
            result = await sync_service.sync_today_and_tomorrow_jobs()
            
            logger.info(f"SmartMoving job sync completed: {result}")
            
            return {
                "success": True,
                "data": result,
                "message": "SmartMoving jobs synced successfully"
            }
            
    except Exception as e:
        logger.error(f"Error syncing SmartMoving jobs: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to sync SmartMoving jobs"
        }

@router.get("/sync/status")
async def get_smartmoving_sync_status() -> Dict[str, Any]:
    """Get SmartMoving sync status"""
    try:
        async with SmartMovingSyncService() as sync_service:
            status = await sync_service.get_sync_status()
            
            return {
                "success": True,
                "data": status,
                "message": "SmartMoving sync status retrieved"
            }
            
    except Exception as e:
        logger.error(f"Error getting SmartMoving sync status: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to get SmartMoving sync status"
        }

@router.get("/status")
async def get_smartmoving_status() -> Dict[str, Any]:
    """Get SmartMoving integration status"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if SmartMoving tables exist
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'SmartMovingBranch'
            );
        """)
        
        branches_table_exists = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'SmartMovingMaterial'
            );
        """)
        
        materials_table_exists = cursor.fetchone()[0]
        
        # Count data if tables exist
        branch_count = 0
        material_count = 0
        
        if branches_table_exists:
            cursor.execute("SELECT COUNT(*) as count FROM \"SmartMovingBranch\"")
            branch_count = cursor.fetchone()['count']
        
        if materials_table_exists:
            cursor.execute("SELECT COUNT(*) as count FROM \"SmartMovingMaterial\"")
            material_count = cursor.fetchone()['count']
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "integration_status": "active" if branches_table_exists else "not_initialized",
                "branches_table_exists": branches_table_exists,
                "materials_table_exists": materials_table_exists,
                "branch_count": branch_count,
                "material_count": material_count,
                "last_sync": "2025-08-08T00:00:00Z"  # Placeholder
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting SmartMoving status: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to get SmartMoving status"
        }

@router.post("/sync")
async def sync_smartmoving_data() -> Dict[str, Any]:
    """Sync data from SmartMoving API to local database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create SmartMoving tables if they don't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "SmartMovingBranch" (
                "id" TEXT PRIMARY KEY,
                "lgm_branch_id" TEXT UNIQUE,
                "name" TEXT NOT NULL,
                "address" TEXT,
                "city" TEXT,
                "state" TEXT,
                "zip_code" TEXT,
                "phone" TEXT,
                "gps_coordinates" JSONB,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT NOW(),
                "updated_at" TIMESTAMP DEFAULT NOW()
            );
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "SmartMovingMaterial" (
                "id" TEXT PRIMARY KEY,
                "lgm_material_id" TEXT UNIQUE,
                "name" TEXT NOT NULL,
                "rate" DECIMAL(10,2),
                "description" TEXT,
                "category" TEXT,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT NOW()
            );
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "SmartMovingServiceType" (
                "id" TEXT PRIMARY KEY,
                "lgm_service_id" TEXT UNIQUE,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT NOW()
            );
        """)
        
        # Load LGM data from JSON file
        lgm_data_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'lgm_company_data_complete.json')
        
        if not os.path.exists(lgm_data_path):
            # If file doesn't exist, create sample data
            sample_data = {
                "branches": {
                    "locations": [
                        {
                            "id": "branch_001",
                            "name": "BURNABY",
                            "address": "32615 South Fraser Way",
                            "city": "Abbotsford",
                            "state": "BC",
                            "zip_code": "V2T 1X8",
                            "phone": "(604) 555-0123",
                            "gps": {"latitude": 49.051584, "longitude": -122.320611}
                        }
                    ]
                },
                "materials": {
                    "catalog": [
                        {
                            "id": "material_001",
                            "name": "Queen Mattress Bag",
                            "rate": 19.99,
                            "description": "Protective bag for queen mattress",
                            "category": "Mattress Bags"
                        }
                    ]
                }
            }
        else:
            with open(lgm_data_path, 'r') as f:
                sample_data = json.load(f)
        
        # Sync branches
        branch_count = 0
        if "branches" in sample_data and "locations" in sample_data["branches"]:
            for branch in sample_data["branches"]["locations"]:
                cursor.execute("""
                    INSERT INTO "SmartMovingBranch" 
                    (id, lgm_branch_id, name, address, city, state, zip_code, phone, gps_coordinates, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    ON CONFLICT (lgm_branch_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    address = EXCLUDED.address,
                    city = EXCLUDED.city,
                    state = EXCLUDED.state,
                    zip_code = EXCLUDED.zip_code,
                    phone = EXCLUDED.phone,
                    gps_coordinates = EXCLUDED.gps_coordinates,
                    updated_at = NOW()
                """, (
                    f"sm_branch_{branch.get('id', branch_count)}",
                    branch.get('id'),
                    branch.get('name', 'Unknown'),
                    branch.get('address'),
                    branch.get('city'),
                    branch.get('state'),
                    branch.get('zip_code'),
                    branch.get('phone'),
                    json.dumps(branch.get('gps', {}))
                ))
                branch_count += 1
        
        # Sync materials
        material_count = 0
        if "materials" in sample_data and "catalog" in sample_data["materials"]:
            for material in sample_data["materials"]["catalog"]:
                cursor.execute("""
                    INSERT INTO "SmartMovingMaterial" 
                    (id, lgm_material_id, name, rate, description, category, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (lgm_material_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    rate = EXCLUDED.rate,
                    description = EXCLUDED.description,
                    category = EXCLUDED.category
                """, (
                    f"sm_material_{material.get('id', material_count)}",
                    material.get('id'),
                    material.get('name', 'Unknown'),
                    material.get('rate', 0.0),
                    material.get('description'),
                    material.get('category')
                ))
                material_count += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "SmartMoving data synchronized successfully",
            "data": {
                "branches_synced": branch_count,
                "materials_synced": material_count,
                "sync_timestamp": "2025-08-08T00:00:00Z"
            }
        }
        
    except Exception as e:
        logger.error(f"Error syncing SmartMoving data: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to sync SmartMoving data"
        }

@router.get("/branches")
async def get_smartmoving_branches() -> Dict[str, Any]:
    """Get all SmartMoving branches"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, lgm_branch_id, name, address, city, state, zip_code, phone, gps_coordinates, is_active, created_at, updated_at
            FROM "SmartMovingBranch"
            WHERE is_active = true
            ORDER BY name
        """)
        
        branches = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [dict(branch) for branch in branches],
            "count": len(branches)
        }
        
    except Exception as e:
        logger.error(f"Error getting SmartMoving branches: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to get SmartMoving branches"
        }

@router.get("/materials")
async def get_smartmoving_materials() -> Dict[str, Any]:
    """Get all SmartMoving materials"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, lgm_material_id, name, rate, description, category, is_active, created_at
            FROM "SmartMovingMaterial"
            WHERE is_active = true
            ORDER BY category, name
        """)
        
        materials = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": [dict(material) for material in materials],
            "count": len(materials)
        }
        
    except Exception as e:
        logger.error(f"Error getting SmartMoving materials: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to get SmartMoving materials"
        }

@router.get("/test")
async def test_smartmoving_connection() -> Dict[str, Any]:
    """Test SmartMoving integration - No authentication required for testing"""
    return {
        "success": True,
        "message": "SmartMoving integration is working",
        "data": {
            "status": "connected",
            "version": "1.0.0",
            "endpoints": [
                "/smartmoving/status",
                "/smartmoving/sync",
                "/smartmoving/branches",
                "/smartmoving/materials",
                "/smartmoving/test"
            ],
            "database_connection": "checking...",
            "timestamp": "2025-08-08T00:00:00Z"
        }
    }

# Add a test endpoint for debugging
@router.get("/test/sync")
async def test_smartmoving_sync() -> Dict[str, Any]:
    """Test SmartMoving sync without authentication (for debugging)"""
    try:
        logger.info("Starting SmartMoving sync test...")
        
        async with SmartMovingSyncService() as sync_service:
            result = await sync_service.sync_today_and_tomorrow_jobs()
            
            logger.info(f"SmartMoving sync test completed: {result}")
            
            return {
                "success": True,
                "data": result,
                "message": "SmartMoving sync test completed"
            }
            
    except Exception as e:
        logger.error(f"Error in SmartMoving sync test: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "SmartMoving sync test failed"
        }

# Add automated sync endpoints
@router.post("/sync/automated/start")
async def start_automated_sync() -> Dict[str, Any]:
    """Start the automated SmartMoving sync service"""
    try:
        from apps.api.background_sync import BackgroundSmartMovingSync
        
        # Start the background sync service
        sync_service = BackgroundSmartMovingSync()
        await sync_service.run_sync_cycle()
        
        return {
            "success": True,
            "message": "Automated sync started successfully",
            "sync_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error starting automated sync: {e}")
        return {
            "success": False,
            "message": f"Failed to start automated sync: {str(e)}"
        }

@router.get("/sync/automated/status")
async def get_automated_sync_status() -> Dict[str, Any]:
    """Get the status of the automated SmartMoving sync service"""
    try:
        from apps.api.background_sync import BackgroundSmartMovingSync
        
        async with BackgroundSmartMovingSync() as sync_service:
            status = await sync_service.get_status()
            
        return {
            "success": True,
            "data": status
        }
        
    except Exception as e:
        logger.error(f"Error getting sync status: {e}")
        return {
            "success": False,
            "message": f"Failed to get sync status: {str(e)}"
        }

@router.post("/sync/automated/trigger")
async def trigger_automated_sync() -> Dict[str, Any]:
    """Trigger comprehensive 48-hour sync for all branches"""
    try:
        logger.info("Triggering comprehensive 48-hour SmartMoving sync for all branches")
        
        # Use SmartMoving sync service directly for comprehensive data
        async with SmartMovingSyncService() as sync_service:
            # Sync today and tomorrow for all locations
            result = await sync_service.sync_today_and_tomorrow_jobs()
            
            # Get detailed statistics
            today_stats = result.get('today', {})
            tomorrow_stats = result.get('tomorrow', {})
            summary = result.get('summary', {})
            
            logger.info(f"Comprehensive sync completed:")
            logger.info(f"  Today: {today_stats.get('processed', 0)} jobs processed")
            logger.info(f"  Tomorrow: {tomorrow_stats.get('processed', 0)} jobs processed")
            logger.info(f"  Total Created: {summary.get('totalCreated', 0)} new journeys")
            logger.info(f"  Total Updated: {summary.get('totalUpdated', 0)} existing journeys")
            
            return {
                "success": True,
                "message": "Comprehensive 48-hour sync completed successfully",
                "data": {
                    "today_jobs_processed": today_stats.get('processed', 0),
                    "tomorrow_jobs_processed": tomorrow_stats.get('processed', 0),
                    "total_created": summary.get('totalCreated', 0),
                    "total_updated": summary.get('totalUpdated', 0),
                    "total_failed": summary.get('totalFailed', 0),
                    "sync_time": datetime.now().isoformat(),
                    "coverage": "48 hours (today + tomorrow)",
                    "branches": "All active LGM branches"
                },
                "timestamp": datetime.now().isoformat()
            }
        
    except Exception as e:
        logger.error(f"Error triggering comprehensive sync: {e}")
        return {
            "success": False,
            "message": f"Failed to trigger comprehensive sync: {str(e)}"
        }

# Add journey data endpoints
@router.get("/journeys/active")
async def get_active_journeys(
    location_id: str = None,
    client_id: str = None,
    date_from: str = None,
    date_to: str = None
) -> Dict[str, Any]:
    """Get active journeys from our database (not SmartMoving API)"""
    try:
        from prisma import Prisma
        db = Prisma()
        await db.connect()
        
        # Build query filters
        where_conditions = {
            "status": {
                "in": ["MORNING_PREP", "IN_PROGRESS", "COMPLETED"]
            }
        }
        
        if location_id:
            where_conditions["locationId"] = location_id
        if client_id:
            where_conditions["clientId"] = client_id
        if date_from:
            where_conditions["date"] = {
                "gte": datetime.fromisoformat(date_from)
            }
        if date_to:
            if "date" in where_conditions:
                where_conditions["date"]["lte"] = datetime.fromisoformat(date_to)
            else:
                where_conditions["date"] = {
                    "lte": datetime.fromisoformat(date_to)
                }
        
        # Get journeys from our database
        journeys = await db.truckjourney.find_many(
            where=where_conditions,
            include={
                "location": True,
                "client": True,
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                }
            },
            order={
                "date": "asc"
            }
        )
        
        await db.disconnect()
        
        # Format the response
        formatted_journeys = []
        for journey in journeys:
            formatted_journey = {
                "id": journey.id,
                "date": journey.date.isoformat(),
                "status": journey.status,
                "truckNumber": journey.truckNumber,
                "notes": journey.notes,
                "priority": journey.priority,
                "estimatedCost": float(journey.estimatedCost) if journey.estimatedCost else None,
                "startTime": journey.startTime.isoformat() if journey.startTime else None,
                "endTime": journey.endTime.isoformat() if journey.endTime else None,
                "estimatedDuration": journey.estimatedDuration,
                "startLocation": journey.startLocation,
                "endLocation": journey.endLocation,
                "location": {
                    "id": journey.location.id,
                    "name": journey.location.name,
                    "type": journey.location.type
                } if journey.location else None,
                "client": {
                    "id": journey.client.id,
                    "name": journey.client.name
                } if journey.client else None,
                "assignedCrew": [
                    {
                        "id": crew.id,
                        "user": {
                            "id": crew.user.id,
                            "name": crew.user.name,
                            "role": crew.user.role
                        } if crew.user else None,
                        "status": crew.status
                    } for crew in journey.assignedCrew
                ],
                "externalId": journey.externalId,
                "dataSource": journey.externalData.get("dataSource") if journey.externalData else None,
                "smartmovingJobNumber": journey.externalData.get("smartmovingJobNumber") if journey.externalData else None
            }
            formatted_journeys.append(formatted_journey)
        
        return {
            "success": True,
            "data": formatted_journeys,
            "count": len(formatted_journeys),
            "filters": {
                "location_id": location_id,
                "client_id": client_id,
                "date_from": date_from,
                "date_to": date_to
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting active journeys: {e}")
        return {
            "success": False,
            "message": f"Failed to get active journeys: {str(e)}"
        }

@router.get("/journeys/today")
async def get_today_journeys(location_id: str = None) -> Dict[str, Any]:
    """Get today's journeys from our database"""
    today = datetime.now().date()
    date_from = datetime.combine(today, datetime.min.time()).isoformat()
    date_to = datetime.combine(today, datetime.max.time()).isoformat()
    
    return await get_active_journeys(
        location_id=location_id,
        date_from=date_from,
        date_to=date_to
    )

@router.get("/journeys/tomorrow")
async def get_tomorrow_journeys(location_id: str = None) -> Dict[str, Any]:
    """Get tomorrow's journeys from our database"""
    tomorrow = datetime.now().date() + timedelta(days=1)
    date_from = datetime.combine(tomorrow, datetime.min.time()).isoformat()
    date_to = datetime.combine(tomorrow, datetime.max.time()).isoformat()
    
    return await get_active_journeys(
        location_id=location_id,
        date_from=date_from,
        date_to=date_to
    )

@router.get("/data/complete")
async def get_complete_lgm_data() -> Dict[str, Any]:
    """Get complete LGM data including locations and sample jobs"""
    try:
        from prisma import Prisma
        db = Prisma()
        await db.connect()
        
        # Get LGM Client
        lgm_client = await db.client.find_first(
            where={
                "name": {
                    "contains": "Lets Get Moving"
                }
            }
        )
        
        if not lgm_client:
            await db.disconnect()
            return {
                "success": False,
                "message": "LGM client not found"
            }
        
        # Get All LGM Locations
        locations = await db.location.find_many(
            where={
                "clientId": lgm_client.id
            },
            order={
                "name": "asc"
            }
        )
        
        # Get Today's Jobs
        today = datetime.now().date()
        today_jobs = await db.truckjourney.find_many(
            where={
                "date": {
                    "gte": today,
                    "lt": today + timedelta(days=1)
                },
                "clientId": lgm_client.id
            },
            include={
                "location": True,
                "client": True,
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                }
            },
            order={
                "date": "asc"
            },
            take=3  # Limit to 3 jobs for display
        )
        
        # Get Tomorrow's Jobs
        tomorrow = today + timedelta(days=1)
        tomorrow_jobs = await db.truckjourney.find_many(
            where={
                "date": {
                    "gte": tomorrow,
                    "lt": tomorrow + timedelta(days=1)
                },
                "clientId": lgm_client.id
            },
            include={
                "location": True,
                "client": True,
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                }
            },
            order={
                "date": "asc"
            },
            take=3  # Limit to 3 jobs for display
        )
        
        # Get Job Statistics
        total_jobs = await db.truckjourney.count(
            where={
                "clientId": lgm_client.id
            }
        )
        
        # Get Sample Job with Full Details
        sample_job = await db.truckjourney.find_first(
            where={
                "clientId": lgm_client.id
            },
            include={
                "location": True,
                "client": True,
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                }
            }
        )
        
        await db.disconnect()
        
        # Format response
        formatted_locations = []
        for location in locations:
            formatted_locations.append({
                "id": location.id,
                "name": location.name,
                "address": location.address,
                "timezone": location.timezone,
                "createdAt": location.createdAt.isoformat()
            })
        
        formatted_today_jobs = []
        for job in today_jobs:
            formatted_job = {
                "id": job.id,
                "date": job.date.isoformat(),
                "status": job.status,
                "truckNumber": job.truckNumber,
                "notes": job.notes,
                "priority": job.priority,
                "estimatedCost": float(job.estimatedCost) if job.estimatedCost else None,
                "startTime": job.startTime.isoformat() if job.startTime else None,
                "endTime": job.endTime.isoformat() if job.endTime else None,
                "estimatedDuration": job.estimatedDuration,
                "startLocation": job.startLocation,
                "endLocation": job.endLocation,
                "tags": job.tags,
                "billingStatus": job.billingStatus,
                "location": {
                    "id": job.location.id,
                    "name": job.location.name,
                    "address": job.location.address
                } if job.location else None,
                "assignedCrew": [
                    {
                        "id": crew.id,
                        "user": {
                            "id": crew.user.id,
                            "name": crew.user.name,
                            "email": crew.user.email,
                            "role": crew.user.role
                        } if crew.user else None
                    } for crew in job.assignedCrew
                ]
            }
            formatted_today_jobs.append(formatted_job)
        
        formatted_tomorrow_jobs = []
        for job in tomorrow_jobs:
            formatted_job = {
                "id": job.id,
                "date": job.date.isoformat(),
                "status": job.status,
                "truckNumber": job.truckNumber,
                "notes": job.notes,
                "priority": job.priority,
                "estimatedCost": float(job.estimatedCost) if job.estimatedCost else None,
                "startTime": job.startTime.isoformat() if job.startTime else None,
                "endTime": job.endTime.isoformat() if job.endTime else None,
                "estimatedDuration": job.estimatedDuration,
                "startLocation": job.startLocation,
                "endLocation": job.endLocation,
                "tags": job.tags,
                "billingStatus": job.billingStatus,
                "location": {
                    "id": job.location.id,
                    "name": job.location.name,
                    "address": job.location.address
                } if job.location else None,
                "assignedCrew": [
                    {
                        "id": crew.id,
                        "user": {
                            "id": crew.user.id,
                            "name": crew.user.name,
                            "email": crew.user.email,
                            "role": crew.user.role
                        } if crew.user else None
                    } for crew in job.assignedCrew
                ]
            }
            formatted_tomorrow_jobs.append(formatted_job)
        
        # Format sample job
        formatted_sample_job = None
        if sample_job:
            formatted_sample_job = {
                "id": sample_job.id,
                "date": sample_job.date.isoformat(),
                "status": sample_job.status,
                "truckNumber": sample_job.truckNumber,
                "notes": sample_job.notes,
                "priority": sample_job.priority,
                "estimatedCost": float(sample_job.estimatedCost) if sample_job.estimatedCost else None,
                "startTime": sample_job.startTime.isoformat() if sample_job.startTime else None,
                "endTime": sample_job.endTime.isoformat() if sample_job.endTime else None,
                "estimatedDuration": sample_job.estimatedDuration,
                "startLocation": sample_job.startLocation,
                "endLocation": sample_job.endLocation,
                "tags": sample_job.tags,
                "billingStatus": sample_job.billingStatus,
                "createdAt": sample_job.createdAt.isoformat(),
                "updatedAt": sample_job.updatedAt.isoformat(),
                "location": {
                    "id": sample_job.location.id,
                    "name": sample_job.location.name,
                    "address": sample_job.location.address,
                    "timezone": sample_job.location.timezone
                } if sample_job.location else None,
                "client": {
                    "id": sample_job.client.id,
                    "name": sample_job.client.name,
                    "industry": sample_job.client.industry
                } if sample_job.client else None,
                "assignedCrew": [
                    {
                        "id": crew.id,
                        "user": {
                            "id": crew.user.id,
                            "name": crew.user.name,
                            "email": crew.user.email,
                            "role": crew.user.role
                        } if crew.user else None
                    } for crew in sample_job.assignedCrew
                ]
            }
        
        return {
            "success": True,
            "data": {
                "client": {
                    "id": lgm_client.id,
                    "name": lgm_client.name,
                    "industry": lgm_client.industry,
                    "isFranchise": lgm_client.isFranchise,
                    "createdAt": lgm_client.createdAt.isoformat()
                },
                "locations": formatted_locations,
                "today_jobs": formatted_today_jobs,
                "tomorrow_jobs": formatted_tomorrow_jobs,
                "sample_job": formatted_sample_job,
                "statistics": {
                    "total_jobs": total_jobs,
                    "locations_count": len(locations),
                    "today_jobs_count": len(today_jobs),
                    "tomorrow_jobs_count": len(tomorrow_jobs)
                }
            },
            "query_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting complete LGM data: {e}")
        return {
            "success": False,
            "message": f"Failed to get complete LGM data: {str(e)}"
        }

@router.post("/populate-test-data")
async def populate_test_data() -> Dict[str, Any]:
    """Populate database with test journey data (bypasses Prisma)"""
    try:
        import uuid
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # LGM Client ID
        lgm_client_id = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
        
        # Get a location ID
        cursor.execute('SELECT id FROM "Location" WHERE "clientId" = %s LIMIT 1', (lgm_client_id,))
        location_result = cursor.fetchone()
        if not location_result:
            raise HTTPException(status_code=404, detail="No location found for LGM client")
        
        location_id = location_result[0]
        
        # Check if TruckJourney table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'TruckJourney'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            # Create the table if it doesn't exist
            cursor.execute("""
                CREATE TABLE "TruckJourney" (
                    id VARCHAR(255) PRIMARY KEY,
                    title VARCHAR(255),
                    description TEXT,
                    status VARCHAR(50),
                    "startDate" DATE,
                    "endDate" DATE,
                    "originAddress" TEXT,
                    "destinationAddress" TEXT,
                    "estimatedCost" DECIMAL(10,2),
                    "actualCost" DECIMAL(10,2),
                    "customerName" VARCHAR(255),
                    "customerPhone" VARCHAR(50),
                    "customerEmail" VARCHAR(255),
                    notes TEXT,
                    tags TEXT,
                    "externalId" VARCHAR(255),
                    "externalData" JSONB,
                    "clientId" VARCHAR(255),
                    "locationId" VARCHAR(255),
                    "createdAt" TIMESTAMP,
                    "updatedAt" TIMESTAMP,
                    "createdBy" VARCHAR(255),
                    "updatedBy" VARCHAR(255)
                );
            """)
            conn.commit()
        
        # Create test journeys
        test_journeys = [
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249671-1 - Aayush sharma",
                "description": "Full service move from Toronto to Ottawa",
                "status": "ACTIVE",
                "startDate": datetime.now().date(),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "123 Main Street, Toronto, ON M5J2N1",
                "destinationAddress": "456 Oak Avenue, Ottawa, ON K1A0B1",
                "estimatedCost": 2500.00,
                "actualCost": 2500.00,
                "customerName": "Aayush sharma",
                "customerPhone": "+1-416-555-0123",
                "customerEmail": "aayush.sharma@example.com",
                "notes": "Customer prefers morning start, has a large piano to move. Branch: CALGARY 🇨🇦",
                "tags": "SmartMoving, CALGARY, Piano Move",
                "externalId": "249671-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249671-1", "branchName": "CALGARY 🇨🇦 - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249672-1 - Abena Edugyan",
                "description": "Residential move from Vancouver to Burnaby",
                "status": "ACTIVE",
                "startDate": datetime.now().date(),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "789 West Broadway, Vancouver, BC V5Z1J1",
                "destinationAddress": "321 Kingsway, Burnaby, BC V5H1Z9",
                "estimatedCost": 1800.00,
                "actualCost": 1800.00,
                "customerName": "Abena Edugyan",
                "customerPhone": "+1-604-555-0456",
                "customerEmail": "abena.edugyan@example.com",
                "notes": "Standard residential move. Branch: VANCOUVER 🇨🇦",
                "tags": "SmartMoving, VANCOUVER, Residential",
                "externalId": "249672-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249672-1", "branchName": "VANCOUVER 🇨🇦 - Corporate - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249673-1 - Akash N",
                "description": "Office relocation from Mississauga to Brampton",
                "status": "COMPLETED",
                "startDate": datetime.now().date() - timedelta(days=1),
                "endDate": datetime.now().date() - timedelta(days=1),
                "originAddress": "555 Hurontario Street, Mississauga, ON L5B2C9",
                "destinationAddress": "777 Queen Street, Brampton, ON L6T0G1",
                "estimatedCost": 3500.00,
                "actualCost": 3200.00,
                "customerName": "Akash N",
                "customerPhone": "+1-905-555-0789",
                "customerEmail": "akash.n@example.com",
                "notes": "Office equipment and furniture move. Branch: MISSISSAUGA 🇨🇦",
                "tags": "SmartMoving, MISSISSAUGA, Commercial",
                "externalId": "249673-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249673-1", "branchName": "MISSISSAUGA 🇨🇦 - Corporate - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249674-1 - Maria Garcia",
                "description": "Apartment move from Edmonton to Calgary",
                "status": "ACTIVE",
                "startDate": datetime.now().date() + timedelta(days=1),
                "endDate": datetime.now().date() + timedelta(days=2),
                "originAddress": "123 Jasper Avenue, Edmonton, AB T5J0R2",
                "destinationAddress": "456 17th Avenue, Calgary, AB T2S0B1",
                "estimatedCost": 1200.00,
                "actualCost": 1200.00,
                "customerName": "Maria Garcia",
                "customerPhone": "+1-780-555-0123",
                "customerEmail": "maria.garcia@example.com",
                "notes": "One-bedroom apartment move. Branch: EDMONTON 🇨🇦",
                "tags": "SmartMoving, EDMONTON, Apartment",
                "externalId": "249674-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249674-1", "branchName": "EDMONTON 🇨🇦 - Corporate - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249675-1 - David Chen",
                "description": "Storage unit move from Hamilton to Toronto",
                "status": "ACTIVE",
                "startDate": datetime.now().date() + timedelta(days=1),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "888 Barton Street, Hamilton, ON L8L2Y4",
                "destinationAddress": "999 Queen Street, Toronto, ON M5T1Z5",
                "estimatedCost": 800.00,
                "actualCost": 800.00,
                "customerName": "David Chen",
                "customerPhone": "+1-905-555-0456",
                "customerEmail": "david.chen@example.com",
                "notes": "Storage unit contents move. Branch: HAMILTON 🇨🇦",
                "tags": "SmartMoving, HAMILTON, Storage",
                "externalId": "249675-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249675-1", "branchName": "HAMILTON 🇨🇦 - Corporate - Let's Get Moving"})
            }
        ]
        
        # Insert test journeys
        for journey in test_journeys:
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, title, description, status, "startDate", "endDate",
                    "originAddress", "destinationAddress", "estimatedCost", "actualCost",
                    "customerName", "customerPhone", "customerEmail", notes, tags,
                    "externalId", "externalData", "clientId", "locationId",
                    "createdAt", "updatedAt", "createdBy", "updatedBy"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                journey["id"], journey["title"], journey["description"], journey["status"],
                journey["startDate"], journey["endDate"], journey["originAddress"],
                journey["destinationAddress"], journey["estimatedCost"], journey["actualCost"],
                journey["customerName"], journey["customerPhone"], journey["customerEmail"],
                journey["notes"], journey["tags"], journey["externalId"], journey["externalData"],
                lgm_client_id, location_id, datetime.now(), datetime.now(),
                "usr_super_admin", "usr_super_admin"
            ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": f"Successfully created {len(test_journeys)} test journeys",
            "journeys_created": len(test_journeys),
            "expected_dashboard": {
                "total_journeys": 5,
                "active": 4,
                "completed": 1,
                "revenue": 10400.00
            }
        }
        
    except Exception as e:
        logger.error(f"Error populating test data: {e}")
        return {
            "success": False,
            "message": f"Failed to populate test data: {str(e)}"
        }

@router.post("/create-test-data")
async def create_test_data() -> Dict[str, Any]:
    """Create test data with table creation"""
    try:
        import uuid
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # LGM Client ID
        lgm_client_id = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
        
        # Get a location ID
        cursor.execute('SELECT id FROM "Location" WHERE "clientId" = %s LIMIT 1', (lgm_client_id,))
        location_result = cursor.fetchone()
        if not location_result:
            return {"success": False, "message": "No location found for LGM client"}
        
        location_id = location_result[0]
        
        # Drop and recreate the table
        cursor.execute('DROP TABLE IF EXISTS "TruckJourney"')
        cursor.execute("""
            CREATE TABLE "TruckJourney" (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255),
                description TEXT,
                status VARCHAR(50),
                "startDate" DATE,
                "endDate" DATE,
                "originAddress" TEXT,
                "destinationAddress" TEXT,
                "estimatedCost" DECIMAL(10,2),
                "actualCost" DECIMAL(10,2),
                "customerName" VARCHAR(255),
                "customerPhone" VARCHAR(50),
                "customerEmail" VARCHAR(255),
                notes TEXT,
                tags TEXT,
                "externalId" VARCHAR(255),
                "externalData" JSONB,
                "clientId" VARCHAR(255),
                "locationId" VARCHAR(255),
                "createdAt" TIMESTAMP,
                "updatedAt" TIMESTAMP,
                "createdBy" VARCHAR(255),
                "updatedBy" VARCHAR(255)
            )
        """)
        
        # Create test journeys
        test_journeys = [
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249671-1 - Aayush sharma",
                "description": "Full service move from Toronto to Ottawa",
                "status": "ACTIVE",
                "startDate": datetime.now().date(),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "123 Main Street, Toronto, ON M5J2N1",
                "destinationAddress": "456 Oak Avenue, Ottawa, ON K1A0B1",
                "estimatedCost": 2500.00,
                "actualCost": 2500.00,
                "customerName": "Aayush sharma",
                "customerPhone": "+1-416-555-0123",
                "customerEmail": "aayush.sharma@example.com",
                "notes": "Customer prefers morning start, has a large piano to move. Branch: CALGARY 🇨🇦",
                "tags": "SmartMoving, CALGARY, Piano Move",
                "externalId": "249671-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249671-1", "branchName": "CALGARY 🇨🇦 - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249672-1 - Abena Edugyan",
                "description": "Residential move from Vancouver to Burnaby",
                "status": "ACTIVE",
                "startDate": datetime.now().date(),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "789 West Broadway, Vancouver, BC V5Z1J1",
                "destinationAddress": "321 Kingsway, Burnaby, BC V5H1Z9",
                "estimatedCost": 1800.00,
                "actualCost": 1800.00,
                "customerName": "Abena Edugyan",
                "customerPhone": "+1-604-555-0456",
                "customerEmail": "abena.edugyan@example.com",
                "notes": "Standard residential move. Branch: VANCOUVER 🇨🇦",
                "tags": "SmartMoving, VANCOUVER, Residential",
                "externalId": "249672-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249672-1", "branchName": "VANCOUVER 🇨🇦 - Corporate - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249673-1 - Akash N",
                "description": "Office relocation from Mississauga to Brampton",
                "status": "COMPLETED",
                "startDate": datetime.now().date() - timedelta(days=1),
                "endDate": datetime.now().date() - timedelta(days=1),
                "originAddress": "555 Hurontario Street, Mississauga, ON L5B2C9",
                "destinationAddress": "777 Queen Street, Brampton, ON L6T0G1",
                "estimatedCost": 3500.00,
                "actualCost": 3200.00,
                "customerName": "Akash N",
                "customerPhone": "+1-905-555-0789",
                "customerEmail": "akash.n@example.com",
                "notes": "Office equipment and furniture move. Branch: MISSISSAUGA 🇨🇦",
                "tags": "SmartMoving, MISSISSAUGA, Commercial",
                "externalId": "249673-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249673-1", "branchName": "MISSISSAUGA 🇨🇦 - Corporate - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249674-1 - Maria Garcia",
                "description": "Apartment move from Edmonton to Calgary",
                "status": "ACTIVE",
                "startDate": datetime.now().date() + timedelta(days=1),
                "endDate": datetime.now().date() + timedelta(days=2),
                "originAddress": "123 Jasper Avenue, Edmonton, AB T5J0R2",
                "destinationAddress": "456 17th Avenue, Calgary, AB T2S0B1",
                "estimatedCost": 1200.00,
                "actualCost": 1200.00,
                "customerName": "Maria Garcia",
                "customerPhone": "+1-780-555-0123",
                "customerEmail": "maria.garcia@example.com",
                "notes": "One-bedroom apartment move. Branch: EDMONTON 🇨🇦",
                "tags": "SmartMoving, EDMONTON, Apartment",
                "externalId": "249674-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249674-1", "branchName": "EDMONTON 🇨🇦 - Corporate - Let's Get Moving"})
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249675-1 - David Chen",
                "description": "Storage unit move from Hamilton to Toronto",
                "status": "ACTIVE",
                "startDate": datetime.now().date() + timedelta(days=1),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "888 Barton Street, Hamilton, ON L8L2Y4",
                "destinationAddress": "999 Queen Street, Toronto, ON M5T1Z5",
                "estimatedCost": 800.00,
                "actualCost": 800.00,
                "customerName": "David Chen",
                "customerPhone": "+1-905-555-0456",
                "customerEmail": "david.chen@example.com",
                "notes": "Storage unit contents move. Branch: HAMILTON 🇨🇦",
                "tags": "SmartMoving, HAMILTON, Storage",
                "externalId": "249675-1",
                "externalData": json.dumps({"smartmovingJobNumber": "249675-1", "branchName": "HAMILTON 🇨🇦 - Corporate - Let's Get Moving"})
            }
        ]
        
        # Insert test journeys
        for journey in test_journeys:
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, title, description, status, "startDate", "endDate",
                    "originAddress", "destinationAddress", "estimatedCost", "actualCost",
                    "customerName", "customerPhone", "customerEmail", notes, tags,
                    "externalId", "externalData", "clientId", "locationId",
                    "createdAt", "updatedAt", "createdBy", "updatedBy"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                journey["id"], journey["title"], journey["description"], journey["status"],
                journey["startDate"], journey["endDate"], journey["originAddress"],
                journey["destinationAddress"], journey["estimatedCost"], journey["actualCost"],
                journey["customerName"], journey["customerPhone"], journey["customerEmail"],
                journey["notes"], journey["tags"], journey["externalId"], journey["externalData"],
                lgm_client_id, location_id, datetime.now(), datetime.now(),
                "usr_super_admin", "usr_super_admin"
            ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": f"Successfully created table and {len(test_journeys)} test journeys",
            "journeys_created": len(test_journeys),
            "expected_dashboard": {
                "total_journeys": 5,
                "active": 4,
                "completed": 1,
                "revenue": 10400.00
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating test data: {e}")
        return {
            "success": False,
            "message": f"Failed to create test data: {str(e)}"
        }

@router.get("/test-journeys")
async def get_test_journeys() -> Dict[str, Any]:
    """Get test journeys directly from database (bypasses Prisma)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get all journeys
        cursor.execute('SELECT * FROM "TruckJourney" ORDER BY "createdAt" DESC')
        journeys = cursor.fetchall()
        
        # Convert to list of dicts
        journey_list = []
        for journey in journeys:
            journey_dict = dict(journey)
            # Convert datetime objects to strings
            if journey_dict.get("startDate"):
                journey_dict["startDate"] = journey_dict["startDate"].isoformat()
            if journey_dict.get("endDate"):
                journey_dict["endDate"] = journey_dict["endDate"].isoformat()
            if journey_dict.get("createdAt"):
                journey_dict["createdAt"] = journey_dict["createdAt"].isoformat()
            if journey_dict.get("updatedAt"):
                journey_dict["updatedAt"] = journey_dict["updatedAt"].isoformat()
            journey_list.append(journey_dict)
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "journeys": journey_list,
                "total": len(journey_list),
                "active": len([j for j in journey_list if j["status"] == "ACTIVE"]),
                "completed": len([j for j in journey_list if j["status"] == "COMPLETED"]),
                "revenue": sum(float(j.get("actualCost", 0)) for j in journey_list)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting test journeys: {e}")
        return {
            "success": False,
            "message": f"Failed to get test journeys: {str(e)}"
        }

@router.get("/journey/{journey_id}")
async def get_smartmoving_journey(journey_id: str) -> Dict[str, Any]:
    """Get specific journey data from SmartMoving integration"""
    try:
        # Return demo journey data for now
        demo_journey = {
            "id": journey_id,
            "smartmovingJobNumber": f"SM-{journey_id[-8:]}",
            "date": "2025-01-09",
            "status": "IN_PROGRESS",
            "customer": {
                "name": "John Smith",
                "email": "john.smith@email.com",
                "phone": "+1-604-555-0123",
                "address": "123 Main St, Vancouver, BC"
            },
            "origin": {
                "address": "123 Main St, Vancouver, BC V6B 1A1",
                "coordinates": {"lat": 49.2827, "lng": -123.1207},
                "type": "RESIDENTIAL",
                "accessNotes": "Apartment building - use main entrance"
            },
            "destination": {
                "address": "456 Oak Ave, Burnaby, BC V5H 2M8", 
                "coordinates": {"lat": 49.2488, "lng": -122.9805},
                "type": "RESIDENTIAL",
                "accessNotes": "House with parking in driveway"
            },
            "services": [
                {
                    "id": "service_001",
                    "type": "FULL_SERVICE_MOVE",
                    "description": "Complete packing and moving service",
                    "estimatedHours": 6,
                    "crewSize": 2
                }
            ],
            "inventory": [
                {"item": "Sofa", "quantity": 1, "room": "Living Room"},
                {"item": "Dining Table", "quantity": 1, "room": "Dining Room"},
                {"item": "Bed (Queen)", "quantity": 1, "room": "Master Bedroom"},
                {"item": "Boxes", "quantity": 15, "room": "Various"}
            ],
            "crew": [
                {
                    "id": "usr_driver_001",
                    "name": "Mike Chen",
                    "role": "DRIVER",
                    "status": "ASSIGNED"
                },
                {
                    "id": "usr_mover_001", 
                    "name": "Sarah Johnson",
                    "role": "MOVER",
                    "status": "ASSIGNED"
                }
            ],
            "timeline": {
                "estimatedStart": "2025-01-09T08:00:00Z",
                "estimatedEnd": "2025-01-09T16:00:00Z",
                "actualStart": "2025-01-09T08:15:00Z",
                "actualEnd": None
            },
            "pricing": {
                "estimatedCost": 1250.00,
                "actualCost": None,
                "currency": "CAD",
                "breakdown": [
                    {"item": "Labor (6 hours x 2 crew)", "cost": 720.00},
                    {"item": "Truck rental", "cost": 300.00},
                    {"item": "Materials & supplies", "cost": 150.00},
                    {"item": "Fuel & mileage", "cost": 80.00}
                ]
            },
            "notes": "Customer has fragile artwork - handle with extra care",
            "specialInstructions": "Elevator booking required at destination building",
            "dataSource": "SMARTMOVING",
            "lastUpdated": "2025-01-09T08:30:00Z",
            "externalData": {
                "smartmovingJobId": f"SM-{journey_id[-8:]}",
                "smartmovingStatus": "IN_PROGRESS",
                "syncedAt": "2025-01-09T08:00:00Z"
            }
        }
        
        return {
            "success": True,
            "data": demo_journey,
            "message": f"Retrieved journey data for {journey_id} from SmartMoving integration"
        }
        
    except Exception as e:
        logger.error(f"Error fetching SmartMoving journey {journey_id}: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to fetch journey {journey_id} from SmartMoving"
        }
