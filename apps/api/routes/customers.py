from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel
from apps.api.dependencies import get_current_user
from apps.api.models.user import User
from prisma import Prisma

router = APIRouter()

# ===== DATA MODELS =====

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    moveDate: Optional[date] = None
    moveSize: Optional[str] = None
    serviceType: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    estimatedValue: Optional[float] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    moveDate: Optional[date] = None
    moveSize: Optional[str] = None
    serviceType: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    estimatedValue: Optional[float] = None
    status: Optional[str] = None

class QuoteCreate(BaseModel):
    customerId: str
    moveDate: date
    moveSize: str
    serviceType: str
    pickupAddress: str
    deliveryAddress: str
    estimatedHours: int
    crewSize: int = 2
    materials: Optional[List[str]] = None
    specialRequirements: Optional[str] = None
    basePrice: float
    hourlyRate: float
    totalPrice: float
    validUntil: date
    notes: Optional[str] = None

# ===== CUSTOMER MANAGEMENT =====

@router.post("/")
async def create_customer(
    customer: CustomerCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new customer/lead"""
    try:
        db = Prisma()
        await db.connect()
        
        # Create customer record
        new_customer = await db.customer.create({
            "data": {
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "address": customer.address,
                "moveDate": customer.moveDate,
                "moveSize": customer.moveSize,
                "serviceType": customer.serviceType,
                "source": customer.source,
                "notes": customer.notes,
                "estimatedValue": customer.estimatedValue,
                "status": "NEW",
                "assignedTo": current_user.id,
                "locationId": current_user.locationId,
                "clientId": current_user.clientId,
                "createdBy": current_user.id
            }
        })
        
        await db.disconnect()
        return {"success": True, "customer": new_customer}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating customer: {str(e)}")

@router.get("/")
async def get_customers(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    source: Optional[str] = None
):
    """Get customers with filtering and pagination"""
    try:
        db = Prisma()
        await db.connect()
        
        # Build where clause
        where_clause = {
            "clientId": current_user.clientId,
            "locationId": current_user.locationId
        }
        
        if search:
            where_clause["OR"] = [
                {"name": {"contains": search, "mode": "insensitive"}},
                {"email": {"contains": search, "mode": "insensitive"}},
                {"phone": {"contains": search, "mode": "insensitive"}}
            ]
        
        if status:
            where_clause["status"] = status
        
        if source:
            where_clause["source"] = source
        
        # Get customers with pagination
        customers = await db.customer.find_many(
            where=where_clause,
            skip=(page - 1) * limit,
            take=limit,
            order={"createdAt": "desc"},
            include={
                "assignedToUser": {
                    "select": {"name": True, "email": True}
                },
                "quotes": {
                    "orderBy": {"createdAt": "desc"},
                    "take": 1
                }
            }
        )
        
        # Get total count
        total = await db.customer.count(where=where_clause)
        
        await db.disconnect()
        
        return {
            "customers": customers,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customers: {str(e)}")

@router.get("/{customer_id}")
async def get_customer(
    customer_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get customer details with full history"""
    try:
        db = Prisma()
        await db.connect()
        
        customer = await db.customer.find_unique(
            where={"id": customer_id},
            include={
                "assignedToUser": True,
                "quotes": {
                    "orderBy": {"createdAt": "desc"}
                },
                "jobs": {
                    "orderBy": {"scheduledDate": "desc"}
                },
                "notes": {
                    "orderBy": {"createdAt": "desc"}
                }
            }
        )
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        await db.disconnect()
        return customer
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer: {str(e)}")

@router.put("/{customer_id}")
async def update_customer(
    customer_id: str,
    customer_update: CustomerUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update customer information"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify customer exists and user has access
        existing = await db.customer.find_unique(
            where={"id": customer_id, "clientId": current_user.clientId}
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Update customer
        updated = await db.customer.update(
            where={"id": customer_id},
            data={
                **customer_update.dict(exclude_unset=True),
                "updatedBy": current_user.id,
                "updatedAt": datetime.utcnow()
            }
        )
        
        await db.disconnect()
        return {"success": True, "customer": updated}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating customer: {str(e)}")

# ===== QUOTE MANAGEMENT =====

@router.post("/{customer_id}/quotes")
async def create_quote(
    customer_id: str,
    quote: QuoteCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a quote for a customer"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify customer exists
        customer = await db.customer.find_unique(
            where={"id": customer_id, "clientId": current_user.clientId}
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Create quote
        new_quote = await db.quote.create({
            "data": {
                "customerId": customer_id,
                "moveDate": quote.moveDate,
                "moveSize": quote.moveSize,
                "serviceType": quote.serviceType,
                "pickupAddress": quote.pickupAddress,
                "deliveryAddress": quote.deliveryAddress,
                "estimatedHours": quote.estimatedHours,
                "crewSize": quote.crewSize,
                "materials": quote.materials,
                "specialRequirements": quote.specialRequirements,
                "basePrice": quote.basePrice,
                "hourlyRate": quote.hourlyRate,
                "totalPrice": quote.totalPrice,
                "validUntil": quote.validUntil,
                "notes": quote.notes,
                "status": "DRAFT",
                "createdBy": current_user.id,
                "locationId": current_user.locationId,
                "clientId": current_user.clientId
            }
        })
        
        await db.disconnect()
        return {"success": True, "quote": new_quote}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating quote: {str(e)}")

@router.get("/{customer_id}/quotes")
async def get_customer_quotes(
    customer_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all quotes for a customer"""
    try:
        db = Prisma()
        await db.connect()
        
        quotes = await db.quote.find_many(
            where={
                "customerId": customer_id,
                "clientId": current_user.clientId
            },
            order={"createdAt": "desc"}
        )
        
        await db.disconnect()
        return quotes
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quotes: {str(e)}")

# ===== CUSTOMER ANALYTICS =====

@router.get("/analytics/overview")
async def get_customer_analytics(
    current_user: User = Depends(get_current_user)
):
    """Get customer analytics overview"""
    try:
        db = Prisma()
        await db.connect()
        
        location_id = current_user.locationId
        client_id = current_user.clientId
        
        # Get various counts
        total_customers = await db.customer.count(
            where={"clientId": client_id, "locationId": location_id}
        )
        
        new_leads = await db.customer.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "status": "NEW"
            }
        )
        
        qualified_leads = await db.customer.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "status": "QUALIFIED"
            }
        )
        
        won_customers = await db.customer.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "status": "WON"
            }
        )
        
        # Get conversion rates
        conversion_rate = (won_customers / total_customers * 100) if total_customers > 0 else 0
        
        # Get recent activity
        recent_customers = await db.customer.find_many(
            where={"clientId": client_id, "locationId": location_id},
            take=5,
            order={"updatedAt": "desc"}
        )
        
        await db.disconnect()
        
        return {
            "overview": {
                "totalCustomers": total_customers,
                "newLeads": new_leads,
                "qualifiedLeads": qualified_leads,
                "wonCustomers": won_customers,
                "conversionRate": round(conversion_rate, 2)
            },
            "recentActivity": recent_customers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@router.get("/analytics/sources")
async def get_customer_sources(
    current_user: User = Depends(get_current_user)
):
    """Get customer acquisition by source"""
    try:
        db = Prisma()
        await db.connect()
        
        # Get customers grouped by source
        sources = await db.customer.group_by(
            by=["source"],
            where={"clientId": current_user.clientId},
            _count={"source": True}
        )
        
        await db.disconnect()
        
        return sources
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching source analytics: {str(e)}")

# ===== CUSTOMER NOTES =====

@router.post("/{customer_id}/notes")
async def add_customer_note(
    customer_id: str,
    note: str,
    current_user: User = Depends(get_current_user)
):
    """Add a note to a customer"""
    try:
        db = Prisma()
        await db.connect()
        
        new_note = await db.customernote.create({
            "data": {
                "customerId": customer_id,
                "note": note,
                "createdBy": current_user.id
            }
        })
        
        await db.disconnect()
        return {"success": True, "note": new_note}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding note: {str(e)}")
