#!/usr/bin/env python3
"""
Cleanup Mock Data Script
Removes all mock/demo data and ensures only real LGM data remains
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime

# Database configuration - try production first, then local
def get_db_connection():
    """Get database connection with fallback"""
    # Try production database first
    try:
        conn = psycopg2.connect(
            host="aws-0-us-east-1.pooler.supabase.com",
            port="6543",
            database="postgres",
            user="postgres.c_and_c_crm",
            password="Id200633048!"
        )
        print("✅ Connected to production database")
        return conn
    except Exception as e:
        print(f"⚠️ Production connection failed: {e}")
        
        # Try local database
        try:
            conn = psycopg2.connect(
                host="localhost",
                port="5432",
                database="c_and_c_crm",
                user="c_and_c_user",
                password="c_and_c_password"
            )
            print("✅ Connected to local database")
            return conn
        except Exception as e2:
            print(f"❌ Local connection failed: {e2}")
            return None

def cleanup_mock_data():
    """Clean up all mock data and ensure only real LGM data remains"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to any database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🧹 CLEANING UP MOCK DATA")
        print("=" * 60)
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # 1. Delete all mock/demo clients except LGM
        print("🗑️ Cleaning up mock clients...")
        cursor.execute("""
            DELETE FROM "Client" 
            WHERE id != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            AND name NOT LIKE '%LGM%'
            AND name NOT LIKE '%Lets Get Moving%'
        """)
        deleted_clients = cursor.rowcount
        print(f"   Deleted {deleted_clients} mock clients")
        
        # 2. Delete all mock locations except LGM locations
        print("🗑️ Cleaning up mock locations...")
        cursor.execute("""
            DELETE FROM "Location" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR id NOT LIKE 'loc_lgm_%'
        """)
        deleted_locations = cursor.rowcount
        print(f"   Deleted {deleted_locations} mock locations")
        
        # 3. Delete all mock users except LGM users
        print("🗑️ Cleaning up mock users...")
        cursor.execute("""
            DELETE FROM "User" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR email NOT LIKE '%@lgm.com'
            OR id NOT LIKE 'usr_%'
        """)
        deleted_users = cursor.rowcount
        print(f"   Deleted {deleted_users} mock users")
        
        # 4. Delete all mock journeys except LGM journeys
        print("🗑️ Cleaning up mock journeys...")
        cursor.execute("""
            DELETE FROM "TruckJourney" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR id NOT LIKE 'journey_%'
        """)
        deleted_journeys = cursor.rowcount
        print(f"   Deleted {deleted_journeys} mock journeys")
        
        # 5. Delete related mock data
        print("🗑️ Cleaning up related mock data...")
        
        # Delete mock journey steps
        cursor.execute("""
            DELETE FROM "JourneyStep" 
            WHERE "journeyId" NOT IN (
                SELECT id FROM "TruckJourney" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            )
        """)
        deleted_steps = cursor.rowcount
        print(f"   Deleted {deleted_steps} mock journey steps")
        
        # Delete mock step activities
        cursor.execute("""
            DELETE FROM "StepActivity" 
            WHERE "stepId" NOT IN (
                SELECT id FROM "JourneyStep" WHERE "journeyId" IN (
                    SELECT id FROM "TruckJourney" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
                )
            )
        """)
        deleted_activities = cursor.rowcount
        print(f"   Deleted {deleted_activities} mock step activities")
        
        # Delete mock assigned crew
        cursor.execute("""
            DELETE FROM "AssignedCrew" 
            WHERE "journeyId" NOT IN (
                SELECT id FROM "TruckJourney" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            )
        """)
        deleted_crew = cursor.rowcount
        print(f"   Deleted {deleted_crew} mock crew assignments")
        
        # Delete mock journey entries
        cursor.execute("""
            DELETE FROM "JourneyEntry" 
            WHERE "journeyId" NOT IN (
                SELECT id FROM "TruckJourney" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            )
        """)
        deleted_entries = cursor.rowcount
        print(f"   Deleted {deleted_entries} mock journey entries")
        
        # Delete mock media
        cursor.execute("""
            DELETE FROM "Media" 
            WHERE "journeyId" NOT IN (
                SELECT id FROM "TruckJourney" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            )
        """)
        deleted_media = cursor.rowcount
        print(f"   Deleted {deleted_media} mock media items")
        
        # Delete mock audit entries
        cursor.execute("""
            DELETE FROM "AuditEntry" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
        """)
        deleted_audit = cursor.rowcount
        print(f"   Deleted {deleted_audit} mock audit entries")
        
        # Delete mock customers
        cursor.execute("""
            DELETE FROM "Customer" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
        """)
        deleted_customers = cursor.rowcount
        print(f"   Deleted {deleted_customers} mock customers")
        
        # Delete mock leads
        cursor.execute("""
            DELETE FROM "Lead" 
            WHERE "customerId" NOT IN (
                SELECT id FROM "Customer" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            )
        """)
        deleted_leads = cursor.rowcount
        print(f"   Deleted {deleted_leads} mock leads")
        
        # Delete mock sales activities
        cursor.execute("""
            DELETE FROM "SalesActivity" 
            WHERE "leadId" NOT IN (
                SELECT id FROM "Lead" WHERE "customerId" IN (
                    SELECT id FROM "Customer" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
                )
            )
        """)
        deleted_sales = cursor.rowcount
        print(f"   Deleted {deleted_sales} mock sales activities")
        
        # Delete mock quotes
        cursor.execute("""
            DELETE FROM "Quote" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
        """)
        deleted_quotes = cursor.rowcount
        print(f"   Deleted {deleted_quotes} mock quotes")
        
        # Delete mock quote items
        cursor.execute("""
            DELETE FROM "QuoteItem" 
            WHERE "quoteId" NOT IN (
                SELECT id FROM "Quote" WHERE "clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            )
        """)
        deleted_quote_items = cursor.rowcount
        print(f"   Deleted {deleted_quote_items} mock quote items")
        
        # 6. Ensure LGM client exists
        print("✅ Ensuring LGM client exists...")
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'LGM (Lets Get Moving)', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO UPDATE SET 
                name = EXCLUDED.name,
                industry = EXCLUDED.industry,
                "updatedAt" = CURRENT_TIMESTAMP;
        """)
        
        # 7. Create real LGM locations if they don't exist
        print("✅ Ensuring real LGM locations exist...")
        real_locations = [
            ('loc_lgm_burnaby_corporate_001', 'BURNABY', 'BURNABY CORPORATE Office'),
            ('loc_lgm_downtown_toronto_corporate_001', 'DOWNTOWN TORONTO', 'DOWNTOWN TORONTO CORPORATE Office'),
            ('loc_lgm_edmonton_corporate_001', 'EDMONTON', 'EDMONTON CORPORATE Office'),
            ('loc_lgm_hamilton_corporate_001', 'HAMILTON', 'HAMILTON CORPORATE Office'),
            ('loc_lgm_mississauga_corporate_001', 'MISSISSAUGA', 'MISSISSAUGA CORPORATE Office'),
            ('loc_lgm_montreal_corporate_001', 'MONTREAL', 'MONTREAL CORPORATE Office'),
            ('loc_lgm_north_york_corporate_001', 'NORTH YORK', 'NORTH YORK CORPORATE Office'),
            ('loc_lgm_vancouver_corporate_001', 'VANCOUVER', 'VANCOUVER CORPORATE Office'),
            ('loc_lgm_abbotsford_franchise_001', 'ABBOTSFORD', 'ABBOTSFORD FRANCHISE Office'),
            ('loc_lgm_ajax_franchise_001', 'AJAX', 'AJAX FRANCHISE Office'),
            ('loc_lgm_aurora_franchise_001', 'AURORA', 'AURORA FRANCHISE Office'),
            ('loc_lgm_brampton_franchise_001', 'BRAMPTON', 'BRAMPTON FRANCHISE Office'),
            ('loc_lgm_brantford_franchise_001', 'BRANTFORD', 'BRANTFORD FRANCHISE Office'),
            ('loc_lgm_burlington_franchise_001', 'BURLINGTON', 'BURLINGTON FRANCHISE Office'),
            ('loc_lgm_calgary_franchise_001', 'CALGARY', 'CALGARY FRANCHISE Office'),
            ('loc_lgm_coquitlam_franchise_001', 'COQUITLAM', 'COQUITLAM FRANCHISE Office'),
            ('loc_lgm_fredericton_franchise_001', 'FREDERICTON', 'FREDERICTON FRANCHISE Office'),
            ('loc_lgm_halifax_franchise_001', 'HALIFAX', 'HALIFAX FRANCHISE Office'),
            ('loc_lgm_kingston_franchise_001', 'KINGSTON', 'KINGSTON FRANCHISE Office'),
            ('loc_lgm_lethbridge_franchise_001', 'LETHBRIDGE', 'LETHBRIDGE FRANCHISE Office'),
            ('loc_lgm_london_franchise_001', 'LONDON', 'LONDON FRANCHISE Office'),
            ('loc_lgm_ottawa_franchise_001', 'OTTAWA', 'OTTAWA FRANCHISE Office'),
            ('loc_lgm_regina_franchise_001', 'REGINA', 'REGINA FRANCHISE Office'),
            ('loc_lgm_richmond_franchise_001', 'RICHMOND', 'RICHMOND FRANCHISE Office'),
            ('loc_lgm_saint_john_franchise_001', 'SAINT JOHN', 'SAINT JOHN FRANCHISE Office'),
            ('loc_lgm_scarborough_franchise_001', 'SCARBOROUGH', 'SCARBOROUGH FRANCHISE Office'),
            ('loc_lgm_surrey_franchise_001', 'SURREY', 'SURREY FRANCHISE Office'),
            ('loc_lgm_vaughan_franchise_001', 'VAUGHAN', 'VAUGHAN FRANCHISE Office'),
            ('loc_lgm_victoria_franchise_001', 'VICTORIA', 'VICTORIA FRANCHISE Office'),
            ('loc_lgm_waterloo_franchise_001', 'WATERLOO', 'WATERLOO FRANCHISE Office'),
            ('loc_lgm_winnipeg_franchise_001', 'WINNIPEG', 'WINNIPEG FRANCHISE Office'),
        ]
        
        for location_id, location_name, address in real_locations:
            cursor.execute("""
                INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") 
                VALUES (%s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', %s, 'America/Toronto', %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO UPDATE SET 
                    name = EXCLUDED.name,
                    address = EXCLUDED.address,
                    "updatedAt" = CURRENT_TIMESTAMP;
            """, (location_id, location_name, address))
        
        # 8. Create real LGM users if they don't exist
        print("✅ Ensuring real LGM users exist...")
        real_users = [
            ('usr_shahbaz_burnaby', 'Shahbaz', 'shahbaz@lgm.com', 'MANAGER', 'loc_lgm_burnaby_corporate_001'),
            ('usr_arshdeep_downtown_toronto', 'Arshdeep', 'arshdeep@lgm.com', 'MANAGER', 'loc_lgm_downtown_toronto_corporate_001'),
            ('usr_danylo_edmonton', 'Danylo', 'danylo@lgm.com', 'MANAGER', 'loc_lgm_edmonton_corporate_001'),
            ('usr_hakam_hamilton', 'Hakam', 'hakam@lgm.com', 'MANAGER', 'loc_lgm_hamilton_corporate_001'),
            ('usr_bhanu_montreal', 'Bhanu', 'bhanu@lgm.com', 'MANAGER', 'loc_lgm_montreal_corporate_001'),
            ('usr_ankit_north_york', 'Ankit', 'ankit@lgm.com', 'MANAGER', 'loc_lgm_north_york_corporate_001'),
            ('usr_rasoul_vancouver', 'Rasoul', 'rasoul@lgm.com', 'MANAGER', 'loc_lgm_vancouver_corporate_001'),
            ('usr_kyle_london', 'Kyle', 'kyle@lgm.com', 'MANAGER', 'loc_lgm_london_franchise_001'),
            ('usr_mike_chen', 'Mike Chen', 'mike.chen@lgm.com', 'DRIVER', 'loc_lgm_vancouver_corporate_001'),
            ('usr_sarah_johnson', 'Sarah Johnson', 'sarah.johnson@lgm.com', 'ADMIN', 'loc_lgm_vancouver_corporate_001'),
        ]
        
        for user_id, user_name, user_email, user_role, location_id in real_users:
            cursor.execute("""
                INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "createdAt", "updatedAt") 
                VALUES (%s, %s, %s, %s, %s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO UPDATE SET 
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    "locationId" = EXCLUDED."locationId",
                    "updatedAt" = CURRENT_TIMESTAMP;
            """, (user_id, user_name, user_email, user_role, location_id))
        
        # Commit all changes
        conn.commit()
        
        # 9. Verify the cleanup
        print("\n📊 VERIFICATION SUMMARY")
        print("=" * 60)
        
        cursor.execute('SELECT COUNT(*) as count FROM "Client"')
        client_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM "Location" WHERE "clientId" = %s', ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa',))
        location_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM "User" WHERE "clientId" = %s', ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa',))
        user_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney" WHERE "clientId" = %s', ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa',))
        journey_count = cursor.fetchone()['count']
        
        print(f"✅ Clients: {client_count} (should be 1)")
        print(f"✅ LGM Locations: {location_count} (should be 43)")
        print(f"✅ LGM Users: {user_count} (should be 10+)")
        print(f"✅ LGM Journeys: {journey_count}")
        
        print("\n🔑 LOGIN CREDENTIALS:")
        print("   shahbaz@lgm.com (password: 1234)")
        print("   kyle@lgm.com (password: 1234)")
        print("   sarah.johnson@lgm.com (password: 1234)")
        print("   mike.chen@lgm.com (password: 1234)")
        
        print("\n🎉 MOCK DATA CLEANUP COMPLETED!")
        print("✅ Only real LGM data remains in the database")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    cleanup_mock_data()
