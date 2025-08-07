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