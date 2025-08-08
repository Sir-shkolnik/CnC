#!/usr/bin/env python3
"""
🚀 Trigger SmartMoving Sync Script
==================================

This script triggers SmartMoving sync and tests the real data flow.
"""

import requests
import json
import sys
from datetime import datetime

# API Configuration
API_BASE_URL = "https://c-and-c-crm-api.onrender.com"

def test_api_health():
    """Test API health"""
    print("🔍 Testing API health...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Health: {data.get('status', 'unknown')}")
            print(f"📊 Modules: {data.get('modules', {})}")
            return True
        else:
            print(f"❌ API Health failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Health error: {e}")
        return False

def trigger_smartmoving_sync():
    """Trigger SmartMoving sync"""
    print("\n🔄 Triggering SmartMoving sync...")
    try:
        # First, try to get sync status
        response = requests.get(f"{API_BASE_URL}/smartmoving/sync/status", timeout=30)
        print(f"📊 Sync Status Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sync Status: {json.dumps(data, indent=2)}")
        
        # Trigger sync (this will require authentication, but let's try)
        print("\n🚀 Triggering sync...")
        response = requests.post(f"{API_BASE_URL}/smartmoving/sync/jobs", timeout=60)
        print(f"📊 Sync Trigger Response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sync Triggered: {json.dumps(data, indent=2)}")
            return True
        elif response.status_code == 401:
            print("⚠️  Authentication required for sync")
            return False
        else:
            print(f"❌ Sync failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Sync error: {e}")
        return False

def test_journey_api():
    """Test journey API"""
    print("\n📋 Testing journey API...")
    try:
        response = requests.get(f"{API_BASE_URL}/journey/active", timeout=10)
        print(f"📊 Journey API Response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Journey API: {data.get('message', 'No message')}")
            journeys = data.get('data', [])
            print(f"📊 Journeys found: {len(journeys)}")
            
            if journeys:
                print("📋 Sample journey:")
                journey = journeys[0]
                print(f"   ID: {journey.get('id', 'N/A')}")
                print(f"   Status: {journey.get('status', 'N/A')}")
                print(f"   Date: {journey.get('date', 'N/A')}")
                print(f"   Location: {journey.get('locationId', 'N/A')}")
            return True
        elif response.status_code == 401:
            print("⚠️  Authentication required for journey API")
            return False
        else:
            print(f"❌ Journey API failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Journey API error: {e}")
        return False

def test_smartmoving_connection():
    """Test direct SmartMoving connection"""
    print("\n🔗 Testing SmartMoving connection...")
    try:
        # Test SmartMoving API directly
        smartmoving_url = "https://api-public.smartmoving.com/v1"
        headers = {
            "x-api-key": "185840176c73420fbd3a473c2fdccedb",
            "Content-Type": "application/json"
        }
        
        # Test basic connection
        response = requests.get(f"{smartmoving_url}/api/health", headers=headers, timeout=10)
        print(f"📊 SmartMoving Health: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SmartMoving API is accessible")
            
            # Test jobs endpoint
            today = datetime.now().strftime("%Y-%m-%d")
            params = {"PageSize": 10, "JobDate": today}
            response = requests.get(f"{smartmoving_url}/api/jobs", headers=headers, params=params, timeout=10)
            print(f"📊 SmartMoving Jobs: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                jobs = data.get("pageResults", [])
                print(f"✅ Found {len(jobs)} jobs for today ({today})")
                
                if jobs:
                    print("📋 Sample job:")
                    job = jobs[0]
                    print(f"   Job Number: {job.get('jobNumber', 'N/A')}")
                    print(f"   Customer: {job.get('customer', {}).get('name', 'N/A')}")
                    print(f"   Service Type: {job.get('serviceType', 'N/A')}")
                    print(f"   Status: {job.get('status', 'N/A')}")
                return True
            else:
                print(f"❌ SmartMoving jobs failed: {response.text}")
                return False
        else:
            print(f"❌ SmartMoving health failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ SmartMoving connection error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 SmartMoving Sync Test")
    print("=" * 50)
    print(f"⏰ Test Time: {datetime.now().isoformat()}")
    
    tests = [
        ("API Health", test_api_health),
        ("SmartMoving Connection", test_smartmoving_connection),
        ("Journey API", test_journey_api),
        ("SmartMoving Sync", trigger_smartmoving_sync),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        try:
            result = test_func()
            results.append((test_name, result))
            print(f"{'✅ PASSED' if result else '❌ FAILED'}: {test_name}")
        except Exception as e:
            print(f"💥 ERROR: {test_name} - {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("🎯 Test Results Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\n📊 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! SmartMoving integration is working.")
    else:
        print("⚠️  Some tests failed. Check the details above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 