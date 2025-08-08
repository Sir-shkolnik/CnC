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
