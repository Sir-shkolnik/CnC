#!/usr/bin/env python3
"""
Create Users for Empty Locations
Adds users to locations that don't have any users assigned
"""

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

def get_lgm_client_id(cursor):
    """Get LGM client ID"""
    cursor.execute("""
        SELECT id FROM "Client" 
        WHERE name LIKE '%LGM%' OR name LIKE '%Let''s Get Moving%'
        LIMIT 1
    """)
    result = cursor.fetchone()
    return result[0] if result else None

def create_users_for_empty_locations():
    """Create users for locations that don't have any users"""
    
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Get LGM client ID
        lgm_client_id = get_lgm_client_id(cursor)
        if not lgm_client_id:
            print("❌ LGM client not found")
            return False
        
        print(f"✅ Found LGM client: {lgm_client_id}")
        
        # Find locations without users
        cursor.execute("""
            SELECT l.id, l.name, l.contact, l."ownership_type"
            FROM "Location" l
            LEFT JOIN "User" u ON l.id = u."locationId"
            WHERE l."clientId" = %s AND u.id IS NULL
            ORDER BY l.name
        """, (lgm_client_id,))
        
        empty_locations = cursor.fetchall()
        print(f"✅ Found {len(empty_locations)} locations without users")
        
        if len(empty_locations) == 0:
            print("✅ All locations already have users")
            return True
        
        # Create users for empty locations
        created_users = 0
        
        for location in empty_locations:
            location_id, location_name, contact, ownership_type = location
            
            # Determine role based on ownership type
            if ownership_type == 'CORPORATE':
                role = 'MANAGER'
            else:
                role = 'ADMIN'
            
            # Create user ID
            user_id = f"user_{uuid.uuid4().hex[:8]}"
            
            # Create email based on location name
            email = f"{location_name.lower().replace(' ', '.')}@lgm.com"
            
            # Create user
            cursor.execute("""
                INSERT INTO "User" (
                    id, name, email, role, "clientId", "locationId", status, 
                    "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                user_id, location_name, email, role, lgm_client_id, location_id, 'ACTIVE'
            ))
            
            created_users += 1
            print(f"✅ Created user for {location_name}: {email} ({role})")
        
        conn.commit()
        print(f"✅ Successfully created {created_users} users for empty locations")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🚀 Creating Users for Empty Locations")
    print("=" * 50)
    
    success = create_users_for_empty_locations()
    
    if success:
        print("✅ All users created successfully")
    else:
        print("❌ Failed to create users")
        exit(1) 