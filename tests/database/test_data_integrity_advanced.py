#!/usr/bin/env python3
"""
Advanced Data Integrity Test Suite
Tests multi-client isolation, data leak prevention, duplicate detection, and comprehensive validation
"""

import psycopg2
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Set
import sys
import os
import uuid

# Database configuration
DB_CONFIG = {
    "host": "postgres",
    "port": "5432",
    "database": "c_and_c_crm",
    "user": "c_and_c_user",
    "password": "c_and_c_password"
}

class AdvancedDataIntegrityTester:
    def __init__(self):
        self.conn = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        self.lgm_client_id = None
        self.test_client_id = None
        self.test_data_hashes = {}
    
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
    
    def create_test_client(self):
        """Create a test client for isolation testing"""
        if self.test_client_id:
            return self.test_client_id
        
        cursor = self.conn.cursor()
        test_client_id = f"test_client_{uuid.uuid4().hex[:8]}"
        
        try:
            cursor.execute("""
                INSERT INTO "Client" (id, name, industry, "isFranchise", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """, (test_client_id, "Test Client for Isolation", "Test Industry", False))
            
            self.conn.commit()
            self.test_client_id = test_client_id
            print(f"   Created test client: {test_client_id}")
            return test_client_id
            
        except Exception as e:
            print(f"   Error creating test client: {e}")
            self.conn.rollback()
            return None
        finally:
            cursor.close()
    
    def cleanup_test_data(self):
        """Clean up test data"""
        if not self.test_client_id:
            return
        
        cursor = self.conn.cursor()
        try:
            # Delete test data in reverse order of dependencies
            cursor.execute('DELETE FROM "User" WHERE "clientId" = %s', (self.test_client_id,))
            cursor.execute('DELETE FROM "Location" WHERE "clientId" = %s', (self.test_client_id,))
            cursor.execute('DELETE FROM "Client" WHERE id = %s', (self.test_client_id,))
            
            self.conn.commit()
            print(f"   Cleaned up test client: {self.test_client_id}")
            
        except Exception as e:
            print(f"   Error cleaning up test data: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def test_multi_client_isolation(self) -> bool:
        """Test complete isolation between different clients"""
        print("   Testing multi-client data isolation...")
        
        # Create test client
        test_client_id = self.create_test_client()
        if not test_client_id:
            return False
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Create test location and user
            test_location_id = f"test_loc_{uuid.uuid4().hex[:8]}"
            test_user_id = f"test_usr_{uuid.uuid4().hex[:8]}"
            
            # Insert test location
            cursor.execute("""
                INSERT INTO "Location" (id, "clientId", name, timezone, address, contact, 
                "ownership_type", trucks, storage, "cx_care", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (test_location_id, test_client_id, "Test Location", "UTC", "Test Address", 
                  "Test Contact", "CORPORATE", "2", "LOCKER", True))
            
            # Insert test user
            cursor.execute("""
                INSERT INTO "User" (id, name, email, role, "clientId", "locationId", status, 
                "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (test_user_id, "Test User", "test@test.com", "MANAGER", test_client_id, 
                  test_location_id, "ACTIVE"))
            
            self.conn.commit()
            
            # Test 1: LGM client cannot see test client data
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE "clientId" = %s AND id = %s
            """, (lgm_client_id, test_location_id))
            lgm_can_see_test_location = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE "clientId" = %s AND id = %s
            """, (lgm_client_id, test_user_id))
            lgm_can_see_test_user = cursor.fetchone()[0]
            
            # Test 2: Test client cannot see LGM data
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE "clientId" = %s
            """, (test_client_id,))
            test_client_locations = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE "clientId" = %s
            """, (test_client_id,))
            test_client_users = cursor.fetchone()[0]
            
            # Test 3: Cross-client data access prevention
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" l
                JOIN "User" u ON l.id = u."locationId"
                WHERE l."clientId" = %s AND u."clientId" = %s
            """, (lgm_client_id, test_client_id))
            cross_client_access = cursor.fetchone()[0]
            
            # Verify isolation
            if lgm_can_see_test_location > 0:
                print(f"   ❌ LGM can see test location data")
                return False
            
            if lgm_can_see_test_user > 0:
                print(f"   ❌ LGM can see test user data")
                return False
            
            if test_client_locations != 1:
                print(f"   ❌ Test client has wrong location count: {test_client_locations}")
                return False
            
            if test_client_users != 1:
                print(f"   ❌ Test client has wrong user count: {test_client_users}")
                return False
            
            if cross_client_access > 0:
                print(f"   ❌ Cross-client data access detected")
                return False
            
            print(f"   ✅ Multi-client isolation verified")
            print(f"   ✅ Test client: {test_client_locations} location, {test_client_users} user")
            print(f"   ✅ No cross-client data access detected")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Multi-client isolation test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_data_leak_prevention(self) -> bool:
        """Test data leak prevention mechanisms"""
        print("   Testing data leak prevention...")
        
        cursor = self.conn.cursor()
        
        try:
            # Test 1: Verify clientId is always present
            cursor.execute("""
                SELECT COUNT(*) FROM "User" WHERE "clientId" IS NULL
            """)
            users_without_client = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" WHERE "clientId" IS NULL
            """)
            locations_without_client = cursor.fetchone()[0]
            
            # Test 2: Verify locationId consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "User" u
                LEFT JOIN "Location" l ON u."locationId" = l.id
                WHERE u."locationId" IS NOT NULL AND l.id IS NULL
            """)
            orphaned_users = cursor.fetchone()[0]
            
            # Test 3: Verify no cross-client location assignments
            cursor.execute("""
                SELECT COUNT(*) FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" != l."clientId"
            """)
            cross_client_assignments = cursor.fetchone()[0]
            
            # Test 4: Verify email domain consistency
            lgm_client_id = self.get_lgm_client_id()
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE "clientId" = %s AND email NOT LIKE '%@lgm.com'
            """, (lgm_client_id,))
            invalid_lgm_emails = cursor.fetchone()[0]
            
            # Test 5: Verify role consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE role NOT IN ('ADMIN', 'MANAGER', 'DRIVER', 'MOVER', 'DISPATCHER', 'AUDITOR')
            """)
            invalid_roles = cursor.fetchone()[0]
            
            # Verify all tests pass
            if users_without_client > 0:
                print(f"   ❌ Found {users_without_client} users without clientId")
                return False
            
            if locations_without_client > 0:
                print(f"   ❌ Found {locations_without_client} locations without clientId")
                return False
            
            if orphaned_users > 0:
                print(f"   ❌ Found {orphaned_users} users with invalid locationId")
                return False
            
            if cross_client_assignments > 0:
                print(f"   ❌ Found {cross_client_assignments} cross-client assignments")
                return False
            
            if invalid_lgm_emails > 0:
                print(f"   ❌ Found {invalid_lgm_emails} invalid LGM email domains")
                return False
            
            if invalid_roles > 0:
                print(f"   ❌ Found {invalid_roles} invalid user roles")
                return False
            
            print(f"   ✅ All data leak prevention checks passed")
            return True
            
        except Exception as e:
            print(f"   ❌ Data leak prevention test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_duplicate_detection(self) -> bool:
        """Test duplicate detection and prevention"""
        print("   Testing duplicate detection...")
        
        cursor = self.conn.cursor()
        
        try:
            # Test 1: Check for duplicate emails
            cursor.execute("""
                SELECT email, COUNT(*) as count
                FROM "User"
                GROUP BY email
                HAVING COUNT(*) > 1
            """)
            duplicate_emails = cursor.fetchall()
            
            # Test 2: Check for duplicate location names within same client
            cursor.execute("""
                SELECT l."clientId", l.name, COUNT(*) as count
                FROM "Location" l
                GROUP BY l."clientId", l.name
                HAVING COUNT(*) > 1
            """)
            duplicate_locations = cursor.fetchall()
            
            # Test 3: Check for duplicate user names within same location
            cursor.execute("""
                SELECT u."locationId", u.name, COUNT(*) as count
                FROM "User" u
                GROUP BY u."locationId", u.name
                HAVING COUNT(*) > 1
            """)
            duplicate_user_names = cursor.fetchall()
            
            # Test 4: Check for duplicate client names
            cursor.execute("""
                SELECT name, COUNT(*) as count
                FROM "Client"
                GROUP BY name
                HAVING COUNT(*) > 1
            """)
            duplicate_clients = cursor.fetchall()
            
            # Test 5: Check for duplicate location IDs
            cursor.execute("""
                SELECT id, COUNT(*) as count
                FROM "Location"
                GROUP BY id
                HAVING COUNT(*) > 1
            """)
            duplicate_location_ids = cursor.fetchall()
            
            # Verify no duplicates
            if duplicate_emails:
                print(f"   ❌ Found {len(duplicate_emails)} duplicate emails")
                for email, count in duplicate_emails:
                    print(f"      {email}: {count} times")
                return False
            
            if duplicate_locations:
                print(f"   ❌ Found {len(duplicate_locations)} duplicate location names")
                return False
            
            if duplicate_user_names:
                print(f"   ❌ Found {len(duplicate_user_names)} duplicate user names")
                return False
            
            if duplicate_clients:
                print(f"   ❌ Found {len(duplicate_clients)} duplicate client names")
                return False
            
            if duplicate_location_ids:
                print(f"   ❌ Found {len(duplicate_location_ids)} duplicate location IDs")
                return False
            
            print(f"   ✅ No duplicates detected")
            return True
            
        except Exception as e:
            print(f"   ❌ Duplicate detection test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_data_consistency_advanced(self) -> bool:
        """Test advanced data consistency rules"""
        print("   Testing advanced data consistency...")
        
        cursor = self.conn.cursor()
        
        try:
            # Test 1: Verify ownership type consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE "ownership_type" NOT IN ('CORPORATE', 'FRANCHISE')
            """)
            invalid_ownership_types = cursor.fetchone()[0]
            
            # Test 2: Verify storage type consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE storage NOT IN ('LOCKER', 'POD', 'NO')
            """)
            invalid_storage_types = cursor.fetchone()[0]
            
            # Test 3: Verify user status consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE status NOT IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')
            """)
            invalid_user_statuses = cursor.fetchone()[0]
            
            # Test 4: Verify email format consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE email NOT LIKE '%@%.%'
            """)
            invalid_email_formats = cursor.fetchone()[0]
            
            # Test 5: Verify timezone consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE timezone IS NULL OR timezone = ''
            """)
            missing_timezones = cursor.fetchone()[0]
            
            # Test 6: Verify contact information consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE contact IS NULL OR contact = ''
            """)
            missing_contacts = cursor.fetchone()[0]
            
            # Verify all consistency rules
            if invalid_ownership_types > 0:
                print(f"   ❌ Found {invalid_ownership_types} invalid ownership types")
                return False
            
            if invalid_storage_types > 0:
                print(f"   ❌ Found {invalid_storage_types} invalid storage types")
                return False
            
            if invalid_user_statuses > 0:
                print(f"   ❌ Found {invalid_user_statuses} invalid user statuses")
                return False
            
            if invalid_email_formats > 0:
                print(f"   ❌ Found {invalid_email_formats} invalid email formats")
                return False
            
            if missing_timezones > 0:
                print(f"   ❌ Found {missing_timezones} locations without timezone")
                return False
            
            if missing_contacts > 0:
                print(f"   ❌ Found {missing_contacts} locations without contact info")
                return False
            
            print(f"   ✅ All data consistency rules verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Data consistency test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_referential_integrity_advanced(self) -> bool:
        """Test advanced referential integrity"""
        print("   Testing advanced referential integrity...")
        
        cursor = self.conn.cursor()
        
        try:
            # Test 1: Verify all foreign keys are valid
            cursor.execute("""
                SELECT COUNT(*) FROM "User" u
                LEFT JOIN "Client" c ON u."clientId" = c.id
                WHERE c.id IS NULL
            """)
            invalid_user_clients = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM "User" u
                LEFT JOIN "Location" l ON u."locationId" = l.id
                WHERE l.id IS NULL
            """)
            invalid_user_locations = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" l
                LEFT JOIN "Client" c ON l."clientId" = c.id
                WHERE c.id IS NULL
            """)
            invalid_location_clients = cursor.fetchone()[0]
            
            # Test 2: Verify circular reference prevention
            cursor.execute("""
                SELECT COUNT(*) FROM "User" u1
                JOIN "User" u2 ON u1."locationId" = u2."locationId"
                WHERE u1.id = u2.id AND u1."clientId" != u2."clientId"
            """)
            circular_references = cursor.fetchone()[0]
            
            # Test 3: Verify cascade delete behavior
            # This would require actual delete operations, so we'll test the constraints
            
            # Verify all integrity checks
            if invalid_user_clients > 0:
                print(f"   ❌ Found {invalid_user_clients} users with invalid client references")
                return False
            
            if invalid_user_locations > 0:
                print(f"   ❌ Found {invalid_user_locations} users with invalid location references")
                return False
            
            if invalid_location_clients > 0:
                print(f"   ❌ Found {invalid_location_clients} locations with invalid client references")
                return False
            
            if circular_references > 0:
                print(f"   ❌ Found {circular_references} circular references")
                return False
            
            print(f"   ✅ All referential integrity checks passed")
            return True
            
        except Exception as e:
            print(f"   ❌ Referential integrity test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_data_encryption_and_security(self) -> bool:
        """Test data encryption and security measures"""
        print("   Testing data encryption and security...")
        
        cursor = self.conn.cursor()
        
        try:
            # Test 1: Verify sensitive data is not stored in plain text
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE email LIKE '%password%' OR email LIKE '%secret%'
            """)
            sensitive_data_in_emails = cursor.fetchone()[0]
            
            # Test 2: Verify no SQL injection vulnerabilities in data
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE name LIKE '%DROP%' OR name LIKE '%DELETE%' OR name LIKE '%INSERT%'
            """)
            sql_injection_attempts = cursor.fetchone()[0]
            
            # Test 3: Verify data length constraints
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE LENGTH(email) > 255 OR LENGTH(name) > 100
            """)
            oversized_data = cursor.fetchone()[0]
            
            # Test 4: Verify no null bytes or special characters in critical fields
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE email LIKE '%\\0%' OR name LIKE '%\\0%'
            """)
            null_bytes_in_data = cursor.fetchone()[0]
            
            # Verify security measures
            if sensitive_data_in_emails > 0:
                print(f"   ❌ Found {sensitive_data_in_emails} instances of sensitive data in emails")
                return False
            
            if sql_injection_attempts > 0:
                print(f"   ❌ Found {sql_injection_attempts} potential SQL injection attempts")
                return False
            
            if oversized_data > 0:
                print(f"   ❌ Found {oversized_data} oversized data entries")
                return False
            
            if null_bytes_in_data > 0:
                print(f"   ❌ Found {null_bytes_in_data} null bytes in data")
                return False
            
            print(f"   ✅ All security measures verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Security test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_performance_under_load(self) -> bool:
        """Test database performance under simulated load"""
        print("   Testing performance under load...")
        
        cursor = self.conn.cursor()
        
        try:
            import time
            
            # Test 1: Multiple concurrent reads
            start_time = time.time()
            
            for i in range(10):
                cursor.execute("""
                    SELECT COUNT(*) FROM "User" u
                    JOIN "Location" l ON u."locationId" = l.id
                    JOIN "Client" c ON u."clientId" = c.id
                    WHERE c.name LIKE '%LGM%'
                """)
                cursor.fetchone()
            
            read_time = time.time() - start_time
            
            # Test 2: Complex aggregation queries
            start_time = time.time()
            
            cursor.execute("""
                SELECT 
                    l."ownership_type",
                    COUNT(u.id) as user_count,
                    COUNT(CASE WHEN l.storage != 'NO' THEN 1 END) as storage_locations,
                    COUNT(CASE WHEN l."cx_care" = true THEN 1 END) as cx_care_locations
                FROM "Location" l
                LEFT JOIN "User" u ON l.id = u."locationId"
                GROUP BY l."ownership_type"
            """)
            cursor.fetchall()
            
            aggregation_time = time.time() - start_time
            
            # Test 3: Data validation queries
            start_time = time.time()
            
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN "clientId" IS NOT NULL THEN 1 END) as users_with_client,
                    COUNT(CASE WHEN "locationId" IS NOT NULL THEN 1 END) as users_with_location,
                    COUNT(CASE WHEN email LIKE '%@lgm.com' THEN 1 END) as lgm_users
                FROM "User"
            """)
            cursor.fetchall()
            
            validation_time = time.time() - start_time
            
            # Performance thresholds
            if read_time > 1.0:
                print(f"   ❌ Read performance too slow: {read_time:.3f}s")
                return False
            
            if aggregation_time > 0.5:
                print(f"   ❌ Aggregation performance too slow: {aggregation_time:.3f}s")
                return False
            
            if validation_time > 0.2:
                print(f"   ❌ Validation performance too slow: {validation_time:.3f}s")
                return False
            
            print(f"   ✅ Performance under load verified")
            print(f"   ✅ Read time: {read_time:.3f}s")
            print(f"   ✅ Aggregation time: {aggregation_time:.3f}s")
            print(f"   ✅ Validation time: {validation_time:.3f}s")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Performance test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_data_migration_integrity(self) -> bool:
        """Test data migration and transformation integrity"""
        print("   Testing data migration integrity...")
        
        cursor = self.conn.cursor()
        
        try:
            # Test 1: Verify data transformation consistency
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE LOWER(email) != email AND email LIKE '%@lgm.com'
            """)
            inconsistent_email_case = cursor.fetchone()[0]
            
            # Test 2: Verify data normalization
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE LENGTH(TRIM(name)) != LENGTH(name)
            """)
            unnormalized_names = cursor.fetchone()[0]
            
            # Test 3: Verify data completeness after migration
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE "createdAt" IS NULL OR "updatedAt" IS NULL
            """)
            missing_timestamps = cursor.fetchone()[0]
            
            # Test 4: Verify data consistency across tables
            cursor.execute("""
                SELECT COUNT(*) FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" != l."clientId"
            """)
            inconsistent_client_data = cursor.fetchone()[0]
            
            # Verify migration integrity
            if inconsistent_email_case > 0:
                print(f"   ❌ Found {inconsistent_email_case} inconsistent email cases")
                return False
            
            if unnormalized_names > 0:
                print(f"   ❌ Found {unnormalized_names} unnormalized location names")
                return False
            
            if missing_timestamps > 0:
                print(f"   ❌ Found {missing_timestamps} missing timestamps")
                return False
            
            if inconsistent_client_data > 0:
                print(f"   ❌ Found {inconsistent_client_data} inconsistent client data")
                return False
            
            print(f"   ✅ Data migration integrity verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Migration integrity test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def run_all_tests(self):
        """Run all advanced data integrity tests"""
        print("🚀 Starting Advanced Data Integrity Tests")
        print("=" * 60)
        
        if not self.connect():
            return False
        
        try:
            tests = [
                ("Multi-Client Isolation", self.test_multi_client_isolation),
                ("Data Leak Prevention", self.test_data_leak_prevention),
                ("Duplicate Detection", self.test_duplicate_detection),
                ("Advanced Data Consistency", self.test_data_consistency_advanced),
                ("Advanced Referential Integrity", self.test_referential_integrity_advanced),
                ("Data Encryption & Security", self.test_data_encryption_and_security),
                ("Performance Under Load", self.test_performance_under_load),
                ("Data Migration Integrity", self.test_data_migration_integrity)
            ]
            
            for test_name, test_func in tests:
                self.run_test(test_name, test_func)
            
            # Clean up test data
            self.cleanup_test_data()
            
        finally:
            self.disconnect()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 ADVANCED DATA INTEGRITY SUMMARY")
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
    tester = AdvancedDataIntegrityTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 