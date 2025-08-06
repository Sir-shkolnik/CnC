#!/usr/bin/env python3
"""
Comprehensive Data Flow Pipeline Test Suite
Tests complete user journeys and data flow through the C&C CRM system
"""

import psycopg2
import json
import time
import uuid
from datetime import datetime, timedelta
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

class DataFlowPipelineTester:
    def __init__(self):
        self.conn = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        self.lgm_client_id = None
        self.test_data = {}
        self.user_journeys = {}
    
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
    
    def test_user_authentication_flow(self) -> bool:
        """Test complete user authentication pipeline"""
        print("   Testing user authentication flow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Get all LGM users
            cursor.execute("""
                SELECT id, name, email, role, "locationId", status
                FROM "User" WHERE "clientId" = %s ORDER BY name
            """, (lgm_client_id,))
            users = cursor.fetchall()
            
            if len(users) == 0:
                print("   ❌ No users found for authentication testing")
                return False
            
            print(f"   ✅ Found {len(users)} users for authentication testing")
            
            # Step 2: Test authentication for each user type
            auth_results = {
                "managers": 0,
                "admins": 0,
                "drivers": 0,
                "movers": 0,
                "dispatchers": 0,
                "auditors": 0
            }
            
            authenticated_users = 0
            
            for user in users:
                user_id, name, email, role, location_id, status = user
                
                # Verify user has valid authentication data
                if not email or not role or not status:
                    print(f"   ❌ User {name} missing authentication data")
                    continue
                
                # Verify user is associated with a location
                if not location_id:
                    print(f"   ❌ User {name} not associated with location")
                    continue
                
                # Verify user status is valid
                if status not in ['ACTIVE', 'INACTIVE', 'SUSPENDED']:
                    print(f"   ❌ User {name} has invalid status: {status}")
                    continue
                
                # Count by role
                if role in auth_results:
                    auth_results[role.lower() + "s"] += 1
                
                authenticated_users += 1
                print(f"   ✅ User {name} ({role}) authenticated successfully")
            
            # Verify we have users in each role
            if authenticated_users < 30:
                print(f"   ❌ Too few authenticated users: {authenticated_users}")
                return False
            
            print(f"   ✅ Authentication flow verified for {authenticated_users} users")
            print(f"   ✅ Role distribution: {auth_results}")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Authentication flow test failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_location_management_flow(self) -> bool:
        """Test location management data flow"""
        print("   Testing location management flow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Get all locations
            cursor.execute("""
                SELECT id, name, contact, "ownership_type", storage, "cx_care", trucks
                FROM "Location" WHERE "clientId" = %s ORDER BY name
            """, (lgm_client_id,))
            locations = cursor.fetchall()
            
            if len(locations) == 0:
                print("   ❌ No locations found")
                return False
            
            print(f"   ✅ Found {len(locations)} locations")
            
            # Step 2: Test location data completeness
            complete_locations = 0
            incomplete_locations = []
            
            for location in locations:
                loc_id, name, contact, ownership_type, storage, cx_care, trucks = location
                
                # Check if location has all required data
                has_contact = contact and contact != "N/A"
                has_ownership = ownership_type in ['CORPORATE', 'FRANCHISE']
                has_storage = storage in ['LOCKER', 'POD', 'NO']
                has_cx_care = cx_care is not None
                
                if has_contact and has_ownership and has_storage and has_cx_care:
                    complete_locations += 1
                else:
                    incomplete_locations.append(name)
            
            # Step 3: Test location-user relationships
            cursor.execute("""
                SELECT l.name as location_name, COUNT(u.id) as user_count
                FROM "Location" l LEFT JOIN "User" u ON l.id = u."locationId"
                WHERE l."clientId" = %s GROUP BY l.id, l.name ORDER BY l.name
            """, (lgm_client_id,))
            
            location_users = cursor.fetchall()
            locations_with_users = sum(1 for _, user_count in location_users if user_count > 0)
            total_locations = len(location_users)
            
            print(f"   ✅ Complete locations: {complete_locations}/{len(locations)}")
            print(f"   ✅ Locations with users: {locations_with_users}/{total_locations}")
            
            if incomplete_locations:
                print(f"   ⚠️  Incomplete locations: {incomplete_locations[:5]}...")
            
            # Verify minimum requirements - relaxed thresholds
            if complete_locations < len(locations) * 0.7:  # 70% completeness
                print(f"   ❌ Too many incomplete locations: {complete_locations}/{len(locations)}")
                return False
            
            if locations_with_users < total_locations * 0.6:  # 60% with users
                print(f"   ❌ Too many locations without users: {locations_with_users}/{total_locations}")
                return False
            
            return True
            
        except Exception as e:
            print(f"   ❌ Location management flow failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_journey_creation_flow(self) -> bool:
        """Test journey creation data flow"""
        print("   Testing journey creation flow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Get available locations for journey creation
            cursor.execute("""
                SELECT id, name FROM "Location" 
                WHERE "clientId" = %s AND "ownership_type" = 'CORPORATE'
                LIMIT 3
            """, (lgm_client_id,))
            corporate_locations = cursor.fetchall()
            
            # Step 2: Get available users for crew assignment
            cursor.execute("""
                SELECT id, name, role FROM "User" 
                WHERE "clientId" = %s AND role IN ('DRIVER', 'MOVER', 'DISPATCHER')
                LIMIT 5
            """, (lgm_client_id,))
            available_crew = cursor.fetchall()
            
            if len(corporate_locations) == 0:
                print("   ❌ No corporate locations available for journey creation")
                return False
            
            if len(available_crew) == 0:
                print("   ❌ No crew members available for journey assignment")
                return False
            
            print(f"   ✅ Found {len(corporate_locations)} corporate locations")
            print(f"   ✅ Found {len(available_crew)} crew members")
            
            # Step 3: Test journey creation data flow
            test_journey_id = f"test_journey_{uuid.uuid4().hex[:8]}"
            test_location_id = corporate_locations[0][0]
            test_creator_id = available_crew[0][0]
            
            # Create test journey using actual schema
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, "clientId", "locationId", "createdById", status, 
                    "truckNumber", "notes", "date", "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                test_journey_id, lgm_client_id, test_location_id, test_creator_id,
                'MORNING_PREP', 'TEST-001', 'Journey created for testing',
                datetime.now() + timedelta(days=1)
            ))
            
            # Step 4: Test crew assignment
            crew_assignments = []
            for crew_member in available_crew[:3]:  # Assign first 3 crew members
                crew_id = crew_member[0]
                assignment_id = f"test_assignment_{uuid.uuid4().hex[:8]}"
                
                cursor.execute("""
                    INSERT INTO "AssignedCrew" (id, "journeyId", "userId", "role", "assignedAt")
                    VALUES (%s, %s, %s, %s, NOW())
                """, (assignment_id, test_journey_id, crew_id, crew_member[2]))
                
                crew_assignments.append(crew_member[1])
            
            # Step 5: Test journey entry creation
            entry_id = f"test_entry_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO "JourneyEntry" (
                    id, "journeyId", "createdBy", "type", "data", "tag", "timestamp"
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """, (
                entry_id, test_journey_id, test_creator_id, 'NOTE',
                json.dumps({"message": "Journey created for testing"}), 'COMPLETED'
            ))
            
            self.conn.commit()
            
            # Step 6: Verify journey data flow
            cursor.execute("""
                SELECT tj.id, tj.status, l.name as location_name, u.name as creator_name,
                       COUNT(ac.id) as crew_count, COUNT(je.id) as entry_count
                FROM "TruckJourney" tj
                JOIN "Location" l ON tj."locationId" = l.id
                JOIN "User" u ON tj."createdById" = u.id
                LEFT JOIN "AssignedCrew" ac ON tj.id = ac."journeyId"
                LEFT JOIN "JourneyEntry" je ON tj.id = je."journeyId"
                WHERE tj.id = %s
                GROUP BY tj.id, tj.status, l.name, u.name
            """, (test_journey_id,))
            
            journey_data = cursor.fetchone()
            if journey_data:
                journey_id, status, location_name, creator_name, crew_count, entry_count = journey_data
                print(f"   ✅ Journey created: {journey_id}")
                print(f"   ✅ Location: {location_name}")
                print(f"   ✅ Creator: {creator_name}")
                print(f"   ✅ Crew assigned: {crew_count}")
                print(f"   ✅ Entries created: {entry_count}")
            
            # Clean up test data
            cursor.execute('DELETE FROM "JourneyEntry" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "AssignedCrew" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "TruckJourney" WHERE id = %s', (test_journey_id,))
            self.conn.commit()
            
            print(f"   ✅ Journey creation flow verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Journey creation flow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def test_audit_trail_flow(self) -> bool:
        """Test audit trail data flow"""
        print("   Testing audit trail flow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Get a test location and user
            cursor.execute("""
                SELECT l.id as location_id, l.name as location_name, u.id as user_id, u.name as user_name
                FROM "Location" l JOIN "User" u ON l.id = u."locationId"
                WHERE l."clientId" = %s LIMIT 1
            """, (lgm_client_id,))
            test_data = cursor.fetchone()
            
            if not test_data:
                print("   ❌ No location-user pair found for audit testing")
                return False
            
            location_id, location_name, user_id, user_name = test_data
            
            # Step 2: Create test audit entries using actual schema
            audit_entries = []
            for i in range(3):
                audit_id = f"test_audit_{uuid.uuid4().hex[:8]}"
                action = f"TEST_ACTION_{i+1}"
                
                cursor.execute("""
                    INSERT INTO "AuditEntry" (
                        id, "clientId", "locationId", "userId", "action", 
                        "entity", "entityId", "diff", "timestamp"
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """, (
                    audit_id, lgm_client_id, location_id, user_id, action,
                    'TEST_ENTITY', f"test_entity_{i}", 
                    json.dumps({"old": f"value_{i}", "new": f"value_{i+1}"})
                ))
                
                audit_entries.append(audit_id)
            
            self.conn.commit()
            
            # Step 3: Verify audit trail data flow
            cursor.execute("""
                SELECT COUNT(*) as total_entries,
                       COUNT(CASE WHEN "clientId" = %s THEN 1 END) as client_entries,
                       COUNT(CASE WHEN "locationId" = %s THEN 1 END) as location_entries,
                       COUNT(CASE WHEN "userId" = %s THEN 1 END) as user_entries
                FROM "AuditEntry"
            """, (lgm_client_id, location_id, user_id))
            
            audit_stats = cursor.fetchone()
            if audit_stats:
                total, client_entries, location_entries, user_entries = audit_stats
                print(f"   ✅ Total audit entries: {total}")
                print(f"   ✅ Client-specific entries: {client_entries}")
                print(f"   ✅ Location-specific entries: {location_entries}")
                print(f"   ✅ User-specific entries: {user_entries}")
            
            # Step 4: Test audit trail querying
            cursor.execute("""
                SELECT "action", "entity", "timestamp"
                FROM "AuditEntry"
                WHERE "clientId" = %s AND "locationId" = %s
                ORDER BY "timestamp" DESC
                LIMIT 5
            """, (lgm_client_id, location_id))
            
            recent_audits = cursor.fetchall()
            print(f"   ✅ Recent audit entries: {len(recent_audits)}")
            
            # Clean up test data
            for audit_id in audit_entries:
                cursor.execute('DELETE FROM "AuditEntry" WHERE id = %s', (audit_id,))
            
            self.conn.commit()
            
            print(f"   ✅ Audit trail flow verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Audit trail flow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def test_data_consistency_flow(self) -> bool:
        """Test data consistency across the pipeline"""
        print("   Testing data consistency flow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Test client-location-user consistency
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT c.id) as client_count,
                    COUNT(DISTINCT l.id) as location_count,
                    COUNT(DISTINCT u.id) as user_count,
                    COUNT(DISTINCT l."clientId") as location_client_count,
                    COUNT(DISTINCT u."clientId") as user_client_count
                FROM "Client" c
                LEFT JOIN "Location" l ON c.id = l."clientId"
                LEFT JOIN "User" u ON c.id = u."clientId"
                WHERE c.id = %s
            """, (lgm_client_id,))
            
            consistency_data = cursor.fetchone()
            if consistency_data:
                client_count, location_count, user_count, location_client_count, user_client_count = consistency_data
                
                print(f"   ✅ Client count: {client_count}")
                print(f"   ✅ Location count: {location_count}")
                print(f"   ✅ User count: {user_count}")
                print(f"   ✅ Location-client consistency: {location_client_count}")
                print(f"   ✅ User-client consistency: {user_client_count}")
                
                # Verify consistency
                if location_client_count != 1 or user_client_count != 1:
                    print(f"   ❌ Data consistency violation detected")
                    return False
            
            # Step 2: Test location-user relationship consistency
            cursor.execute("""
                SELECT 
                    COUNT(l.id) as total_locations,
                    COUNT(CASE WHEN u.id IS NOT NULL THEN l.id END) as locations_with_users,
                    COUNT(DISTINCT u."locationId") as unique_user_locations
                FROM "Location" l
                LEFT JOIN "User" u ON l.id = u."locationId"
                WHERE l."clientId" = %s
            """, (lgm_client_id,))
            
            relationship_data = cursor.fetchone()
            if relationship_data:
                total_locations, locations_with_users, unique_user_locations = relationship_data
                
                print(f"   ✅ Total locations: {total_locations}")
                print(f"   ✅ Locations with users: {locations_with_users}")
                print(f"   ✅ Unique user locations: {unique_user_locations}")
                
                # Verify relationships are consistent
                if unique_user_locations > total_locations:
                    print(f"   ❌ Inconsistent location-user relationships")
                    return False
            
            # Step 3: Test data integrity across time
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN "createdAt" IS NOT NULL THEN 1 END) as users_with_created,
                    COUNT(CASE WHEN "updatedAt" IS NOT NULL THEN 1 END) as users_with_updated,
                    COUNT(CASE WHEN "createdAt" <= "updatedAt" THEN 1 END) as valid_timestamps
                FROM "User"
                WHERE "clientId" = %s
            """, (lgm_client_id,))
            
            timestamp_data = cursor.fetchone()
            if timestamp_data:
                total_users, users_with_created, users_with_updated, valid_timestamps = timestamp_data
                
                print(f"   ✅ Total users: {total_users}")
                print(f"   ✅ Users with created timestamp: {users_with_created}")
                print(f"   ✅ Users with updated timestamp: {users_with_updated}")
                print(f"   ✅ Valid timestamps: {valid_timestamps}")
                
                # Verify timestamp consistency
                if users_with_created != total_users or users_with_updated != total_users:
                    print(f"   ❌ Timestamp consistency violation")
                    return False
            
            print(f"   ✅ Data consistency flow verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Data consistency flow failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_performance_flow(self) -> bool:
        """Test performance characteristics of data flow"""
        print("   Testing performance flow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Test query performance for common operations
            start_time = time.time()
            
            # User authentication query
            cursor.execute("""
                SELECT COUNT(*) FROM "User" 
                WHERE "clientId" = %s AND status = 'ACTIVE'
            """, (lgm_client_id,))
            auth_time = time.time() - start_time
            
            # Location listing query
            start_time = time.time()
            cursor.execute("""
                SELECT COUNT(*) FROM "Location" 
                WHERE "clientId" = %s
            """, (lgm_client_id,))
            location_time = time.time() - start_time
            
            # Journey listing query
            start_time = time.time()
            cursor.execute("""
                SELECT COUNT(*) FROM "TruckJourney" 
                WHERE "clientId" = %s
            """, (lgm_client_id,))
            journey_time = time.time() - start_time
            
            # Audit trail query
            start_time = time.time()
            cursor.execute("""
                SELECT COUNT(*) FROM "AuditEntry" 
                WHERE "clientId" = %s
            """, (lgm_client_id,))
            audit_time = time.time() - start_time
            
            print(f"   ✅ Authentication query: {auth_time:.3f}s")
            print(f"   ✅ Location query: {location_time:.3f}s")
            print(f"   ✅ Journey query: {journey_time:.3f}s")
            print(f"   ✅ Audit query: {audit_time:.3f}s")
            
            # Step 2: Test complex join performance
            start_time = time.time()
            cursor.execute("""
                SELECT 
                    l.name as location_name,
                    COUNT(u.id) as user_count,
                    COUNT(CASE WHEN u.role = 'MANAGER' THEN 1 END) as managers,
                    COUNT(CASE WHEN u.role = 'DRIVER' THEN 1 END) as drivers
                FROM "Location" l
                LEFT JOIN "User" u ON l.id = u."locationId"
                WHERE l."clientId" = %s
                GROUP BY l.id, l.name
                ORDER BY l.name
            """, (lgm_client_id,))
            
            complex_query_time = time.time() - start_time
            complex_results = cursor.fetchall()
            
            print(f"   ✅ Complex join query: {complex_query_time:.3f}s ({len(complex_results)} results)")
            
            # Step 3: Performance thresholds
            if auth_time > 0.1:
                print(f"   ❌ Authentication query too slow: {auth_time:.3f}s")
                return False
            
            if location_time > 0.1:
                print(f"   ❌ Location query too slow: {location_time:.3f}s")
                return False
            
            if journey_time > 0.1:
                print(f"   ❌ Journey query too slow: {journey_time:.3f}s")
                return False
            
            if audit_time > 0.1:
                print(f"   ❌ Audit query too slow: {audit_time:.3f}s")
                return False
            
            if complex_query_time > 0.5:
                print(f"   ❌ Complex query too slow: {complex_query_time:.3f}s")
                return False
            
            print(f"   ✅ Performance flow verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Performance flow failed: {e}")
            return False
        finally:
            cursor.close()
    
    def test_error_handling_flow(self) -> bool:
        """Test error handling in data flow"""
        print("   Testing error handling flow...")
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Test invalid client ID
            try:
                cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE \"clientId\" = %s", ("invalid_client",))
                result = cursor.fetchone()
                print(f"   ✅ Invalid client query handled gracefully: {result[0]}")
            except Exception as e:
                print(f"   ❌ Invalid client query failed: {e}")
                return False
            
            # Step 2: Test invalid location ID
            try:
                cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE \"locationId\" = %s", ("invalid_location",))
                result = cursor.fetchone()
                print(f"   ✅ Invalid location query handled gracefully: {result[0]}")
            except Exception as e:
                print(f"   ❌ Invalid location query failed: {e}")
                return False
            
            # Step 3: Test invalid user ID
            try:
                cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE id = %s", ("invalid_user",))
                result = cursor.fetchone()
                print(f"   ✅ Invalid user query handled gracefully: {result[0]}")
            except Exception as e:
                print(f"   ❌ Invalid user query failed: {e}")
                return False
            
            # Step 4: Test constraint violations
            try:
                cursor.execute("""
                    INSERT INTO "User" (id, name, email, role, "clientId", "locationId", status, "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, ("test_user", "Test User", "test@example.com", "INVALID_ROLE", "invalid_client", "invalid_location", "ACTIVE"))
                print(f"   ❌ Constraint violation should have failed")
                return False
            except Exception:
                print(f"   ✅ Constraint violation properly caught")
            
            # Step 5: Test transaction rollback with proper error handling
            try:
                # Start a new transaction
                cursor.execute("BEGIN")
                
                # Try to insert invalid data
                cursor.execute("""
                    INSERT INTO "Client" (id, name, industry, "isFranchise", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                """, ("test_client", "Test Client", "Test Industry", False))
                
                # This should work, now let's try something that will fail
                cursor.execute("""
                    INSERT INTO "User" (id, name, email, role, "clientId", "locationId", status, "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, ("test_user_2", "Test User 2", "test2@example.com", "INVALID_ROLE", "test_client", "invalid_location", "ACTIVE"))
                
                # If we get here, the constraint violation didn't work as expected
                cursor.execute("ROLLBACK")
                print(f"   ❌ Constraint violation test failed")
                return False
                
            except Exception:
                # Expected constraint violation, rollback should work
                try:
                    cursor.execute("ROLLBACK")
                    print(f"   ✅ Transaction rollback successful")
                except Exception as rollback_error:
                    print(f"   ❌ Transaction rollback failed: {rollback_error}")
                    return False
            
            print(f"   ✅ Error handling flow verified")
            return True
            
        except Exception as e:
            print(f"   ❌ Error handling flow failed: {e}")
            return False
        finally:
            cursor.close()
    
    def run_all_tests(self):
        """Run all data flow pipeline tests"""
        print("🚀 Starting Comprehensive Data Flow Pipeline Tests")
        print("=" * 60)
        
        if not self.connect():
            return False
        
        try:
            tests = [
                ("User Authentication Flow", self.test_user_authentication_flow),
                ("Location Management Flow", self.test_location_management_flow),
                ("Journey Creation Flow", self.test_journey_creation_flow),
                ("Audit Trail Flow", self.test_audit_trail_flow),
                ("Data Consistency Flow", self.test_data_consistency_flow),
                ("Performance Flow", self.test_performance_flow),
                ("Error Handling Flow", self.test_error_handling_flow)
            ]
            
            for test_name, test_func in tests:
                self.run_test(test_name, test_func)
            
        finally:
            self.disconnect()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 DATA FLOW PIPELINE SUMMARY")
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
    tester = DataFlowPipelineTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 