"""
Sales Pipeline API Routes
C&C CRM - Quote Management & Sales Pipeline
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from decimal import Decimal

from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_context
from ..models.quote import (
    QuoteCreate, QuoteUpdate, QuoteResponse,
    QuoteItemCreate, QuoteItemUpdate, QuoteItemResponse
)
from ..services.quote_service import QuoteService
from ..services.quote_item_service import QuoteItemService

router = APIRouter(prefix="/quotes", tags=["Sales Pipeline"])

# ===== QUOTE MANAGEMENT =====

@router.post("/", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote(
    quote_data: QuoteCreate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Create a new quote"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quote = await quote_service.create_quote(quote_data, current_user["id"])
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[QuoteResponse])
async def get_quotes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    created_by: Optional[str] = None,
    is_template: Optional[bool] = None,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get quotes with filtering and pagination"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quotes = await quote_service.get_quotes(
            skip=skip,
            limit=limit,
            customer_id=customer_id,
            status=status,
            created_by=created_by,
            is_template=is_template
        )
        return quotes
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(
    quote_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get a specific quote by ID"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quote = await quote_service.get_quote(quote_id)
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{quote_id}", response_model=QuoteResponse)
async def update_quote(
    quote_id: str,
    quote_data: QuoteUpdate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Update a quote"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quote = await quote_service.update_quote(
            quote_id, quote_data, current_user["id"]
        )
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote(
    quote_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Delete a quote"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        success = await quote_service.delete_quote(quote_id, current_user["id"])
        if not success:
            raise HTTPException(status_code=404, detail="Quote not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{quote_id}/approve", response_model=QuoteResponse)
async def approve_quote(
    quote_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Approve a quote"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quote = await quote_service.approve_quote(quote_id, current_user["id"])
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{quote_id}/reject", response_model=QuoteResponse)
async def reject_quote(
    quote_id: str,
    rejection_reason: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Reject a quote with reason"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quote = await quote_service.reject_quote(quote_id, rejection_reason, current_user["id"])
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{quote_id}/send", response_model=QuoteResponse)
async def send_quote(
    quote_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Send a quote to customer"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quote = await quote_service.send_quote(quote_id, current_user["id"])
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{quote_id}/convert", response_model=Dict[str, Any])
async def convert_quote_to_journey(
    quote_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Convert a quote to a journey"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        result = await quote_service.convert_to_journey(quote_id, current_user["id"])
        if not result:
            raise HTTPException(status_code=404, detail="Quote not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{quote_id}/duplicate", response_model=QuoteResponse)
async def duplicate_quote(
    quote_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Duplicate a quote"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        quote = await quote_service.duplicate_quote(quote_id, current_user["id"])
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===== QUOTE ITEM MANAGEMENT =====

@router.post("/{quote_id}/items", response_model=QuoteItemResponse, status_code=status.HTTP_201_CREATED)
async def create_quote_item(
    quote_id: str,
    item_data: QuoteItemCreate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Add an item to a quote"""
    try:
        item_service = QuoteItemService(tenant["client_id"], tenant["location_id"])
        item = await item_service.create_quote_item(quote_id, item_data, current_user["id"])
        return item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{quote_id}/items", response_model=List[QuoteItemResponse])
async def get_quote_items(
    quote_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get all items for a quote"""
    try:
        item_service = QuoteItemService(tenant["client_id"], tenant["location_id"])
        items = await item_service.get_quote_items(quote_id)
        return items
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/items/{item_id}", response_model=QuoteItemResponse)
async def get_quote_item(
    item_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get a specific quote item by ID"""
    try:
        item_service = QuoteItemService(tenant["client_id"], tenant["location_id"])
        item = await item_service.get_quote_item(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Quote item not found")
        return item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/items/{item_id}", response_model=QuoteItemResponse)
async def update_quote_item(
    item_id: str,
    item_data: QuoteItemUpdate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Update a quote item"""
    try:
        item_service = QuoteItemService(tenant["client_id"], tenant["location_id"])
        item = await item_service.update_quote_item(
            item_id, item_data, current_user["id"]
        )
        if not item:
            raise HTTPException(status_code=404, detail="Quote item not found")
        return item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote_item(
    item_id: str,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Delete a quote item"""
    try:
        item_service = QuoteItemService(tenant["client_id"], tenant["location_id"])
        success = await item_service.delete_quote_item(item_id, current_user["id"])
        if not success:
            raise HTTPException(status_code=404, detail="Quote item not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===== TEMPLATE MANAGEMENT =====

@router.get("/templates/", response_model=List[QuoteResponse])
async def get_quote_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get quote templates"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        templates = await quote_service.get_templates(skip=skip, limit=limit)
        return templates
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/templates/", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote_template(
    template_data: QuoteCreate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Create a quote template"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        template = await quote_service.create_template(template_data, current_user["id"])
        return template
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===== ANALYTICS & REPORTING =====

@router.get("/analytics/overview")
async def get_quote_analytics(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get quote analytics overview"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        analytics = await quote_service.get_analytics_overview()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/pipeline")
async def get_sales_pipeline_analytics(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get sales pipeline analytics"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        analytics = await quote_service.get_pipeline_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/conversion")
async def get_conversion_analytics(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Get quote conversion analytics"""
    try:
        quote_service = QuoteService(tenant["client_id"], tenant["location_id"])
        analytics = await quote_service.get_conversion_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 