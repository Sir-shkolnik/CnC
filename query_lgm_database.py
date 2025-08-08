#!/usr/bin/env python3
"""
LGM Database Query Script
Query all locations and sample jobs from today and tomorrow
"""

import asyncio
import os
from datetime import datetime, timedelta
from prisma import Prisma
import json

async def query_lgm_database():
    """Query LGM database for locations and jobs"""
    
    # Initialize Prisma client
    db = Prisma()
    await db.connect()
    
    print("=== LGM DATABASE QUERY RESULTS ===")
    print(f"Query Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        # 1. Get LGM Client
        print("1. LGM CLIENT:")
        lgm_client = await db.client.find_first(
            where={
                "name": {
                    "contains": "Lets Get Moving"
                }
            }
        )
        
        if lgm_client:
            print(f"   Client ID: {lgm_client.id}")
            print(f"   Name: {lgm_client.name}")
            print(f"   Industry: {lgm_client.industry}")
            print(f"   Created: {lgm_client.createdAt}")
            print()
        else:
            print("   ❌ LGM client not found")
            return
        
        # 2. Get All LGM Locations
        print("2. ALL LGM LOCATIONS:")
        locations = await db.location.find_many(
            where={
                "clientId": lgm_client.id
            },
            order={
                "name": "asc"
            }
        )
        
        if locations:
            print(f"   Found {len(locations)} locations:")
            for i, location in enumerate(locations, 1):
                print(f"   {i}. {location.name}")
                print(f"      ID: {location.id}")
                print(f"      Address: {location.address}")
                print(f"      Type: {location.locationType}")
                print(f"      Created: {location.createdAt}")
                print()
        else:
            print("   ❌ No locations found")
            return
        
        # 3. Get Today's Jobs
        today = datetime.now().date()
        print(f"3. TODAY'S JOBS ({today}):")
        
        today_jobs = await db.truckjourney.find_many(
            where={
                "date": {
                    "gte": today,
                    "lt": today + timedelta(days=1)
                },
                "clientId": lgm_client.id
            },
            include={
                "location": True,
                "client": True,
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                }
            },
            order={
                "date": "asc"
            },
            take=5  # Limit to 5 jobs for display
        )
        
        if today_jobs:
            print(f"   Found {len(today_jobs)} jobs today:")
            for i, job in enumerate(today_jobs, 1):
                print(f"   {i}. Job #{job.id}")
                print(f"      Date: {job.date}")
                print(f"      Status: {job.status}")
                print(f"      Truck: {job.truckNumber}")
                print(f"      Location: {job.location.name if job.location else 'N/A'}")
                print(f"      Notes: {job.notes[:100]}..." if job.notes and len(job.notes) > 100 else f"      Notes: {job.notes}")
                print(f"      Priority: {job.priority}")
                print(f"      Estimated Cost: ${job.estimatedCost}" if job.estimatedCost else "      Estimated Cost: N/A")
                print(f"      Start Time: {job.startTime}" if job.startTime else "      Start Time: N/A")
                print(f"      Duration: {job.estimatedDuration} minutes" if job.estimatedDuration else "      Duration: N/A")
                print()
        else:
            print("   ❌ No jobs found for today")
        
        # 4. Get Tomorrow's Jobs
        tomorrow = today + timedelta(days=1)
        print(f"4. TOMORROW'S JOBS ({tomorrow}):")
        
        tomorrow_jobs = await db.truckjourney.find_many(
            where={
                "date": {
                    "gte": tomorrow,
                    "lt": tomorrow + timedelta(days=1)
                },
                "clientId": lgm_client.id
            },
            include={
                "location": True,
                "client": True,
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                }
            },
            order={
                "date": "asc"
            },
            take=5  # Limit to 5 jobs for display
        )
        
        if tomorrow_jobs:
            print(f"   Found {len(tomorrow_jobs)} jobs tomorrow:")
            for i, job in enumerate(tomorrow_jobs, 1):
                print(f"   {i}. Job #{job.id}")
                print(f"      Date: {job.date}")
                print(f"      Status: {job.status}")
                print(f"      Truck: {job.truckNumber}")
                print(f"      Location: {job.location.name if job.location else 'N/A'}")
                print(f"      Notes: {job.notes[:100]}..." if job.notes and len(job.notes) > 100 else f"      Notes: {job.notes}")
                print(f"      Priority: {job.priority}")
                print(f"      Estimated Cost: ${job.estimatedCost}" if job.estimatedCost else "      Estimated Cost: N/A")
                print(f"      Start Time: {job.startTime}" if job.startTime else "      Start Time: N/A")
                print(f"      Duration: {job.estimatedDuration} minutes" if job.estimatedDuration else "      Duration: N/A")
                print()
        else:
            print("   ❌ No jobs found for tomorrow")
        
        # 5. Get Job Statistics
        print("5. JOB STATISTICS:")
        
        # Total jobs count
        total_jobs = await db.truckjourney.count(
            where={
                "clientId": lgm_client.id
            }
        )
        
        # Jobs by status
        status_counts = await db.truckjourney.group_by(
            by=["status"],
            where={
                "clientId": lgm_client.id
            },
            _count={
                "id": True
            }
        )
        
        print(f"   Total Jobs: {total_jobs}")
        print("   Jobs by Status:")
        for status_count in status_counts:
            print(f"      {status_count.status}: {status_count._count.id}")
        
        # Jobs by location
        location_counts = await db.truckjourney.group_by(
            by=["locationId"],
            where={
                "clientId": lgm_client.id
            },
            _count={
                "id": True
            }
        )
        
        print("   Jobs by Location:")
        for loc_count in location_counts:
            if loc_count.locationId:
                location = await db.location.find_unique(where={"id": loc_count.locationId})
                location_name = location.name if location else "Unknown"
                print(f"      {location_name}: {loc_count._count.id}")
        
        print()
        
        # 6. Get Sample Job with Full Details
        print("6. SAMPLE JOB WITH FULL DETAILS:")
        
        sample_job = await db.truckjourney.find_first(
            where={
                "clientId": lgm_client.id
            },
            include={
                "location": True,
                "client": True,
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                }
            }
        )
        
        if sample_job:
            print(f"   Job ID: {sample_job.id}")
            print(f"   Date: {sample_job.date}")
            print(f"   Status: {sample_job.status}")
            print(f"   Truck Number: {sample_job.truckNumber}")
            print(f"   Notes: {sample_job.notes}")
            print(f"   Priority: {sample_job.priority}")
            print(f"   Estimated Cost: ${sample_job.estimatedCost}" if sample_job.estimatedCost else "   Estimated Cost: N/A")
            print(f"   Start Time: {sample_job.startTime}" if sample_job.startTime else "   Start Time: N/A")
            print(f"   End Time: {sample_job.endTime}" if sample_job.endTime else "   End Time: N/A")
            print(f"   Estimated Duration: {sample_job.estimatedDuration} minutes" if sample_job.estimatedDuration else "   Estimated Duration: N/A")
            print(f"   Start Location: {sample_job.startLocation}" if sample_job.startLocation else "   Start Location: N/A")
            print(f"   End Location: {sample_job.endLocation}" if sample_job.endLocation else "   End Location: N/A")
            print(f"   Tags: {sample_job.tags}" if sample_job.tags else "   Tags: N/A")
            print(f"   Billing Status: {sample_job.billingStatus}" if sample_job.billingStatus else "   Billing Status: N/A")
            print(f"   Created At: {sample_job.createdAt}")
            print(f"   Updated At: {sample_job.updatedAt}")
            
            if sample_job.location:
                print(f"   Location: {sample_job.location.name}")
                print(f"   Location Address: {sample_job.location.address}")
                print(f"   Location Type: {sample_job.location.locationType}")
            
            if sample_job.client:
                print(f"   Client: {sample_job.client.name}")
                print(f"   Client Industry: {sample_job.client.industry}")
            
            if sample_job.assignedCrew:
                print(f"   Assigned Crew: {len(sample_job.assignedCrew)} members")
                for crew in sample_job.assignedCrew:
                    if crew.user:
                        print(f"      - {crew.user.firstName} {crew.user.lastName} ({crew.user.email})")
        else:
            print("   ❌ No sample job found")
        
        print()
        print("=== QUERY COMPLETE ===")
        
    except Exception as e:
        print(f"❌ Error querying database: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(query_lgm_database()) 