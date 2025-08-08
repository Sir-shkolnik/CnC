#!/usr/bin/env python3
"""
🔍 Test Current Data Status Script
==================================

This script tests the current data status and triggers SmartMoving sync.
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

def test_journey_data():
    """Test current journey data"""
    print("\n📋 Testing current journey data...")
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
                print(f"   Customer: {journey.get('customerName', 'N/A')}")
            else:
                print("❌ No journeys found - this is expected if no SmartMoving data")
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

def test_smartmoving_sync():
    """Test SmartMoving sync"""
    print("\n🔄 Testing SmartMoving sync...")
    try:
        # Test sync status
        response = requests.get(f"{API_BASE_URL}/smartmoving/sync/status", timeout=30)
        print(f"📊 Sync Status Response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sync Status: {json.dumps(data, indent=2)}")
        elif response.status_code == 401:
            print("⚠️  Authentication required for sync status")
        else:
            print(f"❌ Sync status failed: {response.text}")
        
        # Try to trigger sync
        print("\n🚀 Attempting to trigger SmartMoving sync...")
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

def test_customer_data():
    """Test customer data from SmartMoving"""
    print("\n👥 Testing SmartMoving customer data...")
    try:
        # Test direct SmartMoving API
        smartmoving_url = "https://api-public.smartmoving.com/v1"
        headers = {
            "x-api-key": "185840176c73420fbd3a473c2fdccedb",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{smartmoving_url}/api/customers", headers=headers, timeout=10)
        print(f"📊 SmartMoving Customers: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            customers = data.get("pageResults", [])
            print(f"✅ Found {len(customers)} customers in SmartMoving")
            
            # Check for customers with opportunities
            customers_with_opportunities = 0
            customers_with_jobs = 0
            
            for customer in customers[:10]:  # Check first 10 customers
                opportunities = customer.get('opportunities')
                if opportunities:
                    customers_with_opportunities += 1
                    for opp in opportunities:
                        jobs = opp.get('jobs')
                        if jobs:
                            customers_with_jobs += 1
                            break
            
            print(f"📊 Customers with opportunities: {customers_with_opportunities}")
            print(f"📊 Customers with jobs: {customers_with_jobs}")
            
            if customers_with_jobs > 0:
                print("✅ SmartMoving has job data available!")
                return True
            else:
                print("⚠️  SmartMoving has customers but no job data")
                return False
        else:
            print(f"❌ SmartMoving customers failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ SmartMoving customer test error: {e}")
        return False

def main():
    """Main function"""
    print("🔍 Current Data Status Test")
    print("=" * 50)
    print(f"⏰ Test Time: {datetime.now().isoformat()}")
    
    tests = [
        ("API Health", test_api_health),
        ("Journey Data", test_journey_data),
        ("SmartMoving Customers", test_customer_data),
        ("SmartMoving Sync", test_smartmoving_sync),
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
    
    if passed >= 3:
        print("🎉 System is mostly working! SmartMoving integration ready.")
    else:
        print("⚠️  Some critical issues need attention.")
    
    return passed >= 3

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 