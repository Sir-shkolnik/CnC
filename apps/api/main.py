# C&C CRM - Simplified Production API
# Essential routes only for production deployment

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import os
import logging

# ===== LOGGING SETUP =====
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== LIFECYCLE MANAGEMENT =====
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    logger.info("🚀 Starting C&C CRM API...")
    yield
    logger.info("🛑 Shutting down C&C CRM API...")

# ===== FASTAPI APP INITIALIZATION =====
app = FastAPI(
    title="C&C CRM API",
    description="Command & Control CRM - Essential Operations Management",
    version="3.4.0",
    lifespan=lifespan
)

# ===== MIDDLEWARE =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure for production
)

# ===== ESSENTIAL ROUTES =====
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "success": True,
        "message": "Welcome to C&C CRM API",
        "tagline": "Trust the Journey",
        "version": "3.4.0",
        "docs": "/docs",
        "health": "/health",
        "status": "production-ready"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "success": True,
        "status": "healthy",
        "version": "3.4.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# ===== CORE ROUTE IMPORTS =====
try:
    # Essential authentication
    from apps.api.routes import auth
    app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
    logger.info("✅ Auth routes loaded")
except Exception as e:
    logger.error(f"❌ Auth routes failed: {e}")

try:
    # Essential user management
    from apps.api.routes import users
    app.include_router(users.router, prefix="/users", tags=["Users & Crew"])
    logger.info("✅ User routes loaded")
except Exception as e:
    logger.error(f"❌ User routes failed: {e}")

try:
    # Essential journey management
    from apps.api.routes import journey
    app.include_router(journey.router, prefix="/journey", tags=["Truck Journey"])
    logger.info("✅ Journey routes loaded")
except Exception as e:
    logger.error(f"❌ Journey routes failed: {e}")

try:
    # Essential company management
    from apps.api.routes import company_management
    app.include_router(company_management.router, prefix="/company-management", tags=["Company Management"])
    logger.info("✅ Company management routes loaded")
except Exception as e:
    logger.error(f"❌ Company management routes failed: {e}")

try:
    # Essential super admin
    from apps.api.routes import super_admin
    app.include_router(super_admin.router, prefix="/super-admin", tags=["Super Admin"])
    logger.info("✅ Super admin routes loaded")
except Exception as e:
    logger.error(f"❌ Super admin routes failed: {e}")

try:
    # Essential SmartMoving integration
    from apps.api.routes import smartmoving
    app.include_router(smartmoving.router, tags=["SmartMoving Sync"])
    logger.info("✅ SmartMoving routes loaded")
except Exception as e:
    logger.error(f"❌ SmartMoving routes failed: {e}")

try:
    # Essential dashboard
    from apps.api.routes import dashboard
    app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
    logger.info("✅ Dashboard routes loaded")
except Exception as e:
    logger.error(f"❌ Dashboard routes failed: {e}")

# ===== ERROR HANDLERS =====
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"success": False, "error": "Endpoint not found", "message": "The requested endpoint does not exist"}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"success": False, "error": "Internal server error", "message": "Something went wrong on our end"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 