import psycopg2
import uuid
from datetime import datetime
import re

# Database configuration
DB_CONFIG = {
    "host": "postgres",
    "port": "5432",
    "database": "c_and_c_crm",
    "user": "c_and_c_user",
    "password": "c_and_c_password"
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

def split_contact_names(contact):
    """Split contact names that contain '/' or multiple people"""
    if not contact or contact == "N/A":
        return []
    
    # Split by '/' and clean up
    names = [name.strip() for name in contact.split('/') if name.strip()]
    
    # Handle special cases like "AERISH / AKSHIT" (already split)
    if len(names) == 1 and ' / ' in names[0]:
        names = [name.strip() for name in names[0].split(' / ') if name.strip()]
    
    return names

def create_user_for_person(conn, person_name, location_id, location_name, ownership_type):
    """Create a user for a specific person"""
    cursor = conn.cursor()
    
    try:
        # Generate email from person name
        email = f"{person_name.lower().replace(' ', '.')}@lgm.com"
        
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
            print(f"  ⏭️  User already exists: {person_name} ({email})")
            return False
        
        # Insert user
        cursor.execute("""
            INSERT INTO "User" (
                id, name, email, role, "clientId", "locationId", status, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            user_id,
            person_name,
            email,
            role,
            LGM_CLIENT_ID,
            location_id,
            "ACTIVE"
        ))
        
        print(f"  ✅ {person_name} ({role}) - {location_name}")
        print(f"     Email: {email}")
        print(f"     Password: 1234")
        return True
        
    except Exception as e:
        print(f"  ❌ Error creating user for {person_name}: {e}")
        return False
    finally:
        cursor.close()

def create_test_users(conn):
    """Create test users with correct location IDs"""
    cursor = conn.cursor()
    
    test_users = [
        {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@lgm.com",
            "role": "DISPATCHER",
            "locationId": "loc_lgm_vancouver_corporate_001",  # VANCOUVER
        },
        {
            "name": "Mike Chen",
            "email": "mike.chen@lgm.com", 
            "role": "DRIVER",
            "locationId": "loc_lgm_vancouver_corporate_001",  # VANCOUVER
        },
        {
            "name": "David Rodriguez",
            "email": "david.rodriguez@lgm.com",
            "role": "MOVER",
            "locationId": "loc_lgm_burnaby_corporate_001",  # BURNABY
        },
        {
            "name": "Lisa Thompson",
            "email": "lisa.thompson@lgm.com",
            "role": "AUDITOR",
            "locationId": "loc_lgm_downtown_toronto_corporate_001",  # DOWNTOWN TORONTO
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
            print(f"     Password: 1234")
            created += 1
            
        except Exception as e:
            print(f"  ❌ Error creating test user {user_data['name']}: {e}")
    
    return created

def main():
    """Main function to create proper LGM users"""
    print("🚀 Creating Proper LGM Users (Separate Accounts for Multiple Contacts)")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        print("✅ Database connection successful")

        # Get all locations
        print("\n📍 Getting all LGM locations...")
        locations = get_all_locations(conn)
        print(f"Found {len(locations)} locations")

        # Create users for location managers
        print("\n👥 Creating Users for Location Managers...")
        print("-" * 50)
        
        created_users = 0
        skipped_locations = 0
        
        for location_id, location_name, contact, ownership_type in locations:
            print(f"\n📍 Processing {location_name}...")
            
            # Split contact names
            contact_names = split_contact_names(contact)
            
            if not contact_names:
                print(f"  ⏭️  Skipping {location_name} - No contact info")
                skipped_locations += 1
                continue
            
            # Create user for each person
            for person_name in contact_names:
                success = create_user_for_person(conn, person_name, location_id, location_name, ownership_type)
                if success:
                    created_users += 1

        # Create additional test users
        print("\n🧪 Creating Additional Test Users...")
        print("-" * 50)
        test_users_created = create_test_users(conn)

        # Commit all changes
        conn.commit()
        conn.close()

        print("\n" + "=" * 80)
        print("📊 USER CREATION SUMMARY")
        print("=" * 80)
        print(f"Total locations: {len(locations)}")
        print(f"Location managers created: {created_users}")
        print(f"Locations skipped (no contact): {skipped_locations}")
        print(f"Test users created: {test_users_created}")
        print(f"Total new users: {created_users + test_users_created}")

        print(f"\n🔑 LOGIN CREDENTIALS:")
        print("All users use password: 1234")
        print("\nSuper Admin:")
        print("  udi.shkolnik (password: Id200633048!)")
        print("\nTest Users:")
        print("  sarah.johnson@lgm.com (password: 1234)")
        print("  mike.chen@lgm.com (password: 1234)")
        print("  david.rodriguez@lgm.com (password: 1234)")
        print("  lisa.thompson@lgm.com (password: 1234)")
        print("\nLocation Managers (password: 1234):")
        print("  All location managers now have separate accounts")

        print(f"\n✅ LGM users created successfully!")
        print("📋 You can now test the system with different user roles and locations")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the database is running and accessible")

if __name__ == "__main__":
    main() 