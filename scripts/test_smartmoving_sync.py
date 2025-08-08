#!/usr/bin/env python3
"""
🧪 Test SmartMoving Sync Script
================================

This script tests the SmartMoving sync service to verify it can pull real job data.
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from apps.api.services.smartmoving_sync_service import SmartMovingSyncService

async def test_smartmoving_connection():
    """Test basic SmartMoving API connection"""
    print("🔍 Testing SmartMoving API connection...")
    
    async with SmartMovingSyncService() as sync_service:
        # Test API connection
        headers = await sync_service.get_smartmoving_headers()
        print(f"✅ SmartMoving headers: {headers}")
        
        # Test basic API call
        response = await sync_service.make_smartmoving_request("GET", "/api/health")
        print(f"✅ SmartMoving health check: {response}")
        
        return response["success"]

async def test_smartmoving_jobs_pull():
    """Test pulling jobs from SmartMoving"""
    print("\n📅 Testing SmartMoving jobs pull...")
    
    async with SmartMovingSyncService() as sync_service:
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Test today's jobs
        print(f"🔍 Pulling jobs for today ({today})...")
        today_jobs = await sync_service.pull_smartmoving_jobs(today)
        print(f"✅ Today's jobs result: {today_jobs}")
        
        # Test tomorrow's jobs
        print(f"🔍 Pulling jobs for tomorrow ({tomorrow})...")
        tomorrow_jobs = await sync_service.pull_smartmoving_jobs(tomorrow)
        print(f"✅ Tomorrow's jobs result: {tomorrow_jobs}")
        
        return today_jobs["success"] or tomorrow_jobs["success"]

async def test_smartmoving_sync():
    """Test full SmartMoving sync process"""
    print("\n🔄 Testing SmartMoving sync process...")
    
    async with SmartMovingSyncService() as sync_service:
        # Run full sync
        sync_result = await sync_service.sync_today_and_tomorrow_jobs()
        print(f"✅ Sync result: {sync_result}")
        
        # Get sync status
        status = await sync_service.get_sync_status()
        print(f"✅ Sync status: {status}")
        
        return sync_result.get("summary", {}).get("totalProcessed", 0) > 0

async def test_database_journeys():
    """Test fetching journeys from database after sync"""
    print("\n🗄️ Testing database journeys after sync...")
    
    async with SmartMovingSyncService() as sync_service:
        # Count journeys in database
        journey_count = await sync_service.db.truckjourney.count()
        print(f"✅ Total journeys in database: {journey_count}")
        
        if journey_count > 0:
            # Get sample journeys
            journeys = await sync_service.db.truckjourney.find_many(
                take=5,
                order={"createdAt": "desc"}
            )
            
            print("📋 Sample journeys:")
            for journey in journeys:
                print(f"   - {journey.id}: {journey.status} on {journey.date}")
        
        return journey_count > 0

async def main():
    """Main test function"""
    print("🧪 SmartMoving Sync Test")
    print("=" * 50)
    
    tests = [
        ("API Connection", test_smartmoving_connection),
        ("Jobs Pull", test_smartmoving_jobs_pull),
        ("Full Sync", test_smartmoving_sync),
        ("Database Journeys", test_database_journeys),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        try:
            if await test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"💥 {test_name} ERROR: {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ ALL TESTS PASSED!")
        print("🚀 SmartMoving sync is working correctly!")
    else:
        print("⚠️  Some tests failed - check the details above")
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1) 