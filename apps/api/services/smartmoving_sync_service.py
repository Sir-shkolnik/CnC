#!/usr/bin/env python3
"""
SmartMoving Sync Service
Handles synchronization of SmartMoving data with C&C CRM database
"""

import asyncio
import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from prisma import Prisma
from prisma.models import TruckJourney, Location

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SmartMovingSyncService:
    """Service for synchronizing SmartMoving data with C&C CRM"""
    
    def __init__(self):
        self.api_base_url = "https://api-public.smartmoving.com/v1"
        self.api_key = "185840176c73420fbd3a473c2fdccedb"
        self.client_id = "b0db4e2b-74af-44e2-8ecd-6f4921ec836f"
        self.db = Prisma()
        
    async def __aenter__(self):
        await self.db.connect()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.db.disconnect()
    
    async def get_smartmoving_headers(self) -> Dict[str, str]:
        """Get headers for SmartMoving API requests"""
        return {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    
    async def make_smartmoving_request(
        self, 
        method: str, 
        endpoint: str, 
        params: Dict = None
    ) -> Dict[str, Any]:
        """Make a request to SmartMoving API"""
        try:
            headers = await self.get_smartmoving_headers()
            url = f"{self.api_base_url}{endpoint}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                if method.upper() == "GET":
                    response = await client.get(url, headers=headers, params=params)
                else:
                    response = await client.post(url, headers=headers, json=params)
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "data": response.json(),
                        "status_code": response.status_code
                    }
                else:
                    logger.error(f"SmartMoving API error: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "message": f"API error: {response.status_code}",
                        "status_code": response.status_code
                    }
                    
        except Exception as e:
            logger.error(f"SmartMoving API request failed: {str(e)}")
            return {
                "success": False,
                "message": f"Request failed: {str(e)}",
                "status_code": 500
            }
    
    async def sync_today_and_tomorrow_jobs(self, location_id: str = None) -> Dict[str, Any]:
        """Sync today's and tomorrow's jobs from SmartMoving for a specific location or all locations"""
        logger.info(f"Starting SmartMoving job sync for today and tomorrow (location_id: {location_id})")
        
        today = datetime.now()
        tomorrow = today + timedelta(days=1)
        
        sync_results = {
            "today": await self.sync_jobs_for_date(today, location_id),
            "tomorrow": await self.sync_jobs_for_date(tomorrow, location_id),
            "summary": {
                "totalProcessed": 0,
                "totalCreated": 0,
                "totalUpdated": 0,
                "totalFailed": 0,
                "syncTime": datetime.now().isoformat(),
                "location_id": location_id
            }
        }
        
        # Calculate summary
        sync_results["summary"]["totalProcessed"] = (
            sync_results["today"]["processed"] + 
            sync_results["tomorrow"]["processed"]
        )
        sync_results["summary"]["totalCreated"] = (
            sync_results["today"]["created"] + 
            sync_results["tomorrow"]["created"]
        )
        sync_results["summary"]["totalUpdated"] = (
            sync_results["today"]["updated"] + 
            sync_results["tomorrow"]["updated"]
        )
        sync_results["summary"]["totalFailed"] = (
            sync_results["today"]["failed"] + 
            sync_results["tomorrow"]["failed"]
        )
        
        logger.info(f"SmartMoving sync completed: {sync_results['summary']}")
        return sync_results
    
    async def sync_jobs_for_date(self, date: datetime, location_id: str = None) -> Dict[str, Any]:
        """Sync jobs for a specific date and optionally for a specific location"""
        date_str = date.strftime("%Y-%m-%d")
        logger.info(f"Syncing SmartMoving jobs for date: {date_str} (location_id: {location_id})")
        
        try:
            # Pull SmartMoving jobs for date
            smartmoving_jobs = await self.pull_smartmoving_jobs(date_str)
            
            if not smartmoving_jobs["success"]:
                return {
                    "processed": 0,
                    "created": 0,
                    "updated": 0,
                    "failed": 1,
                    "error": smartmoving_jobs["message"]
                }
            
            # Normalize SmartMoving data to C&C CRM format
            normalized_jobs = self.normalize_smartmoving_jobs(smartmoving_jobs["data"])
            
            # Filter by location if specified
            if location_id:
                normalized_jobs = [job for job in normalized_jobs if job.get('locationId') == location_id]
                logger.info(f"Filtered to {len(normalized_jobs)} jobs for location {location_id}")
            
            # Sync to C&C CRM database
            sync_result = await self.sync_to_crm_database(normalized_jobs, date_str)
            
            return sync_result
            
        except Exception as e:
            logger.error(f"Error syncing jobs for date {date_str}: {str(e)}")
            return {
                "processed": 0,
                "created": 0,
                "updated": 0,
                "failed": 1,
                "error": str(e)
            }
    
    async def pull_smartmoving_jobs(self, date_str: str) -> Dict[str, Any]:
        """Pull jobs from SmartMoving API for a specific date"""
        try:
            # Convert date string to SmartMoving format (YYYYMMDD)
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            smartmoving_date = date_obj.strftime("%Y%m%d")
            
            logger.info(f"Pulling SmartMoving jobs for date: {date_str} (SmartMoving format: {smartmoving_date})")
            
            all_customers = []
            page = 1
            total_pages = 1
            
            # Pull all customers for the specific date with pagination
            while page <= total_pages:
                params = {
                    "FromServiceDate": int(smartmoving_date),
                    "ToServiceDate": int(smartmoving_date),
                    "IncludeOpportunityInfo": True,
                    "Page": page,
                    "PageSize": 100
                }
                
                response = await self.make_smartmoving_request("GET", "/api/customers", params)
                
                if response["success"]:
                    customers_data = response["data"]
                    customers = customers_data.get("pageResults", [])
                    total_pages = customers_data.get("totalPages", 1)
                    
                    logger.info(f"Page {page}/{total_pages}: Found {len(customers)} customers")
                    all_customers.extend(customers)
                    
                    page += 1
                else:
                    logger.error(f"Failed to get customers for page {page}: {response['message']}")
                    break
            
            logger.info(f"Total customers pulled for {date_str}: {len(all_customers)}")
            
            # Extract all jobs from customers
            all_jobs = []
            for customer in all_customers:
                opportunities = customer.get("opportunities", [])
                for opportunity in opportunities:
                    jobs = opportunity.get("jobs", [])
                    for job in jobs:
                        # Add customer and opportunity info to job
                        job["customer"] = customer
                        job["opportunity"] = opportunity
                        all_jobs.append(job)
            
            logger.info(f"Total jobs extracted for {date_str}: {len(all_jobs)}")
            
            return {
                "success": True,
                "data": all_jobs,
                "customers_count": len(all_customers),
                "jobs_count": len(all_jobs),
                "date": date_str
            }
                
        except Exception as e:
            logger.error(f"Error pulling SmartMoving jobs: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to pull jobs: {str(e)}"
            }
    
    def normalize_smartmoving_jobs(self, smartmoving_jobs: List[Dict]) -> List[Dict]:
        """Normalize SmartMoving job data to C&C CRM TruckJourney format"""
        normalized_jobs = []
        
        for job in smartmoving_jobs:
            try:
                # Extract customer and opportunity info
                customer = job.get("customer", {})
                opportunity = job.get("opportunity", {})
                
                # Extract job addresses
                job_addresses = job.get("jobAddresses", [])
                origin_address = job_addresses[0] if len(job_addresses) > 0 else ""
                destination_address = job_addresses[1] if len(job_addresses) > 1 else ""
                
                # Extract customer information
                customer_name = customer.get("name", "")
                customer_phone = customer.get("phoneNumber", "")
                customer_email = customer.get("emailAddress", "")
                
                # Extract opportunity information
                quote_number = opportunity.get("quoteNumber", "")
                
                # Extract estimated value
                estimated_total = job.get("estimatedTotal", {})
                estimated_value = estimated_total.get("finalTotal", 0.0)
                
                # Convert job date
                job_date = job.get("jobDate")
                if isinstance(job_date, int):
                    # SmartMoving date format: 20250807
                    job_date_str = str(job_date)
                    if len(job_date_str) == 8:
                        scheduled_date = datetime.strptime(job_date_str, "%Y%m%d")
                    else:
                        scheduled_date = datetime.now()
                else:
                    scheduled_date = self.convert_smartmoving_date(job_date)
                
                # Map to TruckJourney model structure
                normalized_job = {
                    # Core journey data
                    "date": scheduled_date,
                    "status": "MORNING_PREP",  # Default status
                    "truckNumber": job.get("truckNumber", ""),
                    
                    # Timing
                    "startTime": scheduled_date,
                    "estimatedDuration": job.get("estimatedDuration", 480),  # 8 hours default
                    
                    # Notes and priority
                    "notes": f"SmartMoving Job #{job.get('jobNumber', '')} - {customer_name}",
                    "priority": "NORMAL",
                    "tags": [job.get("serviceType", ""), "SmartMoving"],
                    
                    # Financial data
                    "estimatedCost": float(estimated_value) if estimated_value else None,
                    "billingStatus": "PENDING",
                    
                    # Location data
                    "startLocation": {"address": origin_address} if origin_address else None,
                    "endLocation": {"address": destination_address} if destination_address else None,
                    
                    # SmartMoving specific data
                    "externalId": f"sm_job_{job.get('jobNumber', 'unknown')}",
                    "externalData": job,
                    "smartmovingJobNumber": job.get("jobNumber", ""),
                    "smartmovingQuoteNumber": quote_number,
                    "customerName": customer_name,
                    "customerPhone": customer_phone,
                    "customerEmail": customer_email,
                    "serviceType": job.get("serviceType", ""),
                    "moveSize": job.get("moveSize", ""),
                    "confirmed": job.get("confirmed", False),
                    "dataSource": "SMARTMOVING",
                    "lastSyncAt": datetime.now(),
                    "syncStatus": "SYNCED"
                }
                
                normalized_jobs.append(normalized_job)
                
            except Exception as e:
                logger.error(f"Error normalizing job {job.get('jobNumber', 'unknown')}: {str(e)}")
                continue
        
        logger.info(f"Normalized {len(normalized_jobs)} jobs to TruckJourney format")
        return normalized_jobs
    
    def convert_smartmoving_date(self, date_str: str) -> datetime:
        """Convert SmartMoving date string to datetime"""
        try:
            if date_str:
                # SmartMoving date format: "2025-08-07T00:00:00"
                return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                return datetime.now()
        except Exception as e:
            logger.error(f"Error converting date {date_str}: {str(e)}")
            return datetime.now()
    
    async def sync_to_crm_database(self, normalized_jobs: List[Dict], date_str: str) -> Dict[str, Any]:
        """Sync normalized jobs to C&C CRM TruckJourney database"""
        created_count = 0
        updated_count = 0
        failed_count = 0
        
        for job_data in normalized_jobs:
            try:
                # Check if job already exists
                existing_job = await self.db.truckjourney.find_first(
                    where={
                        "externalId": job_data["externalId"]
                    }
                )
                
                if existing_job:
                    # Update existing job with new data
                    update_data = {
                        "externalData": job_data["externalData"],
                        "lastSyncAt": job_data["lastSyncAt"],
                        "syncStatus": job_data["syncStatus"],
                        "updatedAt": datetime.now(),
                        "updatedBy": await self.get_default_user_id()
                    }
                    
                    # Update core fields if they've changed
                    if job_data.get("date"):
                        update_data["date"] = job_data["date"]
                    if job_data.get("startTime"):
                        update_data["startTime"] = job_data["startTime"]
                    if job_data.get("estimatedDuration"):
                        update_data["estimatedDuration"] = job_data["estimatedDuration"]
                    if job_data.get("notes"):
                        update_data["notes"] = job_data["notes"]
                    if job_data.get("estimatedCost"):
                        update_data["estimatedCost"] = job_data["estimatedCost"]
                    if job_data.get("startLocation"):
                        update_data["startLocation"] = job_data["startLocation"]
                    if job_data.get("endLocation"):
                        update_data["endLocation"] = job_data["endLocation"]
                    
                    await self.db.truckjourney.update(
                        where={"id": existing_job.id},
                        data=update_data
                    )
                    updated_count += 1
                    logger.debug(f"Updated journey: {job_data['externalId']}")
                    
                else:
                    # Create new journey
                    # First, find or create a location for this job
                    location = await self.find_or_create_location_for_job(job_data)
                    
                    # Prepare journey data
                    journey_data = {
                        "locationId": location.id,
                        "clientId": location.clientId,
                        "date": job_data["date"],
                        "status": job_data["status"],
                        "truckNumber": job_data.get("truckNumber"),
                        "startTime": job_data.get("startTime"),
                        "estimatedDuration": job_data.get("estimatedDuration"),
                        "notes": job_data["notes"],
                        "priority": job_data["priority"],
                        "tags": job_data["tags"],
                        "estimatedCost": job_data.get("estimatedCost"),
                        "billingStatus": job_data["billingStatus"],
                        "startLocation": job_data.get("startLocation"),
                        "endLocation": job_data.get("endLocation"),
                        "externalId": job_data["externalId"],
                        "externalData": job_data["externalData"],
                        "createdBy": await self.get_default_user_id()
                    }
                    
                    # Create the journey
                    await self.db.truckjourney.create(data=journey_data)
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
    
    async def find_or_create_location_for_job(self, job_data: Dict) -> Location:
        """Find or create a location for a SmartMoving job"""
        try:
            # Try to find existing location by SmartMoving data
            location = await self.db.location.find_first(
                where={
                    "dataSource": "SMARTMOVING",
                    "externalData": {
                        "path": ["smartmovingName"],
                        "equals": job_data["externalData"].get("branch", {}).get("name", "")
                    }
                }
            )
            
            if location:
                return location
            
            # If not found, create a new location
            # Get the default client (LGM)
            client = await self.db.client.find_first(
                where={"name": "Lets Get Moving"}
            )
            
            if not client:
                raise Exception("Default client not found")
            
            # Create new location
            location = await self.db.location.create(
                data={
                    "clientId": client.id,
                    "name": job_data["externalData"].get("branch", {}).get("name", "Unknown Location"),
                    "timezone": "America/Toronto",
                    "address": job_data["originAddress"],
                    "externalId": f"sm_branch_{job_data['externalData'].get('branch', {}).get('id', 'unknown')}",
                    "externalData": job_data["externalData"].get("branch", {}),
                    "dataSource": "SMARTMOVING",
                    "lastSyncAt": datetime.now()
                }
            )
            
            logger.info(f"Created new location: {location.name}")
            return location
            
        except Exception as e:
            logger.error(f"Error finding/creating location: {str(e)}")
            # Return default location as fallback
            return await self.get_default_location()
    
    async def get_default_location(self) -> Location:
        """Get default location as fallback"""
        location = await self.db.location.find_first(
            where={"name": "Toronto Main Office"}
        )
        
        if not location:
            raise Exception("Default location not found")
        
        return location
    
    async def get_default_user_id(self) -> str:
        """Get default user ID for creating journeys"""
        user = await self.db.user.find_first(
            where={"role": "ADMIN"}
        )
        
        if not user:
            raise Exception("Default admin user not found")
        
        return user.id
    
    async def get_sync_status(self) -> Dict[str, Any]:
        """Get current sync status"""
        try:
            # Get sync statistics
            total_jobs = await self.db.truckjourney.count(
                where={"dataSource": "SMARTMOVING"}
            )
            
            synced_jobs = await self.db.truckjourney.count(
                where={
                    "dataSource": "SMARTMOVING",
                    "syncStatus": "SYNCED"
                }
            )
            
            pending_jobs = await self.db.truckjourney.count(
                where={
                    "dataSource": "SMARTMOVING",
                    "syncStatus": "PENDING"
                }
            )
            
            failed_jobs = await self.db.truckjourney.count(
                where={
                    "dataSource": "SMARTMOVING",
                    "syncStatus": "FAILED"
                }
            )
            
            return {
                "success": True,
                "data": {
                    "totalJobs": total_jobs,
                    "syncedJobs": synced_jobs,
                    "pendingJobs": pending_jobs,
                    "failedJobs": failed_jobs,
                    "lastSync": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting sync status: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to get sync status: {str(e)}"
            }

# Example usage
async def main():
    """Example usage of SmartMoving sync service"""
    async with SmartMovingSyncService() as sync_service:
        # Sync today's and tomorrow's jobs
        result = await sync_service.sync_today_and_tomorrow_jobs()
        print(f"Sync result: {result}")
        
        # Get sync status
        status = await sync_service.get_sync_status()
        print(f"Sync status: {status}")

if __name__ == "__main__":
    asyncio.run(main())
