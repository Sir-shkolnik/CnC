#!/usr/bin/env python3
"""
Direct database setup script for LGM users
This script connects directly to the database to populate real LGM data
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
import sys

def get_db_connection():
    """Get database connection using environment variables"""
    try:
        # Try to get connection from environment variables
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "c_and_c_crm"),
            user=os.getenv("DB_USER", "c_and_c_user"),
            password=os.getenv("DB_PASSWORD", "c_and_c_password")
        )
        return conn
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        return None

def setup_lgm_data():
    """Setup LGM client, locations, and users"""
    conn = get_db_connection()
    if not conn:
        print("❌ Database connection failed")
        return False
    
    try:
        cursor = conn.cursor()
        
        # Insert LGM Client
        print("📝 Creating LGM Client...")
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt")
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Lets Get Moving', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO NOTHING;
        """)
        
        # Insert LGM Locations (Corporate and Franchise)
        print("🏢 Creating LGM Locations...")
        locations_data = [
            ('loc_lgm_burnaby_corporate_001', 'BURNABY', 'CORPORATE'),
            ('loc_lgm_downtown_toronto_corporate_002', 'DOWNTOWN TORONTO', 'CORPORATE'),
            ('loc_lgm_edmonton_corporate_003', 'EDMONTON', 'CORPORATE'),
            ('loc_lgm_hamilton_corporate_004', 'HAMILTON', 'CORPORATE'),
            ('loc_lgm_mississauga_corporate_005', 'MISSISSAUGA', 'CORPORATE'),
            ('loc_lgm_montreal_corporate_006', 'MONTREAL', 'CORPORATE'),
            ('loc_lgm_north_york_corporate_007', 'NORTH YORK', 'CORPORATE'),
            ('loc_lgm_vancouver_corporate_008', 'VANCOUVER', 'CORPORATE'),
            ('loc_lgm_abbotsford_franchise_009', 'ABBOTSFORD', 'FRANCHISE'),
            ('loc_lgm_ajax_franchise_010', 'AJAX', 'FRANCHISE'),
            ('loc_lgm_aurora_franchise_011', 'AURORA', 'FRANCHISE'),
            ('loc_lgm_brampton_franchise_012', 'BRAMPTON', 'FRANCHISE'),
            ('loc_lgm_brantford_franchise_013', 'BRANTFORD', 'FRANCHISE'),
            ('loc_lgm_burlington_franchise_014', 'BURLINGTON', 'FRANCHISE'),
            ('loc_lgm_calgary_franchise_015', 'CALGARY', 'FRANCHISE'),
            ('loc_lgm_coquitlam_franchise_016', 'COQUITLAM', 'FRANCHISE'),
            ('loc_lgm_fredericton_franchise_017', 'FREDERICTON', 'FRANCHISE'),
            ('loc_lgm_halifax_franchise_018', 'HALIFAX', 'FRANCHISE'),
            ('loc_lgm_kingston_franchise_019', 'KINGSTON', 'FRANCHISE'),
            ('loc_lgm_lethbridge_franchise_020', 'LETHBRIDGE', 'FRANCHISE'),
            ('loc_lgm_london_franchise_021', 'LONDON', 'FRANCHISE'),
            ('loc_lgm_ottawa_franchise_022', 'OTTAWA', 'FRANCHISE'),
            ('loc_lgm_regina_franchise_023', 'REGINA', 'FRANCHISE'),
            ('loc_lgm_richmond_franchise_024', 'RICHMOND', 'FRANCHISE'),
            ('loc_lgm_saint_john_franchise_025', 'SAINT JOHN', 'FRANCHISE'),
            ('loc_lgm_scarborough_franchise_026', 'SCARBOROUGH', 'FRANCHISE'),
            ('loc_lgm_surrey_franchise_027', 'SURREY', 'FRANCHISE'),
            ('loc_lgm_vaughan_franchise_028', 'VAUGHAN', 'FRANCHISE'),
            ('loc_lgm_victoria_franchise_029', 'VICTORIA', 'FRANCHISE'),
            ('loc_lgm_waterloo_franchise_030', 'WATERLOO', 'FRANCHISE'),
            ('loc_lgm_winnipeg_franchise_031', 'WINNIPEG', 'FRANCHISE'),
        ]
        
        for loc_id, loc_name, loc_type in locations_data:
            cursor.execute("""
                INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt")
                VALUES (%s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', %s, 'America/Toronto', %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING;
            """, (loc_id, loc_name, f"{loc_name} {loc_type} Office"))
        
        # Insert Real LGM Users (All Managers with password "1234")
        print("👥 Creating LGM Users...")
        users_data = [
            ('usr_shahbaz_burnaby', 'Shahbaz', 'shahbaz@lgm.com', 'MANAGER', 'loc_lgm_burnaby_corporate_001'),
            ('usr_arshdeep_downtown_toronto', 'Arshdeep', 'arshdeep@lgm.com', 'MANAGER', 'loc_lgm_downtown_toronto_corporate_002'),
            ('usr_danylo_edmonton', 'Danylo', 'danylo@lgm.com', 'MANAGER', 'loc_lgm_edmonton_corporate_003'),
            ('usr_hakam_hamilton', 'Hakam', 'hakam@lgm.com', 'MANAGER', 'loc_lgm_hamilton_corporate_004'),
            ('usr_arshdeep_mississauga', 'Arshdeep', 'arshdeep@lgm.com', 'MANAGER', 'loc_lgm_mississauga_corporate_005'),
            ('usr_bhanu_montreal', 'Bhanu', 'bhanu@lgm.com', 'MANAGER', 'loc_lgm_montreal_corporate_006'),
            ('usr_ankit_north_york', 'Ankit', 'ankit@lgm.com', 'MANAGER', 'loc_lgm_north_york_corporate_007'),
            ('usr_rasoul_vancouver', 'Rasoul', 'rasoul@lgm.com', 'MANAGER', 'loc_lgm_vancouver_corporate_008'),
            ('usr_anees_aps_abbotsford', 'Anees Aps', 'anees.aps@lgm.com', 'MANAGER', 'loc_lgm_abbotsford_franchise_009'),
            ('usr_andrew_ajax', 'Andrew', 'andrew@lgm.com', 'MANAGER', 'loc_lgm_ajax_franchise_010'),
            ('usr_parsa_aurora', 'Parsa', 'parsa@lgm.com', 'MANAGER', 'loc_lgm_aurora_franchise_011'),
            ('usr_aerish_brampton', 'Aerish', 'aerish@lgm.com', 'MANAGER', 'loc_lgm_brampton_franchise_012'),
            ('usr_akshit_brampton', 'Akshit', 'akshit@lgm.com', 'MANAGER', 'loc_lgm_brampton_franchise_012'),
            ('usr_harsh_brantford', 'Harsh', 'harsh@lgm.com', 'MANAGER', 'loc_lgm_brantford_franchise_013'),
            ('usr_simranjit_burlington', 'Simranjit', 'simranjit@lgm.com', 'MANAGER', 'loc_lgm_burlington_franchise_014'),
            ('usr_jasdeep_calgary', 'Jasdeep', 'jasdeep@lgm.com', 'MANAGER', 'loc_lgm_calgary_franchise_015'),
            ('usr_todd_coquitlam', 'Todd', 'todd@lgm.com', 'MANAGER', 'loc_lgm_coquitlam_franchise_016'),
            ('usr_kambiz_fredericton', 'Kambiz', 'kambiz@lgm.com', 'MANAGER', 'loc_lgm_fredericton_franchise_017'),
            ('usr_mahmoud_halifax', 'Mahmoud', 'mahmoud@lgm.com', 'MANAGER', 'loc_lgm_halifax_franchise_018'),
            ('usr_anirudh_kingston', 'Anirudh', 'anirudh@lgm.com', 'MANAGER', 'loc_lgm_kingston_franchise_019'),
            ('usr_promise_lethbridge', 'Promise', 'promise@lgm.com', 'MANAGER', 'loc_lgm_lethbridge_franchise_020'),
            ('usr_kyle_london', 'Kyle', 'kyle@lgm.com', 'MANAGER', 'loc_lgm_london_franchise_021'),
            ('usr_hanze_ottawa', 'Hanze', 'hanze@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_022'),
            ('usr_jay_ottawa', 'Jay', 'jay@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_022'),
            ('usr_ralph_regina', 'Ralph', 'ralph@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_023'),
            ('usr_isabella_regina', 'Isabella', 'isabella@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_023'),
            ('usr_rasoul_richmond', 'Rasoul', 'rasoul@lgm.com', 'MANAGER', 'loc_lgm_richmond_franchise_024'),
            ('usr_camellia_saint_john', 'Camellia', 'camellia@lgm.com', 'MANAGER', 'loc_lgm_saint_john_franchise_025'),
            ('usr_kelvin_scarborough', 'Kelvin', 'kelvin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_026'),
            ('usr_aswin_scarborough', 'Aswin', 'aswin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_026'),
            ('usr_danil_surrey', 'Danil', 'danil@lgm.com', 'MANAGER', 'loc_lgm_surrey_franchise_027'),
            ('usr_fahim_vaughan', 'Fahim', 'fahim@lgm.com', 'MANAGER', 'loc_lgm_vaughan_franchise_028'),
            ('usr_success_victoria', 'Success', 'success@lgm.com', 'MANAGER', 'loc_lgm_victoria_franchise_029'),
            ('usr_sadur_waterloo', 'Sadur', 'sadur@lgm.com', 'MANAGER', 'loc_lgm_waterloo_franchise_030'),
            ('usr_wayne_winnipeg', 'Wayne', 'wayne@lgm.com', 'MANAGER', 'loc_lgm_winnipeg_franchise_031'),
        ]
        
        for user_id, user_name, user_email, user_role, location_id in users_data:
            cursor.execute("""
                INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING;
            """, (user_id, user_name, user_email, user_role, location_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ LGM data setup completed successfully!")
        print(f"📊 Created {len(locations_data)} locations and {len(users_data)} users")
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 Starting LGM Database Setup...")
    success = setup_lgm_data()
    if success:
        print("🎉 Setup completed successfully!")
        sys.exit(0)
    else:
        print("💥 Setup failed!")
        sys.exit(1)
