#!/usr/bin/env python3
"""
Direct Database Fix for C&C CRM
Connects to Render PostgreSQL and creates tables
"""

import os
import psycopg2
import sys

def fix_database():
    """Fix the database by creating tables"""
    
    # Get database URL from environment or use default
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        print("❌ DATABASE_URL not found in environment")
        print("Please set DATABASE_URL environment variable")
        return False
    
    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("✅ Connected to database")
        
        # Check if Client table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Client'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            print("✅ Database tables already exist!")
            return True
        
        print("🔧 Creating database tables...")
        
        # Create enums
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'MOVER', 'MANAGER', 'AUDITOR');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        print("✅ Created UserRole enum")
        
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        print("✅ Created UserStatus enum")
        
        cursor.execute("""
            DO $$ BEGIN
                CREATE TYPE "JourneyStage" AS ENUM ('MORNING_PREP', 'EN_ROUTE', 'ONSITE', 'COMPLETED', 'AUDITED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        print("✅ Created JourneyStage enum")
        
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
        print("✅ Created Client table")
        
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
        print("✅ Created Location table")
        
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
        print("✅ Created User table")
        
        # Insert sample data
        cursor.execute("""
            INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
            VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Lets Get Moving', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO NOTHING;
        """)
        print("✅ Inserted sample client data")
        
        cursor.execute("""
            INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") 
            VALUES ('loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Toronto Main Office', 'America/Toronto', '123 Main St, Toronto, ON', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id") DO NOTHING;
        """)
        print("✅ Inserted sample location data")
        
        # Add foreign key constraints (ignore if they exist)
        try:
            cursor.execute("""
                ALTER TABLE "Location" ADD CONSTRAINT "Location_clientId_fkey" 
                FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
            """)
            print("✅ Added Location foreign key constraint")
        except:
            print("ℹ️  Location foreign key constraint already exists")
            
        try:
            cursor.execute("""
                ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" 
                FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
            """)
            print("✅ Added User locationId foreign key constraint")
        except:
            print("ℹ️  User locationId foreign key constraint already exists")
            
        try:
            cursor.execute("""
                ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" 
                FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
            """)
            print("✅ Added User clientId foreign key constraint")
        except:
            print("ℹ️  User clientId foreign key constraint already exists")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("🎉 Database fix completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing database: {str(e)}")
        return False

def test_api():
    """Test if the API is working after fix"""
    import requests
    
    try:
        print("🧪 Testing API...")
        response = requests.get("https://c-and-c-crm-api.onrender.com/auth/companies", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ API is working! Companies endpoint responding correctly")
                return True
            else:
                print(f"❌ API returned error: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing API: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 C&C CRM Database Fix")
    print("=" * 50)
    
    # Fix database
    if fix_database():
        print("\n" + "=" * 50)
        print("🎯 Database fix completed!")
        print("Now testing API...")
        
        # Test API
        if test_api():
            print("\n🎉 SUCCESS! Your C&C CRM is now fully operational!")
            print("Visit: https://c-and-c-crm-frontend.onrender.com/auth/login")
        else:
            print("\n⚠️  Database fixed but API test failed. Please check manually.")
    else:
        print("\n❌ Database fix failed. Please check the error above.")
        sys.exit(1) 