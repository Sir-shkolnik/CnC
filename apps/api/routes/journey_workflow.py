"""
Journey Workflow API Routes
C&C CRM - Complete 6-phase journey workflow endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import json

from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_info
from ..services.journey_phase_service import JourneyPhaseService
from ..database import get_database

router = APIRouter()

@router.post("/{journey_id}/phases")
async def create_journey_phases(
    journey_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Create all 6 phases for a new journey"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        phases = await service.create_journey_phases(journey_id)
        
        return {
            "success": True,
            "message": "Journey phases created successfully",
            "data": {
                "journeyId": journey_id,
                "phases": phases,
                "totalPhases": len(phases)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{journey_id}/phases")
async def get_journey_phases(
    journey_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Get all phases for a journey with detailed progress"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        phases = await service.get_journey_phases(journey_id)
        
        return {
            "success": True,
            "data": {
                "journeyId": journey_id,
                "phases": phases,
                "totalPhases": len(phases)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{journey_id}/phases/{phase_id}/start")
async def start_phase(
    journey_id: str,
    phase_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Start a journey phase"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        phase = await service.start_phase(phase_id, current_user["id"])
        
        return {
            "success": True,
            "message": f"Phase {phase['phaseName']} started successfully",
            "data": phase
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{journey_id}/phases/{phase_id}/complete")
async def complete_phase(
    journey_id: str,
    phase_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Complete a journey phase"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        phase = await service.complete_phase(phase_id, current_user["id"])
        
        return {
            "success": True,
            "message": f"Phase {phase['phaseName']} completed successfully",
            "data": phase
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{journey_id}/checklist/{item_id}/complete")
async def complete_checklist_item(
    journey_id: str,
    item_id: str,
    notes: Optional[str] = Form(None),
    media_files: List[UploadFile] = File([]),
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Complete a checklist item with optional media"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        
        # Process media files if provided
        processed_media = []
        if media_files:
            for file in media_files:
                # Here you would process and save the media file
                # For now, we'll just store the file info
                processed_media.append({
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "size": len(await file.read())
                })
        
        item = await service.complete_checklist_item(
            item_id, 
            current_user["id"], 
            processed_media, 
            notes
        )
        
        return {
            "success": True,
            "message": f"Checklist item '{item['title']}' completed successfully",
            "data": item
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{journey_id}/progress")
async def get_journey_progress(
    journey_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Get comprehensive journey progress with all phases"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        progress = await service.get_journey_progress(journey_id)
        
        return {
            "success": True,
            "data": progress
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{journey_id}/phases/{phase_id}/checklist")
async def get_phase_checklist(
    journey_id: str,
    phase_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Get checklist items for a specific phase"""
    try:
        query = """
            SELECT 
                jc.*,
                jp.phaseName,
                jp.phaseNumber
            FROM "JourneyChecklist" jc
            JOIN "JourneyPhase" jp ON jc.phaseId = jp.id
            WHERE jp.journeyId = :journey_id AND jp.id = :phase_id
            ORDER BY jc.sortOrder, jc.createdAt
        """
        items = await db.fetch_all(query, {
            "journey_id": journey_id,
            "phase_id": phase_id
        })
        
        return {
            "success": True,
            "data": {
                "journeyId": journey_id,
                "phaseId": phase_id,
                "checklistItems": [dict(item) for item in items]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{journey_id}/phases/{phase_id}/media-requirements")
async def get_phase_media_requirements(
    journey_id: str,
    phase_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Get media requirements for a specific phase"""
    try:
        query = """
            SELECT 
                jmr.*,
                jp.phaseName,
                jp.phaseNumber,
                COUNT(m.id) as completed_media_count
            FROM "JourneyMediaRequirement" jmr
            JOIN "JourneyPhase" jp ON jmr.phaseId = jp.id
            LEFT JOIN "Media" m ON jp.journeyId = m.journeyId AND jmr.mediaType = m.mediaType
            WHERE jp.journeyId = :journey_id AND jp.id = :phase_id
            GROUP BY jmr.id, jmr.phaseId, jmr.mediaType, jmr.title, jmr.description,
                     jmr.required, jmr.qualityStandards, jmr.sortOrder, jmr.createdAt,
                     jp.phaseName, jp.phaseNumber
            ORDER BY jmr.sortOrder, jmr.createdAt
        """
        requirements = await db.fetch_all(query, {
            "journey_id": journey_id,
            "phase_id": phase_id
        })
        
        return {
            "success": True,
            "data": {
                "journeyId": journey_id,
                "phaseId": phase_id,
                "mediaRequirements": [dict(req) for req in requirements]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{journey_id}/summary")
async def get_journey_summary(
    journey_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Get journey summary with key metrics"""
    try:
        # Get journey basic info
        journey_query = """
            SELECT 
                j.*,
                u1.name as driver_name,
                u2.name as mover_name,
                c.name as customer_name
            FROM "TruckJourney" j
            LEFT JOIN "User" u1 ON j.driverId = u1.id
            LEFT JOIN "User" u2 ON j.moverId = u2.id
            LEFT JOIN "Client" c ON j.clientId = c.id
            WHERE j.id = :journey_id
        """
        journey = await db.fetch_one(journey_query, {"journey_id": journey_id})
        
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        # Get progress summary
        progress_query = """
            SELECT * FROM "JourneyProgressView" WHERE journey_id = :journey_id
        """
        progress = await db.fetch_one(progress_query, {"journey_id": journey_id})
        
        # Get checklist summary
        checklist_query = """
            SELECT * FROM "JourneyChecklistProgressView" WHERE journey_id = :journey_id
        """
        checklist_progress = await db.fetch_all(checklist_query, {"journey_id": journey_id})
        
        # Get media summary
        media_query = """
            SELECT * FROM "JourneyMediaProgressView" WHERE journey_id = :journey_id
        """
        media_progress = await db.fetch_all(media_query, {"journey_id": journey_id})
        
        return {
            "success": True,
            "data": {
                "journey": dict(journey),
                "progress": dict(progress) if progress else {},
                "checklistProgress": [dict(cp) for cp in checklist_progress],
                "mediaProgress": [dict(mp) for mp in media_progress],
                "summary": {
                    "totalPhases": progress["total_phases"] if progress else 0,
                    "completedPhases": progress["completed_phases"] if progress else 0,
                    "activePhases": progress["active_phases"] if progress else 0,
                    "overallProgress": journey["progress"] if journey else 0,
                    "currentPhase": journey["currentPhase"] if journey else 1
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/active-journeys")
async def get_active_journeys(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Get all active journeys with progress"""
    try:
        query = """
            SELECT 
                j.*,
                u1.name as driver_name,
                u2.name as mover_name,
                c.name as customer_name,
                jp.phaseName as current_phase_name,
                jp.status as current_phase_status
            FROM "TruckJourney" j
            LEFT JOIN "User" u1 ON j.driverId = u1.id
            LEFT JOIN "User" u2 ON j.moverId = u2.id
            LEFT JOIN "Client" c ON j.clientId = c.id
            LEFT JOIN "JourneyPhase" jp ON j.id = jp.journeyId AND jp.phaseNumber = j.currentPhase
            WHERE j.clientId = :client_id 
            AND j.locationId = :location_id
            AND j.status IN ('MORNING_PREP', 'EN_ROUTE', 'ONSITE')
            ORDER BY j.createdAt DESC
        """
        journeys = await db.fetch_all(query, {
            "client_id": tenant_info["client_id"],
            "location_id": tenant_info["location_id"]
        })
        
        return {
            "success": True,
            "data": {
                "journeys": [dict(journey) for journey in journeys],
                "totalActive": len(journeys)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/journey-stats")
async def get_journey_statistics(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_info),
    db = Depends(get_database)
):
    """Get journey statistics and metrics"""
    try:
        # Get overall statistics
        stats_query = """
            SELECT 
                COUNT(*) as total_journeys,
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_journeys,
                COUNT(CASE WHEN status IN ('MORNING_PREP', 'EN_ROUTE', 'ONSITE') THEN 1 END) as active_journeys,
                AVG(progress) as average_progress,
                AVG(CASE WHEN status = 'COMPLETED' THEN 
                    EXTRACT(EPOCH FROM (updatedAt - createdAt))/3600 
                END) as average_completion_hours
            FROM "TruckJourney"
            WHERE clientId = :client_id AND locationId = :location_id
        """
        stats = await db.fetch_one(stats_query, {
            "client_id": tenant_info["client_id"],
            "location_id": tenant_info["location_id"]
        })
        
        # Get phase statistics
        phase_stats_query = """
            SELECT 
                jp.phaseName,
                COUNT(*) as total_phases,
                COUNT(CASE WHEN jp.status = 'COMPLETED' THEN 1 END) as completed_phases,
                COUNT(CASE WHEN jp.status = 'IN_PROGRESS' THEN 1 END) as active_phases,
                AVG(CASE WHEN jp.status = 'COMPLETED' THEN 
                    EXTRACT(EPOCH FROM (jp.completionTime - jp.startTime))/60 
                END) as average_duration_minutes
            FROM "JourneyPhase" jp
            JOIN "TruckJourney" j ON jp.journeyId = j.id
            WHERE j.clientId = :client_id AND j.locationId = :location_id
            GROUP BY jp.phaseName
            ORDER BY jp.phaseNumber
        """
        phase_stats = await db.fetch_all(phase_stats_query, {
            "client_id": tenant_info["client_id"],
            "location_id": tenant_info["location_id"]
        })
        
        return {
            "success": True,
            "data": {
                "overallStats": dict(stats),
                "phaseStats": [dict(ps) for ps in phase_stats]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 