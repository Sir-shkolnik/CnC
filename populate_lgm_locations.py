#!/usr/bin/env python3
"""
LGM Locations Data Population Script
Populates the CRM system with real LGM location data
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

# Real LGM Location Data
LGM_LOCATIONS = {
    # Corporate Locations
    "corporate": [
        {
            "id": "loc_lgm_burnaby_corporate_001",
            "name": "BURNABY",
            "contact": "SHAHBAZ",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 5,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "7x6x7 - $99, Oversized +$50",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_downtown_toronto_corporate_001",
            "name": "DOWNTOWN TORONTO",
            "contact": "ARSHDEEP",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 6,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "5x10x12 - $350",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_edmonton_corporate_001",
            "name": "EDMONTON",
            "contact": "DANYLO",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 4,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "5x7x5 - $125, Oversized +$50",
            "cx_care": True,
            "province": "Alberta",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_hamilton_corporate_001",
            "name": "HAMILTON",
            "contact": "HAKAM",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 5,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "7x6x7 - $99, Oversized +$50",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_mississauga_corporate_001",
            "name": "MISSISSAUGA",
            "contact": "ARSHDEEP",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 3,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "7x6x7 - $99, Oversized +$50",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_montreal_corporate_001",
            "name": "MONTREAL",
            "contact": "BHANU",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 4,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "10x10x8 - $225, 10x20x8 - $399",
            "cx_care": True,
            "province": "Quebec",
            "region": "Eastern Canada"
        },
        {
            "id": "loc_lgm_northyork_corporate_001",
            "name": "NORTH YORK (TORONTO)",
            "contact": "ANKIT / ARSHDEEP",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 7,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "7x6x7 - $99, Oversized +$50",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_vancouver_corporate_001",
            "name": "VANCOUVER",
            "contact": "RASOUL",
            "direct_line": "",
            "ownership_type": "CORPORATE",
            "trucks": 11,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "7x6x7 - $99, Oversized +$50",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        }
    ],
    
    # Franchise Locations - Western Canada
    "franchise_western": [
        {
            "id": "loc_lgm_abbotsford_franchise_001",
            "name": "ABBOTSFORD",
            "contact": "Anees Aps",
            "direct_line": "780-920-1935",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_coquitlam_franchise_001",
            "name": "COQUITLAM",
            "contact": "TODD",
            "direct_line": "604-317-7615",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_kelowna_franchise_001",
            "name": "KELOWNA",
            "contact": "TODD",
            "direct_line": "604-317-7615",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "5x10x10 - $275 (3 PODs only)",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_richmond_franchise_001",
            "name": "RICHMOND",
            "contact": "RASOUL",
            "direct_line": "604-368-1061",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_surrey_franchise_001",
            "name": "SURREY",
            "contact": "DANIL",
            "direct_line": "416-817-7767",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_victoria_franchise_001",
            "name": "VICTORIA",
            "contact": "SUCCESS",
            "direct_line": "778-995-3069",
            "ownership_type": "FRANCHISE",
            "trucks": 2,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "British Columbia",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_calgary_franchise_001",
            "name": "CALGARY",
            "contact": "JASDEEP",
            "direct_line": "514-632-0313",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "8x10 - $199, 8x20 - $269, 8x40 - $399",
            "cx_care": False,
            "province": "Alberta",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_lethbridge_franchise_001",
            "name": "LETHBRIDGE",
            "contact": "PROMISE",
            "direct_line": "403-667-0507",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "13x9x10 - $199, 11x9x10 - $175, 11x8x10 - $150",
            "cx_care": True,
            "province": "Alberta",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_regina_franchise_001",
            "name": "REGINA",
            "contact": "RALPH / ISABELLA",
            "direct_line": "306-206-2448",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": ["SASKATOON"],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Saskatchewan",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_saskatoon_franchise_001",
            "name": "SASKATOON",
            "contact": "RALPH / ISABELLA",
            "direct_line": "306-206-2448",
            "ownership_type": "FRANCHISE",
            "trucks": 2,
            "shared_with": ["REGINA"],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Saskatchewan",
            "region": "Western Canada"
        },
        {
            "id": "loc_lgm_winnipeg_franchise_001",
            "name": "WINNIPEG",
            "contact": "Wayne",
            "direct_line": "204-391-4706",
            "ownership_type": "FRANCHISE",
            "trucks": 5,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "LG 12x12x15 - $250, MD 10x9x15 - $200, BIG 8x5.5x7 - $150, SM 5.5x5.5x4 - $100",
            "cx_care": True,
            "province": "Manitoba",
            "region": "Western Canada"
        }
    ],
    
    # Franchise Locations - Central Canada (Ontario)
    "franchise_ontario": [
        {
            "id": "loc_lgm_ajax_franchise_001",
            "name": "AJAX",
            "contact": "ANDREW",
            "direct_line": "(647) 904-8166",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_aurora_franchise_001",
            "name": "AURORA",
            "contact": "PARSA",
            "direct_line": "506-461-2035",
            "ownership_type": "FRANCHISE",
            "trucks": 2,
            "shared_with": ["BARRIE", "MARKHAM"],
            "storage_type": "LOCKER",
            "storage_pricing": "10×20 - $550, 10×15 - $390, 10×12 - $300, 10×10 - $250, 8×10 - $190",
            "cx_care": False,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_barrie_franchise_001",
            "name": "BARRIE",
            "contact": "PARSA",
            "direct_line": "506-461-2035",
            "ownership_type": "FRANCHISE",
            "trucks": 2,
            "shared_with": ["AURORA", "MARKHAM"],
            "storage_type": "LOCKER",
            "storage_pricing": "10×20 - $550, 10×15 - $390, 10×12 - $300, 10×10 - $250, 8×10 - $190",
            "cx_care": False,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_brampton_franchise_001",
            "name": "BRAMPTON",
            "contact": "AERISH / AKSHIT",
            "direct_line": "416-570-0828",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": ["MILTON", "OAKVILLE"],
            "storage_type": "LOCKER",
            "storage_pricing": "10x10x8 - $299, 10x20x8 - $499",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_markham_franchise_001",
            "name": "MARKHAM",
            "contact": "PARSA",
            "direct_line": "506-461-2035",
            "ownership_type": "FRANCHISE",
            "trucks": 2,
            "shared_with": ["AURORA", "BARRIE"],
            "storage_type": "LOCKER",
            "storage_pricing": "10×20 - $550, 10×15 - $390, 10×12 - $300, 10×10 - $250, 8×10 - $190",
            "cx_care": False,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_milton_franchise_001",
            "name": "MILTON",
            "contact": "AERISH / AKSHIT",
            "direct_line": "416-570-0828",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": ["BRAMPTON", "OAKVILLE"],
            "storage_type": "LOCKER",
            "storage_pricing": "10x10x8 - $299, 10x20x8 - $499",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_oakville_franchise_001",
            "name": "OAKVILLE",
            "contact": "AERISH / AKSHIT",
            "direct_line": "416-578-6021",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": ["BRAMPTON", "MILTON"],
            "storage_type": "LOCKER",
            "storage_pricing": "10x10x8 - $299, 10x20x8 - $499",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_oshawa_franchise_001",
            "name": "OSHAWA",
            "contact": "",
            "direct_line": "",
            "ownership_type": "FRANCHISE",
            "trucks": 0,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_scarborough_franchise_001",
            "name": "SCARBOROUGH",
            "contact": "KELVIN / ASWIN",
            "direct_line": "647-979-9910, 647-686-8542",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_vaughan_franchise_001",
            "name": "VAUGHAN",
            "contact": "FAHIM",
            "direct_line": "647-773-3640",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_brantford_franchise_001",
            "name": "BRANTFORD",
            "contact": "HARSH",
            "direct_line": "647-891-4106",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "Contact franchise",
            "cx_care": False,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_burlington_franchise_001",
            "name": "BURLINGTON",
            "contact": "SIMRANJIT",
            "direct_line": "647-512-2697, 647-460-0923",
            "ownership_type": "FRANCHISE",
            "trucks": 0,  # R+ indicates rental
            "shared_with": ["ST CATHERINES", "WINDSOR"],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_kingston_franchise_001",
            "name": "KINGSTON",
            "contact": "ANIRUDH",
            "direct_line": "613-893-7008",
            "ownership_type": "FRANCHISE",
            "trucks": 4,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "5x12x10 - $100, 10x12x10 - $175",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_london_franchise_001",
            "name": "LONDON",
            "contact": "KYLE",
            "direct_line": "226-219-7039",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_ottawa_franchise_001",
            "name": "OTTAWA",
            "contact": "HANZE/JAY",
            "direct_line": "266-808-4305, 613-276-5806",
            "ownership_type": "FRANCHISE",
            "trucks": 4,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "5x5x8 - $99, 10x10x8 - $299",
            "cx_care": False,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_peterborough_franchise_001",
            "name": "PETERBOROUGH",
            "contact": "ANDREW",
            "direct_line": "(647) 904-8166",
            "ownership_type": "FRANCHISE",
            "trucks": 2,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_stcatherines_franchise_001",
            "name": "ST CATHERINES",
            "contact": "SIMRANJIT",
            "direct_line": "647-512-2697",
            "ownership_type": "FRANCHISE",
            "trucks": 0,  # R+ indicates rental
            "shared_with": ["BURLINGTON", "WINDSOR"],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_waterloo_franchise_001",
            "name": "WATERLOO",
            "contact": "SADUR",
            "direct_line": "289-763-9495",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": [],
            "storage_type": "POD",
            "storage_pricing": "5x5x12 - $175, 10x5x12 - $300",
            "cx_care": False,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_windsor_franchise_001",
            "name": "WINDSOR",
            "contact": "SIMRANJIT",
            "direct_line": "647-512-2697",
            "ownership_type": "FRANCHISE",
            "trucks": 0,  # R+ indicates rental
            "shared_with": ["BURLINGTON", "ST CATHERINES"],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        },
        {
            "id": "loc_lgm_woodstock_franchise_001",
            "name": "WOODSTOCK",
            "contact": "N/A",
            "direct_line": "N/A",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "Ontario",
            "region": "Central Canada"
        }
    ],
    
    # Franchise Locations - Eastern Canada
    "franchise_eastern": [
        {
            "id": "loc_lgm_montreal_franchise_001",
            "name": "MONTREAL",
            "contact": "BHANU",
            "direct_line": "",
            "ownership_type": "FRANCHISE",
            "trucks": 4,
            "shared_with": [],
            "storage_type": "LOCKER",
            "storage_pricing": "10x10x8 - $225, 10x20x8 - $399",
            "cx_care": True,
            "province": "Quebec",
            "region": "Eastern Canada"
        },
        {
            "id": "loc_lgm_fredericton_franchise_001",
            "name": "FREDERICTON",
            "contact": "KAMBIZ",
            "direct_line": "506-259-8515",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "New Brunswick",
            "region": "Eastern Canada"
        },
        {
            "id": "loc_lgm_moncton_franchise_001",
            "name": "MONCTON",
            "contact": "",
            "direct_line": "",
            "ownership_type": "FRANCHISE",
            "trucks": 1,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": False,
            "province": "New Brunswick",
            "region": "Eastern Canada"
        },
        {
            "id": "loc_lgm_saintjohn_franchise_001",
            "name": "SAINT JOHN",
            "contact": "CAMELLIA",
            "direct_line": "506-688-2168",
            "ownership_type": "FRANCHISE",
            "trucks": 3,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": True,
            "province": "New Brunswick",
            "region": "Eastern Canada"
        },
        {
            "id": "loc_lgm_halifax_franchise_001",
            "name": "HALIFAX",
            "contact": "MAHMOUD",
            "direct_line": "506-461-4870",
            "ownership_type": "FRANCHISE",
            "trucks": 2,
            "shared_with": [],
            "storage_type": "NO",
            "storage_pricing": "",
            "cx_care": False,
            "province": "Nova Scotia",
            "region": "Eastern Canada"
        }
    ]
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

def create_location(token, location_data):
    """Create a new location"""
    # This would be implemented when the locations API is created
    # For now, we'll just print the location data
    print(f"  📍 {location_data['name']} ({location_data['ownership_type']})")
    print(f"     Contact: {location_data['contact']}")
    print(f"     Trucks: {location_data['trucks']}")
    print(f"     Storage: {location_data['storage_type']}")
    print(f"     CX Care: {'✅' if location_data['cx_care'] else '❌'}")
    return True

def main():
    """Main function to populate LGM locations"""
    print("🚀 LGM Locations Data Population")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    try:
        # Get authentication token
        print("🔐 Authenticating...")
        token = get_auth_token()
        print("✅ Authentication successful")
        
        total_locations = 0
        created_locations = 0
        
        # Process all location categories
        for category, locations in LGM_LOCATIONS.items():
            print(f"\n🏢 Processing {category.upper()} locations")
            print("-" * 50)
            
            for location_data in locations:
                total_locations += 1
                success = create_location(token, location_data)
                if success:
                    created_locations += 1
        
        print("\n" + "=" * 80)
        print("📊 LOCATION SUMMARY")
        print("=" * 80)
        
        # Calculate statistics
        corporate_count = len(LGM_LOCATIONS["corporate"])
        franchise_count = len(LGM_LOCATIONS["franchise_western"]) + len(LGM_LOCATIONS["franchise_ontario"]) + len(LGM_LOCATIONS["franchise_eastern"])
        
        print(f"🏢 Total Locations: {total_locations}")
        print(f"   • Corporate: {corporate_count}")
        print(f"   • Franchise: {franchise_count}")
        
        # Storage statistics
        storage_types = {"LOCKER": 0, "POD": 0, "NO": 0}
        cx_care_count = 0
        
        for category, locations in LGM_LOCATIONS.items():
            for location in locations:
                storage_types[location["storage_type"]] += 1
                if location["cx_care"]:
                    cx_care_count += 1
        
        print(f"\n📦 Storage Types:")
        print(f"   • LOCKER: {storage_types['LOCKER']}")
        print(f"   • POD: {storage_types['POD']}")
        print(f"   • NO STORAGE: {storage_types['NO']}")
        
        print(f"\n🎯 CX Care Locations: {cx_care_count}/{total_locations}")
        
        print(f"\n✅ Successfully processed {created_locations} locations")
        print("📋 Location data ready for CRM integration")
        
        print("\n🔧 NEXT STEPS:")
        print("1. Create locations API endpoint in backend")
        print("2. Integrate location data with journey management")
        print("3. Add location-based filtering to user management")
        print("4. Implement storage pricing in customer quotes")
        print("5. Add location contact integration for dispatch")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the API server is running on localhost:8000")

if __name__ == "__main__":
    main() 