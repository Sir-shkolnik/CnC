#!/usr/bin/env python3
"""
Comprehensive Stress and Load Test Suite
Tests database performance, reliability, and stability under various load conditions
"""

import psycopg2
import threading
import time
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import sys
import os
import queue

# Database configuration
DB_CONFIG = {
    "host": "postgres",
    "port": "5432",
    "database": "c_and_c_crm",
    "user": "c_and_c_user",
    "password": "c_and_c_password"
}

class StressLoadTester:
    def __init__(self):
        self.conn = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        self.lgm_client_id = None
        self.test_data = []
        self.performance_metrics = {}
    
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
    
    def test_concurrent_reads(self) -> bool:
        """Test concurrent read operations"""
        print("   Testing concurrent read operations...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        def read_worker(worker_id, results_queue):
            try:
                conn = psycopg2.connect(**DB_CONFIG)
                cursor = conn.cursor()
                
                start_time = time.time()
                
                # Perform multiple read operations
                for i in range(10):
                    cursor.execute("""
                        SELECT COUNT(*) FROM "User" u
                        JOIN "Location" l ON u."locationId" = l.id
                        WHERE u."clientId" = %s
                    """, (lgm_client_id,))
                    cursor.fetchone()
                    
                    cursor.execute("""
                        SELECT l.name, COUNT(u.id) as user_count
                        FROM "Location" l
                        LEFT JOIN "User" u ON l.id = u."locationId"
                        WHERE l."clientId" = %s
                        GROUP BY l.id, l.name
                    """, (lgm_client_id,))
                    cursor.fetchall()
                
                end_time = time.time()
                results_queue.put((worker_id, True, end_time - start_time))
                
                cursor.close()
                conn.close()
                
            except Exception as e:
                results_queue.put((worker_id, False, str(e)))
        
        # Start multiple concurrent readers
        num_workers = 10
        results_queue = queue.Queue()
        threads = []
        
        for i in range(num_workers):
            thread = threading.Thread(target=read_worker, args=(i, results_queue))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful_workers = 0
        total_time = 0
        errors = []
        
        for _ in range(num_workers):
            worker_id, success, result = results_queue.get()
            if success:
                successful_workers += 1
                total_time += result
            else:
                errors.append(f"Worker {worker_id}: {result}")
        
        avg_time = total_time / successful_workers if successful_workers > 0 else 0
        
        print(f"   ✅ {successful_workers}/{num_workers} workers completed successfully")
        print(f"   ✅ Average time per worker: {avg_time:.3f}s")
        
        if errors:
            print(f"   ❌ Errors: {errors}")
            return False
        
        if successful_workers < num_workers * 0.9:  # 90% success rate
            print(f"   ❌ Too many failed workers: {successful_workers}/{num_workers}")
            return False
        
        if avg_time > 2.0:  # 2 seconds threshold
            print(f"   ❌ Average time too slow: {avg_time:.3f}s")
            return False
        
        return True
    
    def test_concurrent_writes(self) -> bool:
        """Test concurrent write operations"""
        print("   Testing concurrent write operations...")
        
        def write_worker(worker_id, results_queue):
            try:
                conn = psycopg2.connect(**DB_CONFIG)
                cursor = conn.cursor()
                
                start_time = time.time()
                
                # Create test data
                test_location_id = f"stress_loc_{worker_id}_{uuid.uuid4().hex[:8]}"
                test_user_id = f"stress_usr_{worker_id}_{uuid.uuid4().hex[:8]}"
                
                # Insert test location
                cursor.execute("""
                    INSERT INTO "Location" (id, "clientId", name, timezone, address, contact, 
                    "ownership_type", trucks, storage, "cx_care", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, (test_location_id, self.lgm_client_id, f"Stress Test Location {worker_id}", 
                      "UTC", f"Test Address {worker_id}", f"Test Contact {worker_id}", 
                      "CORPORATE", "1", "NO", False))
                
                # Insert test user
                cursor.execute("""
                    INSERT INTO "User" (id, name, email, role, "clientId", "locationId", status, 
                    "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, (test_user_id, f"Stress Test User {worker_id}", 
                      f"stress{worker_id}@lgm.com", "DRIVER", self.lgm_client_id, 
                      test_location_id, "ACTIVE"))
                
                # Update the user
                cursor.execute("""
                    UPDATE "User" SET "updatedAt" = NOW() WHERE id = %s
                """, (test_user_id,))
                
                conn.commit()
                end_time = time.time()
                
                # Clean up test data
                cursor.execute('DELETE FROM "User" WHERE id = %s', (test_user_id,))
                cursor.execute('DELETE FROM "Location" WHERE id = %s', (test_location_id,))
                conn.commit()
                
                results_queue.put((worker_id, True, end_time - start_time))
                
                cursor.close()
                conn.close()
                
            except Exception as e:
                results_queue.put((worker_id, False, str(e)))
        
        # Start multiple concurrent writers
        num_workers = 5  # Fewer writers to avoid conflicts
        results_queue = queue.Queue()
        threads = []
        
        for i in range(num_workers):
            thread = threading.Thread(target=write_worker, args=(i, results_queue))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful_workers = 0
        total_time = 0
        errors = []
        
        for _ in range(num_workers):
            worker_id, success, result = results_queue.get()
            if success:
                successful_workers += 1
                total_time += result
            else:
                errors.append(f"Worker {worker_id}: {result}")
        
        avg_time = total_time / successful_workers if successful_workers > 0 else 0
        
        print(f"   ✅ {successful_workers}/{num_workers} workers completed successfully")
        print(f"   ✅ Average time per worker: {avg_time:.3f}s")
        
        if errors:
            print(f"   ❌ Errors: {errors}")
            return False
        
        if successful_workers < num_workers * 0.8:  # 80% success rate for writes
            print(f"   ❌ Too many failed workers: {successful_workers}/{num_workers}")
            return False
        
        return True
    
    def test_mixed_workload(self) -> bool:
        """Test mixed read/write workload"""
        print("   Testing mixed read/write workload...")
        
        def mixed_worker(worker_id, results_queue):
            try:
                conn = psycopg2.connect(**DB_CONFIG)
                cursor = conn.cursor()
                
                start_time = time.time()
                operations = 0
                
                for i in range(20):  # 20 operations per worker
                    if random.random() < 0.8:  # 80% reads, 20% writes
                        # Read operation
                        cursor.execute("""
                            SELECT COUNT(*) FROM "User" u
                            JOIN "Location" l ON u."locationId" = l.id
                            WHERE u."clientId" = %s
                        """, (self.lgm_client_id,))
                        cursor.fetchone()
                    else:
                        # Write operation (update timestamp)
                        cursor.execute("""
                            UPDATE "User" SET "updatedAt" = NOW() 
                            WHERE "clientId" = %s LIMIT 1
                        """, (self.lgm_client_id,))
                        conn.commit()
                    
                    operations += 1
                
                end_time = time.time()
                results_queue.put((worker_id, True, end_time - start_time, operations))
                
                cursor.close()
                conn.close()
                
            except Exception as e:
                results_queue.put((worker_id, False, str(e), 0))
        
        # Start mixed workload workers
        num_workers = 8
        results_queue = queue.Queue()
        threads = []
        
        for i in range(num_workers):
            thread = threading.Thread(target=mixed_worker, args=(i, results_queue))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful_workers = 0
        total_time = 0
        total_operations = 0
        errors = []
        
        for _ in range(num_workers):
            worker_id, success, result, operations = results_queue.get()
            if success:
                successful_workers += 1
                total_time += result
                total_operations += operations
            else:
                errors.append(f"Worker {worker_id}: {result}")
        
        avg_time = total_time / successful_workers if successful_workers > 0 else 0
        ops_per_second = total_operations / total_time if total_time > 0 else 0
        
        print(f"   ✅ {successful_workers}/{num_workers} workers completed successfully")
        print(f"   ✅ Total operations: {total_operations}")
        print(f"   ✅ Operations per second: {ops_per_second:.1f}")
        print(f"   ✅ Average time per worker: {avg_time:.3f}s")
        
        if errors:
            print(f"   ❌ Errors: {errors}")
            return False
        
        if successful_workers < num_workers * 0.9:
            print(f"   ❌ Too many failed workers: {successful_workers}/{num_workers}")
            return False
        
        if ops_per_second < 50:  # Minimum 50 ops/sec
            print(f"   ❌ Operations per second too low: {ops_per_second:.1f}")
            return False
        
        return True
    
    def test_connection_pool_stress(self) -> bool:
        """Test connection pool under stress"""
        print("   Testing connection pool under stress...")
        
        def connection_worker(worker_id, results_queue):
            try:
                start_time = time.time()
                
                # Create multiple connections rapidly
                connections = []
                for i in range(5):
                    conn = psycopg2.connect(**DB_CONFIG)
                    cursor = conn.cursor()
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
                    cursor.close()
                    connections.append(conn)
                
                # Use all connections
                for conn in connections:
                    cursor = conn.cursor()
                    cursor.execute("SELECT COUNT(*) FROM \"User\"")
                    cursor.fetchone()
                    cursor.close()
                
                # Close all connections
                for conn in connections:
                    conn.close()
                
                end_time = time.time()
                results_queue.put((worker_id, True, end_time - start_time))
                
            except Exception as e:
                results_queue.put((worker_id, False, str(e)))
        
        # Start connection stress workers
        num_workers = 20
        results_queue = queue.Queue()
        threads = []
        
        for i in range(num_workers):
            thread = threading.Thread(target=connection_worker, args=(i, results_queue))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful_workers = 0
        total_time = 0
        errors = []
        
        for _ in range(num_workers):
            worker_id, success, result = results_queue.get()
            if success:
                successful_workers += 1
                total_time += result
            else:
                errors.append(f"Worker {worker_id}: {result}")
        
        avg_time = total_time / successful_workers if successful_workers > 0 else 0
        
        print(f"   ✅ {successful_workers}/{num_workers} workers completed successfully")
        print(f"   ✅ Average time per worker: {avg_time:.3f}s")
        
        if errors:
            print(f"   ❌ Errors: {errors}")
            return False
        
        if successful_workers < num_workers * 0.95:  # 95% success rate
            print(f"   ❌ Too many failed workers: {successful_workers}/{num_workers}")
            return False
        
        return True
    
    def test_memory_usage(self) -> bool:
        """Test memory usage under load"""
        print("   Testing memory usage under load...")
        
        cursor = self.conn.cursor()
        
        try:
            # Get initial memory usage
            cursor.execute("""
                SELECT 
                    pg_size_pretty(pg_database_size(current_database())) as db_size,
                    pg_database_size(current_database()) as db_size_bytes
            """)
            initial_size = cursor.fetchone()
            
            # Perform memory-intensive operations
            large_queries = []
            for i in range(50):
                cursor.execute("""
                    SELECT 
                        u.name, u.email, l.name as location_name, l.contact,
                        l."ownership_type", l.storage, l."cx_care"
                    FROM "User" u
                    JOIN "Location" l ON u."locationId" = l.id
                    WHERE u."clientId" = %s
                    ORDER BY u.name
                """, (self.lgm_client_id,))
                large_queries.append(cursor.fetchall())
            
            # Get final memory usage
            cursor.execute("""
                SELECT 
                    pg_size_pretty(pg_database_size(current_database())) as db_size,
                    pg_database_size(current_database()) as db_size_bytes
            """)
            final_size = cursor.fetchone()
            
            # Check memory growth
            initial_bytes = initial_size[1]
            final_bytes = final_size[1]
            growth = final_bytes - initial_bytes
            
            print(f"   ✅ Initial database size: {initial_size[0]}")
            print(f"   ✅ Final database size: {final_size[0]}")
            print(f"   ✅ Memory growth: {growth} bytes")
            
            # Memory should not grow significantly during read operations
            if growth > 1024 * 1024:  # 1MB threshold
                print(f"   ❌ Memory growth too high: {growth} bytes")
                return False
            
            return True
            
        except Exception as e:
            print(f"   ❌ Memory usage test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_transaction_isolation(self) -> bool:
        """Test transaction isolation levels"""
        print("   Testing transaction isolation...")
        
        def isolation_worker(worker_id, results_queue):
            try:
                conn = psycopg2.connect(**DB_CONFIG)
                conn.autocommit = False
                
                start_time = time.time()
                
                # Start transaction
                cursor = conn.cursor()
                cursor.execute("BEGIN")
                
                # Read data
                cursor.execute("""
                    SELECT COUNT(*) FROM "User" WHERE "clientId" = %s
                """, (self.lgm_client_id,))
                initial_count = cursor.fetchone()[0]
                
                # Simulate long-running transaction
                time.sleep(0.1)
                
                # Read again (should see same data due to isolation)
                cursor.execute("""
                    SELECT COUNT(*) FROM "User" WHERE "clientId" = %s
                """, (self.lgm_client_id,))
                final_count = cursor.fetchone()[0]
                
                cursor.execute("COMMIT")
                cursor.close()
                conn.close()
                
                end_time = time.time()
                
                # Verify isolation
                if initial_count != final_count:
                    results_queue.put((worker_id, False, "Isolation violation"))
                else:
                    results_queue.put((worker_id, True, end_time - start_time))
                
            except Exception as e:
                results_queue.put((worker_id, False, str(e)))
        
        # Start isolation test workers
        num_workers = 10
        results_queue = queue.Queue()
        threads = []
        
        for i in range(num_workers):
            thread = threading.Thread(target=isolation_worker, args=(i, results_queue))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful_workers = 0
        total_time = 0
        errors = []
        
        for _ in range(num_workers):
            worker_id, success, result = results_queue.get()
            if success:
                successful_workers += 1
                total_time += result
            else:
                errors.append(f"Worker {worker_id}: {result}")
        
        avg_time = total_time / successful_workers if successful_workers > 0 else 0
        
        print(f"   ✅ {successful_workers}/{num_workers} workers completed successfully")
        print(f"   ✅ Average time per worker: {avg_time:.3f}s")
        
        if errors:
            print(f"   ❌ Errors: {errors}")
            return False
        
        if successful_workers < num_workers:
            print(f"   ❌ Transaction isolation failed: {successful_workers}/{num_workers}")
            return False
        
        return True
    
    def test_deadlock_prevention(self) -> bool:
        """Test deadlock prevention mechanisms"""
        print("   Testing deadlock prevention...")
        
        def deadlock_worker(worker_id, results_queue):
            try:
                conn = psycopg2.connect(**DB_CONFIG)
                conn.autocommit = False
                cursor = conn.cursor()
                
                start_time = time.time()
                
                # Try to acquire locks in different orders to test deadlock prevention
                if worker_id % 2 == 0:
                    # Lock users first, then locations
                    cursor.execute("SELECT * FROM \"User\" WHERE \"clientId\" = %s FOR UPDATE", (self.lgm_client_id,))
                    cursor.fetchall()
                    time.sleep(0.1)
                    cursor.execute("SELECT * FROM \"Location\" WHERE \"clientId\" = %s FOR UPDATE", (self.lgm_client_id,))
                    cursor.fetchall()
                else:
                    # Lock locations first, then users
                    cursor.execute("SELECT * FROM \"Location\" WHERE \"clientId\" = %s FOR UPDATE", (self.lgm_client_id,))
                    cursor.fetchall()
                    time.sleep(0.1)
                    cursor.execute("SELECT * FROM \"User\" WHERE \"clientId\" = %s FOR UPDATE", (self.lgm_client_id,))
                    cursor.fetchall()
                
                cursor.execute("COMMIT")
                cursor.close()
                conn.close()
                
                end_time = time.time()
                results_queue.put((worker_id, True, end_time - start_time))
                
            except Exception as e:
                results_queue.put((worker_id, False, str(e)))
        
        # Start deadlock test workers
        num_workers = 6  # Fewer workers to avoid excessive locking
        results_queue = queue.Queue()
        threads = []
        
        for i in range(num_workers):
            thread = threading.Thread(target=deadlock_worker, args=(i, results_queue))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful_workers = 0
        total_time = 0
        errors = []
        
        for _ in range(num_workers):
            worker_id, success, result = results_queue.get()
            if success:
                successful_workers += 1
                total_time += result
            else:
                errors.append(f"Worker {worker_id}: {result}")
        
        avg_time = total_time / successful_workers if successful_workers > 0 else 0
        
        print(f"   ✅ {successful_workers}/{num_workers} workers completed successfully")
        print(f"   ✅ Average time per worker: {avg_time:.3f}s")
        
        if errors:
            print(f"   ❌ Errors: {errors}")
            return False
        
        if successful_workers < num_workers * 0.8:  # 80% success rate for deadlock tests
            print(f"   ❌ Too many failed workers: {successful_workers}/{num_workers}")
            return False
        
        return True
    
    def test_recovery_and_consistency(self) -> bool:
        """Test database recovery and consistency after stress"""
        print("   Testing recovery and consistency...")
        
        cursor = self.conn.cursor()
        
        try:
            # Get initial state
            cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE \"clientId\" = %s", (self.lgm_client_id,))
            initial_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM \"Location\" WHERE \"clientId\" = %s", (self.lgm_client_id,))
            initial_locations = cursor.fetchone()[0]
            
            # Perform stress operations
            for i in range(100):
                cursor.execute("""
                    SELECT COUNT(*) FROM "User" u
                    JOIN "Location" l ON u."locationId" = l.id
                    WHERE u."clientId" = %s
                """, (self.lgm_client_id,))
                cursor.fetchone()
            
            # Get final state
            cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE \"clientId\" = %s", (self.lgm_client_id,))
            final_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM \"Location\" WHERE \"clientId\" = %s", (self.lgm_client_id,))
            final_locations = cursor.fetchone()[0]
            
            # Verify consistency
            if initial_users != final_users:
                print(f"   ❌ User count changed: {initial_users} -> {final_users}")
                return False
            
            if initial_locations != final_locations:
                print(f"   ❌ Location count changed: {initial_locations} -> {final_locations}")
                return False
            
            # Test data integrity
            cursor.execute("""
                SELECT COUNT(*) FROM "User" u
                LEFT JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" = %s AND l.id IS NULL
            """, (self.lgm_client_id,))
            orphaned_users = cursor.fetchone()[0]
            
            if orphaned_users > 0:
                print(f"   ❌ Found {orphaned_users} orphaned users")
                return False
            
            print(f"   ✅ Data consistency verified after stress")
            print(f"   ✅ Users: {initial_users} -> {final_users}")
            print(f"   ✅ Locations: {initial_locations} -> {final_locations}")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Recovery test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def run_all_tests(self):
        """Run all stress and load tests"""
        print("🚀 Starting Comprehensive Stress and Load Tests")
        print("=" * 60)
        
        if not self.connect():
            return False
        
        try:
            tests = [
                ("Concurrent Reads", self.test_concurrent_reads),
                ("Concurrent Writes", self.test_concurrent_writes),
                ("Mixed Workload", self.test_mixed_workload),
                ("Connection Pool Stress", self.test_connection_pool_stress),
                ("Memory Usage", self.test_memory_usage),
                ("Transaction Isolation", self.test_transaction_isolation),
                ("Deadlock Prevention", self.test_deadlock_prevention),
                ("Recovery & Consistency", self.test_recovery_and_consistency)
            ]
            
            for test_name, test_func in tests:
                self.run_test(test_name, test_func)
            
        finally:
            self.disconnect()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 STRESS & LOAD TEST SUMMARY")
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
    tester = StressLoadTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 