"""
Quote Item Service Layer
C&C CRM - Quote Item Management Business Logic
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import json
import logging

from ..database import get_database_connection
from ..models.quote import QuoteItemCreate, QuoteItemUpdate, QuoteItemResponse

logger = logging.getLogger(__name__)

class QuoteItemService:
    def __init__(self, client_id: str, location_id: str):
        self.client_id = client_id
        self.location_id = location_id
        self.db = None

    async def _get_db(self):
        if not self.db:
            self.db = await get_database_connection()
        return self.db

    async def create_quote_item(self, quote_id: str, item_data: QuoteItemCreate, user_id: str) -> QuoteItemResponse:
        """Add an item to a quote"""
        try:
            db = await self._get_db()
            
            # Validate quote exists and belongs to client
            quote = await db.fetch_one(
                "SELECT id FROM \"Quote\" WHERE id = $1 AND clientId = $2",
                quote_id, self.client_id
            )
            
            if not quote:
                raise ValueError("Quote not found")

            # Create quote item
            item_id = await db.fetch_val(
                """
                INSERT INTO "QuoteItem" (
                    quoteId, description, quantity, unitPrice, totalPrice,
                    category, subcategory, notes, isOptional, sortOrder
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
                """,
                quote_id,
                item_data.description,
                item_data.quantity,
                item_data.unitPrice,
                item_data.totalPrice,
                item_data.category,
                item_data.subcategory,
                item_data.notes,
                item_data.isOptional or False,
                item_data.sortOrder or 0
            )

            # Return created item
            return await self.get_quote_item(item_id)

        except Exception as e:
            logger.error(f"Error creating quote item: {str(e)}")
            raise

    async def get_quote_items(self, quote_id: str) -> List[QuoteItemResponse]:
        """Get all items for a quote"""
        try:
            db = await self._get_db()
            
            rows = await db.fetch_all(
                """
                SELECT 
                    qi.id, qi.quoteId, qi.description, qi.quantity,
                    qi.unitPrice, qi.totalPrice, qi.category, qi.subcategory,
                    qi.notes, qi.isOptional, qi.sortOrder,
                    qi.createdAt, qi.updatedAt
                FROM "QuoteItem" qi
                JOIN "Quote" q ON qi.quoteId = q.id
                WHERE qi.quoteId = $1 AND q.clientId = $2
                ORDER BY qi.sortOrder ASC, qi.createdAt ASC
                """,
                quote_id, self.client_id
            )
            
            items = []
            for row in rows:
                item = QuoteItemResponse(
                    id=row["id"],
                    quoteId=row["quoteId"],
                    description=row["description"],
                    quantity=row["quantity"],
                    unitPrice=row["unitPrice"],
                    totalPrice=row["totalPrice"],
                    category=row["category"],
                    subcategory=row["subcategory"],
                    notes=row["notes"],
                    isOptional=row["isOptional"],
                    sortOrder=row["sortOrder"],
                    createdAt=row["createdAt"],
                    updatedAt=row["updatedAt"]
                )
                items.append(item)

            return items

        except Exception as e:
            logger.error(f"Error getting quote items: {str(e)}")
            raise

    async def get_quote_item(self, item_id: str) -> Optional[QuoteItemResponse]:
        """Get a specific quote item by ID"""
        try:
            db = await self._get_db()
            
            row = await db.fetch_one(
                """
                SELECT 
                    qi.id, qi.quoteId, qi.description, qi.quantity,
                    qi.unitPrice, qi.totalPrice, qi.category, qi.subcategory,
                    qi.notes, qi.isOptional, qi.sortOrder,
                    qi.createdAt, qi.updatedAt
                FROM "QuoteItem" qi
                JOIN "Quote" q ON qi.quoteId = q.id
                WHERE qi.id = $1 AND q.clientId = $2
                """,
                item_id, self.client_id
            )

            if not row:
                return None

            return QuoteItemResponse(
                id=row["id"],
                quoteId=row["quoteId"],
                description=row["description"],
                quantity=row["quantity"],
                unitPrice=row["unitPrice"],
                totalPrice=row["totalPrice"],
                category=row["category"],
                subcategory=row["subcategory"],
                notes=row["notes"],
                isOptional=row["isOptional"],
                sortOrder=row["sortOrder"],
                createdAt=row["createdAt"],
                updatedAt=row["updatedAt"]
            )

        except Exception as e:
            logger.error(f"Error getting quote item: {str(e)}")
            raise

    async def update_quote_item(
        self, 
        item_id: str, 
        item_data: QuoteItemUpdate, 
        user_id: str
    ) -> Optional[QuoteItemResponse]:
        """Update a quote item"""
        try:
            db = await self._get_db()
            
            # Check if item exists and belongs to client
            existing = await db.fetch_one(
                """
                SELECT qi.id FROM "QuoteItem" qi
                JOIN "Quote" q ON qi.quoteId = q.id
                WHERE qi.id = $1 AND q.clientId = $2
                """,
                item_id, self.client_id
            )
            
            if not existing:
                return None

            # Build update query dynamically
            update_fields = []
            params = [item_id]
            param_count = 1

            if item_data.description is not None:
                param_count += 1
                update_fields.append(f"description = ${param_count}")
                params.append(item_data.description)

            if item_data.quantity is not None:
                param_count += 1
                update_fields.append(f"quantity = ${param_count}")
                params.append(item_data.quantity)

            if item_data.unitPrice is not None:
                param_count += 1
                update_fields.append(f"unitPrice = ${param_count}")
                params.append(item_data.unitPrice)

            if item_data.totalPrice is not None:
                param_count += 1
                update_fields.append(f"totalPrice = ${param_count}")
                params.append(item_data.totalPrice)

            if item_data.category is not None:
                param_count += 1
                update_fields.append(f"category = ${param_count}")
                params.append(item_data.category)

            if item_data.subcategory is not None:
                param_count += 1
                update_fields.append(f"subcategory = ${param_count}")
                params.append(item_data.subcategory)

            if item_data.notes is not None:
                param_count += 1
                update_fields.append(f"notes = ${param_count}")
                params.append(item_data.notes)

            if item_data.isOptional is not None:
                param_count += 1
                update_fields.append(f"isOptional = ${param_count}")
                params.append(item_data.isOptional)

            if item_data.sortOrder is not None:
                param_count += 1
                update_fields.append(f"sortOrder = ${param_count}")
                params.append(item_data.sortOrder)

            if not update_fields:
                return await self.get_quote_item(item_id)

            # Add updatedAt
            param_count += 1
            update_fields.append(f"updatedAt = ${param_count}")
            params.append(datetime.utcnow())

            query = f"""
                UPDATE "QuoteItem" 
                SET {', '.join(update_fields)}
                WHERE id = $1
            """

            await db.execute(query, *params)

            return await self.get_quote_item(item_id)

        except Exception as e:
            logger.error(f"Error updating quote item: {str(e)}")
            raise

    async def delete_quote_item(self, item_id: str, user_id: str) -> bool:
        """Delete a quote item"""
        try:
            db = await self._get_db()
            
            result = await db.execute(
                """
                DELETE FROM "QuoteItem" qi
                USING "Quote" q
                WHERE qi.id = $1 AND qi.quoteId = q.id AND q.clientId = $2
                """,
                item_id, self.client_id
            )
            
            return result.rowcount > 0

        except Exception as e:
            logger.error(f"Error deleting quote item: {str(e)}")
            raise

    async def recalculate_quote_total(self, quote_id: str) -> bool:
        """Recalculate quote total based on items"""
        try:
            db = await self._get_db()
            
            # Get total from items
            total = await db.fetch_val(
                """
                SELECT COALESCE(SUM(totalPrice), 0)
                FROM "QuoteItem"
                WHERE quoteId = $1
                """,
                quote_id
            )
            
            # Update quote total
            await db.execute(
                """
                UPDATE "Quote"
                SET totalAmount = $1, updatedAt = $2
                WHERE id = $3
                """,
                total, datetime.utcnow(), quote_id
            )
            
            return True

        except Exception as e:
            logger.error(f"Error recalculating quote total: {str(e)}")
            raise 