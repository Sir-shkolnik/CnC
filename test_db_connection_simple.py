#!/usr/bin/env python3
"""
Simple Database Connection Test
Test if Prisma can connect to the database
"""

import asyncio
import os
from prisma import Prisma

async def test_connection():
    """Test database connection"""
    print("🔌 Testing database connection...")
    
    try:
        # Initialize Prisma
        db = Prisma()
        
        # Try to connect
        print("📡 Connecting to database...")
        await db.connect()
        print("✅ Database connection successful!")
        
        # Test a simple query
        print("🔍 Testing basic query...")
        user_count = await db.user.count()
        print(f"✅ Found {user_count} users in database")
        
        # Test location query
        location_count = await db.location.count()
        print(f"✅ Found {location_count} locations in database")
        
        # Test client query
        client_count = await db.client.count()
        print(f"✅ Found {client_count} clients in database")
        
        await db.disconnect()
        print("✅ Database connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

async def test_schema():
    """Test if we can access the schema"""
    print("\n📋 Testing schema access...")
    
    try:
        db = Prisma()
        await db.connect()
        
        # Test if we can access the schema
        print("🔍 Testing schema models...")
        
        # List available models
        models = dir(db)
        model_names = [m for m in models if not m.startswith('_') and m not in ['connect', 'disconnect', 'get_engine']]
        
        print(f"✅ Available models: {', '.join(model_names)}")
        
        await db.disconnect()
        return True
        
    except Exception as e:
        print(f"❌ Schema test failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting C&C CRM Database Connection Test")
    print("=" * 50)
    
    # Check environment
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("⚠️  No DATABASE_URL found in environment")
        print("   Please set DATABASE_URL before running this test")
        return False
    
    print(f"📍 Database URL: {db_url[:20]}...")
    
    # Test connection
    connection_ok = await test_connection()
    
    # Test schema
    schema_ok = await test_schema()
    
    print("\n" + "=" * 50)
    if connection_ok and schema_ok:
        print("🎉 All tests passed! Database is ready for production.")
        return True
    else:
        print("❌ Some tests failed. Please check your database configuration.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
