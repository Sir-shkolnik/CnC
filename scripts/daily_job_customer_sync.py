#!/usr/bin/env python3
"""
Daily Job and Customer Data Sync Script
Runs daily to fetch and sync job and customer data from SmartMoving API
"""

import asyncio
import httpx
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
import sys

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prisma import Prisma

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "5aa72e33-be47-42ba-b59e-aeec01250bb5"

class DailyJobCustomerSync:
    def __init__(self):
        self.db = Prisma()
        self.client = httpx.AsyncClient()
        self.sync_stats = {
            "jobs": {"total": 0, "imported": 0, "updated": 0, "errors": 0},
            "customers": {"total": 0, "imported": 0, "updated": 0, "errors": 0}
        }
        self.today = datetime.now().date()
        self.tomorrow = self.today + timedelta(days=1)
    
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
            "Content-Type": "application/json"
        }
    
    async def get_all_branches(self) -> List[Dict]:
        """Get all branches from our database"""
        branches = await self.db.companybranch.find_many(
            where={"companyIntegrationId": "lgm-integration", "isActive": True}
        )
        return [{"id": branch.externalId, "name": branch.name} for branch in branches]
    
    async def fetch_jobs_for_branch(self, branch_id: str, date: datetime.date) -> List[Dict]:
        """Fetch jobs for a specific branch and date"""
        try:
            # Format date for API
            date_str = date.strftime("%Y-%m-%d")
            
            response = await self.client.get(
                f"{SMARTMOVING_API_BASE_URL}/api/opportunities",
                headers=self.get_smartmoving_headers(),
                params={
                    "branchId": branch_id,
                    "scheduledDate": date_str,
                    "pageSize": 100
                }
            )
            response.raise_for_status()
            
            data = response.json()
            jobs = data.get("data", {}).get("pageResults", [])
            
            print(f"📅 Found {len(jobs)} jobs for branch {branch_id} on {date_str}")
            return jobs
            
        except Exception as e:
            print(f"❌ Error fetching jobs for branch {branch_id} on {date}: {e}")
            return []
    
    async def fetch_customers_for_branch(self, branch_id: str) -> List[Dict]:
        """Fetch customers for a specific branch"""
        try:
            response = await self.client.get(
                f"{SMARTMOVING_API_BASE_URL}/api/customers",
                headers=self.get_smartmoving_headers(),
                params={
                    "branchId": branch_id,
                    "pageSize": 100
                }
            )
            response.raise_for_status()
            
            data = response.json()
            customers = data.get("data", {}).get("pageResults", [])
            
            print(f"👥 Found {len(customers)} customers for branch {branch_id}")
            return customers
            
        except Exception as e:
            print(f"❌ Error fetching customers for branch {branch_id}: {e}")
            return []
    
    async def import_job(self, job_data: Dict, branch_id: str):
        """Import a job into our database"""
        try:
            # Check if job already exists
            existing_job = await self.db.job.find_first(
                where={
                    "externalId": job_data.get("id"),
                    "branchId": branch_id
                }
            )
            
            # Get branch reference
            branch = await self.db.companybranch.find_first(
                where={"externalId": branch_id, "companyIntegrationId": "lgm-integration"}
            )
            
            if not branch:
                print(f"❌ Branch not found: {branch_id}")
                return
            
            # Prepare job data
            job_record = {
                "externalId": job_data.get("id"),
                "branchId": branch.id,
                "customerId": job_data.get("customerId"),
                "customerName": job_data.get("customerName", "Unknown"),
                "customerPhone": job_data.get("customerPhone"),
                "customerEmail": job_data.get("customerEmail"),
                "pickupAddress": job_data.get("pickupAddress", ""),
                "deliveryAddress": job_data.get("deliveryAddress", ""),
                "scheduledDate": datetime.fromisoformat(job_data.get("scheduledDate", datetime.now().isoformat())),
                "estimatedDuration": job_data.get("estimatedDuration"),
                "moveSize": job_data.get("moveSize"),
                "serviceType": job_data.get("serviceType"),
                "status": job_data.get("status", "Scheduled"),
                "crewSize": job_data.get("crewSize", 2),
                "specialRequirements": job_data.get("specialRequirements"),
                "notes": job_data.get("notes"),
                "priority": job_data.get("priority", "Medium"),
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            if existing_job:
                # Update existing job
                await self.db.job.update(
                    where={"id": existing_job.id},
                    data=job_record
                )
                self.sync_stats["jobs"]["updated"] += 1
                print(f"🔄 Updated job: {job_record['customerName']}")
            else:
                # Create new job
                await self.db.job.create(data=job_record)
                self.sync_stats["jobs"]["imported"] += 1
                print(f"✅ Imported job: {job_record['customerName']}")
            
            # Add tags for intelligent organization
            await self.add_job_tags(job_record["externalId"], job_data, branch)
            
        except Exception as e:
            self.sync_stats["jobs"]["errors"] += 1
            print(f"❌ Error importing job {job_data.get('customerName', 'Unknown')}: {e}")
    
    async def add_job_tags(self, job_id: str, job_data: Dict, branch):
        """Add intelligent tags to job for organization"""
        try:
            tags = [
                {"tagType": "location", "tagValue": branch.name},
                {"tagType": "date", "tagValue": job_data.get("scheduledDate", "")},
                {"tagType": "status", "tagValue": job_data.get("status", "Scheduled")},
                {"tagType": "priority", "tagValue": job_data.get("priority", "Medium")},
                {"tagType": "service", "tagValue": job_data.get("serviceType", "")},
                {"tagType": "customer", "tagValue": job_data.get("customerName", "")}
            ]
            
            for tag in tags:
                await self.db.jobtag.upsert(
                    where={
                        "jobId_tagType_tagValue": {
                            "jobId": job_id,
                            "tagType": tag["tagType"],
                            "tagValue": tag["tagValue"]
                        }
                    },
                    data={
                        "create": {
                            "jobId": job_id,
                            "tagType": tag["tagType"],
                            "tagValue": tag["tagValue"],
                            "createdAt": datetime.utcnow()
                        },
                        "update": {
                            "updatedAt": datetime.utcnow()
                        }
                    }
                )
                
        except Exception as e:
            print(f"❌ Error adding tags to job {job_id}: {e}")
    
    async def sync_jobs_for_date(self, date: datetime.date):
        """Sync jobs for a specific date across all branches"""
        print(f"\n📅 Syncing jobs for {date}...")
        
        branches = await self.get_all_branches()
        print(f"🏢 Processing {len(branches)} branches...")
        
        for branch in branches:
            jobs = await self.fetch_jobs_for_branch(branch["id"], date)
            self.sync_stats["jobs"]["total"] += len(jobs)
            
            for job in jobs:
                await self.import_job(job, branch["id"])
    
    async def sync_today_and_tomorrow_jobs(self):
        """Sync jobs for today and tomorrow"""
        print("🚀 Starting daily job sync...")
        
        # Sync today's jobs
        await self.sync_jobs_for_date(self.today)
        
        # Sync tomorrow's jobs
        await self.sync_jobs_for_date(self.tomorrow)
    
    async def update_sync_schedule(self):
        """Update the sync schedule for next run"""
        try:
            next_sync = datetime.utcnow() + timedelta(hours=24)
            
            await self.db.companyintegration.update_many(
                where={"name": "lgm-integration"},
                data={
                    "lastSyncAt": datetime.utcnow(),
                    "nextSyncAt": next_sync,
                    "syncStatus": "COMPLETED",
                    "updatedAt": datetime.utcnow()
                }
            )
            
            print(f"✅ Next sync scheduled for: {next_sync}")
            
        except Exception as e:
            print(f"❌ Error updating sync schedule: {e}")
    
    def print_sync_summary(self):
        """Print sync summary"""
        print("\n" + "="*60)
        print("📊 DAILY JOB SYNC SUMMARY")
        print("="*60)
        
        for data_type, stats in self.sync_stats.items():
            print(f"\n{data_type.title()}:")
            print(f"  Total: {stats['total']}")
            print(f"  Imported: {stats['imported']}")
            print(f"  Updated: {stats['updated']}")
            print(f"  Errors: {stats['errors']}")
            print(f"  Success Rate: {((stats['imported'] + stats['updated']) / stats['total'] * 100):.1f}%" if stats['total'] > 0 else "  Success Rate: 0%")
        
        total_imported = sum(stats['imported'] for stats in self.sync_stats.values())
        total_updated = sum(stats['updated'] for stats in self.sync_stats.values())
        total_errors = sum(stats['errors'] for stats in self.sync_stats.values())
        total_records = sum(stats['total'] for stats in self.sync_stats.values())
        
        print(f"\n🎯 OVERALL SUMMARY:")
        print(f"  Total Records Processed: {total_records}")
        print(f"  Successfully Imported: {total_imported}")
        print(f"  Successfully Updated: {total_updated}")
        print(f"  Errors: {total_errors}")
        print(f"  Overall Success Rate: {((total_imported + total_updated) / total_records * 100):.1f}%" if total_records > 0 else "  Overall Success Rate: 0%")
        
        print(f"\n📅 Sync completed for {self.today} and {self.tomorrow}")
        print("🔄 Next sync scheduled for tomorrow")

async def main():
    """Main function to run daily sync"""
    print("🚀 Starting Daily Job and Customer Sync...")
    print("📅 This will sync jobs for today and tomorrow")
    
    async with DailyJobCustomerSync() as syncer:
        try:
            # Sync jobs for today and tomorrow
            await syncer.sync_today_and_tomorrow_jobs()
            
            # Update sync schedule
            await syncer.update_sync_schedule()
            
            # Print summary
            syncer.print_sync_summary()
            
        except Exception as e:
            print(f"❌ Fatal error during sync: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(main())
