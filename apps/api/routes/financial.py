from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel
from apps.api.dependencies import get_current_user
from apps.api.models.user import User
from prisma import Prisma

router = APIRouter()

# ===== DATA MODELS =====

class QuoteUpdate(BaseModel):
    status: Optional[str] = None
    totalPrice: Optional[float] = None
    validUntil: Optional[date] = None
    notes: Optional[str] = None

class InvoiceCreate(BaseModel):
    quoteId: str
    customerId: str
    invoiceNumber: str
    dueDate: date
    items: List[Dict[str, Any]]
    subtotal: float
    taxRate: float = 0.0
    taxAmount: float = 0.0
    total: float
    notes: Optional[str] = None

class JobCostingCreate(BaseModel):
    jobId: str
    laborHours: float
    laborRate: float
    materials: List[Dict[str, Any]]
    fuelUsed: Optional[float] = None
    fuelCost: Optional[float] = None
    otherCosts: List[Dict[str, Any]]
    notes: Optional[str] = None

class PaymentCreate(BaseModel):
    invoiceId: str
    amount: float
    paymentMethod: str
    reference: Optional[str] = None
    notes: Optional[str] = None

# ===== QUOTE MANAGEMENT =====

@router.get("/quotes")
async def get_quotes(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    customer_id: Optional[str] = None
):
    """Get quotes with filtering and pagination"""
    try:
        db = Prisma()
        await db.connect()
        
        where_clause = {"clientId": current_user.clientId}
        
        if status:
            where_clause["status"] = status
        
        if customer_id:
            where_clause["customerId"] = customer_id
        
        quotes = await db.quote.find_many(
            where=where_clause,
            skip=(page - 1) * limit,
            take=limit,
            order={"createdAt": "desc"},
            include={
                "customer": {
                    "select": {"name": True, "email": True, "phone": True}
                },
                "createdByUser": {
                    "select": {"name": True, "email": True}
                }
            }
        )
        
        total = await db.quote.count(where=where_clause)
        
        await db.disconnect()
        
        return {
            "quotes": quotes,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quotes: {str(e)}")

@router.put("/quotes/{quote_id}")
async def update_quote(
    quote_id: str,
    quote_update: QuoteUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update quote status and details"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify quote exists and user has access
        existing = await db.quote.find_unique(
            where={"id": quote_id, "clientId": current_user.clientId}
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Update quote
        updated = await db.quote.update(
            where={"id": quote_id},
            data={
                **quote_update.dict(exclude_unset=True),
                "updatedBy": current_user.id,
                "updatedAt": datetime.utcnow()
            }
        )
        
        await db.disconnect()
        return {"success": True, "quote": updated}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating quote: {str(e)}")

@router.post("/quotes/{quote_id}/approve")
async def approve_quote(
    quote_id: str,
    current_user: User = Depends(get_current_user)
):
    """Approve a quote and convert to job"""
    try:
        db = Prisma()
        await db.connect()
        
        # Get quote with customer details
        quote = await db.quote.find_unique(
            where={"id": quote_id, "clientId": current_user.clientId},
            include={"customer": True}
        )
        
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        if quote.status != "DRAFT":
            raise HTTPException(status_code=400, detail="Quote must be in DRAFT status to approve")
        
        # Update quote status
        await db.quote.update(
            where={"id": quote_id},
            data={
                "status": "APPROVED",
                "approvedBy": current_user.id,
                "approvedAt": datetime.utcnow(),
                "updatedBy": current_user.id,
                "updatedAt": datetime.utcnow()
            }
        )
        
        # Create job from quote
        job = await db.job.create({
            "data": {
                "externalId": f"JOB-{quote_id[:8]}",
                "branchId": quote.customer.locationId,
                "customerId": quote.customerId,
                "customerName": quote.customer.name,
                "customerPhone": quote.customer.phone,
                "customerEmail": quote.customer.email,
                "pickupAddress": quote.pickupAddress,
                "deliveryAddress": quote.deliveryAddress,
                "scheduledDate": quote.moveDate,
                "estimatedDuration": quote.estimatedHours,
                "moveSize": quote.moveSize,
                "serviceType": quote.serviceType,
                "status": "Scheduled",
                "crewSize": quote.crewSize,
                "specialRequirements": quote.specialRequirements,
                "notes": quote.notes,
                "createdBy": current_user.id,
                "branch": {
                    "connect": {"id": quote.customer.locationId}
                }
            }
        })
        
        await db.disconnect()
        
        return {
            "success": True,
            "message": "Quote approved and job created",
            "job": job
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving quote: {str(e)}")

# ===== INVOICING SYSTEM =====

@router.post("/invoices")
async def create_invoice(
    invoice: InvoiceCreate,
    current_user: User = Depends(get_current_user)
):
    """Create an invoice from a quote"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify quote exists and is approved
        quote = await db.quote.find_unique(
            where={"id": invoice.quoteId, "clientId": current_user.clientId}
        )
        
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        if quote.status != "APPROVED":
            raise HTTPException(status_code=400, detail="Quote must be approved to create invoice")
        
        # Create invoice
        new_invoice = await db.invoice.create({
            "data": {
                "quoteId": invoice.quoteId,
                "customerId": invoice.customerId,
                "invoiceNumber": invoice.invoiceNumber,
                "dueDate": invoice.dueDate,
                "items": invoice.items,
                "subtotal": invoice.subtotal,
                "taxRate": invoice.taxRate,
                "taxAmount": invoice.taxAmount,
                "total": invoice.total,
                "notes": invoice.notes,
                "status": "DRAFT",
                "createdBy": current_user.id,
                "locationId": current_user.locationId,
                "clientId": current_user.clientId
            }
        })
        
        await db.disconnect()
        return {"success": True, "invoice": new_invoice}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating invoice: {str(e)}")

@router.get("/invoices")
async def get_invoices(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """Get invoices with filtering and pagination"""
    try:
        db = Prisma()
        await db.connect()
        
        where_clause = {"clientId": current_user.clientId}
        
        if status:
            where_clause["status"] = status
        
        invoices = await db.invoice.find_many(
            where=where_clause,
            skip=(page - 1) * limit,
            take=limit,
            order={"createdAt": "desc"},
            include={
                "customer": {
                    "select": {"name": True, "email": True}
                },
                "quote": {
                    "select": {"totalPrice": True, "moveDate": True}
                }
            }
        )
        
        total = await db.invoice.count(where=where_clause)
        
        await db.disconnect()
        
        return {
            "invoices": invoices,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")

# ===== JOB COSTING & P&L =====

@router.post("/job-costing")
async def create_job_costing(
    costing: JobCostingCreate,
    current_user: User = Depends(get_current_user)
):
    """Create job costing record for P&L tracking"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify job exists
        job = await db.job.find_unique(
            where={"id": costing.jobId}
        )
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Calculate total costs
        labor_cost = costing.laborHours * costing.laborRate
        materials_cost = sum(item.get("cost", 0) for item in costing.materials)
        fuel_cost = costing.fuelCost or 0
        other_costs = sum(item.get("cost", 0) for item in costing.otherCosts)
        
        total_cost = labor_cost + materials_cost + fuel_cost + other_costs
        
        # Create job costing record
        job_costing = await db.jobcosting.create({
            "data": {
                "jobId": costing.jobId,
                "laborHours": costing.laborHours,
                "laborRate": costing.laborRate,
                "laborCost": labor_cost,
                "materials": costing.materials,
                "materialsCost": materials_cost,
                "fuelUsed": costing.fuelUsed,
                "fuelCost": fuel_cost,
                "otherCosts": costing.otherCosts,
                "otherCostsTotal": other_costs,
                "totalCost": total_cost,
                "notes": costing.notes,
                "createdBy": current_user.id
            }
        })
        
        await db.disconnect()
        return {"success": True, "jobCosting": job_costing}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job costing: {str(e)}")

@router.get("/job-costing/{job_id}")
async def get_job_costing(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get job costing and P&L data"""
    try:
        db = Prisma()
        await db.connect()
        
        # Get job with costing data
        job = await db.job.find_unique(
            where={"id": job_id},
            include={
                "costing": True,
                "invoice": True
            }
        )
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Calculate P&L
        revenue = job.invoice.total if job.invoice else 0
        costs = job.costing.totalCost if job.costing else 0
        profit = revenue - costs
        margin = (profit / revenue * 100) if revenue > 0 else 0
        
        await db.disconnect()
        
        return {
            "job": job,
            "pAndL": {
                "revenue": revenue,
                "costs": costs,
                "profit": profit,
                "margin": round(margin, 2)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching job costing: {str(e)}")

# ===== PAYMENT PROCESSING =====

@router.post("/payments")
async def create_payment(
    payment: PaymentCreate,
    current_user: User = Depends(get_current_user)
):
    """Record a payment for an invoice"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify invoice exists
        invoice = await db.invoice.find_unique(
            where={"id": payment.invoiceId, "clientId": current_user.clientId}
        )
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Create payment record
        new_payment = await db.payment.create({
            "data": {
                "invoiceId": payment.invoiceId,
                "amount": payment.amount,
                "paymentMethod": payment.paymentMethod,
                "reference": payment.reference,
                "notes": payment.notes,
                "processedBy": current_user.id,
                "processedAt": datetime.utcnow()
            }
        })
        
        # Update invoice status if fully paid
        total_paid = await db.payment.aggregate(
            where={"invoiceId": payment.invoiceId},
            _sum={"amount": True}
        )
        
        if total_paid._sum.amount >= invoice.total:
            await db.invoice.update(
                where={"id": payment.invoiceId},
                data={"status": "PAID"}
            )
        
        await db.disconnect()
        return {"success": True, "payment": new_payment}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")

# ===== FINANCIAL ANALYTICS =====

@router.get("/analytics/overview")
async def get_financial_overview(
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get financial overview and KPIs"""
    try:
        db = Prisma()
        await db.connect()
        
        # Set default date range if not provided
        if not start_date:
            start_date = date.today().replace(day=1)  # First day of current month
        if not end_date:
            end_date = date.today()
        
        # Get quote metrics
        total_quotes = await db.quote.count(
            where={
                "clientId": current_user.clientId,
                "createdAt": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            }
        )
        
        approved_quotes = await db.quote.count(
            where={
                "clientId": current_user.clientId,
                "status": "APPROVED",
                "createdAt": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            }
        )
        
        # Get revenue metrics
        total_revenue = await db.invoice.aggregate(
            where={
                "clientId": current_user.clientId,
                "status": "PAID",
                "createdAt": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            },
            _sum={"total": True}
        )
        
        # Get outstanding invoices
        outstanding_amount = await db.invoice.aggregate(
            where={
                "clientId": current_user.clientId,
                "status": {"in": ["DRAFT", "SENT", "OVERDUE"]}
            },
            _sum={"total": True}
        )
        
        await db.disconnect()
        
        return {
            "period": {
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat()
            },
            "quotes": {
                "total": total_quotes,
                "approved": approved_quotes,
                "approvalRate": round((approved_quotes / total_quotes * 100), 2) if total_quotes > 0 else 0
            },
            "revenue": {
                "total": total_revenue._sum.total or 0,
                "outstanding": outstanding_amount._sum.total or 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching financial overview: {str(e)}")
