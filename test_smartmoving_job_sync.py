#!/usr/bin/env python3
"""
Test SmartMoving Job Sync
=========================

Test script to verify SmartMoving job synchronization functionality
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from apps.api.services.smartmoving_job_sync_service import SmartMovingJobSyncService

async def test_smartmoving_connection():
    """Test SmartMoving API connection"""
    print("🔗 Testing SmartMoving API connection...")
    
    try:
        async with SmartMovingJobSyncService() as sync_service:
            customers = await sync_service.fetch_smartmoving_jobs()
            
            print(f"✅ Connection successful! Found {len(customers)} customers")
            
            if customers:
                sample_customer = customers[0]
                print(f"📋 Sample customer: {sample_customer.get('name', 'N/A')}")
                print(f"📧 Email: {sample_customer.get('emailAddress', 'N/A')}")
                print(f"📞 Phone: {sample_customer.get('phoneNumber', 'N/A')}")
                
                opportunities = sample_customer.get('opportunities', [])
                print(f"💼 Opportunities: {len(opportunities)}")
                
                if opportunities:
                    sample_opp = opportunities[0]
                    print(f"📊 Quote: {sample_opp.get('quoteNumber', 'N/A')}")
                    print(f"📅 Service Date: {sample_opp.get('serviceDate', 'N/A')}")
                    
                    jobs = sample_opp.get('jobs', [])
                    print(f"🚚 Jobs: {len(jobs)}")
                    
                    if jobs:
                        sample_job = jobs[0]
                        print(f"🔢 Job Number: {sample_job.get('jobNumber', 'N/A')}")
                        print(f"📍 Job Type: {sample_job.get('type', 'N/A')}")
                        print(f"✅ Confirmed: {sample_job.get('confirmed', 'N/A')}")
            
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

async def test_job_sync():
    """Test job synchronization"""
    print("\n🔄 Testing SmartMoving job sync...")
    
    # Use a test client ID (you'll need to replace this with a real one)
    test_client_id = "test_client_001"
    
    try:
        async with SmartMovingJobSyncService() as sync_service:
            # Test today's jobs sync
            result = await sync_service.sync_today_jobs(test_client_id)
            
            print(f"📊 Sync result: {result['success']}")
            print(f"💬 Message: {result.get('message', 'No message')}")
            
            if 'stats' in result:
                stats = result['stats']
                print(f"👥 Customers processed: {stats.get('customers_processed', 0)}")
                print(f"👤 Customers created: {stats.get('customers_created', 0)}")
                print(f"📋 Leads processed: {stats.get('leads_processed', 0)}")
                print(f"📝 Leads created: {stats.get('leads_created', 0)}")
                print(f"🚚 Journeys processed: {stats.get('journeys_processed', 0)}")
                print(f"🆕 Journeys created: {stats.get('journeys_created', 0)}")
                print(f"❌ Errors: {stats.get('errors', 0)}")
            
            return result['success']
            
    except Exception as e:
        print(f"❌ Job sync failed: {str(e)}")
        return False

async def test_data_structures():
    """Test data structure conversions"""
    print("\n🔧 Testing data structure conversions...")
    
    try:
        async with SmartMovingJobSyncService() as sync_service:
            # Test date conversion
            test_date_int = 20250807
            converted_date = sync_service.convert_smartmoving_date(test_date_int)
            print(f"📅 Date conversion: {test_date_int} -> {converted_date}")
            
            # Test name extraction
            test_names = [
                "John Doe",
                "Jane Smith",
                "SingleName",
                "  Multiple   Spaces  "
            ]
            
            for name in test_names:
                first, last = sync_service.extract_customer_name({"name": name})
                print(f"👤 Name extraction: '{name}' -> First: '{first}', Last: '{last}'")
            
            return True
            
    except Exception as e:
        print(f"❌ Data structure test failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting SmartMoving Job Sync Tests")
    print("=" * 50)
    
    # Test 1: API Connection
    connection_ok = await test_smartmoving_connection()
    
    # Test 2: Data Structures
    structures_ok = await test_data_structures()
    
    # Test 3: Job Sync (only if connection is ok)
    sync_ok = False
    if connection_ok:
        sync_ok = await test_job_sync()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    print(f"🔗 API Connection: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"🔧 Data Structures: {'✅ PASS' if structures_ok else '❌ FAIL'}")
    print(f"🔄 Job Sync: {'✅ PASS' if sync_ok else '❌ FAIL'}")
    
    if connection_ok and structures_ok:
        print("\n🎉 Core functionality is working!")
        if sync_ok:
            print("🚀 Full integration is ready!")
        else:
            print("⚠️  Job sync needs configuration (check client ID)")
    else:
        print("\n❌ Some tests failed. Check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())
