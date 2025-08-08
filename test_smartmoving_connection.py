#!/usr/bin/env python3
"""
SmartMoving API Connection Test
Test script to verify SmartMoving API integration with C&C CRM
"""

import asyncio
import httpx
import json
from datetime import datetime
from typing import Dict, Any

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api.smartmoving.com"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"
SMARTMOVING_PROVIDER_KEY = "c_and_c_crm_provider"

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "Authorization": f"Bearer {SMARTMOVING_API_KEY}",
        "X-Client-ID": SMARTMOVING_CLIENT_ID,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

async def test_smartmoving_endpoint(method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Dict[str, Any]:
    """Test a specific SmartMoving API endpoint"""
    headers = await get_smartmoving_headers()
    url = f"{SMARTMOVING_API_BASE_URL}{endpoint}"
    
    print(f"\n🔍 Testing {method.upper()} {endpoint}")
    print(f"   URL: {url}")
    print(f"   Headers: {json.dumps(headers, indent=2)}")
    
    if data:
        print(f"   Data: {json.dumps(data, indent=2)}")
    if params:
        print(f"   Params: {json.dumps(params, indent=2)}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = await client.post(url, headers=headers, json=data, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            print(f"   Status Code: {response.status_code}")
            print(f"   Response Headers: {dict(response.headers)}")
            
            if response.content:
                try:
                    response_data = response.json()
                    print(f"   Response Data: {json.dumps(response_data, indent=2)}")
                except json.JSONDecodeError:
                    print(f"   Response Text: {response.text}")
            
            response.raise_for_status()
            
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json() if response.content else None,
                "headers": dict(response.headers)
            }
            
    except httpx.HTTPStatusError as e:
        print(f"   ❌ HTTP Error: {e.response.status_code} - {e.response.text}")
        return {
            "success": False,
            "status_code": e.response.status_code,
            "error": f"HTTP {e.response.status_code}",
            "message": e.response.text,
            "data": e.response.json() if e.response.content else None
        }
    except httpx.RequestError as e:
        print(f"   ❌ Request Error: {str(e)}")
        return {
            "success": False,
            "status_code": 0,
            "error": "RequestError",
            "message": str(e)
        }
    except Exception as e:
        print(f"   ❌ Unexpected Error: {str(e)}")
        return {
            "success": False,
            "status_code": 0,
            "error": "UnexpectedError",
            "message": str(e)
        }

async def test_smartmoving_connection():
    """Comprehensive SmartMoving API connection test"""
    
    print("🚀 SmartMoving API Connection Test")
    print("=" * 50)
    print(f"API Base URL: {SMARTMOVING_API_BASE_URL}")
    print(f"API Key: {SMARTMOVING_API_KEY[:8]}...")
    print(f"Client ID: {SMARTMOVING_CLIENT_ID[:8]}...")
    print(f"Provider Key: {SMARTMOVING_PROVIDER_KEY}")
    print(f"Test Time: {datetime.utcnow().isoformat()}Z")
    print("=" * 50)
    
    test_results = {}
    
    # Test 1: Basic API connectivity (health check)
    print("\n📡 Test 1: Basic API Connectivity")
    test_results["health"] = await test_smartmoving_endpoint("GET", "/api/health")
    
    # Test 2: Authentication verification
    print("\n🔐 Test 2: Authentication Verification")
    test_results["auth"] = await test_smartmoving_endpoint("GET", "/api/auth/verify")
    
    # Test 3: Account information
    print("\n👤 Test 3: Account Information")
    test_results["account"] = await test_smartmoving_endpoint("GET", "/api/account")
    
    # Test 4: Get leads (if accessible)
    print("\n📋 Test 4: Leads API Access")
    test_results["leads"] = await test_smartmoving_endpoint("GET", "/api/leads", params={"limit": 1})
    
    # Test 5: Webhooks (if accessible)
    print("\n🔗 Test 5: Webhooks API Access")
    test_results["webhooks"] = await test_smartmoving_endpoint("GET", "/api/webhooks")
    
    # Test 6: Lead submission (test with sample data)
    print("\n📤 Test 6: Lead Submission")
    sample_lead = {
        "FullName": "Test Customer",
        "FirstName": "Test",
        "LastName": "Customer",
        "Email": "test@example.com",
        "Phone": "+1-416-555-0123",
        "MoveDate": "2025-08-20T09:00:00Z",
        "MoveSize": "2 Bedroom Apartment",
        "ServiceType": "Full Service Move",
        "ReferralSource": "C&C CRM Integration Test",
        "Notes": "Test lead from C&C CRM integration",
        "OriginAddress": {
            "Street1": "123 Test Street",
            "City": "Toronto",
            "State": "ON",
            "PostalCode": "M5J2N1",
            "Country": "Canada"
        },
        "DestinationAddress": {
            "Street1": "456 Test Avenue",
            "City": "Ottawa",
            "State": "ON",
            "PostalCode": "K1A0B1",
            "Country": "Canada"
        },
        "CustomFields": [
            {"FieldName": "C&C CRM Test", "FieldValue": "Integration Test"},
            {"FieldName": "Test Date", "FieldValue": datetime.utcnow().isoformat() + "Z"}
        ]
    }
    
    test_results["lead_submission"] = await test_smartmoving_endpoint(
        "POST", 
        "/api/leads/from-provider/v2", 
        data=sample_lead,
        params={"providerKey": SMARTMOVING_PROVIDER_KEY}
    )
    
    # Compile and display results
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    total_tests = len(test_results)
    passed_tests = sum(1 for result in test_results.values() if result["success"])
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print("\n📋 Detailed Results:")
    for test_name, result in test_results.items():
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"  {status} {test_name.upper()}")
        if not result["success"]:
            print(f"    Error: {result.get('error', 'Unknown error')}")
            print(f"    Message: {result.get('message', 'No message')}")
    
    # Determine overall connection status
    if passed_tests == total_tests:
        overall_status = "🟢 FULLY CONNECTED"
    elif passed_tests > 0:
        overall_status = "🟡 PARTIALLY CONNECTED"
    else:
        overall_status = "🔴 NOT CONNECTED"
    
    print(f"\n🎯 Overall Status: {overall_status}")
    
    # Save results to file
    results_file = f"smartmoving_test_results_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            "test_timestamp": datetime.utcnow().isoformat() + "Z",
            "api_config": {
                "base_url": SMARTMOVING_API_BASE_URL,
                "api_key": SMARTMOVING_API_KEY[:8] + "...",
                "client_id": SMARTMOVING_CLIENT_ID[:8] + "...",
                "provider_key": SMARTMOVING_PROVIDER_KEY
            },
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": (passed_tests/total_tests)*100,
                "overall_status": overall_status
            },
            "detailed_results": test_results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to: {results_file}")
    
    return test_results

async def test_smartmoving_lead_api_specifically():
    """Test SmartMoving Lead API specifically based on their documentation"""
    
    print("\n🎯 SmartMoving Lead API Specific Test")
    print("=" * 50)
    
    # Test the exact endpoint from their documentation
    lead_api_url = f"{SMARTMOVING_API_BASE_URL}/api/leads/from-provider/v2"
    
    # Sample lead data based on their documentation
    sample_lead = {
        "FullName": "John Doe",
        "FirstName": "John",
        "LastName": "Doe",
        "Email": "john.doe@example.com",
        "Phone": "+1-416-555-0123",
        "MoveDate": "2025-08-20T09:00:00Z",
        "MoveSize": "3 Bedroom House",
        "ServiceType": "Full Service Move",
        "ReferralSource": "Website Contact Form",
        "Notes": "Customer prefers morning start, has a large piano to move.",
        "OriginAddress": {
            "Street1": "123 Main Street",
            "Street2": "Unit 4",
            "City": "Toronto",
            "State": "ON",
            "PostalCode": "M5J2N1",
            "Country": "Canada"
        },
        "DestinationAddress": {
            "Street1": "456 Oak Avenue",
            "Street2": "",
            "City": "Ottawa",
            "State": "ON",
            "PostalCode": "K1A0B1",
            "Country": "Canada"
        },
        "InventoryList": [
            {"ItemName": "Sofa", "Quantity": 2},
            {"ItemName": "King Bed", "Quantity": 1},
            {"ItemName": "Dining Table", "Quantity": 1},
            {"ItemName": "Piano", "Quantity": 1}
        ],
        "PreferredContactMethod": "Phone",
        "BestTimeToCall": "Afternoon",
        "EstimatedWeightLbs": 6500,
        "PackingRequired": True,
        "StorageRequired": False,
        "CustomFields": [
            {"FieldName": "Customer Budget", "FieldValue": "$4500"},
            {"FieldName": "Lead Priority", "FieldValue": "High"},
            {"FieldName": "C&C CRM Integration", "FieldValue": "Test Lead"}
        ]
    }
    
    headers = await get_smartmoving_headers()
    params = {"providerKey": SMARTMOVING_PROVIDER_KEY}
    
    print(f"Testing Lead API endpoint: {lead_api_url}")
    print(f"Provider Key: {SMARTMOVING_PROVIDER_KEY}")
    print(f"Sample Lead Data: {json.dumps(sample_lead, indent=2)}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                lead_api_url,
                headers=headers,
                json=sample_lead,
                params=params
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.content:
                try:
                    response_data = response.json()
                    print(f"Response Data: {json.dumps(response_data, indent=2)}")
                except json.JSONDecodeError:
                    print(f"Response Text: {response.text}")
            
            response.raise_for_status()
            
            print("✅ Lead API test successful!")
            return True
            
    except Exception as e:
        print(f"❌ Lead API test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting SmartMoving API Connection Tests...")
    
    async def main():
        # Run comprehensive connection test
        await test_smartmoving_connection()
        
        # Run specific Lead API test
        await test_smartmoving_lead_api_specifically()
        
        print("\n🎉 SmartMoving API testing completed!")
    
    asyncio.run(main())
