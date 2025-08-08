"""
SmartMoving Jobs API Routes
==========================

API endpoints for syncing SmartMoving jobs into C&C CRM TruckJourneys
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from pydantic import BaseModel, Field

from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_context
from ..services.smartmoving_job_sync_service import SmartMovingJobSyncService

router = APIRouter(prefix="/smartmoving-jobs", tags=["SmartMoving Jobs"])

# Configure logging
logger = logging.getLogger(__name__)

# ===== PYDANTIC MODELS =====

class JobSyncRequest(BaseModel):
    sync_type: str = Field(default="today", description="Sync type: today, all, or specific date (YYYYMMDD)")
    date: Optional[str] = Field(None, description="Specific date to sync (YYYYMMDD format)")

class JobSyncResponse(BaseModel):
    success: bool
    message: str
    stats: Dict[str, Any]
    timestamp: datetime

class JourneyWithCustomer(BaseModel):
    id: str
    jobNumber: Optional[str]
    quoteNumber: Optional[str]
    date: datetime
    status: str
    customerName: Optional[str]
    customerPhone: Optional[str]
    customerEmail: Optional[str]
    estimatedTotal: Optional[float]
    pickupAddress: Optional[str]
    deliveryAddress: Optional[str]
    notes: Optional[str]
    createdAt: datetime

# ===== API ENDPOINTS =====

@router.post("/sync", response_model=JobSyncResponse)
async def sync_smartmoving_jobs(
    request: JobSyncRequest,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Sync SmartMoving jobs to C&C CRM TruckJourneys"""
    
    logger.info(f"Starting SmartMoving job sync for client: {tenant['client_id']}")
    
    try:
        async with SmartMovingJobSyncService() as sync_service:
            if request.sync_type == "today":
                result = await sync_service.sync_today_jobs(tenant['client_id'])
            elif request.sync_type == "all":
                result = await sync_service.sync_all_jobs(tenant['client_id'])
            elif request.sync_type == "date" and request.date:
                result = await sync_service.sync_smartmoving_jobs_to_journeys(
                    tenant['client_id'], 
                    request.date
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid sync_type. Use 'today', 'all', or 'date' with date parameter"
                )
            
            return JobSyncResponse(
                success=result["success"],
                message=result.get("message", "Sync completed"),
                stats=result.get("stats", {}),
                timestamp=datetime.utcnow()
            )
            
    except Exception as e:
        logger.error(f"Error in SmartMoving job sync: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )

@router.get("/journeys", response_model=List[JourneyWithCustomer])
async def get_smartmoving_journeys(
    date: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> List[Dict[str, Any]]:
    """Get TruckJourneys that originated from SmartMoving"""
    
    try:
        from prisma import Prisma
        
        db = Prisma()
        await db.connect()
        
        # Build query filters
        where_conditions = {
            "clientId": tenant['client_id'],
            "externalId": {"not": None}  # Only SmartMoving jobs
        }
        
        if date:
            # Convert date string to datetime
            try:
                date_obj = datetime.strptime(date, "%Y-%m-%d")
                where_conditions["date"] = {
                    "gte": date_obj,
                    "lt": date_obj.replace(hour=23, minute=59, second=59)
                }
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Use YYYY-MM-DD"
                )
        
        if status:
            where_conditions["status"] = status
        
        # Query journeys with customer data
        journeys = await db.truckjourney.find_many(
            where=where_conditions,
            include={
                "customer": True
            },
            order={"date": "desc"},
            take=limit,
            skip=offset
        )
        
        # Format response
        result = []
        for journey in journeys:
            customer_name = None
            customer_phone = None
            customer_email = None
            
            if journey.customer:
                customer_name = f"{journey.customer.firstName} {journey.customer.lastName}".strip()
                customer_phone = journey.customer.phone
                customer_email = journey.customer.email
            
            # Get pickup and delivery addresses
            pickup_address = None
            delivery_address = None
            if journey.jobAddresses and len(journey.jobAddresses) > 0:
                pickup_address = journey.jobAddresses[0]
                if len(journey.jobAddresses) > 1:
                    delivery_address = journey.jobAddresses[1]
            
            result.append(JourneyWithCustomer(
                id=journey.id,
                jobNumber=journey.jobNumber,
                quoteNumber=journey.quoteNumber,
                date=journey.date,
                status=journey.status.value,
                customerName=customer_name,
                customerPhone=customer_phone,
                customerEmail=customer_email,
                estimatedTotal=float(journey.estimatedTotal) if journey.estimatedTotal else None,
                pickupAddress=pickup_address,
                deliveryAddress=delivery_address,
                notes=journey.notes,
                createdAt=journey.createdAt
            ))
        
        await db.disconnect()
        return result
        
    except Exception as e:
        logger.error(f"Error fetching SmartMoving journeys: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch journeys: {str(e)}"
        )

@router.get("/stats")
async def get_smartmoving_stats(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Get statistics about SmartMoving integration"""
    
    try:
        from prisma import Prisma
        
        db = Prisma()
        await db.connect()
        
        # Count SmartMoving journeys
        total_journeys = await db.truckjourney.count(
            where={
                "clientId": tenant['client_id'],
                "externalId": {"not": None}
            }
        )
        
        # Count today's journeys
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_journeys = await db.truckjourney.count(
            where={
                "clientId": tenant['client_id'],
                "externalId": {"not": None},
                "date": {"gte": today}
            }
        )
        
        # Count customers from SmartMoving
        total_customers = await db.customer.count(
            where={
                "clientId": tenant['client_id'],
                "leadSource": "SmartMoving Integration"
            }
        )
        
        # Count leads from SmartMoving
        total_leads = await db.lead.count(
            where={
                "clientId": tenant['client_id'],
                "leadSource": "SmartMoving Integration"
            }
        )
        
        # Get recent sync activity
        recent_journeys = await db.truckjourney.find_many(
            where={
                "clientId": tenant['client_id'],
                "externalId": {"not": None}
            },
            order={"createdAt": "desc"},
            take=5
        )
        
        await db.disconnect()
        
        return {
            "success": True,
            "stats": {
                "total_journeys": total_journeys,
                "today_journeys": today_journeys,
                "total_customers": total_customers,
                "total_leads": total_leads,
                "last_sync": recent_journeys[0].createdAt if recent_journeys else None
            },
            "recent_journeys": [
                {
                    "id": j.id,
                    "jobNumber": j.jobNumber,
                    "date": j.date,
                    "status": j.status.value
                }
                for j in recent_journeys
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching SmartMoving stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )

@router.get("/test-connection")
async def test_smartmoving_connection(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Test connection to SmartMoving API"""
    
    try:
        async with SmartMovingJobSyncService() as sync_service:
            # Try to fetch a small sample of data
            customers = await sync_service.fetch_smartmoving_jobs()
            
            return {
                "success": True,
                "message": "SmartMoving API connection successful",
                "customers_found": len(customers),
                "sample_customer": customers[0] if customers else None
            }
            
    except Exception as e:
        logger.error(f"SmartMoving API connection test failed: {str(e)}")
        return {
            "success": False,
            "message": f"Connection failed: {str(e)}",
            "customers_found": 0,
            "sample_customer": None
        }
