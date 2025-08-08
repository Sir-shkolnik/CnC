#!/usr/bin/env python3
"""
Fix User Locations Script
Purpose: Fix user location associations in production database
"""

import requests
import json

def fix_user_locations():
    """Fix user location associations via API"""
    print("🔧 FIXING USER LOCATION ASSOCIATIONS")
    print("=" * 50)
    
    base_url = "https://c-and-c-crm-api.onrender.com"
    
    # Test login to see current user data
    print("🔍 Testing current login...")
    login_data = {
        "email": "shahbaz@lgm.com",
        "password": "1234",
        "company_id": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
    }
    
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code == 200:
        user_data = response.json()
        print(f"Current user: {user_data['user']['id']}")
        print(f"Location ID: {user_data['user']['location_id']}")
        print(f"Location Name: {user_data['user']['location_name']}")
    else:
        print(f"Login failed: {response.text}")
        return False
    
    # Trigger database setup to ensure proper user data
    print("\n📊 Setting up database with proper user locations...")
    response = requests.post(f"{base_url}/setup/database")
    if response.status_code == 200:
        data = response.json()
        print(f"Database setup: {data}")
    else:
        print(f"Database setup failed: {response.text}")
    
    # Trigger user update
    print("\n👥 Updating users with proper locations...")
    response = requests.post(f"{base_url}/setup/update-users")
    if response.status_code == 200:
        data = response.json()
        print(f"User update: {data}")
    else:
        print(f"User update failed: {response.text}")
    
    # Test login again
    print("\n🔍 Testing login after fix...")
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code == 200:
        user_data = response.json()
        print(f"Updated user: {user_data['user']['id']}")
        print(f"Location ID: {user_data['user']['location_id']}")
        print(f"Location Name: {user_data['user']['location_name']}")
        
        if user_data['user']['location_id']:
            print("✅ Location ID is now set!")
        else:
            print("❌ Location ID is still null")
    else:
        print(f"Login failed: {response.text}")
    
    return True

def main():
    """Main function"""
    print("🚀 USER LOCATION FIX")
    print("=" * 50)
    
    try:
        fix_user_locations()
        print("\n🎉 User location fix completed!")
        print("🌐 Check: https://c-and-c-crm-frontend.onrender.com")
        print("👤 Login: shahbaz@lgm.com / 1234")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
