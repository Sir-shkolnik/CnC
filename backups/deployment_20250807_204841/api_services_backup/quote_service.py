"""
Quote Service Layer
C&C CRM - Sales Pipeline Business Logic
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import json
import logging

from ..database import get_database_connection
from ..models.quote import QuoteCreate, QuoteUpdate, QuoteResponse

logger = logging.getLogger(__name__)

class QuoteService:
    def __init__(self, client_id: str, location_id: str):
        self.client_id = client_id
        self.location_id = location_id
        self.db = None

    async def _get_db(self):
        if not self.db:
            self.db = await get_database_connection()
        return self.db

    async def create_quote(self, quote_data: QuoteCreate, user_id: str) -> QuoteResponse:
        """Create a new quote"""
        try:
            db = await self._get_db()
            
            # Validate customer exists and belongs to client
            customer = await db.fetch_one(
                "SELECT id FROM \"Customer\" WHERE id = $1 AND clientId = $2",
                quote_data.customerId, self.client_id
            )
            
            if not customer:
                raise ValueError("Customer not found")

            # Set default valid until date (30 days from now)
            valid_until = quote_data.validUntil or (datetime.utcnow() + timedelta(days=30))
            
            # Create quote
            quote_id = await db.fetch_val(
                """
                INSERT INTO "Quote" (
                    customerId, clientId, locationId, createdBy, status,
                    totalAmount, currency, validUntil, terms, notes,
                    version, isTemplate, templateName
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
                """,
                quote_data.customerId,
                self.client_id,
                self.location_id,
                user_id,
                quote_data.status or "DRAFT",
                quote_data.totalAmount,
                quote_data.currency or "CAD",
                valid_until,
                quote_data.terms,
                quote_data.notes,
                quote_data.version or 1,
                quote_data.isTemplate or False,
                quote_data.templateName
            )

            # Return created quote
            return await self.get_quote(quote_id)

        except Exception as e:
            logger.error(f"Error creating quote: {str(e)}")
            raise

    async def get_quotes(
        self,
        skip: int = 0,
        limit: int = 100,
        customer_id: Optional[str] = None,
        status: Optional[str] = None,
        created_by: Optional[str] = None,
        is_template: Optional[bool] = None
    ) -> List[QuoteResponse]:
        """Get quotes with filtering and pagination"""
        try:
            db = await self._get_db()
            
            # Build query conditions
            conditions = ["clientId = $1"]
            params = [self.client_id]
            param_count = 1

            if customer_id:
                param_count += 1
                conditions.append(f"customerId = ${param_count}")
                params.append(customer_id)

            if status:
                param_count += 1
                conditions.append(f"status = ${param_count}")
                params.append(status)

            if created_by:
                param_count += 1
                conditions.append(f"createdBy = ${param_count}")
                params.append(created_by)

            if is_template is not None:
                param_count += 1
                conditions.append(f"isTemplate = ${param_count}")
                params.append(is_template)

            where_clause = " AND ".join(conditions)
            
            # Add pagination parameters
            param_count += 1
            params.append(skip)
            param_count += 1
            params.append(limit)

            query = f"""
                SELECT 
                    q.id, q.customerId, q.clientId, q.locationId, q.createdBy,
                    q.status, q.totalAmount, q.currency, q.validUntil, q.terms,
                    q.notes, q.version, q.isTemplate, q.templateName,
                    q.approvedBy, q.approvedAt, q.rejectionReason,
                    q.createdAt, q.updatedAt,
                    c.firstName as customerFirstName, c.lastName as customerLastName,
                    c.email as customerEmail, c.phone as customerPhone,
                    u.name as createdUserName,
                    au.name as approvedUserName,
                    COUNT(qi.id) as itemCount
                FROM "Quote" q
                LEFT JOIN "Customer" c ON q.customerId = c.id
                LEFT JOIN "User" u ON q.createdBy = u.id
                LEFT JOIN "User" au ON q.approvedBy = au.id
                LEFT JOIN "QuoteItem" qi ON q.id = qi.quoteId
                WHERE {where_clause}
                GROUP BY q.id, c.firstName, c.lastName, c.email, c.phone, u.name, au.name
                ORDER BY q.createdAt DESC
                LIMIT ${param_count - 1} OFFSET ${param_count}
            """

            rows = await db.fetch_all(query, *params)
            
            quotes = []
            for row in rows:
                quote = QuoteResponse(
                    id=row["id"],
                    customerId=row["customerId"],
                    customerName=f"{row['customerFirstName']} {row['customerLastName']}",
                    customerEmail=row["customerEmail"],
                    customerPhone=row["customerPhone"],
                    clientId=row["clientId"],
                    locationId=row["locationId"],
                    createdBy=row["createdBy"],
                    createdUserName=row["createdUserName"],
                    status=row["status"],
                    totalAmount=row["totalAmount"],
                    currency=row["currency"],
                    validUntil=row["validUntil"],
                    terms=row["terms"],
                    notes=row["notes"],
                    version=row["version"],
                    isTemplate=row["isTemplate"],
                    templateName=row["templateName"],
                    approvedBy=row["approvedBy"],
                    approvedUserName=row["approvedUserName"],
                    approvedAt=row["approvedAt"],
                    rejectionReason=row["rejectionReason"],
                    itemCount=row["itemCount"],
                    createdAt=row["createdAt"],
                    updatedAt=row["updatedAt"]
                )
                quotes.append(quote)

            return quotes

        except Exception as e:
            logger.error(f"Error getting quotes: {str(e)}")
            raise

    async def get_quote(self, quote_id: str) -> Optional[QuoteResponse]:
        """Get a specific quote by ID"""
        try:
            db = await self._get_db()
            
            row = await db.fetch_one(
                """
                SELECT 
                    q.id, q.customerId, q.clientId, q.locationId, q.createdBy,
                    q.status, q.totalAmount, q.currency, q.validUntil, q.terms,
                    q.notes, q.version, q.isTemplate, q.templateName,
                    q.approvedBy, q.approvedAt, q.rejectionReason,
                    q.createdAt, q.updatedAt,
                    c.firstName as customerFirstName, c.lastName as customerLastName,
                    c.email as customerEmail, c.phone as customerPhone,
                    u.name as createdUserName,
                    au.name as approvedUserName,
                    COUNT(qi.id) as itemCount
                FROM "Quote" q
                LEFT JOIN "Customer" c ON q.customerId = c.id
                LEFT JOIN "User" u ON q.createdBy = u.id
                LEFT JOIN "User" au ON q.approvedBy = au.id
                LEFT JOIN "QuoteItem" qi ON q.id = qi.quoteId
                WHERE q.id = $1 AND q.clientId = $2
                GROUP BY q.id, c.firstName, c.lastName, c.email, c.phone, u.name, au.name
                """,
                quote_id, self.client_id
            )

            if not row:
                return None

            return QuoteResponse(
                id=row["id"],
                customerId=row["customerId"],
                customerName=f"{row['customerFirstName']} {row['customerLastName']}",
                customerEmail=row["customerEmail"],
                customerPhone=row["customerPhone"],
                clientId=row["clientId"],
                locationId=row["locationId"],
                createdBy=row["createdBy"],
                createdUserName=row["createdUserName"],
                status=row["status"],
                totalAmount=row["totalAmount"],
                currency=row["currency"],
                validUntil=row["validUntil"],
                terms=row["terms"],
                notes=row["notes"],
                version=row["version"],
                isTemplate=row["isTemplate"],
                templateName=row["templateName"],
                approvedBy=row["approvedBy"],
                approvedUserName=row["approvedUserName"],
                approvedAt=row["approvedAt"],
                rejectionReason=row["rejectionReason"],
                itemCount=row["itemCount"],
                createdAt=row["createdAt"],
                updatedAt=row["updatedAt"]
            )

        except Exception as e:
            logger.error(f"Error getting quote: {str(e)}")
            raise

    async def update_quote(
        self, 
        quote_id: str, 
        quote_data: QuoteUpdate, 
        user_id: str
    ) -> Optional[QuoteResponse]:
        """Update a quote"""
        try:
            db = await self._get_db()
            
            # Check if quote exists and belongs to client
            existing = await db.fetch_one(
                "SELECT id FROM \"Quote\" WHERE id = $1 AND clientId = $2",
                quote_id, self.client_id
            )
            
            if not existing:
                return None

            # Build update query dynamically
            update_fields = []
            params = [quote_id, user_id]
            param_count = 2

            if quote_data.status is not None:
                param_count += 1
                update_fields.append(f"status = ${param_count}")
                params.append(quote_data.status)

            if quote_data.totalAmount is not None:
                param_count += 1
                update_fields.append(f"totalAmount = ${param_count}")
                params.append(quote_data.totalAmount)

            if quote_data.currency is not None:
                param_count += 1
                update_fields.append(f"currency = ${param_count}")
                params.append(quote_data.currency)

            if quote_data.validUntil is not None:
                param_count += 1
                update_fields.append(f"validUntil = ${param_count}")
                params.append(quote_data.validUntil)

            if quote_data.terms is not None:
                param_count += 1
                update_fields.append(f"terms = ${param_count}")
                params.append(quote_data.terms)

            if quote_data.notes is not None:
                param_count += 1
                update_fields.append(f"notes = ${param_count}")
                params.append(quote_data.notes)

            if quote_data.version is not None:
                param_count += 1
                update_fields.append(f"version = ${param_count}")
                params.append(quote_data.version)

            if quote_data.isTemplate is not None:
                param_count += 1
                update_fields.append(f"isTemplate = ${param_count}")
                params.append(quote_data.isTemplate)

            if quote_data.templateName is not None:
                param_count += 1
                update_fields.append(f"templateName = ${param_count}")
                params.append(quote_data.templateName)

            if not update_fields:
                return await self.get_quote(quote_id)

            # Add updatedAt
            param_count += 1
            update_fields.append(f"updatedAt = ${param_count}")
            params.append(datetime.utcnow())

            query = f"""
                UPDATE "Quote" 
                SET {', '.join(update_fields)}
                WHERE id = $1 AND clientId = $2
            """
            params.append(self.client_id)

            await db.execute(query, *params)

            return await self.get_quote(quote_id)

        except Exception as e:
            logger.error(f"Error updating quote: {str(e)}")
            raise

    async def delete_quote(self, quote_id: str, user_id: str) -> bool:
        """Delete a quote"""
        try:
            db = await self._get_db()
            
            result = await db.execute(
                "DELETE FROM \"Quote\" WHERE id = $1 AND clientId = $2",
                quote_id, self.client_id
            )
            
            return result.rowcount > 0

        except Exception as e:
            logger.error(f"Error deleting quote: {str(e)}")
            raise

    async def approve_quote(self, quote_id: str, user_id: str) -> Optional[QuoteResponse]:
        """Approve a quote"""
        try:
            db = await self._get_db()
            
            result = await db.execute(
                """
                UPDATE "Quote" 
                SET status = 'APPROVED', approvedBy = $1, approvedAt = $2, updatedAt = $2
                WHERE id = $3 AND clientId = $4
                """,
                user_id, datetime.utcnow(), quote_id, self.client_id
            )
            
            if result.rowcount == 0:
                return None

            return await self.get_quote(quote_id)

        except Exception as e:
            logger.error(f"Error approving quote: {str(e)}")
            raise

    async def reject_quote(self, quote_id: str, rejection_reason: str, user_id: str) -> Optional[QuoteResponse]:
        """Reject a quote with reason"""
        try:
            db = await self._get_db()
            
            result = await db.execute(
                """
                UPDATE "Quote" 
                SET status = 'REJECTED', approvedBy = $1, approvedAt = $2, 
                    rejectionReason = $3, updatedAt = $2
                WHERE id = $4 AND clientId = $5
                """,
                user_id, datetime.utcnow(), rejection_reason, quote_id, self.client_id
            )
            
            if result.rowcount == 0:
                return None

            return await self.get_quote(quote_id)

        except Exception as e:
            logger.error(f"Error rejecting quote: {str(e)}")
            raise

    async def send_quote(self, quote_id: str, user_id: str) -> Optional[QuoteResponse]:
        """Send a quote to customer"""
        try:
            db = await self._get_db()
            
            result = await db.execute(
                """
                UPDATE "Quote" 
                SET status = 'SENT', updatedAt = $1
                WHERE id = $2 AND clientId = $3
                """,
                datetime.utcnow(), quote_id, self.client_id
            )
            
            if result.rowcount == 0:
                return None

            return await self.get_quote(quote_id)

        except Exception as e:
            logger.error(f"Error sending quote: {str(e)}")
            raise

    async def convert_to_journey(self, quote_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Convert a quote to a journey"""
        try:
            db = await self._get_db()
            
            # Get quote details
            quote = await self.get_quote(quote_id)
            if not quote:
                return None

            # Create journey from quote
            journey_id = await db.fetch_val(
                """
                INSERT INTO "TruckJourney" (
                    clientId, locationId, customerId, quoteId, status,
                    priority, estimatedDuration, estimatedCost, notes,
                    createdBy, updatedBy
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
                """,
                self.client_id,
                quote.locationId,
                quote.customerId,
                quote_id,
                "SCHEDULED",
                "NORMAL",
                120,  # Default 2 hours
                quote.totalAmount,
                f"Converted from quote {quote_id}",
                user_id,
                user_id
            )

            # Update quote status to converted
            await db.execute(
                """
                UPDATE "Quote" 
                SET status = 'CONVERTED', updatedAt = $1
                WHERE id = $2
                """,
                datetime.utcnow(), quote_id
            )

            return {
                "journeyId": journey_id,
                "quoteId": quote_id,
                "status": "CONVERTED",
                "message": "Quote successfully converted to journey"
            }

        except Exception as e:
            logger.error(f"Error converting quote to journey: {str(e)}")
            raise

    async def duplicate_quote(self, quote_id: str, user_id: str) -> Optional[QuoteResponse]:
        """Duplicate a quote"""
        try:
            db = await self._get_db()
            
            # Get original quote
            original_quote = await self.get_quote(quote_id)
            if not original_quote:
                return None

            # Create new quote with same data but new ID
            new_quote_id = await db.fetch_val(
                """
                INSERT INTO "Quote" (
                    customerId, clientId, locationId, createdBy, status,
                    totalAmount, currency, validUntil, terms, notes,
                    version, isTemplate, templateName
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
                """,
                original_quote.customerId,
                self.client_id,
                self.location_id,
                user_id,
                "DRAFT",
                original_quote.totalAmount,
                original_quote.currency,
                datetime.utcnow() + timedelta(days=30),
                original_quote.terms,
                f"Duplicated from quote {quote_id}",
                1,
                False,
                None
            )

            # Copy quote items
            await db.execute(
                """
                INSERT INTO "QuoteItem" (
                    quoteId, description, quantity, unitPrice, totalPrice,
                    category, subcategory, notes, isOptional, sortOrder
                )
                SELECT $1, description, quantity, unitPrice, totalPrice,
                       category, subcategory, notes, isOptional, sortOrder
                FROM "QuoteItem"
                WHERE quoteId = $2
                """,
                new_quote_id, quote_id
            )

            return await self.get_quote(new_quote_id)

        except Exception as e:
            logger.error(f"Error duplicating quote: {str(e)}")
            raise

    async def get_templates(self, skip: int = 0, limit: int = 100) -> List[QuoteResponse]:
        """Get quote templates"""
        try:
            return await self.get_quotes(
                skip=skip,
                limit=limit,
                is_template=True
            )
        except Exception as e:
            logger.error(f"Error getting templates: {str(e)}")
            raise

    async def create_template(self, template_data: QuoteCreate, user_id: str) -> QuoteResponse:
        """Create a quote template"""
        try:
            template_data.isTemplate = True
            return await self.create_quote(template_data, user_id)
        except Exception as e:
            logger.error(f"Error creating template: {str(e)}")
            raise

    async def get_analytics_overview(self) -> Dict[str, Any]:
        """Get quote analytics overview"""
        try:
            db = await self._get_db()
            
            # Get total quotes
            total_quotes = await db.fetch_val(
                "SELECT COUNT(*) FROM \"Quote\" WHERE clientId = $1",
                self.client_id
            )

            # Get quotes by status
            quotes_by_status = await db.fetch_all(
                """
                SELECT status, COUNT(*) as count
                FROM "Quote"
                WHERE clientId = $1
                GROUP BY status
                """,
                self.client_id
            )

            # Get total value
            total_value = await db.fetch_val(
                """
                SELECT COALESCE(SUM(totalAmount), 0)
                FROM "Quote"
                WHERE clientId = $1 AND status IN ('SENT', 'VIEWED', 'ACCEPTED')
                """,
                self.client_id
            )

            # Get conversion rate
            converted_quotes = await db.fetch_val(
                """
                SELECT COUNT(*) FROM "Quote"
                WHERE clientId = $1 AND status = 'CONVERTED'
                """,
                self.client_id
            )

            sent_quotes = await db.fetch_val(
                """
                SELECT COUNT(*) FROM "Quote"
                WHERE clientId = $1 AND status IN ('SENT', 'VIEWED', 'ACCEPTED', 'CONVERTED')
                """,
                self.client_id
            )

            conversion_rate = (converted_quotes / sent_quotes * 100) if sent_quotes > 0 else 0

            return {
                "totalQuotes": total_quotes,
                "quotesByStatus": {row["status"]: row["count"] for row in quotes_by_status},
                "totalValue": float(total_value) if total_value else 0,
                "conversionRate": round(conversion_rate, 2),
                "convertedQuotes": converted_quotes
            }

        except Exception as e:
            logger.error(f"Error getting quote analytics: {str(e)}")
            raise

    async def get_pipeline_analytics(self) -> Dict[str, Any]:
        """Get sales pipeline analytics"""
        try:
            db = await self._get_db()
            
            # Get pipeline stages
            pipeline_data = await db.fetch_all(
                """
                SELECT 
                    status,
                    COUNT(*) as count,
                    COALESCE(SUM(totalAmount), 0) as value
                FROM "Quote"
                WHERE clientId = $1
                GROUP BY status
                ORDER BY 
                    CASE status
                        WHEN 'DRAFT' THEN 1
                        WHEN 'SENT' THEN 2
                        WHEN 'VIEWED' THEN 3
                        WHEN 'ACCEPTED' THEN 4
                        WHEN 'CONVERTED' THEN 5
                        WHEN 'REJECTED' THEN 6
                        ELSE 7
                    END
                """,
                self.client_id
            )

            return {
                "pipeline": [
                    {
                        "stage": row["status"],
                        "count": row["count"],
                        "value": float(row["value"]) if row["value"] else 0
                    }
                    for row in pipeline_data
                ]
            }

        except Exception as e:
            logger.error(f"Error getting pipeline analytics: {str(e)}")
            raise

    async def get_conversion_analytics(self) -> Dict[str, Any]:
        """Get quote conversion analytics"""
        try:
            db = await self._get_db()
            
            # Get conversion data by month
            conversion_data = await db.fetch_all(
                """
                SELECT 
                    DATE_TRUNC('month', createdAt) as month,
                    COUNT(*) as total_quotes,
                    COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as converted_quotes,
                    COALESCE(SUM(CASE WHEN status = 'CONVERTED' THEN totalAmount ELSE 0 END), 0) as converted_value
                FROM "Quote"
                WHERE clientId = $1 AND createdAt >= NOW() - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', createdAt)
                ORDER BY month DESC
                """,
                self.client_id
            )

            return {
                "conversionByMonth": [
                    {
                        "month": row["month"].strftime("%Y-%m"),
                        "totalQuotes": row["total_quotes"],
                        "convertedQuotes": row["converted_quotes"],
                        "conversionRate": round((row["converted_quotes"] / row["total_quotes"] * 100), 2) if row["total_quotes"] > 0 else 0,
                        "convertedValue": float(row["converted_value"]) if row["converted_value"] else 0
                    }
                    for row in conversion_data
                ]
            }

        except Exception as e:
            logger.error(f"Error getting conversion analytics: {str(e)}")
            raise 