#!/usr/bin/env python3
"""
Add SmartMoving API Credentials to LGM Company Integration
==========================================================

This script adds SmartMoving API credentials to the LGM company integration
so that we can fetch real journey data from SmartMoving.
"""

import asyncio
import os
from prisma import Prisma

async def add_smartmoving_credentials():
    """Add SmartMoving API credentials to LGM company integration"""
    
    # Database connection
    prisma = Prisma()
    await prisma.connect()
    
    try:
        # Find LGM company integration
        lgm_company = await prisma.companyintegration.find_first(
            where={"name": "Lets Get Moving"}
        )
        
        if not lgm_company:
            print("❌ LGM company integration not found")
            return
        
        print(f"✅ Found LGM company: {lgm_company.name}")
        
        # SmartMoving API credentials (you'll need to get these from LGM)
        # For now, using placeholder values that need to be updated
        smartmoving_credentials = {
            "apiSource": "SmartMoving API",
            "apiBaseUrl": "https://api-public.smartmoving.com/v1",
            "apiKey": "YOUR_SMARTMOVING_API_KEY_HERE",  # This needs to be updated
            "syncFrequencyHours": 6,  # Sync every 6 hours for journey data
            "settings": {
                "enable_journey_sync": True,
                "sync_opportunities": True,
                "sync_jobs": True,
                "default_location_filter": True
            }
        }
        
        # Update the company integration
        updated_company = await prisma.companyintegration.update(
            where={"id": lgm_company.id},
            data=smartmoving_credentials
        )
        
        print(f"✅ Updated LGM company with SmartMoving credentials")
        print(f"   API Source: {updated_company.apiSource}")
        print(f"   API Base URL: {updated_company.apiBaseUrl}")
        print(f"   Sync Frequency: {updated_company.syncFrequencyHours} hours")
        print(f"   Settings: {updated_company.settings}")
        
        print("\n⚠️  IMPORTANT: You need to update the API key with the real SmartMoving API key!")
        print("   Current API Key: YOUR_SMARTMOVING_API_KEY_HERE")
        print("   Please update this in the database with the actual API key from LGM.")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    finally:
        await prisma.disconnect()

async def test_smartmoving_connection():
    """Test the SmartMoving API connection"""
    print("\n🔍 Testing SmartMoving API connection...")
    
    # This would test the actual API connection
    # For now, just show what we would do
    print("   This would test the API connection once credentials are added")
    print("   Would fetch opportunities and transform them to journeys")

if __name__ == "__main__":
    print("🚀 Adding SmartMoving API Credentials to LGM Company Integration")
    print("=" * 70)
    
    asyncio.run(add_smartmoving_credentials())
    asyncio.run(test_smartmoving_connection())
    
    print("\n✅ Script completed!")
    print("\n📋 Next Steps:")
    print("   1. Get the real SmartMoving API key from LGM")
    print("   2. Update the API key in the database")
    print("   3. Test the API connection")
    print("   4. Deploy the changes") 