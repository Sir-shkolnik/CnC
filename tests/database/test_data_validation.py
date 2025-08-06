#!/usr/bin/env python3
"""
Comprehensive Data Validation Test Suite
Tests all LGM data, relationships, business rules, and data quality
"""

import psycopg2
import json
from datetime import datetime
from typing import Dict, List, Any, Tuple
import sys
import os

# Database configuration
DB_CONFIG = {
    "host": "postgres",
    "port": "5432",
    "database": "c_and_c_crm",
    "user": "c_and_c_user",
    "password": "c_and_c_password"
}

class DataValidationTester:
    def __init__(self):
        self.conn = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        self.lgm_client_id = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            print("✅ Database connection established")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("🔌 Database connection closed")
    
    def run_test(self, test_name: str, test_func):
        """Run a test and track results"""
        try:
            print(f"\n🧪 Running: {test_name}")
            result = test_func()
            if result:
                print(f"✅ PASSED: {test_name}")
                self.test_results["passed"] += 1
            else:
                print(f"❌ FAILED: {test_name}")
                self.test_results["failed"] += 1
            return result
        except Exception as e:
            print(f"💥 ERROR in {test_name}: {e}")
            self.test_results["errors"].append(f"{test_name}: {str(e)}")
            self.test_results["failed"] += 1
            return False
    
    def get_lgm_client_id(self):
        """Get LGM client ID"""
        if self.lgm_client_id:
            return self.lgm_client_id
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id FROM "Client" 
            WHERE name LIKE '%LGM%' OR name LIKE '%Let''s Get Moving%'
            LIMIT 1
        """)
        result = cursor.fetchone()
        cursor.close()
        
        if result:
            self.lgm_client_id = result[0]
            return self.lgm_client_id
        return None
    
    def test_lgm_client_data(self) -> bool:
        """Test LGM client data"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, name, industry, "isFranchise", settings
            FROM "Client" 
            WHERE name LIKE '%LGM%' OR name LIKE '%Let''s Get Moving%'
        """)
        clients = cursor.fetchall()
        cursor.close()
        
        if len(clients) == 0:
            print("   No LGM client found")
            return False
        
        client = clients[0]
        client_id, name, industry, is_franchise, settings = client
        
        print(f"   Client ID: {client_id}")
        print(f"   Name: {name}")
        print(f"   Industry: {industry}")
        print(f"   Is Franchise: {is_franchise}")
        
        # Validate expected values
        if "LGM" not in name and "Let's Get Moving" not in name:
            print("   Invalid client name")
            return False
        
        if industry != "Moving & Logistics":
            print(f"   Wrong industry: {industry}")
            return False
        
        if is_franchise:
            print("   Should not be franchise (LGM is corporate)")
            return False
        
        return True
    
    def test_lgm_locations_data(self) -> bool:
        """Test LGM locations data"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                id, name, contact, "ownership_type", trucks, storage, "cx_care",
                "direct_line", "trucks_shared_with", "storage_pricing"
            FROM "Location" 
            WHERE "clientId" = %s
            ORDER BY name
        """, (lgm_client_id,))
        locations = cursor.fetchall()
        cursor.close()
        
        if len(locations) < 40:
            print(f"   Only {len(locations)} locations found (expected ~43)")
            return False
        
        print(f"   Found {len(locations)} LGM locations")
        
        # Test specific locations
        location_names = [loc[1] for loc in locations]
        expected_corporate = ["VANCOUVER", "BURNABY", "DOWNTOWN TORONTO", "EDMONTON", "HAMILTON", "MISSISSAUGA", "MONTREAL", "NORTH YORK (TORONTO)"]
        
        missing_corporate = [name for name in expected_corporate if name not in location_names]
        if missing_corporate:
            print(f"   Missing corporate locations: {missing_corporate}")
            return False
        
        # Test data quality
        locations_with_contact = [loc for loc in locations if loc[2] and loc[2] != "N/A"]
        locations_with_storage = [loc for loc in locations if loc[5] and loc[5] != "NO"]
        
        print(f"   Locations with contact info: {len(locations_with_contact)}/{len(locations)}")
        print(f"   Locations with storage: {len(locations_with_storage)}/{len(locations)}")
        
        # Test ownership types
        corporate_count = len([loc for loc in locations if loc[3] == "CORPORATE"])
        franchise_count = len([loc for loc in locations if loc[3] == "FRANCHISE"])
        
        print(f"   Corporate locations: {corporate_count}")
        print(f"   Franchise locations: {franchise_count}")
        
        if corporate_count < 8:
            print(f"   Too few corporate locations: {corporate_count}")
            return False
        
        return True
    
    def test_lgm_users_data(self) -> bool:
        """Test LGM users data"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                id, name, email, role, "locationId", status
            FROM "User" 
            WHERE "clientId" = %s
            ORDER BY name
        """, (lgm_client_id,))
        users = cursor.fetchall()
        cursor.close()
        
        if len(users) < 30:
            print(f"   Only {len(users)} users found (expected ~37)")
            return False
        
        print(f"   Found {len(users)} LGM users")
        
        # Test role distribution
        roles = {}
        for user in users:
            role = user[3]
            roles[role] = roles.get(role, 0) + 1
        
        print(f"   Role distribution: {roles}")
        
        # Test email format
        invalid_emails = [user for user in users if not user[2].endswith('@lgm.com')]
        if invalid_emails:
            print(f"   Found {len(invalid_emails)} users with invalid email format")
            return False
        
        # Test that all users have locationId
        users_without_location = [user for user in users if not user[4]]
        if users_without_location:
            print(f"   Found {len(users_without_location)} users without locationId")
            return False
        
        # Test specific users
        user_names = [user[1] for user in users]
        expected_users = ["ANKIT", "ARSHDEEP", "SHAHBAZ", "DANYLO", "HAKAM", "BHANU"]
        
        missing_users = [name for name in expected_users if name not in user_names]
        if missing_users:
            print(f"   Missing expected users: {missing_users}")
            return False
        
        return True
    
    def test_location_user_relationships(self) -> bool:
        """Test relationships between locations and users"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                l.name as location_name,
                l.contact as location_contact,
                COUNT(u.id) as user_count
            FROM "Location" l
            LEFT JOIN "User" u ON l.id = u."locationId"
            WHERE l."clientId" = %s
            GROUP BY l.id, l.name, l.contact
            ORDER BY l.name
        """, (lgm_client_id,))
        location_users = cursor.fetchall()
        cursor.close()
        
        print(f"   Location-User relationships:")
        
        locations_without_users = [loc for loc in location_users if loc[2] == 0]
        if locations_without_users:
            print(f"   Locations without users: {[loc[0] for loc in locations_without_users]}")
            return False
        
        # Test specific location-user mappings
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                l.name as location_name,
                l.contact as location_contact,
                u.name as user_name,
                u.role as user_role
            FROM "Location" l
            JOIN "User" u ON l.id = u."locationId"
            WHERE l."clientId" = %s AND l.contact IS NOT NULL AND l.contact != 'N/A'
            ORDER BY l.name, u.name
        """, (lgm_client_id,))
        mappings = cursor.fetchall()
        cursor.close()
        
        print(f"   Found {len(mappings)} location-user mappings")
        
        # Test that contact names match user names
        mismatched_contacts = []
        for mapping in mappings:
            location_name, contact, user_name, role = mapping
            if contact and contact != "N/A":
                # Check if any user name contains the contact name
                contact_matched = any(contact.lower() in user_name.lower() for user_name, _, _, _ in mappings if user_name)
                if not contact_matched:
                    mismatched_contacts.append((location_name, contact))
        
        if mismatched_contacts:
            print(f"   Contact name mismatches: {mismatched_contacts}")
            return False
        
        return True
    
    def test_storage_data_quality(self) -> bool:
        """Test storage data quality"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                storage,
                COUNT(*) as count
            FROM "Location" 
            WHERE "clientId" = %s
            GROUP BY storage
            ORDER BY count DESC
        """, (lgm_client_id,))
        storage_distribution = cursor.fetchall()
        cursor.close()
        
        print(f"   Storage distribution:")
        for storage_type, count in storage_distribution:
            print(f"     {storage_type}: {count}")
        
        # Validate storage types
        valid_storage_types = ["LOCKER", "POD", "NO"]
        invalid_storage = [storage for storage, _ in storage_distribution if storage not in valid_storage_types]
        
        if invalid_storage:
            print(f"   Invalid storage types: {invalid_storage}")
            return False
        
        # Test storage pricing
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                storage,
                "storage_pricing",
                COUNT(*) as count
            FROM "Location" 
            WHERE "clientId" = %s AND storage != 'NO'
            GROUP BY storage, "storage_pricing"
        """, (lgm_client_id,))
        storage_pricing = cursor.fetchall()
        cursor.close()
        
        locations_without_pricing = [loc for loc in storage_pricing if not loc[1]]
        if locations_without_pricing:
            print(f"   Storage locations without pricing: {len(locations_without_pricing)}")
            return False
        
        return True
    
    def test_cx_care_coverage(self) -> bool:
        """Test customer care coverage"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                "cx_care",
                COUNT(*) as count
            FROM "Location" 
            WHERE "clientId" = %s
            GROUP BY "cx_care"
        """, (lgm_client_id,))
        cx_care_distribution = cursor.fetchall()
        cursor.close()
        
        print(f"   CX Care distribution:")
        for cx_care, count in cx_care_distribution:
            status = "Enabled" if cx_care else "Disabled"
            print(f"     {status}: {count}")
        
        # Calculate coverage percentage
        total_locations = sum(count for _, count in cx_care_distribution)
        enabled_locations = sum(count for cx_care, count in cx_care_distribution if cx_care)
        coverage_percentage = (enabled_locations / total_locations) * 100
        
        print(f"   CX Care coverage: {coverage_percentage:.1f}%")
        
        if coverage_percentage < 70:
            print(f"   CX Care coverage too low: {coverage_percentage:.1f}%")
            return False
        
        return True
    
    def test_truck_data_quality(self) -> bool:
        """Test truck data quality"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                name,
                trucks,
                "trucks_shared_with"
            FROM "Location" 
            WHERE "clientId" = %s AND trucks IS NOT NULL AND trucks != ''
            ORDER BY name
        """, (lgm_client_id,))
        truck_data = cursor.fetchall()
        cursor.close()
        
        print(f"   Truck data for {len(truck_data)} locations:")
        
        # Test truck sharing patterns
        shared_truck_locations = [loc for loc in truck_data if loc[2] and loc[2] != ""]
        print(f"   Locations with shared trucks: {len(shared_truck_locations)}")
        
        # Test truck count patterns
        truck_counts = []
        for location_name, trucks, shared_with in truck_data:
            if trucks and trucks != "":
                try:
                    # Extract number from truck string (e.g., "5", "3+", "R+")
                    truck_str = trucks.replace("+", "").replace("R", "").strip()
                    if truck_str.isdigit():
                        truck_counts.append(int(truck_str))
                except:
                    pass
        
        if truck_counts:
            avg_trucks = sum(truck_counts) / len(truck_counts)
            print(f"   Average trucks per location: {avg_trucks:.1f}")
            
            if avg_trucks < 1:
                print(f"   Average trucks too low: {avg_trucks:.1f}")
                return False
        
        return True
    
    def test_data_consistency(self) -> bool:
        """Test overall data consistency"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        # Test 1: All locations have timezone
        cursor.execute("""
            SELECT COUNT(*) FROM "Location" 
            WHERE "clientId" = %s AND (timezone IS NULL OR timezone = '')
        """, (lgm_client_id,))
        locations_without_timezone = cursor.fetchone()[0]
        
        # Test 2: All users have valid status
        cursor.execute("""
            SELECT COUNT(*) FROM "User" 
            WHERE "clientId" = %s AND (status IS NULL OR status = '')
        """, (lgm_client_id,))
        users_without_status = cursor.fetchone()[0]
        
        # Test 3: All locations have ownership type
        cursor.execute("""
            SELECT COUNT(*) FROM "Location" 
            WHERE "clientId" = %s AND ("ownership_type" IS NULL OR "ownership_type" = '')
        """, (lgm_client_id,))
        locations_without_ownership = cursor.fetchone()[0]
        
        cursor.close()
        
        print(f"   Data consistency check:")
        print(f"     Locations without timezone: {locations_without_timezone}")
        print(f"     Users without status: {users_without_status}")
        print(f"     Locations without ownership type: {locations_without_ownership}")
        
        return (locations_without_timezone == 0 and 
                users_without_status == 0 and 
                locations_without_ownership == 0)
    
    def run_all_tests(self):
        """Run all data validation tests"""
        print("🚀 Starting Comprehensive Data Validation Tests")
        print("=" * 60)
        
        if not self.connect():
            return False
        
        tests = [
            ("LGM Client Data", self.test_lgm_client_data),
            ("LGM Locations Data", self.test_lgm_locations_data),
            ("LGM Users Data", self.test_lgm_users_data),
            ("Location-User Relationships", self.test_location_user_relationships),
            ("Storage Data Quality", self.test_storage_data_quality),
            ("CX Care Coverage", self.test_cx_care_coverage),
            ("Truck Data Quality", self.test_truck_data_quality),
            ("Data Consistency", self.test_data_consistency)
        ]
        
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
        
        self.disconnect()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 DATA VALIDATION SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"💥 Errors: {len(self.test_results['errors'])}")
        
        if self.test_results['errors']:
            print("\n🔍 ERRORS:")
            for error in self.test_results['errors']:
                print(f"   - {error}")
        
        success_rate = self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed']) * 100
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return self.test_results['failed'] == 0

if __name__ == "__main__":
    tester = DataValidationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 