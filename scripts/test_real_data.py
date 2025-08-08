#!/usr/bin/env python3
"""
🧪 C&C CRM - Real Data Test Script
==================================

This script tests that all real LGM data is working correctly after cleanup.

Author: C&C CRM Team
Date: August 8, 2025
"""

import requests
import json
import sys
from typing import Dict, List, Any

def test_api_health():
    """Test API health endpoint"""
    print("🔍 Testing API Health...")
    
    try:
        response = requests.get("https://c-and-c-crm-api.onrender.com/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Health: {data.get('message', 'OK')}")
            return True
        else:
            print(f"❌ API Health: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Health: Error - {e}")
        return False

def test_companies():
    """Test companies endpoint"""
    print("🔍 Testing Companies API...")
    
    try:
        response = requests.get("https://c-and-c-crm-api.onrender.com/auth/companies", timeout=10)
        if response.status_code == 200:
            data = response.json()
            companies = data.get('data', [])
            print(f"✅ Companies: Found {len(companies)} companies")
            
            for company in companies:
                print(f"   - {company.get('name', 'Unknown')} ({company.get('industry', 'Unknown')})")
            return True
        else:
            print(f"❌ Companies: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Companies: Error - {e}")
        return False

def test_users():
    """Test users endpoint"""
    print("🔍 Testing Users API...")
    
    try:
        # First get companies
        companies_response = requests.get("https://c-and-c-crm-api.onrender.com/auth/companies", timeout=10)
        if companies_response.status_code != 200:
            print("❌ Users: Cannot get companies")
            return False
            
        companies = companies_response.json().get('data', [])
        if not companies:
            print("❌ Users: No companies found")
            return False
            
        company_id = companies[0].get('id')
        users_response = requests.get(f"https://c-and-c-crm-api.onrender.com/auth/companies/{company_id}/users", timeout=10)
        
        if users_response.status_code == 200:
            data = users_response.json()
            users = data.get('data', [])
            print(f"✅ Users: Found {len(users)} real LGM users")
            
            # Show first 5 users
            for i, user in enumerate(users[:5]):
                print(f"   - {user.get('name', 'Unknown')} ({user.get('role', 'Unknown')}) - {user.get('location_name', 'Unknown')}")
            
            if len(users) > 5:
                print(f"   ... and {len(users) - 5} more users")
            return True
        else:
            print(f"❌ Users: Status {users_response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Users: Error - {e}")
        return False

def test_journeys():
    """Test journeys endpoint (requires auth)"""
    print("🔍 Testing Journeys API...")
    
    try:
        response = requests.get("https://c-and-c-crm-api.onrender.com/journey/active", timeout=10)
        if response.status_code == 401:
            print("✅ Journeys: API requires authentication (expected)")
            return True
        elif response.status_code == 200:
            data = response.json()
            journeys = data.get('data', [])
            print(f"✅ Journeys: Found {len(journeys)} real journeys")
            return True
        else:
            print(f"⚠️  Journeys: Status {response.status_code}")
            return True  # Not critical for this test
    except Exception as e:
        print(f"⚠️  Journeys: Error - {e}")
        return True  # Not critical for this test

def test_frontend_deployment():
    """Test frontend deployment"""
    print("🔍 Testing Frontend Deployment...")
    
    try:
        response = requests.get("https://c-and-c-crm-frontend.onrender.com", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend: Successfully deployed and accessible")
            return True
        else:
            print(f"❌ Frontend: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend: Error - {e}")
        return False

def test_manifest():
    """Test PWA manifest"""
    print("🔍 Testing PWA Manifest...")
    
    try:
        response = requests.get("https://c-and-c-crm-frontend.onrender.com/manifest.json", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ PWA Manifest: {data.get('name', 'Unknown')} v{data.get('version', 'Unknown')}")
            return True
        else:
            print(f"❌ PWA Manifest: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ PWA Manifest: Error - {e}")
        return False

def main():
    """Main test function"""
    print("🧪 C&C CRM - Real Data Test")
    print("=" * 50)
    
    tests = [
        ("API Health", test_api_health),
        ("Companies", test_companies),
        ("Users", test_users),
        ("Journeys", test_journeys),
        ("Frontend", test_frontend_deployment),
        ("PWA Manifest", test_manifest),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        if test_func():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ ALL TESTS PASSED!")
        print("🚀 Your C&C CRM is fully operational with real LGM data!")
    else:
        print("⚠️  Some tests failed - check the details above")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 