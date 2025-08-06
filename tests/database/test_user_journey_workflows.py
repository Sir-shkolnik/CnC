#!/usr/bin/env python3
"""
Comprehensive User Journey Workflow Test Suite
Tests specific business workflows and user paths through the C&C CRM system
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

class UserJourneyWorkflowTester:
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
    
    def test_manager_journey_workflow(self) -> bool:
        """Test manager journey workflow"""
        print("   Testing manager journey workflow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Find a manager and their location
            cursor.execute("""
                SELECT u.id, u.name, u.role, l.id as location_id, l.name as location_name,
                       l.contact, l."ownership_type", l.storage, l."cx_care"
                FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" = %s AND u.role = 'MANAGER'
                LIMIT 1
            """, (lgm_client_id,))
            
            manager_data = cursor.fetchone()
            if not manager_data:
                print("   ❌ No manager found for workflow testing")
                return False
            
            manager_id, manager_name, manager_role, location_id, location_name, contact, ownership_type, storage, cx_care = manager_data
            
            print(f"   ✅ Manager: {manager_name} at {location_name}")
            print(f"   ✅ Location overview: {location_name}")
            print(f"   ✅ Contact: {contact}")
            print(f"   ✅ Ownership: {ownership_type}")
            print(f"   ✅ Storage: {storage}")
            print(f"   ✅ CX Care: {'Enabled' if cx_care else 'Disabled'}")
            
            # Step 2: Get crew members at this location
            cursor.execute("""
                SELECT u.id, u.name, u.role
                FROM "User" u
                WHERE u."locationId" = %s AND u.role IN ('DRIVER', 'MOVER')
            """, (location_id,))
            
            crew_members = cursor.fetchall()
            print(f"   ✅ Users: {len(crew_members)} (Drivers: {len([c for c in crew_members if c[2] == 'DRIVER'])}, Movers: {len([c for c in crew_members if c[2] == 'MOVER'])})")
            
            # Step 3: Create a test journey for the manager
            test_journey_id = f"test_manager_journey_{uuid.uuid4().hex[:8]}"
            
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, "clientId", "locationId", "createdById", status, 
                    "truckNumber", "notes", "date", "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                test_journey_id, lgm_client_id, location_id, manager_id,
                'MORNING_PREP', 'MGMT-001', 'Manager journey workflow test',
                datetime.now() + timedelta(days=1)
            ))
            
            # Step 4: Assign crew members
            for crew_member in crew_members[:2]:  # Assign first 2 crew members
                crew_id, crew_name, crew_role = crew_member
                assignment_id = f"test_assignment_{uuid.uuid4().hex[:8]}"
                
                cursor.execute("""
                    INSERT INTO "AssignedCrew" (id, "journeyId", "userId", "role", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                """, (assignment_id, test_journey_id, crew_id, crew_role))
                
                print(f"   ✅ Assigned {crew_name} ({crew_role}) to journey")
            
            # Step 5: Create journey entries
            entry_id = f"test_entry_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO "JourneyEntry" (
                    id, "journeyId", "createdBy", "type", "data", "tag", "timestamp"
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """, (
                entry_id, test_journey_id, manager_id, 'NOTE',
                json.dumps({"message": "Manager created journey", "manager": manager_name}), 'COMPLETED'
            ))
            
            self.conn.commit()
            
            # Step 6: Verify manager workflow
            cursor.execute("""
                SELECT tj.id, tj.status, l.name as location_name, u.name as manager_name,
                       COUNT(ac.id) as crew_count, COUNT(je.id) as entry_count
                FROM "TruckJourney" tj
                JOIN "Location" l ON tj."locationId" = l.id
                JOIN "User" u ON tj."createdById" = u.id
                LEFT JOIN "AssignedCrew" ac ON tj.id = ac."journeyId"
                LEFT JOIN "JourneyEntry" je ON tj.id = je."journeyId"
                WHERE tj.id = %s AND u.role = 'MANAGER'
                GROUP BY tj.id, tj.status, l.name, u.name
            """, (test_journey_id,))
            
            workflow_data = cursor.fetchone()
            if workflow_data:
                journey_id, status, location_name, manager_name, crew_count, entry_count = workflow_data
                print(f"   ✅ Manager workflow verified: {manager_name} created journey with {crew_count} crew and {entry_count} entries")
            
            # Clean up
            cursor.execute('DELETE FROM "JourneyEntry" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "AssignedCrew" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "TruckJourney" WHERE id = %s', (test_journey_id,))
            self.conn.commit()
            
            return True
            
        except Exception as e:
            print(f"   ❌ Manager journey workflow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def test_driver_journey_workflow(self) -> bool:
        """Test driver journey workflow"""
        print("   Testing driver journey workflow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Find a driver and their location
            cursor.execute("""
                SELECT u.id, u.name, u.role, l.id as location_id, l.name as location_name
                FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" = %s AND u.role = 'DRIVER'
                LIMIT 1
            """, (lgm_client_id,))
            
            driver_data = cursor.fetchone()
            if not driver_data:
                print("   ❌ No driver found for workflow testing")
                return False
            
            driver_id, driver_name, driver_role, location_id, location_name = driver_data
            
            print(f"   ✅ Driver: {driver_name} at {location_name}")
            
            # Step 2: Find active journeys for this driver
            cursor.execute("""
                SELECT tj.id, tj.status, tj."truckNumber", l.name as location_name
                FROM "TruckJourney" tj
                JOIN "Location" l ON tj."locationId" = l.id
                JOIN "AssignedCrew" ac ON tj.id = ac."journeyId"
                WHERE ac."userId" = %s AND tj.status IN ('MORNING_PREP', 'EN_ROUTE', 'ONSITE')
                ORDER BY tj."date" DESC
                LIMIT 5
            """, (driver_id,))
            
            active_journeys = cursor.fetchall()
            print(f"   ✅ Active journeys: {len(active_journeys)}")
            
            # Step 3: Create a test journey for the driver
            test_journey_id = f"test_driver_journey_{uuid.uuid4().hex[:8]}"
            
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, "clientId", "locationId", "createdById", status, 
                    "truckNumber", "notes", "date", "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                test_journey_id, lgm_client_id, location_id, driver_id,
                'EN_ROUTE', 'DRIVER-001', 'Driver journey workflow test',
                datetime.now() + timedelta(hours=2)
            ))
            
            # Step 4: Assign driver to journey
            assignment_id = f"test_driver_assignment_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO "AssignedCrew" (id, "journeyId", "userId", "role", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """, (assignment_id, test_journey_id, driver_id, 'DRIVER'))
            
            # Step 5: Create driver journey entries
            entry_id = f"test_driver_entry_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO "JourneyEntry" (
                    id, "journeyId", "createdBy", "type", "data", "tag", "timestamp"
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """, (
                entry_id, test_journey_id, driver_id, 'GPS',
                json.dumps({"lat": 43.6532, "lng": -79.3832, "driver": driver_name}), 'COMPLETED'
            ))
            
            self.conn.commit()
            
            # Step 6: Verify driver workflow
            cursor.execute("""
                SELECT tj.id, tj.status, u.name as driver_name,
                       COUNT(je.id) as entry_count
                FROM "TruckJourney" tj
                JOIN "User" u ON tj."createdById" = u.id
                LEFT JOIN "JourneyEntry" je ON tj.id = je."journeyId"
                WHERE tj.id = %s AND u.role = 'DRIVER'
                GROUP BY tj.id, tj.status, u.name
            """, (test_journey_id,))
            
            workflow_data = cursor.fetchone()
            if workflow_data:
                journey_id, status, driver_name, entry_count = workflow_data
                print(f"   ✅ Driver workflow verified: {driver_name} has {entry_count} journey entries")
            
            # Clean up
            cursor.execute('DELETE FROM "JourneyEntry" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "AssignedCrew" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "TruckJourney" WHERE id = %s', (test_journey_id,))
            self.conn.commit()
            
            return True
            
        except Exception as e:
            print(f"   ❌ Driver journey workflow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def test_dispatcher_journey_workflow(self) -> bool:
        """Test dispatcher journey workflow"""
        print("   Testing dispatcher journey workflow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Find a dispatcher and their location
            cursor.execute("""
                SELECT u.id, u.name, u.role, l.id as location_id, l.name as location_name
                FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" = %s AND u.role = 'DISPATCHER'
                LIMIT 1
            """, (lgm_client_id,))
            
            dispatcher_data = cursor.fetchone()
            if not dispatcher_data:
                print("   ❌ No dispatcher found for workflow testing")
                return False
            
            dispatcher_id, dispatcher_name, dispatcher_role, location_id, location_name = dispatcher_data
            
            print(f"   ✅ Dispatcher: {dispatcher_name} at {location_name}")
            
            # Step 2: Get available crew for assignment
            cursor.execute("""
                SELECT u.id, u.name, u.role
                FROM "User" u
                WHERE u."locationId" = %s AND u.role IN ('DRIVER', 'MOVER')
                ORDER BY u.role, u.name
            """, (location_id,))
            
            available_crew = cursor.fetchall()
            print(f"   ✅ Available crew: {len(available_crew)}")
            
            # Step 3: Create a test journey for the dispatcher
            test_journey_id = f"test_dispatcher_journey_{uuid.uuid4().hex[:8]}"
            
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, "clientId", "locationId", "createdById", status, 
                    "truckNumber", "notes", "date", "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                test_journey_id, lgm_client_id, location_id, dispatcher_id,
                'MORNING_PREP', 'DISP-001', 'Dispatcher journey workflow test',
                datetime.now() + timedelta(days=1)
            ))
            
            # Step 4: Assign crew members
            for crew_member in available_crew[:3]:  # Assign first 3 crew members
                crew_id, crew_name, crew_role = crew_member
                assignment_id = f"test_dispatcher_assignment_{uuid.uuid4().hex[:8]}"
                
                cursor.execute("""
                    INSERT INTO "AssignedCrew" (id, "journeyId", "userId", "role", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                """, (assignment_id, test_journey_id, crew_id, crew_role))
                
                print(f"   ✅ Dispatcher assigned {crew_name} ({crew_role})")
            
            # Step 5: Create dispatcher journey entries
            entry_id = f"test_dispatcher_entry_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO "JourneyEntry" (
                    id, "journeyId", "createdBy", "type", "data", "tag", "timestamp"
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """, (
                entry_id, test_journey_id, dispatcher_id, 'NOTE',
                json.dumps({"message": "Dispatcher created and assigned crew", "dispatcher": dispatcher_name}), 'COMPLETED'
            ))
            
            self.conn.commit()
            
            # Step 6: Verify dispatcher workflow
            cursor.execute("""
                SELECT tj.id, tj.status, u.name as dispatcher_name,
                       COUNT(ac.id) as crew_count, COUNT(je.id) as entry_count
                FROM "TruckJourney" tj
                JOIN "User" u ON tj."createdById" = u.id
                LEFT JOIN "AssignedCrew" ac ON tj.id = ac."journeyId"
                LEFT JOIN "JourneyEntry" je ON tj.id = je."journeyId"
                WHERE tj.id = %s AND u.role = 'DISPATCHER'
                GROUP BY tj.id, tj.status, u.name
            """, (test_journey_id,))
            
            workflow_data = cursor.fetchone()
            if workflow_data:
                journey_id, status, dispatcher_name, crew_count, entry_count = workflow_data
                print(f"   ✅ Dispatcher workflow verified: {dispatcher_name} assigned {crew_count} crew and created {entry_count} entries")
            
            # Clean up
            cursor.execute('DELETE FROM "JourneyEntry" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "AssignedCrew" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "TruckJourney" WHERE id = %s', (test_journey_id,))
            self.conn.commit()
            
            return True
            
        except Exception as e:
            print(f"   ❌ Dispatcher journey workflow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def test_admin_journey_workflow(self) -> bool:
        """Test admin journey workflow"""
        print("   Testing admin journey workflow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Find an admin and their location
            cursor.execute("""
                SELECT u.id, u.name, u.role, l.id as location_id, l.name as location_name
                FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" = %s AND u.role = 'ADMIN'
                LIMIT 1
            """, (lgm_client_id,))
            
            admin_data = cursor.fetchone()
            if not admin_data:
                print("   ❌ No admin found for workflow testing")
                return False
            
            admin_id, admin_name, admin_role, location_id, location_name = admin_data
            
            print(f"   ✅ Admin: {admin_name} at {location_name}")
            
            # Step 2: Get journey statistics for admin
            cursor.execute("""
                SELECT 
                    COUNT(CASE WHEN tj.status = 'MORNING_PREP' THEN 1 END) as prep_count,
                    COUNT(CASE WHEN tj.status = 'EN_ROUTE' THEN 1 END) as en_route_count,
                    COUNT(CASE WHEN tj.status = 'ONSITE' THEN 1 END) as onsite_count,
                    COUNT(CASE WHEN tj.status = 'COMPLETED' THEN 1 END) as completed_count,
                    COUNT(CASE WHEN tj.status = 'AUDITED' THEN 1 END) as audited_count
                FROM "TruckJourney" tj
                WHERE tj."locationId" = %s
            """, (location_id,))
            
            journey_stats = cursor.fetchone()
            if journey_stats:
                prep_count, en_route_count, onsite_count, completed_count, audited_count = journey_stats
                print(f"   ✅ Journey statistics: PREP={prep_count}, EN_ROUTE={en_route_count}, ONSITE={onsite_count}, COMPLETED={completed_count}, AUDITED={audited_count}")
            
            # Step 3: Get crew statistics for admin
            cursor.execute("""
                SELECT 
                    COUNT(CASE WHEN u.role = 'DRIVER' THEN 1 END) as drivers,
                    COUNT(CASE WHEN u.role = 'MOVER' THEN 1 END) as movers,
                    COUNT(CASE WHEN u.role = 'DISPATCHER' THEN 1 END) as dispatchers,
                    COUNT(CASE WHEN u.role = 'MANAGER' THEN 1 END) as managers
                FROM "User" u
                WHERE u."locationId" = %s
            """, (location_id,))
            
            crew_stats = cursor.fetchone()
            if crew_stats:
                drivers, movers, dispatchers, managers = crew_stats
                print(f"   ✅ Crew statistics: Drivers={drivers}, Movers={movers}, Dispatchers={dispatchers}, Managers={managers}")
            
            # Step 4: Create admin audit entry
            audit_id = f"test_admin_audit_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO "AuditEntry" (
                    id, "clientId", "locationId", "userId", "action", 
                    "entity", "entityId", "diff", "timestamp"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (
                audit_id, lgm_client_id, location_id, admin_id, 'ADMIN_REVIEW',
                'LOCATION', location_id, json.dumps({"admin": admin_name, "action": "workflow_test"})
            ))
            
            self.conn.commit()
            
            # Step 5: Verify admin workflow
            cursor.execute("""
                SELECT COUNT(*) as audit_count
                FROM "AuditEntry"
                WHERE "userId" = %s AND "action" = 'ADMIN_REVIEW'
            """, (admin_id,))
            
            audit_count = cursor.fetchone()[0]
            print(f"   ✅ Admin workflow verified: {admin_name} created {audit_count} audit entries")
            
            # Clean up
            cursor.execute('DELETE FROM "AuditEntry" WHERE id = %s', (audit_id,))
            self.conn.commit()
            
            return True
            
        except Exception as e:
            print(f"   ❌ Admin journey workflow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def test_auditor_journey_workflow(self) -> bool:
        """Test auditor journey workflow"""
        print("   Testing auditor journey workflow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Find an auditor and their location
            cursor.execute("""
                SELECT u.id, u.name, u.role, l.id as location_id, l.name as location_name
                FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" = %s AND u.role = 'AUDITOR'
                LIMIT 1
            """, (lgm_client_id,))
            
            auditor_data = cursor.fetchone()
            if not auditor_data:
                print("   ❌ No auditor found for workflow testing")
                return False
            
            auditor_id, auditor_name, auditor_role, location_id, location_name = auditor_data
            
            print(f"   ✅ Auditor: {auditor_name} at {location_name}")
            
            # Step 2: Get completed journeys for audit
            cursor.execute("""
                SELECT tj.id, tj.status, tj."truckNumber", tj."date"
                FROM "TruckJourney" tj
                WHERE tj."locationId" = %s AND tj.status = 'COMPLETED'
                ORDER BY tj."date" DESC
                LIMIT 5
            """, (location_id,))
            
            completed_journeys = cursor.fetchall()
            print(f"   ✅ Completed journeys for audit: {len(completed_journeys)}")
            
            # Step 3: Create audit entries for completed journeys
            audit_entries = []
            for journey in completed_journeys[:2]:  # Audit first 2 completed journeys
                journey_id, status, truck_number, journey_date = journey
                audit_id = f"test_auditor_audit_{uuid.uuid4().hex[:8]}"
                
                cursor.execute("""
                    INSERT INTO "AuditEntry" (
                        id, "clientId", "locationId", "userId", "action", 
                        "entity", "entityId", "diff", "timestamp"
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """, (
                    audit_id, lgm_client_id, location_id, auditor_id, 'JOURNEY_AUDIT',
                    'TruckJourney', journey_id, json.dumps({
                        "auditor": auditor_name,
                        "journey_id": journey_id,
                        "truck_number": truck_number,
                        "audit_date": datetime.now().isoformat()
                    })
                ))
                
                audit_entries.append(audit_id)
            
            self.conn.commit()
            
            # Step 4: Verify auditor workflow
            cursor.execute("""
                SELECT COUNT(*) as audit_count
                FROM "AuditEntry"
                WHERE "userId" = %s AND "action" = 'JOURNEY_AUDIT'
            """, (auditor_id,))
            
            audit_count = cursor.fetchone()[0]
            print(f"   ✅ Auditor workflow verified: {auditor_name} created {audit_count} audit entries")
            
            # Clean up
            for audit_id in audit_entries:
                cursor.execute('DELETE FROM "AuditEntry" WHERE id = %s', (audit_id,))
            
            self.conn.commit()
            
            return True
            
        except Exception as e:
            print(f"   ❌ Auditor journey workflow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def test_cross_role_journey_workflow(self) -> bool:
        """Test cross-role collaboration workflow"""
        print("   Testing cross-role collaboration workflow...")
        
        lgm_client_id = self.get_lgm_client_id()
        if not lgm_client_id:
            return False
        
        cursor = self.conn.cursor()
        
        try:
            # Step 1: Get users from different roles at different locations
            cursor.execute("""
                SELECT u.id, u.name, u.role, l.id as location_id, l.name as location_name
                FROM "User" u
                JOIN "Location" l ON u."locationId" = l.id
                WHERE u."clientId" = %s AND u.role IN ('MANAGER', 'DISPATCHER', 'DRIVER', 'MOVER')
                ORDER BY u.role, l.name
                LIMIT 4
            """, (lgm_client_id,))
            
            cross_role_users = cursor.fetchall()
            if len(cross_role_users) < 4:
                print("   ❌ Not enough users for cross-role testing")
                return False
            
            print(f"   ✅ Cross-role collaboration with {len(cross_role_users)} users:")
            for user in cross_role_users:
                user_id, user_name, user_role, location_id, location_name = user
                print(f"   ✅ {user_name} ({user_role}) at {location_name}")
            
            # Step 2: Create a shared journey across roles
            test_journey_id = f"test_cross_role_journey_{uuid.uuid4().hex[:8]}"
            manager = cross_role_users[0]  # Use first user as manager
            manager_id, manager_name, manager_role, location_id, location_name = manager
            
            cursor.execute("""
                INSERT INTO "TruckJourney" (
                    id, "clientId", "locationId", "createdById", status, 
                    "truckNumber", "notes", "date", "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                test_journey_id, lgm_client_id, location_id, manager_id,
                'MORNING_PREP', 'CROSS-001', 'Cross-role collaboration test',
                datetime.now() + timedelta(days=1)
            ))
            
            # Step 3: Assign users from different roles
            for user in cross_role_users[1:]:  # Assign other users
                user_id, user_name, user_role, user_location_id, user_location_name = user
                assignment_id = f"test_cross_role_assignment_{uuid.uuid4().hex[:8]}"
                
                cursor.execute("""
                    INSERT INTO "AssignedCrew" (id, "journeyId", "userId", "role", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                """, (assignment_id, test_journey_id, user_id, user_role))
                
                print(f"   ✅ Assigned {user_name} ({user_role}) to cross-role journey")
            
            # Step 4: Create entries from different roles
            for i, user in enumerate(cross_role_users):
                user_id, user_name, user_role, user_location_id, user_location_name = user
                entry_id = f"test_cross_role_entry_{uuid.uuid4().hex[:8]}"
                
                cursor.execute("""
                    INSERT INTO "JourneyEntry" (
                        id, "journeyId", "createdBy", "type", "data", "tag", "timestamp"
                    ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """, (
                    entry_id, test_journey_id, user_id, 'NOTE',
                    json.dumps({
                        "message": f"Cross-role collaboration entry from {user_role}",
                        "user": user_name,
                        "role": user_role
                    }), 'COMPLETED'
                ))
            
            self.conn.commit()
            
            # Step 5: Verify cross-role collaboration
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT ac."userId") as unique_users,
                    COUNT(DISTINCT u.role) as unique_roles,
                    COUNT(je.id) as total_entries
                FROM "TruckJourney" tj
                LEFT JOIN "AssignedCrew" ac ON tj.id = ac."journeyId"
                LEFT JOIN "User" u ON ac."userId" = u.id
                LEFT JOIN "JourneyEntry" je ON tj.id = je."journeyId"
                WHERE tj.id = %s
            """, (test_journey_id,))
            
            collaboration_data = cursor.fetchone()
            if collaboration_data:
                unique_users, unique_roles, total_entries = collaboration_data
                print(f"   ✅ Cross-role collaboration verified: {unique_users} users, {unique_roles} roles, {total_entries} entries")
            
            # Clean up
            cursor.execute('DELETE FROM "JourneyEntry" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "AssignedCrew" WHERE "journeyId" = %s', (test_journey_id,))
            cursor.execute('DELETE FROM "TruckJourney" WHERE id = %s', (test_journey_id,))
            self.conn.commit()
            
            return True
            
        except Exception as e:
            print(f"   ❌ Cross-role collaboration workflow failed: {e}")
            self.conn.rollback()
            return False
        finally:
            cursor.close()
    
    def run_all_tests(self):
        """Run all user journey workflow tests"""
        print("🚀 Starting Comprehensive User Journey Workflow Tests")
        print("=" * 60)
        
        if not self.connect():
            return False
        
        try:
            tests = [
                ("Manager Journey Workflow", self.test_manager_journey_workflow),
                ("Driver Journey Workflow", self.test_driver_journey_workflow),
                ("Dispatcher Journey Workflow", self.test_dispatcher_journey_workflow),
                ("Admin Journey Workflow", self.test_admin_journey_workflow),
                ("Auditor Journey Workflow", self.test_auditor_journey_workflow),
                ("Cross-Role Collaboration Workflow", self.test_cross_role_journey_workflow)
            ]
            
            for test_name, test_func in tests:
                self.run_test(test_name, test_func)
            
        finally:
            self.disconnect()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 USER JOURNEY WORKFLOW SUMMARY")
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
    tester = UserJourneyWorkflowTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 