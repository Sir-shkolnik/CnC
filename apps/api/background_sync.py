#!/usr/bin/env python3
"""
Background SmartMoving Sync Service
Automatically syncs SmartMoving data every 2 hours for all locations
"""

import asyncio
import logging
import os
import signal
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any
from prisma import Prisma
from apps.api.services.smartmoving_sync_service import SmartMovingSyncService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BackgroundSmartMovingSync:
    """Background service for automated SmartMoving sync"""
    
    def __init__(self):
        self.db = Prisma()
        self.running = False
        self.sync_interval = 2 * 60 * 60  # 2 hours in seconds
        self.last_sync = None
        
    async def __aenter__(self):
        await self.db.connect()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.db.disconnect()
    
    async def get_all_locations(self) -> List[Dict[str, Any]]:
        """Get all active locations from the database"""
        try:
            locations = await self.db.location.find_many(
                where={
                    "status": "ACTIVE"
                },
                include={
                    "client": True
                }
            )
            
            logger.info(f"Found {len(locations)} active locations")
            return locations
            
        except Exception as e:
            logger.error(f"Error fetching locations: {e}")
            return []
    
    async def sync_location_jobs(self, location: Dict[str, Any]) -> Dict[str, Any]:
        """Sync comprehensive 48-hour jobs for a specific location"""
        try:
            location_name = location.get('name', 'Unknown')
            logger.info(f"Syncing comprehensive 48-hour jobs for location: {location_name}")
            
            async with SmartMovingSyncService() as sync_service:
                # Sync today and tomorrow for this location with full data
                result = await sync_service.sync_today_and_tomorrow_jobs()
                
                # Log detailed results
                today_stats = result.get('today', {})
                tomorrow_stats = result.get('tomorrow', {})
                summary = result.get('summary', {})
                
                logger.info(f"Location {location_name} sync completed:")
                logger.info(f"  Today: {today_stats.get('processed', 0)} processed, {today_stats.get('created', 0)} created")
                logger.info(f"  Tomorrow: {tomorrow_stats.get('processed', 0)} processed, {tomorrow_stats.get('created', 0)} created")
                logger.info(f"  Total: {summary.get('totalProcessed', 0)} processed, {summary.get('totalCreated', 0)} created")
                
                return {
                    "location_id": location.get('id'),
                    "location_name": location_name,
                    "success": True,
                    "result": result,
                    "today_jobs": today_stats.get('processed', 0),
                    "tomorrow_jobs": tomorrow_stats.get('processed', 0),
                    "total_created": summary.get('totalCreated', 0)
                }
                
        except Exception as e:
            logger.error(f"Error syncing location {location.get('name')}: {e}")
            return {
                "location_id": location.get('id'),
                "location_name": location.get('name'),
                "success": False,
                "error": str(e)
            }
    
    async def sync_all_locations(self) -> Dict[str, Any]:
        """Sync jobs for all locations with comprehensive 48-hour data"""
        logger.info("Starting comprehensive 48-hour sync for all locations")
        
        start_time = datetime.now()
        locations = await self.get_all_locations()
        
        if not locations:
            logger.warning("No active locations found")
            return {
                "success": False,
                "message": "No active locations found",
                "sync_time": start_time.isoformat()
            }
        
        logger.info(f"Found {len(locations)} active locations for sync")
        
        # Sync each location with comprehensive data
        sync_results = []
        for location in locations:
            result = await self.sync_location_jobs(location)
            sync_results.append(result)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Calculate summary
        successful_syncs = len([r for r in sync_results if r.get('success')])
        failed_syncs = len(sync_results) - successful_syncs
        
        summary = {
            "success": True,
            "total_locations": len(locations),
            "successful_syncs": successful_syncs,
            "failed_syncs": failed_syncs,
            "sync_duration_seconds": duration,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "results": sync_results
        }
        
        logger.info(f"Automated sync completed: {successful_syncs}/{len(locations)} locations synced successfully")
        return summary
    
    async def run_sync_cycle(self):
        """Run one sync cycle"""
        try:
            logger.info("Starting sync cycle...")
            result = await self.sync_all_locations()
            
            # Log the result
            if result.get('success'):
                logger.info(f"Sync cycle completed successfully: {result.get('successful_syncs')}/{result.get('total_locations')} locations")
            else:
                logger.error(f"Sync cycle failed: {result.get('message')}")
            
            self.last_sync = datetime.now()
            
        except Exception as e:
            logger.error(f"Error in sync cycle: {e}")
            self.last_sync = datetime.now()
    
    async def run_continuous_sync(self):
        """Run continuous sync every 2 hours"""
        logger.info("Starting continuous SmartMoving sync service (every 2 hours)")
        self.running = True
        
        # Run initial sync
        await self.run_sync_cycle()
        
        while self.running:
            try:
                # Wait for next sync cycle
                logger.info(f"Waiting {self.sync_interval} seconds until next sync...")
                await asyncio.sleep(self.sync_interval)
                
                if self.running:
                    await self.run_sync_cycle()
                    
            except asyncio.CancelledError:
                logger.info("Sync service cancelled")
                break
            except Exception as e:
                logger.error(f"Error in continuous sync: {e}")
                # Wait a bit before retrying
                await asyncio.sleep(300)  # 5 minutes
    
    def stop(self):
        """Stop the sync service"""
        logger.info("Stopping sync service...")
        self.running = False
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current sync service status"""
        return {
            "running": self.running,
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "sync_interval_seconds": self.sync_interval,
            "next_sync": (self.last_sync + timedelta(seconds=self.sync_interval)).isoformat() if self.last_sync else None
        }

# Global sync service instance
sync_service = None
sync_task = None

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}, shutting down...")
    if sync_service:
        sync_service.stop()
    sys.exit(0)

async def start_background_sync():
    """Start the background sync service"""
    global sync_service, sync_task
    
    try:
        logger.info("Starting background SmartMoving sync service...")
        sync_service = BackgroundSmartMovingSync()
        sync_task = asyncio.create_task(sync_service.run_continuous_sync())
        logger.info("Background sync service started successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to start background sync service: {e}")
        return False

async def stop_background_sync():
    """Stop the background sync service"""
    global sync_service, sync_task
    
    try:
        logger.info("Stopping background SmartMoving sync service...")
        if sync_service:
            sync_service.stop()
        if sync_task:
            sync_task.cancel()
            try:
                await sync_task
            except asyncio.CancelledError:
                pass
        logger.info("Background sync service stopped successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to stop background sync service: {e}")
        return False

async def main():
    """Main function to run the background sync service"""
    global sync_service
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        async with BackgroundSmartMovingSync() as sync_service:
            await sync_service.run_continuous_sync()
            
    except Exception as e:
        logger.error(f"Fatal error in background sync: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
