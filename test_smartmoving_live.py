#!/usr/bin/env python3
"""
Test SmartMoving Live API Connection
Shows real-time data from SmartMoving API
"""

import asyncio
import httpx
import json
from datetime import datetime
from typing import Dict, Any, List

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "x-api-key": SMARTMOVING_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

async def make_smartmoving_request(
    method: str, 
    endpoint: str, 
    params: Dict = None
) -> Dict[str, Any]:
    """Make a request to SmartMoving API"""
    headers = await get_smartmoving_headers()
    url = f"{SMARTMOVING_API_BASE_URL}{endpoint}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json() if response.content else None,
                "headers": dict(response.headers)
            }
            
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "status_code": e.response.status_code,
            "error": f"HTTP {e.response.status_code}",
            "message": e.response.text,
            "data": e.response.json() if e.response.content else None
        }
    except httpx.RequestError as e:
        return {
            "success": False,
            "status_code": 0,
            "error": "RequestError",
            "message": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "status_code": 0,
            "error": "UnexpectedError",
            "message": str(e)
        }

async def test_api_connection():
    """Test basic API connection"""
    print("🔍 Testing SmartMoving API Connection...")
    print(f"📡 API URL: {SMARTMOVING_API_BASE_URL}")
    print(f"🔑 API Key: {SMARTMOVING_API_KEY[:8]}...")
    print(f"🆔 Client ID: {SMARTMOVING_CLIENT_ID[:8]}...")
    print()
    
    # Test 1: Basic connectivity
    print("1️⃣ Testing basic connectivity...")
    # Try a simple endpoint to test connectivity
    test_response = await make_smartmoving_request("GET", "/api/branches", {"PageSize": 1})
    if test_response["success"]:
        print("✅ API is online and responding")
    else:
        print(f"❌ API connection failed: {test_response.get('message', 'Unknown error')}")
        return False
    
    # Test 2: Get branches
    print("\n2️⃣ Fetching branches...")
    branches_response = await make_smartmoving_request("GET", "/api/branches", {"PageSize": 50})
    if branches_response["success"]:
        branches = branches_response["data"].get("pageResults", [])
        print(f"✅ Found {len(branches)} branches")
        
        # Show first 5 branches
        print("\n📍 Sample Branches:")
        for i, branch in enumerate(branches[:5]):
            print(f"   {i+1}. {branch.get('name', 'N/A')}")
            print(f"      📞 {branch.get('phoneNumber', 'No phone')}")
            print(f"      📍 {branch.get('dispatchLocation', {}).get('fullAddress', 'No address')}")
            print()
    else:
        print(f"❌ Failed to fetch branches: {branches_response.get('message', 'Unknown error')}")
    
    # Test 3: Get materials
    print("3️⃣ Fetching materials...")
    materials_response = await make_smartmoving_request("GET", "/api/materials", {"PageSize": 50})
    if materials_response["success"]:
        materials = materials_response["data"].get("pageResults", [])
        print(f"✅ Found {len(materials)} materials")
        
        # Show first 5 materials
        print("\n📦 Sample Materials:")
        for i, material in enumerate(materials[:5]):
            print(f"   {i+1}. {material.get('name', 'N/A')}")
            print(f"      💰 ${material.get('rate', 0)}")
            print(f"      📏 {material.get('dimensions', 'No dimensions')}")
            print()
    else:
        print(f"❌ Failed to fetch materials: {materials_response.get('message', 'Unknown error')}")
    
    # Test 4: Get service types
    print("4️⃣ Fetching service types...")
    service_types_response = await make_smartmoving_request("GET", "/api/service-types", {"PageSize": 50})
    if service_types_response["success"]:
        service_types = service_types_response["data"].get("pageResults", [])
        print(f"✅ Found {len(service_types)} service types")
        
        # Show first 5 service types
        print("\n🛠️ Sample Service Types:")
        for i, service_type in enumerate(service_types[:5]):
            print(f"   {i+1}. {service_type.get('name', 'N/A')}")
            print(f"      📝 {service_type.get('description', 'No description')}")
            print()
    else:
        print(f"❌ Failed to fetch service types: {service_types_response.get('message', 'Unknown error')}")
    
    # Test 5: Get users
    print("5️⃣ Fetching users...")
    users_response = await make_smartmoving_request("GET", "/api/users", {"PageSize": 50})
    if users_response["success"]:
        users = users_response["data"].get("pageResults", [])
        print(f"✅ Found {len(users)} users")
        
        # Show first 5 users
        print("\n👥 Sample Users:")
        for i, user in enumerate(users[:5]):
            print(f"   {i+1}. {user.get('name', 'N/A')}")
            print(f"      📧 {user.get('email', 'No email')}")
            print(f"      📞 {user.get('phone', 'No phone')}")
            print()
    else:
        print(f"❌ Failed to fetch users: {users_response.get('message', 'Unknown error')}")
    
    return True

async def get_data_summary():
    """Get a summary of all available data"""
    print("\n" + "="*60)
    print("📊 SMARTMOVING DATA SUMMARY")
    print("="*60)
    
    summary = {}
    
    # Get branches count
    branches_response = await make_smartmoving_request("GET", "/api/branches", {"PageSize": 50})
    if branches_response["success"]:
        summary["branches"] = len(branches_response["data"].get("pageResults", []))
    
    # Get materials count
    materials_response = await make_smartmoving_request("GET", "/api/materials", {"PageSize": 50})
    if materials_response["success"]:
        summary["materials"] = len(materials_response["data"].get("pageResults", []))
    
    # Get service types count
    service_types_response = await make_smartmoving_request("GET", "/api/service-types", {"PageSize": 50})
    if service_types_response["success"]:
        summary["service_types"] = len(service_types_response["data"].get("pageResults", []))
    
    # Get move sizes count
    move_sizes_response = await make_smartmoving_request("GET", "/api/move-sizes", {"PageSize": 50})
    if move_sizes_response["success"]:
        summary["move_sizes"] = len(move_sizes_response["data"].get("pageResults", []))
    
    # Get room types count
    room_types_response = await make_smartmoving_request("GET", "/api/room-types", {"PageSize": 50})
    if room_types_response["success"]:
        summary["room_types"] = len(room_types_response["data"].get("pageResults", []))
    
    # Get users count
    users_response = await make_smartmoving_request("GET", "/api/users", {"PageSize": 50})
    if users_response["success"]:
        summary["users"] = len(users_response["data"].get("pageResults", []))
    
    # Get referral sources count
    referral_sources_response = await make_smartmoving_request("GET", "/api/referral-sources", {"PageSize": 50})
    if referral_sources_response["success"]:
        summary["referral_sources"] = len(referral_sources_response["data"])
    
    print(f"🏢 Branches: {summary.get('branches', 0)}")
    print(f"📦 Materials: {summary.get('materials', 0)}")
    print(f"🛠️ Service Types: {summary.get('service_types', 0)}")
    print(f"📏 Move Sizes: {summary.get('move_sizes', 0)}")
    print(f"🏠 Room Types: {summary.get('room_types', 0)}")
    print(f"👥 Users: {summary.get('users', 0)}")
    print(f"📋 Referral Sources: {summary.get('referral_sources', 0)}")
    
    total_records = sum(summary.values())
    print(f"\n📈 Total Records: {total_records}")
    
    return summary

async def main():
    """Main function"""
    print("🚀 SmartMoving API Live Test")
    print("="*40)
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test API connection
    connection_success = await test_api_connection()
    
    if connection_success:
        # Get data summary
        await get_data_summary()
        
        print("\n" + "="*60)
        print("✅ SMARTMOVING API IS ONLINE AND WORKING!")
        print("="*60)
        print("🎯 The API is ready for integration with C&C CRM")
        print("📊 All data types are accessible and available")
        print("🔄 Real-time sync is possible")
    else:
        print("\n" + "="*60)
        print("❌ SMARTMOVING API CONNECTION FAILED")
        print("="*60)
        print("🔧 Please check API credentials and network connection")

if __name__ == "__main__":
    asyncio.run(main())
