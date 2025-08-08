"""
Customer Management API Routes
C&C CRM - Customer & Lead Management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from decimal import Decimal

from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_context
from ..models.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    LeadCreate, LeadUpdate, LeadResponse,
    SalesActivityCreate, SalesActivityUpdate, SalesActivityResponse
)
from ..services.customer_service import CustomerService
from ..services.lead_service import LeadService
from ..services.sales_activity_service import SalesActivityService

router = APIRouter(prefix="/customers", tags=["Customer Management"])

# ===== CUSTOMER MANAGEMENT =====

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Create a new customer"""
    try:
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        customer = await customer_service.create_customer(customer_data, current_user["id"])
        return customer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    lead_status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get customers with filtering and pagination"""
    try:
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        customers = await customer_service.get_customers(
            skip=skip,
            limit=limit,
            search=search,
            lead_status=lead_status,
            assigned_to=assigned_to,
            is_active=is_active
        )
        return customers
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get a specific customer by ID"""
    try:
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        customer = await customer_service.get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    customer_data: CustomerUpdate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Update a customer"""
    try:
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        customer = await customer_service.update_customer(
            customer_id, customer_data, current_user["id"]
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Delete a customer (soft delete)"""
    try:
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        success = await customer_service.delete_customer(customer_id, current_user["id"])
        if not success:
            raise HTTPException(status_code=404, detail="Customer not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{customer_id}/leads", response_model=List[LeadResponse])
async def get_customer_leads(
    customer_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get all leads for a specific customer"""
    try:
        lead_service = LeadService(tenant["client_id"], tenant["location_id"])
        leads = await lead_service.get_leads_by_customer(customer_id)
        return leads
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{customer_id}/activities", response_model=List[SalesActivityResponse])
async def get_customer_activities(
    customer_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get all sales activities for a specific customer"""
    try:
        activity_service = SalesActivityService(tenant["client_id"], tenant["location_id"])
        activities = await activity_service.get_activities_by_customer(
            customer_id, skip=skip, limit=limit
        )
        return activities
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===== LEAD MANAGEMENT =====

@router.post("/{customer_id}/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    customer_id: str,
    lead_data: LeadCreate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Create a new lead for a customer"""
    try:
        lead_service = LeadService(tenant["client_id"], tenant["location_id"])
        lead = await lead_service.create_lead(customer_id, lead_data, current_user["id"])
        return lead
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/leads/", response_model=List[LeadResponse])
async def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    source: Optional[str] = None,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get leads with filtering and pagination"""
    try:
        lead_service = LeadService(tenant["client_id"], tenant["location_id"])
        leads = await lead_service.get_leads(
            skip=skip,
            limit=limit,
            status=status,
            priority=priority,
            source=source
        )
        return leads
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/leads/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get a specific lead by ID"""
    try:
        lead_service = LeadService(tenant["client_id"], tenant["location_id"])
        lead = await lead_service.get_lead(lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/leads/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    lead_data: LeadUpdate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Update a lead"""
    try:
        lead_service = LeadService(tenant["client_id"], tenant["location_id"])
        lead = await lead_service.update_lead(lead_id, lead_data, current_user["id"])
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===== SALES ACTIVITY MANAGEMENT =====

@router.post("/activities", response_model=SalesActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_sales_activity(
    activity_data: SalesActivityCreate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Create a new sales activity"""
    try:
        activity_service = SalesActivityService(tenant["client_id"], tenant["location_id"])
        activity = await activity_service.create_activity(activity_data, current_user["id"])
        return activity
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/activities/", response_model=List[SalesActivityResponse])
async def get_sales_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[str] = None,
    customer_id: Optional[str] = None,
    lead_id: Optional[str] = None,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get sales activities with filtering and pagination"""
    try:
        activity_service = SalesActivityService(tenant["client_id"], tenant["location_id"])
        activities = await activity_service.get_activities(
            skip=skip,
            limit=limit,
            type=type,
            customer_id=customer_id,
            lead_id=lead_id
        )
        return activities
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/activities/{activity_id}", response_model=SalesActivityResponse)
async def get_sales_activity(
    activity_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get a specific sales activity by ID"""
    try:
        activity_service = SalesActivityService(tenant["client_id"], tenant["location_id"])
        activity = await activity_service.get_activity(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Sales activity not found")
        return activity
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/activities/{activity_id}", response_model=SalesActivityResponse)
async def update_sales_activity(
    activity_id: str,
    activity_data: SalesActivityUpdate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Update a sales activity"""
    try:
        activity_service = SalesActivityService(tenant["client_id"], tenant["location_id"])
        activity = await activity_service.update_activity(
            activity_id, activity_data, current_user["id"]
        )
        if not activity:
            raise HTTPException(status_code=404, detail="Sales activity not found")
        return activity
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===== ANALYTICS & REPORTING =====

@router.get("/analytics/overview")
async def get_customer_analytics(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get customer analytics overview"""
    try:
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        analytics = await customer_service.get_analytics_overview()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/leads")
async def get_lead_analytics(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get lead analytics"""
    try:
        lead_service = LeadService(tenant["client_id"], tenant["location_id"])
        analytics = await lead_service.get_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/activities")
async def get_activity_analytics(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get sales activity analytics"""
    try:
        activity_service = SalesActivityService(tenant["client_id"], tenant["location_id"])
        analytics = await activity_service.get_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 