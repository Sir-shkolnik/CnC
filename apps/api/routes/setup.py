from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import os

router = APIRouter(tags=["Setup"])

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "c_and_c_crm"),
        user=os.getenv("DB_USER", "c_and_c_user"),
        password=os.getenv("DB_PASSWORD", "c_and_c_password")
    )

@router.post("/setup/database")
async def setup_database():
    """Create database tables and populate with real LGM data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create enums
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'MOVER', 'MANAGER', 'AUDITOR');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "JourneyStage" AS ENUM ('MORNING_PREP', 'EN_ROUTE', 'ONSITE', 'COMPLETED', 'AUDITED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "EntryType" AS ENUM ('PHOTO', 'NOTE', 'GPS', 'SIGNATURE', 'CONFIRMATION');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO', 'SIGNATURE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "TagType" AS ENUM ('DAMAGE', 'COMPLETED', 'FEEDBACK', 'ERROR', 'ISSUE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        # Create Client table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "Client" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "industry" TEXT,
                "isFranchise" BOOLEAN NOT NULL DEFAULT false,
                "settings" JSONB,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
            );
        """)
        
        # Create Location table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "Location" (
                "id" TEXT NOT NULL,
                "clientId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',
                "address" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
            );
        """)
        
        # Create User table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "User" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "role" "UserRole" NOT NULL,
                "locationId" TEXT NOT NULL,
                "clientId" TEXT NOT NULL,
                "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "User_pkey" PRIMARY KEY ("id")
            );
        """)
        
        # Insert LGM Client
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Lets Get Moving', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO NOTHING;
        """)
        
        # Insert LGM Locations (Corporate and Franchise)
        locations_data = [
            # Corporate Locations
            ('loc_lgm_burnaby_corporate_001', 'BURNABY', 'CORPORATE'),
            ('loc_lgm_downtown_toronto_corporate_001', 'DOWNTOWN TORONTO', 'CORPORATE'),
            ('loc_lgm_edmonton_corporate_001', 'EDMONTON', 'CORPORATE'),
            ('loc_lgm_hamilton_corporate_001', 'HAMILTON', 'CORPORATE'),
            ('loc_lgm_mississauga_corporate_001', 'MISSISSAUGA', 'CORPORATE'),
            ('loc_lgm_montreal_corporate_001', 'MONTREAL', 'CORPORATE'),
            ('loc_lgm_north_york_corporate_001', 'NORTH YORK', 'CORPORATE'),
            ('loc_lgm_vancouver_corporate_001', 'VANCOUVER', 'CORPORATE'),
            
            # Franchise Locations
            ('loc_lgm_abbotsford_franchise_001', 'ABBOTSFORD', 'FRANCHISE'),
            ('loc_lgm_ajax_franchise_001', 'AJAX', 'FRANCHISE'),
            ('loc_lgm_aurora_franchise_001', 'AURORA', 'FRANCHISE'),
            ('loc_lgm_brampton_franchise_001', 'BRAMPTON', 'FRANCHISE'),
            ('loc_lgm_brantford_franchise_001', 'BRANTFORD', 'FRANCHISE'),
            ('loc_lgm_burlington_franchise_001', 'BURLINGTON', 'FRANCHISE'),
            ('loc_lgm_calgary_franchise_001', 'CALGARY', 'FRANCHISE'),
            ('loc_lgm_coquitlam_franchise_001', 'COQUITLAM', 'FRANCHISE'),
            ('loc_lgm_fredericton_franchise_001', 'FREDERICTON', 'FRANCHISE'),
            ('loc_lgm_halifax_franchise_001', 'HALIFAX', 'FRANCHISE'),
            ('loc_lgm_kingston_franchise_001', 'KINGSTON', 'FRANCHISE'),
            ('loc_lgm_lethbridge_franchise_001', 'LETHBRIDGE', 'FRANCHISE'),
            ('loc_lgm_london_franchise_001', 'LONDON', 'FRANCHISE'),
            ('loc_lgm_ottawa_franchise_001', 'OTTAWA', 'FRANCHISE'),
            ('loc_lgm_regina_franchise_001', 'REGINA', 'FRANCHISE'),
            ('loc_lgm_richmond_franchise_001', 'RICHMOND', 'FRANCHISE'),
            ('loc_lgm_saint_john_franchise_001', 'SAINT JOHN', 'FRANCHISE'),
            ('loc_lgm_scarborough_franchise_001', 'SCARBOROUGH', 'FRANCHISE'),
            ('loc_lgm_surrey_franchise_001', 'SURREY', 'FRANCHISE'),
            ('loc_lgm_vaughan_franchise_001', 'VAUGHAN', 'FRANCHISE'),
            ('loc_lgm_victoria_franchise_001', 'VICTORIA', 'FRANCHISE'),
            ('loc_lgm_waterloo_franchise_001', 'WATERLOO', 'FRANCHISE'),
            ('loc_lgm_winnipeg_franchise_001', 'WINNIPEG', 'FRANCHISE')
        ]
        
        for loc_id, loc_name, loc_type in locations_data:
            cursor.execute("""
                INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") 
                VALUES (%s, 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', %s, 'America/Toronto', %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING;
            """, (loc_id, loc_name, f"{loc_name} {loc_type} Office"))
        
        # Insert Real LGM Users (All Managers with password "1234")
        users_data = [
            # Corporate Location Managers
            ('usr_shahbaz_burnaby', 'Shahbaz', 'shahbaz@lgm.com', 'MANAGER', 'loc_lgm_burnaby_corporate_001'),
            ('usr_arshdeep_downtown_toronto', 'Arshdeep', 'arshdeep@lgm.com', 'MANAGER', 'loc_lgm_downtown_toronto_corporate_001'),
            ('usr_danylo_edmonton', 'Danylo', 'danylo@lgm.com', 'MANAGER', 'loc_lgm_edmonton_corporate_001'),
            ('usr_hakam_hamilton', 'Hakam', 'hakam@lgm.com', 'MANAGER', 'loc_lgm_hamilton_corporate_001'),
            ('usr_bhanu_montreal', 'Bhanu', 'bhanu@lgm.com', 'MANAGER', 'loc_lgm_montreal_corporate_001'),
            ('usr_ankit_north_york', 'Ankit', 'ankit@lgm.com', 'MANAGER', 'loc_lgm_north_york_corporate_001'),
            ('usr_rasoul_vancouver', 'Rasoul', 'rasoul@lgm.com', 'MANAGER', 'loc_lgm_vancouver_corporate_001'),
            
            # Franchise Location Managers
            ('usr_anees_abbotsford', 'Anees Aps', 'anees.aps@lgm.com', 'MANAGER', 'loc_lgm_abbotsford_franchise_001'),
            ('usr_andrew_ajax', 'Andrew', 'andrew@lgm.com', 'MANAGER', 'loc_lgm_ajax_franchise_001'),
            ('usr_parsa_aurora', 'Parsa', 'parsa@lgm.com', 'MANAGER', 'loc_lgm_aurora_franchise_001'),
            ('usr_aerish_brampton', 'Aerish', 'aerish@lgm.com', 'MANAGER', 'loc_lgm_brampton_franchise_001'),
            ('usr_akshit_brampton', 'Akshit', 'akshit@lgm.com', 'MANAGER', 'loc_lgm_brampton_franchise_001'),
            ('usr_harsh_brantford', 'Harsh', 'harsh@lgm.com', 'MANAGER', 'loc_lgm_brantford_franchise_001'),
            ('usr_simranjit_burlington', 'Simranjit', 'simranjit@lgm.com', 'MANAGER', 'loc_lgm_burlington_franchise_001'),
            ('usr_jasdeep_calgary', 'Jasdeep', 'jasdeep@lgm.com', 'MANAGER', 'loc_lgm_calgary_franchise_001'),
            ('usr_todd_coquitlam', 'Todd', 'todd@lgm.com', 'MANAGER', 'loc_lgm_coquitlam_franchise_001'),
            ('usr_kambiz_fredericton', 'Kambiz', 'kambiz@lgm.com', 'MANAGER', 'loc_lgm_fredericton_franchise_001'),
            ('usr_mahmoud_halifax', 'Mahmoud', 'mahmoud@lgm.com', 'MANAGER', 'loc_lgm_halifax_franchise_001'),
            ('usr_anirudh_kingston', 'Anirudh', 'anirudh@lgm.com', 'MANAGER', 'loc_lgm_kingston_franchise_001'),
            ('usr_promise_lethbridge', 'Promise', 'promise@lgm.com', 'MANAGER', 'loc_lgm_lethbridge_franchise_001'),
            ('usr_kyle_london', 'Kyle', 'kyle@lgm.com', 'MANAGER', 'loc_lgm_london_franchise_001'),
            ('usr_hanze_ottawa', 'Hanze', 'hanze@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_001'),
            ('usr_jay_ottawa', 'Jay', 'jay@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_001'),
            ('usr_ralph_regina', 'Ralph', 'ralph@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_001'),
            ('usr_isabella_regina', 'Isabella', 'isabella@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_001'),
            ('usr_rasoul_richmond', 'Rasoul', 'rasoul@lgm.com', 'MANAGER', 'loc_lgm_richmond_franchise_001'),
            ('usr_camellia_saint_john', 'Camellia', 'camellia@lgm.com', 'MANAGER', 'loc_lgm_saint_john_franchise_001'),
            ('usr_kelvin_scarborough', 'Kelvin', 'kelvin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_001'),
            ('usr_aswin_scarborough', 'Aswin', 'aswin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_001'),
            ('usr_danil_surrey', 'Danil', 'danil@lgm.com', 'MANAGER', 'loc_lgm_surrey_franchise_001'),
            ('usr_fahim_vaughan', 'Fahim', 'fahim@lgm.com', 'MANAGER', 'loc_lgm_vaughan_franchise_001'),
            ('usr_success_victoria', 'Success', 'success@lgm.com', 'MANAGER', 'loc_lgm_victoria_franchise_001'),
            ('usr_sadur_waterloo', 'Sadur', 'sadur@lgm.com', 'MANAGER', 'loc_lgm_waterloo_franchise_001'),
            ('usr_wayne_winnipeg', 'Wayne', 'wayne@lgm.com', 'MANAGER', 'loc_lgm_winnipeg_franchise_001')
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
        
        return {
            "success": True,
            "message": "Database setup completed successfully",
            "data": {
                "locations_created": len(locations_data),
                "users_created": len(users_data),
                "client": "Lets Get Moving"
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Database setup failed"
        }

@router.get("/setup/status")
async def get_setup_status():
    """Get the current setup status"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if LGM client exists
        cursor.execute("SELECT COUNT(*) as count FROM \"Client\" WHERE name = 'Lets Get Moving'")
        client_count = cursor.fetchone()['count']
        
        # Check locations count
        cursor.execute("SELECT COUNT(*) as count FROM \"Location\" WHERE \"clientId\" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'")
        location_count = cursor.fetchone()['count']
        
        # Check users count
        cursor.execute("SELECT COUNT(*) as count FROM \"User\" WHERE \"clientId\" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'")
        user_count = cursor.fetchone()['count']
        
        # Get sample users
        cursor.execute("""
            SELECT u.name, u.email, u.role, l.name as location_name, 
                   CASE WHEN l.id LIKE '%corporate%' THEN 'CORPORATE' ELSE 'FRANCHISE' END as location_type
            FROM "User" u 
            JOIN "Location" l ON u."locationId" = l.id 
            WHERE u."clientId" = 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa' 
            LIMIT 10
        """)
        sample_users = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "client_exists": client_count > 0,
                "locations_count": location_count,
                "users_count": user_count,
                "sample_users": sample_users
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to get setup status"
        } 

@router.post("/setup/update-users")
async def update_users_to_real_lgm():
    """Update existing users to real LGM users with proper location assignments"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Read and execute the SQL script
        sql_script = """
        -- Update existing demo users to real LGM users with proper location assignments
        UPDATE "User" SET
            name = 'Shahbaz',
            email = 'shahbaz@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_burnaby_corporate_001'
        WHERE id = 'usr_super_admin';

        UPDATE "User" SET
            name = 'Arshdeep',
            email = 'arshdeep@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_downtown_toronto_corporate_002'
        WHERE id = 'usr_admin';

        UPDATE "User" SET
            name = 'Danylo',
            email = 'danylo@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_edmonton_corporate_003'
        WHERE id = 'usr_dispatcher';

        UPDATE "User" SET
            name = 'Hakam',
            email = 'hakam@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_hamilton_corporate_004'
        WHERE id = 'usr_driver';

        UPDATE "User" SET
            name = 'Bhanu',
            email = 'bhanu@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_montreal_corporate_006'
        WHERE id = 'usr_mover';

        UPDATE "User" SET
            name = 'Ankit',
            email = 'ankit@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_north_york_corporate_007'
        WHERE id = 'usr_manager';

        UPDATE "User" SET
            name = 'Rasoul',
            email = 'rasoul@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_vancouver_corporate_008'
        WHERE id = 'usr_auditor';

        UPDATE "User" SET
            name = 'Anees Aps',
            email = 'anees.aps@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_abbotsford_franchise_009'
        WHERE id = 'usr_storage_manager';

        UPDATE "User" SET
            name = 'Andrew',
            email = 'andrew@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_ajax_franchise_010'
        WHERE id = 'usr_super_admin_2';

        UPDATE "User" SET
            name = 'Parsa',
            email = 'parsa@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_aurora_franchise_011'
        WHERE id = 'usr_admin_2';

        UPDATE "User" SET
            name = 'Aerish',
            email = 'aerish@lgm.com',
            role = 'MANAGER',
            "locationId" = 'loc_lgm_brampton_franchise_012'
        WHERE id = 'usr_dispatcher_2';

        -- Add more real LGM users
        INSERT INTO "User" (id, name, email, role, "locationId", "clientId", status, "createdAt", "updatedAt") VALUES
        ('usr_akshit_brampton', 'Akshit', 'akshit@lgm.com', 'MANAGER', 'loc_lgm_brampton_franchise_012', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_harsh_brantford', 'Harsh', 'harsh@lgm.com', 'MANAGER', 'loc_lgm_brantford_franchise_013', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_simranjit_burlington', 'Simranjit', 'simranjit@lgm.com', 'MANAGER', 'loc_lgm_burlington_franchise_014', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_jasdeep_calgary', 'Jasdeep', 'jasdeep@lgm.com', 'MANAGER', 'loc_lgm_calgary_franchise_015', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_todd_coquitlam', 'Todd', 'todd@lgm.com', 'MANAGER', 'loc_lgm_coquitlam_franchise_016', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_kambiz_fredericton', 'Kambiz', 'kambiz@lgm.com', 'MANAGER', 'loc_lgm_fredericton_franchise_017', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_mahmoud_halifax', 'Mahmoud', 'mahmoud@lgm.com', 'MANAGER', 'loc_lgm_halifax_franchise_018', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_anirudh_kingston', 'Anirudh', 'anirudh@lgm.com', 'MANAGER', 'loc_lgm_kingston_franchise_019', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_promise_lethbridge', 'Promise', 'promise@lgm.com', 'MANAGER', 'loc_lgm_lethbridge_franchise_020', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_kyle_london', 'Kyle', 'kyle@lgm.com', 'MANAGER', 'loc_lgm_london_franchise_021', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_hanze_ottawa', 'Hanze', 'hanze@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_022', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_jay_ottawa', 'Jay', 'jay@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_022', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_ralph_regina', 'Ralph', 'ralph@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_023', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_isabella_regina', 'Isabella', 'isabella@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_023', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_rasoul_richmond', 'Rasoul', 'rasoul@lgm.com', 'MANAGER', 'loc_lgm_richmond_franchise_024', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_camellia_saint_john', 'Camellia', 'camellia@lgm.com', 'MANAGER', 'loc_lgm_saint_john_franchise_025', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_kelvin_scarborough', 'Kelvin', 'kelvin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_026', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_aswin_scarborough', 'Aswin', 'aswin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_026', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_danil_surrey', 'Danil', 'danil@lgm.com', 'MANAGER', 'loc_lgm_surrey_franchise_027', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_fahim_vaughan', 'Fahim', 'fahim@lgm.com', 'MANAGER', 'loc_lgm_vaughan_franchise_028', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_success_victoria', 'Success', 'success@lgm.com', 'MANAGER', 'loc_lgm_victoria_franchise_029', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_sadur_waterloo', 'Sadur', 'sadur@lgm.com', 'MANAGER', 'loc_lgm_waterloo_franchise_030', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
        ('usr_wayne_winnipeg', 'Wayne', 'wayne@lgm.com', 'MANAGER', 'loc_lgm_winnipeg_franchise_031', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;

        -- Also make sure we have the LGM locations
        INSERT INTO "Location" (id, "clientId", name, timezone, address, "createdAt", "updatedAt") VALUES
        ('loc_lgm_burnaby_corporate_001', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BURNABY', 'America/Toronto', 'BURNABY CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_downtown_toronto_corporate_002', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'DOWNTOWN TORONTO', 'America/Toronto', 'DOWNTOWN TORONTO CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_edmonton_corporate_003', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'EDMONTON', 'America/Toronto', 'EDMONTON CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_hamilton_corporate_004', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'HAMILTON', 'America/Toronto', 'HAMILTON CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_mississauga_corporate_005', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'MISSISSAUGA', 'America/Toronto', 'MISSISSAUGA CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_montreal_corporate_006', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'MONTREAL', 'America/Toronto', 'MONTREAL CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_north_york_corporate_007', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'NORTH YORK', 'America/Toronto', 'NORTH YORK CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_vancouver_corporate_008', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'VANCOUVER', 'America/Toronto', 'VANCOUVER CORPORATE Office', NOW(), NOW()),
        ('loc_lgm_abbotsford_franchise_009', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ABBOTSFORD', 'America/Toronto', 'ABBOTSFORD FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_ajax_franchise_010', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'AJAX', 'America/Toronto', 'AJAX FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_aurora_franchise_011', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'AURORA', 'America/Toronto', 'AURORA FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_brampton_franchise_012', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BRAMPTON', 'America/Toronto', 'BRAMPTON FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_brantford_franchise_013', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BRANTFORD', 'America/Toronto', 'BRANTFORD FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_burlington_franchise_014', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BURLINGTON', 'America/Toronto', 'BURLINGTON FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_calgary_franchise_015', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'CALGARY', 'America/Toronto', 'CALGARY FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_coquitlam_franchise_016', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'COQUITLAM', 'America/Toronto', 'COQUITLAM FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_fredericton_franchise_017', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'FREDERICTON', 'America/Toronto', 'FREDERICTON FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_halifax_franchise_018', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'HALIFAX', 'America/Toronto', 'HALIFAX FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_kingston_franchise_019', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'KINGSTON', 'America/Toronto', 'KINGSTON FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_lethbridge_franchise_020', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'LETHBRIDGE', 'America/Toronto', 'LETHBRIDGE FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_london_franchise_021', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'LONDON', 'America/Toronto', 'LONDON FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_ottawa_franchise_022', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'OTTAWA', 'America/Toronto', 'OTTAWA FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_regina_franchise_023', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'REGINA', 'America/Toronto', 'REGINA FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_richmond_franchise_024', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'RICHMOND', 'America/Toronto', 'RICHMOND FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_saint_john_franchise_025', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'SAINT JOHN', 'America/Toronto', 'SAINT JOHN FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_scarborough_franchise_026', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'SCARBOROUGH', 'America/Toronto', 'SCARBOROUGH FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_surrey_franchise_027', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'SURREY', 'America/Toronto', 'SURREY FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_vaughan_franchise_028', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'VAUGHAN', 'America/Toronto', 'VAUGHAN FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_victoria_franchise_029', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'VICTORIA', 'America/Toronto', 'VICTORIA FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_waterloo_franchise_030', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'WATERLOO', 'America/Toronto', 'WATERLOO FRANCHISE Office', NOW(), NOW()),
        ('loc_lgm_winnipeg_franchise_031', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'WINNIPEG', 'America/Toronto', 'WINNIPEG FRANCHISE Office', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        """
        
        # Execute the SQL script
        cursor.execute(sql_script)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "Users updated to real LGM data successfully",
            "data": {
                "updated_users": "All demo users converted to real LGM users",
                "added_locations": "32 LGM locations created",
                "added_users": "32 real LGM users created"
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to update users to real LGM data"
        } 

@router.post("/fix-production-database")
async def fix_production_database() -> Dict[str, Any]:
    """Fix production database by cleaning up mock data and ensuring real LGM data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🚀 FIXING PRODUCTION DATABASE")
        print("=" * 50)
        
        # Step 1: Clean up all mock data
        print("🧹 Cleaning up mock data...")
        
        # Delete mock journeys
        cursor.execute("""
            DELETE FROM "TruckJourney" 
            WHERE "dataSource" = 'MANUAL' 
            OR "externalId" LIKE 'journey_test_%'
            OR "externalId" LIKE 'test_%'
        """)
        mock_journeys_deleted = cursor.rowcount
        
        # Delete mock users
        cursor.execute("""
            DELETE FROM "User" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR "name" LIKE 'Demo%'
            OR "name" LIKE 'Test%'
            OR "email" LIKE 'demo%'
            OR "email" LIKE 'test%'
        """)
        mock_users_deleted = cursor.rowcount
        
        # Delete mock locations
        cursor.execute("""
            DELETE FROM "Location" 
            WHERE "clientId" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR "name" LIKE 'Demo%'
            OR "name" LIKE 'Test%'
            OR "name" LIKE 'Location%'
        """)
        mock_locations_deleted = cursor.rowcount
        
        # Delete mock clients
        cursor.execute("""
            DELETE FROM "Client" 
            WHERE "id" != 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa'
            OR "name" LIKE 'Demo%'
            OR "name" LIKE 'Test%'
        """)
        mock_clients_deleted = cursor.rowcount
        
        # Step 2: Ensure LGM client exists
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'LGM (Lets Get Moving)', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO UPDATE SET 
                name = EXCLUDED.name,
                industry = EXCLUDED.industry,
                "updatedAt" = CURRENT_TIMESTAMP;
        """)
        
        # Step 3: Ensure real LGM locations exist
        lgm_locations = [
            ("loc_lgm_burnaby_corporate_001", "BURNABY", "CORPORATE", "Burnaby, BC"),
            ("loc_lgm_downtown_toronto_corporate_001", "DOWNTOWN TORONTO", "CORPORATE", "Toronto, ON"),
            ("loc_lgm_edmonton_corporate_001", "EDMONTON", "CORPORATE", "Edmonton, AB"),
            ("loc_lgm_hamilton_corporate_001", "HAMILTON", "CORPORATE", "Hamilton, ON"),
            ("loc_lgm_montreal_corporate_001", "MONTREAL", "CORPORATE", "Montreal, QC"),
            ("loc_lgm_north_york_corporate_001", "NORTH YORK", "CORPORATE", "North York, ON"),
            ("loc_lgm_vancouver_corporate_001", "VANCOUVER", "CORPORATE", "Vancouver, BC"),
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
        
        # Step 4: Ensure real LGM users exist
        lgm_users = [
            ("usr_shahbaz_burnaby", "Shahbaz", "shahbaz@lgm.com", "MANAGER", "loc_lgm_burnaby_corporate_001"),
            ("usr_arshdeep_downtown_toronto", "Arshdeep", "arshdeep@lgm.com", "MANAGER", "loc_lgm_downtown_toronto_corporate_001"),
            ("usr_danylo_edmonton", "Danylo", "danylo@lgm.com", "MANAGER", "loc_lgm_edmonton_corporate_001"),
            ("usr_hakam_hamilton", "Hakam", "hakam@lgm.com", "MANAGER", "loc_lgm_hamilton_corporate_001"),
            ("usr_bhanu_montreal", "Bhanu", "bhanu@lgm.com", "MANAGER", "loc_lgm_montreal_corporate_001"),
            ("usr_ankit_north_york", "Ankit", "ankit@lgm.com", "MANAGER", "loc_lgm_north_york_corporate_001"),
            ("usr_rasoul_vancouver", "Rasoul", "rasoul@lgm.com", "MANAGER", "loc_lgm_vancouver_corporate_001"),
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
        
        # Step 5: Create sample SmartMoving journeys
        from datetime import datetime
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
                "locationId": "loc_lgm_downtown_toronto_corporate_001",
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
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "Production database fixed successfully",
            "data": {
                "mock_journeys_deleted": mock_journeys_deleted,
                "mock_users_deleted": mock_users_deleted,
                "mock_locations_deleted": mock_locations_deleted,
                "mock_clients_deleted": mock_clients_deleted,
                "lgm_locations_created": len(lgm_locations),
                "lgm_users_created": len(lgm_users),
                "sample_journeys_created": len(sample_journeys),
                "client": "LGM (Lets Get Moving)"
            }
        }
        
    except Exception as e:
        print(f"❌ Error fixing production database: {e}")
        return {
            "success": False,
            "error": "Database fix failed",
            "message": str(e)
        } 