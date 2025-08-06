#!/usr/bin/env python3
"""
Database Migration Script for C&C CRM
Runs SQL migrations to set up the database schema
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
        sys.exit(1)
    
    return psycopg2.connect(DATABASE_URL)

def run_sql_file(conn, file_path):
    """Run a SQL file against the database"""
    try:
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        cursor = conn.cursor()
        cursor.execute(sql_content)
        conn.commit()
        cursor.close()
        print(f"✅ Successfully executed {file_path}")
        
    except Exception as e:
        print(f"❌ Error executing {file_path}: {str(e)}")
        conn.rollback()
        raise

def main():
    """Main migration function"""
    print("🚀 Starting C&C CRM Database Migrations...")
    
    try:
        # Connect to database
        conn = get_db_connection()
        print("✅ Connected to database")
        
        # Run migrations in order
        migration_files = [
            "prisma/create_schema.sql",
            "prisma/super_admin_schema.sql", 
            "prisma/seed_data.sql"
        ]
        
        for migration_file in migration_files:
            if os.path.exists(migration_file):
                print(f"📝 Running migration: {migration_file}")
                run_sql_file(conn, migration_file)
            else:
                print(f"⚠️  Migration file not found: {migration_file}")
        
        conn.close()
        print("✅ All migrations completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 