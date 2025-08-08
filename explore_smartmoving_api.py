#!/usr/bin/env python3
"""
SmartMoving API Exploration Script
Purpose: Discover SmartMoving API structure and map LGM Burnaby location
"""

import asyncio
import httpx
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api.smartmoving.com"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"

# LGM Configuration
LGM_CLIENT_ID = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
LGM_BURNABY_LOCATION_ID = "loc_lgm_burnaby_corporate_001"

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "Authorization": f"Bearer {SMARTMOVING_API_KEY}",
        "X-Client-ID": SMARTMOVING_CLIENT_ID,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

async def test_endpoint(endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
    """Test a SmartMoving API endpoint"""
    url = f"{SMARTMOVING_API_BASE_URL}{endpoint}"
    headers = await get_smartmoving_headers()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Testing endpoint: {endpoint}")
            logger.info(f"URL: {url}")
            logger.info(f"Headers: {json.dumps(headers, indent=2)}")
            if params:
                logger.info(f"Params: {json.dumps(params, indent=2)}")
            
            response = await client.get(url, headers=headers, params=params)
            
            logger.info(f"Status Code: {response.status_code}")
            logger.info(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    logger.info(f"Response Data: {json.dumps(data, indent=2)}")
                    return {
                        "success": True,
                        "status_code": response.status_code,
                        "data": data,
                        "endpoint": endpoint
                    }
                except json.JSONDecodeError:
                    logger.info(f"Response Text (non-JSON): {response.text}")
                    return {
                        "success": True,
                        "status_code": response.status_code,
                        "data": response.text,
                        "endpoint": endpoint
                    }
            else:
                logger.error(f"HTTP Error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": response.text,
                    "endpoint": endpoint
                }
                
    except Exception as e:
        logger.error(f"Request failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "endpoint": endpoint
        }

async def explore_smartmoving_api():
    """Explore SmartMoving API structure"""
    
    print("🚀 SmartMoving API Exploration")
    print("=" * 50)
    
    # Test endpoints to discover API structure
    endpoints_to_test = [
        # Health and basic endpoints
        "/api/health",
        "/api/status",
        "/api/version",
        
        # Location endpoints
        "/api/locations",
        "/api/offices",
        "/api/locations/active",
        
        # Job/Estimate endpoints
        "/api/estimates",
        "/api/jobs",
        "/api/moves",
        "/api/schedules",
        
        # Customer endpoints
        "/api/customers",
        "/api/contacts",
        
        # Crew endpoints
        "/api/crew",
        "/api/employees",
        "/api/users",
        
        # Equipment endpoints
        "/api/trucks",
        "/api/equipment",
        "/api/vehicles",
        
        # Reporting endpoints
        "/api/reports",
        "/api/analytics",
        "/api/dashboard"
    ]
    
    results = {}
    
    for endpoint in endpoints_to_test:
        print(f"\n🔍 Testing: {endpoint}")
        result = await test_endpoint(endpoint)
        results[endpoint] = result
        
        if result["success"]:
            print(f"✅ Success: {result['status_code']}")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        
        # Small delay to be respectful to the API
        await asyncio.sleep(1)
    
    return results

async def find_burnaby_location():
    """Find SmartMoving location that matches LGM Burnaby"""
    
    print("\n🏢 Finding LGM Burnaby Location")
    print("=" * 50)
    
    # Test location endpoints
    location_endpoints = [
        "/api/locations",
        "/api/offices",
        "/api/locations/active"
    ]
    
    burnaby_location = None
    
    for endpoint in location_endpoints:
        print(f"\n🔍 Testing location endpoint: {endpoint}")
        result = await test_endpoint(endpoint)
        
        if result["success"] and isinstance(result["data"], list):
            locations = result["data"]
            print(f"Found {len(locations)} locations")
            
            # Look for Burnaby location
            for location in locations:
                location_name = location.get("name", "").lower()
                location_city = location.get("city", "").lower()
                location_address = location.get("address", "").lower()
                
                # Check for Burnaby references
                if any(keyword in location_name or keyword in location_city or keyword in location_address 
                       for keyword in ["burnaby", "bc", "british columbia", "vancouver"]):
                    print(f"🎯 Found potential Burnaby location: {location}")
                    burnaby_location = location
                    break
            
            if burnaby_location:
                break
        elif result["success"] and isinstance(result["data"], dict):
            # Handle single location response
            location = result["data"]
            location_name = location.get("name", "").lower()
            if "burnaby" in location_name:
                print(f"🎯 Found Burnaby location: {location}")
                burnaby_location = location
                break
    
    return burnaby_location

async def get_jobs_for_location(location_id: str, date: str = None):
    """Get jobs for a specific location and date"""
    
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    
    print(f"\n📋 Getting Jobs for Location {location_id} on {date}")
    print("=" * 50)
    
    # Test different job endpoints with location filter
    job_endpoints = [
        f"/api/estimates?locationId={location_id}&startDate={date}&endDate={date}",
        f"/api/jobs?locationId={location_id}&startDate={date}&endDate={date}",
        f"/api/moves?locationId={location_id}&startDate={date}&endDate={date}",
        f"/api/schedules?locationId={location_id}&date={date}",
        f"/api/estimates?locationId={location_id}",
        f"/api/jobs?locationId={location_id}",
        f"/api/moves?locationId={location_id}"
    ]
    
    jobs_data = []
    
    for endpoint in job_endpoints:
        print(f"\n🔍 Testing job endpoint: {endpoint}")
        result = await test_endpoint(endpoint)
        
        if result["success"]:
            if isinstance(result["data"], list):
                jobs_data.extend(result["data"])
                print(f"Found {len(result['data'])} jobs")
            elif isinstance(result["data"], dict):
                jobs_data.append(result["data"])
                print("Found 1 job")
        
        await asyncio.sleep(1)
    
    return jobs_data

async def analyze_job_structure(jobs: List[Dict[str, Any]]):
    """Analyze the structure of job data"""
    
    print(f"\n📊 Analyzing Job Data Structure")
    print("=" * 50)
    
    if not jobs:
        print("❌ No jobs found to analyze")
        return
    
    print(f"Found {len(jobs)} jobs to analyze")
    
    # Analyze first job structure
    sample_job = jobs[0]
    print(f"\n📋 Sample Job Structure:")
    print(json.dumps(sample_job, indent=2))
    
    # Extract key fields
    key_fields = {
        "id": sample_job.get("id"),
        "status": sample_job.get("status"),
        "moveDate": sample_job.get("moveDate"),
        "locationId": sample_job.get("locationId"),
        "customerId": sample_job.get("customerId"),
        "originAddress": sample_job.get("originAddress"),
        "destinationAddress": sample_job.get("destinationAddress"),
        "crew": sample_job.get("crew"),
        "truck": sample_job.get("truck"),
        "totalAmount": sample_job.get("totalAmount")
    }
    
    print(f"\n🔑 Key Fields Extracted:")
    for field, value in key_fields.items():
        print(f"  {field}: {value}")
    
    return key_fields

async def test_customer_endpoints():
    """Test customer-related endpoints"""
    
    print(f"\n👥 Testing Customer Endpoints")
    print("=" * 50)
    
    customer_endpoints = [
        "/api/customers",
        "/api/contacts",
        "/api/customers/active"
    ]
    
    for endpoint in customer_endpoints:
        print(f"\n🔍 Testing: {endpoint}")
        result = await test_endpoint(endpoint)
        
        if result["success"]:
            if isinstance(result["data"], list):
                print(f"Found {len(result['data'])} customers")
                if result["data"]:
                    print(f"Sample customer: {json.dumps(result['data'][0], indent=2)}")
            elif isinstance(result["data"], dict):
                print(f"Customer data: {json.dumps(result['data'], indent=2)}")
        
        await asyncio.sleep(1)

async def test_crew_endpoints():
    """Test crew/employee endpoints"""
    
    print(f"\n👷 Testing Crew Endpoints")
    print("=" * 50)
    
    crew_endpoints = [
        "/api/crew",
        "/api/employees",
        "/api/users",
        "/api/team"
    ]
    
    for endpoint in crew_endpoints:
        print(f"\n🔍 Testing: {endpoint}")
        result = await test_endpoint(endpoint)
        
        if result["success"]:
            if isinstance(result["data"], list):
                print(f"Found {len(result['data'])} crew members")
                if result["data"]:
                    print(f"Sample crew member: {json.dumps(result['data'][0], indent=2)}")
            elif isinstance(result["data"], dict):
                print(f"Crew data: {json.dumps(result['data'], indent=2)}")
        
        await asyncio.sleep(1)

async def main():
    """Main exploration function"""
    
    print("🚀 Starting SmartMoving API Exploration")
    print(f"Time: {datetime.now(timezone.utc).isoformat()}Z")
    print("=" * 50)
    
    # Step 1: Explore API structure
    print("\n📡 Step 1: Exploring API Structure")
    api_results = await explore_smartmoving_api()
    
    # Step 2: Find Burnaby location
    print("\n🏢 Step 2: Finding Burnaby Location")
    burnaby_location = await find_burnaby_location()
    
    if burnaby_location:
        print(f"✅ Found Burnaby location: {burnaby_location.get('name', 'Unknown')}")
        location_id = burnaby_location.get("id")
        
        # Step 3: Get jobs for Burnaby
        print(f"\n📋 Step 3: Getting Jobs for Burnaby")
        jobs = await get_jobs_for_location(location_id)
        
        if jobs:
            # Step 4: Analyze job structure
            job_structure = await analyze_job_structure(jobs)
            
            # Step 5: Test customer endpoints
            await test_customer_endpoints()
            
            # Step 6: Test crew endpoints
            await test_crew_endpoints()
            
            # Save results
            results = {
                "exploration_time": datetime.now(timezone.utc).isoformat(),
                "api_results": api_results,
                "burnaby_location": burnaby_location,
                "jobs": jobs,
                "job_structure": job_structure
            }
            
            with open("smartmoving_exploration_results.json", "w") as f:
                json.dump(results, f, indent=2, default=str)
            
            print(f"\n💾 Results saved to: smartmoving_exploration_results.json")
            
        else:
            print("❌ No jobs found for Burnaby location")
    else:
        print("❌ Could not find Burnaby location")
    
    print("\n🎉 API exploration completed!")

if __name__ == "__main__":
    asyncio.run(main())
