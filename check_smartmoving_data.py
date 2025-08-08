#!/usr/bin/env python3
"""
Check SmartMoving Data in Database
"""

import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    try:
        # Check company integrations
        companies = await db.companyintegration.find_many()
        print(f"Found {len(companies)} company integrations:")
        for company in companies:
            print(f"- {company.name}: {company.apiSource}")
            print(f"  API Key: {company.apiKey[:8]}...")
            print(f"  Last Sync: {company.lastSyncAt}")
            print(f"  Status: {company.syncStatus}")
            print()
        
        # Check branches
        branches = await db.companybranch.find_many()
        print(f"Found {len(branches)} branches:")
        for branch in branches[:5]:  # Show first 5
            print(f"- {branch.name} ({branch.city}, {branch.provinceState})")
        
        # Check materials
        materials = await db.companymaterial.find_many()
        print(f"\nFound {len(materials)} materials")
        
        # Check service types
        service_types = await db.companyservicetype.find_many()
        print(f"Found {len(service_types)} service types")
        
        # Check move sizes
        move_sizes = await db.companymovesize.find_many()
        print(f"Found {len(move_sizes)} move sizes")
        
        # Check users
        users = await db.companyuser.find_many()
        print(f"Found {len(users)} users")
        
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
