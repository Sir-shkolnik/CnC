#!/usr/bin/env python3
"""
🧹 C&C CRM - Database Cleanup Script
====================================

This script removes all test/mock data from the database and ensures only real LGM data remains.

Author: C&C CRM Team
Date: August 8, 2025
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import os
from datetime import datetime

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'c_and_c_crm'),
            user=os.getenv('DB_USER', 'c_and_c_user'),
            password=os.getenv('DB_PASSWORD', 'c_and_c_password')
        )
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def cleanup_test_journeys():
    """Remove all test journey data"""
    print("🧹 Cleaning up test journey data...")
    
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Count test journeys before deletion
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM "TruckJourney" 
            WHERE id LIKE 'journey_test_%' OR id LIKE 'test_%'
        """)
        test_count = cursor.fetchone()['count']
        
        if test_count == 0:
            print("✅ No test journeys found in database")
            return True
        
        print(f"📊 Found {test_count} test journeys to remove")
        
        # Delete test journeys
        cursor.execute("""
            DELETE FROM "TruckJourney" 
            WHERE id LIKE 'journey_test_%' OR id LIKE 'test_%'
        """)
        
        deleted_count = cursor.rowcount
        conn.commit()
        
        print(f"✅ Removed {deleted_count} test journeys from database")
        
        # Verify cleanup
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney"')
        remaining_count = cursor.fetchone()['count']
        print(f"📊 Remaining journeys in database: {remaining_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error cleaning up test journeys: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def cleanup_test_users():
    """Remove test user data"""
    print("🧹 Cleaning up test user data...")
    
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Count test users before deletion
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM "User" 
            WHERE id LIKE 'test_%' OR email LIKE '%test%' OR name LIKE '%Test%'
        """)
        test_count = cursor.fetchone()['count']
        
        if test_count == 0:
            print("✅ No test users found in database")
            return True
        
        print(f"📊 Found {test_count} test users to remove")
        
        # Delete test users
        cursor.execute("""
            DELETE FROM "User" 
            WHERE id LIKE 'test_%' OR email LIKE '%test%' OR name LIKE '%Test%'
        """)
        
        deleted_count = cursor.rowcount
        conn.commit()
        
        print(f"✅ Removed {deleted_count} test users from database")
        
        return True
        
    except Exception as e:
        print(f"❌ Error cleaning up test users: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def cleanup_test_locations():
    """Remove test location data"""
    print("🧹 Cleaning up test location data...")
    
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Count test locations before deletion
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM "Location" 
            WHERE id LIKE 'test_%' OR name LIKE '%Test%' OR name LIKE '%Mock%'
        """)
        test_count = cursor.fetchone()['count']
        
        if test_count == 0:
            print("✅ No test locations found in database")
            return True
        
        print(f"📊 Found {test_count} test locations to remove")
        
        # Delete test locations
        cursor.execute("""
            DELETE FROM "Location" 
            WHERE id LIKE 'test_%' OR name LIKE '%Test%' OR name LIKE '%Mock%'
        """)
        
        deleted_count = cursor.rowcount
        conn.commit()
        
        print(f"✅ Removed {deleted_count} test locations from database")
        
        return True
        
    except Exception as e:
        print(f"❌ Error cleaning up test locations: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_real_data():
    """Verify that real LGM data is present"""
    print("🔍 Verifying real LGM data...")
    
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check real users
        cursor.execute('SELECT COUNT(*) as count FROM "User"')
        user_count = cursor.fetchone()['count']
        print(f"📊 Real users in database: {user_count}")
        
        # Check real locations
        cursor.execute('SELECT COUNT(*) as count FROM "Location"')
        location_count = cursor.fetchone()['count']
        print(f"📊 Real locations in database: {location_count}")
        
        # Check real journeys
        cursor.execute('SELECT COUNT(*) as count FROM "TruckJourney"')
        journey_count = cursor.fetchone()['count']
        print(f"📊 Real journeys in database: {journey_count}")
        
        # Check real companies
        cursor.execute('SELECT COUNT(*) as count FROM "Client"')
        company_count = cursor.fetchone()['count']
        print(f"📊 Real companies in database: {company_count}")
        
        # Show sample real data
        print("\n📋 Sample real data:")
        
        # Sample users
        cursor.execute('SELECT name, email, role FROM "User" LIMIT 3')
        users = cursor.fetchall()
        print("   Users:")
        for user in users:
            print(f"     - {user['name']} ({user['role']}) - {user['email']}")
        
        # Sample locations
        cursor.execute('SELECT name FROM "Location" LIMIT 3')
        locations = cursor.fetchall()
        print("   Locations:")
        for location in locations:
            print(f"     - {location['name']}")
        
        # Sample companies
        cursor.execute('SELECT name, industry FROM "Client"')
        companies = cursor.fetchall()
        print("   Companies:")
        for company in companies:
            print(f"     - {company['name']} ({company['industry']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying real data: {e}")
        return False
    finally:
        conn.close()

def main():
    """Main cleanup function"""
    print("🧹 C&C CRM - Database Cleanup")
    print("=" * 50)
    
    success_count = 0
    total_tasks = 4
    
    # 1. Clean up test journeys
    if cleanup_test_journeys():
        success_count += 1
    
    # 2. Clean up test users
    if cleanup_test_users():
        success_count += 1
    
    # 3. Clean up test locations
    if cleanup_test_locations():
        success_count += 1
    
    # 4. Verify real data
    if verify_real_data():
        success_count += 1
    
    print("\n" + "=" * 50)
    print(f"🎯 Cleanup Complete: {success_count}/{total_tasks} tasks successful")
    
    if success_count == total_tasks:
        print("✅ All test data cleaned up successfully!")
        print("🚀 Database now contains only real LGM data")
    else:
        print("⚠️  Some cleanup tasks failed - check the details above")
    
    return success_count == total_tasks

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 