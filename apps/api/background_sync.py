"""
Background Sync Service
=======================

Runs company data synchronization every 12 hours in the background.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from apps.api.services.company_sync_service import CompanySyncService, run_company_syncs

logger = logging.getLogger(__name__)

class BackgroundSyncService:
    def __init__(self):
        self.is_running = False
        self.sync_task = None
    
    async def start(self):
        """Start the background sync service"""
        if self.is_running:
            logger.warning("Background sync service is already running")
            return
        
        logger.info("🚀 Starting background sync service...")
        self.is_running = True
        
        # Start the sync task
        self.sync_task = asyncio.create_task(self._run_sync_loop())
        
        logger.info("✅ Background sync service started successfully")
    
    async def stop(self):
        """Stop the background sync service"""
        if not self.is_running:
            logger.warning("Background sync service is not running")
            return
        
        logger.info("🛑 Stopping background sync service...")
        self.is_running = False
        
        if self.sync_task:
            self.sync_task.cancel()
            try:
                await self.sync_task
            except asyncio.CancelledError:
                pass
        
        logger.info("✅ Background sync service stopped successfully")
    
    async def _run_sync_loop(self):
        """Main sync loop that runs every 12 hours"""
        while self.is_running:
            try:
                logger.info("🔄 Starting scheduled company syncs...")
                
                # Run company syncs
                async with CompanySyncService() as sync_service:
                    await sync_service.run_scheduled_syncs()
                
                logger.info("✅ Scheduled company syncs completed")
                
                # Wait 12 hours before next sync
                logger.info("⏰ Waiting 12 hours until next sync...")
                await asyncio.sleep(12 * 60 * 60)  # 12 hours in seconds
                
            except asyncio.CancelledError:
                logger.info("🛑 Background sync service cancelled")
                break
            except Exception as e:
                logger.error(f"❌ Error in background sync loop: {str(e)}")
                # Wait 1 hour before retrying on error
                await asyncio.sleep(60 * 60)  # 1 hour in seconds

# Global instance
background_sync_service = BackgroundSyncService()

async def start_background_sync():
    """Start the background sync service (called from main.py)"""
    await background_sync_service.start()

async def stop_background_sync():
    """Stop the background sync service (called from main.py)"""
    await background_sync_service.stop()

# Manual sync trigger for testing
async def trigger_manual_sync():
    """Trigger a manual sync (for testing purposes)"""
    logger.info("🔄 Triggering manual company sync...")
    
    try:
        async with CompanySyncService() as sync_service:
            await sync_service.run_scheduled_syncs()
        
        logger.info("✅ Manual company sync completed successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Error in manual company sync: {str(e)}")
        return False

# Health check for background service
def get_sync_service_status():
    """Get the status of the background sync service"""
    return {
        "is_running": background_sync_service.is_running,
        "last_check": datetime.utcnow().isoformat(),
        "next_sync_in": "12 hours" if background_sync_service.is_running else "Service not running"
    }
