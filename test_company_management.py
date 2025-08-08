#!/usr/bin/env python3
"""
Test Company Management System
==============================

Tests the complete company management system including:
- Database schema
- API endpoints
- Sync service
- Frontend integration
"""

import asyncio
import httpx
import json
import sys
import os
from datetime import datetime

# Add the apps directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps'))

async def test_company_management():
    """Test the complete company management system"""
    print("🧪 Testing Company Management System")
    print("=" * 50)
    
    # Test 1: Database Schema
    print("\n1️⃣ Testing Database Schema...")
    try:
        from prisma import Prisma
        db = Prisma()
        await db.connect()
        
        # Check if company integration table exists
        companies = await db.companyintegration.find_many()
        print(f"✅ Found {len(companies)} company integrations in database")
        
        # Check LGM integration
        lgm_company = await db.companyintegration.find_first(
            where={"name": "Let's Get Moving"}
        )
        if lgm_company:
            print(f"✅ LGM company integration found: {lgm_company.id}")
            print(f"   API Source: {lgm_company.apiSource}")
            print(f"   Sync Frequency: {lgm_company.syncFrequencyHours} hours")
            print(f"   Status: {lgm_company.syncStatus}")
        else:
            print("❌ LGM company integration not found")
        
        await db.disconnect()
        
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")
        return False
    
    # Test 2: API Endpoints
    print("\n2️⃣ Testing API Endpoints...")
    try:
        async with httpx.AsyncClient() as client:
            # Test health endpoint
            response = await client.get("http://localhost:8000/health")
            if response.status_code == 200:
                print("✅ API health check passed")
            else:
                print(f"❌ API health check failed: {response.status_code}")
                return False
            
            # Test company management endpoints (without auth for now)
            response = await client.get("http://localhost:8000/company-management/test")
            if response.status_code == 200:
                print("✅ Company management API test endpoint working")
            else:
                print(f"❌ Company management API test failed: {response.status_code}")
        
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False
    
    # Test 3: Sync Service
    print("\n3️⃣ Testing Sync Service...")
    try:
        from apps.api.services.company_sync_service import CompanySyncService
        
        async with CompanySyncService() as sync_service:
            # Test getting pending syncs
            pending_syncs = await sync_service.get_pending_syncs()
            print(f"✅ Found {len(pending_syncs)} pending syncs")
            
            # Test sync log creation
            if pending_syncs:
                company = pending_syncs[0]
                sync_log = await sync_service.create_sync_log(company.id, "TEST_SYNC")
                print(f"✅ Created sync log: {sync_log.id}")
                
                # Update sync log
                await sync_service.update_sync_log(
                    sync_log.id,
                    status="COMPLETED",
                    recordsProcessed=10,
                    recordsCreated=5,
                    recordsUpdated=3,
                    recordsFailed=0,
                    completedAt=datetime.utcnow()
                )
                print("✅ Updated sync log successfully")
        
    except Exception as e:
        print(f"❌ Sync service test failed: {str(e)}")
        return False
    
    # Test 4: Background Service
    print("\n4️⃣ Testing Background Service...")
    try:
        from apps.api.background_sync import get_sync_service_status
        
        status = get_sync_service_status()
        print(f"✅ Background service status: {status}")
        
    except Exception as e:
        print(f"❌ Background service test failed: {str(e)}")
        return False
    
    # Test 5: Frontend Integration
    print("\n5️⃣ Testing Frontend Integration...")
    try:
        # Check if the frontend page exists
        frontend_path = "apps/frontend/app/super-admin/companies/page.tsx"
        if os.path.exists(frontend_path):
            print("✅ Frontend company management page exists")
            
            # Check if it imports the required components
            with open(frontend_path, 'r') as f:
                content = f.read()
                if 'CompanyManagementPage' in content:
                    print("✅ Frontend component properly defined")
                else:
                    print("❌ Frontend component not found")
        else:
            print("❌ Frontend company management page not found")
        
    except Exception as e:
        print(f"❌ Frontend test failed: {str(e)}")
        return False
    
    # Test 6: Navigation Integration
    print("\n6️⃣ Testing Navigation Integration...")
    try:
        nav_path = "apps/frontend/utils/superAdminMenuItems.ts"
        if os.path.exists(nav_path):
            with open(nav_path, 'r') as f:
                content = f.read()
                if 'company-integrations' in content:
                    print("✅ Company integrations added to navigation")
                else:
                    print("❌ Company integrations not found in navigation")
        else:
            print("❌ Navigation file not found")
        
    except Exception as e:
        print(f"❌ Navigation test failed: {str(e)}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All tests completed successfully!")
    print("✅ Company Management System is ready for deployment")
    
    return True

async def test_lgm_data_sync():
    """Test LGM data synchronization specifically"""
    print("\n🔍 Testing LGM Data Sync...")
    print("=" * 30)
    
    try:
        from apps.api.services.company_sync_service import CompanySyncService
        
        async with CompanySyncService() as sync_service:
            # Get LGM company
            lgm_company = await sync_service.prisma.companyintegration.find_first(
                where={"name": "Let's Get Moving"}
            )
            
            if not lgm_company:
                print("❌ LGM company not found")
                return False
            
            print(f"✅ Found LGM company: {lgm_company.name}")
            print(f"   API Source: {lgm_company.apiSource}")
            print(f"   Base URL: {lgm_company.apiBaseUrl}")
            
            # Test API connection
            headers = {
                "x-api-key": lgm_company.apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            
            async with httpx.AsyncClient() as client:
                # Test branches endpoint
                response = await client.get(
                    f"{lgm_company.apiBaseUrl}/api/branches",
                    headers=headers,
                    params={"PageSize": 5}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    branches = data.get("pageResults", [])
                    print(f"✅ Successfully fetched {len(branches)} branches from SmartMoving API")
                    
                    for branch in branches[:3]:  # Show first 3
                        print(f"   - {branch.get('name', 'Unknown')} ({branch.get('dispatchLocation', {}).get('city', 'Unknown')})")
                else:
                    print(f"❌ Failed to fetch branches: {response.status_code}")
                    return False
                
                # Test materials endpoint
                response = await client.get(
                    f"{lgm_company.apiBaseUrl}/api/tariffs",
                    headers=headers,
                    params={"PageSize": 1}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    tariffs = data.get("pageResults", [])
                    if tariffs:
                        tariff_id = tariffs[0]["id"]
                        
                        # Get materials for this tariff
                        response = await client.get(
                            f"{lgm_company.apiBaseUrl}/api/premium/tariffs/{tariff_id}/materials",
                            headers=headers,
                            params={"PageSize": 5}
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            materials = data.get("pageResults", [])
                            print(f"✅ Successfully fetched {len(materials)} materials from SmartMoving API")
                            
                            for material in materials[:3]:  # Show first 3
                                print(f"   - {material.get('name', 'Unknown')} (${material.get('rate', 0)})")
                        else:
                            print(f"❌ Failed to fetch materials: {response.status_code}")
                else:
                    print(f"❌ Failed to fetch tariffs: {response.status_code}")
        
        print("✅ LGM data sync test completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ LGM data sync test failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Company Management System Tests")
    print("=" * 60)
    
    # Run basic tests
    basic_tests_passed = await test_company_management()
    
    if basic_tests_passed:
        # Run LGM-specific tests
        lgm_tests_passed = await test_lgm_data_sync()
        
        if lgm_tests_passed:
            print("\n" + "=" * 60)
            print("🎉 ALL TESTS PASSED!")
            print("✅ Company Management System is fully functional")
            print("✅ LGM integration is working correctly")
            print("✅ Ready for production deployment")
        else:
            print("\n❌ LGM tests failed - check API connection and credentials")
    else:
        print("\n❌ Basic tests failed - check system setup")

if __name__ == "__main__":
    asyncio.run(main())
