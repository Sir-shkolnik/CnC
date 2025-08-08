#!/usr/bin/env python3
"""
Test Real Data for Let's Get Moving
Create real users and journey data, then test API endpoints
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import json
from datetime import datetime, timedelta

# API URL
API_URL = "https://c-and-c-crm-api.onrender.com"

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL", "postgresql://c_and_c_user:c_and_c_password@localhost:5432/c_and_c_crm"))
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def create_real_users():
    """Create real LGM users in database"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Real LGM users data
        users_data = [
            ('usr_shahbaz_temp', 'Shahbaz', 'shahbaz@lgm.com', 'MANAGER', 'loc_lgm_vancouver_corporate_001'),
            ('usr_ankit_north_york', 'Ankit', 'ankit@lgm.com', 'MANAGER', 'loc_lgm_north_york_corporate_001'),
            ('usr_kyle_london', 'Kyle', 'kyle@lgm.com', 'MANAGER', 'loc_lgm_london_franchise_001'),
        ]
        
        # Insert users
        for user_id, user_name, user_email, user_role, location_id in users_data:
            cursor.execute("""
                INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "createdAt", "updatedAt") 
                VALUES (%s, %s, %s, %s, %s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO UPDATE SET
                    "name" = EXCLUDED."name",
                    "email" = EXCLUDED."email",
                    "role" = EXCLUDED."role",
                    "locationId" = EXCLUDED."locationId",
                    "status" = 'ACTIVE',
                    "updatedAt" = CURRENT_TIMESTAMP;
            """, (user_id, user_name, user_email, user_role, location_id))
        
        # Also ensure we have the basic locations
        locations_data = [
            ('loc_lgm_vancouver_corporate_001', 'VANCOUVER', 'VANCOUVER CORPORATE Office'),
            ('loc_lgm_north_york_corporate_001', 'NORTH YORK', 'NORTH YORK CORPORATE Office'),
            ('loc_lgm_london_franchise_001', 'LONDON', 'LONDON FRANCHISE Office'),
        ]
        
        for location_id, location_name, address in locations_data:
            cursor.execute("""
                INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") 
                VALUES (%s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', %s, 'America/Toronto', %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO UPDATE SET
                    "name" = EXCLUDED."name",
                    "address" = EXCLUDED."address",
                    "updatedAt" = CURRENT_TIMESTAMP;
            """, (location_id, location_name, address))
        
        # Ensure we have the client
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Lets Get Moving', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO UPDATE SET
                "name" = EXCLUDED."name",
                "updatedAt" = CURRENT_TIMESTAMP;
        """)
        
        conn.commit()
        print(f"✅ Created/Updated {len(users_data)} real LGM users")
        print(f"✅ Created/Updated {len(locations_data)} locations")
        print("✅ Database setup completed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def create_real_journeys():
    """Create real journey data"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if we have any journeys
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney"')
        journey_count = cursor.fetchone()['count']
        
        if journey_count == 0:
            # Create real journey data for Let's Get Moving
            real_journeys = [
                {
                    "id": "journey_real_001",
                    "locationId": "loc_lgm_vancouver_corporate_001",
                    "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                    "date": datetime.now().date(),
                    "status": "MORNING_PREP",
                    "truckNumber": "T-001",
                    "moveSourceId": "move_001",
                    "startTime": datetime.now().replace(hour=8, minute=0, second=0, microsecond=0),
                    "endTime": datetime.now().replace(hour=16, minute=0, second=0, microsecond=0),
                    "notes": "Residential move - 3 bedroom house in Vancouver",
                    "createdBy": "usr_shahbaz_temp",
                    "createdAt": datetime.now(),
                    "updatedAt": datetime.now()
                },
                {
                    "id": "journey_real_002",
                    "locationId": "loc_lgm_vancouver_corporate_001",
                    "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                    "date": datetime.now().date(),
                    "status": "EN_ROUTE",
                    "truckNumber": "T-002",
                    "moveSourceId": "move_002",
                    "startTime": datetime.now().replace(hour=7, minute=30, second=0, microsecond=0),
                    "endTime": datetime.now().replace(hour=15, minute=30, second=0, microsecond=0),
                    "notes": "Office relocation - downtown Vancouver",
                    "createdBy": "usr_shahbaz_temp",
                    "createdAt": datetime.now(),
                    "updatedAt": datetime.now()
                },
                {
                    "id": "journey_real_003",
                    "locationId": "loc_lgm_vancouver_corporate_001",
                    "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                    "date": (datetime.now() + timedelta(days=1)).date(),
                    "status": "ONSITE",
                    "truckNumber": "T-003",
                    "moveSourceId": "move_003",
                    "startTime": datetime.now().replace(hour=9, minute=0, second=0, microsecond=0),
                    "endTime": datetime.now().replace(hour=17, minute=0, second=0, microsecond=0),
                    "notes": "Warehouse inventory transfer",
                    "createdBy": "usr_shahbaz_temp",
                    "createdAt": datetime.now(),
                    "updatedAt": datetime.now()
                }
            ]
            
            # Insert real journeys into database
            for journey in real_journeys:
                cursor.execute("""
                    INSERT INTO "TruckJourney" (
                        id, "locationId", "clientId", date, status, "truckNumber", 
                        "moveSourceId", "startTime", "endTime", notes, "createdBy", "createdAt", "updatedAt"
                    ) VALUES (
                        %(id)s, %(locationId)s, %(clientId)s, %(date)s, %(status)s, %(truckNumber)s,
                        %(moveSourceId)s, %(startTime)s, %(endTime)s, %(notes)s, %(createdBy)s, %(createdAt)s, %(updatedAt)s
                    )
                """, journey)
            
            conn.commit()
            print(f"✅ Created {len(real_journeys)} real journeys in database")
        else:
            print(f"✅ Found {journey_count} existing journeys")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating journeys: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def test_api_endpoints():
    """Test API endpoints with real data"""
    print("\n🔍 Testing API Endpoints...")
    
    # Test login
    print("1. Testing login...")
    login_response = requests.post(f"{API_URL}/auth/login", 
        json={"email": "shahbaz@lgm.com", "password": "1234"})
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        if login_data.get('success'):
            token = login_data['access_token']
            user_id = login_data['user']['id']
            print(f"✅ Login successful - User ID: {user_id}")
            
            # Test journey API
            print("2. Testing journey API...")
            headers = {"Authorization": f"Bearer {token}"}
            journey_response = requests.get(f"{API_URL}/journey/active", headers=headers)
            
            if journey_response.status_code == 200:
                journey_data = journey_response.json()
                if journey_data.get('success'):
                    journeys = journey_data.get('data', [])
                    print(f"✅ Journey API successful - Found {len(journeys)} journeys")
                    for journey in journeys[:3]:  # Show first 3
                        print(f"   - {journey.get('truckNumber', 'N/A')}: {journey.get('status', 'N/A')} - {journey.get('notes', 'N/A')}")
                else:
                    print(f"❌ Journey API failed: {journey_data.get('message', 'Unknown error')}")
            else:
                print(f"❌ Journey API HTTP error: {journey_response.status_code}")
                print(f"   Response: {journey_response.text}")
        else:
            print(f"❌ Login failed: {login_data.get('message', 'Unknown error')}")
    else:
        print(f"❌ Login HTTP error: {login_response.status_code}")
        print(f"   Response: {login_response.text}")

def main():
    """Main function"""
    print("🚀 Testing Real Data for Let's Get Moving")
    print("=" * 50)
    
    # Step 1: Create real users
    print("\n1. Creating real users...")
    if create_real_users():
        print("✅ Users created successfully")
    else:
        print("❌ Failed to create users")
        return
    
    # Step 2: Create real journeys
    print("\n2. Creating real journeys...")
    if create_real_journeys():
        print("✅ Journeys created successfully")
    else:
        print("❌ Failed to create journeys")
        return
    
    # Step 3: Test API endpoints
    print("\n3. Testing API endpoints...")
    test_api_endpoints()
    
    print("\n🎉 Real data test completed!")
    print("🔑 You can now log in with:")
    print("   shahbaz@lgm.com (password: 1234)")
    print("   ankit@lgm.com (password: 1234)")
    print("   kyle@lgm.com (password: 1234)")

if __name__ == "__main__":
    main()
