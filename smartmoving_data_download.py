#!/usr/bin/env python3
"""
SmartMoving Data Download
Purpose: Download all SmartMoving data and save to files for analysis
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

class SmartMovingDataDownloader:
    def __init__(self):
        self.download_stats = {
            "customers_downloaded": 0,
            "opportunities_downloaded": 0,
            "jobs_downloaded": 0,
            "locations_found": set(),
            "errors": []
        }
        
        # Create output directory
        self.output_dir = "smartmoving_data"
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

    async def get_all_customers(self, days_back: int = 7) -> List[Dict]:
        """Get all customers from SmartMoving for the last N days"""
        all_customers = []
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        current_date = start_date
        page = 1
        
        logger.info(f"📅 Fetching customers from {start_date.date()} to {end_date.date()}")
        
        while current_date <= end_date:
            date_str = current_date.strftime("%Y%m%d")
            
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    headers = await self.get_smartmoving_headers()
                    
                    params = {
                        "FromServiceDate": int(date_str),
                        "ToServiceDate": int(date_str),
                        "IncludeOpportunityInfo": True,
                        "Page": page,
                        "PageSize": 100
                    }
                    
                    response = await client.get(
                        f"{SMARTMOVING_API_BASE_URL}/api/customers",
                        headers=headers,
                        params=params
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        customers = data.get('pageResults', [])
                        
                        if customers:
                            logger.info(f"📊 Found {len(customers)} customers for {current_date.date()}")
                            all_customers.extend(customers)
                            
                            # Track locations
                            for customer in customers:
                                opportunities = customer.get('opportunities', [])
                                for opp in opportunities:
                                    if 'branch' in opp:
                                        self.download_stats["locations_found"].add(opp['branch'])
                        
                        # Check if there are more pages
                        if data.get('lastPage', True):
                            page = 1
                            current_date += timedelta(days=1)
                        else:
                            page += 1
                    else:
                        logger.error(f"❌ Failed to get customers for {current_date.date()}: {response.status_code}")
                        current_date += timedelta(days=1)
                        page = 1
                        
            except Exception as e:
                logger.error(f"❌ Error fetching customers for {current_date.date()}: {e}")
                current_date += timedelta(days=1)
                page = 1
        
        logger.info(f"📊 Total customers fetched: {len(all_customers)}")
        return all_customers

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

    async def download_all_data(self, days_back: int = 7):
        """Download all SmartMoving data and save to files"""
        logger.info("🚀 Starting SmartMoving data download...")
        
        # Test API connection
        if not await self.test_api_connection():
            logger.error("❌ Cannot proceed without API connection")
            return
        
        try:
            # Get all customers from SmartMoving
            customers = await self.get_all_customers(days_back)
            
            logger.info(f"📊 Processing {len(customers)} customers...")
            
            all_data = {
                "download_time": datetime.now(timezone.utc).isoformat(),
                "days_back": days_back,
                "customers": [],
                "opportunities": [],
                "jobs": [],
                "locations": list(self.download_stats["locations_found"]),
                "summary": {
                    "total_customers": len(customers),
                    "total_opportunities": 0,
                    "total_jobs": 0,
                    "locations_found": len(self.download_stats["locations_found"])
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
                    
                    # Process opportunities
                    opportunities = customer.get('opportunities', [])
                    for opportunity in opportunities:
                        try:
                            # Get detailed opportunity information
                            opportunity_details = await self.get_opportunity_details(opportunity['id'])
                            
                            if opportunity_details:
                                self.download_stats["opportunities_downloaded"] += 1
                                all_data["summary"]["total_opportunities"] += 1
                                
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
                                
                                # Process jobs
                                jobs = opportunity_details.get('jobs', [])
                                for job in jobs:
                                    self.download_stats["jobs_downloaded"] += 1
                                    all_data["summary"]["total_jobs"] += 1
                                    
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
                            self.download_stats["errors"].append(f"Opportunity error: {e}")
                
                except Exception as e:
                    logger.error(f"❌ Error processing customer {customer.get('id')}: {e}")
                    self.download_stats["errors"].append(f"Customer error: {e}")
                
                # Add customer to main data
                all_data["customers"].append(customer_data)
            
            # Save data to files
            self.save_data_to_files(all_data)
            
            # Print download summary
            self.print_download_summary()
            
        except Exception as e:
            logger.error(f"❌ Download error: {e}")
            self.download_stats["errors"].append(f"Download error: {e}")

    def save_data_to_files(self, data: Dict):
        """Save downloaded data to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save complete data
        complete_file = f"{self.output_dir}/smartmoving_complete_data_{timestamp}.json"
        with open(complete_file, "w") as f:
            json.dump(data, f, indent=2, default=str)
        logger.info(f"💾 Complete data saved to: {complete_file}")
        
        # Save summary
        summary_file = f"{self.output_dir}/smartmoving_summary_{timestamp}.json"
        summary_data = {
            "download_time": data["download_time"],
            "summary": data["summary"],
            "locations": data["locations"],
            "errors": self.download_stats["errors"]
        }
        with open(summary_file, "w") as f:
            json.dump(summary_data, f, indent=2, default=str)
        logger.info(f"💾 Summary saved to: {summary_file}")
        
        # Save locations data
        locations_file = f"{self.output_dir}/smartmoving_locations_{timestamp}.json"
        locations_data = {
            "download_time": data["download_time"],
            "locations": data["locations"],
            "location_count": len(data["locations"])
        }
        with open(locations_file, "w") as f:
            json.dump(locations_data, f, indent=2, default=str)
        logger.info(f"💾 Locations data saved to: {locations_file}")

    def print_download_summary(self):
        """Print download summary"""
        print("\n" + "="*60)
        print("📊 SMARTMOVING DATA DOWNLOAD SUMMARY")
        print("="*60)
        print(f"✅ Customers Downloaded: {self.download_stats['customers_downloaded']}")
        print(f"✅ Opportunities Downloaded: {self.download_stats['opportunities_downloaded']}")
        print(f"✅ Jobs Downloaded: {self.download_stats['jobs_downloaded']}")
        print(f"📍 Locations Found: {len(self.download_stats['locations_found'])}")
        
        if self.download_stats['locations_found']:
            print("\n📍 SmartMoving Locations:")
            for location in sorted(self.download_stats['locations_found']):
                print(f"   • {location}")
        
        if self.download_stats['errors']:
            print(f"\n❌ Errors: {len(self.download_stats['errors'])}")
            for error in self.download_stats['errors'][:5]:  # Show first 5 errors
                print(f"   • {error}")
            if len(self.download_stats['errors']) > 5:
                print(f"   ... and {len(self.download_stats['errors']) - 5} more errors")
        
        print(f"\n💾 Data saved to: {self.output_dir}/")
        print("="*60)

async def main():
    """Main function"""
    downloader = SmartMovingDataDownloader()
    
    # Download last 7 days of data
    await downloader.download_all_data(days_back=7)

if __name__ == "__main__":
    asyncio.run(main())
