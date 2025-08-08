#!/usr/bin/env python3
"""
Create test journey data for C&C CRM
This script populates the database with sample journey data for testing
"""

import os
import sys
import psycopg2
from datetime import datetime, timedelta
from psycopg2.extras import RealDictCursor
import json

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://c_and_c_user:c_and_c_password@localhost:5432/c_and_c_crm")

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def create_test_journeys():
    """Create test journey data"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if TruckJourney table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'TruckJourney'
            );
        """)
        
        if not cursor.fetchone()['exists']:
            print("❌ TruckJourney table does not exist. Creating it...")
            
            # Create TruckJourney table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS "TruckJourney" (
                    id VARCHAR(255) PRIMARY KEY,
                    "locationId" VARCHAR(255) NOT NULL,
                    "clientId" VARCHAR(255) NOT NULL,
                    date TIMESTAMP NOT NULL,
                    status VARCHAR(50) DEFAULT 'MORNING_PREP',
                    "truckNumber" VARCHAR(50),
                    "moveSourceId" VARCHAR(255),
                    "startTime" TIMESTAMP,
                    "endTime" TIMESTAMP,
                    notes TEXT,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "createdBy" VARCHAR(255),
                    "updatedBy" VARCHAR(255)
                );
            """)
            
            # Create indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_truck_journey_client_location 
                ON "TruckJourney" ("clientId", "locationId");
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_truck_journey_status 
                ON "TruckJourney" (status);
            """)
            
            print("✅ TruckJourney table created")
        
        # Check if we already have test data
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney"')
        count = cursor.fetchone()['count']
        
        if count > 0:
            print(f"✅ Database already has {count} journeys")
            return True
        
        # Create test journeys
        test_journeys = [
            {
                "id": "journey_test_001",
                "locationId": "loc_lgm_vancouver_corporate_001",
                "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                "date": datetime.now().date(),
                "status": "MORNING_PREP",
                "truckNumber": "T-001",
                "moveSourceId": "move_001",
                "startTime": datetime.now().replace(hour=8, minute=0, second=0, microsecond=0),
                "endTime": datetime.now().replace(hour=16, minute=0, second=0, microsecond=0),
                "notes": "Residential move - 3 bedroom house in Vancouver",
                "createdBy": "usr_kyle_temp",
                "updatedBy": "usr_kyle_temp"
            },
            {
                "id": "journey_test_002",
                "locationId": "loc_lgm_vancouver_corporate_001",
                "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                "date": datetime.now().date(),
                "status": "EN_ROUTE",
                "truckNumber": "T-002",
                "moveSourceId": "move_002",
                "startTime": datetime.now().replace(hour=7, minute=30, second=0, microsecond=0),
                "endTime": datetime.now().replace(hour=15, minute=30, second=0, microsecond=0),
                "notes": "Office relocation - downtown Vancouver",
                "createdBy": "usr_kyle_temp",
                "updatedBy": "usr_kyle_temp"
            },
            {
                "id": "journey_test_003",
                "locationId": "loc_lgm_vancouver_corporate_001",
                "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                "date": (datetime.now() + timedelta(days=1)).date(),
                "status": "ONSITE",
                "truckNumber": "T-003",
                "moveSourceId": "move_003",
                "startTime": datetime.now().replace(hour=9, minute=0, second=0, microsecond=0),
                "endTime": datetime.now().replace(hour=17, minute=0, second=0, microsecond=0),
                "notes": "Warehouse inventory transfer",
                "createdBy": "usr_kyle_temp",
                "updatedBy": "usr_kyle_temp"
            },
            {
                "id": "journey_test_004",
                "locationId": "loc_lgm_vancouver_corporate_001",
                "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                "date": (datetime.now() - timedelta(days=1)).date(),
                "status": "COMPLETED",
                "truckNumber": "T-001",
                "moveSourceId": "move_004",
                "startTime": datetime.now().replace(hour=8, minute=0, second=0, microsecond=0),
                "endTime": datetime.now().replace(hour=16, minute=0, second=0, microsecond=0),
                "notes": "Completed: Family move - 4 bedroom house",
                "createdBy": "usr_kyle_temp",
                "updatedBy": "usr_kyle_temp"
            }
        ]
        
        # Insert test journeys
        for journey in test_journeys:
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, "locationId", "clientId", date, status, "truckNumber", 
                    "moveSourceId", "startTime", "endTime", notes, "createdBy", "updatedBy"
                ) VALUES (
                    %(id)s, %(locationId)s, %(clientId)s, %(date)s, %(status)s, %(truckNumber)s,
                    %(moveSourceId)s, %(startTime)s, %(endTime)s, %(notes)s, %(createdBy)s, %(updatedBy)s
                )
            """, journey)
        
        conn.commit()
        print(f"✅ Created {len(test_journeys)} test journeys")
        
        # Verify the data
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney"')
        count = cursor.fetchone()['count']
        print(f"✅ Database now has {count} total journeys")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating test journeys: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """Main function"""
    print("🚀 Creating test journey data for C&C CRM...")
    
    success = create_test_journeys()
    
    if success:
        print("✅ Test journey data created successfully!")
        print("🎯 You can now log in and see real journey data instead of fake data")
    else:
        print("❌ Failed to create test journey data")
        sys.exit(1)

if __name__ == "__main__":
    main()
