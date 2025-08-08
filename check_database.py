#!/usr/bin/env python3
"""
Check C&C CRM Database
Purpose: Check what data is currently in our database
"""

import asyncio
import sys
import os
from datetime import datetime, timezone

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import Prisma
from prisma import Prisma

async def check_database():
    """Check what's in our database"""
    print("🔍 Checking C&C CRM Database")
    print(f"Time: {datetime.now(timezone.utc).isoformat()}Z")
    print("=" * 60)
    
    db = Prisma()
    
    try:
        await db.connect()
        print("✅ Connected to database")
        
        # Check clients
        clients = await db.client.find_many()
        print(f"\n📊 Clients: {len(clients)}")
        for client in clients:
            print(f"  - {client.name} (ID: {client.id})")
        
        # Check locations
        locations = await db.location.find_many()
        print(f"\n📍 Locations: {len(locations)}")
        for location in locations:
            print(f"  - {location.name} (ID: {location.id}, Client: {location.clientId})")
        
        # Check users
        users = await db.user.find_many()
        print(f"\n👥 Users: {len(users)}")
        for user in users[:5]:  # Show first 5
            print(f"  - {user.name} ({user.email}) - {user.role}")
        if len(users) > 5:
            print(f"  ... and {len(users) - 5} more users")
        
        # Check journeys
        journeys = await db.truckjourney.find_many()
        print(f"\n🚛 Journeys: {len(journeys)}")
        for journey in journeys[:5]:  # Show first 5
            print(f"  - {journey.externalId} - {journey.date} - {journey.status}")
        if len(journeys) > 5:
            print(f"  ... and {len(journeys) - 5} more journeys")
        
        # Check for SmartMoving data specifically
        smartmoving_journeys = await db.truckjourney.find_many(
            where={
                "externalId": {
                    "starts_with": "sm_"
                }
            }
        )
        print(f"\n🔄 SmartMoving Journeys: {len(smartmoving_journeys)}")
        for journey in smartmoving_journeys[:3]:  # Show first 3
            print(f"  - {journey.externalId} - {journey.date} - {journey.status}")
        if len(smartmoving_journeys) > 3:
            print(f"  ... and {len(smartmoving_journeys) - 3} more SmartMoving journeys")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False
        
    finally:
        await db.disconnect()
        print("\n✅ Disconnected from database")

async def main():
    """Main function"""
    success = await check_database()
    
    if success:
        print("\n✅ Database check completed successfully!")
    else:
        print("\n❌ Database check failed!")

if __name__ == "__main__":
    asyncio.run(main()) 