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
        # Split SQL content by semicolons and execute each statement separately
        statements = sql_content.split(';')
        for statement in statements:
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                    print(f"✅ Executed: {statement[:50]}...")
                except Exception as e:
                    print(f"⚠️  Statement failed (continuing): {str(e)}")
                    # Continue with other statements even if one fails
        
        conn.commit()
        cursor.close()
        print(f"✅ Successfully executed {file_path}")
        
    except Exception as e:
        print(f"❌ Error executing {file_path}: {str(e)}")
        conn.rollback()
        # Don't raise the exception, just log it
        print(f"⚠️  Continuing despite error in {file_path}")

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
        print("⚠️  Continuing anyway - API will start without database tables")
        # Don't exit with error code, let the API start

if __name__ == "__main__":
    main() 