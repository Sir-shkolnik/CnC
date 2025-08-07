"""
Enhanced Journey Workflow API Routes
Complete 6-phase journey workflow endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import json

from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_context
from ..services.journey_phase_service import JourneyPhaseService
from ..database import get_database_connection_connection

router = APIRouter()

@router.post("/{journey_id}/phases")
async def create_journey_phases(
    journey_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
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
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
):
    """Get all phases for a journey"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        progress = await service.get_journey_progress(journey_id)
        
        return {
            "success": True,
            "data": progress
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{journey_id}/phases/{phase_id}/start")
async def start_phase(
    journey_id: str,
    phase_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
):
    """Start a journey phase"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        result = await service.update_phase_status(phase_id, "IN_PROGRESS", current_user["id"])
        
        return {
            "success": True,
            "message": "Phase started successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{journey_id}/phases/{phase_id}/complete")
async def complete_phase(
    journey_id: str,
    phase_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
):
    """Complete a journey phase"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        result = await service.update_phase_status(phase_id, "COMPLETED", current_user["id"])
        
        return {
            "success": True,
            "message": "Phase completed successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{journey_id}/checklist/{item_id}/complete")
async def complete_checklist_item(
    journey_id: str,
    item_id: str,
    media_files: List[UploadFile] = File([]),
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
):
    """Complete a checklist item with media"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        result = await service.complete_checklist_item(item_id, current_user["id"], media_files)
        
        return {
            "success": True,
            "message": "Checklist item completed successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{journey_id}/progress")
async def get_journey_progress(
    journey_id: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
):
    """Get comprehensive journey progress"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        progress = await service.get_journey_progress(journey_id)
        
        return {
            "success": True,
            "data": progress
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/active-journeys")
async def get_active_journeys(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
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

@router.post("/{journey_id}/phases/{phase_id}/status")
async def update_phase_status(
    journey_id: str,
    phase_id: str,
    status: str,
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
):
    """Update phase status (generic endpoint)"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        result = await service.update_phase_status(phase_id, status, current_user["id"])
        
        return {
            "success": True,
            "message": f"Phase status updated to {status}",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/phases/templates")
async def get_phase_templates(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context),
    db = Depends(get_database_connection)
):
    """Get phase templates for journey creation"""
    try:
        service = JourneyPhaseService(tenant_info["client_id"], tenant_info["location_id"], db)
        templates = service._get_default_phases()
        
        return {
            "success": True,
            "data": {
                "templates": templates,
                "totalPhases": len(templates)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
