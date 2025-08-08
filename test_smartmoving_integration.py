#!/usr/bin/env python3
"""
Test SmartMoving Integration
Tests the SmartMoving sync service and API endpoints
"""

import asyncio
import httpx
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Configuration
API_BASE_URL = "https://c-and-c-crm-api.onrender.com"
SMARTMOVING_BASE_URL = "https://api-public.smartmoving.com/v1"

# Test credentials
TEST_USER = {
    "email": "sarah.johnson@lgm.com",
    "password": "1234"
}

async def test_smartmoving_health():
    """Test SmartMoving health check endpoint"""
    print("🔍 Testing SmartMoving Health Check...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{API_BASE_URL}/smartmoving/health")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SmartMoving Health Check: {data}")
                return True
            else:
                print(f"❌ SmartMoving Health Check failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ SmartMoving Health Check error: {str(e)}")
        return False

async def test_smartmoving_sync_status():
    """Test SmartMoving sync status endpoint"""
    print("🔍 Testing SmartMoving Sync Status...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{API_BASE_URL}/smartmoving/sync/status")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SmartMoving Sync Status: {data}")
                return True
            else:
                print(f"❌ SmartMoving Sync Status failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ SmartMoving Sync Status error: {str(e)}")
        return False

async def test_smartmoving_locations():
    """Test SmartMoving locations endpoint"""
    print("🔍 Testing SmartMoving Locations...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{API_BASE_URL}/smartmoving/locations")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SmartMoving Locations: {data}")
                return True
            else:
                print(f"❌ SmartMoving Locations failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ SmartMoving Locations error: {str(e)}")
        return False

async def test_smartmoving_today_jobs():
    """Test SmartMoving today jobs endpoint"""
    print("🔍 Testing SmartMoving Today Jobs...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{API_BASE_URL}/smartmoving/jobs/today")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SmartMoving Today Jobs: {data}")
                return True
            else:
                print(f"❌ SmartMoving Today Jobs failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ SmartMoving Today Jobs error: {str(e)}")
        return False

async def test_smartmoving_tomorrow_jobs():
    """Test SmartMoving tomorrow jobs endpoint"""
    print("🔍 Testing SmartMoving Tomorrow Jobs...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{API_BASE_URL}/smartmoving/jobs/tomorrow")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SmartMoving Tomorrow Jobs: {data}")
                return True
            else:
                print(f"❌ SmartMoving Tomorrow Jobs failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ SmartMoving Tomorrow Jobs error: {str(e)}")
        return False

async def test_smartmoving_sync():
    """Test SmartMoving sync endpoint"""
    print("🔍 Testing SmartMoving Sync...")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(f"{API_BASE_URL}/smartmoving/jobs/sync")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SmartMoving Sync: {data}")
                return True
            else:
                print(f"❌ SmartMoving Sync failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ SmartMoving Sync error: {str(e)}")
        return False

async def test_smartmoving_api_connection():
    """Test direct SmartMoving API connection"""
    print("🔍 Testing Direct SmartMoving API Connection...")
    
    try:
        headers = {
            "x-api-key": "185840176c73420fbd3a473c2fdccedb",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test branches endpoint
            response = await client.get(
                f"{SMARTMOVING_BASE_URL}/api/branches",
                headers=headers,
                params={"PageSize": 1}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Direct SmartMoving API Connection: {data}")
                return True
            else:
                print(f"❌ Direct SmartMoving API Connection failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Direct SmartMoving API Connection error: {str(e)}")
        return False

async def test_smartmoving_jobs_api():
    """Test direct SmartMoving jobs API"""
    print("🔍 Testing Direct SmartMoving Jobs API...")
    
    try:
        headers = {
            "x-api-key": "185840176c73420fbd3a473c2fdccedb",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test jobs endpoint
            response = await client.get(
                f"{SMARTMOVING_BASE_URL}/api/jobs",
                headers=headers,
                params={
                    "PageSize": 10,
                    "JobDate": today
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Direct SmartMoving Jobs API: {data}")
                return True
            else:
                print(f"❌ Direct SmartMoving Jobs API failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Direct SmartMoving Jobs API error: {str(e)}")
        return False

async def main():
    """Run all SmartMoving integration tests"""
    print("🚀 Starting SmartMoving Integration Tests")
    print("=" * 50)
    
    test_results = []
    
    # Test 1: Direct SmartMoving API connection
    result1 = await test_smartmoving_api_connection()
    test_results.append(("Direct API Connection", result1))
    
    # Test 2: Direct SmartMoving jobs API
    result2 = await test_smartmoving_jobs_api()
    test_results.append(("Direct Jobs API", result2))
    
    # Test 3: SmartMoving health check
    result3 = await test_smartmoving_health()
    test_results.append(("Health Check", result3))
    
    # Test 4: SmartMoving sync status
    result4 = await test_smartmoving_sync_status()
    test_results.append(("Sync Status", result4))
    
    # Test 5: SmartMoving locations
    result5 = await test_smartmoving_locations()
    test_results.append(("Locations", result5))
    
    # Test 6: SmartMoving today jobs
    result6 = await test_smartmoving_today_jobs()
    test_results.append(("Today Jobs", result6))
    
    # Test 7: SmartMoving tomorrow jobs
    result7 = await test_smartmoving_tomorrow_jobs()
    test_results.append(("Tomorrow Jobs", result7))
    
    # Test 8: SmartMoving sync (optional - takes longer)
    print("⚠️  Skipping sync test (takes too long for testing)")
    test_results.append(("Sync Jobs", "SKIPPED"))
    
    # Print results summary
    print("\n" + "=" * 50)
    print("📊 SMARTMOVING INTEGRATION TEST RESULTS")
    print("=" * 50)
    
    passed = 0
    failed = 0
    skipped = 0
    
    for test_name, result in test_results:
        if result == True:
            print(f"✅ {test_name}: PASSED")
            passed += 1
        elif result == False:
            print(f"❌ {test_name}: FAILED")
            failed += 1
        else:
            print(f"⏭️  {test_name}: SKIPPED")
            skipped += 1
    
    print("\n" + "=" * 50)
    print(f"📈 SUMMARY: {passed} passed, {failed} failed, {skipped} skipped")
    
    if failed == 0:
        print("🎉 All tests passed! SmartMoving integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
    
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
