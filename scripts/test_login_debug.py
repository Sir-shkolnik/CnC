#!/usr/bin/env python3
"""
Test Login Debug Script
Purpose: Test login with detailed debugging to see what's happening
"""

import requests
import json

def test_login_debug():
    """Test login with detailed debugging"""
    print("🔍 TESTING LOGIN WITH DEBUG")
    print("=" * 50)
    
    base_url = "https://c-and-c-crm-api.onrender.com"
    
    # Test 1: Check database debug endpoint
    print("📊 Step 1: Checking database contents...")
    response = requests.get(f"{base_url}/setup/debug-database")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Database debug successful")
        print(f"   - Table exists: {data.get('table_exists')}")
        print(f"   - Total users: {data.get('total_users')}")
        print(f"   - Shahbaz user found: {data.get('shahbaz_user_found')}")
        if data.get('shahbaz_user'):
            user = data['shahbaz_user']
            print(f"   - Shahbaz user ID: {user.get('id')}")
            print(f"   - Shahbaz location ID: {user.get('locationId')}")
    else:
        print(f"❌ Database debug failed: {response.text}")
    
    # Test 2: Test login
    print("\n🔑 Step 2: Testing login...")
    login_data = {
        "email": "shahbaz@lgm.com",
        "password": "1234",
        "company_id": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
    }
    
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Login successful")
        print(f"   - User ID: {user_data['user']['id']}")
        print(f"   - Location ID: {user_data['user']['location_id']}")
        print(f"   - Location Name: {user_data['user']['location_name']}")
        
        if user_data['user']['location_id']:
            print("🎉 SUCCESS: Location ID is set!")
        else:
            print("❌ FAILURE: Location ID is still null")
    else:
        print(f"❌ Login failed: {response.text}")
    
    # Test 3: Check if the user exists with exact email
    print("\n🔍 Step 3: Checking exact user lookup...")
    response = requests.get(f"{base_url}/setup/debug-database")
    if response.status_code == 200:
        data = response.json()
        if data.get('shahbaz_user'):
            user = data['shahbaz_user']
            print(f"   - Database has user: {user['email']}")
            print(f"   - Database user ID: {user['id']}")
            print(f"   - Database location ID: {user['locationId']}")
            
            # Check if login should find this user
            if user['email'] == 'shahbaz@lgm.com':
                print("✅ Database has exact email match")
            else:
                print("❌ Database email doesn't match exactly")
        else:
            print("❌ No shahbaz user found in database")
    
    return True

def main():
    """Main function"""
    print("🚀 LOGIN DEBUG TEST")
    print("=" * 50)
    
    try:
        test_login_debug()
        print("\n🎉 Login debug test completed!")
        print("🌐 Check: https://c-and-c-crm-frontend.onrender.com")
        print("👤 Login: shahbaz@lgm.com / 1234")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
