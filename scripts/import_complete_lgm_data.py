#!/usr/bin/env python3
"""
LGM Complete Data Import Script
Imports all missing branches, users, and referral sources with data quality improvements
"""

import asyncio
import httpx
import json
import re
from datetime import datetime
from typing import Dict, List, Optional
import os
import sys

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prisma import Prisma

# SmartMoving API Configuration
SMARTMOVING_API_BASE_URL = "https://api-public.smartmoving.com/v1"
SMARTMOVING_API_KEY = "185840176c73420fbd3a473c2fdccedb"
SMARTMOVING_CLIENT_ID = "5aa72e33-be47-42ba-b59e-aeec01250bb5"

class LGMCompleteDataImporter:
    def __init__(self):
        self.db = Prisma()
        self.client = httpx.AsyncClient()
        self.import_stats = {
            "branches": {"total": 0, "imported": 0, "updated": 0, "errors": 0},
            "users": {"total": 0, "imported": 0, "updated": 0, "errors": 0},
            "referral_sources": {"total": 0, "imported": 0, "updated": 0, "errors": 0}
        }
    
    async def __aenter__(self):
        await self.db.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.db.disconnect()
        await self.client.aclose()
    
    def get_smartmoving_headers(self) -> Dict[str, str]:
        """Get headers for SmartMoving API requests"""
        return {
            "x-api-key": SMARTMOVING_API_KEY,
            "Content-Type": "application/json"
        }
    
    def validate_phone_number(self, phone: str) -> Optional[str]:
        """Validate and standardize phone number format"""
        if not phone:
            return None
        
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone)
        
        # Handle different formats
        if len(digits) == 10:
            return f"+1-{digits[:3]}-{digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"+1-{digits[1:4]}-{digits[4:7]}-{digits[7:]}"
        elif len(digits) > 11:
            # International number
            return f"+{digits}"
        
        return None
    
    def validate_email(self, email: str) -> Optional[str]:
        """Validate email format"""
        if not email:
            return None
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_pattern, email):
            return email.lower()
        
        return None
    
    def validate_gps_coordinates(self, lat: float, lng: float) -> bool:
        """Validate GPS coordinates"""
        return -90 <= lat <= 90 and -180 <= lng <= 180
    
    async def fetch_all_branches(self) -> List[Dict]:
        """Fetch all branches from SmartMoving API"""
        print("🔍 Fetching all branches...")
        
        all_branches = []
        page = 1
        
        while True:
            try:
                response = await self.client.get(
                    f"{SMARTMOVING_API_BASE_URL}/api/branches",
                    headers=self.get_smartmoving_headers(),
                    params={"page": page, "pageSize": 200}
                )
                response.raise_for_status()
                
                data = response.json()
                branches = data.get("data", {}).get("pageResults", [])
                
                if not branches:
                    break
                
                all_branches.extend(branches)
                print(f"📄 Fetched page {page}: {len(branches)} branches")
                
                if data.get("data", {}).get("lastPage", False):
                    break
                
                page += 1
                
            except Exception as e:
                print(f"❌ Error fetching branches page {page}: {e}")
                break
        
        print(f"✅ Total branches fetched: {len(all_branches)}")
        return all_branches
    
    async def fetch_all_users(self) -> List[Dict]:
        """Fetch all users from SmartMoving API"""
        print("🔍 Fetching all users...")
        
        all_users = []
        page = 1
        
        while True:
            try:
                response = await self.client.get(
                    f"{SMARTMOVING_API_BASE_URL}/api/users",
                    headers=self.get_smartmoving_headers(),
                    params={"page": page, "pageSize": 200}
                )
                response.raise_for_status()
                
                data = response.json()
                users = data.get("data", {}).get("pageResults", [])
                
                if not users:
                    break
                
                all_users.extend(users)
                print(f"📄 Fetched page {page}: {len(users)} users")
                
                if data.get("data", {}).get("lastPage", False):
                    break
                
                page += 1
                
            except Exception as e:
                print(f"❌ Error fetching users page {page}: {e}")
                break
        
        print(f"✅ Total users fetched: {len(all_users)}")
        return all_users
    
    async def fetch_all_referral_sources(self) -> List[Dict]:
        """Fetch all referral sources from SmartMoving API"""
        print("🔍 Fetching all referral sources...")
        
        all_sources = []
        page = 1
        
        while True:
            try:
                response = await self.client.get(
                    f"{SMARTMOVING_API_BASE_URL}/api/referral-sources",
                    headers=self.get_smartmoving_headers(),
                    params={"page": page, "pageSize": 200}
                )
                response.raise_for_status()
                
                data = response.json()
                sources = data.get("data", {}).get("pageResults", [])
                
                if not sources:
                    break
                
                all_sources.extend(sources)
                print(f"📄 Fetched page {page}: {len(sources)} referral sources")
                
                if data.get("data", {}).get("lastPage", False):
                    break
                
                page += 1
                
            except Exception as e:
                print(f"❌ Error fetching referral sources page {page}: {e}")
                break
        
        print(f"✅ Total referral sources fetched: {len(all_sources)}")
        return all_sources
    
    async def import_branches(self, branches: List[Dict]):
        """Import branches with data quality improvements"""
        print(f"\n🏢 Importing {len(branches)} branches...")
        
        self.import_stats["branches"]["total"] = len(branches)
        
        for branch in branches:
            try:
                # Data quality improvements
                phone = self.validate_phone_number(branch.get("phoneNumber"))
                email = self.validate_email(branch.get("emailAddress"))
                
                # Validate GPS coordinates
                lat = branch.get("latitude")
                lng = branch.get("longitude")
                gps_valid = lat and lng and self.validate_gps_coordinates(lat, lng)
                
                # Prepare branch data
                branch_data = {
                    "externalId": branch.get("id"),
                    "name": branch.get("name", "").strip(),
                    "address": branch.get("address", "").strip(),
                    "phoneNumber": phone,
                    "emailAddress": email,
                    "latitude": lat if gps_valid else None,
                    "longitude": lng if gps_valid else None,
                    "isPrimary": branch.get("isPrimary", False),
                    "isActive": branch.get("isActive", True),
                    "timeZone": branch.get("timeZone"),
                    "operatingHours": branch.get("operatingHours"),
                    "companyIntegrationId": "lgm-integration",  # Default LGM integration
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
                
                # Check if branch already exists
                existing = await self.db.companybranch.find_first(
                    where={
                        "externalId": branch_data["externalId"],
                        "companyIntegrationId": "lgm-integration"
                    }
                )
                
                if existing:
                    # Update existing branch
                    await self.db.companybranch.update(
                        where={"id": existing.id},
                        data=branch_data
                    )
                    self.import_stats["branches"]["updated"] += 1
                    print(f"🔄 Updated branch: {branch_data['name']}")
                else:
                    # Create new branch
                    await self.db.companybranch.create(data=branch_data)
                    self.import_stats["branches"]["imported"] += 1
                    print(f"✅ Imported branch: {branch_data['name']}")
                
            except Exception as e:
                self.import_stats["branches"]["errors"] += 1
                print(f"❌ Error importing branch {branch.get('name', 'Unknown')}: {e}")
    
    async def import_users(self, users: List[Dict]):
        """Import users with data quality improvements"""
        print(f"\n👥 Importing {len(users)} users...")
        
        self.import_stats["users"]["total"] = len(users)
        
        for user in users:
            try:
                # Data quality improvements
                phone = self.validate_phone_number(user.get("phoneNumber"))
                email = self.validate_email(user.get("emailAddress"))
                
                # Validate primary branch
                primary_branch = user.get("primaryBranch")
                branch_id = None
                if primary_branch:
                    branch = await self.db.companybranch.find_first(
                        where={
                            "externalId": primary_branch.get("id"),
                            "companyIntegrationId": "lgm-integration"
                        }
                    )
                    if branch:
                        branch_id = branch.id
                
                # Prepare user data
                user_data = {
                    "externalId": user.get("id"),
                    "name": user.get("name", "").strip(),
                    "emailAddress": email,
                    "title": user.get("title", "").strip(),
                    "phoneNumber": phone,
                    "role": user.get("role", "Unknown"),
                    "isActive": user.get("isActive", True),
                    "primaryBranchId": branch_id,
                    "companyIntegrationId": "lgm-integration",
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
                
                # Check if user already exists
                existing = await self.db.companyuser.find_first(
                    where={
                        "externalId": user_data["externalId"],
                        "companyIntegrationId": "lgm-integration"
                    }
                )
                
                if existing:
                    # Update existing user
                    await self.db.companyuser.update(
                        where={"id": existing.id},
                        data=user_data
                    )
                    self.import_stats["users"]["updated"] += 1
                    print(f"🔄 Updated user: {user_data['name']}")
                else:
                    # Create new user
                    await self.db.companyuser.create(data=user_data)
                    self.import_stats["users"]["imported"] += 1
                    print(f"✅ Imported user: {user_data['name']}")
                
            except Exception as e:
                self.import_stats["users"]["errors"] += 1
                print(f"❌ Error importing user {user.get('name', 'Unknown')}: {e}")
    
    async def import_referral_sources(self, sources: List[Dict]):
        """Import referral sources with data quality improvements"""
        print(f"\n📈 Importing {len(sources)} referral sources...")
        
        self.import_stats["referral_sources"]["total"] = len(sources)
        
        for source in sources:
            try:
                # Prepare referral source data
                source_data = {
                    "externalId": source.get("id"),
                    "name": source.get("name", "").strip(),
                    "description": source.get("description", "").strip(),
                    "isPublic": source.get("isPublic", True),
                    "isLeadProvider": source.get("isLeadProvider", False),
                    "category": self.categorize_referral_source(source.get("name", "")),
                    "companyIntegrationId": "lgm-integration",
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
                
                # Check if source already exists
                existing = await self.db.companyreferralsource.find_first(
                    where={
                        "externalId": source_data["externalId"],
                        "companyIntegrationId": "lgm-integration"
                    }
                )
                
                if existing:
                    # Update existing source
                    await self.db.companyreferralsource.update(
                        where={"id": existing.id},
                        data=source_data
                    )
                    self.import_stats["referral_sources"]["updated"] += 1
                    print(f"🔄 Updated referral source: {source_data['name']}")
                else:
                    # Create new source
                    await self.db.companyreferralsource.create(data=source_data)
                    self.import_stats["referral_sources"]["imported"] += 1
                    print(f"✅ Imported referral source: {source_data['name']}")
                
            except Exception as e:
                self.import_stats["referral_sources"]["errors"] += 1
                print(f"❌ Error importing referral source {source.get('name', 'Unknown')}: {e}")
    
    def categorize_referral_source(self, name: str) -> str:
        """Categorize referral source based on name"""
        name_lower = name.lower()
        
        if any(word in name_lower for word in ["google", "seo", "search"]):
            return "Search Engine"
        elif any(word in name_lower for word in ["facebook", "instagram", "social"]):
            return "Social Media"
        elif any(word in name_lower for word in ["yelp", "review", "rating"]):
            return "Review Platform"
        elif any(word in name_lower for word in ["referral", "word", "mouth"]):
            return "Referral"
        elif any(word in name_lower for word in ["advertisement", "ad", "marketing"]):
            return "Advertising"
        else:
            return "Other"
    
    def print_import_summary(self):
        """Print comprehensive import summary"""
        print("\n" + "="*60)
        print("📊 LGM COMPLETE DATA IMPORT SUMMARY")
        print("="*60)
        
        for data_type, stats in self.import_stats.items():
            print(f"\n{data_type.replace('_', ' ').title()}:")
            print(f"  Total: {stats['total']}")
            print(f"  Imported: {stats['imported']}")
            print(f"  Updated: {stats['updated']}")
            print(f"  Errors: {stats['errors']}")
            print(f"  Success Rate: {((stats['imported'] + stats['updated']) / stats['total'] * 100):.1f}%" if stats['total'] > 0 else "  Success Rate: 0%")
        
        total_imported = sum(stats['imported'] for stats in self.import_stats.values())
        total_updated = sum(stats['updated'] for stats in self.import_stats.values())
        total_errors = sum(stats['errors'] for stats in self.import_stats.values())
        total_records = sum(stats['total'] for stats in self.import_stats.values())
        
        print(f"\n🎯 OVERALL SUMMARY:")
        print(f"  Total Records Processed: {total_records}")
        print(f"  Successfully Imported: {total_imported}")
        print(f"  Successfully Updated: {total_updated}")
        print(f"  Errors: {total_errors}")
        print(f"  Overall Success Rate: {((total_imported + total_updated) / total_records * 100):.1f}%" if total_records > 0 else "  Overall Success Rate: 0%")
        
        print("\n✅ Data completeness gaps have been addressed!")
        print("🚀 Ready for Phase 2: Daily Job Pipeline implementation")

async def main():
    """Main function to run the complete data import"""
    print("🚀 Starting LGM Complete Data Import...")
    print("📋 This will import all missing branches, users, and referral sources")
    print("🔧 Includes data quality improvements and validation")
    
    async with LGMCompleteDataImporter() as importer:
        try:
            # Fetch all data from SmartMoving API
            branches = await importer.fetch_all_branches()
            users = await importer.fetch_all_users()
            referral_sources = await importer.fetch_all_referral_sources()
            
            # Import data with quality improvements
            await importer.import_branches(branches)
            await importer.import_users(users)
            await importer.import_referral_sources(referral_sources)
            
            # Print summary
            importer.print_import_summary()
            
        except Exception as e:
            print(f"❌ Fatal error during import: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(main())
