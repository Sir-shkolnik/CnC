"""
Sales Activity Service Layer
C&C CRM - Sales Activity Management Business Logic
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import json
import logging

from ..database import get_database_connection
from ..models.customer import SalesActivityCreate, SalesActivityUpdate, SalesActivityResponse

logger = logging.getLogger(__name__)

class SalesActivityService:
    def __init__(self, client_id: str, location_id: str):
        self.client_id = client_id
        self.location_id = location_id
        self.db = None

    async def _get_db(self):
        if not self.db:
            self.db = await get_database_connection()
        return self.db

    async def create_activity(self, activity_data: SalesActivityCreate, user_id: str) -> SalesActivityResponse:
        """Create a new sales activity"""
        try:
            db = await self._get_db()
            
            # Validate that either leadId or customerId is provided
            if not activity_data.leadId and not activity_data.customerId:
                raise ValueError("Either leadId or customerId must be provided")

            # Validate lead exists if provided
            if activity_data.leadId:
                lead = await db.fetch_one(
                    """
                    SELECT l.id FROM "Lead" l
                    JOIN "Customer" c ON l.customerId = c.id
                    WHERE l.id = $1 AND c.clientId = $2
                    """,
                    activity_data.leadId, self.client_id
                )
                if not lead:
                    raise ValueError("Lead not found")

            # Validate customer exists if provided
            if activity_data.customerId:
                customer = await db.fetch_one(
                    "SELECT id FROM \"Customer\" WHERE id = $1 AND clientId = $2",
                    activity_data.customerId, self.client_id
                )
                if not customer:
                    raise ValueError("Customer not found")

            # Create activity
            activity_id = await db.fetch_val(
                """
                INSERT INTO "SalesActivity" (
                    leadId, customerId, userId, type, subject, description,
                    outcome, nextAction, scheduledDate, completedDate,
                    duration, cost, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
                """,
                activity_data.leadId,
                activity_data.customerId,
                user_id,
                activity_data.type,
                activity_data.subject,
                activity_data.description,
                activity_data.outcome,
                activity_data.nextAction,
                activity_data.scheduledDate,
                activity_data.completedDate,
                activity_data.duration,
                activity_data.cost,
                activity_data.notes
            )

            # Return created activity
            return await self.get_activity(activity_id)

        except Exception as e:
            logger.error(f"Error creating sales activity: {str(e)}")
            raise

    async def get_activities(
        self,
        skip: int = 0,
        limit: int = 100,
        type: Optional[str] = None,
        customer_id: Optional[str] = None,
        lead_id: Optional[str] = None
    ) -> List[SalesActivityResponse]:
        """Get sales activities with filtering and pagination"""
        try:
            db = await self._get_db()
            
            # Build query conditions
            conditions = ["(c.clientId = $1 OR l.customerId IN (SELECT id FROM \"Customer\" WHERE clientId = $1))"]
            params = [self.client_id]
            param_count = 1

            if type:
                param_count += 1
                conditions.append(f"sa.type = ${param_count}")
                params.append(type)

            if customer_id:
                param_count += 1
                conditions.append(f"sa.customerId = ${param_count}")
                params.append(customer_id)

            if lead_id:
                param_count += 1
                conditions.append(f"sa.leadId = ${param_count}")
                params.append(lead_id)

            where_clause = " AND ".join(conditions)
            
            # Add pagination parameters
            param_count += 1
            params.append(skip)
            param_count += 1
            params.append(limit)

            query = f"""
                SELECT 
                    sa.id, sa.leadId, sa.customerId, sa.userId, sa.type,
                    sa.subject, sa.description, sa.outcome, sa.nextAction,
                    sa.scheduledDate, sa.completedDate, sa.duration, sa.cost,
                    sa.notes, sa.createdAt, sa.updatedAt,
                    u.name as userName,
                    c.firstName as customerFirstName, c.lastName as customerLastName,
                    c.email as customerEmail, c.phone as customerPhone
                FROM "SalesActivity" sa
                LEFT JOIN "User" u ON sa.userId = u.id
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE {where_clause}
                ORDER BY sa.createdAt DESC
                LIMIT ${param_count - 1} OFFSET ${param_count}
            """

            rows = await db.fetch_all(query, *params)
            
            activities = []
            for row in rows:
                activity = SalesActivityResponse(
                    id=row["id"],
                    leadId=row["leadId"],
                    customerId=row["customerId"],
                    userId=row["userId"],
                    userName=row["userName"],
                    type=row["type"],
                    subject=row["subject"],
                    description=row["description"],
                    outcome=row["outcome"],
                    nextAction=row["nextAction"],
                    scheduledDate=row["scheduledDate"],
                    completedDate=row["completedDate"],
                    duration=row["duration"],
                    cost=row["cost"],
                    notes=row["notes"],
                    customerName=f"{row['customerFirstName']} {row['customerLastName']}" if row['customerFirstName'] else None,
                    customerEmail=row["customerEmail"],
                    customerPhone=row["customerPhone"],
                    createdAt=row["createdAt"],
                    updatedAt=row["updatedAt"]
                )
                activities.append(activity)

            return activities

        except Exception as e:
            logger.error(f"Error getting sales activities: {str(e)}")
            raise

    async def get_activities_by_customer(
        self, 
        customer_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[SalesActivityResponse]:
        """Get all sales activities for a specific customer"""
        try:
            return await self.get_activities(
                skip=skip,
                limit=limit,
                customer_id=customer_id
            )
        except Exception as e:
            logger.error(f"Error getting activities by customer: {str(e)}")
            raise

    async def get_activity(self, activity_id: str) -> Optional[SalesActivityResponse]:
        """Get a specific sales activity by ID"""
        try:
            db = await self._get_db()
            
            row = await db.fetch_one(
                """
                SELECT 
                    sa.id, sa.leadId, sa.customerId, sa.userId, sa.type,
                    sa.subject, sa.description, sa.outcome, sa.nextAction,
                    sa.scheduledDate, sa.completedDate, sa.duration, sa.cost,
                    sa.notes, sa.createdAt, sa.updatedAt,
                    u.name as userName,
                    c.firstName as customerFirstName, c.lastName as customerLastName,
                    c.email as customerEmail, c.phone as customerPhone
                FROM "SalesActivity" sa
                LEFT JOIN "User" u ON sa.userId = u.id
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE sa.id = $1 AND (c.clientId = $2 OR l.customerId IN (SELECT id FROM "Customer" WHERE clientId = $2))
                """,
                activity_id, self.client_id
            )

            if not row:
                return None

            return SalesActivityResponse(
                id=row["id"],
                leadId=row["leadId"],
                customerId=row["customerId"],
                userId=row["userId"],
                userName=row["userName"],
                type=row["type"],
                subject=row["subject"],
                description=row["description"],
                outcome=row["outcome"],
                nextAction=row["nextAction"],
                scheduledDate=row["scheduledDate"],
                completedDate=row["completedDate"],
                duration=row["duration"],
                cost=row["cost"],
                notes=row["notes"],
                customerName=f"{row['customerFirstName']} {row['customerLastName']}" if row['customerFirstName'] else None,
                customerEmail=row["customerEmail"],
                customerPhone=row["customerPhone"],
                createdAt=row["createdAt"],
                updatedAt=row["updatedAt"]
            )

        except Exception as e:
            logger.error(f"Error getting sales activity: {str(e)}")
            raise

    async def update_activity(
        self, 
        activity_id: str, 
        activity_data: SalesActivityUpdate, 
        user_id: str
    ) -> Optional[SalesActivityResponse]:
        """Update a sales activity"""
        try:
            db = await self._get_db()
            
            # Check if activity exists and belongs to client
            existing = await db.fetch_one(
                """
                SELECT sa.id FROM "SalesActivity" sa
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE sa.id = $1 AND (c.clientId = $2 OR l.customerId IN (SELECT id FROM "Customer" WHERE clientId = $2))
                """,
                activity_id, self.client_id
            )
            
            if not existing:
                return None

            # Build update query dynamically
            update_fields = []
            params = [activity_id]
            param_count = 1

            if activity_data.leadId is not None:
                param_count += 1
                update_fields.append(f"leadId = ${param_count}")
                params.append(activity_data.leadId)

            if activity_data.customerId is not None:
                param_count += 1
                update_fields.append(f"customerId = ${param_count}")
                params.append(activity_data.customerId)

            if activity_data.type is not None:
                param_count += 1
                update_fields.append(f"type = ${param_count}")
                params.append(activity_data.type)

            if activity_data.subject is not None:
                param_count += 1
                update_fields.append(f"subject = ${param_count}")
                params.append(activity_data.subject)

            if activity_data.description is not None:
                param_count += 1
                update_fields.append(f"description = ${param_count}")
                params.append(activity_data.description)

            if activity_data.outcome is not None:
                param_count += 1
                update_fields.append(f"outcome = ${param_count}")
                params.append(activity_data.outcome)

            if activity_data.nextAction is not None:
                param_count += 1
                update_fields.append(f"nextAction = ${param_count}")
                params.append(activity_data.nextAction)

            if activity_data.scheduledDate is not None:
                param_count += 1
                update_fields.append(f"scheduledDate = ${param_count}")
                params.append(activity_data.scheduledDate)

            if activity_data.completedDate is not None:
                param_count += 1
                update_fields.append(f"completedDate = ${param_count}")
                params.append(activity_data.completedDate)

            if activity_data.duration is not None:
                param_count += 1
                update_fields.append(f"duration = ${param_count}")
                params.append(activity_data.duration)

            if activity_data.cost is not None:
                param_count += 1
                update_fields.append(f"cost = ${param_count}")
                params.append(activity_data.cost)

            if activity_data.notes is not None:
                param_count += 1
                update_fields.append(f"notes = ${param_count}")
                params.append(activity_data.notes)

            if not update_fields:
                return await self.get_activity(activity_id)

            # Add updatedAt
            param_count += 1
            update_fields.append(f"updatedAt = ${param_count}")
            params.append(datetime.utcnow())

            query = f"""
                UPDATE "SalesActivity" 
                SET {', '.join(update_fields)}
                WHERE id = $1
            """

            await db.execute(query, *params)

            return await self.get_activity(activity_id)

        except Exception as e:
            logger.error(f"Error updating sales activity: {str(e)}")
            raise

    async def get_analytics(self) -> Dict[str, Any]:
        """Get sales activity analytics"""
        try:
            db = await self._get_db()
            
            # Get total activities
            total_activities = await db.fetch_val(
                """
                SELECT COUNT(*) FROM "SalesActivity" sa
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE c.clientId = $1 OR l.customerId IN (SELECT id FROM "Customer" WHERE clientId = $1)
                """,
                self.client_id
            )

            # Get activities by type
            activities_by_type = await db.fetch_all(
                """
                SELECT sa.type, COUNT(*) as count
                FROM "SalesActivity" sa
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE c.clientId = $1 OR l.customerId IN (SELECT id FROM "Customer" WHERE clientId = $1)
                GROUP BY sa.type
                """,
                self.client_id
            )

            # Get activities by user
            activities_by_user = await db.fetch_all(
                """
                SELECT u.name, COUNT(*) as count
                FROM "SalesActivity" sa
                LEFT JOIN "User" u ON sa.userId = u.id
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE (c.clientId = $1 OR l.customerId IN (SELECT id FROM "Customer" WHERE clientId = $1))
                GROUP BY u.name
                ORDER BY count DESC
                LIMIT 10
                """,
                self.client_id
            )

            # Get average duration
            average_duration = await db.fetch_val(
                """
                SELECT AVG(sa.duration) FROM "SalesActivity" sa
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE (c.clientId = $1 OR l.customerId IN (SELECT id FROM "Customer" WHERE clientId = $1))
                AND sa.duration IS NOT NULL
                """,
                self.client_id
            )

            # Get total cost
            total_cost = await db.fetch_val(
                """
                SELECT COALESCE(SUM(sa.cost), 0) FROM "SalesActivity" sa
                LEFT JOIN "Customer" c ON sa.customerId = c.id
                LEFT JOIN "Lead" l ON sa.leadId = l.id
                WHERE (c.clientId = $1 OR l.customerId IN (SELECT id FROM "Customer" WHERE clientId = $1))
                AND sa.cost IS NOT NULL
                """,
                self.client_id
            )

            return {
                "totalActivities": total_activities,
                "activitiesByType": {row["type"]: row["count"] for row in activities_by_type},
                "activitiesByUser": {row["name"]: row["count"] for row in activities_by_user},
                "averageDuration": round(float(average_duration) if average_duration else 0, 2),
                "totalCost": float(total_cost) if total_cost else 0
            }

        except Exception as e:
            logger.error(f"Error getting sales activity analytics: {str(e)}")
            raise 