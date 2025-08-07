#!/usr/bin/env python3
"""
Update Users via API Script
Updates existing demo users to real LGM users
"""

import requests
import json

# API Configuration
API_BASE_URL = "https://c-and-c-crm-api.onrender.com"
LGM_CLIENT_ID = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"

# Real LGM Users to replace demo users
LGM_USERS_UPDATE = [
    # Update existing users to real LGM users
    {
        "old_id": "usr_super_admin",
        "new_data": {
            "name": "Ankit",
            "email": "ankit@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_demo_admin", 
        "new_data": {
            "name": "Shahbaz",
            "email": "shahbaz@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_demo_dispatcher",
        "new_data": {
            "name": "Arshdeep", 
            "email": "arshdeep@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_demo_driver",
        "new_data": {
            "name": "Danylo",
            "email": "danylo@lgm.com", 
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_manager_john",
        "new_data": {
            "name": "Hakam",
            "email": "hakam@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_mover_1",
        "new_data": {
            "name": "Bhanu",
            "email": "bhanu@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_dispatcher_mike",
        "new_data": {
            "name": "Anees Aps",
            "email": "anees.aps@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_driver_1",
        "new_data": {
            "name": "Andrew",
            "email": "andrew@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_dispatcher_sarah",
        "new_data": {
            "name": "Parsa",
            "email": "parsa@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_dispatcher_manager",
        "new_data": {
            "name": "Aerish",
            "email": "aerish@lgm.com",
            "role": "MANAGER"
        }
    },
    {
        "old_id": "usr_udi_admin",
        "new_data": {
            "name": "Akshit",
            "email": "akshit@lgm.com",
            "role": "MANAGER"
        }
    }
]

def update_user(user_id: str, new_data: dict):
    """Update a user via API"""
    try:
        # First, let's try to update the user
        response = requests.patch(
            f"{API_BASE_URL}/users/{user_id}",
            json=new_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Updated user: {new_data['name']} ({new_data['email']})")
            return True
        else:
            print(f"❌ Failed to update user {user_id}: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating user {user_id}: {str(e)}")
        return False

def main():
    print("🚀 Updating Demo Users to Real LGM Users")
    print("=" * 50)
    
    success_count = 0
    total_count = len(LGM_USERS_UPDATE)
    
    for user_update in LGM_USERS_UPDATE:
        if update_user(user_update["old_id"], user_update["new_data"]):
            success_count += 1
    
    print("=" * 50)
    print(f"✅ Successfully updated {success_count} out of {total_count} users")
    print("🎉 Real LGM users are now available!")
    print("\n📋 Updated Users:")
    for user_update in LGM_USERS_UPDATE:
        print(f"  - {user_update['new_data']['name']} ({user_update['new_data']['email']}) - {user_update['new_data']['role']}")
    
    print("\n🔑 All users use password: 1234")

if __name__ == "__main__":
    main()
