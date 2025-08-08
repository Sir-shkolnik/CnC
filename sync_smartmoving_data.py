#!/usr/bin/env python3
"""
Sync SmartMoving Data to C&C CRM Database
Purpose: Pull data from SmartMoving and sync it to our database
"""

import asyncio
import sys
import os
from datetime import datetime, timezone

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the SmartMoving sync service
from apps.api.services.smartmoving_sync_service import SmartMovingSyncService

async def sync_smartmoving_data():
    """Sync SmartMoving data to our database"""
    print("🚀 Starting SmartMoving Data Sync")
    print(f"Time: {datetime.now(timezone.utc).isoformat()}Z")
    print("=" * 60)
    
    try:
        async with SmartMovingSyncService() as sync_service:
            print("✅ Connected to SmartMoving sync service")
            
            # Sync today and tomorrow's jobs
            print("\n🔄 Syncing today and tomorrow's jobs...")
            result = await sync_service.sync_today_and_tomorrow_jobs()
            
            print("\n📊 Sync Results:")
            print(f"Today: {result.get('today', {})}")
            print(f"Tomorrow: {result.get('tomorrow', {})}")
            print(f"Summary: {result.get('summary', {})}")
            
            # Get sync status
            print("\n📈 Sync Status:")
            status = await sync_service.get_sync_status()
            print(f"Status: {status}")
            
            return result
            
    except Exception as e:
        print(f"❌ Error during sync: {e}")
        return None

async def main():
    """Main function"""
    result = await sync_smartmoving_data()
    
    if result:
        print("\n✅ SmartMoving sync completed successfully!")
        print("Check the database for synced journey data.")
    else:
        print("\n❌ SmartMoving sync failed!")

if __name__ == "__main__":
    asyncio.run(main()) 