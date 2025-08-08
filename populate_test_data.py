#!/usr/bin/env python3
"""
Manual Database Population Script
Populates the database with test journey data to get the dashboard working
"""

import psycopg2
import os
from datetime import datetime, timedelta
import uuid

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://c_and_c_user:c_and_c_password@localhost:5432/c_and_c_crm")

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL)

def create_test_journeys():
    """Create test journey data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # LGM Client ID
        lgm_client_id = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"
        
        # Get a location ID
        cursor.execute('SELECT id FROM "Location" WHERE "clientId" = %s LIMIT 1', (lgm_client_id,))
        location_result = cursor.fetchone()
        if not location_result:
            print("❌ No location found for LGM client")
            return False
        
        location_id = location_result[0]
        print(f"✅ Using location: {location_id}")
        
        # Create test journeys
        test_journeys = [
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249671-1 - Aayush sharma",
                "description": "Full service move from Toronto to Ottawa",
                "status": "ACTIVE",
                "startDate": datetime.now().date(),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "123 Main Street, Toronto, ON M5J2N1",
                "destinationAddress": "456 Oak Avenue, Ottawa, ON K1A0B1",
                "estimatedCost": 2500.00,
                "actualCost": 2500.00,
                "customerName": "Aayush sharma",
                "customerPhone": "+1-416-555-0123",
                "customerEmail": "aayush.sharma@example.com",
                "notes": "Customer prefers morning start, has a large piano to move. Branch: CALGARY 🇨🇦",
                "tags": "SmartMoving, CALGARY, Piano Move",
                "externalId": "249671-1",
                "externalData": '{"smartmovingJobNumber": "249671-1", "branchName": "CALGARY 🇨🇦 - Let\'s Get Moving"}'
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249672-1 - Abena Edugyan",
                "description": "Residential move from Vancouver to Burnaby",
                "status": "ACTIVE",
                "startDate": datetime.now().date(),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "789 West Broadway, Vancouver, BC V5Z1J1",
                "destinationAddress": "321 Kingsway, Burnaby, BC V5H1Z9",
                "estimatedCost": 1800.00,
                "actualCost": 1800.00,
                "customerName": "Abena Edugyan",
                "customerPhone": "+1-604-555-0456",
                "customerEmail": "abena.edugyan@example.com",
                "notes": "Standard residential move. Branch: VANCOUVER 🇨🇦",
                "tags": "SmartMoving, VANCOUVER, Residential",
                "externalId": "249672-1",
                "externalData": '{"smartmovingJobNumber": "249672-1", "branchName": "VANCOUVER 🇨🇦 - Corporate - Let\'s Get Moving"}'
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249673-1 - Akash N",
                "description": "Office relocation from Mississauga to Brampton",
                "status": "COMPLETED",
                "startDate": datetime.now().date() - timedelta(days=1),
                "endDate": datetime.now().date() - timedelta(days=1),
                "originAddress": "555 Hurontario Street, Mississauga, ON L5B2C9",
                "destinationAddress": "777 Queen Street, Brampton, ON L6T0G1",
                "estimatedCost": 3500.00,
                "actualCost": 3200.00,
                "customerName": "Akash N",
                "customerPhone": "+1-905-555-0789",
                "customerEmail": "akash.n@example.com",
                "notes": "Office equipment and furniture move. Branch: MISSISSAUGA 🇨🇦",
                "tags": "SmartMoving, MISSISSAUGA, Commercial",
                "externalId": "249673-1",
                "externalData": '{"smartmovingJobNumber": "249673-1", "branchName": "MISSISSAUGA 🇨🇦 - Corporate - Let\'s Get Moving"}'
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249674-1 - Maria Garcia",
                "description": "Apartment move from Edmonton to Calgary",
                "status": "ACTIVE",
                "startDate": datetime.now().date() + timedelta(days=1),
                "endDate": datetime.now().date() + timedelta(days=2),
                "originAddress": "123 Jasper Avenue, Edmonton, AB T5J0R2",
                "destinationAddress": "456 17th Avenue, Calgary, AB T2S0B1",
                "estimatedCost": 1200.00,
                "actualCost": 1200.00,
                "customerName": "Maria Garcia",
                "customerPhone": "+1-780-555-0123",
                "customerEmail": "maria.garcia@example.com",
                "notes": "One-bedroom apartment move. Branch: EDMONTON 🇨🇦",
                "tags": "SmartMoving, EDMONTON, Apartment",
                "externalId": "249674-1",
                "externalData": '{"smartmovingJobNumber": "249674-1", "branchName": "EDMONTON 🇨🇦 - Corporate - Let\'s Get Moving"}'
            },
            {
                "id": f"journey_{uuid.uuid4().hex[:8]}",
                "title": "SmartMoving Job #249675-1 - David Chen",
                "description": "Storage unit move from Hamilton to Toronto",
                "status": "ACTIVE",
                "startDate": datetime.now().date() + timedelta(days=1),
                "endDate": datetime.now().date() + timedelta(days=1),
                "originAddress": "888 Barton Street, Hamilton, ON L8L2Y4",
                "destinationAddress": "999 Queen Street, Toronto, ON M5T1Z5",
                "estimatedCost": 800.00,
                "actualCost": 800.00,
                "customerName": "David Chen",
                "customerPhone": "+1-905-555-0456",
                "customerEmail": "david.chen@example.com",
                "notes": "Storage unit contents move. Branch: HAMILTON 🇨🇦",
                "tags": "SmartMoving, HAMILTON, Storage",
                "externalId": "249675-1",
                "externalData": '{"smartmovingJobNumber": "249675-1", "branchName": "HAMILTON 🇨🇦 - Corporate - Let\'s Get Moving"}'
            }
        ]
        
        # Insert test journeys
        for journey in test_journeys:
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, title, description, status, "startDate", "endDate",
                    "originAddress", "destinationAddress", "estimatedCost", "actualCost",
                    "customerName", "customerPhone", "customerEmail", notes, tags,
                    "externalId", "externalData", "clientId", "locationId",
                    "createdAt", "updatedAt", "createdBy", "updatedBy"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                journey["id"], journey["title"], journey["description"], journey["status"],
                journey["startDate"], journey["endDate"], journey["originAddress"],
                journey["destinationAddress"], journey["estimatedCost"], journey["actualCost"],
                journey["customerName"], journey["customerPhone"], journey["customerEmail"],
                journey["notes"], journey["tags"], journey["externalId"], journey["externalData"],
                lgm_client_id, location_id, datetime.now(), datetime.now(),
                "usr_super_admin", "usr_super_admin"
            ))
            print(f"✅ Created journey: {journey['title']}")
        
        conn.commit()
        print(f"✅ Successfully created {len(test_journeys)} test journeys")
        return True
        
    except Exception as e:
        print(f"❌ Error creating test journeys: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def main():
    """Main function"""
    print("🚀 Starting test data population...")
    
    if create_test_journeys():
        print("✅ Test data population completed successfully!")
        print("\n📊 Expected Dashboard Results:")
        print("├── Total Journeys: 5")
        print("├── Active: 4 (today + tomorrow)")
        print("├── Completed: 1 (yesterday)")
        print("└── Revenue: $10,400")
        print("\n🎯 Next Steps:")
        print("1. Refresh the dashboard")
        print("2. Login with shahbaz@lgm.com / 1234")
        print("3. Check Recent Journeys section")
    else:
        print("❌ Test data population failed!")

if __name__ == "__main__":
    main() 