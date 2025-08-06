#!/usr/bin/env python3
"""
Comprehensive Database Structure Test Suite
Tests all tables, columns, relationships, constraints, and data integrity
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

class DatabaseStructureTester:
    def __init__(self):
        self.conn = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
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
    
    def test_table_existence(self) -> bool:
        """Test that all required tables exist"""
        expected_tables = [
            "Client", "Location", "User", "TruckJourney", "JourneyEntry",
            "AssignedCrew", "Media", "AuditEntry", "MoveSource",
            "super_admin_users", "super_admin_sessions", "company_access_logs"
        ]
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        existing_tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        missing_tables = [table for table in expected_tables if table not in existing_tables]
        extra_tables = [table for table in existing_tables if table not in expected_tables]
        
        if missing_tables:
            print(f"   Missing tables: {missing_tables}")
        if extra_tables:
            print(f"   Extra tables: {extra_tables}")
        
        return len(missing_tables) == 0
    
    def test_client_table_structure(self) -> bool:
        """Test Client table structure"""
        expected_columns = {
            "id": "text",
            "name": "text", 
            "industry": "text",
            "isFranchise": "boolean",
            "settings": "jsonb",
            "createdAt": "timestamp without time zone",
            "updatedAt": "timestamp without time zone"
        }
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'Client' AND table_schema = 'public'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        cursor.close()
        
        actual_columns = {col[0]: col[1] for col in columns}
        
        for col, expected_type in expected_columns.items():
            if col not in actual_columns:
                print(f"   Missing column: {col}")
                return False
            if expected_type not in actual_columns[col]:
                print(f"   Wrong type for {col}: expected {expected_type}, got {actual_columns[col]}")
                return False
        
        return True
    
    def test_location_table_structure(self) -> bool:
        """Test Location table structure"""
        expected_columns = {
            "id": "text",
            "clientId": "text",
            "name": "text",
            "timezone": "text",
            "address": "text",
            "contact": "text",
            "direct_line": "text",
            "ownership_type": "text",
            "trucks": "text",
            "trucks_shared_with": "text",
            "storage": "text",
            "storage_pricing": "text",
            "cx_care": "boolean"
        }
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'Location' AND table_schema = 'public'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        cursor.close()
        
        actual_columns = {col[0]: col[1] for col in columns}
        
        for col, expected_type in expected_columns.items():
            if col not in actual_columns:
                print(f"   Missing column: {col}")
                return False
            if expected_type not in actual_columns[col]:
                print(f"   Wrong type for {col}: expected {expected_type}, got {actual_columns[col]}")
                return False
        
        return True
    
    def test_user_table_structure(self) -> bool:
        """Test User table structure"""
        expected_columns = {
            "id": "text",
            "name": "text",
            "email": "text",
            "role": "text",
            "clientId": "text",
            "locationId": "text",
            "status": "text",
            "createdAt": "timestamp without time zone",
            "updatedAt": "timestamp without time zone"
        }
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'User' AND table_schema = 'public'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        cursor.close()
        
        actual_columns = {col[0]: col[1] for col in columns}
        
        for col, expected_type in expected_columns.items():
            if col not in actual_columns:
                print(f"   Missing column: {col}")
                return False
            if expected_type not in actual_columns[col]:
                print(f"   Wrong type for {col}: expected {expected_type}, got {actual_columns[col]}")
                return False
        
        return True
    
    def test_foreign_key_constraints(self) -> bool:
        """Test foreign key constraints"""
        expected_fks = [
            ("Location", "clientId", "Client", "id"),
            ("User", "clientId", "Client", "id"),
            ("User", "locationId", "Location", "id"),
            ("TruckJourney", "clientId", "Client", "id"),
            ("TruckJourney", "locationId", "Location", "id"),
            ("JourneyEntry", "journeyId", "TruckJourney", "id"),
            ("AssignedCrew", "journeyId", "TruckJourney", "id"),
            ("AssignedCrew", "userId", "User", "id"),
            ("Media", "journeyId", "TruckJourney", "id"),
            ("AuditEntry", "clientId", "Client", "id"),
            ("AuditEntry", "locationId", "Location", "id"),
            ("AuditEntry", "userId", "User", "id")
        ]
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = 'public'
        """)
        actual_fks = cursor.fetchall()
        cursor.close()
        
        actual_fk_set = {(fk[0], fk[1], fk[2], fk[3]) for fk in actual_fks}
        expected_fk_set = {tuple(fk) for fk in expected_fks}
        
        missing_fks = expected_fk_set - actual_fk_set
        extra_fks = actual_fk_set - expected_fk_set
        
        if missing_fks:
            print(f"   Missing foreign keys: {missing_fks}")
        if extra_fks:
            print(f"   Extra foreign keys: {extra_fks}")
        
        return len(missing_fks) == 0
    
    def test_indexes(self) -> bool:
        """Test that required indexes exist"""
        expected_indexes = [
            ("User", "email"),
            ("User", "clientId"),
            ("User", "locationId"),
            ("Location", "clientId"),
            ("TruckJourney", "clientId"),
            ("TruckJourney", "locationId"),
            ("TruckJourney", "status"),
            ("AuditEntry", "clientId"),
            ("AuditEntry", "locationId"),
            ("AuditEntry", "userId")
        ]
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                t.relname as table_name,
                a.attname as column_name
            FROM pg_class t
            JOIN pg_index ix ON t.oid = ix.indrelid
            JOIN pg_class i ON ix.indexrelid = i.oid
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
            WHERE t.relkind = 'r' 
                AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
                AND i.relname NOT LIKE 'pg_%'
            ORDER BY t.relname, a.attname
        """)
        actual_indexes = cursor.fetchall()
        cursor.close()
        
        actual_index_set = {(idx[0], idx[1]) for idx in actual_indexes}
        expected_index_set = {tuple(idx) for idx in expected_indexes}
        
        missing_indexes = expected_index_set - actual_index_set
        
        if missing_indexes:
            print(f"   Missing indexes: {missing_indexes}")
        
        return len(missing_indexes) == 0
    
    def test_data_integrity(self) -> bool:
        """Test data integrity across tables"""
        cursor = self.conn.cursor()
        
        # Test 1: All users have valid clientId
        cursor.execute("""
            SELECT COUNT(*) FROM "User" u
            LEFT JOIN "Client" c ON u."clientId" = c.id
            WHERE c.id IS NULL
        """)
        orphan_users = cursor.fetchone()[0]
        
        # Test 2: All users have valid locationId
        cursor.execute("""
            SELECT COUNT(*) FROM "User" u
            LEFT JOIN "Location" l ON u."locationId" = l.id
            WHERE l.id IS NULL
        """)
        orphan_location_users = cursor.fetchone()[0]
        
        # Test 3: All locations have valid clientId
        cursor.execute("""
            SELECT COUNT(*) FROM "Location" l
            LEFT JOIN "Client" c ON l."clientId" = c.id
            WHERE c.id IS NULL
        """)
        orphan_locations = cursor.fetchone()[0]
        
        cursor.close()
        
        if orphan_users > 0:
            print(f"   Found {orphan_users} users with invalid clientId")
        if orphan_location_users > 0:
            print(f"   Found {orphan_location_users} users with invalid locationId")
        if orphan_locations > 0:
            print(f"   Found {orphan_locations} locations with invalid clientId")
        
        return orphan_users == 0 and orphan_location_users == 0 and orphan_locations == 0
    
    def test_lgm_data_completeness(self) -> bool:
        """Test LGM data completeness"""
        cursor = self.conn.cursor()
        
        # Test 1: LGM client exists
        cursor.execute("""
            SELECT COUNT(*) FROM "Client" 
            WHERE name LIKE '%LGM%' OR name LIKE '%Let''s Get Moving%'
        """)
        lgm_clients = cursor.fetchone()[0]
        
        # Test 2: LGM locations exist
        cursor.execute("""
            SELECT COUNT(*) FROM "Location" l
            JOIN "Client" c ON l."clientId" = c.id
            WHERE c.name LIKE '%LGM%' OR c.name LIKE '%Let''s Get Moving%'
        """)
        lgm_locations = cursor.fetchone()[0]
        
        # Test 3: LGM users exist
        cursor.execute("""
            SELECT COUNT(*) FROM "User" u
            JOIN "Client" c ON u."clientId" = c.id
            WHERE c.name LIKE '%LGM%' OR c.name LIKE '%Let''s Get Moving%'
        """)
        lgm_users = cursor.fetchone()[0]
        
        cursor.close()
        
        if lgm_clients == 0:
            print("   No LGM client found")
        if lgm_locations < 40:
            print(f"   Only {lgm_locations} LGM locations found (expected ~43)")
        if lgm_users < 30:
            print(f"   Only {lgm_users} LGM users found (expected ~37)")
        
        return lgm_clients > 0 and lgm_locations >= 40 and lgm_users >= 30
    
    def run_all_tests(self):
        """Run all database structure tests"""
        print("🚀 Starting Comprehensive Database Structure Tests")
        print("=" * 60)
        
        if not self.connect():
            return False
        
        tests = [
            ("Table Existence", self.test_table_existence),
            ("Client Table Structure", self.test_client_table_structure),
            ("Location Table Structure", self.test_location_table_structure),
            ("User Table Structure", self.test_user_table_structure),
            ("Foreign Key Constraints", self.test_foreign_key_constraints),
            ("Indexes", self.test_indexes),
            ("Data Integrity", self.test_data_integrity),
            ("LGM Data Completeness", self.test_lgm_data_completeness)
        ]
        
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
        
        self.disconnect()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
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
    tester = DatabaseStructureTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 