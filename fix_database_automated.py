#!/usr/bin/env python3
"""
Automated Database Fix for C&C CRM
Creates necessary tables if they don't exist
"""

import os
import psycopg2
from urllib.parse import urlparse
import sys

def get_db_connection():
    """Get database connection from DATABASE_URL"""
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("Error: DATABASE_URL environment variable not set")
        return None
    
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        return None

def create_tables_if_not_exist(conn):
    """Create tables if they don't exist"""
    try:
        cursor = conn.cursor()
        
        # Check if Client table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Client'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("Creating database tables...")
            
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
            
            # Insert sample data
            cursor.execute("""
                INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
                VALUES ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Lets Get Moving', 'Moving & Storage', false, '{"theme": "dark"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING;
            """)
            
            cursor.execute("""
                INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") 
                VALUES ('loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Toronto Main Office', 'America/Toronto', '123 Main St, Toronto, ON', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING;
            """)
            
            # Add foreign key constraints (ignore if they exist)
            try:
                cursor.execute("""
                    ALTER TABLE "Location" ADD CONSTRAINT "Location_clientId_fkey" 
                    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
                """)
            except:
                pass  # Constraint might already exist
                
            try:
                cursor.execute("""
                    ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" 
                    FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
                """)
            except:
                pass  # Constraint might already exist
                
            try:
                cursor.execute("""
                    ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" 
                    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
                """)
            except:
                pass  # Constraint might already exist
            
            conn.commit()
            print("✅ Database tables created successfully!")
        else:
            print("✅ Database tables already exist!")
        
        cursor.close()
        
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        conn.rollback()

def main():
    """Main function"""
    print("🔧 Checking and fixing database tables...")
    
    conn = get_db_connection()
    if conn:
        create_tables_if_not_exist(conn)
        conn.close()
        print("✅ Database fix completed!")
    else:
        print("❌ Could not connect to database")

if __name__ == "__main__":
    main() 