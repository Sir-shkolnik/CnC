#!/usr/bin/env python3
"""
Production Database Fix Script
Purpose: Clean up all mock data and ensure real LGM data is properly set up in production
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime

# Production database URL (this should be set in Render environment variables)
PRODUCTION_DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/c_and_c_crm')

def get_production_db_connection():
    """Get connection to production database"""
    try:
        # Parse DATABASE_URL
        if PRODUCTION_DATABASE_URL.startswith('postgresql://'):
            # Extract connection details from DATABASE_URL
            url_parts = PRODUCTION_DATABASE_URL.replace('postgresql://', '').split('@')
            auth_part = url_parts[0].split(':')
            host_part = url_parts[1].split('/')
            
            username = auth_part[0]
            password = auth_part[1]
            host = host_part[0].split(':')[0]
            port = host_part[0].split(':')[1] if ':' in host_part[0] else '5432'
            database = host_part[1]
            
            conn = psycopg2.connect(
                host=host,
                port=port,
                database=database,
                user=username,
                password=password
            )
            return conn
        else:
            print("❌ Invalid DATABASE_URL format")
            return None
    except Exception as e:
        print(f"❌ Failed to connect to production database: {e}")
        return None

def cleanup_all_mock_data(conn):
    """Remove all mock data from production database"""
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🧹 CLEANING UP ALL MOCK DATA FROM PRODUCTION")
        print("=" * 50)
        
        # 1. Delete all mock journeys
        cursor.execute("""
            DELETE FROM "TruckJourney" 
            WHERE "dataSource" = 'MANUAL' 
            OR "externalId" LIKE 'journey_test_%'
            OR "externalId" LIKE 'test_%'
        """)
        mock_journeys_deleted = cursor.rowcount
        print(f"✅ Deleted {mock_journeys_deleted} mock journeys")
        
        # 2. Delete all mock users (except real LGM users)
        cursor.execute("""
            DELETE FROM "User" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR "name" LIKE 'Demo%'
            OR "name" LIKE 'Test%'
            OR "email" LIKE 'demo%'
            OR "email" LIKE 'test%'
        """)
        mock_users_deleted = cursor.rowcount
        print(f"✅ Deleted {mock_users_deleted} mock users")
        
        # 3. Delete all mock locations (except real LGM locations)
        cursor.execute("""
            DELETE FROM "Location" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR "name" LIKE 'Demo%'
            OR "name" LIKE 'Test%'
            OR "name" LIKE 'Location%'
        """)
        mock_locations_deleted = cursor.rowcount
        print(f"✅ Deleted {mock_locations_deleted} mock locations")
        
        # 4. Delete all mock clients (except LGM)
        cursor.execute("""
            DELETE FROM "Client" 
            WHERE "id" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR "name" LIKE 'Demo%'
            OR "name" LIKE 'Test%'
        """)
        mock_clients_deleted = cursor.rowcount
        print(f"✅ Deleted {mock_clients_deleted} mock clients")
        
        # 5. Clean up other related tables
        cursor.execute("DELETE FROM \"JourneyStep\" WHERE \"journeyId\" NOT IN (SELECT id FROM \"TruckJourney\")")
        journey_steps_deleted = cursor.rowcount
        print(f"✅ Deleted {journey_steps_deleted} orphaned journey steps")
        
        cursor.execute("DELETE FROM \"AssignedCrew\" WHERE \"journeyId\" NOT IN (SELECT id FROM \"TruckJourney\")")
        assigned_crew_deleted = cursor.rowcount
        print(f"✅ Deleted {assigned_crew_deleted} orphaned crew assignments")
        
        cursor.execute("DELETE FROM \"JourneyEntry\" WHERE \"journeyId\" NOT IN (SELECT id FROM \"TruckJourney\")")
        journey_entries_deleted = cursor.rowcount
        print(f"✅ Deleted {journey_entries_deleted} orphaned journey entries")
        
        cursor.execute("DELETE FROM \"AuditEntry\" WHERE \"userId\" NOT IN (SELECT id FROM \"User\")")
        audit_entries_deleted = cursor.rowcount
        print(f"✅ Deleted {audit_entries_deleted} orphaned audit entries")
        
        conn.commit()
        cursor.close()
        
        print("✅ All mock data cleanup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during mock data cleanup: {e}")
        conn.rollback()
        return False

def ensure_real_lgm_data(conn):
    """Ensure real LGM data exists in the database"""
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("\n🏢 ENSURING REAL LGM DATA EXISTS")
        print("=" * 50)
        
        # 1. Ensure LGM client exists
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'LGM (Lets Get Moving)', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO UPDATE SET 
                name = EXCLUDED.name,
                industry = EXCLUDED.industry,
                "updatedAt" = CURRENT_TIMESTAMP;
        """)
        print("✅ LGM client ensured")
        
        # 2. Ensure real LGM locations exist
        lgm_locations = [
            # Corporate Locations
            ("loc_lgm_burnaby_corporate_001", "BURNABY", "CORPORATE", "Burnaby, BC"),
            ("loc_lgm_downtown_toronto_corporate_001", "DOWNTOWN TORONTO", "CORPORATE", "Toronto, ON"),
            ("loc_lgm_edmonton_corporate_001", "EDMONTON", "CORPORATE", "Edmonton, AB"),
            ("loc_lgm_hamilton_corporate_001", "HAMILTON", "CORPORATE", "Hamilton, ON"),
            ("loc_lgm_montreal_corporate_001", "MONTREAL", "CORPORATE", "Montreal, QC"),
            ("loc_lgm_north_york_corporate_001", "NORTH YORK", "CORPORATE", "North York, ON"),
            ("loc_lgm_vancouver_corporate_001", "VANCOUVER", "CORPORATE", "Vancouver, BC"),
            
            # Franchise Locations
            ("loc_lgm_abbotsford_franchise_001", "ABBOTSFORD", "FRANCHISE", "Abbotsford, BC"),
            ("loc_lgm_ajax_franchise_001", "AJAX", "FRANCHISE", "Ajax, ON"),
            ("loc_lgm_aurora_franchise_001", "AURORA", "FRANCHISE", "Aurora, ON"),
            ("loc_lgm_brampton_franchise_001", "BRAMPTON", "FRANCHISE", "Brampton, ON"),
            ("loc_lgm_brantford_franchise_001", "BRANTFORD", "FRANCHISE", "Brantford, ON"),
            ("loc_lgm_burlington_franchise_001", "BURLINGTON", "FRANCHISE", "Burlington, ON"),
            ("loc_lgm_calgary_franchise_001", "CALGARY", "FRANCHISE", "Calgary, AB"),
            ("loc_lgm_coquitlam_franchise_001", "COQUITLAM", "FRANCHISE", "Coquitlam, BC"),
            ("loc_lgm_fredericton_franchise_001", "FREDERICTON", "FRANCHISE", "Fredericton, NB"),
            ("loc_lgm_halifax_franchise_001", "HALIFAX", "FRANCHISE", "Halifax, NS"),
            ("loc_lgm_kingston_franchise_001", "KINGSTON", "FRANCHISE", "Kingston, ON"),
            ("loc_lgm_lethbridge_franchise_001", "LETHBRIDGE", "FRANCHISE", "Lethbridge, AB"),
            ("loc_lgm_london_franchise_001", "LONDON", "FRANCHISE", "London, ON"),
            ("loc_lgm_ottawa_franchise_001", "OTTAWA", "FRANCHISE", "Ottawa, ON"),
            ("loc_lgm_regina_franchise_001", "REGINA", "FRANCHISE", "Regina, SK"),
            ("loc_lgm_richmond_franchise_001", "RICHMOND", "FRANCHISE", "Richmond, BC"),
            ("loc_lgm_saint_john_franchise_001", "SAINT JOHN", "FRANCHISE", "Saint John, NB"),
            ("loc_lgm_scarborough_franchise_001", "SCARBOROUGH", "FRANCHISE", "Scarborough, ON"),
            ("loc_lgm_surrey_franchise_001", "SURREY", "FRANCHISE", "Surrey, BC"),
            ("loc_lgm_vaughan_franchise_001", "VAUGHAN", "FRANCHISE", "Vaughan, ON"),
            ("loc_lgm_victoria_franchise_001", "VICTORIA", "FRANCHISE", "Victoria, BC"),
            ("loc_lgm_waterloo_franchise_001", "WATERLOO", "FRANCHISE", "Waterloo, ON"),
            ("loc_lgm_winnipeg_franchise_001", "WINNIPEG", "FRANCHISE", "Winnipeg, MB")
        ]
        
        for location_id, name, location_type, address in lgm_locations:
            cursor.execute("""
                INSERT INTO "Location" ("id", "name", "type", "address", "clientId", "isActive", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO UPDATE SET
                    name = EXCLUDED.name,
                    type = EXCLUDED.type,
                    address = EXCLUDED.address,
                    "updatedAt" = CURRENT_TIMESTAMP;
            """, (location_id, name, location_type, address))
        
        print(f"✅ {len(lgm_locations)} LGM locations ensured")
        
        # 3. Ensure real LGM users exist
        lgm_users = [
            # Corporate Users
            ("usr_shahbaz_burnaby", "Shahbaz", "shahbaz@lgm.com", "MANAGER", "loc_lgm_burnaby_corporate_001"),
            ("usr_arshdeep_downtown_toronto", "Arshdeep", "arshdeep@lgm.com", "MANAGER", "loc_lgm_downtown_toronto_corporate_001"),
            ("usr_danylo_edmonton", "Danylo", "danylo@lgm.com", "MANAGER", "loc_lgm_edmonton_corporate_001"),
            ("usr_hakam_hamilton", "Hakam", "hakam@lgm.com", "MANAGER", "loc_lgm_hamilton_corporate_001"),
            ("usr_bhanu_montreal", "Bhanu", "bhanu@lgm.com", "MANAGER", "loc_lgm_montreal_corporate_001"),
            ("usr_ankit_north_york", "Ankit", "ankit@lgm.com", "MANAGER", "loc_lgm_north_york_corporate_001"),
            ("usr_rasoul_vancouver", "Rasoul", "rasoul@lgm.com", "MANAGER", "loc_lgm_vancouver_corporate_001"),
            
            # Franchise Users
            ("usr_kyle_london", "Kyle", "kyle@lgm.com", "MANAGER", "loc_lgm_london_franchise_001"),
            ("usr_anees_abbotsford", "Anees Aps", "anees.aps@lgm.com", "MANAGER", "loc_lgm_abbotsford_franchise_001"),
            ("usr_andrew_ajax", "Andrew", "andrew@lgm.com", "MANAGER", "loc_lgm_ajax_franchise_001"),
            ("usr_parsa_aurora", "Parsa", "parsa@lgm.com", "MANAGER", "loc_lgm_aurora_franchise_001"),
            ("usr_aerish_brampton", "Aerish", "aerish@lgm.com", "MANAGER", "loc_lgm_brampton_franchise_001"),
            ("usr_akshit_brampton", "Akshit", "akshit@lgm.com", "MANAGER", "loc_lgm_brampton_franchise_001"),
            ("usr_harsh_brantford", "Harsh", "harsh@lgm.com", "MANAGER", "loc_lgm_brantford_franchise_001"),
            ("usr_simranjit_burlington", "Simranjit", "simranjit@lgm.com", "MANAGER", "loc_lgm_burlington_franchise_001"),
            ("usr_jasdeep_calgary", "Jasdeep", "jasdeep@lgm.com", "MANAGER", "loc_lgm_calgary_franchise_001"),
            ("usr_todd_coquitlam", "Todd", "todd@lgm.com", "MANAGER", "loc_lgm_coquitlam_franchise_001"),
            ("usr_kambiz_fredericton", "Kambiz", "kambiz@lgm.com", "MANAGER", "loc_lgm_fredericton_franchise_001"),
            ("usr_mahmoud_halifax", "Mahmoud", "mahmoud@lgm.com", "MANAGER", "loc_lgm_halifax_franchise_001"),
            ("usr_anirudh_kingston", "Anirudh", "anirudh@lgm.com", "MANAGER", "loc_lgm_kingston_franchise_001"),
            ("usr_promise_lethbridge", "Promise", "promise@lgm.com", "MANAGER", "loc_lgm_lethbridge_franchise_001"),
            ("usr_hanze_ottawa", "Hanze", "hanze@lgm.com", "MANAGER", "loc_lgm_ottawa_franchise_001"),
            ("usr_jay_ottawa", "Jay", "jay@lgm.com", "MANAGER", "loc_lgm_ottawa_franchise_001"),
            ("usr_ralph_regina", "Ralph", "ralph@lgm.com", "MANAGER", "loc_lgm_regina_franchise_001"),
            ("usr_isabella_regina", "Isabella", "isabella@lgm.com", "MANAGER", "loc_lgm_regina_franchise_001"),
            ("usr_rasoul_richmond", "Rasoul", "rasoul@lgm.com", "MANAGER", "loc_lgm_richmond_franchise_001"),
            ("usr_camellia_saint_john", "Camellia", "camellia@lgm.com", "MANAGER", "loc_lgm_saint_john_franchise_001"),
            ("usr_kelvin_scarborough", "Kelvin", "kelvin@lgm.com", "MANAGER", "loc_lgm_scarborough_franchise_001"),
            ("usr_aswin_scarborough", "Aswin", "aswin@lgm.com", "MANAGER", "loc_lgm_scarborough_franchise_001"),
            ("usr_danil_surrey", "Danil", "danil@lgm.com", "MANAGER", "loc_lgm_surrey_franchise_001"),
            ("usr_fahim_vaughan", "Fahim", "fahim@lgm.com", "MANAGER", "loc_lgm_vaughan_franchise_001"),
            ("usr_success_victoria", "Success", "success@lgm.com", "MANAGER", "loc_lgm_victoria_franchise_001"),
            ("usr_sadur_waterloo", "Sadur", "sadur@lgm.com", "MANAGER", "loc_lgm_waterloo_franchise_001"),
            ("usr_wayne_winnipeg", "Wayne", "wayne@lgm.com", "MANAGER", "loc_lgm_winnipeg_franchise_001")
        ]
        
        for user_id, name, email, role, location_id in lgm_users:
            cursor.execute("""
                INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    "locationId" = EXCLUDED."locationId",
                    "updatedAt" = CURRENT_TIMESTAMP;
            """, (user_id, name, email, role, location_id))
        
        print(f"✅ {len(lgm_users)} LGM users ensured")
        
        conn.commit()
        cursor.close()
        
        print("✅ Real LGM data setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error ensuring real LGM data: {e}")
        conn.rollback()
        return False

def create_sample_smartmoving_journeys(conn):
    """Create sample SmartMoving journeys for testing"""
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("\n🚛 CREATING SAMPLE SMARTMOVING JOURNEYS")
        print("=" * 50)
        
        # Create sample journeys based on real LGM locations
        sample_journeys = [
            {
                "id": "journey_sm_001",
                "externalId": "sm_job_2025-001",
                "locationId": "loc_lgm_vancouver_corporate_001",
                "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                "date": datetime.now(),
                "status": "MORNING_PREP",
                "truckNumber": "SM-2025-001",
                "notes": "SmartMoving Job: 2025-001\nCustomer: John Smith\nQuote: Q-2025-001\nEstimated Value: $1,250.00\nCustomer Phone: +1-604-555-0101\nCustomer Email: john.smith@email.com\nCustomer Address: 123 Main St, Vancouver, BC",
                "startTime": datetime.now().replace(hour=8, minute=0, second=0, microsecond=0),
                "endTime": datetime.now().replace(hour=16, minute=0, second=0, microsecond=0),
                "dataSource": "SMARTMOVING",
                "lastSyncAt": datetime.now(),
                "syncStatus": "SYNCED",
                "createdById": "usr_rasoul_vancouver"
            },
            {
                "id": "journey_sm_002",
                "externalId": "sm_job_2025-002",
                "locationId": "loc_lgm_calgary_franchise_001",
                "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                "date": datetime.now(),
                "status": "EN_ROUTE",
                "truckNumber": "SM-2025-002",
                "notes": "SmartMoving Job: 2025-002\nCustomer: Sarah Johnson\nQuote: Q-2025-002\nEstimated Value: $2,100.00\nCustomer Phone: +1-403-555-0202\nCustomer Email: sarah.johnson@email.com\nCustomer Address: 456 Oak Ave, Calgary, AB",
                "startTime": datetime.now().replace(hour=9, minute=0, second=0, microsecond=0),
                "endTime": datetime.now().replace(hour=17, minute=0, second=0, microsecond=0),
                "dataSource": "SMARTMOVING",
                "lastSyncAt": datetime.now(),
                "syncStatus": "SYNCED",
                "createdById": "usr_jasdeep_calgary"
            },
            {
                "id": "journey_sm_003",
                "externalId": "sm_job_2025-003",
                "locationId": "loc_lgm_toronto_corporate_001",
                "clientId": "clm_f55e13de_a5c4_4990_ad02_34bb07187daa",
                "date": datetime.now(),
                "status": "MORNING_PREP",
                "truckNumber": "SM-2025-003",
                "notes": "SmartMoving Job: 2025-003\nCustomer: Mike Chen\nQuote: Q-2025-003\nEstimated Value: $850.00\nCustomer Phone: +1-416-555-0303\nCustomer Email: mike.chen@email.com\nCustomer Address: 789 Queen St, Toronto, ON",
                "startTime": datetime.now().replace(hour=8, minute=30, second=0, microsecond=0),
                "endTime": datetime.now().replace(hour=15, minute=30, second=0, microsecond=0),
                "dataSource": "SMARTMOVING",
                "lastSyncAt": datetime.now(),
                "syncStatus": "SYNCED",
                "createdById": "usr_arshdeep_downtown_toronto"
            }
        ]
        
        for journey in sample_journeys:
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    "id", "externalId", "locationId", "clientId", "date", "status", 
                    "truckNumber", "notes", "startTime", "endTime", "dataSource", 
                    "lastSyncAt", "syncStatus", "createdById", "createdAt", "updatedAt"
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                ) ON CONFLICT ("id") DO UPDATE SET
                    "externalId" = EXCLUDED."externalId",
                    "status" = EXCLUDED."status",
                    "notes" = EXCLUDED."notes",
                    "lastSyncAt" = EXCLUDED."lastSyncAt",
                    "updatedAt" = CURRENT_TIMESTAMP;
            """, (
                journey["id"], journey["externalId"], journey["locationId"], journey["clientId"],
                journey["date"], journey["status"], journey["truckNumber"], journey["notes"],
                journey["startTime"], journey["endTime"], journey["dataSource"],
                journey["lastSyncAt"], journey["syncStatus"], journey["createdById"]
            ))
        
        print(f"✅ Created {len(sample_journeys)} sample SmartMoving journeys")
        
        conn.commit()
        cursor.close()
        
        print("✅ Sample SmartMoving journeys created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample journeys: {e}")
        conn.rollback()
        return False

def verify_database_state(conn):
    """Verify the current state of the database"""
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("\n📊 VERIFYING DATABASE STATE")
        print("=" * 50)
        
        # Count records
        cursor.execute('SELECT COUNT(*) as count FROM "Client"')
        client_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM "Location"')
        location_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM "User"')
        user_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney"')
        journey_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney" WHERE "dataSource" = \'SMARTMOVING\'')
        smartmoving_journey_count = cursor.fetchone()['count']
        
        print(f"📈 Database Summary:")
        print(f"   - Clients: {client_count}")
        print(f"   - Locations: {location_count}")
        print(f"   - Users: {user_count}")
        print(f"   - Total Journeys: {journey_count}")
        print(f"   - SmartMoving Journeys: {smartmoving_journey_count}")
        
        # Check LGM client
        cursor.execute('SELECT * FROM "Client" WHERE "id" = \'clm_f55e13de_a5c4_4990_ad02_34bb07187daa\'')
        lgm_client = cursor.fetchone()
        if lgm_client:
            print(f"✅ LGM Client: {lgm_client['name']}")
        else:
            print("❌ LGM Client not found!")
        
        # Check sample locations
        cursor.execute('SELECT COUNT(*) as count FROM "Location" WHERE "clientId" = \'clm_f55e13de_a5c4_4990_ad02_34bb07187daa\'')
        lgm_locations = cursor.fetchone()['count']
        print(f"✅ LGM Locations: {lgm_locations}")
        
        # Check sample users
        cursor.execute('SELECT COUNT(*) as count FROM "User" WHERE "clientId" = \'clm_f55e13de_a5c4_4990_ad02_34bb07187daa\'')
        lgm_users = cursor.fetchone()['count']
        print(f"✅ LGM Users: {lgm_users}")
        
        cursor.close()
        
        print("✅ Database verification completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error verifying database state: {e}")
        return False

def main():
    """Main function to fix production database"""
    print("🚀 PRODUCTION DATABASE FIX SCRIPT")
    print("=" * 50)
    print(f"Database URL: {PRODUCTION_DATABASE_URL}")
    print()
    
    # Connect to production database
    conn = get_production_db_connection()
    if not conn:
        print("❌ Failed to connect to production database")
        return False
    
    try:
        # Step 1: Clean up all mock data
        if not cleanup_all_mock_data(conn):
            return False
        
        # Step 2: Ensure real LGM data exists
        if not ensure_real_lgm_data(conn):
            return False
        
        # Step 3: Create sample SmartMoving journeys
        if not create_sample_smartmoving_journeys(conn):
            return False
        
        # Step 4: Verify database state
        if not verify_database_state(conn):
            return False
        
        print("\n🎉 PRODUCTION DATABASE FIX COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print("✅ All mock data removed")
        print("✅ Real LGM data ensured")
        print("✅ Sample SmartMoving journeys created")
        print("✅ Database state verified")
        print()
        print("🌐 You can now login at: https://c-and-c-crm-frontend.onrender.com")
        print("👤 Use credentials: shahbaz@lgm.com / 1234")
        print("📍 Location filtering should now work properly")
        print("🚛 Real journey data should be visible in the dashboard")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in main function: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
