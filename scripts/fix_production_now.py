#!/usr/bin/env python3
"""
Quick Production Database Fix
Purpose: Directly connect to production database and fix all issues
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import json
from datetime import datetime

def fix_production_via_api():
    """Fix production database via API calls"""
    print("🚀 FIXING PRODUCTION DATABASE VIA API")
    print("=" * 50)
    
    base_url = "https://c-and-c-crm-api.onrender.com"
    
    # Step 1: Try the database setup endpoint
    print("📊 Setting up database...")
    response = requests.post(f"{base_url}/setup/database", headers={"Content-Type": "application/json"})
    print(f"Response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Database setup: {data}")
    else:
        print(f"❌ Database setup failed: {response.text}")
    
    # Step 2: Try the update users endpoint
    print("\n👥 Updating users...")
    response = requests.post(f"{base_url}/setup/update-users", headers={"Content-Type": "application/json"})
    print(f"Response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Users update: {data}")
    else:
        print(f"❌ Users update failed: {response.text}")
    
    # Step 3: Check health
    print("\n🏥 Checking API health...")
    response = requests.get(f"{base_url}/health")
    print(f"Response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ API Health: {data}")
    else:
        print(f"❌ API Health check failed: {response.text}")

def main():
    """Main function"""
    print("🔧 QUICK PRODUCTION FIX")
    print("=" * 50)
    
    try:
        fix_production_via_api()
        print("\n🎉 Production fix completed!")
        print("🌐 Check: https://c-and-c-crm-frontend.onrender.com")
        print("👤 Login: shahbaz@lgm.com / 1234")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
