"""
Database Connection Module
C&C CRM - Database connection and query utilities
"""

import os
import asyncpg
import logging
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

# Database connection pool
_pool: Optional[asyncpg.Pool] = None

async def get_database_connection():
    """Get database connection from pool"""
    global _pool
    
    if _pool is None:
        await initialize_database_pool()
    
    return DatabaseConnection(await _pool.acquire())

async def initialize_database_pool():
    """Initialize database connection pool"""
    global _pool
    
    if _pool is not None:
        return
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    try:
        _pool = await asyncpg.create_pool(
            database_url,
            min_size=1,
            max_size=10,
            command_timeout=60
        )
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {e}")
        raise

async def close_database_pool():
    """Close database connection pool"""
    global _pool
    
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("Database connection pool closed")

class DatabaseConnection:
    """Database connection wrapper with query methods"""
    
    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection
    
    async def fetch_one(self, query: str, *args) -> Optional[Dict[str, Any]]:
        """Fetch a single row"""
        try:
            row = await self.connection.fetchrow(query, *args)
            return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error in fetch_one: {e}")
            raise
    
    async def fetch_many(self, query: str, *args) -> List[Dict[str, Any]]:
        """Fetch multiple rows"""
        try:
            rows = await self.connection.fetch(query, *args)
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error in fetch_many: {e}")
            raise
    
    async def fetch_val(self, query: str, *args) -> Any:
        """Fetch a single value"""
        try:
            return await self.connection.fetchval(query, *args)
        except Exception as e:
            logger.error(f"Error in fetch_val: {e}")
            raise
    
    async def execute(self, query: str, *args) -> str:
        """Execute a query and return the result"""
        try:
            return await self.connection.execute(query, *args)
        except Exception as e:
            logger.error(f"Error in execute: {e}")
            raise
    
    async def close(self):
        """Release the connection back to the pool"""
        await self.connection.release()

@asynccontextmanager
async def get_db_transaction():
    """Get database transaction context manager"""
    conn = await get_database_connection()
    async with conn.connection.transaction():
        yield conn 