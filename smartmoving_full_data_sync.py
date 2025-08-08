#!/usr/bin/env python3
"""
SmartMoving Full Data Sync
Purpose: Download all SmartMoving data, normalize it, and sync to C&C CRM database
"""

import asyncio
import httpx
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import logging
from prisma import Prisma
from prisma.models import Client, Location, User, TruckJourney, JourneyStep

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/c_and_c_crm")

class SmartMovingDataSync:
    def __init__(self):
        self.db = Prisma()
        self.sync_stats = {
            "customers_processed": 0,
            "opportunities_processed": 0,
            "journeys_synced": 0,
            "locations_found": set(),
            "errors": []
        }
        
        # SmartMoving to C&C CRM mappings
        self.status_mapping = {
            3: "PENDING",
            4: "CONFIRMED", 
            10: "IN_PROGRESS",
            11: "COMPLETED",
            30: "SCHEDULED"
        }
        
        self.job_type_mapping = {
            1: "FULL_SERVICE",
            12: "PARTIAL_MOVE"
        }
        
        # LGM Location mapping
        self.location_mapping = {
            "CALGARY 🇨🇦 - Let's Get Moving": "loc_lgm_calgary_001",
            "VANCOUVER 🇨🇦 - Let's Get Moving": "loc_lgm_vancouver_001", 
            "BURNABY 🇨🇦 - Let's Get Moving": "loc_lgm_burnaby_corporate_001",
            "TORONTO 🇨🇦 - Let's Get Moving": "loc_lgm_toronto_001",
            "EDMONTON 🇨🇦 - Let's Get Moving": "loc_lgm_edmonton_001",
            "WINNIPEG 🇨🇦 - Let's Get Moving": "loc_lgm_winnipeg_001"
        }

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

    async def get_all_customers(self, days_back: int = 30) -> List[Dict]:
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
                                        self.sync_stats["locations_found"].add(opp['branch'])
                        
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

    def normalize_journey_data(self, job: Dict, opportunity: Dict, customer: Dict, client_id: str, location_id: str) -> Dict:
        """Normalize SmartMoving job data to C&C CRM TruckJourney format"""
        job_date = self.convert_smartmoving_date(job.get('jobDate'))
        
        # Map SmartMoving status to JourneyStage
        status_mapping = {
            3: "MORNING_PREP",    # Pending
            4: "MORNING_PREP",    # Confirmed
            10: "IN_TRANSIT",     # In Progress
            11: "COMPLETED",      # Completed
            30: "MORNING_PREP"    # Scheduled
        }
        
        journey_status = status_mapping.get(opportunity.get('status'), 'MORNING_PREP')
        
        # Create notes with customer and opportunity info
        notes = f"SmartMoving Job: {job.get('jobNumber', '')}\n"
        notes += f"Customer: {customer.get('name', '')}\n"
        notes += f"Quote: {opportunity.get('quoteNumber', '')}\n"
        notes += f"Estimated Value: ${opportunity.get('estimatedTotal', {}).get('finalTotal', 0):.2f}\n"
        notes += f"Customer Phone: {customer.get('phoneNumber', '')}\n"
        notes += f"Customer Email: {customer.get('emailAddress', '')}\n"
        notes += f"Customer Address: {customer.get('address', '')}"
        
        return {
            "locationId": location_id,
            "clientId": client_id,
            "date": job_date,
            "status": journey_status,
            "truckNumber": f"SM-{job.get('jobNumber', '')}",
            "notes": notes,
            "startTime": job_date,
            "externalId": job.get('id'),
            "externalData": {
                "smartmoving_opportunity_id": opportunity.get('id'),
                "smartmoving_customer_id": customer.get('id'),
                "quote_number": opportunity.get('quoteNumber'),
                "estimated_total": opportunity.get('estimatedTotal', {}).get('finalTotal', 0),
                "customer_name": customer.get('name'),
                "customer_phone": customer.get('phoneNumber'),
                "customer_email": customer.get('emailAddress'),
                "customer_address": customer.get('address'),
                "branch_name": opportunity.get('branch', {}).get('name', ''),
                "job_type": job.get('type'),
                "confirmed": job.get('confirmed', False)
            }
        }

    def convert_smartmoving_date(self, date_int: int) -> datetime:
        """Convert SmartMoving YYYYMMDD format to datetime"""
        if not date_int:
            return datetime.now(timezone.utc)
        
        date_str = str(date_int)
        try:
            return datetime.strptime(date_str, "%Y%m%d").replace(tzinfo=timezone.utc)
        except ValueError:
            return datetime.now(timezone.utc)

    async def get_or_create_lgm_client(self) -> str:
        """Get or create LGM client in C&C CRM"""
        try:
            # Check if LGM client exists
            existing_client = await self.db.client.find_first(
                where={"name": "Let's Get Moving"}
            )
            
            if existing_client:
                logger.info(f"✅ Found existing LGM client: {existing_client.id}")
                return existing_client.id
            
            # Create LGM client
            new_client = await self.db.client.create({
                "data": {
                    "name": "Let's Get Moving",
                    "email": "info@letsgetmoving.ca",
                    "phone": "+1-800-555-0123",
                    "address": "Canada",
                    "createdAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc)
                }
            })
            
            logger.info(f"✅ Created new LGM client: {new_client.id}")
            return new_client.id
            
        except Exception as e:
            logger.error(f"❌ Error with LGM client: {e}")
            raise

    async def get_or_create_location(self, branch_name: str, client_id: str) -> str:
        """Get or create location in C&C CRM"""
        try:
            # Check if location exists
            existing_location = await self.db.location.find_first(
                where={"name": branch_name}
            )
            
            if existing_location:
                logger.info(f"✅ Found existing location: {existing_location.id}")
                return existing_location.id
            
            # Create new location
            new_location = await self.db.location.create({
                "data": {
                    "clientId": client_id,
                    "name": branch_name,
                    "address": branch_name,
                    "phone": "",
                    "createdAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc)
                }
            })
            
            logger.info(f"✅ Created new location: {new_location.id}")
            return new_location.id
            
        except Exception as e:
            logger.error(f"❌ Error with location: {e}")
            raise

    async def sync_journey_to_database(self, journey_data: Dict) -> str:
        """Sync journey data to C&C CRM database"""
        try:
            # Check if journey already exists
            existing_journey = await self.db.truckjourney.find_first(
                where={"externalId": journey_data["externalId"]}
            )
            
            if existing_journey:
                # Update existing journey
                updated_journey = await self.db.truckjourney.update(
                    where={"id": existing_journey.id},
                    data={
                        "date": journey_data["date"],
                        "status": journey_data["status"],
                        "truckNumber": journey_data["truckNumber"],
                        "notes": journey_data["notes"],
                        "startTime": journey_data["startTime"],
                        "externalData": journey_data["externalData"]
                    }
                )
                logger.info(f"🔄 Updated journey: {updated_journey.id}")
                return updated_journey.id
            
            # Create new journey
            new_journey = await self.db.truckjourney.create({
                "data": journey_data
            })
            
            logger.info(f"✅ Created new journey: {new_journey.id}")
            self.sync_stats["journeys_synced"] += 1
            return new_journey.id
            
        except Exception as e:
            logger.error(f"❌ Error syncing journey: {e}")
            self.sync_stats["errors"].append(f"Journey sync error: {e}")
            raise

    async def sync_all_data(self, days_back: int = 30):
        """Sync all SmartMoving data to C&C CRM database"""
        logger.info("🚀 Starting SmartMoving data sync...")
        
        # Test API connection
        if not await self.test_api_connection():
            logger.error("❌ Cannot proceed without API connection")
            return
        
        # Connect to database
        await self.db.connect()
        logger.info("✅ Connected to C&C CRM database")
        
        try:
            # Get or create LGM client
            lgm_client_id = await self.get_or_create_lgm_client()
            
            # Get all customers from SmartMoving
            customers = await self.get_all_customers(days_back)
            
            logger.info(f"📊 Processing {len(customers)} customers...")
            
            for i, customer in enumerate(customers, 1):
                try:
                    logger.info(f"📋 Processing customer {i}/{len(customers)}: {customer.get('name', 'Unknown')}")
                    self.sync_stats["customers_processed"] += 1
                    
                    # Process opportunities (leads)
                    opportunities = customer.get('opportunities', [])
                    for opportunity in opportunities:
                        self.sync_stats["opportunities_processed"] += 1
                        try:
                            # Get detailed opportunity information
                            opportunity_details = await self.get_opportunity_details(opportunity['id'])
                            
                            if opportunity_details:
                                # Get or create location for this branch
                                branch_name = opportunity_details.get('branch', {}).get('name', 'Unknown Branch')
                                location_id = await self.get_or_create_location(branch_name, lgm_client_id)
                                
                                # Process jobs (journeys)
                                jobs = opportunity_details.get('jobs', [])
                                for job in jobs:
                                    try:
                                        # Normalize journey data
                                        journey_data = self.normalize_journey_data(
                                            job, 
                                            opportunity_details, 
                                            customer, 
                                            lgm_client_id, 
                                            location_id
                                        )
                                        
                                        # Sync journey to database
                                        await self.sync_journey_to_database(journey_data)
                                        
                                    except Exception as e:
                                        logger.error(f"❌ Error processing job {job.get('id')}: {e}")
                                        self.sync_stats["errors"].append(f"Job error: {e}")
                            
                        except Exception as e:
                            logger.error(f"❌ Error processing opportunity {opportunity.get('id')}: {e}")
                            self.sync_stats["errors"].append(f"Opportunity error: {e}")
                
                except Exception as e:
                    logger.error(f"❌ Error processing customer {customer.get('id')}: {e}")
                    self.sync_stats["errors"].append(f"Customer error: {e}")
            
            # Print sync summary
            self.print_sync_summary()
            
        except Exception as e:
            logger.error(f"❌ Sync error: {e}")
            self.sync_stats["errors"].append(f"Sync error: {e}")
        
        finally:
            await self.db.disconnect()
            logger.info("✅ Disconnected from database")

    def print_sync_summary(self):
        """Print sync summary"""
        print("\n" + "="*60)
        print("📊 SMARTMOVING DATA SYNC SUMMARY")
        print("="*60)
        print(f"✅ Customers Processed: {self.sync_stats['customers_processed']}")
        print(f"✅ Opportunities Processed: {self.sync_stats['opportunities_processed']}")
        print(f"✅ Journeys Synced: {self.sync_stats['journeys_synced']}")
        print(f"📍 Locations Found: {len(self.sync_stats['locations_found'])}")
        
        if self.sync_stats['locations_found']:
            print("\n📍 SmartMoving Locations:")
            for location in sorted(self.sync_stats['locations_found']):
                print(f"   • {location}")
        
        if self.sync_stats['errors']:
            print(f"\n❌ Errors: {len(self.sync_stats['errors'])}")
            for error in self.sync_stats['errors'][:5]:  # Show first 5 errors
                print(f"   • {error}")
            if len(self.sync_stats['errors']) > 5:
                print(f"   ... and {len(self.sync_stats['errors']) - 5} more errors")
        
        print("="*60)

async def main():
    """Main function"""
    sync_service = SmartMovingDataSync()
    
    # Sync last 30 days of data
    await sync_service.sync_all_data(days_back=30)

if __name__ == "__main__":
    asyncio.run(main())
