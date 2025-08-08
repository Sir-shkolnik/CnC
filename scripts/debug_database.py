#!/usr/bin/env python3
"""
Debug Database Script
Purpose: Directly check database contents to debug user lookup issues
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
import json

def get_db_connection():
    """Get database connection using DATABASE_URL"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return None
    
    try:
        return psycopg2.connect(database_url)
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def debug_database():
    """Debug database contents"""
    print("🔍 DEBUGGING DATABASE CONTENTS")
    print("=" * 50)
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if User table exists
        print("📋 Checking if User table exists...")
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'User'
            );
        """)
        table_exists = cursor.fetchone()[0]
        print(f"User table exists: {table_exists}")
        
        if not table_exists:
            print("❌ User table does not exist!")
            return False
        
        # Check total users
        print("\n👥 Checking total users...")
        cursor.execute('SELECT COUNT(*) as count FROM "User"')
        total_users = cursor.fetchone()['count']
        print(f"Total users: {total_users}")
        
        # Check users with shahbaz email
        print("\n🔍 Looking for shahbaz@lgm.com...")
        cursor.execute('SELECT * FROM "User" WHERE email = %s', ('shahbaz@lgm.com',))
        shahbaz_user = cursor.fetchone()
        
        if shahbaz_user:
            print(f"✅ Found shahbaz user: {dict(shahbaz_user)}")
        else:
            print("❌ shahbaz@lgm.com not found")
            
            # Check for any users with shahbaz in email
            print("\n🔍 Looking for any user with 'shahbaz' in email...")
            cursor.execute('SELECT * FROM "User" WHERE email LIKE %s', ('%shahbaz%',))
            shahbaz_like_users = cursor.fetchall()
            
            if shahbaz_like_users:
                print(f"Found {len(shahbaz_like_users)} users with 'shahbaz' in email:")
                for user in shahbaz_like_users:
                    print(f"  - {dict(user)}")
            else:
                print("❌ No users with 'shahbaz' in email found")
        
        # Check all LGM users
        print("\n🏢 Checking all LGM users...")
        cursor.execute('SELECT * FROM "User" WHERE "clientId" = %s', ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa',))
        lgm_users = cursor.fetchall()
        print(f"Found {len(lgm_users)} LGM users")
        
        # Show first few LGM users
        for i, user in enumerate(lgm_users[:5]):
            print(f"  {i+1}. {user['email']} - {user['name']} - {user['role']} - Location: {user['locationId']}")
        
        # Check locations
        print("\n📍 Checking locations...")
        cursor.execute('SELECT COUNT(*) as count FROM "Location" WHERE "clientId" = %s', ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa',))
        lgm_locations = cursor.fetchone()['count']
        print(f"LGM locations: {lgm_locations}")
        
        # Show first few locations
        cursor.execute('SELECT * FROM "Location" WHERE "clientId" = %s LIMIT 5', ('clm_f55e13de_a5c4_4990_ad02_34bb07187daa',))
        locations = cursor.fetchall()
        for i, loc in enumerate(locations):
            print(f"  {i+1}. {loc['name']} - {loc['id']}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 DATABASE DEBUG")
    print("=" * 50)
    
    try:
        debug_database()
        print("\n🎉 Database debug completed!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
