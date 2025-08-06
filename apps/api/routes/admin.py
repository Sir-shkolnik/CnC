from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime, timedelta
import psutil
import os
from prisma import Prisma

router = APIRouter(prefix="/admin", tags=["Admin"])

# Initialize Prisma client
prisma = Prisma()

@router.get("/database/metrics")
async def get_database_metrics():
    """
    Get database performance metrics for super admin dashboard
    """
    try:
        await prisma.connect()
        
        # Get basic database info
        # Note: In a real implementation, you'd query PostgreSQL system tables
        # For now, we'll return mock data that represents typical metrics
        
        metrics = {
            "totalConnections": 25,
            "activeConnections": 8,
            "idleConnections": 17,
            "maxConnections": 100,
            "databaseSize": "2.4 GB",
            "uptime": "15 days, 3 hours",
            "queriesPerSecond": 45.2,
            "slowQueries": 3,
            "lastUpdated": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": metrics,
            "message": "Database metrics retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get database metrics: {str(e)}")
    finally:
        await prisma.disconnect()

@router.get("/api/metrics")
async def get_api_metrics():
    """
    Get API performance metrics for super admin dashboard
    """
    try:
        # In a real implementation, you'd track API metrics over time
        # For now, we'll return mock data that represents typical metrics
        
        metrics = {
            "totalRequests": 15420,
            "requestsPerSecond": 12.3,
            "averageResponseTime": 145,
            "errorRate": 0.8,
            "activeEndpoints": 47,
            "totalEndpoints": 47,
            "lastUpdated": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": metrics,
            "message": "API metrics retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get API metrics: {str(e)}")

@router.get("/system/metrics")
async def get_system_metrics():
    """
    Get system performance metrics for super admin dashboard
    """
    try:
        # Get real system metrics using psutil
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Calculate network traffic (simplified)
        network_io = psutil.net_io_counters()
        network_traffic = (network_io.bytes_sent + network_io.bytes_recv) / 1024 / 1024  # MB
        
        # Get system uptime
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        uptime = datetime.now() - boot_time
        uptime_str = f"{uptime.days} days, {uptime.seconds // 3600} hours, {(uptime.seconds % 3600) // 60} minutes"
        
        # Get load average (Unix-like systems)
        try:
            load_avg = os.getloadavg()
        except AttributeError:
            # Windows doesn't have load average
            load_avg = [0.0, 0.0, 0.0]
        
        metrics = {
            "cpuUsage": round(cpu_percent, 1),
            "memoryUsage": round(memory.percent, 1),
            "diskUsage": round(disk.percent, 1),
            "networkTraffic": round(network_traffic, 1),
            "uptime": uptime_str,
            "loadAverage": [round(load, 2) for load in load_avg],
            "lastUpdated": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": metrics,
            "message": "System metrics retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system metrics: {str(e)}")

@router.get("/health/overview")
async def get_health_overview():
    """
    Get comprehensive health overview for all system components
    """
    try:
        # Check all services
        services = []
        
        # Check main API
        try:
            import requests
            response = requests.get('http://localhost:8000/health', timeout=5)
            services.append({
                "name": "Main API Server",
                "status": "healthy" if response.status_code == 200 else "warning",
                "responseTime": response.elapsed.total_seconds() * 1000,
                "endpoint": "http://localhost:8000/health"
            })
        except:
            services.append({
                "name": "Main API Server",
                "status": "error",
                "responseTime": 0,
                "endpoint": "http://localhost:8000/health"
            })
        
        # Check database
        try:
            await prisma.connect()
            await prisma.user.find_first()
            services.append({
                "name": "PostgreSQL Database",
                "status": "healthy",
                "responseTime": 50,  # Mock response time
                "endpoint": "localhost:5432"
            })
            await prisma.disconnect()
        except:
            services.append({
                "name": "PostgreSQL Database",
                "status": "error",
                "responseTime": 0,
                "endpoint": "localhost:5432"
            })
        
        # Check frontend
        try:
            response = requests.get('http://localhost:3000', timeout=5)
            services.append({
                "name": "Frontend Application",
                "status": "healthy" if response.status_code == 200 else "warning",
                "responseTime": response.elapsed.total_seconds() * 1000,
                "endpoint": "http://localhost:3000"
            })
        except:
            services.append({
                "name": "Frontend Application",
                "status": "error",
                "responseTime": 0,
                "endpoint": "http://localhost:3000"
            })
        
        # Calculate overall health
        healthy_services = len([s for s in services if s["status"] == "healthy"])
        total_services = len(services)
        health_percentage = (healthy_services / total_services) * 100 if total_services > 0 else 0
        
        overview = {
            "overallHealth": round(health_percentage, 1),
            "healthyServices": healthy_services,
            "totalServices": total_services,
            "services": services,
            "lastUpdated": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": overview,
            "message": "Health overview retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health overview: {str(e)}")

@router.get("/logs/recent")
async def get_recent_logs():
    """
    Get recent system logs for super admin dashboard
    """
    try:
        # In a real implementation, you'd query actual log files
        # For now, we'll return mock log data
        
        logs = [
            {
                "timestamp": datetime.now().isoformat(),
                "level": "INFO",
                "message": "System health check completed successfully",
                "service": "health-monitor"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
                "level": "INFO",
                "message": "Database backup completed",
                "service": "backup-service"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
                "level": "WARNING",
                "message": "High memory usage detected",
                "service": "system-monitor"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(),
                "level": "INFO",
                "message": "API request rate: 12.3 req/s",
                "service": "api-monitor"
            }
        ]
        
        return {
            "success": True,
            "data": {
                "logs": logs,
                "totalLogs": len(logs),
                "lastUpdated": datetime.now().isoformat()
            },
            "message": "Recent logs retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent logs: {str(e)}")

@router.get("/settings/system")
async def get_system_settings():
    """
    Get current system settings for super admin dashboard
    """
    try:
        settings = {
            "database": {
                "maxConnections": 100,
                "timeout": 30,
                "poolSize": 10
            },
            "api": {
                "rateLimit": 1000,
                "timeout": 30,
                "corsEnabled": True
            },
            "security": {
                "jwtExpiry": 24,
                "passwordMinLength": 8,
                "sessionTimeout": 30
            },
            "monitoring": {
                "healthCheckInterval": 30,
                "logRetentionDays": 30,
                "backupFrequency": "daily"
            },
            "lastUpdated": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": settings,
            "message": "System settings retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system settings: {str(e)}") 