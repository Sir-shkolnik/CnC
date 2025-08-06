#!/usr/bin/env python3
"""
Enhanced User Data Script for C&C CRM
Adds comprehensive users for both moving company and call center scenarios
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

# Enhanced User Data
ENHANCED_USERS = {
    # Moving Company - LGM Corporate
    "lgm_corporate": {
        "client_id": "clm_lgm_corp_001",
        "location_id": "loc_lgm_toronto_001",
        "users": [
            # Management Team
            {
                "name": "Sarah Johnson",
                "email": "sarah.johnson@lgm.com",
                "role": "ADMIN",
                "password": "password123"
            },
            {
                "name": "Michael Chen",
                "email": "mike.chen@lgm.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Jennifer Rodriguez",
                "email": "jen.rodriguez@lgm.com",
                "role": "MANAGER",
                "password": "password123"
            },
            {
                "name": "Robert Kim",
                "email": "rob.kim@lgm.com",
                "role": "AUDITOR",
                "password": "password123"
            },
            
            # Drivers
            {
                "name": "David Rodriguez",
                "email": "david.rodriguez@lgm.com",
                "role": "DRIVER",
                "password": "password123"
            },
            {
                "name": "James Wilson",
                "email": "james.wilson@lgm.com",
                "role": "DRIVER",
                "password": "password123"
            },
            {
                "name": "Carlos Martinez",
                "email": "carlos.martinez@lgm.com",
                "role": "DRIVER",
                "password": "password123"
            },
            {
                "name": "Thomas Anderson",
                "email": "thomas.anderson@lgm.com",
                "role": "DRIVER",
                "password": "password123"
            },
            
            # Movers
            {
                "name": "Maria Garcia",
                "email": "maria.garcia@lgm.com",
                "role": "MOVER",
                "password": "password123"
            },
            {
                "name": "Alex Thompson",
                "email": "alex.thompson@lgm.com",
                "role": "MOVER",
                "password": "password123"
            },
            {
                "name": "Lisa Park",
                "email": "lisa.park@lgm.com",
                "role": "MOVER",
                "password": "password123"
            },
            {
                "name": "Kevin O'Brien",
                "email": "kevin.obrien@lgm.com",
                "role": "MOVER",
                "password": "password123"
            }
        ]
    },
    
    # Moving Company - LGM Hamilton Franchise
    "lgm_hamilton": {
        "client_id": "clm_lgm_hamilton_001",
        "location_id": "loc_lgm_hamilton_001",
        "users": [
            # Franchise Owner
            {
                "name": "Frank Williams",
                "email": "frank.williams@lgmhamilton.com",
                "role": "ADMIN",
                "password": "password123"
            },
            {
                "name": "Patricia Davis",
                "email": "patricia.davis@lgmhamilton.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            
            # Drivers
            {
                "name": "Ryan Johnson",
                "email": "ryan.johnson@lgmhamilton.com",
                "role": "DRIVER",
                "password": "password123"
            },
            {
                "name": "Amanda Lee",
                "email": "amanda.lee@lgmhamilton.com",
                "role": "DRIVER",
                "password": "password123"
            },
            
            # Movers
            {
                "name": "Daniel Brown",
                "email": "daniel.brown@lgmhamilton.com",
                "role": "MOVER",
                "password": "password123"
            },
            {
                "name": "Sophie Taylor",
                "email": "sophie.taylor@lgmhamilton.com",
                "role": "MOVER",
                "password": "password123"
            }
        ]
    },
    
    # Call Center - Customer Support
    "call_center_support": {
        "client_id": "clm_callcenter_001",
        "location_id": "loc_callcenter_main_001",
        "users": [
            # Call Center Management
            {
                "name": "Emily Watson",
                "email": "emily.watson@callcenter.com",
                "role": "ADMIN",
                "password": "password123"
            },
            {
                "name": "Christopher Lee",
                "email": "chris.lee@callcenter.com",
                "role": "MANAGER",
                "password": "password123"
            },
            {
                "name": "Rachel Green",
                "email": "rachel.green@callcenter.com",
                "role": "AUDITOR",
                "password": "password123"
            },
            
            # Call Center Agents
            {
                "name": "Jessica Smith",
                "email": "jessica.smith@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Matthew Davis",
                "email": "matthew.davis@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Ashley Johnson",
                "email": "ashley.johnson@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Brandon Wilson",
                "email": "brandon.wilson@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Nicole Brown",
                "email": "nicole.brown@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Steven Miller",
                "email": "steven.miller@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Amanda Garcia",
                "email": "amanda.garcia@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            }
        ]
    },
    
    # Call Center - Sales Team
    "call_center_sales": {
        "client_id": "clm_callcenter_001",
        "location_id": "loc_callcenter_sales_001",
        "users": [
            # Sales Management
            {
                "name": "Mark Thompson",
                "email": "mark.thompson@callcenter.com",
                "role": "MANAGER",
                "password": "password123"
            },
            {
                "name": "Sarah Mitchell",
                "email": "sarah.mitchell@callcenter.com",
                "role": "AUDITOR",
                "password": "password123"
            },
            
            # Sales Representatives
            {
                "name": "Kevin Anderson",
                "email": "kevin.anderson@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Lisa Martinez",
                "email": "lisa.martinez@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Robert Taylor",
                "email": "robert.taylor@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Jennifer White",
                "email": "jennifer.white@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Michael Clark",
                "email": "michael.clark@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            },
            {
                "name": "Stephanie Lewis",
                "email": "stephanie.lewis@callcenter.com",
                "role": "DISPATCHER",
                "password": "password123"
            }
        ]
    }
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

def create_user(token, user_data, client_id, location_id):
    """Create a new user"""
    user_payload = {
        "name": user_data["name"],
        "email": user_data["email"],
        "role": user_data["role"],
        "password": user_data["password"],
        "clientId": client_id,
        "locationId": location_id
    }
    
    response = requests.post(
        f"{BASE_URL}/users/",
        json=user_payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        return response.json()["data"]["user"]
    else:
        print(f"Failed to create user {user_data['email']}: {response.status_code}")
        return None

def main():
    """Main function to create enhanced users"""
    print("🚀 C&C CRM - Enhanced User Creation")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    try:
        # Get authentication token
        print("🔐 Authenticating...")
        token = get_auth_token()
        print("✅ Authentication successful")
        
        total_users = 0
        created_users = 0
        
        # Create users for each organization
        for org_name, org_data in ENHANCED_USERS.items():
            print(f"\n🏢 Creating users for: {org_name}")
            print("-" * 40)
            
            client_id = org_data["client_id"]
            location_id = org_data["location_id"]
            
            for user_data in org_data["users"]:
                total_users += 1
                print(f"Creating: {user_data['name']} ({user_data['role']})")
                
                user = create_user(token, user_data, client_id, location_id)
                if user:
                    created_users += 1
                    print(f"  ✅ Created: {user['email']}")
                else:
                    print(f"  ❌ Failed: {user_data['email']}")
        
        print("\n" + "=" * 60)
        print("📊 SUMMARY")
        print(f"Total users attempted: {total_users}")
        print(f"Successfully created: {created_users}")
        print(f"Failed: {total_users - created_users}")
        
        if created_users > 0:
            print("\n✅ Enhanced user creation completed!")
            print("The system now has comprehensive users for:")
            print("  • Moving Company (LGM Corporate)")
            print("  • Moving Company (LGM Hamilton Franchise)")
            print("  • Call Center (Customer Support)")
            print("  • Call Center (Sales Team)")
        else:
            print("\n❌ No users were created. Check the API status.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the API server is running on localhost:8000")

if __name__ == "__main__":
    main() 