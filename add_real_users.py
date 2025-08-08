#!/usr/bin/env python3
"""
Add real LGM users to database
Simple script to add real users without password field issues
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

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

def add_real_users():
    """Add real LGM users to database"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Real LGM users data
        users_data = [
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
        
        # Insert users
        for user_id, user_name, user_email, user_role, location_id in users_data:
            cursor.execute("""
                INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "createdAt", "updatedAt") 
                VALUES (%s, %s, %s, %s, %s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING;
            """, (user_id, user_name, user_email, user_role, location_id))
        
        # Also ensure we have the basic locations
        locations_data = [
            ('loc_lgm_burnaby_corporate_001', 'BURNABY', 'BURNABY CORPORATE Office'),
            ('loc_lgm_downtown_toronto_corporate_001', 'DOWNTOWN TORONTO', 'DOWNTOWN TORONTO CORPORATE Office'),
            ('loc_lgm_edmonton_corporate_001', 'EDMONTON', 'EDMONTON CORPORATE Office'),
            ('loc_lgm_hamilton_corporate_001', 'HAMILTON', 'HAMILTON CORPORATE Office'),
            ('loc_lgm_montreal_corporate_001', 'MONTREAL', 'MONTREAL CORPORATE Office'),
            ('loc_lgm_north_york_corporate_001', 'NORTH YORK', 'NORTH YORK CORPORATE Office'),
            ('loc_lgm_vancouver_corporate_001', 'VANCOUVER', 'VANCOUVER CORPORATE Office'),
            ('loc_lgm_london_franchise_001', 'LONDON', 'LONDON FRANCHISE Office'),
        ]
        
        for location_id, location_name, address in locations_data:
            cursor.execute("""
                INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") 
                VALUES (%s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', %s, 'America/Toronto', %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING;
            """, (location_id, location_name, address))
        
        # Ensure we have the client
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Lets Get Moving', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO NOTHING;
        """)
        
        conn.commit()
        print(f"✅ Added {len(users_data)} real LGM users")
        print(f"✅ Added {len(locations_data)} locations")
        print("✅ Database setup completed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding users: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """Main function"""
    print("🚀 Adding real LGM users to database...")
    success = add_real_users()
    
    if success:
        print("✅ Real users added successfully!")
        print("🔑 You can now log in with:")
        print("   shahbaz@lgm.com (password: 1234)")
        print("   kyle@lgm.com (password: 1234)")
        print("   sarah.johnson@lgm.com (password: 1234)")
    else:
        print("❌ Failed to add real users")

if __name__ == "__main__":
    main()
