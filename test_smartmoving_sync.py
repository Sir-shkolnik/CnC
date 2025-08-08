#!/usr/bin/env python3
"""
Test SmartMoving Sync
Purpose: Test the SmartMoving sync system and populate our database with real data
"""

import asyncio
import httpx
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "x-api-key": SMARTMOVING_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

async def test_smartmoving_api():
    """Test SmartMoving API connection and get sample data"""
    print("🔗 Testing SmartMoving API Connection")
    print("=" * 50)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = await get_smartmoving_headers()
            
            # Test ping
            response = await client.get(f"{SMARTMOVING_API_BASE_URL}/api/ping", headers=headers)
            if response.status_code == 200:
                print("✅ SmartMoving API connection successful")
            else:
                print(f"❌ SmartMoving API connection failed: {response.status_code}")
                return False
            
            # Get today's customers
            today = datetime.now().strftime("%Y%m%d")
            params = {
                "FromServiceDate": int(today),
                "ToServiceDate": int(today),
                "IncludeOpportunityInfo": True,
                "Page": 1,
                "PageSize": 10
            }
            
            response = await client.get(
                f"{SMARTMOVING_API_BASE_URL}/api/customers",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                customers = data.get('pageResults', [])
                print(f"✅ Found {len(customers)} customers for today")
                
                if customers:
                    # Show first customer details
                    first_customer = customers[0]
                    print(f"\n📋 Sample Customer:")
                    print(f"  Name: {first_customer.get('name', 'N/A')}")
                    print(f"  Phone: {first_customer.get('phoneNumber', 'N/A')}")
                    print(f"  Email: {first_customer.get('emailAddress', 'N/A')}")
                    
                    opportunities = first_customer.get('opportunities', [])
                    print(f"  Opportunities: {len(opportunities)}")
                    
                    if opportunities:
                        first_opportunity = opportunities[0]
                        print(f"    Quote #: {first_opportunity.get('quoteNumber', 'N/A')}")
                        print(f"    Status: {first_opportunity.get('status', 'N/A')}")
                        
                        jobs = first_opportunity.get('jobs', [])
                        print(f"    Jobs: {len(jobs)}")
                        
                        if jobs:
                            first_job = jobs[0]
                            print(f"      Job #: {first_job.get('jobNumber', 'N/A')}")
                            print(f"      Service Date: {first_job.get('serviceDate', 'N/A')}")
                            print(f"      Type: {first_job.get('type', 'N/A')}")
                
                return True
            else:
                print(f"❌ Failed to get customers: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Error testing SmartMoving API: {e}")
        return False

async def test_crm_api():
    """Test our CRM API endpoints"""
    print("\n🔗 Testing C&C CRM API")
    print("=" * 50)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test health endpoint
            response = await client.get("https://c-and-c-crm-api.onrender.com/health")
            if response.status_code == 200:
                print("✅ C&C CRM API health check successful")
            else:
                print(f"❌ C&C CRM API health check failed: {response.status_code}")
                return False
            
            # Test SmartMoving endpoints (should require auth)
            response = await client.get("https://c-and-c-crm-api.onrender.com/smartmoving/journeys/active")
            if response.status_code == 401:
                print("✅ SmartMoving endpoints require authentication (correct)")
            else:
                print(f"⚠️ SmartMoving endpoints returned: {response.status_code}")
            
            return True
            
    except Exception as e:
        print(f"❌ Error testing C&C CRM API: {e}")
        return False

async def trigger_smartmoving_sync():
    """Trigger SmartMoving sync via our API"""
    print("\n🔄 Triggering SmartMoving Sync")
    print("=" * 50)
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # This would require authentication, but let's test the endpoint
            response = await client.post("https://c-and-c-crm-api.onrender.com/smartmoving/sync/automated/trigger")
            print(f"Sync trigger response: {response.status_code}")
            
            if response.status_code == 401:
                print("✅ Sync endpoint requires authentication (correct)")
            else:
                print(f"⚠️ Unexpected response: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"Sync result: {data}")
            
    except Exception as e:
        print(f"❌ Error triggering sync: {e}")

async def main():
    """Main test function"""
    print("🚀 SmartMoving Sync Test")
    print(f"Time: {datetime.now(timezone.utc).isoformat()}Z")
    print("=" * 60)
    
    # Test SmartMoving API
    smartmoving_ok = await test_smartmoving_api()
    
    # Test CRM API
    crm_ok = await test_crm_api()
    
    # Trigger sync
    await trigger_smartmoving_sync()
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"SmartMoving API: {'✅ OK' if smartmoving_ok else '❌ FAILED'}")
    print(f"C&C CRM API: {'✅ OK' if crm_ok else '❌ FAILED'}")
    
    if smartmoving_ok and crm_ok:
        print("\n🎉 Both APIs are working correctly!")
        print("Next steps:")
        print("1. Authenticate with the CRM API")
        print("2. Trigger SmartMoving sync")
        print("3. Check journey data in the database")
    else:
        print("\n❌ Some tests failed. Check the logs above.")

if __name__ == "__main__":
    asyncio.run(main()) 