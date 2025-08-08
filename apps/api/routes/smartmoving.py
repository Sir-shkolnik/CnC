#!/usr/bin/env python3
"""
SmartMoving API Routes
Handles SmartMoving integration endpoints with role-based access control
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging

from ..services.smartmoving_sync_service import SmartMovingSyncService
from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_context

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/smartmoving", tags=["SmartMoving Integration"])

def get_user_smartmoving_permissions(user: dict) -> Dict[str, bool]:
    """Get SmartMoving permissions based on user role"""
    role = user.get("role", "")
    
    permissions = {
        "canViewAllLocations": False,
        "canViewAllJobs": False,
        "canViewAllCompanies": False,
        "canEditJobs": False,
        "canAssignCrew": False,
        "canViewFinancialData": False,
        "canSyncData": False,
        "canViewSmartMovingData": False
    }
    
    if role == "SUPER_ADMIN":
        permissions.update({
            "canViewAllLocations": True,
            "canViewAllJobs": True,
            "canViewAllCompanies": True,
            "canEditJobs": True,
            "canAssignCrew": True,
            "canViewFinancialData": True,
            "canSyncData": True,
            "canViewSmartMovingData": True
        })
    elif role == "ADMIN":
        permissions.update({
            "canViewAllLocations": True,  # Within company
            "canViewAllJobs": True,       # Within company
            "canEditJobs": True,
            "canAssignCrew": True,
            "canViewFinancialData": True,
            "canViewSmartMovingData": True
        })
    elif role == "DISPATCHER":
        permissions.update({
            "canEditJobs": True,
            "canAssignCrew": True,
            "canViewSmartMovingData": True
        })
    elif role == "MANAGER":
        permissions.update({
            "canEditJobs": True,
            "canAssignCrew": True,
            "canViewFinancialData": True,
            "canViewSmartMovingData": True
        })
    elif role == "AUDITOR":
        permissions.update({
            "canViewAllLocations": True,
            "canViewAllJobs": True,
            "canViewAllCompanies": True,
            "canViewFinancialData": True,
            "canViewSmartMovingData": True
        })
    
    return permissions

@router.get("/jobs/today")
async def get_smartmoving_today_jobs(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context)
):
    """Get today's SmartMoving jobs based on user role"""
    
    # Get user permissions
    user_permissions = get_user_smartmoving_permissions(current_user)
    
    if not user_permissions["canViewSmartMovingData"]:
        raise HTTPException(status_code=403, detail="Access denied to SmartMoving data")
    
    try:
        async with SmartMovingSyncService() as sync_service:
            # Get today's date
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Pull SmartMoving jobs for today
            smartmoving_jobs = await sync_service.pull_smartmoving_jobs(today)
            
            if not smartmoving_jobs["success"]:
                return {
                    "success": False,
                    "message": smartmoving_jobs["message"],
                    "data": {
                        "jobs": [],
                        "stats": {
                            "totalJobs": 0,
                            "smartmovingJobs": 0,
                            "manualJobs": 0
                        }
                    }
                }
            
            # Normalize jobs
            normalized_jobs = sync_service.normalize_smartmoving_jobs(smartmoving_jobs["data"])
            
            # Filter jobs based on user role and permissions
            filtered_jobs = await filter_jobs_by_user_role(
                normalized_jobs, 
                current_user, 
                user_permissions
            )
            
            # Calculate stats
            stats = {
                "totalJobs": len(filtered_jobs),
                "smartmovingJobs": len(filtered_jobs),
                "manualJobs": 0,
                "date": today,
                "userRole": current_user.get("role", ""),
                "permissions": user_permissions
            }
            
            return {
                "success": True,
                "data": {
                    "jobs": filtered_jobs,
                    "stats": stats,
                    "filters": {
                        "date": "today",
                        "dataSource": "SMARTMOVING",
                        "userRole": current_user.get("role", "")
                    }
                }
            }
            
    except Exception as e:
        logger.error(f"Error getting today's SmartMoving jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/jobs/tomorrow")
async def get_smartmoving_tomorrow_jobs(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context)
):
    """Get tomorrow's SmartMoving jobs based on user role"""
    
    # Get user permissions
    user_permissions = get_user_smartmoving_permissions(current_user)
    
    if not user_permissions["canViewSmartMovingData"]:
        raise HTTPException(status_code=403, detail="Access denied to SmartMoving data")
    
    try:
        async with SmartMovingSyncService() as sync_service:
            # Get tomorrow's date
            tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            
            # Pull SmartMoving jobs for tomorrow
            smartmoving_jobs = await sync_service.pull_smartmoving_jobs(tomorrow)
            
            if not smartmoving_jobs["success"]:
                return {
                    "success": False,
                    "message": smartmoving_jobs["message"],
                    "data": {
                        "jobs": [],
                        "stats": {
                            "totalJobs": 0,
                            "smartmovingJobs": 0,
                            "manualJobs": 0
                        }
                    }
                }
            
            # Normalize jobs
            normalized_jobs = sync_service.normalize_smartmoving_jobs(smartmoving_jobs["data"])
            
            # Filter jobs based on user role and permissions
            filtered_jobs = await filter_jobs_by_user_role(
                normalized_jobs, 
                current_user, 
                user_permissions
            )
            
            # Calculate stats
            stats = {
                "totalJobs": len(filtered_jobs),
                "smartmovingJobs": len(filtered_jobs),
                "manualJobs": 0,
                "date": tomorrow,
                "userRole": current_user.get("role", ""),
                "permissions": user_permissions
            }
            
            return {
                "success": True,
                "data": {
                    "jobs": filtered_jobs,
                    "stats": stats,
                    "filters": {
                        "date": "tomorrow",
                        "dataSource": "SMARTMOVING",
                        "userRole": current_user.get("role", "")
                    }
                }
            }
            
    except Exception as e:
        logger.error(f"Error getting tomorrow's SmartMoving jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/jobs/sync")
async def sync_smartmoving_jobs(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context)
):
    """Sync today's and tomorrow's SmartMoving jobs"""
    
    # Get user permissions
    user_permissions = get_user_smartmoving_permissions(current_user)
    
    if not user_permissions["canSyncData"]:
        raise HTTPException(status_code=403, detail="Access denied to sync SmartMoving data")
    
    try:
        async with SmartMovingSyncService() as sync_service:
            # Sync today's and tomorrow's jobs
            sync_result = await sync_service.sync_today_and_tomorrow_jobs()
            
            return {
                "success": True,
                "data": sync_result,
                "message": "SmartMoving jobs synchronized successfully"
            }
            
    except Exception as e:
        logger.error(f"Error syncing SmartMoving jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/sync/status")
async def get_smartmoving_sync_status(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context)
):
    """Get SmartMoving sync status"""
    
    # Get user permissions
    user_permissions = get_user_smartmoving_permissions(current_user)
    
    if not user_permissions["canViewSmartMovingData"]:
        raise HTTPException(status_code=403, detail="Access denied to SmartMoving data")
    
    try:
        async with SmartMovingSyncService() as sync_service:
            # Get sync status
            sync_status = await sync_service.get_sync_status()
            
            return {
                "success": True,
                "data": sync_status.get("data", {}),
                "message": "SmartMoving sync status retrieved successfully"
            }
            
    except Exception as e:
        logger.error(f"Error getting SmartMoving sync status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/locations")
async def get_smartmoving_locations(
    current_user: dict = Depends(get_current_user),
    tenant_info: dict = Depends(get_tenant_context)
):
    """Get SmartMoving locations based on user role"""
    
    # Get user permissions
    user_permissions = get_user_smartmoving_permissions(current_user)
    
    if not user_permissions["canViewSmartMovingData"]:
        raise HTTPException(status_code=403, detail="Access denied to SmartMoving data")
    
    try:
        async with SmartMovingSyncService() as sync_service:
            # Get SmartMoving branches
            params = {"PageSize": 100}
            response = await sync_service.make_smartmoving_request("GET", "/api/branches", params)
            
            if not response["success"]:
                return {
                    "success": False,
                    "message": response["message"],
                    "data": {
                        "locations": [],
                        "stats": {
                            "totalLocations": 0,
                            "activeLocations": 0
                        }
                    }
                }
            
            branches_data = response["data"]
            branches = branches_data.get("pageResults", [])
            
            # Filter locations based on user role
            filtered_locations = await filter_locations_by_user_role(
                branches, 
                current_user, 
                user_permissions
            )
            
            # Calculate stats
            stats = {
                "totalLocations": len(filtered_locations),
                "activeLocations": len(filtered_locations),
                "userRole": current_user.get("role", ""),
                "permissions": user_permissions
            }
            
            return {
                "success": True,
                "data": {
                    "locations": filtered_locations,
                    "stats": stats
                }
            }
            
    except Exception as e:
        logger.error(f"Error getting SmartMoving locations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def filter_jobs_by_user_role(
    jobs: List[Dict], 
    user: dict, 
    permissions: Dict[str, bool]
) -> List[Dict]:
    """Filter jobs based on user role and permissions"""
    user_role = user.get("role", "")
    user_location_id = user.get("locationId", "")
    user_client_id = user.get("clientId", "")
    
    filtered_jobs = []
    
    for job in jobs:
        # Check if user can view this job based on role
        can_view = False
        
        if user_role == "SUPER_ADMIN" or user_role == "AUDITOR":
            # Can view all jobs
            can_view = True
        elif user_role == "ADMIN":
            # Can view company jobs (would need client_id matching)
            # For now, allow all jobs since we don't have client_id in SmartMoving data
            can_view = True
        elif user_role == "DISPATCHER":
            # Can view location jobs (would need location matching)
            # For now, allow all jobs since we don't have location mapping yet
            can_view = True
        elif user_role == "MANAGER":
            # Can view managed location jobs
            # For now, allow all jobs since we don't have location mapping yet
            can_view = True
        else:
            # DRIVER, MOVER, etc. - no direct access to SmartMoving data
            can_view = False
        
        if can_view:
            # Add user-specific data
            job["userRole"] = user_role
            job["userPermissions"] = permissions
            filtered_jobs.append(job)
    
    return filtered_jobs

async def filter_locations_by_user_role(
    locations: List[Dict], 
    user: dict, 
    permissions: Dict[str, bool]
) -> List[Dict]:
    """Filter locations based on user role and permissions"""
    user_role = user.get("role", "")
    
    filtered_locations = []
    
    for location in locations:
        # Check if user can view this location based on role
        can_view = False
        
        if user_role == "SUPER_ADMIN" or user_role == "AUDITOR":
            # Can view all locations
            can_view = True
        elif user_role == "ADMIN":
            # Can view company locations
            can_view = True
        elif user_role == "DISPATCHER":
            # Can view assigned locations
            # For now, allow all locations since we don't have assignment mapping yet
            can_view = True
        elif user_role == "MANAGER":
            # Can view managed locations
            # For now, allow all locations since we don't have management mapping yet
            can_view = True
        else:
            # DRIVER, MOVER, etc. - no direct access to SmartMoving data
            can_view = False
        
        if can_view:
            # Add user-specific data
            location["userRole"] = user_role
            location["userPermissions"] = permissions
            filtered_locations.append(location)
    
    return filtered_locations

@router.get("/health")
async def smartmoving_health_check():
    """Health check for SmartMoving integration"""
    try:
        async with SmartMovingSyncService() as sync_service:
            # Test SmartMoving API connection
            response = await sync_service.make_smartmoving_request("GET", "/api/branches", {"PageSize": 1})
            
            if response["success"]:
                return {
                    "success": True,
                    "message": "SmartMoving integration is healthy",
                    "status": "operational",
                    "apiConnection": "connected",
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "message": "SmartMoving API connection failed",
                    "status": "error",
                    "apiConnection": "disconnected",
                    "error": response["message"],
                    "timestamp": datetime.now().isoformat()
                }
                
    except Exception as e:
        logger.error(f"SmartMoving health check failed: {str(e)}")
        return {
            "success": False,
            "message": "SmartMoving integration health check failed",
            "status": "error",
            "apiConnection": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
