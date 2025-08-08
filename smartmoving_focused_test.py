#!/usr/bin/env python3
"""
SmartMoving Focused Test
Purpose: Download small sample of SmartMoving data for one location and one date
"""

import asyncio
import httpx
import json
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"

class SmartMovingFocusedTest:
    def __init__(self):
        self.test_stats = {
            "customers_found": 0,
            "opportunities_found": 0,
            "jobs_found": 0,
            "locations_found": set(),
            "errors": []
        }
        
        # Create output directory
        self.output_dir = "smartmoving_test_data"
        os.makedirs(self.output_dir, exist_ok=True)

    async def get_smartmoving_headers(self) -> Dict[str, str]:
        """Get headers for SmartMoving API requests"""
        return {
            "x-api-key": SMARTMOVING_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def test_api_connection(self) -> bool:
        """Test SmartMoving API connection"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = await self.get_smartmoving_headers()
                response = await client.get(f"{SMARTMOVING_API_BASE_URL}/api/ping", headers=headers)
                
                if response.status_code == 200:
                    logger.info("✅ SmartMoving API connection successful")
                    return True
                else:
                    logger.error(f"❌ SmartMoving API connection failed: {response.status_code}")
                    return False
        except Exception as e:
            logger.error(f"❌ SmartMoving API connection error: {e}")
            return False

    async def get_customers_for_specific_date(self, date_str: str, max_customers: int = 5) -> List[Dict]:
        """Get customers for a specific date (limited sample)"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = await self.get_smartmoving_headers()
                
                params = {
                    "FromServiceDate": int(date_str),
                    "ToServiceDate": int(date_str),
                    "IncludeOpportunityInfo": True,
                    "Page": 1,
                    "PageSize": max_customers
                }
                
                response = await client.get(
                    f"{SMARTMOVING_API_BASE_URL}/api/customers",
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    customers = data.get('pageResults', [])
                    
                    logger.info(f"📊 Found {len(customers)} customers for {date_str}")
                    
                    # Track locations
                    for customer in customers:
                        opportunities = customer.get('opportunities', [])
                        for opp in opportunities:
                            if 'branch' in opp:
                                self.test_stats["locations_found"].add(opp['branch'])
                    
                    return customers
                else:
                    logger.error(f"❌ Failed to get customers for {date_str}: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"❌ Error fetching customers for {date_str}: {e}")
            return []

    async def get_opportunity_details(self, opportunity_id: str) -> Optional[Dict]:
        """Get detailed opportunity information"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = await self.get_smartmoving_headers()
                
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
                
                response = await client.get(
                    f"{SMARTMOVING_API_BASE_URL}/api/opportunities/{opportunity_id}",
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"❌ Failed to get opportunity {opportunity_id}: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"❌ Error fetching opportunity {opportunity_id}: {e}")
            return None

    async def download_focused_sample(self, date_str: str = "20250807", max_customers: int = 3):
        """Download focused sample of SmartMoving data"""
        logger.info("🚀 Starting SmartMoving focused data download...")
        logger.info(f"📅 Target date: {date_str}")
        logger.info(f"📊 Max customers: {max_customers}")
        
        # Test API connection
        if not await self.test_api_connection():
            logger.error("❌ Cannot proceed without API connection")
            return
        
        try:
            # Get customers for specific date
            customers = await self.get_customers_for_specific_date(date_str, max_customers)
            
            if not customers:
                logger.warning(f"⚠️ No customers found for {date_str}, trying yesterday...")
                # Try yesterday if no data for today
                yesterday = datetime.now() - timedelta(days=1)
                yesterday_str = yesterday.strftime("%Y%m%d")
                customers = await self.get_customers_for_specific_date(yesterday_str, max_customers)
            
            logger.info(f"📊 Processing {len(customers)} customers...")
            
            sample_data = {
                "download_time": datetime.now(timezone.utc).isoformat(),
                "target_date": date_str,
                "max_customers": max_customers,
                "customers": [],
                "locations": list(self.test_stats["locations_found"]),
                "summary": {
                    "total_customers": len(customers),
                    "total_opportunities": 0,
                    "total_jobs": 0,
                    "locations_found": len(self.test_stats["locations_found"])
                }
            }
            
            for i, customer in enumerate(customers, 1):
                try:
                    logger.info(f"📋 Processing customer {i}/{len(customers)}: {customer.get('name', 'Unknown')}")
                    
                    # Add customer to data
                    customer_data = {
                        "id": customer.get('id'),
                        "name": customer.get('name'),
                        "email": customer.get('emailAddress'),
                        "phone": customer.get('phoneNumber'),
                        "address": customer.get('address'),
                        "opportunities": []
                    }
                    
                    # Process opportunities (limit to first 2 per customer)
                    opportunities = customer.get('opportunities', [])[:2]
                    for j, opportunity in enumerate(opportunities, 1):
                        try:
                            logger.info(f"  📋 Processing opportunity {j}/{len(opportunities)}: {opportunity.get('quoteNumber', 'Unknown')}")
                            
                            # Get detailed opportunity information
                            opportunity_details = await self.get_opportunity_details(opportunity['id'])
                            
                            if opportunity_details:
                                self.test_stats["opportunities_found"] += 1
                                sample_data["summary"]["total_opportunities"] += 1
                                
                                # Add opportunity to data
                                opportunity_data = {
                                    "id": opportunity_details.get('id'),
                                    "quote_number": opportunity_details.get('quoteNumber'),
                                    "status": opportunity_details.get('status'),
                                    "service_date": opportunity_details.get('serviceDate'),
                                    "customer_id": opportunity_details.get('customer', {}).get('id'),
                                    "customer_name": opportunity_details.get('customer', {}).get('name'),
                                    "branch": opportunity_details.get('branch', {}),
                                    "estimated_total": opportunity_details.get('estimatedTotal', {}),
                                    "jobs": []
                                }
                                
                                # Process jobs (limit to first 2 per opportunity)
                                jobs = opportunity_details.get('jobs', [])[:2]
                                for k, job in enumerate(jobs, 1):
                                    logger.info(f"    📋 Processing job {k}/{len(jobs)}: {job.get('jobNumber', 'Unknown')}")
                                    
                                    self.test_stats["jobs_found"] += 1
                                    sample_data["summary"]["total_jobs"] += 1
                                    
                                    # Add job to opportunity
                                    job_data = {
                                        "id": job.get('id'),
                                        "job_number": job.get('jobNumber'),
                                        "job_date": job.get('jobDate'),
                                        "type": job.get('type'),
                                        "confirmed": job.get('confirmed'),
                                        "job_addresses": job.get('jobAddresses', []),
                                        "estimated_charges": job.get('estimatedCharges', []),
                                        "actual_charges": job.get('actualCharges', [])
                                    }
                                    
                                    opportunity_data["jobs"].append(job_data)
                                
                                customer_data["opportunities"].append(opportunity_data)
                            
                        except Exception as e:
                            logger.error(f"❌ Error processing opportunity {opportunity.get('id')}: {e}")
                            self.test_stats["errors"].append(f"Opportunity error: {e}")
                
                except Exception as e:
                    logger.error(f"❌ Error processing customer {customer.get('id')}: {e}")
                    self.test_stats["errors"].append(f"Customer error: {e}")
                
                # Add customer to main data
                sample_data["customers"].append(customer_data)
            
            # Save data to files
            self.save_sample_data(sample_data)
            
            # Print download summary
            self.print_test_summary()
            
        except Exception as e:
            logger.error(f"❌ Download error: {e}")
            self.test_stats["errors"].append(f"Download error: {e}")

    def save_sample_data(self, data: Dict):
        """Save sample data to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save complete sample data
        sample_file = f"{self.output_dir}/smartmoving_sample_{timestamp}.json"
        with open(sample_file, "w") as f:
            json.dump(data, f, indent=2, default=str)
        logger.info(f"💾 Sample data saved to: {sample_file}")
        
        # Save locations data
        locations_file = f"{self.output_dir}/smartmoving_locations_sample_{timestamp}.json"
        locations_data = {
            "download_time": data["download_time"],
            "target_date": data["target_date"],
            "locations": data["locations"],
            "location_count": len(data["locations"])
        }
        with open(locations_file, "w") as f:
            json.dump(locations_data, f, indent=2, default=str)
        logger.info(f"💾 Locations sample saved to: {locations_file}")
        
        # Save normalized data structure
        normalized_file = f"{self.output_dir}/smartmoving_normalized_sample_{timestamp}.json"
        normalized_data = self.normalize_sample_data(data)
        with open(normalized_file, "w") as f:
            json.dump(normalized_data, f, indent=2, default=str)
        logger.info(f"💾 Normalized sample saved to: {normalized_file}")

    def normalize_sample_data(self, data: Dict) -> Dict:
        """Normalize sample data to C&C CRM format"""
        normalized = {
            "normalized_time": datetime.now(timezone.utc).isoformat(),
            "source_date": data["target_date"],
            "clients": [],
            "locations": [],
            "journeys": []
        }
        
        # Extract unique locations
        locations_seen = set()
        
        for customer in data["customers"]:
            for opportunity in customer["opportunities"]:
                branch = opportunity.get("branch", {})
                branch_name = branch.get("name", "Unknown Branch")
                
                if branch_name not in locations_seen:
                    locations_seen.add(branch_name)
                    
                    # Create location entry
                    location_data = {
                        "id": f"loc_sm_{len(normalized['locations'])+1:03d}",
                        "name": branch_name,
                        "phone": branch.get("phoneNumber", ""),
                        "address": branch_name,
                        "client_id": "clm_smartmoving_001"
                    }
                    normalized["locations"].append(location_data)
                
                # Create journey entries
                for job in opportunity["jobs"]:
                    journey_data = {
                        "id": f"journey_sm_{len(normalized['journeys'])+1:03d}",
                        "external_id": job["id"],
                        "journey_number": job["job_number"],
                        "scheduled_date": job["job_date"],
                        "status": self.map_smartmoving_status(opportunity["status"]),
                        "customer_name": customer["name"],
                        "customer_phone": customer["phone"],
                        "customer_email": customer["email"],
                        "customer_address": customer["address"],
                        "quote_number": opportunity["quote_number"],
                        "estimated_total": opportunity["estimated_total"].get("finalTotal", 0),
                        "branch_name": branch_name,
                        "job_type": job["type"],
                        "confirmed": job["confirmed"],
                        "job_addresses": job["job_addresses"],
                        "notes": f"SmartMoving Job: {job['job_number']}\nCustomer: {customer['name']}\nQuote: {opportunity['quote_number']}"
                    }
                    normalized["journeys"].append(journey_data)
        
        # Create client entry
        client_data = {
            "id": "clm_smartmoving_001",
            "name": "SmartMoving Integration",
            "email": "integration@smartmoving.com",
            "phone": "+1-800-555-0123",
            "address": "Canada"
        }
        normalized["clients"].append(client_data)
        
        return normalized

    def map_smartmoving_status(self, status_code: int) -> str:
        """Map SmartMoving status codes to C&C CRM status"""
        status_mapping = {
            3: "PENDING",
            4: "CONFIRMED", 
            10: "IN_PROGRESS",
            11: "COMPLETED",
            30: "SCHEDULED"
        }
        return status_mapping.get(status_code, "PENDING")

    def print_test_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 SMARTMOVING FOCUSED TEST SUMMARY")
        print("="*60)
        print(f"✅ Customers Found: {self.test_stats['customers_found']}")
        print(f"✅ Opportunities Found: {self.test_stats['opportunities_found']}")
        print(f"✅ Jobs Found: {self.test_stats['jobs_found']}")
        print(f"📍 Locations Found: {len(self.test_stats['locations_found'])}")
        
        if self.test_stats['locations_found']:
            print("\n📍 SmartMoving Locations:")
            for location in sorted(self.test_stats['locations_found']):
                print(f"   • {location}")
        
        if self.test_stats['errors']:
            print(f"\n❌ Errors: {len(self.test_stats['errors'])}")
            for error in self.test_stats['errors'][:3]:  # Show first 3 errors
                print(f"   • {error}")
            if len(self.test_stats['errors']) > 3:
                print(f"   ... and {len(self.test_stats['errors']) - 3} more errors")
        
        print(f"\n💾 Test data saved to: {self.output_dir}/")
        print("="*60)

async def main():
    """Main function"""
    tester = SmartMovingFocusedTest()
    
    # Download focused sample for today (or yesterday if no data)
    today = datetime.now().strftime("%Y%m%d")
    await tester.download_focused_sample(date_str=today, max_customers=3)

if __name__ == "__main__":
    asyncio.run(main())
