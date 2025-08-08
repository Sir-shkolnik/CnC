#!/usr/bin/env python3
"""
SmartMoving Data Pull Script
Purpose: Pull data from SmartMoving API for one location, one date, and one job
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
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"

# LGM Configuration
LGM_CLIENT_ID = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
LGM_BURNABY_LOCATION_ID = "loc_lgm_burnaby_corporate_001"

async def get_smartmoving_headers() -> Dict[str, str]:
    """Get headers for SmartMoving API requests"""
    return {
        "x-api-key": SMARTMOVING_API_KEY,
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
            if params:
                logger.info(f"Params: {json.dumps(params, indent=2)}")
            
            response = await client.get(url, headers=headers, params=params)
            
            logger.info(f"Status Code: {response.status_code}")
            
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

async def test_api_connection():
    """Test basic API connectivity"""
    
    print("🔗 Testing SmartMoving API Connection")
    print("=" * 50)
    
    # Test ping endpoint
    result = await test_endpoint("/api/ping")
    
    if result["success"]:
        print("✅ API connection successful")
        return True
    else:
        print(f"❌ API connection failed: {result.get('error', 'Unknown error')}")
        return False

async def get_customers_for_date(date_str: str):
    """Get customers for a specific date"""
    
    print(f"\n👥 Getting Customers for Date: {date_str}")
    print("=" * 50)
    
    # Convert date to yyyyMMdd format
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    date_formatted = date_obj.strftime("%Y%m%d")
    
    params = {
        "FromServiceDate": int(date_formatted),
        "ToServiceDate": int(date_formatted),
        "IncludeOpportunityInfo": True,
        "Page": 1,
        "PageSize": 10
    }
    
    result = await test_endpoint("/api/customers", params)
    
    if result["success"]:
        customers = result["data"]
        print(f"✅ Found {len(customers)} customers for {date_str}")
        
        # Show first customer with opportunities
        if customers:
            first_customer = customers[0]
            print(f"\n📋 Sample Customer:")
            print(f"  Name: {first_customer.get('name', 'N/A')}")
            print(f"  Phone: {first_customer.get('phoneNumber', 'N/A')}")
            print(f"  Email: {first_customer.get('emailAddress', 'N/A')}")
            
            opportunities = first_customer.get('opportunities', [])
            print(f"  Opportunities: {len(opportunities)}")
            
            if opportunities:
                first_opportunity = opportunities[0]
                print(f"    Quote #: {first_opportunity.get('quoteNumber', 'N/A')}")
                print(f"    Status: {first_opportunity.get('status', 'N/A')}")
                
                jobs = first_opportunity.get('jobs', [])
                print(f"    Jobs: {len(jobs)}")
                
                if jobs:
                    first_job = jobs[0]
                    print(f"      Job #: {first_job.get('jobNumber', 'N/A')}")
                    print(f"      Service Date: {first_job.get('serviceDate', 'N/A')}")
                    print(f"      Type: {first_job.get('type', 'N/A')}")
        
        return customers
    else:
        print(f"❌ Failed to get customers: {result.get('error', 'Unknown error')}")
        return []

async def get_opportunity_details(opportunity_id: str):
    """Get detailed opportunity information"""
    
    print(f"\n📋 Getting Opportunity Details: {opportunity_id}")
    print("=" * 50)
    
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
    
    result = await test_endpoint(f"/api/opportunities/{opportunity_id}", params)
    
    if result["success"]:
        opportunity = result["data"]
        print(f"✅ Got opportunity details")
        
        # Extract key information
        print(f"\n📊 Opportunity Summary:")
        print(f"  Quote #: {opportunity.get('quoteNumber', 'N/A')}")
        print(f"  Status: {opportunity.get('status', 'N/A')}")
        print(f"  Service Date: {opportunity.get('serviceDate', 'N/A')}")
        
        customer = opportunity.get('customer', {})
        print(f"  Customer: {customer.get('name', 'N/A')}")
        print(f"  Customer Phone: {customer.get('phoneNumber', 'N/A')}")
        print(f"  Customer Email: {customer.get('emailAddress', 'N/A')}")
        
        branch = opportunity.get('branch', {})
        print(f"  Branch: {branch.get('name', 'N/A')}")
        print(f"  Branch Phone: {branch.get('phoneNumber', 'N/A')}")
        
        jobs = opportunity.get('jobs', [])
        print(f"  Jobs: {len(jobs)}")
        
        estimated_total = opportunity.get('estimatedTotal', {})
        print(f"  Estimated Total: ${estimated_total.get('finalTotal', 0):.2f}")
        
        return opportunity
    else:
        print(f"❌ Failed to get opportunity details: {result.get('error', 'Unknown error')}")
        return None

async def get_jobs_for_opportunity(opportunity_id: str):
    """Get jobs for a specific opportunity"""
    
    print(f"\n🚛 Getting Jobs for Opportunity: {opportunity_id}")
    print("=" * 50)
    
    result = await test_endpoint(f"/api/opportunities/{opportunity_id}/jobs")
    
    if result["success"]:
        jobs = result["data"]
        print(f"✅ Found {len(jobs)} jobs")
        
        for i, job in enumerate(jobs):
            print(f"\n📋 Job {i+1}:")
            print(f"  ID: {job.get('id', 'N/A')}")
            print(f"  Job Number: {job.get('jobNumber', 'N/A')}")
            print(f"  Job Date: {job.get('jobDate', 'N/A')}")
            print(f"  Type: {job.get('type', 'N/A')}")
            print(f"  Confirmed: {job.get('confirmed', False)}")
            print(f"  Start Time: {job.get('startTimeUtc', 'N/A')}")
            print(f"  End Time: {job.get('endTimeUtc', 'N/A')}")
            print(f"  Completed: {job.get('completedAtUtc', 'N/A')}")
        
        return jobs
    else:
        print(f"❌ Failed to get jobs: {result.get('error', 'Unknown error')}")
        return []

async def get_leads():
    """Get leads to find potential jobs"""
    
    print(f"\n🎯 Getting Leads")
    print("=" * 50)
    
    params = {
        "Page": 1,
        "PageSize": 5
    }
    
    result = await test_endpoint("/api/leads", params)
    
    if result["success"]:
        leads_data = result["data"]
        leads = leads_data.get('pageResults', [])
        print(f"✅ Found {len(leads)} leads")
        
        for i, lead in enumerate(leads):
            print(f"\n📋 Lead {i+1}:")
            print(f"  ID: {lead.get('id', 'N/A')}")
            print(f"  Customer: {lead.get('customerName', 'N/A')}")
            print(f"  Email: {lead.get('emailAddress', 'N/A')}")
            print(f"  Phone: {lead.get('phoneNumber', 'N/A')}")
            print(f"  Service Date: {lead.get('serviceDate', 'N/A')}")
            print(f"  Branch: {lead.get('branchName', 'N/A')}")
            print(f"  Origin: {lead.get('originAddressFull', 'N/A')}")
            print(f"  Destination: {lead.get('destinationAddressFull', 'N/A')}")
        
        return leads
    else:
        print(f"❌ Failed to get leads: {result.get('error', 'Unknown error')}")
        return []

async def main():
    """Main function to pull SmartMoving data"""
    
    print("🚀 SmartMoving Data Pull - One Location, One Date, One Job")
    print(f"Time: {datetime.now(timezone.utc).isoformat()}Z")
    print("=" * 60)
    
    # Step 1: Test API connection
    if not await test_api_connection():
        print("❌ Cannot proceed without API connection")
        return
    
    # Step 2: Get today's date
    today = datetime.now().strftime("%Y-%m-%d")
    print(f"\n📅 Using date: {today}")
    
    # Step 3: Get customers for today
    customers = await get_customers_for_date(today)
    
    if not customers:
        print("❌ No customers found for today, trying leads...")
        leads = await get_leads()
        
        if leads:
            print("✅ Found leads, but need to convert to opportunities")
            # For now, we'll use the first lead as an example
            first_lead = leads[0]
            print(f"Using lead: {first_lead.get('customerName', 'Unknown')}")
        else:
            print("❌ No data found for today")
            return
    else:
        # Step 4: Get first customer's first opportunity
        first_customer = customers[0]
        opportunities = first_customer.get('opportunities', [])
        
        if opportunities:
            first_opportunity = opportunities[0]
            opportunity_id = first_opportunity.get('id')
            
            print(f"\n🎯 Selected Opportunity: {opportunity_id}")
            
            # Step 5: Get detailed opportunity information
            opportunity_details = await get_opportunity_details(opportunity_id)
            
            if opportunity_details:
                # Step 6: Get jobs for this opportunity
                jobs = await get_jobs_for_opportunity(opportunity_id)
                
                # Step 7: Save the data for analysis
                data_summary = {
                    "pull_time": datetime.now(timezone.utc).isoformat(),
                    "date": today,
                    "customer": {
                        "id": first_customer.get('id'),
                        "name": first_customer.get('name'),
                        "phone": first_customer.get('phoneNumber'),
                        "email": first_customer.get('emailAddress')
                    },
                    "opportunity": {
                        "id": opportunity_id,
                        "quote_number": opportunity_details.get('quoteNumber'),
                        "status": opportunity_details.get('status'),
                        "service_date": opportunity_details.get('serviceDate'),
                        "estimated_total": opportunity_details.get('estimatedTotal', {}).get('finalTotal', 0)
                    },
                    "jobs": jobs,
                    "branch": opportunity_details.get('branch', {}),
                    "customer_details": opportunity_details.get('customer', {})
                }
                
                # Save to file
                with open("smartmoving_sample_data.json", "w") as f:
                    json.dump(data_summary, f, indent=2, default=str)
                
                print(f"\n💾 Sample data saved to: smartmoving_sample_data.json")
                print(f"📊 Data Summary:")
                print(f"  Customer: {data_summary['customer']['name']}")
                print(f"  Opportunity: #{data_summary['opportunity']['quote_number']}")
                print(f"  Jobs: {len(data_summary['jobs'])}")
                print(f"  Branch: {data_summary['branch'].get('name', 'N/A')}")
                print(f"  Estimated Total: ${data_summary['opportunity']['estimated_total']:.2f}")
                
            else:
                print("❌ Could not get opportunity details")
        else:
            print("❌ No opportunities found for customer")
    
    print("\n🎉 Data pull completed!")

if __name__ == "__main__":
    asyncio.run(main())
