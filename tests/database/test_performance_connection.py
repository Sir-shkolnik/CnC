#!/usr/bin/env python3
"""
Database Performance and Connection Test Suite
Tests connection pooling, query performance, and database optimization
"""

import psycopg2
import time
import threading
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

class PerformanceConnectionTester:
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
    
    def test_connection_speed(self) -> bool:
        """Test database connection speed"""
        start_time = time.time()
        
        try:
            test_conn = psycopg2.connect(**DB_CONFIG)
            connection_time = time.time() - start_time
            test_conn.close()
            
            print(f"   Connection time: {connection_time:.3f} seconds")
            
            if connection_time > 1.0:
                print(f"   Connection too slow: {connection_time:.3f}s")
                return False
            
            return True
        except Exception as e:
            print(f"   Connection failed: {e}")
            return False
    
    def test_query_performance(self) -> bool:
        """Test query performance"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        # Test 1: Simple count query
        start_time = time.time()
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM \"Location\" WHERE \"clientId\" = %s", (lgm_client_id,))
        count = cursor.fetchone()[0]
        simple_query_time = time.time() - start_time
        cursor.close()
        
        print(f"   Simple count query: {simple_query_time:.3f}s ({count} locations)")
        
        # Test 2: Complex join query
        start_time = time.time()
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                l.name as location_name,
                l.contact,
                COUNT(u.id) as user_count,
                l.storage,
                l."cx_care"
            FROM "Location" l
            LEFT JOIN "User" u ON l.id = u."locationId"
            WHERE l."clientId" = %s
            GROUP BY l.id, l.name, l.contact, l.storage, l."cx_care"
            ORDER BY l.name
        """, (lgm_client_id,))
        results = cursor.fetchall()
        complex_query_time = time.time() - start_time
        cursor.close()
        
        print(f"   Complex join query: {complex_query_time:.3f}s ({len(results)} results)")
        
        # Test 3: Index usage query
        start_time = time.time()
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT name, email, role 
            FROM "User" 
            WHERE "clientId" = %s AND email LIKE '%@lgm.com'
            ORDER BY name
        """, (lgm_client_id,))
        users = cursor.fetchall()
        index_query_time = time.time() - start_time
        cursor.close()
        
        print(f"   Index query: {index_query_time:.3f}s ({len(users)} users)")
        
        # Performance thresholds
        if simple_query_time > 0.1:
            print(f"   Simple query too slow: {simple_query_time:.3f}s")
            return False
        
        if complex_query_time > 0.5:
            print(f"   Complex query too slow: {complex_query_time:.3f}s")
            return False
        
        if index_query_time > 0.2:
            print(f"   Index query too slow: {index_query_time:.3f}s")
            return False
        
        return True
    
    def test_concurrent_connections(self) -> bool:
        """Test concurrent database connections"""
        def test_connection():
            try:
                conn = psycopg2.connect(**DB_CONFIG)
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                conn.close()
                return True
            except Exception as e:
                print(f"   Concurrent connection failed: {e}")
                return False
        
        # Test with 5 concurrent connections
        threads = []
        results = []
        
        for i in range(5):
            thread = threading.Thread(target=lambda: results.append(test_connection()))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        successful_connections = sum(results)
        print(f"   Concurrent connections: {successful_connections}/5 successful")
        
        return successful_connections >= 4  # Allow 1 failure
    
    def test_connection_pooling(self) -> bool:
        """Test connection pooling behavior"""
        connections = []
        start_time = time.time()
        
        try:
            # Create multiple connections
            for i in range(10):
                conn = psycopg2.connect(**DB_CONFIG)
                cursor = conn.cursor()
                cursor.execute("SELECT %s", (i,))
                cursor.fetchone()
                cursor.close()
                connections.append(conn)
            
            # Test all connections are working
            for i, conn in enumerate(connections):
                cursor = conn.cursor()
                cursor.execute("SELECT %s", (i * 2,))
                result = cursor.fetchone()
                cursor.close()
                if result[0] != i * 2:
                    print(f"   Connection {i} not working properly")
                    return False
            
            # Close all connections
            for conn in connections:
                conn.close()
            
            total_time = time.time() - start_time
            print(f"   Connection pooling test: {total_time:.3f}s for 10 connections")
            
            if total_time > 5.0:
                print(f"   Connection pooling too slow: {total_time:.3f}s")
                return False
            
            return True
            
        except Exception as e:
            print(f"   Connection pooling failed: {e}")
            # Clean up connections
            for conn in connections:
                try:
                    conn.close()
                except:
                    pass
            return False
    
    def test_query_optimization(self) -> bool:
        """Test query optimization and execution plans"""
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        # Test 1: Check if indexes are being used
        cursor.execute("""
            EXPLAIN (ANALYZE, BUFFERS) 
            SELECT u.name, u.email, l.name as location_name
            FROM "User" u
            JOIN "Location" l ON u."locationId" = l.id
            WHERE u."clientId" = %s
            ORDER BY u.name
        """, (lgm_client_id,))
        explain_result = cursor.fetchall()
        cursor.close()
        
        explain_text = "\n".join([row[0] for row in explain_result])
        
        # Check for index usage
        if "Index Scan" not in explain_text:
            print("   No index scan detected in query plan")
            return False
        
        # Check for reasonable execution time
        if "Execution Time:" in explain_text:
            # Extract execution time
            for line in explain_text.split('\n'):
                if "Execution Time:" in line:
                    time_str = line.split("Execution Time:")[1].strip()
                    try:
                        execution_time = float(time_str.split()[0])
                        print(f"   Query execution time: {execution_time}ms")
                        
                        if execution_time > 100:  # More than 100ms
                            print(f"   Query execution too slow: {execution_time}ms")
                            return False
                    except:
                        pass
        
        return True
    
    def test_database_statistics(self) -> bool:
        """Test database statistics and monitoring"""
        cursor = self.conn.cursor()
        
        # Test 1: Table sizes
        cursor.execute("""
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats 
            WHERE schemaname = 'public' 
                AND tablename IN ('User', 'Location', 'Client')
            ORDER BY tablename, attname
        """)
        stats = cursor.fetchall()
        
        if len(stats) == 0:
            print("   No statistics found for tables")
            return False
        
        print(f"   Found statistics for {len(stats)} columns")
        
        # Test 2: Database size
        cursor.execute("""
            SELECT 
                pg_size_pretty(pg_database_size(current_database())) as db_size,
                pg_database_size(current_database()) as db_size_bytes
        """)
        db_size = cursor.fetchone()
        cursor.close()
        
        if db_size:
            size_str, size_bytes = db_size
            print(f"   Database size: {size_str}")
            
            # Check if database is reasonable size (should be > 1MB but < 1GB for test data)
            if size_bytes < 1024 * 1024:  # Less than 1MB
                print(f"   Database too small: {size_str}")
                return False
            
            if size_bytes > 1024 * 1024 * 1024:  # More than 1GB
                print(f"   Database too large: {size_str}")
                return False
        
        return True
    
    def test_transaction_handling(self) -> bool:
        """Test transaction handling and rollback"""
        cursor = self.conn.cursor()
        
        try:
            # Start transaction
            cursor.execute("BEGIN")
            
            # Test insert
            test_id = f"test_{int(time.time())}"
            cursor.execute("""
                INSERT INTO "Client" (id, name, industry, "isFranchise", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """, (test_id, "Test Client", "Test Industry", False))
            
            # Verify insert
            cursor.execute("SELECT name FROM \"Client\" WHERE id = %s", (test_id,))
            result = cursor.fetchone()
            
            if not result or result[0] != "Test Client":
                print("   Insert verification failed")
                return False
            
            # Rollback transaction
            cursor.execute("ROLLBACK")
            
            # Verify rollback
            cursor.execute("SELECT name FROM \"Client\" WHERE id = %s", (test_id,))
            result = cursor.fetchone()
            
            if result:
                print("   Rollback failed - test data still exists")
                return False
            
            print("   Transaction rollback successful")
            return True
            
        except Exception as e:
            print(f"   Transaction test failed: {e}")
            cursor.execute("ROLLBACK")
            return False
        finally:
            cursor.close()
    
    def test_error_handling(self) -> bool:
        """Test database error handling"""
        cursor = self.conn.cursor()
        
        # Test 1: Invalid SQL
        try:
            cursor.execute("SELECT * FROM nonexistent_table")
            print("   Invalid SQL should have failed")
            return False
        except psycopg2.Error:
            pass  # Expected error
        
        # Test 2: Constraint violation
        try:
            cursor.execute("""
                INSERT INTO "User" (id, name, email, role, "clientId", "locationId", status, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, ("test_user", "Test User", "test@example.com", "DRIVER", "invalid_client", "invalid_location", "ACTIVE"))
            print("   Constraint violation should have failed")
            return False
        except psycopg2.Error:
            pass  # Expected error
        
        # Test 3: Data type error
        try:
            cursor.execute("SELECT * FROM \"User\" WHERE id = %s", (123,))  # Wrong type
            cursor.fetchone()
        except psycopg2.Error:
            pass  # Expected error
        
        cursor.close()
        print("   Error handling working correctly")
        return True
    
    def run_all_tests(self):
        """Run all performance and connection tests"""
        print("🚀 Starting Database Performance and Connection Tests")
        print("=" * 60)
        
        if not self.connect():
            return False
        
        tests = [
            ("Connection Speed", self.test_connection_speed),
            ("Query Performance", self.test_query_performance),
            ("Concurrent Connections", self.test_concurrent_connections),
            ("Connection Pooling", self.test_connection_pooling),
            ("Query Optimization", self.test_query_optimization),
            ("Database Statistics", self.test_database_statistics),
            ("Transaction Handling", self.test_transaction_handling),
            ("Error Handling", self.test_error_handling)
        ]
        
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
        
        self.disconnect()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 PERFORMANCE & CONNECTION SUMMARY")
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
    tester = PerformanceConnectionTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 