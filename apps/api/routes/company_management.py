"""
Company Management API Routes
============================

API endpoints for managing external company integrations (LGM, future companies)
and monitoring data synchronization.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from prisma import Prisma
from prisma.models import (
    CompanyIntegration, CompanyDataSyncLog, CompanyBranch, 
    CompanyMaterial, CompanyServiceType, CompanyMoveSize,
    CompanyRoomType, CompanyUser, CompanyReferralSource
)
from apps.api.services.company_sync_service import CompanySyncService
from apps.api.middleware.super_admin_auth import get_current_super_admin

router = APIRouter()

# Dependency for database connection
async def get_db():
    db = Prisma()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()

@router.get("/companies", response_model=List[Dict[str, Any]])
async def get_companies(
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get all company integrations"""
    companies = await db.companyintegration.find_many(
        order={"createdAt": "desc"}
    )
    
    return [
        {
            "id": company.id,
            "name": company.name,
            "apiSource": company.apiSource,
            "apiBaseUrl": company.apiBaseUrl,
            "isActive": company.isActive,
            "syncFrequencyHours": company.syncFrequencyHours,
            "lastSyncAt": company.lastSyncAt,
            "nextSyncAt": company.nextSyncAt,
            "syncStatus": company.syncStatus,
            "settings": company.settings,
            "createdAt": company.createdAt,
            "updatedAt": company.updatedAt
        }
        for company in companies
    ]

@router.get("/companies/{company_id}", response_model=Dict[str, Any])
async def get_company(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get specific company integration details"""
    company = await db.companyintegration.find_unique(
        where={"id": company_id}
    )
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return {
        "id": company.id,
        "name": company.name,
        "apiSource": company.apiSource,
        "apiBaseUrl": company.apiBaseUrl,
        "isActive": company.isActive,
        "syncFrequencyHours": company.syncFrequencyHours,
        "lastSyncAt": company.lastSyncAt,
        "nextSyncAt": company.nextSyncAt,
        "syncStatus": company.syncStatus,
        "settings": company.settings,
        "createdAt": company.createdAt,
        "updatedAt": company.updatedAt
    }

@router.post("/companies", response_model=Dict[str, Any])
async def create_company(
    company_data: Dict[str, Any],
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Create a new company integration"""
    try:
        company = await db.companyintegration.create(
            data={
                "id": f"company-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
                "name": company_data["name"],
                "apiSource": company_data["apiSource"],
                "apiBaseUrl": company_data["apiBaseUrl"],
                "apiKey": company_data["apiKey"],
                "clientId": company_data.get("clientId"),
                "isActive": company_data.get("isActive", True),
                "syncFrequencyHours": company_data.get("syncFrequencyHours", 12),
                "nextSyncAt": datetime.utcnow() + timedelta(hours=company_data.get("syncFrequencyHours", 12)),
                "syncStatus": "PENDING",
                "settings": company_data.get("settings", {}),
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        )
        
        return {
            "id": company.id,
            "name": company.name,
            "apiSource": company.apiSource,
            "apiBaseUrl": company.apiBaseUrl,
            "isActive": company.isActive,
            "syncFrequencyHours": company.syncFrequencyHours,
            "lastSyncAt": company.lastSyncAt,
            "nextSyncAt": company.nextSyncAt,
            "syncStatus": company.syncStatus,
            "settings": company.settings,
            "createdAt": company.createdAt,
            "updatedAt": company.updatedAt
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating company: {str(e)}")

@router.put("/companies/{company_id}", response_model=Dict[str, Any])
async def update_company(
    company_id: str,
    company_data: Dict[str, Any],
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Update company integration"""
    try:
        company = await db.companyintegration.update(
            where={"id": company_id},
            data={
                "name": company_data.get("name"),
                "apiSource": company_data.get("apiSource"),
                "apiBaseUrl": company_data.get("apiBaseUrl"),
                "apiKey": company_data.get("apiKey"),
                "clientId": company_data.get("clientId"),
                "isActive": company_data.get("isActive"),
                "syncFrequencyHours": company_data.get("syncFrequencyHours"),
                "settings": company_data.get("settings"),
                "updatedAt": datetime.utcnow()
            }
        )
        
        return {
            "id": company.id,
            "name": company.name,
            "apiSource": company.apiSource,
            "apiBaseUrl": company.apiBaseUrl,
            "isActive": company.isActive,
            "syncFrequencyHours": company.syncFrequencyHours,
            "lastSyncAt": company.lastSyncAt,
            "nextSyncAt": company.nextSyncAt,
            "syncStatus": company.syncStatus,
            "settings": company.settings,
            "createdAt": company.createdAt,
            "updatedAt": company.updatedAt
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating company: {str(e)}")

@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Delete company integration"""
    try:
        await db.companyintegration.delete(where={"id": company_id})
        return {"message": "Company deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting company: {str(e)}")

@router.post("/companies/{company_id}/sync")
async def trigger_company_sync(
    company_id: str,
    background_tasks: BackgroundTasks,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Trigger manual sync for a company"""
    company = await db.companyintegration.find_unique(where={"id": company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Add sync task to background
    background_tasks.add_task(run_manual_sync, company_id)
    
    return {"message": f"Sync triggered for {company.name}"}

async def run_manual_sync(company_id: str):
    """Background task to run manual sync"""
    async with CompanySyncService() as sync_service:
        company = await sync_service.prisma.companyintegration.find_unique(where={"id": company_id})
        if company:
            await sync_service.sync_company_data(company)

@router.get("/companies/{company_id}/sync-logs", response_model=List[Dict[str, Any]])
async def get_company_sync_logs(
    company_id: str,
    limit: int = 50,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get sync logs for a company"""
    logs = await db.companydatasynclog.find_many(
        where={"companyIntegrationId": company_id},
        order={"startedAt": "desc"},
        take=limit
    )
    
    return [
        {
            "id": log.id,
            "syncType": log.syncType,
            "status": log.status,
            "recordsProcessed": log.recordsProcessed,
            "recordsCreated": log.recordsCreated,
            "recordsUpdated": log.recordsUpdated,
            "recordsFailed": log.recordsFailed,
            "errorMessage": log.errorMessage,
            "startedAt": log.startedAt,
            "completedAt": log.completedAt,
            "metadata": log.metadata
        }
        for log in logs
    ]

@router.get("/companies/{company_id}/branches", response_model=List[Dict[str, Any]])
async def get_company_branches(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get branches for a company"""
    branches = await db.companybranch.find_many(
        where={"companyIntegrationId": company_id, "isActive": True},
        order={"name": "asc"}
    )
    
    return [
        {
            "id": branch.id,
            "externalId": branch.externalId,
            "name": branch.name,
            "phone": branch.phone,
            "isPrimary": branch.isPrimary,
            "country": branch.country,
            "provinceState": branch.provinceState,
            "city": branch.city,
            "fullAddress": branch.fullAddress,
            "street": branch.street,
            "zipCode": branch.zipCode,
            "latitude": branch.latitude,
            "longitude": branch.longitude,
            "lastSyncedAt": branch.lastSyncedAt,
            "createdAt": branch.createdAt,
            "updatedAt": branch.updatedAt
        }
        for branch in branches
    ]

@router.get("/companies/{company_id}/materials", response_model=List[Dict[str, Any]])
async def get_company_materials(
    company_id: str,
    category: Optional[str] = None,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get materials for a company"""
    where_clause = {"companyIntegrationId": company_id, "isActive": True}
    if category:
        where_clause["category"] = category
    
    materials = await db.companymaterial.find_many(
        where=where_clause,
        order={"category": "asc", "name": "asc"}
    )
    
    return [
        {
            "id": material.id,
            "externalId": material.externalId,
            "name": material.name,
            "description": material.description,
            "rate": float(material.rate),
            "unit": material.unit,
            "category": material.category,
            "dimensions": material.dimensions,
            "maxSize": material.maxSize,
            "sizeRange": material.sizeRange,
            "capacity": material.capacity,
            "weight": material.weight,
            "contents": material.contents,
            "lastSyncedAt": material.lastSyncedAt,
            "createdAt": material.createdAt,
            "updatedAt": material.updatedAt
        }
        for material in materials
    ]

@router.get("/companies/{company_id}/service-types", response_model=List[Dict[str, Any]])
async def get_company_service_types(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get service types for a company"""
    service_types = await db.companyservicetype.find_many(
        where={"companyIntegrationId": company_id, "isActive": True},
        order={"name": "asc"}
    )
    
    return [
        {
            "id": service_type.id,
            "externalId": service_type.externalId,
            "name": service_type.name,
            "description": service_type.description,
            "category": service_type.category,
            "lastSyncedAt": service_type.lastSyncedAt,
            "createdAt": service_type.createdAt,
            "updatedAt": service_type.updatedAt
        }
        for service_type in service_types
    ]

@router.get("/companies/{company_id}/move-sizes", response_model=List[Dict[str, Any]])
async def get_company_move_sizes(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get move sizes for a company"""
    move_sizes = await db.companymovesize.find_many(
        where={"companyIntegrationId": company_id, "isActive": True},
        order={"name": "asc"}
    )
    
    return [
        {
            "id": move_size.id,
            "externalId": move_size.externalId,
            "name": move_size.name,
            "description": move_size.description,
            "sizeRange": move_size.sizeRange,
            "lastSyncedAt": move_size.lastSyncedAt,
            "createdAt": move_size.createdAt,
            "updatedAt": move_size.updatedAt
        }
        for move_size in move_sizes
    ]

@router.get("/companies/{company_id}/room-types", response_model=List[Dict[str, Any]])
async def get_company_room_types(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get room types for a company"""
    room_types = await db.companyroomtype.find_many(
        where={"companyIntegrationId": company_id, "isActive": True},
        order={"name": "asc"}
    )
    
    return [
        {
            "id": room_type.id,
            "externalId": room_type.externalId,
            "name": room_type.name,
            "description": room_type.description,
            "category": room_type.category,
            "lastSyncedAt": room_type.lastSyncedAt,
            "createdAt": room_type.createdAt,
            "updatedAt": room_type.updatedAt
        }
        for room_type in room_types
    ]

@router.get("/companies/{company_id}/users", response_model=List[Dict[str, Any]])
async def get_company_users(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get users for a company"""
    users = await db.companyuser.find_many(
        where={"companyIntegrationId": company_id, "isActive": True},
        order={"name": "asc"}
    )
    
    return [
        {
            "id": user.id,
            "externalId": user.externalId,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "lastSyncedAt": user.lastSyncedAt,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt
        }
        for user in users
    ]

@router.get("/companies/{company_id}/referral-sources", response_model=List[Dict[str, Any]])
async def get_company_referral_sources(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get referral sources for a company"""
    referral_sources = await db.companyreferralsource.find_many(
        where={"companyIntegrationId": company_id, "isActive": True},
        order={"name": "asc"}
    )
    
    return [
        {
            "id": referral_source.id,
            "externalId": referral_source.externalId,
            "name": referral_source.name,
            "description": referral_source.description,
            "category": referral_source.category,
            "lastSyncedAt": referral_source.lastSyncedAt,
            "createdAt": referral_source.createdAt,
            "updatedAt": referral_source.updatedAt
        }
        for referral_source in referral_sources
    ]

@router.get("/companies/{company_id}/stats", response_model=Dict[str, Any])
async def get_company_stats(
    company_id: str,
    db: Prisma = Depends(get_db),
    super_admin: dict = Depends(get_current_super_admin)
):
    """Get statistics for a company"""
    # Count records
    branch_count = await db.companybranch.count(where={"companyIntegrationId": company_id, "isActive": True})
    material_count = await db.companymaterial.count(where={"companyIntegrationId": company_id, "isActive": True})
    service_type_count = await db.companyservicetype.count(where={"companyIntegrationId": company_id, "isActive": True})
    move_size_count = await db.companymovesize.count(where={"companyIntegrationId": company_id, "isActive": True})
    room_type_count = await db.companyroomtype.count(where={"companyIntegrationId": company_id, "isActive": True})
    user_count = await db.companyuser.count(where={"companyIntegrationId": company_id, "isActive": True})
    referral_source_count = await db.companyreferralsource.count(where={"companyIntegrationId": company_id, "isActive": True})
    
    # Get latest sync log
    latest_sync = await db.companydatasynclog.find_first(
        where={"companyIntegrationId": company_id},
        order={"startedAt": "desc"}
    )
    
    # Get company info
    company = await db.companyintegration.find_unique(where={"id": company_id})
    
    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "apiSource": company.apiSource,
            "isActive": company.isActive,
            "syncFrequencyHours": company.syncFrequencyHours,
            "lastSyncAt": company.lastSyncAt,
            "nextSyncAt": company.nextSyncAt,
            "syncStatus": company.syncStatus
        },
        "counts": {
            "branches": branch_count,
            "materials": material_count,
            "serviceTypes": service_type_count,
            "moveSizes": move_size_count,
            "roomTypes": room_type_count,
            "users": user_count,
            "referralSources": referral_source_count
        },
        "latestSync": {
            "id": latest_sync.id if latest_sync else None,
            "syncType": latest_sync.syncType if latest_sync else None,
            "status": latest_sync.status if latest_sync else None,
            "recordsProcessed": latest_sync.recordsProcessed if latest_sync else 0,
            "recordsCreated": latest_sync.recordsCreated if latest_sync else 0,
            "recordsUpdated": latest_sync.recordsUpdated if latest_sync else 0,
            "recordsFailed": latest_sync.recordsFailed if latest_sync else 0,
            "startedAt": latest_sync.startedAt if latest_sync else None,
            "completedAt": latest_sync.completedAt if latest_sync else None,
            "errorMessage": latest_sync.errorMessage if latest_sync else None
        }
    }
