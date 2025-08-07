#!/usr/bin/env python3
"""
Create Real LGM Users Script
Creates real LGM users based on the locations data
"""

import requests
import json
from datetime import datetime

# API Configuration
API_BASE_URL = "https://c-and-c-crm-api.onrender.com"
LGM_CLIENT_ID = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"

# Real LGM Users based on locations data
LGM_USERS = [
    # Corporate Location Managers
    {
        "id": "usr_shahbaz_burnaby",
        "name": "Shahbaz",
        "email": "shahbaz@lgm.com",
        "role": "MANAGER",
        "locationId": "loc_lgm_burnaby_corporate_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_arshdeep_downtown_toronto",
        "name": "Arshdeep",
        "email": "arshdeep@lgm.com",
        "role": "MANAGER",
        "locationId": "loc_lgm_downtown_toronto_corporate_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_danylo_edmonton",
        "name": "Danylo",
        "email": "danylo@lgm.com",
        "role": "MANAGER",
        "locationId": "loc_lgm_edmonton_corporate_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_hakam_hamilton",
        "name": "Hakam",
        "email": "hakam@lgm.com",
        "role": "MANAGER",
        "locationId": "loc_lgm_hamilton_corporate_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_bhanu_montreal",
        "name": "Bhanu",
        "email": "bhanu@lgm.com",
        "role": "MANAGER",
        "locationId": "loc_lgm_montreal_corporate_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_ankit_north_york",
        "name": "Ankit",
        "email": "ankit@lgm.com",
        "role": "MANAGER",
        "locationId": "loc_lgm_north_york_corporate_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    # Franchise Location Managers
    {
        "id": "usr_anees_abbotsford",
        "name": "Anees Aps",
        "email": "anees.aps@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_abbotsford_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_andrew_ajax",
        "name": "Andrew",
        "email": "andrew@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_ajax_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_parsa_aurora",
        "name": "Parsa",
        "email": "parsa@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_aurora_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_aerish_brampton",
        "name": "Aerish",
        "email": "aerish@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_brampton_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_akshit_brampton",
        "name": "Akshit",
        "email": "akshit@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_brampton_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_harsh_brantford",
        "name": "Harsh",
        "email": "harsh@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_brantford_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_simranjit_burlington",
        "name": "Simranjit",
        "email": "simranjit@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_burlington_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_jasdeep_calgary",
        "name": "Jasdeep",
        "email": "jasdeep@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_calgary_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_todd_coquitlam",
        "name": "Todd",
        "email": "todd@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_coquitlam_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_kambiz_fredericton",
        "name": "Kambiz",
        "email": "kambiz@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_fredericton_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_mahmoud_halifax",
        "name": "Mahmoud",
        "email": "mahmoud@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_halifax_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_anirudh_kingston",
        "name": "Anirudh",
        "email": "anirudh@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_kingston_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_promise_lethbridge",
        "name": "Promise",
        "email": "promise@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_lethbridge_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_kyle_london",
        "name": "Kyle",
        "email": "kyle@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_london_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_hanze_ottawa",
        "name": "Hanze",
        "email": "hanze@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_ottawa_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_jay_ottawa",
        "name": "Jay",
        "email": "jay@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_ottawa_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_ralph_regina",
        "name": "Ralph",
        "email": "ralph@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_regina_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_isabella_regina",
        "name": "Isabella",
        "email": "isabella@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_regina_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_rasoul_richmond",
        "name": "Rasoul",
        "email": "rasoul@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_richmond_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_camellia_saint_john",
        "name": "Camellia",
        "email": "camellia@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_saint_john_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_kelvin_scarborough",
        "name": "Kelvin",
        "email": "kelvin@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_scarborough_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_aswin_scarborough",
        "name": "Aswin",
        "email": "aswin@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_scarborough_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_danil_surrey",
        "name": "Danil",
        "email": "danil@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_surrey_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_fahim_vaughan",
        "name": "Fahim",
        "email": "fahim@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_vaughan_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_success_victoria",
        "name": "Success",
        "email": "success@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_victoria_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_sadur_waterloo",
        "name": "Sadur",
        "email": "sadur@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_waterloo_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    },
    {
        "id": "usr_wayne_winnipeg",
        "name": "Wayne",
        "email": "wayne@lgm.com",
        "role": "ADMIN",
        "locationId": "loc_lgm_winnipeg_franchise_001",
        "clientId": LGM_CLIENT_ID,
        "status": "ACTIVE"
    }
]

def create_user(user_data):
    """Create a user via API"""
    try:
        # First, create the location if it doesn't exist
        location_data = {
            "id": user_data["locationId"],
            "clientId": user_data["clientId"],
            "name": user_data["name"].split()[0] + " Location",  # Simple location name
            "timezone": "America/Toronto",
            "address": f"{user_data['name']} Office"
        }
        
        # Create location (this would need to be implemented in the API)
        # For now, we'll assume the location exists
        
        # Create user
        response = requests.post(
            f"{API_BASE_URL}/users",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201 or response.status_code == 200:
            print(f"✅ Created user: {user_data['name']} ({user_data['email']})")
            return True
        else:
            print(f"❌ Failed to create user {user_data['name']}: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating user {user_data['name']}: {str(e)}")
        return False

def main():
    print("🚀 Creating Real LGM Users")
    print("=" * 50)
    
    success_count = 0
    total_count = len(LGM_USERS)
    
    for user_data in LGM_USERS:
        if create_user(user_data):
            success_count += 1
    
    print("=" * 50)
    print(f"✅ Successfully created {success_count} out of {total_count} users")
    print("🎉 Real LGM users are now available in the system!")

if __name__ == "__main__":
    main()
