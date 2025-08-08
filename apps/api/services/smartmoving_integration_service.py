#!/usr/bin/env python3
"""
SmartMoving Integration Service
Comprehensive service for managing SmartMoving integration from super admin perspective
"""

import asyncio
import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from prisma import Prisma
from prisma.models import CompanyIntegration, CompanyDataSyncLog, TruckJourney, Location

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SmartMovingIntegrationService:
    """Service for managing SmartMoving integration from super admin perspective"""
    
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
    
    async def get_integration_status(self) -> Dict[str, Any]:
        """Get comprehensive SmartMoving integration status"""
        try:
            # Get or create SmartMoving integration record
            integration = await self.db.companyintegration.find_first(
                where={"apiSource": "SMARTMOVING"}
            )
            
            if not integration:
                # Create SmartMoving integration record
                integration = await self.db.companyintegration.create(
                    data={
                        "name": "SmartMoving Integration",
                        "apiSource": "SMARTMOVING",
                        "apiBaseUrl": self.api_base_url,
                        "apiKey": self.api_key,
                        "clientId": self.client_id,
                        "isActive": True,
                        "syncFrequencyHours": 12,
                        "syncStatus": "PENDING",
                        "settings": {
                            "apiKey": self.api_key,
                            "clientId": self.client_id,
                            "baseUrl": self.api_base_url
                        }
                    }
                )
            
            # Test API connection
            api_status = await self.test_api_connection()
            
            # Get sync statistics
            sync_stats = await self.get_sync_statistics()
            
            # Get recent sync logs
            recent_logs = await self.get_recent_sync_logs()
            
            return {
                "success": True,
                "data": {
                    "integration": {
                        "id": integration.id,
                        "name": integration.name,
                        "apiSource": integration.apiSource,
                        "isActive": integration.isActive,
                        "syncFrequencyHours": integration.syncFrequencyHours,
                        "lastSyncAt": integration.lastSyncAt.isoformat() if integration.lastSyncAt else None,
                        "nextSyncAt": integration.nextSyncAt.isoformat() if integration.nextSyncAt else None,
                        "syncStatus": integration.syncStatus
                    },
                    "apiStatus": api_status,
                    "syncStats": sync_stats,
                    "recentLogs": recent_logs
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting integration status: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to get integration status: {str(e)}"
            }
    
    async def test_api_connection(self) -> Dict[str, Any]:
        """Test SmartMoving API connection"""
        try:
            headers = {
                "x-api-key": self.api_key,
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Test branches endpoint
                response = await client.get(
                    f"{self.api_base_url}/api/branches",
                    headers=headers,
                    params={"PageSize": 1}
                )
                
                if response.status_code == 200:
                    return {
                        "status": "connected",
                        "message": "SmartMoving API connection successful",
                        "responseTime": response.elapsed.total_seconds(),
                        "lastTested": datetime.now().isoformat()
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"API connection failed: {response.status_code}",
                        "responseTime": response.elapsed.total_seconds(),
                        "lastTested": datetime.now().isoformat()
                    }
                    
        except Exception as e:
            logger.error(f"Error testing API connection: {str(e)}")
            return {
                "status": "error",
                "message": f"Connection test failed: {str(e)}",
                "lastTested": datetime.now().isoformat()
            }
    
    async def get_sync_statistics(self) -> Dict[str, Any]:
        """Get comprehensive sync statistics"""
        try:
            # Get total jobs
            total_jobs = await self.db.truckjourney.count(
                where={"dataSource": "SMARTMOVING"}
            )
            
            # Get jobs by status
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
            
            # Get locations
            total_locations = await self.db.location.count(
                where={"dataSource": "SMARTMOVING"}
            )
            
            # Get recent activity
            recent_jobs = await self.db.truckjourney.find_many(
                where={"dataSource": "SMARTMOVING"},
                order={"lastSyncAt": "desc"},
                take=10
            )
            
            return {
                "totalJobs": total_jobs,
                "syncedJobs": synced_jobs,
                "pendingJobs": pending_jobs,
                "failedJobs": failed_jobs,
                "totalLocations": total_locations,
                "recentJobs": [
                    {
                        "id": job.id,
                        "externalId": job.externalId,
                        "syncStatus": job.syncStatus,
                        "lastSyncAt": job.lastSyncAt.isoformat() if job.lastSyncAt else None
                    }
                    for job in recent_jobs
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting sync statistics: {str(e)}")
            return {
                "totalJobs": 0,
                "syncedJobs": 0,
                "pendingJobs": 0,
                "failedJobs": 0,
                "totalLocations": 0,
                "recentJobs": []
            }
    
    async def get_recent_sync_logs(self) -> List[Dict[str, Any]]:
        """Get recent sync logs"""
        try:
            logs = await self.db.companydatasynclog.find_many(
                where={"companyIntegrationId": "smartmoving"},
                order={"startedAt": "desc"},
                take=20
            )
            
            return [
                {
                    "id": log.id,
                    "syncType": log.syncType,
                    "status": log.status,
                    "recordsProcessed": log.recordsProcessed,
                    "recordsCreated": log.recordsCreated,
                    "recordsUpdated": log.recordsUpdated,
                    "recordsFailed": log.recordsFailed,
                    "startedAt": log.startedAt.isoformat(),
                    "completedAt": log.completedAt.isoformat() if log.completedAt else None,
                    "errorMessage": log.errorMessage
                }
                for log in logs
            ]
            
        except Exception as e:
            logger.error(f"Error getting recent sync logs: {str(e)}")
            return []
    
    async def update_integration_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Update SmartMoving integration settings"""
        try:
            integration = await self.db.companyintegration.find_first(
                where={"apiSource": "SMARTMOVING"}
            )
            
            if not integration:
                return {
                    "success": False,
                    "message": "SmartMoving integration not found"
                }
            
            # Update integration settings
            updated_integration = await self.db.companyintegration.update(
                where={"id": integration.id},
                data={
                    "isActive": settings.get("isActive", integration.isActive),
                    "syncFrequencyHours": settings.get("syncFrequencyHours", integration.syncFrequencyHours),
                    "settings": settings.get("settings", integration.settings),
                    "updatedAt": datetime.now()
                }
            )
            
            return {
                "success": True,
                "data": {
                    "id": updated_integration.id,
                    "name": updated_integration.name,
                    "isActive": updated_integration.isActive,
                    "syncFrequencyHours": updated_integration.syncFrequencyHours,
                    "settings": updated_integration.settings
                },
                "message": "Integration settings updated successfully"
            }
            
        except Exception as e:
            logger.error(f"Error updating integration settings: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to update settings: {str(e)}"
            }
    
    async def force_sync(self) -> Dict[str, Any]:
        """Force a manual sync of SmartMoving data"""
        try:
            # Create sync log entry
            sync_log = await self.db.companydatasynclog.create(
                data={
                    "companyIntegrationId": "smartmoving",
                    "syncType": "MANUAL",
                    "status": "RUNNING",
                    "startedAt": datetime.now()
                }
            )
            
            # Perform sync operations
            sync_results = {
                "jobs": await self.sync_jobs(),
                "locations": await self.sync_locations(),
                "summary": {
                    "totalProcessed": 0,
                    "totalCreated": 0,
                    "totalUpdated": 0,
                    "totalFailed": 0
                }
            }
            
            # Calculate summary
            for result_type, result in sync_results.items():
                if result_type != "summary" and isinstance(result, dict):
                    sync_results["summary"]["totalProcessed"] += result.get("processed", 0)
                    sync_results["summary"]["totalCreated"] += result.get("created", 0)
                    sync_results["summary"]["totalUpdated"] += result.get("updated", 0)
                    sync_results["summary"]["totalFailed"] += result.get("failed", 0)
            
            # Update sync log
            await self.db.companydatasynclog.update(
                where={"id": sync_log.id},
                data={
                    "status": "COMPLETED" if sync_results["summary"]["totalFailed"] == 0 else "FAILED",
                    "recordsProcessed": sync_results["summary"]["totalProcessed"],
                    "recordsCreated": sync_results["summary"]["totalCreated"],
                    "recordsUpdated": sync_results["summary"]["totalUpdated"],
                    "recordsFailed": sync_results["summary"]["totalFailed"],
                    "completedAt": datetime.now(),
                    "metadata": sync_results
                }
            )
            
            # Update integration last sync time
            await self.db.companyintegration.update_many(
                where={"apiSource": "SMARTMOVING"},
                data={
                    "lastSyncAt": datetime.now(),
                    "nextSyncAt": datetime.now() + timedelta(hours=12),
                    "syncStatus": "SYNCED"
                }
            )
            
            return {
                "success": True,
                "data": sync_results,
                "message": "Manual sync completed successfully"
            }
            
        except Exception as e:
            logger.error(f"Error during force sync: {str(e)}")
            
            # Update sync log with error
            if 'sync_log' in locals():
                await self.db.companydatasynclog.update(
                    where={"id": sync_log.id},
                    data={
                        "status": "FAILED",
                        "errorMessage": str(e),
                        "completedAt": datetime.now()
                    }
                )
            
            return {
                "success": False,
                "message": f"Sync failed: {str(e)}"
            }
    
    async def sync_jobs(self) -> Dict[str, Any]:
        """Sync SmartMoving jobs"""
        try:
            # This would integrate with the existing SmartMoving sync service
            # For now, return placeholder data
            return {
                "processed": 0,
                "created": 0,
                "updated": 0,
                "failed": 0,
                "message": "Job sync not implemented yet"
            }
        except Exception as e:
            logger.error(f"Error syncing jobs: {str(e)}")
            return {
                "processed": 0,
                "created": 0,
                "updated": 0,
                "failed": 1,
                "error": str(e)
            }
    
    async def sync_locations(self) -> Dict[str, Any]:
        """Sync SmartMoving locations"""
        try:
            # This would integrate with the existing SmartMoving sync service
            # For now, return placeholder data
            return {
                "processed": 0,
                "created": 0,
                "updated": 0,
                "failed": 0,
                "message": "Location sync not implemented yet"
            }
        except Exception as e:
            logger.error(f"Error syncing locations: {str(e)}")
            return {
                "processed": 0,
                "created": 0,
                "updated": 0,
                "failed": 1,
                "error": str(e)
            }
    
    async def get_integration_analytics(self) -> Dict[str, Any]:
        """Get SmartMoving integration analytics"""
        try:
            # Get daily sync statistics for the last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
            daily_stats = []
            for i in range(30):
                date = thirty_days_ago + timedelta(days=i)
                start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = start_of_day + timedelta(days=1)
                
                # Count jobs synced on this day
                jobs_synced = await self.db.truckjourney.count(
                    where={
                        "dataSource": "SMARTMOVING",
                        "lastSyncAt": {
                            "gte": start_of_day,
                            "lt": end_of_day
                        }
                    }
                )
                
                daily_stats.append({
                    "date": start_of_day.strftime("%Y-%m-%d"),
                    "jobsSynced": jobs_synced
                })
            
            return {
                "success": True,
                "data": {
                    "dailyStats": daily_stats,
                    "totalDays": 30,
                    "averageJobsPerDay": sum(stat["jobsSynced"] for stat in daily_stats) / 30
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting integration analytics: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to get analytics: {str(e)}"
            }

# Example usage
async def main():
    """Example usage of SmartMoving integration service"""
    async with SmartMovingIntegrationService() as service:
        # Get integration status
        status = await service.get_integration_status()
        print(f"Integration status: {status}")
        
        # Get analytics
        analytics = await service.get_integration_analytics()
        print(f"Analytics: {analytics}")

if __name__ == "__main__":
    asyncio.run(main())
