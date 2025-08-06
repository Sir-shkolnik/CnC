#!/usr/bin/env python3
"""
Test script to check Prisma mobile tables
"""

import asyncio
from prisma import Prisma

async def test_mobile_tables():
    """Test if Prisma can access mobile tables"""
    prisma = Prisma()
    
    try:
        await prisma.connect()
        print("✅ Connected to database")
        
        # Test MobileSession table
        print("Testing MobileSession table...")
        sessions = await prisma.mobilesession.find_many()
        print(f"✅ Found {len(sessions)} mobile sessions")
        
        # Test creating a mobile session
        print("Testing MobileSession creation...")
        session = await prisma.mobilesession.create(
            data={
                "userId": "test_user",
                "deviceId": "test_device",
                "locationId": "test_location",
                "syncStatus": "online"
            }
        )
        print(f"✅ Created mobile session: {session.id}")
        
        # Test MobileJourneyUpdate table
        print("Testing MobileJourneyUpdate table...")
        updates = await prisma.mobilejourneyupdate.find_many()
        print(f"✅ Found {len(updates)} mobile journey updates")
        
        # Test MobileMediaItem table
        print("Testing MobileMediaItem table...")
        media_items = await prisma.mobilemediaitem.find_many()
        print(f"✅ Found {len(media_items)} mobile media items")
        
        # Test MobileNotification table
        print("Testing MobileNotification table...")
        notifications = await prisma.mobilenotification.find_many()
        print(f"✅ Found {len(notifications)} mobile notifications")
        
        print("✅ All mobile tables are working correctly!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(test_mobile_tables()) 