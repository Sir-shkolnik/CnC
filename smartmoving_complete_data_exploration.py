#!/usr/bin/env python3
"""
SmartMoving Complete Data Exploration
=====================================

This script explores ALL available data from SmartMoving API to see what we can get
beyond the basic customer/job data we already downloaded.

Key areas to explore:
1. Branch locations with GPS coordinates
2. User/crew information
3. Inventory and materials
4. Tariffs and pricing
5. Service types and move sizes
6. Referral sources
7. Room types and inventory structure
"""

import asyncio
import httpx
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
import os

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"

# Create output directory
OUTPUT_DIR = "smartmoving_complete_exploration"
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "x-api-key": SMARTMOVING_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

async def make_api_request(client: httpx.AsyncClient, endpoint: str, params: Dict = None) -> Dict:
    """Make a request to SmartMoving API"""
    url = f"{SMARTMOVING_API_BASE_URL}{endpoint}"
    headers = await get_smartmoving_headers()
    
    try:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP Error for {endpoint}: {e.response.status_code}")
        return {"error": f"HTTP {e.response.status_code}", "details": str(e)}
    except Exception as e:
        print(f"❌ Error for {endpoint}: {str(e)}")
        return {"error": str(e)}

async def explore_branches(client: httpx.AsyncClient) -> Dict:
    """Explore branch locations with GPS coordinates"""
    print("🔍 Exploring branches...")
    
    result = await make_api_request(client, "/api/branches", {"PageSize": 50})
    
    if "error" not in result:
        print(f"✅ Found {len(result.get('pageResults', []))} branches")
        
        # Extract key information
        branches_data = {
            "total_branches": len(result.get('pageResults', [])),
            "branches": []
        }
        
        for branch in result.get('pageResults', []):
            branch_info = {
                "id": branch.get("id"),
                "name": branch.get("name"),
                "phone": branch.get("phoneNumber"),
                "is_primary": branch.get("isPrimary", False),
                "dispatch_location": {
                    "full_address": branch.get("dispatchLocation", {}).get("fullAddress"),
                    "street": branch.get("dispatchLocation", {}).get("street"),
                    "city": branch.get("dispatchLocation", {}).get("city"),
                    "state": branch.get("dispatchLocation", {}).get("state"),
                    "zip": branch.get("dispatchLocation", {}).get("zip"),
                    "latitude": branch.get("dispatchLocation", {}).get("lat"),
                    "longitude": branch.get("dispatchLocation", {}).get("lng"),
                }
            }
            branches_data["branches"].append(branch_info)
        
        return branches_data
    else:
        print(f"❌ Failed to get branches: {result['error']}")
        return result

async def explore_users(client: httpx.AsyncClient) -> Dict:
    """Explore users (office users, not crew members)"""
    print("👥 Exploring users...")
    
    result = await make_api_request(client, "/api/users", {"PageSize": 50})
    
    if "error" not in result:
        print(f"✅ Found {len(result.get('pageResults', []))} users")
        
        users_data = {
            "total_users": len(result.get('pageResults', [])),
            "users": []
        }
        
        for user in result.get('pageResults', []):
            user_info = {
                "id": user.get("id"),
                "name": user.get("name"),
                "title": user.get("title"),
                "email": user.get("email"),
                "primary_branch": {
                    "id": user.get("primaryBranch", {}).get("id") if user.get("primaryBranch") else None,
                    "name": user.get("primaryBranch", {}).get("name") if user.get("primaryBranch") else None
                },
                "role": {
                    "id": user.get("role", {}).get("id") if user.get("role") else None,
                    "name": user.get("role", {}).get("name") if user.get("role") else None
                }
            }
            users_data["users"].append(user_info)
        
        return users_data
    else:
        print(f"❌ Failed to get users: {result['error']}")
        return result

async def explore_inventory(client: httpx.AsyncClient) -> Dict:
    """Explore master inventory list"""
    print("📦 Exploring master inventory...")
    
    result = await make_api_request(client, "/api/premium/inventory", {"PageSize": 50})
    
    if "error" not in result:
        print(f"✅ Found {len(result.get('pageResults', []))} inventory items")
        
        inventory_data = {
            "total_items": len(result.get('pageResults', [])),
            "inventory_items": []
        }
        
        for item in result.get('pageResults', []):
            item_info = {
                "id": item.get("id"),
                "name": item.get("name"),
                "description": item.get("description"),
                "short_code": item.get("shortCode"),
                "volume": item.get("volume"),
                "weight": item.get("weight")
            }
            inventory_data["inventory_items"].append(item_info)
        
        return inventory_data
    else:
        print(f"❌ Failed to get inventory: {result['error']}")
        return result

async def explore_materials(client: httpx.AsyncClient) -> Dict:
    """Explore materials by getting a sample tariff first"""
    print("📋 Exploring materials...")
    
    # First get tariffs
    tariffs_result = await make_api_request(client, "/api/tariffs", {"PageSize": 5})
    
    materials_data = {
        "tariffs": [],
        "materials_by_tariff": {}
    }
    
    if "error" not in tariffs_result:
        tariffs = tariffs_result.get('pageResults', [])
        print(f"✅ Found {len(tariffs)} tariffs, exploring materials for first tariff")
        
        for tariff in tariffs[:3]:  # Limit to 3 tariffs
            tariff_id = tariff.get("id")
            tariff_name = tariff.get("name")
            
            materials_data["tariffs"].append({
                "id": tariff_id,
                "name": tariff_name,
                "is_enabled": tariff.get("isEnabled", False)
            })
            
            # Get materials for this tariff
            materials_result = await make_api_request(
                client, 
                f"/api/premium/tariffs/{tariff_id}/materials"
            )
            
            if "error" not in materials_result:
                materials = materials_result.get('pageResults', [])
                print(f"  📦 Tariff '{tariff_name}': {len(materials)} materials")
                
                materials_data["materials_by_tariff"][tariff_id] = {
                    "tariff_name": tariff_name,
                    "materials": []
                }
                
                for material in materials:
                    material_info = {
                        "id": material.get("id"),
                        "name": material.get("name"),
                        "description": material.get("description"),
                        "rate": material.get("rate"),
                        "unit": material.get("unit"),
                        "category": material.get("category")
                    }
                    materials_data["materials_by_tariff"][tariff_id]["materials"].append(material_info)
            else:
                print(f"  ❌ Failed to get materials for tariff {tariff_name}: {materials_result['error']}")
    
    return materials_data

async def explore_service_types(client: httpx.AsyncClient) -> Dict:
    """Explore service types"""
    print("🛠️ Exploring service types...")
    
    result = await make_api_request(client, "/api/service-types", {"PageSize": 50})
    
    if "error" not in result:
        print(f"✅ Found {len(result.get('pageResults', []))} service types")
        
        service_types_data = {
            "total_service_types": len(result.get('pageResults', [])),
            "service_types": []
        }
        
        for service_type in result.get('pageResults', []):
            service_info = {
                "id": service_type.get("id"),
                "name": service_type.get("name"),
                "scaling_factor_percentage": service_type.get("scalingFactorPercentage"),
                "has_activity_loading": service_type.get("hasActivityLoading"),
                "has_activity_finished_loading": service_type.get("hasActivityFinishedLoading"),
                "has_activity_unloading": service_type.get("hasActivityUnloading"),
                "order": service_type.get("order")
            }
            service_types_data["service_types"].append(service_info)
        
        return service_types_data
    else:
        print(f"❌ Failed to get service types: {result['error']}")
        return result

async def explore_move_sizes(client: httpx.AsyncClient) -> Dict:
    """Explore move sizes"""
    print("📏 Exploring move sizes...")
    
    result = await make_api_request(client, "/api/move-sizes", {"PageSize": 50})
    
    if "error" not in result:
        print(f"✅ Found {len(result.get('pageResults', []))} move sizes")
        
        move_sizes_data = {
            "total_move_sizes": len(result.get('pageResults', [])),
            "move_sizes": []
        }
        
        for move_size in result.get('pageResults', []):
            move_size_info = {
                "id": move_size.get("id"),
                "name": move_size.get("name"),
                "description": move_size.get("description"),
                "volume": move_size.get("volume"),
                "weight": move_size.get("weight")
            }
            move_sizes_data["move_sizes"].append(move_size_info)
        
        return move_sizes_data
    else:
        print(f"❌ Failed to get move sizes: {result['error']}")
        return result

async def explore_room_types(client: httpx.AsyncClient) -> Dict:
    """Explore room types"""
    print("🏠 Exploring room types...")
    
    result = await make_api_request(client, "/api/premium/room-types", {"PageSize": 50})
    
    if "error" not in result:
        print(f"✅ Found {len(result.get('pageResults', []))} room types")
        
        room_types_data = {
            "total_room_types": len(result.get('pageResults', [])),
            "room_types": []
        }
        
        for room_type in result.get('pageResults', []):
            room_type_info = {
                "id": room_type.get("id"),
                "name": room_type.get("name"),
                "description": room_type.get("description"),
                "order": room_type.get("order")
            }
            room_types_data["room_types"].append(room_type_info)
        
        return room_types_data
    else:
        print(f"❌ Failed to get room types: {result['error']}")
        return result

async def explore_referral_sources(client: httpx.AsyncClient) -> Dict:
    """Explore referral sources"""
    print("📞 Exploring referral sources...")
    
    result = await make_api_request(client, "/api/referral-sources", {"PageSize": 50})
    
    if "error" not in result:
        print(f"✅ Found {len(result.get('pageResults', []))} referral sources")
        
        referral_sources_data = {
            "total_referral_sources": len(result.get('pageResults', [])),
            "referral_sources": []
        }
        
        for referral_source in result.get('pageResults', []):
            referral_info = {
                "id": referral_source.get("id"),
                "name": referral_source.get("name"),
                "is_lead_provider": referral_source.get("isLeadProvider", False),
                "is_public": referral_source.get("isPublic", False)
            }
            referral_sources_data["referral_sources"].append(referral_info)
        
        return referral_sources_data
    else:
        print(f"❌ Failed to get referral sources: {result['error']}")
        return result

async def explore_detailed_opportunity(client: httpx.AsyncClient, opportunity_id: str) -> Dict:
    """Explore detailed opportunity with all includes"""
    print(f"🔍 Exploring detailed opportunity {opportunity_id}...")
    
    # Get opportunity with all includes
    params = {
        "IncludeTripInfo": True,
        "IncludePayments": True,
        "IncludeSurveys": True,
        "IncludeJobAddresses": True,
        "IncludeTasks": True,
        "IncludeFiles": True,
        "IncludePhotos": True,
        "IncludeDocuments": True,
        "IncludeCharges": True
    }
    
    result = await make_api_request(client, f"/api/opportunities/{opportunity_id}", params)
    
    if "error" not in result:
        print(f"✅ Got detailed opportunity data")
        
        # Extract key operational data
        detailed_data = {
            "opportunity_id": opportunity_id,
            "trip_info": result.get("tripInfo", {}),
            "surveys": result.get("surveys", []),
            "tasks": result.get("tasks", []),
            "files": result.get("opportunityFiles", []),
            "photos": result.get("photos", []),
            "documents": result.get("opportunityDocuments", []),
            "payments": result.get("payments", []),
            "jobs": []
        }
        
        # Extract detailed job information
        for job in result.get("jobs", []):
            job_detail = {
                "id": job.get("id"),
                "job_number": job.get("jobNumber"),
                "job_date": job.get("jobDate"),
                "type": job.get("type"),
                "confirmed": job.get("confirmed"),
                "job_addresses": job.get("jobAddresses", []),
                "estimated_charges": job.get("estimatedCharges", []),
                "actual_charges": job.get("actualCharges", [])
            }
            detailed_data["jobs"].append(job_detail)
        
        return detailed_data
    else:
        print(f"❌ Failed to get detailed opportunity: {result['error']}")
        return result

async def main():
    """Main exploration function"""
    print("🚀 Starting SmartMoving Complete Data Exploration")
    print("=" * 60)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Test API connection first
        ping_result = await make_api_request(client, "/api/ping")
        if "error" in ping_result:
            print("❌ API connection failed")
            return
        
        print("✅ API connection successful")
        
        # Explore all data types
        exploration_results = {
            "exploration_timestamp": timestamp,
            "api_base_url": SMARTMOVING_API_BASE_URL,
            "results": {}
        }
        
        # 1. Branch locations (with GPS!)
        print("\n" + "="*60)
        branches_data = await explore_branches(client)
        exploration_results["results"]["branches"] = branches_data
        
        # 2. Users (office users)
        print("\n" + "="*60)
        users_data = await explore_users(client)
        exploration_results["results"]["users"] = users_data
        
        # 3. Master inventory
        print("\n" + "="*60)
        inventory_data = await explore_inventory(client)
        exploration_results["results"]["inventory"] = inventory_data
        
        # 4. Materials by tariff
        print("\n" + "="*60)
        materials_data = await explore_materials(client)
        exploration_results["results"]["materials"] = materials_data
        
        # 5. Service types
        print("\n" + "="*60)
        service_types_data = await explore_service_types(client)
        exploration_results["results"]["service_types"] = service_types_data
        
        # 6. Move sizes
        print("\n" + "="*60)
        move_sizes_data = await explore_move_sizes(client)
        exploration_results["results"]["move_sizes"] = move_sizes_data
        
        # 7. Room types
        print("\n" + "="*60)
        room_types_data = await explore_room_types(client)
        exploration_results["results"]["room_types"] = room_types_data
        
        # 8. Referral sources
        print("\n" + "="*60)
        referral_sources_data = await explore_referral_sources(client)
        exploration_results["results"]["referral_sources"] = referral_sources_data
        
        # 9. Detailed opportunity (if we have one from previous data)
        print("\n" + "="*60)
        # Use the first opportunity ID from our previous sample data
        sample_opportunity_id = "c1bec13b-6030-4021-a061-b32e012476ce"  # From our sample
        detailed_opportunity = await explore_detailed_opportunity(client, sample_opportunity_id)
        exploration_results["results"]["detailed_opportunity"] = detailed_opportunity
        
        # Save all results
        output_file = f"{OUTPUT_DIR}/smartmoving_complete_exploration_{timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(exploration_results, f, indent=2, default=str)
        
        print(f"\n✅ Complete exploration saved to: {output_file}")
        
        # Generate summary
        print("\n" + "="*60)
        print("📊 EXPLORATION SUMMARY")
        print("="*60)
        
        summary = {
            "branches_found": len(exploration_results["results"].get("branches", {}).get("branches", [])),
            "users_found": len(exploration_results["results"].get("users", {}).get("users", [])),
            "inventory_items": len(exploration_results["results"].get("inventory", {}).get("inventory_items", [])),
            "service_types": len(exploration_results["results"].get("service_types", {}).get("service_types", [])),
            "move_sizes": len(exploration_results["results"].get("move_sizes", {}).get("move_sizes", [])),
            "room_types": len(exploration_results["results"].get("room_types", {}).get("room_types", [])),
            "referral_sources": len(exploration_results["results"].get("referral_sources", {}).get("referral_sources", [])),
            "tariffs_with_materials": len(exploration_results["results"].get("materials", {}).get("materials_by_tariff", {}))
        }
        
        for key, value in summary.items():
            print(f"  {key.replace('_', ' ').title()}: {value}")
        
        # Check for GPS coordinates in branches
        branches = exploration_results["results"].get("branches", {}).get("branches", [])
        branches_with_gps = sum(1 for b in branches if b.get("dispatch_location", {}).get("latitude") is not None)
        print(f"  Branches with GPS coordinates: {branches_with_gps}/{len(branches)}")
        
        print(f"\n📁 Full results saved to: {output_file}")

if __name__ == "__main__":
    asyncio.run(main())
