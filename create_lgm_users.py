import psycopg2
import json
from datetime import datetime
import os
import uuid

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "postgres"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "c_and_c_crm"),
    "user": os.getenv("DB_USER", "c_and_c_user"),
    "password": os.getenv("DB_PASSWORD", "c_and_c_password")
}

# LGM Client ID
LGM_CLIENT_ID = "clm_f55e13de_a5c4_4990_ad02_34bb07187daa"

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

def get_all_locations(conn):
    """Get all locations with their managers"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, name, contact, ownership_type 
            FROM "Location" 
            WHERE "clientId" = %s 
            ORDER BY name
        """, (LGM_CLIENT_ID,))
        return cursor.fetchall()
    finally:
        cursor.close()

def create_user_for_location(conn, location_id, location_name, contact, ownership_type):
    """Create a user for a location manager"""
    cursor = conn.cursor()
    
    try:
        # Skip if no contact or N/A
        if not contact or contact == "N/A":
            print(f"  ⏭️  Skipping {location_name} - No contact info")
            return False
        
        # Generate email from contact name
        contact_clean = contact.replace(" ", ".").replace("/", ".").lower()
        email = f"{contact_clean}@lgm.com"
        
        # Determine role based on ownership type
        if ownership_type == "CORPORATE":
            role = "MANAGER"  # Corporate locations get MANAGER role
        else:
            role = "ADMIN"    # Franchise locations get ADMIN role
        
        # Generate user ID
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        
        # Check if user already exists
        cursor.execute('SELECT id FROM "User" WHERE email = %s', (email,))
        if cursor.fetchone():
            print(f"  ⏭️  User already exists: {contact} ({email})")
            return False
        
        # Insert user
        cursor.execute("""
            INSERT INTO "User" (
                id, name, email, role, "clientId", "locationId", status, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            user_id,
            contact,
            email,
            role,
            LGM_CLIENT_ID,
            location_id,
            "ACTIVE"
        ))
        
        print(f"  ✅ {contact} ({role}) - {location_name}")
        print(f"     Email: {email}")
        return True
        
    except Exception as e:
        print(f"  ❌ Error creating user for {location_name}: {e}")
        return False
    finally:
        cursor.close()

def ensure_super_admin(conn):
    """Ensure super admin user exists and is properly configured"""
    cursor = conn.cursor()
    
    try:
        # Check if super admin exists
        cursor.execute('SELECT id, username, email FROM super_admin_users WHERE username = %s', ('udi.shkolnik',))
        existing = cursor.fetchone()
        
        if existing:
            print(f"  ✅ Super Admin already exists: udi.shkolnik")
            print(f"     Email: {existing[2]}")
            return True
        else:
            # Create super admin
            super_admin_id = f"sau_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO super_admin_users (
                    id, username, email, role, status, "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                super_admin_id,
                'udi.shkolnik',
                'udi.shkolnik@lgm.com',
                'SUPER_ADMIN',
                'ACTIVE'
            ))
            
            print(f"  ✅ Super Admin created: udi.shkolnik")
            print(f"     Email: udi.shkolnik@lgm.com")
            return True
            
    except Exception as e:
        print(f"  ❌ Error with super admin: {e}")
        return False
    finally:
        cursor.close()

def create_additional_test_users(conn):
    """Create additional test users for different roles"""
    cursor = conn.cursor()
    
    test_users = [
        {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@lgm.com",
            "role": "DISPATCHER",
            "locationId": "loc_lgm_vancouver_001",  # VANCOUVER
        },
        {
            "name": "Mike Chen",
            "email": "mike.chen@lgm.com", 
            "role": "DRIVER",
            "locationId": "loc_lgm_vancouver_001",  # VANCOUVER
        },
        {
            "name": "David Rodriguez",
            "email": "david.rodriguez@lgm.com",
            "role": "MOVER",
            "locationId": "loc_lgm_burnaby_001",  # BURNABY
        },
        {
            "name": "Lisa Thompson",
            "email": "lisa.thompson@lgm.com",
            "role": "AUDITOR",
            "locationId": "loc_lgm_downtown_toronto_001",  # DOWNTOWN TORONTO
        }
    ]
    
    created = 0
    for user_data in test_users:
        try:
            # Check if user already exists
            cursor.execute('SELECT id FROM "User" WHERE email = %s', (user_data['email'],))
            if cursor.fetchone():
                print(f"  ⏭️  Test user already exists: {user_data['name']}")
                continue
            
            # Generate user ID
            user_id = f"usr_{uuid.uuid4().hex[:8]}"
            
            # Insert user
            cursor.execute("""
                INSERT INTO "User" (
                    id, name, email, role, "clientId", "locationId", status, "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                user_id,
                user_data['name'],
                user_data['email'],
                user_data['role'],
                LGM_CLIENT_ID,
                user_data['locationId'],
                "ACTIVE"
            ))
            
            print(f"  ✅ {user_data['name']} ({user_data['role']})")
            print(f"     Email: {user_data['email']}")
            created += 1
            
        except Exception as e:
            print(f"  ❌ Error creating test user {user_data['name']}: {e}")
    
    return created

def main():
    """Main function to create LGM users"""
    print("🚀 Creating LGM Users for All Location Managers")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        print("✅ Database connection successful")

        # Ensure super admin exists
        print("\n👑 Ensuring Super Admin...")
        print("-" * 50)
        ensure_super_admin(conn)

        # Get all locations
        print("\n📍 Getting all LGM locations...")
        locations = get_all_locations(conn)
        print(f"Found {len(locations)} locations")

        # Create users for location managers
        print("\n👥 Creating Users for Location Managers...")
        print("-" * 50)
        
        created_users = 0
        skipped_users = 0
        
        for location_id, location_name, contact, ownership_type in locations:
            success = create_user_for_location(conn, location_id, location_name, contact, ownership_type)
            if success:
                created_users += 1
            else:
                skipped_users += 1

        # Create additional test users
        print("\n🧪 Creating Additional Test Users...")
        print("-" * 50)
        test_users_created = create_additional_test_users(conn)

        # Commit all changes
        conn.commit()
        conn.close()

        print("\n" + "=" * 80)
        print("📊 USER CREATION SUMMARY")
        print("=" * 80)
        print(f"Total locations: {len(locations)}")
        print(f"Location managers created: {created_users}")
        print(f"Locations skipped (no contact): {skipped_users}")
        print(f"Test users created: {test_users_created}")
        print(f"Total new users: {created_users + test_users_created}")

        print(f"\n🔑 LOGIN CREDENTIALS:")
        print("For testing, use any password (the system accepts any password for demo)")
        print("\nSuper Admin:")
        print("  udi.shkolnik (password: Id200633048!)")
        print("\nTest Users:")
        print("  sarah.johnson@lgm.com (password: password123)")
        print("  mike.chen@lgm.com (password: password123)")
        print("  david.rodriguez@lgm.com (password: password123)")
        print("  lisa.thompson@lgm.com (password: password123)")
        print("\nLocation Managers (use any password):")
        print("  All location managers now have accounts with their names as emails")

        print(f"\n✅ LGM users created successfully!")
        print("📋 You can now test the system with different user roles and locations")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the database is running and accessible")

if __name__ == "__main__":
    main() 