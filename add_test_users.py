import psycopg2
import uuid
from datetime import datetime

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
            created += 1
            
        except Exception as e:
            print(f"  ❌ Error creating test user {user_data['name']}: {e}")
    
    return created

def main():
    """Main function to create test users"""
    print("🚀 Creating Test Users")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        print("✅ Database connection successful")

        # Create test users
        print("\n🧪 Creating Test Users...")
        print("-" * 50)
        test_users_created = create_test_users(conn)

        # Commit all changes
        conn.commit()
        conn.close()

        print("\n" + "=" * 80)
        print("📊 TEST USER CREATION SUMMARY")
        print("=" * 80)
        print(f"Test users created: {test_users_created}")

        print(f"\n🔑 LOGIN CREDENTIALS:")
        print("For testing, use any password (the system accepts any password for demo)")
        print("\nTest Users:")
        print("  sarah.johnson@lgm.com (password: password123)")
        print("  mike.chen@lgm.com (password: password123)")
        print("  david.rodriguez@lgm.com (password: password123)")
        print("  lisa.thompson@lgm.com (password: password123)")

        print(f"\n✅ Test users created successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the database is running and accessible")

if __name__ == "__main__":
    main() 