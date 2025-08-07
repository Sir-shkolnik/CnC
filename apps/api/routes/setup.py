from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
import psycopg2
import os
from urllib.parse import urlparse

router = APIRouter()
security = HTTPBearer(auto_error=False)

def get_db_connection():
    """Get database connection from DATABASE_URL"""
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise HTTPException(status_code=500, detail="DATABASE_URL not configured")
    
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@router.post("/setup/database")
async def setup_database(token: str = Depends(security)):
    # Skip authentication for setup endpoint
    pass
    """Create database tables and initial data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if Client table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Client'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            return {"success": True, "message": "Database tables already exist"}
        
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
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Database tables created successfully"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/setup/status")
async def setup_status():
    """Check if database tables exist"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if Client table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Client'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "tables_exist": table_exists,
            "message": "Database tables exist" if table_exists else "Database tables missing"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)} 

@router.post("/setup/update-lgm-users")
async def update_lgm_users():
    """Update database with real LGM users"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Read the SQL script
        sql_file_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'update_to_real_lgm_users.sql')
        
        with open(sql_file_path, 'r') as file:
            sql_script = file.read()
        
        # Execute the SQL script
        cursor.execute(sql_script)
        conn.commit()
        
        # Verify the changes
        cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE email LIKE '%@lgm.com'")
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": f"Successfully updated LGM users. Total LGM users: {count}",
            "data": {
                "total_lgm_users": count
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to update LGM users"
        } 