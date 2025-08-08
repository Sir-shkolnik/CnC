"""
SmartMoving API Integration Routes
C&C CRM - SmartMoving Integration for Lead Management and Data Sync
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx
import json
import os
from pydantic import BaseModel, Field

from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_context

router = APIRouter(prefix="/smartmoving", tags=["SmartMoving Integration"])

# ===== SMARTMOVING API CONFIGURATION =====

SMARTMOVING_API_BASE = "https://api.smartmoving.com/api"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"
SMARTMOVING_LEAD_ENDPOINT = f"{SMARTMOVING_API_BASE}/leads/from-provider/v2"

# ===== PYDANTIC MODELS =====

class SmartMovingAddress(BaseModel):
    Street1: str
    Street2: Optional[str] = None
    City: str
    State: str
    PostalCode: str
    Country: str = "Canada"

class SmartMovingInventoryItem(BaseModel):
    ItemName: str
    Quantity: int

class SmartMovingCustomField(BaseModel):
    FieldName: str
    FieldValue: str

class SmartMovingLeadCreate(BaseModel):
    FullName: Optional[str] = None
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    Email: Optional[str] = None
    Phone: Optional[str] = None
    MoveDate: Optional[str] = None
    MoveSize: Optional[str] = None
    ServiceType: Optional[str] = None
    ReferralSource: Optional[str] = "C&C CRM Integration"
    Notes: Optional[str] = None
    OriginAddress: Optional[SmartMovingAddress] = None
    DestinationAddress: Optional[SmartMovingAddress] = None
    InventoryList: Optional[List[SmartMovingInventoryItem]] = None
    PreferredContactMethod: Optional[str] = None
    BestTimeToCall: Optional[str] = None
    EstimatedWeightLbs: Optional[int] = None
    PackingRequired: Optional[bool] = None
    StorageRequired: Optional[bool] = None
    CustomFields: Optional[List[SmartMovingCustomField]] = None

class SmartMovingLeadResponse(BaseModel):
    success: bool
    lead_id: Optional[str] = None
    message: str
    smartmoving_data: Optional[Dict[str, Any]] = None

class SmartMovingSyncRequest(BaseModel):
    customer_id: str
    sync_type: str = Field(..., description="Type of sync: 'lead', 'customer', 'journey'")
    force_sync: bool = False

# ===== HELPER FUNCTIONS =====

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "Content-Type": "application/json",
        "X-API-Key": SMARTMOVING_API_KEY,
        "X-Client-ID": SMARTMOVING_CLIENT_ID,
        "User-Agent": "C&C-CRM-Integration/1.0"
    }

async def validate_smartmoving_credentials() -> bool:
    """Validate SmartMoving API credentials"""
    try:
        async with httpx.AsyncClient() as client:
            headers = await get_smartmoving_headers()
            response = await client.get(
                f"{SMARTMOVING_API_BASE}/health",
                headers=headers,
                timeout=10.0
            )
            return response.status_code == 200
    except Exception as e:
        print(f"SmartMoving API validation failed: {e}")
        return False

def convert_customer_to_smartmoving_lead(customer: Dict[str, Any]) -> SmartMovingLeadCreate:
    """Convert C&C CRM customer to SmartMoving lead format"""
    
    # Extract customer data
    full_name = f"{customer.get('firstName', '')} {customer.get('lastName', '')}".strip()
    
    # Build SmartMoving lead data
    lead_data = {
        "FullName": full_name,
        "FirstName": customer.get('firstName'),
        "LastName": customer.get('lastName'),
        "Email": customer.get('email'),
        "Phone": customer.get('phone'),
        "ReferralSource": "C&C CRM Integration",
        "Notes": f"Customer ID: {customer.get('id')}\nLead Status: {customer.get('leadStatus')}\nEstimated Value: {customer.get('estimatedValue')}"
    }
    
    # Add address information if available
    if customer.get('address'):
        address = customer['address']
        lead_data["OriginAddress"] = {
            "Street1": address.get('street', ''),
            "Street2": address.get('street2', ''),
            "City": address.get('city', ''),
            "State": address.get('state', 'ON'),
            "PostalCode": address.get('postalCode', ''),
            "Country": "Canada"
        }
    
    # Add custom fields
    custom_fields = []
    if customer.get('estimatedValue'):
        custom_fields.append({
            "FieldName": "Estimated Value",
            "FieldValue": str(customer.get('estimatedValue'))
        })
    
    if customer.get('leadStatus'):
        custom_fields.append({
            "FieldName": "Lead Status",
            "FieldValue": customer.get('leadStatus')
        })
    
    if customer.get('tags'):
        custom_fields.append({
            "FieldName": "Tags",
            "FieldValue": ", ".join(customer.get('tags', []))
        })
    
    if custom_fields:
        lead_data["CustomFields"] = custom_fields
    
    return SmartMovingLeadCreate(**lead_data)

# ===== SMARTMOVING API ENDPOINTS =====

@router.post("/leads", response_model=SmartMovingLeadResponse)
async def create_smartmoving_lead(
    lead_data: SmartMovingLeadCreate,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Create a new lead in SmartMoving"""
    
    try:
        # Validate API credentials
        if not await validate_smartmoving_credentials():
            raise HTTPException(
                status_code=500,
                detail="SmartMoving API credentials are invalid or API is unavailable"
            )
        
        # Prepare the request
        headers = await get_smartmoving_headers()
        payload = lead_data.dict(exclude_none=True)
        
        # Add provider key to URL
        url = f"{SMARTMOVING_LEAD_ENDPOINT}?providerKey={SMARTMOVING_API_KEY}"
        
        # Send request to SmartMoving
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code == 200 or response.status_code == 201:
                response_data = response.json()
                return SmartMovingLeadResponse(
                    success=True,
                    lead_id=response_data.get('id'),
                    message="Lead created successfully in SmartMoving",
                    smartmoving_data=response_data
                )
            else:
                error_detail = f"SmartMoving API error: {response.status_code} - {response.text}"
                return SmartMovingLeadResponse(
                    success=False,
                    message=error_detail
                )
                
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=408,
            detail="SmartMoving API request timed out"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create SmartMoving lead: {str(e)}"
        )

@router.post("/sync/customer/{customer_id}", response_model=SmartMovingLeadResponse)
async def sync_customer_to_smartmoving(
    customer_id: str,
    sync_request: SmartMovingSyncRequest,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Sync a C&C CRM customer to SmartMoving as a lead"""
    
    try:
        # Get customer data from C&C CRM
        from ..services.customer_service import CustomerService
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        customer = await customer_service.get_customer(customer_id)
        
        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found in C&C CRM"
            )
        
        # Convert customer to SmartMoving lead format
        lead_data = convert_customer_to_smartmoving_lead(customer)
        
        # Create lead in SmartMoving
        smartmoving_response = await create_smartmoving_lead(lead_data, current_user, tenant)
        
        if smartmoving_response.success:
            # Update customer with SmartMoving lead ID
            await customer_service.update_customer(
                customer_id,
                {"smartmoving_lead_id": smartmoving_response.lead_id},
                current_user["id"]
            )
            
            return SmartMovingLeadResponse(
                success=True,
                lead_id=smartmoving_response.lead_id,
                message=f"Customer {customer.get('firstName')} {customer.get('lastName')} synced to SmartMoving successfully",
                smartmoving_data=smartmoving_response.smartmoving_data
            )
        else:
            return smartmoving_response
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to sync customer to SmartMoving: {str(e)}"
        )

@router.get("/health")
async def smartmoving_health_check():
    """Check SmartMoving API health and credentials"""
    
    try:
        is_valid = await validate_smartmoving_credentials()
        
        return {
            "success": is_valid,
            "api_status": "healthy" if is_valid else "unhealthy",
            "api_key": SMARTMOVING_API_KEY[:8] + "..." if is_valid else "invalid",
            "client_id": SMARTMOVING_CLIENT_ID[:8] + "..." if is_valid else "invalid",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        return {
            "success": False,
            "api_status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

@router.post("/webhook/receive")
async def receive_smartmoving_webhook(request: Request):
    """Receive webhooks from SmartMoving"""
    
    try:
        # Get webhook payload
        payload = await request.json()
        
        # Log webhook for debugging
        print(f"SmartMoving webhook received: {json.dumps(payload, indent=2)}")
        
        # Process webhook based on event type
        event_type = payload.get('event_type', 'unknown')
        
        if event_type == 'lead_created':
            # Handle new lead from SmartMoving
            await process_smartmoving_lead_created(payload)
        elif event_type == 'lead_updated':
            # Handle lead update from SmartMoving
            await process_smartmoving_lead_updated(payload)
        elif event_type == 'job_created':
            # Handle new job from SmartMoving
            await process_smartmoving_job_created(payload)
        else:
            print(f"Unknown SmartMoving webhook event type: {event_type}")
        
        return {"success": True, "message": "Webhook processed successfully"}
        
    except Exception as e:
        print(f"Error processing SmartMoving webhook: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

# ===== WEBHOOK PROCESSING FUNCTIONS =====

async def process_smartmoving_lead_created(payload: Dict[str, Any]):
    """Process new lead created in SmartMoving"""
    try:
        lead_data = payload.get('data', {})
        
        # Create customer in C&C CRM
        from ..services.customer_service import CustomerService
        
        # Extract customer data from SmartMoving lead
        customer_data = {
            "firstName": lead_data.get('FirstName', ''),
            "lastName": lead_data.get('LastName', ''),
            "email": lead_data.get('Email', ''),
            "phone": lead_data.get('Phone', ''),
            "leadStatus": "NEW",
            "estimatedValue": 0,  # Will be updated later
            "smartmoving_lead_id": lead_data.get('id'),
            "address": {
                "street": lead_data.get('OriginAddress', {}).get('Street1', ''),
                "city": lead_data.get('OriginAddress', {}).get('City', ''),
                "state": lead_data.get('OriginAddress', {}).get('State', 'ON'),
                "postalCode": lead_data.get('OriginAddress', {}).get('PostalCode', ''),
                "country": "Canada"
            }
        }
        
        # Create customer in C&C CRM
        # Note: This would need proper tenant context
        print(f"Would create customer in C&C CRM: {customer_data}")
        
    except Exception as e:
        print(f"Error processing SmartMoving lead creation: {e}")

async def process_smartmoving_lead_updated(payload: Dict[str, Any]):
    """Process lead update from SmartMoving"""
    try:
        lead_data = payload.get('data', {})
        lead_id = lead_data.get('id')
        
        # Update customer in C&C CRM
        print(f"Would update customer in C&C CRM for SmartMoving lead ID: {lead_id}")
        
    except Exception as e:
        print(f"Error processing SmartMoving lead update: {e}")

async def process_smartmoving_job_created(payload: Dict[str, Any]):
    """Process new job created in SmartMoving"""
    try:
        job_data = payload.get('data', {})
        
        # Create journey in C&C CRM
        print(f"Would create journey in C&C CRM for SmartMoving job: {job_data.get('id')}")
        
    except Exception as e:
        print(f"Error processing SmartMoving job creation: {e}")

# ===== BULK SYNC ENDPOINTS =====

@router.post("/sync/bulk/customers")
async def bulk_sync_customers_to_smartmoving(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
):
    """Bulk sync all C&C CRM customers to SmartMoving"""
    
    try:
        # Get all customers from C&C CRM
        from ..services.customer_service import CustomerService
        customer_service = CustomerService(tenant["client_id"], tenant["location_id"])
        customers = await customer_service.get_customers(limit=1000)
        
        results = []
        success_count = 0
        error_count = 0
        
        for customer in customers:
            try:
                # Skip if already synced
                if customer.get('smartmoving_lead_id'):
                    results.append({
                        "customer_id": customer['id'],
                        "status": "skipped",
                        "message": "Already synced to SmartMoving"
                    })
                    continue
                
                # Convert and sync customer
                lead_data = convert_customer_to_smartmoving_lead(customer)
                response = await create_smartmoving_lead(lead_data, current_user, tenant)
                
                if response.success:
                    # Update customer with SmartMoving lead ID
                    await customer_service.update_customer(
                        customer['id'],
                        {"smartmoving_lead_id": response.lead_id},
                        current_user["id"]
                    )
                    
                    results.append({
                        "customer_id": customer['id'],
                        "status": "success",
                        "smartmoving_lead_id": response.lead_id,
                        "message": "Synced successfully"
                    })
                    success_count += 1
                else:
                    results.append({
                        "customer_id": customer['id'],
                        "status": "error",
                        "message": response.message
                    })
                    error_count += 1
                    
            except Exception as e:
                results.append({
                    "customer_id": customer['id'],
                    "status": "error",
                    "message": str(e)
                })
                error_count += 1
        
        return {
            "success": True,
            "total_customers": len(customers),
            "success_count": success_count,
            "error_count": error_count,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Bulk sync failed: {str(e)}"
        )
