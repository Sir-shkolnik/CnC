from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from pydantic import BaseModel
from apps.api.dependencies import get_current_user
from apps.api.models.user import User
from prisma import Prisma

router = APIRouter()

# ===== DATA MODELS =====

class FuelLogCreate(BaseModel):
    journeyId: str
    fuelAmount: float
    fuelCost: float
    odometerReading: Optional[int] = None
    fuelType: str = "DIESEL"
    location: Optional[str] = None
    notes: Optional[str] = None

class MaterialUsageCreate(BaseModel):
    journeyId: str
    materialId: str
    quantity: float
    unitCost: float
    totalCost: float
    notes: Optional[str] = None

class DamageReportCreate(BaseModel):
    journeyId: str
    damageType: str
    description: str
    severity: str  # MINOR, MODERATE, MAJOR
    estimatedCost: Optional[float] = None
    photos: Optional[List[str]] = None
    reportedBy: str
    notes: Optional[str] = None

class PerformanceMetrics(BaseModel):
    date: date
    totalJobs: int
    completedJobs: int
    totalHours: float
    totalRevenue: float
    totalCosts: float
    fuelUsed: float
    fuelCost: float
    materialsUsed: float
    efficiency: float

# ===== FUEL TRACKING =====

@router.post("/fuel-log")
async def create_fuel_log(
    fuel_log: FuelLogCreate,
    current_user: User = Depends(get_current_user)
):
    """Log fuel consumption for a journey"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify journey exists
        journey = await db.truckjourney.find_unique(
            where={"id": fuel_log.journeyId, "clientId": current_user.clientId}
        )
        
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        # Create fuel log
        new_fuel_log = await db.fuellog.create({
            "data": {
                "journeyId": fuel_log.journeyId,
                "fuelAmount": fuel_log.fuelAmount,
                "fuelCost": fuel_log.fuelCost,
                "odometerReading": fuel_log.odometerReading,
                "fuelType": fuel_log.fuelType,
                "location": fuel_log.location,
                "notes": fuel_log.notes,
                "loggedBy": current_user.id,
                "loggedAt": datetime.utcnow()
            }
        })
        
        await db.disconnect()
        return {"success": True, "fuelLog": new_fuel_log}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating fuel log: {str(e)}")

@router.get("/fuel-analytics")
async def get_fuel_analytics(
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    journey_id: Optional[str] = None
):
    """Get fuel consumption analytics"""
    try:
        db = Prisma()
        await db.connect()
        
        # Set default date range if not provided
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        # Build where clause
        where_clause = {
            "journey": {
                "clientId": current_user.clientId,
                "date": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            }
        }
        
        if journey_id:
            where_clause["journeyId"] = journey_id
        
        # Get fuel logs
        fuel_logs = await db.fuellog.find_many(
            where=where_clause,
            include={
                "journey": {
                    "select": {"truckNumber": True, "date": True, "status": True}
                }
            },
            order={"loggedAt": "desc"}
        )
        
        # Calculate totals
        total_fuel = sum(log.fuelAmount for log in fuel_logs)
        total_cost = sum(log.fuelCost for log in fuel_logs)
        avg_cost_per_liter = total_cost / total_fuel if total_fuel > 0 else 0
        
        # Get fuel consumption by truck
        truck_consumption = {}
        for log in fuel_logs:
            truck = log.journey.truckNumber or "Unknown"
            if truck not in truck_consumption:
                truck_consumption[truck] = {"fuel": 0, "cost": 0}
            truck_consumption[truck]["fuel"] += log.fuelAmount
            truck_consumption[truck]["cost"] += log.fuelCost
        
        await db.disconnect()
        
        return {
            "period": {
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat()
            },
            "summary": {
                "totalFuel": round(total_fuel, 2),
                "totalCost": round(total_cost, 2),
                "avgCostPerLiter": round(avg_cost_per_liter, 2),
                "totalLogs": len(fuel_logs)
            },
            "truckConsumption": truck_consumption,
            "fuelLogs": fuel_logs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching fuel analytics: {str(e)}")

# ===== MATERIAL TRACKING =====

@router.post("/material-usage")
async def create_material_usage(
    material_usage: MaterialUsageCreate,
    current_user: User = Depends(get_current_user)
):
    """Log material usage for a journey"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify journey exists
        journey = await db.truckjourney.find_unique(
            where={"id": material_usage.journeyId, "clientId": current_user.clientId}
        )
        
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        # Create material usage record
        new_usage = await db.materialusage.create({
            "data": {
                "journeyId": material_usage.journeyId,
                "materialId": material_usage.materialId,
                "quantity": material_usage.quantity,
                "unitCost": material_usage.unitCost,
                "totalCost": material_usage.totalCost,
                "notes": material_usage.notes,
                "loggedBy": current_user.id,
                "loggedAt": datetime.utcnow()
            }
        })
        
        await db.disconnect()
        return {"success": True, "materialUsage": new_usage}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating material usage: {str(e)}")

@router.get("/material-analytics")
async def get_material_analytics(
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get material usage analytics"""
    try:
        db = Prisma()
        await db.connect()
        
        # Set default date range if not provided
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        # Get material usage
        material_usage = await db.materialusage.find_many(
            where={
                "journey": {
                    "clientId": current_user.clientId,
                    "date": {
                        "gte": datetime.combine(start_date, datetime.min.time()),
                        "lte": datetime.combine(end_date, datetime.max.time())
                    }
                }
            },
            include={
                "journey": {
                    "select": {"truckNumber": True, "date": True}
                },
                "material": {
                    "select": {"name": True, "category": True}
                }
            },
            order={"loggedAt": "desc"}
        )
        
        # Calculate totals
        total_cost = sum(usage.totalCost for usage in material_usage)
        
        # Group by material category
        category_usage = {}
        for usage in material_usage:
            category = usage.material.category or "Unknown"
            if category not in category_usage:
                category_usage[category] = {"cost": 0, "quantity": 0}
            category_usage[category]["cost"] += usage.totalCost
            category_usage[category]["quantity"] += usage.quantity
        
        await db.disconnect()
        
        return {
            "period": {
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat()
            },
            "summary": {
                "totalCost": round(total_cost, 2),
                "totalUsage": len(material_usage)
            },
            "categoryUsage": category_usage,
            "materialUsage": material_usage
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching material analytics: {str(e)}")

# ===== DAMAGE REPORTING =====

@router.post("/damage-report")
async def create_damage_report(
    damage_report: DamageReportCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a damage report for a journey"""
    try:
        db = Prisma()
        await db.connect()
        
        # Verify journey exists
        journey = await db.truckjourney.find_unique(
            where={"id": damage_report.journeyId, "clientId": current_user.clientId}
        )
        
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        # Create damage report
        new_report = await db.damagereport.create({
            "data": {
                "journeyId": damage_report.journeyId,
                "damageType": damage_report.damageType,
                "description": damage_report.description,
                "severity": damage_report.severity,
                "estimatedCost": damage_report.estimatedCost,
                "photos": damage_report.photos,
                "reportedBy": damage_report.reportedBy,
                "notes": damage_report.notes,
                "createdBy": current_user.id,
                "createdAt": datetime.utcnow()
            }
        })
        
        await db.disconnect()
        return {"success": True, "damageReport": new_report}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating damage report: {str(e)}")

@router.get("/damage-analytics")
async def get_damage_analytics(
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get damage reporting analytics"""
    try:
        db = Prisma()
        await db.connect()
        
        # Set default date range if not provided
        if not start_date:
            start_date = date.today() - timedelta(days=90)
        if not end_date:
            end_date = date.today()
        
        # Get damage reports
        damage_reports = await db.damagereport.find_many(
            where={
                "journey": {
                    "clientId": current_user.clientId,
                    "date": {
                        "gte": datetime.combine(start_date, datetime.min.time()),
                        "lte": datetime.combine(end_date, datetime.max.time())
                    }
                }
            },
            include={
                "journey": {
                    "select": {"truckNumber": True, "date": True}
                }
            },
            order={"createdAt": "desc"}
        )
        
        # Calculate totals
        total_reports = len(damage_reports)
        total_estimated_cost = sum(report.estimatedCost or 0 for report in damage_reports)
        
        # Group by severity
        severity_counts = {}
        for report in damage_reports:
            severity = report.severity
            if severity not in severity_counts:
                severity_counts[severity] = 0
            severity_counts[severity] += 1
        
        # Group by damage type
        type_counts = {}
        for report in damage_reports:
            damage_type = report.damageType
            if damage_type not in type_counts:
                type_counts[damage_type] = 0
            type_counts[damage_type] += 1
        
        await db.disconnect()
        
        return {
            "period": {
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat()
            },
            "summary": {
                "totalReports": total_reports,
                "totalEstimatedCost": round(total_estimated_cost, 2)
            },
            "severityBreakdown": severity_counts,
            "typeBreakdown": type_counts,
            "damageReports": damage_reports
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching damage analytics: {str(e)}")

# ===== PERFORMANCE METRICS =====

@router.get("/performance-metrics")
async def get_performance_metrics(
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get comprehensive performance metrics"""
    try:
        db = Prisma()
        await db.connect()
        
        # Set default date range if not provided
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        location_id = current_user.locationId
        client_id = current_user.clientId
        
        # Get journey metrics
        total_journeys = await db.truckjourney.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "date": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            }
        )
        
        completed_journeys = await db.truckjourney.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "status": "COMPLETED",
                "date": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            }
        )
        
        # Get job metrics
        total_jobs = await db.job.count(
            where={
                "branch": {
                    "locationId": location_id
                },
                "scheduledDate": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            }
        )
        
        completed_jobs = await db.job.count(
            where={
                "branch": {
                    "locationId": location_id
                },
                "status": "Completed",
                "scheduledDate": {
                    "gte": datetime.combine(start_date, datetime.min.time()),
                    "lte": datetime.combine(end_date, datetime.max.time())
                }
            }
        )
        
        # Get fuel metrics
        fuel_usage = await db.fuellog.aggregate(
            where={
                "journey": {
                    "clientId": client_id,
                    "locationId": location_id,
                    "date": {
                        "gte": datetime.combine(start_date, datetime.min.time()),
                        "lte": datetime.combine(end_date, datetime.max.time())
                    }
                }
            },
            _sum={"fuelAmount": True, "fuelCost": True}
        )
        
        # Get material usage
        material_usage = await db.materialusage.aggregate(
            where={
                "journey": {
                    "clientId": client_id,
                    "locationId": location_id,
                    "date": {
                        "gte": datetime.combine(start_date, datetime.min.time()),
                        "lte": datetime.combine(end_date, datetime.max.time())
                    }
                }
            },
            _sum={"totalCost": True}
        )
        
        await db.disconnect()
        
        # Calculate efficiency metrics
        journey_completion_rate = (completed_journeys / total_journeys * 100) if total_journeys > 0 else 0
        job_completion_rate = (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0
        
        return {
            "period": {
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat()
            },
            "journeyMetrics": {
                "total": total_journeys,
                "completed": completed_journeys,
                "completionRate": round(journey_completion_rate, 2)
            },
            "jobMetrics": {
                "total": total_jobs,
                "completed": completed_jobs,
                "completionRate": round(job_completion_rate, 2)
            },
            "resourceMetrics": {
                "fuelUsed": round(fuel_usage._sum.fuelAmount or 0, 2),
                "fuelCost": round(fuel_usage._sum.fuelCost or 0, 2),
                "materialCost": round(material_usage._sum.totalCost or 0, 2)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching performance metrics: {str(e)}")

# ===== REAL-TIME OPERATIONAL STATUS =====

@router.get("/operational-status")
async def get_operational_status(
    current_user: User = Depends(get_current_user)
):
    """Get real-time operational status"""
    try:
        db = Prisma()
        await db.connect()
        
        location_id = current_user.locationId
        client_id = current_user.clientId
        
        # Get active journeys
        active_journeys = await db.truckjourney.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "status": {"in": ["MORNING_PREP", "ON_ROAD", "ON_SITE", "RETURNING"]}
            }
        )
        
        # Get trucks on the road
        trucks_on_road = await db.truckjourney.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "status": {"in": ["ON_ROAD", "ON_SITE"]}
            }
        )
        
        # Get pending jobs
        pending_jobs = await db.job.count(
            where={
                "branch": {
                    "locationId": location_id
                },
                "status": "Scheduled"
            }
        )
        
        # Get crew availability
        available_crew = await db.user.count(
            where={
                "clientId": client_id,
                "locationId": location_id,
                "status": "ACTIVE",
                "role": {"in": ["DRIVER", "MOVER"]}
            }
        )
        
        await db.disconnect()
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "operationalStatus": {
                "activeJourneys": active_journeys,
                "trucksOnRoad": trucks_on_road,
                "pendingJobs": pending_jobs,
                "availableCrew": available_crew
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching operational status: {str(e)}")
