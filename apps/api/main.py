"""
C&C CRM API - FastAPI Backend
Command & Control CRM for Moving & Logistics Operations
"""

from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import logging
import json
import sys
import os
from typing import Dict, Any

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modules'))

# Import routes
from apps.api.routes import auth, journey, calendar, dispatch, feedback, crew, storage, media, audit
from apps.api.routes import users, super_admin, mobile, locations, journey_steps, admin

# Import middleware
from apps.api.middleware.auth import AuthMiddleware
from apps.api.middleware.tenant import TenantMiddleware
from apps.api.middleware.audit_logger import AuditLoggerMiddleware

# Import WebSocket server
try:
    from websocket_server import websocket_server, journey_event_broadcaster
    from notifications import notification_service
except ImportError as e:
    print(f"Warning: Could not import WebSocket modules: {e}")
    # Create placeholder instances
    websocket_server = None
    journey_event_broadcaster = None
    notification_service = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== LIFECYCLE EVENTS =====

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting C&C CRM API...")
    logger.info("📊 Multi-tenant SuperDB architecture initialized")
    logger.info("🔐 Security middleware loaded")
    logger.info("📝 Audit trail system active")
    logger.info("🔌 WebSocket server initialized")
    
    # Initialize WebSocket server
    if notification_service:
        notification_service.websocket_server = websocket_server
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down C&C CRM API...")
    logger.info("🔌 WebSocket server shutting down...")

# ===== FASTAPI APP INITIALIZATION =====

app = FastAPI(
    title="C&C CRM API",
    description="Command & Control CRM for Moving & Logistics Operations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ===== MIDDLEWARE CONFIGURATION =====

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://c-and-c-crm.onrender.com",  # Production frontend
        "https://*.onrender.com",  # Render subdomains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        "*.onrender.com",
        "c-and-c-crm.onrender.com",
    ]
)

# Custom middleware for C&C CRM
app.add_middleware(AuditLoggerMiddleware)  # Log all actions
app.add_middleware(TenantMiddleware)       # Multi-tenant scoping
app.add_middleware(AuthMiddleware)         # JWT authentication

# ===== GLOBAL EXCEPTION HANDLERS =====

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent response format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "message": f"HTTP {exc.status_code} error occurred",
            "path": str(request.url),
            "method": request.method,
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "path": str(request.url),
            "method": request.method,
        }
    )

# ===== HEALTH CHECK =====

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for monitoring"""
    return {
        "success": True,
        "message": "C&C CRM API is healthy",
        "status": "operational",
        "version": "1.0.0",
        "modules": {
            "auth": "active",
            "journey": "active", 
            "audit": "active",
            "multi_tenant": "active"
        }
    }

# ===== ROOT ENDPOINT =====

@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint with API information"""
    return {
        "success": True,
        "message": "Welcome to C&C CRM API",
        "tagline": "Trust the Journey",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "modules": [
            "Command & Control",
            "Connect & Convert", 
            "Crew & Customer",
            "Capture & Confirm",
            "Calendar & Capacity",
            "Cost & Compensation",
            "Compliance & Consistency",
            "Chat & Collaboration",
            "Cash & Contracts",
            "Cloud & Control",
            "Clean & Concise",
            "Customer & Care"
        ]
    }

# ===== ROUTE REGISTRATION =====

# Auth routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# User Management routes
app.include_router(users.router, prefix="/users", tags=["Users & Crew"])

# Core C&C routes
app.include_router(journey.router, prefix="/journey", tags=["Truck Journey"])
app.include_router(calendar.router, prefix="/calendar", tags=["Calendar & Capacity"])
app.include_router(dispatch.router, prefix="/dispatch", tags=["Command & Control"])

# Crew & Customer routes
app.include_router(crew.router, prefix="/crew", tags=["Crew & Customer"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback & Rating"])

# Capture & Confirm routes
app.include_router(media.router, prefix="/media", tags=["Media & Capture"])
app.include_router(storage.router, prefix="/storage", tags=["Cloud & Control"])

# Compliance & Audit routes
app.include_router(audit.router, prefix="/audit", tags=["Compliance & Consistency"])

# Super Admin routes
app.include_router(super_admin.router, prefix="/super-admin", tags=["Super Admin"])

# Admin routes
app.include_router(admin.router, tags=["Admin"])

# Mobile routes
app.include_router(mobile.router, prefix="/mobile", tags=["Mobile App"])

# Locations routes
app.include_router(locations.router, tags=["Locations"])

# Journey Steps routes
app.include_router(journey_steps.router, tags=["Journey Steps"])

# ===== WEBSOCKET ENDPOINTS =====

@app.websocket("/ws/journey/{journey_id}")
async def websocket_journey_endpoint(websocket: WebSocket, journey_id: str):
    """WebSocket endpoint for real-time journey updates"""
    
    await websocket.accept()
    connection_id = f"conn_{journey_id}_{id(websocket)}"
    
    try:
        # Send connection established message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {
                "connection_id": connection_id,
                "journey_id": journey_id,
                "timestamp": "2024-01-15T10:00:00Z"
            }
        }))
        
        # Connect to WebSocket server (placeholder user data)
        if websocket_server:
            await websocket_server.connect(
                websocket,
                connection_id,
                "user_placeholder",  # TODO: Get from JWT token
                "DISPATCHER",  # TODO: Get from JWT token
                "placeholder_client",  # TODO: Get from JWT token
                "placeholder_location"  # TODO: Get from JWT token
            )
            
            # Subscribe to journey updates
            await websocket_server.subscribe_to_journey(connection_id, journey_id)
        else:
            logger.warning(f"WebSocket server not initialized, cannot connect to journey updates for {journey_id}")
        
        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle message
                if websocket_server:
                    await websocket_server.handle_message(connection_id, message)
                else:
                    logger.warning(f"WebSocket server not initialized, cannot handle message for {connection_id}")
                
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"}
                }))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Clean up connection
        if websocket_server:
            await websocket_server.disconnect(connection_id)

@app.websocket("/ws/user/{user_id}")
async def websocket_user_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for user-specific updates"""
    
    await websocket.accept()
    connection_id = f"user_conn_{user_id}_{id(websocket)}"
    
    try:
        # Send connection established message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {
                "connection_id": connection_id,
                "user_id": user_id,
                "timestamp": "2024-01-15T10:00:00Z"
            }
        }))
        
        # Connect to WebSocket server (placeholder user data)
        if websocket_server:
            await websocket_server.connect(
                websocket,
                connection_id,
                user_id,
                "DISPATCHER",  # TODO: Get from JWT token
                "placeholder_client",  # TODO: Get from JWT token
                "placeholder_location"  # TODO: Get from JWT token
            )
            
            # Handle incoming messages
            while True:
                try:
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    
                    # Handle message
                    await websocket_server.handle_message(connection_id, message)
                    
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "data": {"message": "Invalid JSON format"}
                    }))
        else:
            logger.warning(f"WebSocket server not initialized, cannot connect to user updates for {user_id}")
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Clean up connection
        if websocket_server:
            await websocket_server.disconnect(connection_id)

# ===== DEVELOPMENT SERVER =====

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 