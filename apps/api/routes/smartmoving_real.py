#!/usr/bin/env python3
"""
SmartMoving Real Data Routes
Handles ONLY real SmartMoving data - NO hardcoded data, NO fallbacks
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import json
import logging
from datetime import datetime, timedelta

# Import Real SmartMoving service
from ..services.real_smartmoving_service import RealSmartMovingService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/smartmoving-real", tags=["SmartMoving Real Data"])

@router.get("/test-connection")
async def test_real_connection() -> Dict[str, Any]:
    """Test connection to SmartMoving API with real current data"""
    try:
        service = RealSmartMovingService()
        result = await service.test_connection()
        return result
    except Exception as e:
        logger.error(f"Real SmartMoving test failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to test SmartMoving connection"
        }

@router.get("/todays-jobs")
async def get_real_todays_jobs() -> Dict[str, Any]:
    """Get ALL real jobs for today from SmartMoving API"""
    try:
        service = RealSmartMovingService()
        jobs = await service.get_todays_jobs()
        
        return {
            "success": True,
            "message": f"Found {len(jobs)} real jobs for today",
            "total_jobs": len(jobs),
            "jobs": jobs,
            "data_source": "SmartMoving API",
            "real_data": True,
            "fetch_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get real today's jobs: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to fetch real jobs from SmartMoving"
        }

@router.get("/journey/{journey_id}")
async def get_real_journey(journey_id: str) -> Dict[str, Any]:
    """Get specific journey data - ONLY REAL DATA, NO FALLBACKS"""
    try:
        service = RealSmartMovingService()
        journey_data = await service.get_real_journey_data(journey_id)
        
        return {
            "success": True,
            "journey": journey_data,
            "data_source": "SmartMoving API",
            "real_data": True,
            "fetch_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get real journey data for {journey_id}: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"No real data available for journey {journey_id}"
        }

@router.get("/journey/{journey_id}/crew")
async def get_real_journey_crew(journey_id: str) -> Dict[str, Any]:
    """Get real crew data for journey - NO HARDCODED DATA"""
    try:
        service = RealSmartMovingService()
        crew_data = await service.get_real_crew_data(journey_id)
        
        return {
            "success": True,
            "crew": crew_data,
            "data_source": "SmartMoving API",
            "real_data": True,
            "fetch_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get real crew data for {journey_id}: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"No real crew data available for journey {journey_id}"
        }

@router.get("/journey/{journey_id}/timeline")
async def get_real_journey_timeline(journey_id: str) -> Dict[str, Any]:
    """Get real timeline data for journey - NO HARDCODED DATA"""
    try:
        service = RealSmartMovingService()
        timeline_data = await service.get_real_timeline_data(journey_id)
        
        return {
            "success": True,
            "timeline": timeline_data,
            "data_source": "SmartMoving API",
            "real_data": True,
            "fetch_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get real timeline data for {journey_id}: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"No real timeline data available for journey {journey_id}"
        }

@router.get("/journey/{journey_id}/media")
async def get_real_journey_media(journey_id: str) -> Dict[str, Any]:
    """Get real media data for journey - NO HARDCODED DATA"""
    try:
        service = RealSmartMovingService()
        media_data = await service.get_real_media_data(journey_id)
        
        return {
            "success": True,
            "media": media_data,
            "data_source": "SmartMoving API",
            "real_data": True,
            "fetch_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get real media data for {journey_id}: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"No real media data available for journey {journey_id}"
        }