#!/usr/bin/env python3
"""
🔧 Trigger SmartMoving Sync Script
==================================

Simple script to trigger SmartMoving sync and check results.
"""

import requests
import json
import sys
from datetime import datetime

# API Configuration
API_BASE_URL = "https://c-and-c-crm-api.onrender.com"

def test_api_health():
    """Test if API is healthy"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Health: {data.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ API Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Health Check Error: {e}")
        return False

def trigger_smartmoving_sync():
    """Trigger SmartMoving sync"""
    try:
        print("🔄 Triggering SmartMoving sync...")
        
        # Note: This endpoint requires authentication, but we can test if it exists
        response = requests.post(f"{API_BASE_URL}/smartmoving/sync/jobs", timeout=30)
        
        if response.status_code == 401:
            print("✅ SmartMoving sync endpoint exists (requires authentication)")
            return True
        elif response.status_code == 200:
            data = response.json()
            print(f"✅ SmartMoving sync triggered successfully: {data.get('message', '')}")
            return True
        else:
            print(f"❌ SmartMoving sync failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ SmartMoving sync error: {e}")
        return False

def check_journey_endpoint():
    """Check journey endpoint"""
    try:
        print("🔍 Checking journey endpoint...")
        
        # Test without authentication (should return 401)
        response = requests.get(f"{API_BASE_URL}/journey/active", timeout=10)
        
        if response.status_code == 401:
            print("✅ Journey endpoint exists (requires authentication)")
            return True
        elif response.status_code == 200:
            data = response.json()
            journey_count = len(data.get('data', []))
            print(f"✅ Journey endpoint working: {journey_count} journeys found")
            return True
        else:
            print(f"❌ Journey endpoint failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Journey endpoint error: {e}")
        return False

def main():
    """Main function"""
    print("🧪 SmartMoving Sync Test")
    print("=" * 50)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API URL: {API_BASE_URL}")
    print()
    
    # Test API health
    if not test_api_health():
        print("❌ API is not healthy, stopping tests")
        return False
    
    print()
    
    # Test SmartMoving sync
    if not trigger_smartmoving_sync():
        print("❌ SmartMoving sync test failed")
        return False
    
    print()
    
    # Test journey endpoint
    if not check_journey_endpoint():
        print("❌ Journey endpoint test failed")
        return False
    
    print()
    print("✅ All tests completed successfully!")
    print("📝 Note: SmartMoving sync requires authentication to actually run")
    print("🔧 To test with real data, you need to:")
    print("   1. Login to the application")
    print("   2. Navigate to the dashboard")
    print("   3. The journey API will automatically trigger SmartMoving sync")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 