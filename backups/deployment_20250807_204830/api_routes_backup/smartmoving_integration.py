"""
SmartMoving API Integration
C&C CRM - SmartMoving Integration for Lead Management and Operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx
import json
import logging
from pydantic import BaseModel, Field

from ..middleware.auth import get_current_user
from ..middleware.tenant import get_tenant_context

router = APIRouter(prefix="/smartmoving", tags=["SmartMoving Integration"])

# Configure logging
logger = logging.getLogger(__name__)

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api.smartmoving.com"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"
SMARTMOVING_PROVIDER_KEY = "c_and_c_crm_provider"  # Custom provider key for C&C CRM

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
    Quantity: int = 1

class SmartMovingCustomField(BaseModel):
    FieldName: str
    FieldValue: str

class SmartMovingLeadRequest(BaseModel):
    FullName: Optional[str] = None
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    Email: Optional[str] = None
    Phone: Optional[str] = None
    MoveDate: Optional[str] = None
    MoveSize: Optional[str] = None
    ServiceType: Optional[str] = None
    ReferralSource: Optional[str] = None
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

class SmartMovingConnectionTest(BaseModel):
    api_key: str = Field(default=SMARTMOVING_API_KEY)
    client_id: str = Field(default=SMARTMOVING_CLIENT_ID)
    test_type: str = Field(default="connection")

# ===== HELPER FUNCTIONS =====

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "Authorization": f"Bearer {SMARTMOVING_API_KEY}",
        "X-Client-ID": SMARTMOVING_CLIENT_ID,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

async def make_smartmoving_request(
    method: str, 
    endpoint: str, 
    data: Optional[Dict] = None,
    params: Optional[Dict] = None
) -> Dict[str, Any]:
    """Make a request to SmartMoving API"""
    headers = await get_smartmoving_headers()
    url = f"{SMARTMOVING_API_BASE_URL}{endpoint}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = await client.post(url, headers=headers, json=data, params=params)
            elif method.upper() == "PUT":
                response = await client.put(url, headers=headers, json=data, params=params)
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=headers, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json() if response.content else None,
                "headers": dict(response.headers)
            }
            
    except httpx.HTTPStatusError as e:
        logger.error(f"SmartMoving API HTTP error: {e.response.status_code} - {e.response.text}")
        return {
            "success": False,
            "status_code": e.response.status_code,
            "error": f"HTTP {e.response.status_code}",
            "message": e.response.text,
            "data": e.response.json() if e.response.content else None
        }
    except httpx.RequestError as e:
        logger.error(f"SmartMoving API request error: {str(e)}")
        return {
            "success": False,
            "status_code": 0,
            "error": "RequestError",
            "message": str(e)
        }
    except Exception as e:
        logger.error(f"SmartMoving API unexpected error: {str(e)}")
        return {
            "success": False,
            "status_code": 0,
            "error": "UnexpectedError",
            "message": str(e)
        }

# ===== CONNECTION TESTING ENDPOINTS =====

@router.post("/test-connection")
async def test_smartmoving_connection(
    test_data: SmartMovingConnectionTest,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Test connection to SmartMoving API"""
    
    logger.info(f"Testing SmartMoving API connection for client: {tenant['client_id']}")
    
    # Test 1: Basic API connectivity
    connectivity_test = await make_smartmoving_request("GET", "/api/health")
    
    # Test 2: Authentication
    auth_test = await make_smartmoving_request("GET", "/api/auth/verify")
    
    # Test 3: Get account information
    account_test = await make_smartmoving_request("GET", "/api/account")
    
    # Test 4: Get leads (if accessible)
    leads_test = await make_smartmoving_request("GET", "/api/leads", params={"limit": 1})
    
    # Compile test results
    test_results = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "client_id": tenant["client_id"],
        "location_id": tenant["location_id"],
        "user_id": current_user["id"],
        "api_key": test_data.api_key[:8] + "..." if test_data.api_key else "Not provided",
        "client_id_provided": test_data.client_id[:8] + "..." if test_data.client_id else "Not provided",
        "tests": {
            "connectivity": {
                "test": "Basic API connectivity",
                "endpoint": "/api/health",
                "result": connectivity_test
            },
            "authentication": {
                "test": "API authentication",
                "endpoint": "/api/auth/verify",
                "result": auth_test
            },
            "account_info": {
                "test": "Account information retrieval",
                "endpoint": "/api/account",
                "result": account_test
            },
            "leads_access": {
                "test": "Leads API access",
                "endpoint": "/api/leads",
                "result": leads_test
            }
        }
    }
    
    # Determine overall connection status
    all_tests_passed = all(
        test["result"]["success"] 
        for test in test_results["tests"].values()
    )
    
    test_results["overall_status"] = "connected" if all_tests_passed else "partial" if any(
        test["result"]["success"] 
        for test in test_results["tests"].values()
    ) else "failed"
    
    test_results["summary"] = {
        "total_tests": len(test_results["tests"]),
        "passed_tests": sum(1 for test in test_results["tests"].values() if test["result"]["success"]),
        "failed_tests": sum(1 for test in test_results["tests"].values() if not test["result"]["success"])
    }
    
    # Log the test results
    logger.info(f"SmartMoving connection test completed: {test_results['overall_status']}")
    
    return {
        "success": True,
        "message": f"SmartMoving API connection test completed. Status: {test_results['overall_status']}",
        "data": test_results
    }

@router.get("/connection-status")
async def get_connection_status(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Get current SmartMoving API connection status"""
    
    # Quick health check
    health_check = await make_smartmoving_request("GET", "/api/health")
    
    status_info = {
        "connected": health_check["success"],
        "last_check": datetime.utcnow().isoformat() + "Z",
        "api_endpoint": SMARTMOVING_API_BASE_URL,
        "client_id": tenant["client_id"],
        "status_code": health_check.get("status_code", 0),
        "response_time": "N/A"  # Could be enhanced with timing
    }
    
    if not health_check["success"]:
        status_info["error"] = health_check.get("error", "Unknown error")
        status_info["message"] = health_check.get("message", "Connection failed")
    
    return {
        "success": True,
        "data": status_info
    }

# ===== LEAD MANAGEMENT ENDPOINTS =====

@router.post("/leads/submit")
async def submit_lead_to_smartmoving(
    lead_data: SmartMovingLeadRequest,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Submit a lead to SmartMoving via their Lead API"""
    
    logger.info(f"Submitting lead to SmartMoving for client: {tenant['client_id']}")
    
    # Prepare the lead data
    lead_payload = lead_data.dict(exclude_none=True)
    
    # Add C&C CRM metadata
    lead_payload["CustomFields"] = lead_payload.get("CustomFields", [])
    lead_payload["CustomFields"].extend([
        {"FieldName": "C&C CRM Client ID", "FieldValue": tenant["client_id"]},
        {"FieldName": "C&C CRM Location ID", "FieldValue": tenant["location_id"]},
        {"FieldName": "C&C CRM User ID", "FieldValue": current_user["id"]},
        {"FieldName": "C&C CRM Submission Date", "FieldValue": datetime.utcnow().isoformat() + "Z"}
    ])
    
    # Set default referral source if not provided
    if not lead_payload.get("ReferralSource"):
        lead_payload["ReferralSource"] = "C&C CRM Integration"
    
    # Submit to SmartMoving Lead API
    endpoint = f"/api/leads/from-provider/v2"
    params = {"providerKey": SMARTMOVING_PROVIDER_KEY}
    
    result = await make_smartmoving_request("POST", endpoint, data=lead_payload, params=params)
    
    if result["success"]:
        logger.info(f"Lead successfully submitted to SmartMoving. Response: {result['data']}")
        
        # Create audit entry for the submission
        audit_entry = {
            "action": "smartmoving_lead_submitted",
            "entity": "lead",
            "entity_id": result["data"].get("lead_id", "unknown"),
            "data": {
                "smartmoving_response": result["data"],
                "lead_data": lead_payload,
                "submitted_by": current_user["id"],
                "client_id": tenant["client_id"],
                "location_id": tenant["location_id"]
            }
        }
        
        return {
            "success": True,
            "message": "Lead successfully submitted to SmartMoving",
            "data": {
                "lead_id": result["data"].get("lead_id"),
                "smartmoving_response": result["data"],
                "submitted_at": datetime.utcnow().isoformat() + "Z",
                "audit_entry": audit_entry
            }
        }
    else:
        logger.error(f"Failed to submit lead to SmartMoving: {result}")
        
        return {
            "success": False,
            "error": result.get("error", "Submission failed"),
            "message": result.get("message", "Failed to submit lead to SmartMoving"),
            "data": {
                "smartmoving_response": result,
                "attempted_at": datetime.utcnow().isoformat() + "Z"
            }
        }

@router.get("/leads")
async def get_smartmoving_leads(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Get leads from SmartMoving API"""
    
    params = {
        "limit": min(limit, 100),  # Cap at 100
        "offset": offset
    }
    
    if status:
        params["status"] = status
    
    result = await make_smartmoving_request("GET", "/api/leads", params=params)
    
    if result["success"]:
        return {
            "success": True,
            "data": result["data"],
            "message": f"Retrieved {len(result['data'].get('leads', []))} leads from SmartMoving"
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Failed to retrieve leads"),
            "message": result.get("message", "Could not fetch leads from SmartMoving")
        }

# ===== WEBHOOK MANAGEMENT ENDPOINTS =====

@router.post("/webhooks/configure")
async def configure_smartmoving_webhook(
    webhook_url: str,
    events: List[str],
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Configure webhook for SmartMoving events"""
    
    webhook_config = {
        "url": webhook_url,
        "events": events,
        "headers": {
            "X-C&C-CRM-Client-ID": tenant["client_id"],
            "X-C&C-CRM-Location-ID": tenant["location_id"],
            "X-C&C-CRM-User-ID": current_user["id"]
        },
        "active": True
    }
    
    result = await make_smartmoving_request("POST", "/api/webhooks", data=webhook_config)
    
    if result["success"]:
        return {
            "success": True,
            "message": "Webhook configured successfully",
            "data": result["data"]
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Failed to configure webhook"),
            "message": result.get("message", "Could not configure SmartMoving webhook")
        }

@router.get("/webhooks")
async def get_smartmoving_webhooks(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Get configured webhooks from SmartMoving"""
    
    result = await make_smartmoving_request("GET", "/api/webhooks")
    
    if result["success"]:
        return {
            "success": True,
            "data": result["data"],
            "message": "Webhooks retrieved successfully"
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Failed to retrieve webhooks"),
            "message": result.get("message", "Could not fetch webhooks from SmartMoving")
        }

# ===== ACCOUNT INFORMATION ENDPOINTS =====

@router.get("/account")
async def get_smartmoving_account_info(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Get SmartMoving account information"""
    
    result = await make_smartmoving_request("GET", "/api/account")
    
    if result["success"]:
        return {
            "success": True,
            "data": result["data"],
            "message": "Account information retrieved successfully"
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Failed to retrieve account info"),
            "message": result.get("message", "Could not fetch account information from SmartMoving")
        }

# ===== INTEGRATION STATUS ENDPOINT =====

@router.get("/status")
async def get_integration_status(
    current_user: Dict = Depends(get_current_user),
    tenant: Dict = Depends(get_tenant_context)
) -> Dict[str, Any]:
    """Get comprehensive SmartMoving integration status"""
    
    # Test connection
    connection_test = await test_smartmoving_connection(
        SmartMovingConnectionTest(),
        current_user,
        tenant
    )
    
    # Get account info
    account_info = await get_smartmoving_account_info(current_user, tenant)
    
    # Get webhooks
    webhooks = await get_smartmoving_webhooks(current_user, tenant)
    
    status_summary = {
        "integration_name": "SmartMoving API",
        "version": "1.0.0",
        "client_id": tenant["client_id"],
        "location_id": tenant["location_id"],
        "api_endpoint": SMARTMOVING_API_BASE_URL,
        "connection_status": connection_test["data"]["overall_status"],
        "last_checked": datetime.utcnow().isoformat() + "Z",
        "features": {
            "lead_submission": True,
            "lead_retrieval": True,
            "webhook_support": True,
            "account_management": True
        },
        "connection_test": connection_test["data"],
        "account_info": account_info["data"] if account_info["success"] else None,
        "webhooks": webhooks["data"] if webhooks["success"] else None
    }
    
    return {
        "success": True,
        "data": status_summary,
        "message": f"SmartMoving integration status: {status_summary['connection_status']}"
    }
