"""
Lead Service Layer
C&C CRM - Lead Management Business Logic
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import json
import logging

from ..database import get_database_connection
from ..models.customer import LeadCreate, LeadUpdate, LeadResponse

logger = logging.getLogger(__name__)

class LeadService:
    def __init__(self, client_id: str, location_id: str):
        self.client_id = client_id
        self.location_id = location_id
        self.db = None

    async def _get_db(self):
        if not self.db:
            self.db = await get_database_connection()
        return self.db

    async def create_lead(self, customer_id: str, lead_data: LeadCreate, user_id: str) -> LeadResponse:
        """Create a new lead for a customer"""
        try:
            db = await self._get_db()
            
            # Validate customer exists and belongs to client
            customer = await db.fetch_one(
                """
                SELECT c.id FROM "Customer" c
                WHERE c.id = $1 AND c.clientId = $2
                """,
                customer_id, self.client_id
            )
            
            if not customer:
                raise ValueError("Customer not found")

            # Create lead
            lead_id = await db.fetch_val(
                """
                INSERT INTO "Lead" (
                    customerId, source, status, priority, estimatedMoveDate,
                    estimatedValue, notes, followUpDate, contactHistory,
                    score, qualificationCriteria, createdBy, updatedBy
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
                """,
                customer_id,
                lead_data.source,
                lead_data.status or "NEW",
                lead_data.priority or "MEDIUM",
                lead_data.estimatedMoveDate,
                lead_data.estimatedValue,
                lead_data.notes,
                lead_data.followUpDate,
                json.dumps(lead_data.contactHistory or []),
                lead_data.score or 0,
                json.dumps(lead_data.qualificationCriteria or {}),
                user_id,
                user_id
            )

            # Return created lead
            return await self.get_lead(lead_id)

        except Exception as e:
            logger.error(f"Error creating lead: {str(e)}")
            raise

    async def get_leads(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        source: Optional[str] = None
    ) -> List[LeadResponse]:
        """Get leads with filtering and pagination"""
        try:
            db = await self._get_db()
            
            # Build query conditions
            conditions = ["c.clientId = $1"]
            params = [self.client_id]
            param_count = 1

            if status:
                param_count += 1
                conditions.append(f"l.status = ${param_count}")
                params.append(status)

            if priority:
                param_count += 1
                conditions.append(f"l.priority = ${param_count}")
                params.append(priority)

            if source:
                param_count += 1
                conditions.append(f"l.source = ${param_count}")
                params.append(source)

            where_clause = " AND ".join(conditions)
            
            # Add pagination parameters
            param_count += 1
            params.append(skip)
            param_count += 1
            params.append(limit)

            query = f"""
                SELECT 
                    l.id, l.customerId, l.source, l.status, l.priority,
                    l.estimatedMoveDate, l.estimatedValue, l.notes,
                    l.followUpDate, l.lastContact, l.contactHistory,
                    l.score, l.qualificationCriteria, l.createdAt, l.updatedAt,
                    c.firstName as customerFirstName, c.lastName as customerLastName,
                    c.email as customerEmail, c.phone as customerPhone
                FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE {where_clause}
                ORDER BY l.createdAt DESC
                LIMIT ${param_count - 1} OFFSET ${param_count}
            """

            rows = await db.fetch_all(query, *params)
            
            leads = []
            for row in rows:
                lead = LeadResponse(
                    id=row["id"],
                    customerId=row["customerId"],
                    customerName=f"{row['customerFirstName']} {row['customerLastName']}",
                    customerEmail=row["customerEmail"],
                    customerPhone=row["customerPhone"],
                    source=row["source"],
                    status=row["status"],
                    priority=row["priority"],
                    estimatedMoveDate=row["estimatedMoveDate"],
                    estimatedValue=row["estimatedValue"],
                    notes=row["notes"],
                    followUpDate=row["followUpDate"],
                    lastContact=row["lastContact"],
                    contactHistory=json.loads(row["contactHistory"]) if row["contactHistory"] else [],
                    score=row["score"],
                    qualificationCriteria=json.loads(row["qualificationCriteria"]) if row["qualificationCriteria"] else {},
                    createdAt=row["createdAt"],
                    updatedAt=row["updatedAt"]
                )
                leads.append(lead)

            return leads

        except Exception as e:
            logger.error(f"Error getting leads: {str(e)}")
            raise

    async def get_leads_by_customer(self, customer_id: str) -> List[LeadResponse]:
        """Get all leads for a specific customer"""
        try:
            db = await self._get_db()
            
            rows = await db.fetch_all(
                """
                SELECT 
                    l.id, l.customerId, l.source, l.status, l.priority,
                    l.estimatedMoveDate, l.estimatedValue, l.notes,
                    l.followUpDate, l.lastContact, l.contactHistory,
                    l.score, l.qualificationCriteria, l.createdAt, l.updatedAt,
                    c.firstName as customerFirstName, c.lastName as customerLastName,
                    c.email as customerEmail, c.phone as customerPhone
                FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE l.customerId = $1 AND c.clientId = $2
                ORDER BY l.createdAt DESC
                """,
                customer_id, self.client_id
            )
            
            leads = []
            for row in rows:
                lead = LeadResponse(
                    id=row["id"],
                    customerId=row["customerId"],
                    customerName=f"{row['customerFirstName']} {row['customerLastName']}",
                    customerEmail=row["customerEmail"],
                    customerPhone=row["customerPhone"],
                    source=row["source"],
                    status=row["status"],
                    priority=row["priority"],
                    estimatedMoveDate=row["estimatedMoveDate"],
                    estimatedValue=row["estimatedValue"],
                    notes=row["notes"],
                    followUpDate=row["followUpDate"],
                    lastContact=row["lastContact"],
                    contactHistory=json.loads(row["contactHistory"]) if row["contactHistory"] else [],
                    score=row["score"],
                    qualificationCriteria=json.loads(row["qualificationCriteria"]) if row["qualificationCriteria"] else {},
                    createdAt=row["createdAt"],
                    updatedAt=row["updatedAt"]
                )
                leads.append(lead)

            return leads

        except Exception as e:
            logger.error(f"Error getting leads by customer: {str(e)}")
            raise

    async def get_lead(self, lead_id: str) -> Optional[LeadResponse]:
        """Get a specific lead by ID"""
        try:
            db = await self._get_db()
            
            row = await db.fetch_one(
                """
                SELECT 
                    l.id, l.customerId, l.source, l.status, l.priority,
                    l.estimatedMoveDate, l.estimatedValue, l.notes,
                    l.followUpDate, l.lastContact, l.contactHistory,
                    l.score, l.qualificationCriteria, l.createdAt, l.updatedAt,
                    c.firstName as customerFirstName, c.lastName as customerLastName,
                    c.email as customerEmail, c.phone as customerPhone
                FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE l.id = $1 AND c.clientId = $2
                """,
                lead_id, self.client_id
            )

            if not row:
                return None

            return LeadResponse(
                id=row["id"],
                customerId=row["customerId"],
                customerName=f"{row['customerFirstName']} {row['customerLastName']}",
                customerEmail=row["customerEmail"],
                customerPhone=row["customerPhone"],
                source=row["source"],
                status=row["status"],
                priority=row["priority"],
                estimatedMoveDate=row["estimatedMoveDate"],
                estimatedValue=row["estimatedValue"],
                notes=row["notes"],
                followUpDate=row["followUpDate"],
                lastContact=row["lastContact"],
                contactHistory=json.loads(row["contactHistory"]) if row["contactHistory"] else [],
                score=row["score"],
                qualificationCriteria=json.loads(row["qualificationCriteria"]) if row["qualificationCriteria"] else {},
                createdAt=row["createdAt"],
                updatedAt=row["updatedAt"]
            )

        except Exception as e:
            logger.error(f"Error getting lead: {str(e)}")
            raise

    async def update_lead(
        self, 
        lead_id: str, 
        lead_data: LeadUpdate, 
        user_id: str
    ) -> Optional[LeadResponse]:
        """Update a lead"""
        try:
            db = await self._get_db()
            
            # Check if lead exists and belongs to client
            existing = await db.fetch_one(
                """
                SELECT l.id FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE l.id = $1 AND c.clientId = $2
                """,
                lead_id, self.client_id
            )
            
            if not existing:
                return None

            # Build update query dynamically
            update_fields = []
            params = [lead_id, user_id]
            param_count = 2

            if lead_data.source is not None:
                param_count += 1
                update_fields.append(f"source = ${param_count}")
                params.append(lead_data.source)

            if lead_data.status is not None:
                param_count += 1
                update_fields.append(f"status = ${param_count}")
                params.append(lead_data.status)

            if lead_data.priority is not None:
                param_count += 1
                update_fields.append(f"priority = ${param_count}")
                params.append(lead_data.priority)

            if lead_data.estimatedMoveDate is not None:
                param_count += 1
                update_fields.append(f"estimatedMoveDate = ${param_count}")
                params.append(lead_data.estimatedMoveDate)

            if lead_data.estimatedValue is not None:
                param_count += 1
                update_fields.append(f"estimatedValue = ${param_count}")
                params.append(lead_data.estimatedValue)

            if lead_data.notes is not None:
                param_count += 1
                update_fields.append(f"notes = ${param_count}")
                params.append(lead_data.notes)

            if lead_data.followUpDate is not None:
                param_count += 1
                update_fields.append(f"followUpDate = ${param_count}")
                params.append(lead_data.followUpDate)

            if lead_data.lastContact is not None:
                param_count += 1
                update_fields.append(f"lastContact = ${param_count}")
                params.append(lead_data.lastContact)

            if lead_data.contactHistory is not None:
                param_count += 1
                update_fields.append(f"contactHistory = ${param_count}")
                params.append(json.dumps(lead_data.contactHistory))

            if lead_data.score is not None:
                param_count += 1
                update_fields.append(f"score = ${param_count}")
                params.append(lead_data.score)

            if lead_data.qualificationCriteria is not None:
                param_count += 1
                update_fields.append(f"qualificationCriteria = ${param_count}")
                params.append(json.dumps(lead_data.qualificationCriteria))

            if not update_fields:
                return await self.get_lead(lead_id)

            # Add updatedAt
            param_count += 1
            update_fields.append(f"updatedAt = ${param_count}")
            params.append(datetime.utcnow())

            # Add updatedBy
            param_count += 1
            update_fields.append(f"updatedBy = ${param_count}")
            params.append(user_id)

            query = f"""
                UPDATE "Lead" 
                SET {', '.join(update_fields)}
                WHERE id = $1
            """

            await db.execute(query, *params)

            return await self.get_lead(lead_id)

        except Exception as e:
            logger.error(f"Error updating lead: {str(e)}")
            raise

    async def get_analytics(self) -> Dict[str, Any]:
        """Get lead analytics"""
        try:
            db = await self._get_db()
            
            # Get total leads
            total_leads = await db.fetch_val(
                """
                SELECT COUNT(*) FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE c.clientId = $1
                """,
                self.client_id
            )

            # Get leads by status
            leads_by_status = await db.fetch_all(
                """
                SELECT l.status, COUNT(*) as count
                FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE c.clientId = $1
                GROUP BY l.status
                """,
                self.client_id
            )

            # Get leads by priority
            leads_by_priority = await db.fetch_all(
                """
                SELECT l.priority, COUNT(*) as count
                FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE c.clientId = $1
                GROUP BY l.priority
                """,
                self.client_id
            )

            # Get leads by source
            leads_by_source = await db.fetch_all(
                """
                SELECT l.source, COUNT(*) as count
                FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE c.clientId = $1
                GROUP BY l.source
                ORDER BY count DESC
                LIMIT 10
                """,
                self.client_id
            )

            # Get conversion rate
            won_leads = await db.fetch_val(
                """
                SELECT COUNT(*) FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE c.clientId = $1 AND l.status = 'WON'
                """,
                self.client_id
            )

            total_active_leads = await db.fetch_val(
                """
                SELECT COUNT(*) FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE c.clientId = $1 AND l.status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON')
                """,
                self.client_id
            )

            conversion_rate = (won_leads / total_active_leads * 100) if total_active_leads > 0 else 0

            # Get average score
            average_score = await db.fetch_val(
                """
                SELECT AVG(l.score) FROM "Lead" l
                JOIN "Customer" c ON l.customerId = c.id
                WHERE c.clientId = $1
                """,
                self.client_id
            )

            return {
                "totalLeads": total_leads,
                "leadsByStatus": {row["status"]: row["count"] for row in leads_by_status},
                "leadsByPriority": {row["priority"]: row["count"] for row in leads_by_priority},
                "leadsBySource": {row["source"]: row["count"] for row in leads_by_source},
                "conversionRate": round(conversion_rate, 2),
                "averageScore": round(float(average_score) if average_score else 0, 2)
            }

        except Exception as e:
            logger.error(f"Error getting lead analytics: {str(e)}")
            raise 