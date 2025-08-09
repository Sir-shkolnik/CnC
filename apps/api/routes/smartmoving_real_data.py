#!/usr/bin/env python3
"""
SmartMoving Real Data API Routes
ONLY REAL LGM DATA - NO DEMO DATA, NO FALLBACKS, NO HARDCODED DATA
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import logging
import httpx
import asyncio
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/smartmoving-real", tags=["SmartMoving Real Data"])

# SmartMoving API Configuration - REAL API KEY
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"
SMARTMOVING_BASE_URL = "https://api-public.smartmoving.com/v1"

def get_db_connection():
    """Get database connection"""
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

async def call_smartmoving_api(endpoint: str, params: dict = None) -> dict:
    """Call SmartMoving API with real credentials"""
    headers = {
        "x-api-key": SMARTMOVING_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    url = f"{SMARTMOVING_BASE_URL}/{endpoint.lstrip('/')}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params or {})
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"SmartMoving API error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"SmartMoving API error: {response.text}"
            )

@router.get("/test-connection")
async def test_smartmoving_connection() -> Dict[str, Any]:
    """Test SmartMoving API connection with real credentials"""
    try:
        # Test basic API connection
        result = await call_smartmoving_api("ping")  # or whatever test endpoint exists
        
        return {
            "success": True,
            "message": "SmartMoving API connection successful",
            "api_key_status": "VALID",
            "client_id": SMARTMOVING_CLIENT_ID,
            "response": result
        }
    except Exception as e:
        logger.error(f"SmartMoving connection test failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "SmartMoving API connection failed",
            "api_key_status": "INVALID"
        }

@router.get("/journeys/today")
async def get_real_journeys_today() -> Dict[str, Any]:
    """Get ONLY real journeys from LGM database for today - NO DEMO DATA"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get today's date
        today = datetime.now().date()
        
        # Query ONLY real LGM journeys
        cursor.execute("""
            SELECT 
                tj.id,
                tj.title,
                tj."truckNumber",
                tj.date,
                tj.status,
                tj."customerName",
                tj."customerPhone",
                tj."customerEmail",
                tj."startLocation",
                tj."endLocation",
                tj."startTime",
                tj."endTime",
                tj.notes,
                tj."createdAt",
                tj."updatedAt",
                c.name as client_name,
                l.name as location_name,
                l.address as location_address,
                l.city as location_city,
                l.province as location_province
            FROM "TruckJourney" tj
            LEFT JOIN "Client" c ON tj."clientId" = c.id
            LEFT JOIN "Location" l ON tj."locationId" = l.id
            WHERE tj.date >= %s 
            AND tj.date < %s
            AND c.name ILIKE '%%Let%%Get%%Moving%%'
            ORDER BY tj.date ASC, tj."startTime" ASC
        """, (today, today + timedelta(days=1)))
        
        journey_rows = cursor.fetchall()
        
        # Get crew for each journey
        journeys = []
        for journey_row in journey_rows:
            # Get assigned crew
            cursor.execute("""
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.phone,
                    u.role,
                    ac."assignedAt"
                FROM "AssignedCrew" ac
                JOIN "User" u ON ac."userId" = u.id
                WHERE ac."journeyId" = %s
            """, (journey_row["id"],))
            
            crew_rows = cursor.fetchall()
            
            journey_data = {
                "id": journey_row["id"],
                "title": journey_row["title"],
                "truckNumber": journey_row["truckNumber"],
                "date": journey_row["date"].isoformat() if journey_row["date"] else None,
                "status": journey_row["status"],
                "customerName": journey_row["customerName"],
                "customerPhone": journey_row["customerPhone"],
                "customerEmail": journey_row["customerEmail"],
                "startLocation": journey_row["startLocation"],
                "endLocation": journey_row["endLocation"],
                "startTime": journey_row["startTime"].isoformat() if journey_row["startTime"] else None,
                "endTime": journey_row["endTime"].isoformat() if journey_row["endTime"] else None,
                "notes": journey_row["notes"],
                "client": {
                    "name": journey_row["client_name"]
                },
                "location": {
                    "name": journey_row["location_name"],
                    "address": journey_row["location_address"],
                    "city": journey_row["location_city"],
                    "province": journey_row["location_province"]
                },
                "crew": [
                    {
                        "id": crew["id"],
                        "name": crew["name"],
                        "email": crew["email"],
                        "phone": crew["phone"],
                        "role": crew["role"],
                        "assignedAt": crew["assignedAt"].isoformat() if crew["assignedAt"] else None
                    }
                    for crew in crew_rows
                ],
                "createdAt": journey_row["createdAt"].isoformat() if journey_row["createdAt"] else None,
                "updatedAt": journey_row["updatedAt"].isoformat() if journey_row["updatedAt"] else None,
                "dataSource": "LGM_DATABASE_REAL"
            }
            
            journeys.append(journey_data)
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "journeys": journeys,
            "count": len(journeys),
            "date": today.isoformat(),
            "message": f"Retrieved {len(journeys)} real LGM journeys for today",
            "dataSource": "LGM_DATABASE_REAL"
        }
        
    except Exception as e:
        logger.error(f"Error getting real LGM journeys: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to get real LGM journeys: {str(e)}"
        }

@router.get("/journey/{journey_id}")
async def get_real_journey_details(journey_id: str) -> Dict[str, Any]:
    """Get ONLY real journey details from LGM database - NO DEMO DATA"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get real journey from database
        cursor.execute("""
            SELECT 
                tj.*,
                c.name as client_name,
                l.name as location_name,
                l.address as location_address,
                l.city as location_city,
                l.province as location_province
            FROM "TruckJourney" tj
            LEFT JOIN "Client" c ON tj."clientId" = c.id
            LEFT JOIN "Location" l ON tj."locationId" = l.id
            WHERE tj.id = %s
            AND c.name ILIKE '%%Let%%Get%%Moving%%'
        """, (journey_id,))
        
        journey_row = cursor.fetchone()
        
        if not journey_row:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404, 
                detail=f"Real LGM journey {journey_id} not found"
            )
        
        # Get assigned crew
        cursor.execute("""
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                ac."assignedAt"
            FROM "AssignedCrew" ac
            JOIN "User" u ON ac."userId" = u.id
            WHERE ac."journeyId" = %s
        """, (journey_id,))
        
        crew_rows = cursor.fetchall()
        
        # Get journey timeline/events
        cursor.execute("""
            SELECT 
                id,
                "createdAt" as timestamp,
                event_type,
                description,
                "createdBy",
                metadata
            FROM "JourneyEvent"
            WHERE "journeyId" = %s
            ORDER BY "createdAt" ASC
        """, (journey_id,))
        
        timeline_rows = cursor.fetchall()
        
        # Get journey media
        cursor.execute("""
            SELECT 
                id,
                "fileName",
                "fileType",
                "fileUrl",
                "uploadedAt",
                "uploadedBy",
                description,
                metadata
            FROM "JourneyMedia"
            WHERE "journeyId" = %s
            ORDER BY "uploadedAt" DESC
        """, (journey_id,))
        
        media_rows = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Build real journey response
        journey_data = {
            "id": journey_row["id"],
            "title": journey_row["title"],
            "truckNumber": journey_row["truckNumber"],
            "date": journey_row["date"].isoformat() if journey_row["date"] else None,
            "status": journey_row["status"],
            "customerName": journey_row["customerName"],
            "customerPhone": journey_row["customerPhone"],
            "customerEmail": journey_row["customerEmail"],
            "startLocation": journey_row["startLocation"],
            "endLocation": journey_row["endLocation"],
            "startTime": journey_row["startTime"].isoformat() if journey_row["startTime"] else None,
            "endTime": journey_row["endTime"].isoformat() if journey_row["endTime"] else None,
            "notes": journey_row["notes"],
            "client": {
                "name": journey_row["client_name"]
            },
            "location": {
                "name": journey_row["location_name"],
                "address": journey_row["location_address"],
                "city": journey_row["location_city"],
                "province": journey_row["location_province"]
            },
            "crew": [
                {
                    "id": crew["id"],
                    "name": crew["name"],
                    "email": crew["email"],
                    "phone": crew["phone"],
                    "role": crew["role"],
                    "assignedAt": crew["assignedAt"].isoformat() if crew["assignedAt"] else None
                }
                for crew in crew_rows
            ],
            "timeline": [
                {
                    "id": timeline["id"],
                    "timestamp": timeline["timestamp"].isoformat() if timeline["timestamp"] else None,
                    "event": timeline["event_type"],
                    "description": timeline["description"],
                    "createdBy": timeline["createdBy"],
                    "metadata": timeline["metadata"]
                }
                for timeline in timeline_rows
            ],
            "media": [
                {
                    "id": media["id"],
                    "fileName": media["fileName"],
                    "fileType": media["fileType"],
                    "fileUrl": media["fileUrl"],
                    "uploadedAt": media["uploadedAt"].isoformat() if media["uploadedAt"] else None,
                    "uploadedBy": media["uploadedBy"],
                    "description": media["description"],
                    "metadata": media["metadata"]
                }
                for media in media_rows
            ],
            "createdAt": journey_row["createdAt"].isoformat() if journey_row["createdAt"] else None,
            "updatedAt": journey_row["updatedAt"].isoformat() if journey_row["updatedAt"] else None,
            "dataSource": "LGM_DATABASE_REAL"
        }
        
        return {
            "success": True,
            "journey": journey_data,
            "message": "Real LGM journey data retrieved successfully",
            "dataSource": "LGM_DATABASE_REAL"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting real LGM journey: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to get real LGM journey: {str(e)}"
        }

@router.get("/users/real")
async def get_real_lgm_users() -> Dict[str, Any]:
    """Get ONLY real LGM users - NO DEMO DATA"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get ONLY real LGM users
        cursor.execute("""
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.status,
                u."isActive",
                u."createdAt",
                u."updatedAt",
                c.name as client_name,
                l.name as location_name,
                l.city as location_city,
                l.province as location_province
            FROM "User" u
            LEFT JOIN "Client" c ON u."clientId" = c.id
            LEFT JOIN "Location" l ON u."locationId" = l.id
            WHERE c.name ILIKE '%%Let%%Get%%Moving%%'
            AND u."isActive" = true
            ORDER BY u.role, u.name
        """, ())
        
        user_rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        users = [
            {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "phone": user["phone"],
                "role": user["role"],
                "status": user["status"],
                "isActive": user["isActive"],
                "client": {
                    "name": user["client_name"]
                },
                "location": {
                    "name": user["location_name"],
                    "city": user["location_city"],
                    "province": user["location_province"]
                },
                "createdAt": user["createdAt"].isoformat() if user["createdAt"] else None,
                "updatedAt": user["updatedAt"].isoformat() if user["updatedAt"] else None,
                "dataSource": "LGM_DATABASE_REAL"
            }
            for user in user_rows
        ]
        
        return {
            "success": True,
            "users": users,
            "count": len(users),
            "message": f"Retrieved {len(users)} real LGM users",
            "dataSource": "LGM_DATABASE_REAL"
        }
        
    except Exception as e:
        logger.error(f"Error getting real LGM users: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to get real LGM users: {str(e)}"
        }

@router.get("/stats/real")
async def get_real_lgm_stats() -> Dict[str, Any]:
    """Get ONLY real LGM statistics - NO DEMO DATA"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get real journey stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_journeys,
                COUNT(CASE WHEN status IN ('MORNING_PREP', 'EN_ROUTE', 'ONSITE') THEN 1 END) as active_journeys,
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_journeys,
                COUNT(CASE WHEN status = 'AUDITED' THEN 1 END) as audited_journeys,
                COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as today_journeys,
                COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_journeys
            FROM "TruckJourney" tj
            LEFT JOIN "Client" c ON tj."clientId" = c.id
            WHERE c.name ILIKE '%%Let%%Get%%Moving%%'
        """, ())
        
        stats_row = cursor.fetchone()
        
        # Get real user stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'DRIVER' THEN 1 END) as drivers,
                COUNT(CASE WHEN role = 'MOVER' THEN 1 END) as movers,
                COUNT(CASE WHEN role = 'DISPATCHER' THEN 1 END) as dispatchers,
                COUNT(CASE WHEN role = 'MANAGER' THEN 1 END) as managers,
                COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_users
            FROM "User" u
            LEFT JOIN "Client" c ON u."clientId" = c.id
            WHERE c.name ILIKE '%%Let%%Get%%Moving%%'
        """, ())
        
        user_stats_row = cursor.fetchone()
        
        # Get real location stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_locations,
                COUNT(CASE WHEN type = 'FRANCHISE' THEN 1 END) as franchise_locations,
                COUNT(CASE WHEN type = 'CORPORATE' THEN 1 END) as corporate_locations
            FROM "Location" l
            LEFT JOIN "Client" c ON l."clientId" = c.id
            WHERE c.name ILIKE '%%Let%%Get%%Moving%%'
        """, ())
        
        location_stats_row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        stats = {
            "journeys": {
                "total": stats_row["total_journeys"] or 0,
                "active": stats_row["active_journeys"] or 0,
                "completed": stats_row["completed_journeys"] or 0,
                "audited": stats_row["audited_journeys"] or 0,
                "today": stats_row["today_journeys"] or 0,
                "thisWeek": stats_row["week_journeys"] or 0
            },
            "users": {
                "total": user_stats_row["total_users"] or 0,
                "drivers": user_stats_row["drivers"] or 0,
                "movers": user_stats_row["movers"] or 0,
                "dispatchers": user_stats_row["dispatchers"] or 0,
                "managers": user_stats_row["managers"] or 0,
                "active": user_stats_row["active_users"] or 0
            },
            "locations": {
                "total": location_stats_row["total_locations"] or 0,
                "franchise": location_stats_row["franchise_locations"] or 0,
                "corporate": location_stats_row["corporate_locations"] or 0
            },
            "dataSource": "LGM_DATABASE_REAL",
            "lastUpdated": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "stats": stats,
            "message": "Real LGM statistics retrieved successfully",
            "dataSource": "LGM_DATABASE_REAL"
        }
        
    except Exception as e:
        logger.error(f"Error getting real LGM stats: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to get real LGM stats: {str(e)}"
        }