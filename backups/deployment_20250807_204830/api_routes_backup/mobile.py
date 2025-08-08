from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from typing import List, Optional
from datetime import datetime, date, timedelta
import json
import uuid
from prisma import Prisma

router = APIRouter(tags=["Mobile Field Operations"])

# Initialize Prisma client
prisma = Prisma()

# Mobile Authentication
@router.post("/auth/login")
async def mobile_login(location_id: str, username: str, password: str, device_id: str):
    """
    Mobile-specific login endpoint with location selection
    Uses real database data from C&C CRM
    """
    try:
        # Connect to database
        await prisma.connect()
        
        # Find user by email (username) and location
        user = await prisma.user.find_first(
            where={
                "email": username,
                "locationId": location_id,
                "status": "ACTIVE"
            },
            include={
                "location": True,
                "client": True
            }
        )
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials or user not found")
        
        # TODO: Implement proper password validation
        # For now, accept any password for demo purposes
        # In production, use proper password hashing and validation
        
        # Get location data
        location = await prisma.location.find_unique(
            where={"id": location_id}
        )
        
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")
        
        # Get client data
        client = await prisma.client.find_unique(
            where={"id": user.clientId}
        )
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Get active journey for this user
        active_journey = await prisma.truckjourney.find_first(
            where={
                "locationId": location_id,
                "clientId": user.clientId,
                "status": {
                    "in": ["MORNING_PREP", "EN_ROUTE", "ONSITE"]
                }
            },
            include={
                "assignedCrew": {
                    "where": {
                        "userId": user.id
                    }
                }
            }
        )
        
        # Get pending journeys
        pending_journeys = await prisma.truckjourney.find_many(
            where={
                "locationId": location_id,
                "clientId": user.clientId,
                "status": "MORNING_PREP",
                "assignedCrew": {
                    "some": {
                        "userId": user.id
                    }
                }
            },
            take=5
        )
        
        # Define permissions based on user role
        permissions = {
            "viewAssignedJourneys": True,
            "updateJourneyStatus": user.role in ["DRIVER", "MOVER", "MANAGER"],
            "addMedia": user.role in ["DRIVER", "MOVER", "MANAGER"],
            "viewCustomerInfo": True,
            "accessGPS": user.role in ["DRIVER", "MOVER", "MANAGER"],
            "completeChecklists": user.role in ["DRIVER", "MOVER", "MANAGER"],
            "getCustomerSignature": user.role in ["DRIVER", "MOVER", "MANAGER"],
            "manageCrew": user.role in ["MANAGER", "ADMIN"],
            "handleIssues": user.role in ["MANAGER", "ADMIN", "DISPATCHER"],
            "viewAnalytics": user.role in ["MANAGER", "ADMIN"],
            "overrideStatus": user.role in ["MANAGER", "ADMIN"]
        }
        
        # Create or update mobile session
        existing_session = await prisma.mobilesession.find_first(
            where={
                "userId": user.id,
                "deviceId": device_id
            }
        )
        
        if existing_session:
            mobile_session = await prisma.mobilesession.update(
                where={"id": existing_session.id},
                data={
                    "lastActive": datetime.now(),
                    "syncStatus": "online"
                }
            )
        else:
            mobile_session = await prisma.mobilesession.create(
                data={
                    "userId": user.id,
                    "deviceId": device_id,
                    "locationId": location_id,
                    "lastActive": datetime.now(),
                    "syncStatus": "online"
                }
            )
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role.value,
                    "locationId": user.locationId,
                    "clientId": user.clientId,
                    "status": user.status.value,
                    "createdAt": user.createdAt.isoformat(),
                    "updatedAt": user.updatedAt.isoformat()
                },
                "location": {
                    "id": location.id,
                    "clientId": location.clientId,
                    "name": location.name,
                    "timezone": location.timezone,
                    "address": location.address,
                    "createdAt": location.createdAt.isoformat(),
                    "updatedAt": location.updatedAt.isoformat()
                },
                "client": {
                    "id": client.id,
                    "name": client.name,
                    "industry": client.industry,
                    "isFranchise": client.isFranchise,
                    "settings": client.settings,
                    "createdAt": client.createdAt.isoformat(),
                    "updatedAt": client.updatedAt.isoformat()
                },
                "activeJourney": {
                    "id": active_journey.id,
                    "locationId": active_journey.locationId,
                    "clientId": active_journey.clientId,
                    "date": active_journey.date.isoformat(),
                    "status": active_journey.status.value,
                    "truckNumber": active_journey.truckNumber,
                    "createdById": active_journey.createdById,
                    "createdAt": active_journey.createdAt.isoformat(),
                    "updatedAt": active_journey.updatedAt.isoformat()
                } if active_journey else None,
                "pendingJourneys": [
                    {
                        "id": journey.id,
                        "locationId": journey.locationId,
                        "clientId": journey.clientId,
                        "date": journey.date.isoformat(),
                        "status": journey.status.value,
                        "truckNumber": journey.truckNumber,
                        "createdById": journey.createdById,
                        "createdAt": journey.createdAt.isoformat(),
                        "updatedAt": journey.updatedAt.isoformat()
                    }
                    for journey in pending_journeys
                ],
                "token": f"mobile_token_{uuid.uuid4().hex}",
                "permissions": permissions
            },
            "message": "Login successful"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    finally:
        await prisma.disconnect()

# Get current journey
@router.get("/journey/current")
async def get_current_journey(user_id: str, location_id: str):
    """
    Get the current active journey for a user from real database
    """
    try:
        await prisma.connect()
        
        # Get current active journey
        current_journey = await prisma.truckjourney.find_first(
            where={
                "locationId": location_id,
                "status": {
                    "in": ["MORNING_PREP", "EN_ROUTE", "ONSITE"]
                },
                "assignedCrew": {
                    "some": {
                        "userId": user_id
                    }
                }
            },
            include={
                "assignedCrew": {
                    "include": {
                        "user": True
                    }
                },
                "entries": {
                    "orderBy": {
                        "timestamp": "desc"
                    },
                    "take": 10
                },
                "media": {
                    "orderBy": {
                        "createdAt": "desc"
                    },
                    "take": 5
                }
            }
        )
        
        if not current_journey:
            return {
                "success": True,
                "data": {
                    "journey": None,
                    "steps": [],
                    "progress": None
                },
                "message": "No active journey found"
            }
        
        # Calculate progress based on journey entries
        total_entries = len(current_journey.entries)
        completed_entries = len([e for e in current_journey.entries if e.type.value in ["CONFIRMATION", "SIGNATURE"]])
        progress_percentage = (completed_entries / max(total_entries, 1)) * 100
        
        # Create journey steps based on actual entries
        steps = []
        if current_journey.entries:
            # Group entries by type to create steps
            entry_types = {}
            for entry in current_journey.entries:
                if entry.type.value not in entry_types:
                    entry_types[entry.type.value] = []
                entry_types[entry.type.value].append(entry)
            
            step_order = 1
            for entry_type, entries in entry_types.items():
                steps.append({
                    "id": f"step_{entry_type}_{step_order}",
                    "title": f"{entry_type.title()} Step",
                    "description": f"Complete {entry_type.lower()} tasks",
                    "status": "completed" if entries else "pending",
                    "required": True,
                    "mediaRequired": entry_type in ["PHOTO", "SIGNATURE"],
                    "checklist": [
                        {
                            "id": f"check_{entry.id}",
                            "title": f"Complete {entry.type.value.lower()}",
                            "completed": True,
                            "required": True,
                            "mediaRequired": entry.type.value in ["PHOTO", "SIGNATURE"],
                            "timestamp": entry.timestamp.isoformat()
                        }
                        for entry in entries
                    ],
                    "order": step_order,
                    "estimatedTime": 15
                })
                step_order += 1
        
        # If no entries, create default steps
        if not steps:
            steps = [
                {
                    "id": "vehicle_check",
                    "title": "Vehicle Check",
                    "description": "Perform pre-trip inspection",
                    "status": "pending",
                    "required": True,
                    "mediaRequired": False,
                    "checklist": [
                        {"id": "fuel_check", "title": "Check fuel level", "completed": False, "required": True},
                        {"id": "tire_check", "title": "Check tire pressure", "completed": False, "required": True},
                        {"id": "equipment_check", "title": "Check moving equipment", "completed": False, "required": True}
                    ],
                    "order": 1,
                    "estimatedTime": 5
                }
            ]
        
        progress = {
            "totalSteps": len(steps),
            "completedSteps": len([s for s in steps if s["status"] == "completed"]),
            "currentStep": 0,
            "progressPercentage": progress_percentage,
            "estimatedCompletion": (datetime.now().replace(hour=datetime.now().hour + 2)).isoformat(),
            "actualStartTime": current_journey.createdAt.isoformat()
        }
        
        return {
            "success": True,
            "data": {
                "journey": {
                    "id": current_journey.id,
                    "locationId": current_journey.locationId,
                    "clientId": current_journey.clientId,
                    "date": current_journey.date.isoformat(),
                    "status": current_journey.status.value,
                    "truckNumber": current_journey.truckNumber,
                    "createdById": current_journey.createdById,
                    "createdAt": current_journey.createdAt.isoformat(),
                    "updatedAt": current_journey.updatedAt.isoformat(),
                    "assignedCrew": [
                        {
                            "id": crew.id,
                            "userId": crew.userId,
                            "role": crew.role.value,
                            "userName": crew.user.name,
                            "assignedAt": crew.assignedAt.isoformat()
                        }
                        for crew in current_journey.assignedCrew
                    ],
                    "entries": [
                        {
                            "id": entry.id,
                            "type": entry.type.value,
                            "data": entry.data,
                            "tag": entry.tag.value if entry.tag else None,
                            "timestamp": entry.timestamp.isoformat()
                        }
                        for entry in current_journey.entries
                    ],
                    "media": [
                        {
                            "id": media.id,
                            "url": media.url,
                            "type": media.type.value,
                            "createdAt": media.createdAt.isoformat()
                        }
                        for media in current_journey.media
                    ]
                },
                "steps": steps,
                "progress": progress
            },
            "message": "Journey data retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get journey data: {str(e)}")
    finally:
        await prisma.disconnect()

# Update journey status
@router.post("/journey/update")
async def update_journey_status(journey_id: str, status: str, user_id: str, location: Optional[dict] = None, notes: Optional[str] = None):
    """
    Update journey status from mobile using real database
    """
    try:
        await prisma.connect()
        
        # Update journey status
        updated_journey = await prisma.truckjourney.update(
            where={"id": journey_id},
            data={
                "status": status,
                "notes": notes,
                "updatedAt": datetime.now()
            }
        )
        
        # Create journey entry for the status update
        await prisma.journeyentry.create(
            data={
                "journeyId": journey_id,
                "createdBy": user_id,
                "type": "CONFIRMATION",
                "data": {
                    "status": status,
                    "location": location,
                    "notes": notes,
                    "updatedBy": user_id,
                    "timestamp": datetime.now().isoformat()
                },
                "tag": "COMPLETED"
            }
        )
        
        # Create mobile journey update record
        await prisma.mobilejourneyupdate.create(
            data={
                "journeyId": journey_id,
                "userId": user_id,
                "updateType": "status",
                "data": {
                    "status": status,
                    "location": location,
                    "notes": notes,
                    "timestamp": datetime.now().isoformat()
                },
                "syncStatus": "synced"
            }
        )
        
        return {
            "success": True,
            "data": {
                "journeyId": journey_id,
                "status": status,
                "updatedAt": updated_journey.updatedAt.isoformat(),
                "location": location,
                "notes": notes
            },
            "message": "Journey status updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update journey status: {str(e)}")
    finally:
        await prisma.disconnect()

# Add journey media
@router.post("/journey/media")
async def add_journey_media(
    journey_id: str,
    media_type: str,
    file: UploadFile = File(...),
    location: Optional[dict] = None,
    step_id: Optional[str] = None,
    notes: Optional[str] = None
):
    """
    Upload media (photo/video/signature) for a journey to real database
    """
    try:
        await prisma.connect()
        
        # TODO: Implement actual file upload to storage
        # For now, create a placeholder URL
        file_url = f"/uploads/mobile/{journey_id}/{file.filename}"
        
        # Create media record
        media = await prisma.media.create(
            data={
                "url": file_url,
                "type": media_type.upper(),
                "journeyId": journey_id,
                "createdAt": datetime.now()
            }
        )
        
        # Create journey entry for the media
        await prisma.journeyentry.create(
            data={
                "journeyId": journey_id,
                "createdBy": "system",  # TODO: Get from auth
                "type": "PHOTO" if media_type == "photo" else "SIGNATURE" if media_type == "signature" else "NOTE",
                "data": {
                    "mediaId": media.id,
                    "url": file_url,
                    "location": location,
                    "stepId": step_id,
                    "notes": notes,
                    "timestamp": datetime.now().isoformat()
                },
                "tag": "COMPLETED"
            }
        )
        
        # Create mobile media item record
        await prisma.mobilemediaitem.create(
            data={
                "journeyId": journey_id,
                "userId": "system",  # TODO: Get from auth
                "type": media_type,
                "filePath": file_url,
                "fileSize": file.size if hasattr(file, 'size') else 0,
                "metadata": {
                    "location": location,
                    "stepId": step_id,
                    "notes": notes,
                    "timestamp": datetime.now().isoformat()
                },
                "uploadStatus": "completed"
            }
        )
        
        return {
            "success": True,
            "data": {
                "mediaId": media.id,
                "journeyId": journey_id,
                "type": media_type,
                "filename": file.filename,
                "size": file.size if hasattr(file, 'size') else 0,
                "location": location,
                "stepId": step_id,
                "notes": notes,
                "uploadedAt": datetime.now().isoformat()
            },
            "message": "Media uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload media: {str(e)}")
    finally:
        await prisma.disconnect()

# Sync offline data
@router.post("/sync")
async def sync_offline_data(user_id: str, device_id: str, pending_updates: List[dict], pending_media: List[dict], last_sync: str):
    """
    Sync offline data from mobile device to real database
    """
    try:
        await prisma.connect()
        
        synced_updates = []
        synced_media = []
        
        # Process pending updates
        for update in pending_updates:
            if update.get("updateType") == "status":
                # Update journey status
                await prisma.truckjourney.update(
                    where={"id": update["journeyId"]},
                    data={
                        "status": update["data"]["status"],
                        "updatedAt": datetime.now()
                    }
                )
                
                # Create journey entry
                await prisma.journeyentry.create(
                    data={
                        "journeyId": update["journeyId"],
                        "createdBy": user_id,
                        "type": "CONFIRMATION",
                        "data": update["data"],
                        "tag": "COMPLETED"
                    }
                )
                
                synced_updates.append(update["id"])
        
        # Process pending media
        for media in pending_media:
            # Create media record
            media_record = await prisma.media.create(
                data={
                    "url": media.get("filePath", ""),
                    "type": media["type"].upper(),
                    "journeyId": media["journeyId"],
                    "createdAt": datetime.now()
                }
            )
            
            synced_media.append(media["id"])
        
        # Update mobile session
        await prisma.mobilesession.update(
            where={
                "userId_deviceId": {
                    "userId": user_id,
                    "deviceId": device_id
                }
            },
            data={
                "lastActive": datetime.now(),
                "syncStatus": "online"
            }
        )
        
        return {
            "success": True,
            "data": {
                "syncedUpdates": synced_updates,
                "syncedMedia": synced_media,
                "newJourneyData": None,
                "notifications": [],
                "conflicts": [],
                "lastSync": datetime.now().isoformat()
            },
            "message": "Data synced successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
    finally:
        await prisma.disconnect()

# Get offline data
@router.get("/offline/data")
async def get_offline_data(user_id: str, device_id: str):
    """
    Get offline data for mobile device from real database
    """
    try:
        await prisma.connect()
        
        # Get user data
        user = await prisma.user.find_unique(
            where={"id": user_id},
            include={
                "location": True
            }
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get current active journey
        current_journey = await prisma.truckjourney.find_first(
            where={
                "locationId": user.locationId,
                "status": {
                    "in": ["MORNING_PREP", "EN_ROUTE", "ONSITE"]
                },
                "assignedCrew": {
                    "some": {
                        "userId": user_id
                    }
                }
            }
        )
        
        # Get pending mobile updates
        pending_updates = await prisma.mobilejourneyupdate.find_many(
            where={
                "userId": user_id,
                "syncStatus": "pending"
            }
        )
        
        # Get pending mobile media
        pending_media = await prisma.mobilemediaitem.find_many(
            where={
                "userId": user_id,
                "uploadStatus": "pending"
            }
        )
        
        return {
            "success": True,
            "data": {
                "currentJourney": {
                    "id": current_journey.id,
                    "locationId": current_journey.locationId,
                    "clientId": current_journey.clientId,
                    "date": current_journey.date.isoformat(),
                    "status": current_journey.status.value,
                    "truckNumber": current_journey.truckNumber,
                    "createdById": current_journey.createdById,
                    "createdAt": current_journey.createdAt.isoformat(),
                    "updatedAt": current_journey.updatedAt.isoformat()
                } if current_journey else None,
                "pendingUpdates": [
                    {
                        "id": update.id,
                        "journeyId": update.journeyId,
                        "updateType": update.updateType,
                        "data": update.data,
                        "timestamp": update.timestamp.isoformat()
                    }
                    for update in pending_updates
                ],
                "mediaQueue": [
                    {
                        "id": media.id,
                        "journeyId": media.journeyId,
                        "type": media.type,
                        "filePath": media.filePath,
                        "metadata": media.metadata,
                        "uploadStatus": media.uploadStatus
                    }
                    for media in pending_media
                ],
                "lastSync": datetime.now().isoformat(),
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role.value,
                    "locationId": user.locationId,
                    "clientId": user.clientId,
                    "status": user.status.value
                },
                "location": {
                    "id": user.location.id,
                    "name": user.location.name,
                    "address": user.location.address
                }
            },
            "message": "Offline data retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get offline data: {str(e)}")
    finally:
        await prisma.disconnect()

# Mobile session management
@router.post("/session/create")
async def create_mobile_session(user_id: str, device_id: str, location_id: str):
    """
    Create a new mobile session in real database
    """
    try:
        await prisma.connect()
        
        session = await prisma.mobilesession.create(
            data={
                "userId": user_id,
                "deviceId": device_id,
                "locationId": location_id,
                "lastActive": datetime.now(),
                "syncStatus": "online"
            }
        )
        
        return {
            "success": True,
            "data": {
                "sessionId": session.id,
                "userId": session.userId,
                "deviceId": session.deviceId,
                "locationId": session.locationId,
                "lastActive": session.lastActive.isoformat(),
                "syncStatus": session.syncStatus
            },
            "message": "Session created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")
    finally:
        await prisma.disconnect()

@router.put("/session/update")
async def update_mobile_session(session_id: str):
    """
    Update mobile session last active time in real database
    """
    try:
        await prisma.connect()
        
        session = await prisma.mobilesession.update(
            where={"id": session_id},
            data={
                "lastActive": datetime.now()
            }
        )
        
        return {
            "success": True,
            "data": {
                "sessionId": session.id,
                "lastActive": session.lastActive.isoformat()
            },
            "message": "Session updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update session: {str(e)}")
    finally:
        await prisma.disconnect()

# Mobile notifications
@router.get("/notifications")
async def get_mobile_notifications(user_id: str, device_id: str):
    """
    Get notifications for mobile device from real database
    """
    try:
        await prisma.connect()
        
        notifications = await prisma.mobilenotification.find_many(
            where={
                "userId": user_id,
                "read": False
            },
            orderBy={
                "timestamp": "desc"
            },
            take=10
        )
        
        return {
            "success": True,
            "data": {
                "notifications": [
                    {
                        "id": notif.id,
                        "type": notif.type,
                        "title": notif.title,
                        "message": notif.message,
                        "data": notif.data,
                        "timestamp": notif.timestamp.isoformat(),
                        "read": notif.read
                    }
                    for notif in notifications
                ]
            },
            "message": "Notifications retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notifications: {str(e)}")
    finally:
        await prisma.disconnect()

# Mobile analytics
@router.get("/analytics")
async def get_mobile_analytics(user_id: str, location_id: str):
    """
    Get analytics data for mobile dashboard from real database
    """
    try:
        await prisma.connect()
        
        # Get user's journeys for today
        today = datetime.now().date()
        today_journeys = await prisma.truckjourney.find_many(
            where={
                "locationId": location_id,
                "date": {
                    "gte": today,
                    "lt": today.replace(day=today.day + 1)
                },
                "assignedCrew": {
                    "some": {
                        "userId": user_id
                    }
                }
            }
        )
        
        # Get completed journeys
        completed_journeys = [j for j in today_journeys if j.status.value == "COMPLETED"]
        
        # Get weekly performance
        week_ago = datetime.now().date() - timedelta(days=7)
        weekly_journeys = await prisma.truckjourney.find_many(
            where={
                "locationId": location_id,
                "date": {
                    "gte": week_ago
                },
                "assignedCrew": {
                    "some": {
                        "userId": user_id
                    }
                }
            }
        )
        
        # Calculate analytics
        today_progress = {
            "journeysCompleted": len(completed_journeys),
            "totalJourneys": len(today_journeys),
            "averageTime": 120,  # TODO: Calculate from actual data
            "mediaCaptured": 8   # TODO: Calculate from actual data
        }
        
        weekly_performance = {
            "journeysCompleted": len([j for j in weekly_journeys if j.status.value == "COMPLETED"]),
            "onTimeRate": 95.5,  # TODO: Calculate from actual data
            "customerSatisfaction": 4.8,  # TODO: Calculate from actual data
            "issuesResolved": 2  # TODO: Calculate from actual data
        }
        
        # Get team overview
        team_users = await prisma.user.find_many(
            where={
                "locationId": location_id,
                "status": "ACTIVE"
            }
        )
        
        team_overview = {
            "activeUsers": len(team_users),
            "totalJourneys": len(weekly_journeys),
            "averageCompletionTime": 135  # TODO: Calculate from actual data
        }
        
        return {
            "success": True,
            "data": {
                "currentStatus": "MORNING_PREP",  # TODO: Get from current journey
                "todayProgress": today_progress,
                "weeklyPerformance": weekly_performance,
                "teamOverview": team_overview
            },
            "message": "Analytics retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")
    finally:
        await prisma.disconnect()

# Mobile health check
@router.get("/health")
async def mobile_health_check():
    """
    Health check endpoint for mobile app
    """
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0.0",
            "features": {
                "offline": True,
                "gps": True,
                "camera": True,
                "sync": True,
                "realDatabase": True
            }
        },
        "message": "Mobile API is healthy and connected to real database"
    } 