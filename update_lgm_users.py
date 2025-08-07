#!/usr/bin/env python3
"""
Update LGM Users Script
Updates the database with real LGM users
"""

import psycopg2
import os

# Database configuration - using environment variables
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "aws-0-us-east-1.pooler.supabase.com"),
    "port": os.getenv("DB_PORT", "6543"),
    "database": os.getenv("DB_NAME", "postgres"),
    "user": os.getenv("DB_USER", "postgres.c_and_c_crm"),
    "password": os.getenv("DB_PASSWORD", "Id200633048!")
}

def update_lgm_users():
    """Update the database with real LGM users"""
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("✅ Connected to database")
        
        # Read and execute the SQL script
        with open('update_to_real_lgm_users.sql', 'r') as file:
            sql_script = file.read()
        
        print("📝 Executing SQL updates...")
        cursor.execute(sql_script)
        conn.commit()
        
        print("✅ Successfully updated LGM users!")
        
        # Verify the changes
        cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE email LIKE '%@lgm.com'")
        count = cursor.fetchone()[0]
        print(f"📊 Total LGM users in database: {count}")
        
        # Show some examples
        cursor.execute("SELECT name, email, role FROM \"User\" WHERE email LIKE '%@lgm.com' LIMIT 5")
        users = cursor.fetchall()
        print("\n👥 Sample LGM users:")
        for user in users:
            print(f"  - {user[0]} ({user[1]}) - {user[2]}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 LGM users update completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Make sure the database is accessible and the SQL file exists")

if __name__ == "__main__":
    update_lgm_users()
