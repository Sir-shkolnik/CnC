#!/usr/bin/env python3
"""
Check and Fix Users Script
Purpose: Check current user data and fix location associations
"""

import requests
import json

def check_and_fix_users():
    """Check and fix user data"""
    print("🔍 CHECKING AND FIXING USER DATA")
    print("=" * 50)
    
    base_url = "https://c-and-c-crm-api.onrender.com"
    
    # Step 1: Login to get a token
    print("🔑 Logging in to get token...")
    login_data = {
        "email": "shahbaz@lgm.com",
        "password": "1234",
        "company_id": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
    }
    
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return False
    
    user_data = response.json()
    token = user_data['access_token']
    print(f"✅ Login successful")
    print(f"User ID: {user_data['user']['id']}")
    print(f"Location ID: {user_data['user']['location_id']}")
    
    # Step 2: Check current user info with token
    print("\n👤 Checking current user info...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{base_url}/auth/me", headers=headers)
    if response.status_code == 200:
        me_data = response.json()
        print(f"Current user info: {me_data}")
    else:
        print(f"Failed to get user info: {response.text}")
    
    # Step 3: Check company users (if accessible)
    print("\n🏢 Checking company users...")
    response = requests.get(f"{base_url}/companies/clm_f55e13de_a5c4_4990_ad02_34bb07187daa/users", headers=headers)
    if response.status_code == 200:
        users_data = response.json()
        print(f"Company users: {users_data}")
        
        # Look for shahbaz user
        if 'users' in users_data:
            shahbaz_user = None
            for user in users_data['users']:
                if user.get('email') == 'shahbaz@lgm.com':
                    shahbaz_user = user
                    break
            
            if shahbaz_user:
                print(f"Found Shahbaz user: {shahbaz_user}")
            else:
                print("❌ Shahbaz user not found in company users")
    else:
        print(f"Failed to get company users: {response.text}")
    
    # Step 4: Check locations
    print("\n📍 Checking locations...")
    response = requests.get(f"{base_url}/auth/locations", headers=headers)
    if response.status_code == 200:
        locations_data = response.json()
        print(f"Locations: {locations_data}")
    else:
        print(f"Failed to get locations: {response.text}")
    
    # Step 5: Force database refresh
    print("\n🔄 Forcing database refresh...")
    response = requests.post(f"{base_url}/setup/database")
    if response.status_code == 200:
        print("✅ Database refreshed")
    else:
        print(f"❌ Database refresh failed: {response.text}")
    
    response = requests.post(f"{base_url}/setup/update-users")
    if response.status_code == 200:
        print("✅ Users updated")
    else:
        print(f"❌ User update failed: {response.text}")
    
    # Step 6: Test login again
    print("\n🔍 Testing login after refresh...")
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code == 200:
        new_user_data = response.json()
        print(f"New user ID: {new_user_data['user']['id']}")
        print(f"New location ID: {new_user_data['user']['location_id']}")
        print(f"New location name: {new_user_data['user']['location_name']}")
        
        if new_user_data['user']['location_id']:
            print("✅ Location ID is now set!")
        else:
            print("❌ Location ID is still null")
    else:
        print(f"❌ Login failed after refresh: {response.text}")
    
    return True

def main():
    """Main function"""
    print("🚀 USER DATA CHECK AND FIX")
    print("=" * 50)
    
    try:
        check_and_fix_users()
        print("\n🎉 User data check and fix completed!")
        print("🌐 Check: https://c-and-c-crm-frontend.onrender.com")
        print("👤 Login: shahbaz@lgm.com / 1234")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
