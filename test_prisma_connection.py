#!/usr/bin/env python3
import asyncio
import os
from prisma import Prisma

async def test_prisma_connection():
    print("🔍 Testing Prisma client connection...")
    os.environ["DATABASE_URL"] = "postgresql://c_and_c_user:c_and_c_password@localhost:5432/c_and_c_crm"
    
    try:
        prisma = Prisma()
        await prisma.connect()
        print("✅ Prisma client connected successfully!")
        
        client_count = await prisma.client.count()
        print(f"✅ Database query successful! Clients: {client_count}")
        
        await prisma.disconnect()
        print("✅ Prisma client disconnected successfully!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_prisma_connection())
    print("🎉 All tests passed!" if success else "💥 Tests failed.")
