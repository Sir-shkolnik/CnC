"""
Customer Service Layer
C&C CRM - Customer Management Business Logic
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import json
import logging

from ..database import get_database_connection
from ..models.customer import CustomerCreate, CustomerUpdate, CustomerResponse

logger = logging.getLogger(__name__)

class CustomerService:
    def __init__(self, client_id: str, location_id: str):
        self.client_id = client_id
        self.location_id = location_id
        self.db = None

    async def _get_db(self):
        if not self.db:
            self.db = await get_database_connection()
        return self.db

    async def create_customer(self, customer_data: CustomerCreate, user_id: str) -> CustomerResponse:
        """Create a new customer"""
        try:
            db = await self._get_db()
            
            # Validate email uniqueness within client
            existing_customer = await db.fetch_one(
                """
                SELECT id FROM "Customer" 
                WHERE email = $1 AND clientId = $2 AND isActive = true
                """,
                customer_data.email, self.client_id
            )
            
            if existing_customer:
                raise ValueError("Customer with this email already exists")

            # Validate phone uniqueness within client
            existing_customer = await db.fetch_one(
                """
                SELECT id FROM "Customer" 
                WHERE phone = $1 AND clientId = $2 AND isActive = true
                """,
                customer_data.phone, self.client_id
            )
            
            if existing_customer:
                raise ValueError("Customer with this phone already exists")

            # Create customer
            customer_id = await db.fetch_val(
                """
                INSERT INTO "Customer" (
                    clientId, firstName, lastName, email, phone, address,
                    leadSource, leadStatus, assignedTo, estimatedValue,
                    notes, tags, preferences, createdBy, updatedBy
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id
                """,
                self.client_id,
                customer_data.firstName,
                customer_data.lastName,
                customer_data.email,
                customer_data.phone,
                json.dumps(customer_data.address),
                customer_data.leadSource,
                customer_data.leadStatus or "NEW",
                customer_data.assignedTo,
                customer_data.estimatedValue,
                customer_data.notes,
                customer_data.tags or [],
                json.dumps(customer_data.preferences) if customer_data.preferences else None,
                user_id,
                user_id
            )

            # Return created customer
            return await self.get_customer(customer_id)

        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}")
            raise

    async def get_customers(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        lead_status: Optional[str] = None,
        assigned_to: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[CustomerResponse]:
        """Get customers with filtering and pagination"""
        try:
            db = await self._get_db()
            
            # Build query conditions
            conditions = ["clientId = $1"]
            params = [self.client_id]
            param_count = 1

            if search:
                param_count += 1
                conditions.append(f"(firstName ILIKE ${param_count} OR lastName ILIKE ${param_count} OR email ILIKE ${param_count})")
                params.append(f"%{search}%")

            if lead_status:
                param_count += 1
                conditions.append(f"leadStatus = ${param_count}")
                params.append(lead_status)

            if assigned_to:
                param_count += 1
                conditions.append(f"assignedTo = ${param_count}")
                params.append(assigned_to)

            if is_active is not None:
                param_count += 1
                conditions.append(f"isActive = ${param_count}")
                params.append(is_active)

            where_clause = " AND ".join(conditions)
            
            # Add pagination parameters
            param_count += 1
            params.append(skip)
            param_count += 1
            params.append(limit)

            query = f"""
                SELECT 
                    c.id, c.firstName, c.lastName, c.email, c.phone, c.address,
                    c.leadSource, c.leadStatus, c.assignedTo, c.estimatedValue,
                    c.notes, c.tags, c.preferences, c.isActive, c.createdAt, c.updatedAt,
                    u.name as assignedUserName,
                    COUNT(l.id) as leadCount,
                    COUNT(sa.id) as activityCount
                FROM "Customer" c
                LEFT JOIN "User" u ON c.assignedTo = u.id
                LEFT JOIN "Lead" l ON c.id = l.customerId
                LEFT JOIN "SalesActivity" sa ON c.id = sa.customerId
                WHERE {where_clause}
                GROUP BY c.id, u.name
                ORDER BY c.createdAt DESC
                LIMIT ${param_count - 1} OFFSET ${param_count}
            """

            rows = await db.fetch_all(query, *params)
            
            customers = []
            for row in rows:
                customer = CustomerResponse(
                    id=row["id"],
                    firstName=row["firstName"],
                    lastName=row["lastName"],
                    email=row["email"],
                    phone=row["phone"],
                    address=json.loads(row["address"]) if row["address"] else {},
                    leadSource=row["leadSource"],
                    leadStatus=row["leadStatus"],
                    assignedTo=row["assignedTo"],
                    assignedUserName=row["assignedUserName"],
                    estimatedValue=row["estimatedValue"],
                    notes=row["notes"],
                    tags=row["tags"] or [],
                    preferences=json.loads(row["preferences"]) if row["preferences"] else {},
                    isActive=row["isActive"],
                    leadCount=row["leadCount"],
                    activityCount=row["activityCount"],
                    createdAt=row["createdAt"],
                    updatedAt=row["updatedAt"]
                )
                customers.append(customer)

            return customers

        except Exception as e:
            logger.error(f"Error getting customers: {str(e)}")
            raise

    async def get_customer(self, customer_id: str) -> Optional[CustomerResponse]:
        """Get a specific customer by ID"""
        try:
            db = await self._get_db()
            
            row = await db.fetch_one(
                """
                SELECT 
                    c.id, c.firstName, c.lastName, c.email, c.phone, c.address,
                    c.leadSource, c.leadStatus, c.assignedTo, c.estimatedValue,
                    c.notes, c.tags, c.preferences, c.isActive, c.createdAt, c.updatedAt,
                    u.name as assignedUserName,
                    COUNT(l.id) as leadCount,
                    COUNT(sa.id) as activityCount
                FROM "Customer" c
                LEFT JOIN "User" u ON c.assignedTo = u.id
                LEFT JOIN "Lead" l ON c.id = l.customerId
                LEFT JOIN "SalesActivity" sa ON c.id = sa.customerId
                WHERE c.id = $1 AND c.clientId = $2
                GROUP BY c.id, u.name
                """,
                customer_id, self.client_id
            )

            if not row:
                return None

            return CustomerResponse(
                id=row["id"],
                firstName=row["firstName"],
                lastName=row["lastName"],
                email=row["email"],
                phone=row["phone"],
                address=json.loads(row["address"]) if row["address"] else {},
                leadSource=row["leadSource"],
                leadStatus=row["leadStatus"],
                assignedTo=row["assignedTo"],
                assignedUserName=row["assignedUserName"],
                estimatedValue=row["estimatedValue"],
                notes=row["notes"],
                tags=row["tags"] or [],
                preferences=json.loads(row["preferences"]) if row["preferences"] else {},
                isActive=row["isActive"],
                leadCount=row["leadCount"],
                activityCount=row["activityCount"],
                createdAt=row["createdAt"],
                updatedAt=row["updatedAt"]
            )

        except Exception as e:
            logger.error(f"Error getting customer: {str(e)}")
            raise

    async def update_customer(
        self, 
        customer_id: str, 
        customer_data: CustomerUpdate, 
        user_id: str
    ) -> Optional[CustomerResponse]:
        """Update a customer"""
        try:
            db = await self._get_db()
            
            # Check if customer exists and belongs to client
            existing = await db.fetch_one(
                "SELECT id FROM \"Customer\" WHERE id = $1 AND clientId = $2",
                customer_id, self.client_id
            )
            
            if not existing:
                return None

            # Build update query dynamically
            update_fields = []
            params = [customer_id, user_id]
            param_count = 2

            if customer_data.firstName is not None:
                param_count += 1
                update_fields.append(f"firstName = ${param_count}")
                params.append(customer_data.firstName)

            if customer_data.lastName is not None:
                param_count += 1
                update_fields.append(f"lastName = ${param_count}")
                params.append(customer_data.lastName)

            if customer_data.email is not None:
                # Check email uniqueness
                existing_email = await db.fetch_one(
                    """
                    SELECT id FROM "Customer" 
                    WHERE email = $1 AND clientId = $2 AND id != $3 AND isActive = true
                    """,
                    customer_data.email, self.client_id, customer_id
                )
                if existing_email:
                    raise ValueError("Customer with this email already exists")
                
                param_count += 1
                update_fields.append(f"email = ${param_count}")
                params.append(customer_data.email)

            if customer_data.phone is not None:
                # Check phone uniqueness
                existing_phone = await db.fetch_one(
                    """
                    SELECT id FROM "Customer" 
                    WHERE phone = $1 AND clientId = $2 AND id != $3 AND isActive = true
                    """,
                    customer_data.phone, self.client_id, customer_id
                )
                if existing_phone:
                    raise ValueError("Customer with this phone already exists")
                
                param_count += 1
                update_fields.append(f"phone = ${param_count}")
                params.append(customer_data.phone)

            if customer_data.address is not None:
                param_count += 1
                update_fields.append(f"address = ${param_count}")
                params.append(json.dumps(customer_data.address))

            if customer_data.leadSource is not None:
                param_count += 1
                update_fields.append(f"leadSource = ${param_count}")
                params.append(customer_data.leadSource)

            if customer_data.leadStatus is not None:
                param_count += 1
                update_fields.append(f"leadStatus = ${param_count}")
                params.append(customer_data.leadStatus)

            if customer_data.assignedTo is not None:
                param_count += 1
                update_fields.append(f"assignedTo = ${param_count}")
                params.append(customer_data.assignedTo)

            if customer_data.estimatedValue is not None:
                param_count += 1
                update_fields.append(f"estimatedValue = ${param_count}")
                params.append(customer_data.estimatedValue)

            if customer_data.notes is not None:
                param_count += 1
                update_fields.append(f"notes = ${param_count}")
                params.append(customer_data.notes)

            if customer_data.tags is not None:
                param_count += 1
                update_fields.append(f"tags = ${param_count}")
                params.append(customer_data.tags)

            if customer_data.preferences is not None:
                param_count += 1
                update_fields.append(f"preferences = ${param_count}")
                params.append(json.dumps(customer_data.preferences))

            if customer_data.isActive is not None:
                param_count += 1
                update_fields.append(f"isActive = ${param_count}")
                params.append(customer_data.isActive)

            if not update_fields:
                return await self.get_customer(customer_id)

            # Add updatedAt
            param_count += 1
            update_fields.append(f"updatedAt = ${param_count}")
            params.append(datetime.utcnow())

            # Add updatedBy
            param_count += 1
            update_fields.append(f"updatedBy = ${param_count}")
            params.append(user_id)

            query = f"""
                UPDATE "Customer" 
                SET {', '.join(update_fields)}
                WHERE id = $1 AND clientId = $2
            """
            params.append(self.client_id)

            await db.execute(query, *params)

            return await self.get_customer(customer_id)

        except Exception as e:
            logger.error(f"Error updating customer: {str(e)}")
            raise

    async def delete_customer(self, customer_id: str, user_id: str) -> bool:
        """Soft delete a customer"""
        try:
            db = await self._get_db()
            
            result = await db.execute(
                """
                UPDATE "Customer" 
                SET isActive = false, updatedAt = $1, updatedBy = $2
                WHERE id = $3 AND clientId = $4
                """,
                datetime.utcnow(), user_id, customer_id, self.client_id
            )
            
            return result.rowcount > 0

        except Exception as e:
            logger.error(f"Error deleting customer: {str(e)}")
            raise

    async def get_analytics_overview(self) -> Dict[str, Any]:
        """Get customer analytics overview"""
        try:
            db = await self._get_db()
            
            # Get total customers
            total_customers = await db.fetch_val(
                "SELECT COUNT(*) FROM \"Customer\" WHERE clientId = $1 AND isActive = true",
                self.client_id
            )

            # Get customers by lead status
            customers_by_status = await db.fetch_all(
                """
                SELECT leadStatus, COUNT(*) as count
                FROM "Customer"
                WHERE clientId = $1 AND isActive = true
                GROUP BY leadStatus
                """,
                self.client_id
            )

            # Get customers by source
            customers_by_source = await db.fetch_all(
                """
                SELECT leadSource, COUNT(*) as count
                FROM "Customer"
                WHERE clientId = $1 AND isActive = true AND leadSource IS NOT NULL
                GROUP BY leadSource
                ORDER BY count DESC
                LIMIT 10
                """,
                self.client_id
            )

            # Get recent customers (last 30 days)
            recent_customers = await db.fetch_val(
                """
                SELECT COUNT(*) FROM "Customer"
                WHERE clientId = $1 AND isActive = true 
                AND createdAt >= $2
                """,
                self.client_id, datetime.utcnow() - timedelta(days=30)
            )

            # Get total estimated value
            total_value = await db.fetch_val(
                """
                SELECT COALESCE(SUM(estimatedValue), 0)
                FROM "Customer"
                WHERE clientId = $1 AND isActive = true AND estimatedValue IS NOT NULL
                """,
                self.client_id
            )

            return {
                "totalCustomers": total_customers,
                "customersByStatus": {row["leadStatus"]: row["count"] for row in customers_by_status},
                "customersBySource": {row["leadSource"]: row["count"] for row in customers_by_source},
                "recentCustomers": recent_customers,
                "totalEstimatedValue": float(total_value) if total_value else 0
            }

        except Exception as e:
            logger.error(f"Error getting customer analytics: {str(e)}")
            raise 