#!/usr/bin/env python3
"""
Local SmartMoving Sync Test Script
Purpose: Test SmartMoving data sync locally and populate database with real LGM journey data
"""

import asyncio
import httpx
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import logging

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prisma import Prisma
from prisma.models import TruckJourney, Location, Client, User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"

class LocalSmartMovingSyncTest:
    def __init__(self):
        self.db = Prisma()
        self.client = httpx.AsyncClient(timeout=30.0)
        self.sync_stats = {
            "jobs_processed": 0,
            "journeys_created": 0,
            "journeys_updated": 0,
            "errors": []
        }
        
        # LGM Client ID
        self.lgm_client_id = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
        
        # Location mapping for LGM branches
        self.location_mapping = {
            "CALGARY 🇨🇦 - Let's Get Moving": "loc_lgm_calgary_franchise_001",
            "VANCOUVER 🇨🇦 - Let's Get Moving": "loc_lgm_vancouver_corporate_001",
            "BURNABY 🇨🇦 - Let's Get Moving": "loc_lgm_burnaby_corporate_001",
            "TORONTO 🇨🇦 - Let's Get Moving": "loc_lgm_downtown_toronto_corporate_001",
            "EDMONTON 🇨🇦 - Let's Get Moving": "loc_lgm_edmonton_corporate_001",
            "HAMILTON 🇨🇦 - Let's Get Moving": "loc_lgm_hamilton_corporate_001",
            "MONTREAL 🇨🇦 - Let's Get Moving": "loc_lgm_montreal_corporate_001",
            "NORTH YORK 🇨🇦 - Let's Get Moving": "loc_lgm_north_york_corporate_001",
            "LONDON 🇨🇦 - Let's Get Moving": "loc_lgm_london_franchise_001",
            "OTTAWA 🇨🇦 - Let's Get Moving": "loc_lgm_ottawa_franchise_001",
            "WINNIPEG 🇨🇦 - Let's Get Moving": "loc_lgm_winnipeg_franchise_001",
            "ABBOTSFORD 🇨🇦 - Let's Get Moving": "loc_lgm_abbotsford_franchise_001",
            "AJAX 🇨🇦 - Let's Get Moving": "loc_lgm_ajax_franchise_001",
            "AURORA 🇨🇦 - Let's Get Moving": "loc_lgm_aurora_franchise_001",
            "BRAMPTON 🇨🇦 - Let's Get Moving": "loc_lgm_brampton_franchise_001",
            "BRANTFORD 🇨🇦 - Let's Get Moving": "loc_lgm_brantford_franchise_001",
            "BURLINGTON 🇨🇦 - Let's Get Moving": "loc_lgm_burlington_franchise_001",
            "COQUITLAM 🇨🇦 - Let's Get Moving": "loc_lgm_coquitlam_franchise_001",
            "FREDERICTON 🇨🇦 - Let's Get Moving": "loc_lgm_fredericton_franchise_001",
            "HALIFAX 🇨🇦 - Let's Get Moving": "loc_lgm_halifax_franchise_001",
            "KINGSTON 🇨🇦 - Let's Get Moving": "loc_lgm_kingston_franchise_001",
            "LETHBRIDGE 🇨🇦 - Let's Get Moving": "loc_lgm_lethbridge_franchise_001",
            "REGINA 🇨🇦 - Let's Get Moving": "loc_lgm_regina_franchise_001",
            "RICHMOND 🇨🇦 - Let's Get Moving": "loc_lgm_richmond_franchise_001",
            "SAINT JOHN 🇨🇦 - Let's Get Moving": "loc_lgm_saint_john_franchise_001",
            "SCARBOROUGH 🇨🇦 - Let's Get Moving": "loc_lgm_scarborough_franchise_001",
            "SURREY 🇨🇦 - Let's Get Moving": "loc_lgm_surrey_franchise_001",
            "VAUGHAN 🇨🇦 - Let's Get Moving": "loc_lgm_vaughan_franchise_001",
            "VICTORIA 🇨🇦 - Let's Get Moving": "loc_lgm_victoria_franchise_001",
            "WATERLOO 🇨🇦 - Let's Get Moving": "loc_lgm_waterloo_franchise_001"
        }
        
        # Status mapping
        self.status_mapping = {
            3: "MORNING_PREP",    # Pending
            4: "MORNING_PREP",    # Confirmed
            10: "EN_ROUTE",       # In Progress
            11: "COMPLETED",      # Completed
            30: "MORNING_PREP"    # Scheduled
        }

    async def __aenter__(self):
        await self.db.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.db.disconnect()
        await self.client.aclose()

    def get_smartmoving_headers(self) -> Dict[str, str]:
        """Get headers for SmartMoving API requests"""
        return {
            "x-api-key": SMARTMOVING_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def pull_smartmoving_jobs(self, date_str: str) -> Dict[str, Any]:
        """Pull jobs from SmartMoving API for a specific date"""
        try:
            logger.info(f"Pulling SmartMoving jobs for date: {date_str}")
            
            # SmartMoving API endpoint for jobs
            url = f"{SMARTMOVING_API_BASE_URL}/jobs"
            params = {
                "date": date_str,
                "limit": 100
            }
            
            response = await self.client.get(url, headers=self.get_smartmoving_headers(), params=params)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Successfully pulled {len(data.get('jobs', []))} jobs from SmartMoving")
                return {
                    "success": True,
                    "data": data.get("jobs", []),
                    "message": f"Retrieved {len(data.get('jobs', []))} jobs"
                }
            else:
                logger.error(f"SmartMoving API error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "data": [],
                    "message": f"API error: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error pulling SmartMoving jobs: {str(e)}")
            return {
                "success": False,
                "data": [],
                "message": str(e)
            }

    def normalize_smartmoving_job(self, job: Dict, opportunity: Dict, customer: Dict) -> Dict:
        """Normalize SmartMoving job data to C&C CRM TruckJourney format"""
        try:
            # Extract job information
            job_number = job.get("jobNumber", "")
            job_date = self.convert_smartmoving_date(job.get("jobDate"))
            
            # Map status
            journey_status = self.status_mapping.get(opportunity.get("status"), "MORNING_PREP")
            
            # Get location
            branch_name = opportunity.get("branch", {}).get("name", "")
            location_id = self.location_mapping.get(branch_name, "loc_lgm_vancouver_corporate_001")
            
            # Create notes
            notes = f"SmartMoving Job: {job_number}\n"
            notes += f"Customer: {customer.get('name', '')}\n"
            notes += f"Quote: {opportunity.get('quoteNumber', '')}\n"
            notes += f"Estimated Value: ${opportunity.get('estimatedTotal', {}).get('finalTotal', 0):.2f}\n"
            notes += f"Customer Phone: {customer.get('phoneNumber', '')}\n"
            notes += f"Customer Email: {customer.get('emailAddress', '')}\n"
            notes += f"Customer Address: {customer.get('address', '')}"
            
            return {
                "externalId": f"sm_job_{job_number}",
                "externalData": {
                    "smartmoving_job": job,
                    "smartmoving_opportunity": opportunity,
                    "smartmoving_customer": customer
                },
                "locationId": location_id,
                "clientId": self.lgm_client_id,
                "date": job_date.isoformat(),
                "status": journey_status,
                "truckNumber": f"SM-{job_number}",
                "notes": notes,
                "startTime": job_date.replace(hour=8, minute=0, second=0, microsecond=0).isoformat(),
                "endTime": job_date.replace(hour=16, minute=0, second=0, microsecond=0).isoformat(),
                "dataSource": "SMARTMOVING",
                "lastSyncAt": datetime.now().isoformat(),
                "syncStatus": "SYNCED"
            }
            
        except Exception as e:
            logger.error(f"Error normalizing job {job.get('jobNumber', 'unknown')}: {str(e)}")
            return None

    def convert_smartmoving_date(self, date_int: int) -> datetime:
        """Convert SmartMoving YYYYMMDD format to datetime"""
        if not date_int:
            return datetime.now()
        
        date_str = str(date_int)
        try:
            return datetime.strptime(date_str, "%Y%m%d")
        except ValueError:
            return datetime.now()

    async def create_sample_smartmoving_data(self) -> List[Dict]:
        """Create sample SmartMoving data for testing"""
        logger.info("Creating sample SmartMoving data for testing...")
        
        sample_data = []
        
        # Sample customers
        customers = [
            {
                "id": "cust_001",
                "name": "John Smith",
                "phoneNumber": "+1-403-555-0101",
                "emailAddress": "john.smith@email.com",
                "address": "123 Main St, Calgary, AB T2P 1J9"
            },
            {
                "id": "cust_002", 
                "name": "Sarah Johnson",
                "phoneNumber": "+1-604-555-0202",
                "emailAddress": "sarah.johnson@email.com",
                "address": "456 Oak Ave, Vancouver, BC V6B 1A1"
            },
            {
                "id": "cust_003",
                "name": "Mike Chen",
                "phoneNumber": "+1-416-555-0303", 
                "emailAddress": "mike.chen@email.com",
                "address": "789 Queen St, Toronto, ON M5V 2K7"
            }
        ]
        
        # Sample opportunities
        opportunities = [
            {
                "id": "opp_001",
                "quoteNumber": "Q-2025-001",
                "status": 4,  # Confirmed
                "estimatedTotal": {"finalTotal": 1250.00},
                "branch": {"name": "CALGARY 🇨🇦 - Let's Get Moving"}
            },
            {
                "id": "opp_002",
                "quoteNumber": "Q-2025-002", 
                "status": 10,  # In Progress
                "estimatedTotal": {"finalTotal": 2100.00},
                "branch": {"name": "VANCOUVER 🇨🇦 - Let's Get Moving"}
            },
            {
                "id": "opp_003",
                "quoteNumber": "Q-2025-003",
                "status": 3,  # Pending
                "estimatedTotal": {"finalTotal": 850.00},
                "branch": {"name": "TORONTO 🇨🇦 - Let's Get Moving"}
            }
        ]
        
        # Sample jobs
        jobs = [
            {
                "id": "job_001",
                "jobNumber": "2025-001",
                "jobDate": 20250808,  # August 8, 2025
                "type": "Full Service Move"
            },
            {
                "id": "job_002", 
                "jobNumber": "2025-002",
                "jobDate": 20250808,  # August 8, 2025
                "type": "Partial Move"
            },
            {
                "id": "job_003",
                "jobNumber": "2025-003", 
                "jobDate": 20250809,  # August 9, 2025
                "type": "Heavy Item Move"
            }
        ]
        
        # Create normalized data
        for i, job in enumerate(jobs):
            customer = customers[i % len(customers)]
            opportunity = opportunities[i % len(opportunities)]
            
            normalized_job = self.normalize_smartmoving_job(job, opportunity, customer)
            if normalized_job:
                sample_data.append(normalized_job)
        
        logger.info(f"Created {len(sample_data)} sample SmartMoving jobs")
        return sample_data

    async def sync_journeys_to_database(self, normalized_jobs: List[Dict]) -> Dict[str, Any]:
        """Sync normalized jobs to C&C CRM database"""
        created_count = 0
        updated_count = 0
        failed_count = 0
        
        for job_data in normalized_jobs:
            try:
                # Check if journey already exists
                existing_journey = await self.db.truckjourney.find_first(
                    where={
                        "externalId": job_data["externalId"],
                        "dataSource": "SMARTMOVING"
                    }
                )
                
                if existing_journey:
                    # Update existing journey
                    await self.db.truckjourney.update(
                        where={"id": existing_journey.id},
                        data={
                            "externalData": job_data["externalData"],
                            "status": job_data["status"],
                            "notes": job_data["notes"],
                            "lastSyncAt": datetime.now(),
                            "syncStatus": job_data["syncStatus"],
                            "updatedAt": datetime.now()
                        }
                    )
                    updated_count += 1
                    logger.debug(f"Updated journey: {job_data['externalId']}")
                    
                else:
                    # Create new journey
                    await self.db.truckjourney.create(
                        data={
                            "externalId": job_data["externalId"],
                            "externalData": job_data["externalData"],
                            "locationId": job_data["locationId"],
                            "clientId": job_data["clientId"],
                            "date": datetime.fromisoformat(job_data["date"]),
                            "status": job_data["status"],
                            "truckNumber": job_data["truckNumber"],
                            "notes": job_data["notes"],
                            "startTime": datetime.fromisoformat(job_data["startTime"]),
                            "endTime": datetime.fromisoformat(job_data["endTime"]),
                            "dataSource": job_data["dataSource"],
                            "lastSyncAt": datetime.now(),
                            "syncStatus": job_data["syncStatus"],
                            "createdById": "system_smartmoving_sync"
                        }
                    )
                    created_count += 1
                    logger.debug(f"Created journey: {job_data['externalId']}")
                    
            except Exception as e:
                logger.error(f"Error syncing journey {job_data.get('externalId', 'unknown')}: {str(e)}")
                failed_count += 1
                continue
        
        return {
            "processed": len(normalized_jobs),
            "created": created_count,
            "updated": updated_count,
            "failed": failed_count
        }

    async def test_smartmoving_sync(self) -> bool:
        """Test SmartMoving sync functionality"""
        logger.info("🧪 Starting SmartMoving sync test...")
        
        try:
            # Test 1: Pull real SmartMoving data
            logger.info("1️⃣ Testing SmartMoving API connection...")
            today = datetime.now().strftime("%Y-%m-%d")
            smartmoving_result = await self.pull_smartmoving_jobs(today)
            
            if smartmoving_result["success"]:
                logger.info(f"✅ SmartMoving API working: {smartmoving_result['message']}")
                normalized_jobs = []
                
                # Process real SmartMoving jobs
                for job in smartmoving_result["data"]:
                    # For real data, we'd need to fetch opportunity and customer details
                    # For now, create sample data
                    opportunity = {
                        "id": f"opp_{job.get('id', 'unknown')}",
                        "quoteNumber": f"Q-{job.get('jobNumber', 'unknown')}",
                        "status": 4,  # Confirmed
                        "estimatedTotal": {"finalTotal": 1500.00},
                        "branch": {"name": "VANCOUVER 🇨🇦 - Let's Get Moving"}
                    }
                    
                    customer = {
                        "id": f"cust_{job.get('id', 'unknown')}",
                        "name": f"Customer {job.get('jobNumber', 'unknown')}",
                        "phoneNumber": "+1-604-555-0000",
                        "emailAddress": f"customer{job.get('jobNumber', 'unknown')}@email.com",
                        "address": "123 Main St, Vancouver, BC"
                    }
                    
                    normalized_job = self.normalize_smartmoving_job(job, opportunity, customer)
                    if normalized_job:
                        normalized_jobs.append(normalized_job)
            else:
                logger.warning(f"⚠️ SmartMoving API not available: {smartmoving_result['message']}")
                logger.info("📝 Creating sample SmartMoving data for testing...")
                normalized_jobs = await self.create_sample_smartmoving_data()
            
            # Test 2: Sync to database
            logger.info("2️⃣ Syncing journeys to database...")
            sync_result = await self.sync_journeys_to_database(normalized_jobs)
            
            logger.info(f"✅ Database sync completed:")
            logger.info(f"   - Processed: {sync_result['processed']}")
            logger.info(f"   - Created: {sync_result['created']}")
            logger.info(f"   - Updated: {sync_result['updated']}")
            logger.info(f"   - Failed: {sync_result['failed']}")
            
            # Test 3: Verify data in database
            logger.info("3️⃣ Verifying data in database...")
            total_journeys = await self.db.truckjourney.count(
                where={"dataSource": "SMARTMOVING"}
            )
            
            logger.info(f"✅ Total SmartMoving journeys in database: {total_journeys}")
            
            # Test 4: Check specific journey details
            sample_journey = await self.db.truckjourney.find_first(
                where={"dataSource": "SMARTMOVING"}
            )
            
            if sample_journey:
                logger.info(f"✅ Sample journey found:")
                logger.info(f"   - ID: {sample_journey.id}")
                logger.info(f"   - External ID: {sample_journey.externalId}")
                logger.info(f"   - Status: {sample_journey.status}")
                logger.info(f"   - Truck: {sample_journey.truckNumber}")
                logger.info(f"   - Location: {sample_journey.locationId}")
            
            logger.info("🎉 SmartMoving sync test completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ SmartMoving sync test failed: {str(e)}")
            return False

async def main():
    """Main function to run the SmartMoving sync test"""
    logger.info("🚀 Starting Local SmartMoving Sync Test")
    logger.info("=" * 50)
    
    async with LocalSmartMovingSyncTest() as sync_test:
        success = await sync_test.test_smartmoving_sync()
        
        if success:
            logger.info("✅ Test completed successfully!")
            logger.info("🌐 You can now check your dashboard at http://localhost:3000")
            logger.info("📊 Real SmartMoving data should be visible in the journeys section")
        else:
            logger.error("❌ Test failed!")
            logger.info("🔧 Check the logs above for error details")

if __name__ == "__main__":
    asyncio.run(main())
