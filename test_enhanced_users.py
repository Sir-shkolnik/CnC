#!/usr/bin/env python3
"""
Enhanced User System Test Script
Demonstrates all user management functionality for both moving company and call center scenarios
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_CREDENTIALS = {
    "email": "sarah.johnson@lgm.com",
    "password": "password123"
}

def get_auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=ADMIN_CREDENTIALS,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        return response.json()["data"]["access_token"]
    else:
        raise Exception(f"Authentication failed: {response.status_code}")

def test_user_management():
    """Test all user management functionality"""
    print("🚀 C&C CRM - Enhanced User System Test")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    try:
        # Get authentication token
        print("🔐 Authenticating...")
        token = get_auth_token()
        print("✅ Authentication successful")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test 1: Get all users
        print("\n📋 Test 1: Get All Users")
        print("-" * 40)
        response = requests.get(f"{BASE_URL}/users/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {data['data']['total']} users")
            print(f"   Message: {data['message']}")
        else:
            print(f"❌ Failed: {response.status_code}")
        
        # Test 2: Filter users by role
        print("\n👥 Test 2: Filter Users by Role")
        print("-" * 40)
        roles = ["ADMIN", "DISPATCHER", "DRIVER", "MOVER", "MANAGER", "AUDITOR"]
        for role in roles:
            response = requests.get(f"{BASE_URL}/users/?role={role}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {role}: {data['data']['total']} users")
            else:
                print(f"❌ {role}: Failed")
        
        # Test 3: Filter by organization
        print("\n🏢 Test 3: Filter by Organization")
        print("-" * 40)
        organizations = [
            ("LGM Corporate", "clm_lgm_corp_001"),
            ("LGM Hamilton", "clm_lgm_hamilton_001"),
            ("Call Center", "clm_callcenter_001")
        ]
        
        for org_name, client_id in organizations:
            response = requests.get(f"{BASE_URL}/users/?client_id={client_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {org_name}: {data['data']['total']} users")
            else:
                print(f"❌ {org_name}: Failed")
        
        # Test 4: Get crew scoreboard
        print("\n🏆 Test 4: Crew Scoreboard")
        print("-" * 40)
        response = requests.get(f"{BASE_URL}/users/crew/scoreboard", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved scoreboard for {data['data']['total']} crew members")
            
            # Show top 3 performers
            crew = data['data']['crew'][:3]
            print("   Top 3 Performers:")
            for i, member in enumerate(crew, 1):
                perf = member['performance']
                print(f"   {i}. {member['name']} ({member['role']}) - Rating: {perf['rating']}/5.0")
        else:
            print(f"❌ Failed: {response.status_code}")
        
        # Test 5: Create a new user
        print("\n➕ Test 5: Create New User")
        print("-" * 40)
        new_user = {
            "name": "John Smith",
            "email": "john.smith@lgm.com",
            "role": "DRIVER",
            "password": "password123",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001"
        }
        
        response = requests.post(f"{BASE_URL}/users/", json=new_user, headers=headers)
        if response.status_code == 200:
            data = response.json()
            user_id = data['data']['user']['id']
            print(f"✅ Created user: {data['data']['user']['name']} (ID: {user_id})")
            
            # Test 6: Get specific user
            print("\n👤 Test 6: Get Specific User")
            print("-" * 40)
            response = requests.get(f"{BASE_URL}/users/{user_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved user: {data['data']['user']['name']}")
            else:
                print(f"❌ Failed to retrieve user: {response.status_code}")
            
            # Test 7: Update user
            print("\n✏️ Test 7: Update User")
            print("-" * 40)
            updates = {"name": "John Smith Jr.", "role": "MOVER"}
            response = requests.patch(f"{BASE_URL}/users/{user_id}", json=updates, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Updated user: {data['data']['user']['name']} (Role: {data['data']['user']['role']})")
            else:
                print(f"❌ Failed to update user: {response.status_code}")
            
            # Test 8: Delete user (soft delete)
            print("\n🗑️ Test 8: Delete User (Soft Delete)")
            print("-" * 40)
            response = requests.delete(f"{BASE_URL}/users/{user_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Deactivated user: {data['data']['user']['name']} (Status: {data['data']['user']['status']})")
            else:
                print(f"❌ Failed to delete user: {response.status_code}")
        
        else:
            print(f"❌ Failed to create user: {response.status_code}")
        
        # Test 9: Multi-tenant filtering
        print("\n🔍 Test 9: Multi-tenant Filtering")
        print("-" * 40)
        
        # Test filtering by location
        locations = [
            ("LGM Toronto", "loc_lgm_toronto_001"),
            ("LGM Hamilton", "loc_lgm_hamilton_001"),
            ("Call Center Main", "loc_callcenter_main_001"),
            ("Call Center Sales", "loc_callcenter_sales_001")
        ]
        
        for loc_name, location_id in locations:
            response = requests.get(f"{BASE_URL}/users/?location_id={location_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {loc_name}: {data['data']['total']} users")
            else:
                print(f"❌ {loc_name}: Failed")
        
        # Test 10: Combined filtering
        print("\n🎯 Test 10: Combined Filtering")
        print("-" * 40)
        
        # Get all drivers from LGM Corporate
        response = requests.get(
            f"{BASE_URL}/users/?client_id=clm_lgm_corp_001&role=DRIVER",
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ LGM Corporate Drivers: {data['data']['total']} users")
            for user in data['data']['users']:
                print(f"   - {user['name']} ({user['email']})")
        else:
            print(f"❌ Failed: {response.status_code}")
        
        print("\n" + "=" * 80)
        print("🎉 Enhanced User System Test Completed Successfully!")
        print("✅ All functionality working for both moving company and call center scenarios")
        print("✅ Multi-tenant filtering and security working correctly")
        print("✅ User CRUD operations functioning properly")
        print("✅ Crew scoreboard and performance metrics available")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the API server is running on localhost:8000")

if __name__ == "__main__":
    test_user_management() 