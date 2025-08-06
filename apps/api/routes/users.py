"""
Users Management Routes
Handles user CRUD operations for multi-tenant system
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

# Mock user data for demonstration
MOCK_USERS = {
    # LGM Corporate Users
    "lgm_corporate": [
        {
            "id": "user_admin_001",
            "name": "Sarah Johnson",
            "email": "sarah.johnson@lgm.com",
            "role": "ADMIN",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_dispatcher_001",
            "name": "Michael Chen",
            "email": "mike.chen@lgm.com",
            "role": "DISPATCHER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_manager_001",
            "name": "Jennifer Rodriguez",
            "email": "jen.rodriguez@lgm.com",
            "role": "MANAGER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_auditor_001",
            "name": "Robert Kim",
            "email": "rob.kim@lgm.com",
            "role": "AUDITOR",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_driver_001",
            "name": "David Rodriguez",
            "email": "david.rodriguez@lgm.com",
            "role": "DRIVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_driver_002",
            "name": "James Wilson",
            "email": "james.wilson@lgm.com",
            "role": "DRIVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_driver_003",
            "name": "Carlos Martinez",
            "email": "carlos.martinez@lgm.com",
            "role": "DRIVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_driver_004",
            "name": "Thomas Anderson",
            "email": "thomas.anderson@lgm.com",
            "role": "DRIVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_mover_001",
            "name": "Maria Garcia",
            "email": "maria.garcia@lgm.com",
            "role": "MOVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_mover_002",
            "name": "Alex Thompson",
            "email": "alex.thompson@lgm.com",
            "role": "MOVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_mover_003",
            "name": "Lisa Park",
            "email": "lisa.park@lgm.com",
            "role": "MOVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_mover_004",
            "name": "Kevin O'Brien",
            "email": "kevin.obrien@lgm.com",
            "role": "MOVER",
            "clientId": "clm_lgm_corp_001",
            "locationId": "loc_lgm_toronto_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
    ],
    
    # LGM Hamilton Franchise Users
    "lgm_hamilton": [
        {
            "id": "user_franchise_001",
            "name": "Frank Williams",
            "email": "frank.williams@lgmhamilton.com",
            "role": "ADMIN",
            "clientId": "clm_lgm_hamilton_001",
            "locationId": "loc_lgm_hamilton_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_franchise_002",
            "name": "Patricia Davis",
            "email": "patricia.davis@lgmhamilton.com",
            "role": "DISPATCHER",
            "clientId": "clm_lgm_hamilton_001",
            "locationId": "loc_lgm_hamilton_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_franchise_003",
            "name": "Ryan Johnson",
            "email": "ryan.johnson@lgmhamilton.com",
            "role": "DRIVER",
            "clientId": "clm_lgm_hamilton_001",
            "locationId": "loc_lgm_hamilton_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_franchise_004",
            "name": "Amanda Lee",
            "email": "amanda.lee@lgmhamilton.com",
            "role": "DRIVER",
            "clientId": "clm_lgm_hamilton_001",
            "locationId": "loc_lgm_hamilton_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_franchise_005",
            "name": "Daniel Brown",
            "email": "daniel.brown@lgmhamilton.com",
            "role": "MOVER",
            "clientId": "clm_lgm_hamilton_001",
            "locationId": "loc_lgm_hamilton_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_franchise_006",
            "name": "Sophie Taylor",
            "email": "sophie.taylor@lgmhamilton.com",
            "role": "MOVER",
            "clientId": "clm_lgm_hamilton_001",
            "locationId": "loc_lgm_hamilton_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
    ],
    
    # Call Center Support Users
    "call_center_support": [
        {
            "id": "user_callcenter_001",
            "name": "Emily Watson",
            "email": "emily.watson@callcenter.com",
            "role": "ADMIN",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_002",
            "name": "Christopher Lee",
            "email": "chris.lee@callcenter.com",
            "role": "MANAGER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_003",
            "name": "Rachel Green",
            "email": "rachel.green@callcenter.com",
            "role": "AUDITOR",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_004",
            "name": "Jessica Smith",
            "email": "jessica.smith@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_005",
            "name": "Matthew Davis",
            "email": "matthew.davis@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_006",
            "name": "Ashley Johnson",
            "email": "ashley.johnson@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_007",
            "name": "Brandon Wilson",
            "email": "brandon.wilson@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_008",
            "name": "Nicole Brown",
            "email": "nicole.brown@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_009",
            "name": "Steven Miller",
            "email": "steven.miller@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_callcenter_010",
            "name": "Amanda Garcia",
            "email": "amanda.garcia@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_main_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
    ],
    
    # Call Center Sales Users
    "call_center_sales": [
        {
            "id": "user_sales_001",
            "name": "Mark Thompson",
            "email": "mark.thompson@callcenter.com",
            "role": "MANAGER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_sales_002",
            "name": "Sarah Mitchell",
            "email": "sarah.mitchell@callcenter.com",
            "role": "AUDITOR",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_sales_003",
            "name": "Kevin Anderson",
            "email": "kevin.anderson@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_sales_004",
            "name": "Lisa Martinez",
            "email": "lisa.martinez@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_sales_005",
            "name": "Robert Taylor",
            "email": "robert.taylor@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_sales_006",
            "name": "Jennifer White",
            "email": "jennifer.white@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_sales_007",
            "name": "Michael Clark",
            "email": "michael.clark@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user_sales_008",
            "name": "Stephanie Lewis",
            "email": "stephanie.lewis@callcenter.com",
            "role": "DISPATCHER",
            "clientId": "clm_callcenter_001",
            "locationId": "loc_callcenter_sales_001",
            "status": "ACTIVE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
    ]
}

# Flatten all users for easier access
ALL_USERS = []
for org_users in MOCK_USERS.values():
    ALL_USERS.extend(org_users)

router = APIRouter(tags=["Users"])

@router.get("/")
async def get_users(
    client_id: Optional[str] = None,
    location_id: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get users with optional filtering
    Supports multi-tenant filtering by client_id and location_id
    """
    try:
        # Filter users based on parameters
        filtered_users = ALL_USERS.copy()
        
        if client_id:
            filtered_users = [u for u in filtered_users if u["clientId"] == client_id]
        
        if location_id:
            filtered_users = [u for u in filtered_users if u["locationId"] == location_id]
        
        if role:
            filtered_users = [u for u in filtered_users if u["role"] == role]
        
        if status:
            filtered_users = [u for u in filtered_users if u["status"] == status]
        
        return {
            "success": True,
            "data": {
                "users": filtered_users,
                "total": len(filtered_users),
                "filters": {
                    "client_id": client_id,
                    "location_id": location_id,
                    "role": role,
                    "status": status
                }
            },
            "message": f"Retrieved {len(filtered_users)} users successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve users: {str(e)}"
        )

@router.post("/")
async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new user
    Required fields: name, email, role, password, clientId, locationId
    """
    try:
        # Validate required fields
        required_fields = ["name", "email", "role", "password", "clientId", "locationId"]
        for field in required_fields:
            if field not in user_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Check if user already exists
        existing_user = next((u for u in ALL_USERS if u["email"] == user_data["email"]), None)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email {user_data['email']} already exists"
            )
        
        # Create new user
        new_user = {
            "id": f"user_{len(ALL_USERS) + 1:03d}",
            "name": user_data["name"],
            "email": user_data["email"],
            "role": user_data["role"],
            "clientId": user_data["clientId"],
            "locationId": user_data["locationId"],
            "status": user_data.get("status", "ACTIVE"),
            "createdAt": datetime.now().isoformat() + "Z",
            "updatedAt": datetime.now().isoformat() + "Z"
        }
        
        # Add to mock data (in real implementation, this would be saved to database)
        ALL_USERS.append(new_user)
        
        return {
            "success": True,
            "data": {
                "user": new_user
            },
            "message": f"User {new_user['name']} created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.get("/{user_id}")
async def get_user(user_id: str) -> Dict[str, Any]:
    """
    Get a specific user by ID
    """
    try:
        user = next((u for u in ALL_USERS if u["id"] == user_id), None)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        return {
            "success": True,
            "data": {
                "user": user
            },
            "message": "User retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user: {str(e)}"
        )

@router.patch("/{user_id}")
async def update_user(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update a user
    """
    try:
        user = next((u for u in ALL_USERS if u["id"] == user_id), None)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        # Update allowed fields
        allowed_fields = ["name", "role", "status"]
        for field, value in updates.items():
            if field in allowed_fields:
                user[field] = value
        
        user["updatedAt"] = datetime.now().isoformat() + "Z"
        
        return {
            "success": True,
            "data": {
                "user": user
            },
            "message": f"User {user['name']} updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/{user_id}")
async def delete_user(user_id: str) -> Dict[str, Any]:
    """
    Delete a user (soft delete by setting status to INACTIVE)
    """
    try:
        user = next((u for u in ALL_USERS if u["id"] == user_id), None)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        # Soft delete
        user["status"] = "INACTIVE"
        user["updatedAt"] = datetime.now().isoformat() + "Z"
        
        return {
            "success": True,
            "data": {
                "user": user
            },
            "message": f"User {user['name']} deactivated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

@router.get("/crew/scoreboard")
async def get_crew_scoreboard(
    client_id: Optional[str] = None,
    location_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get crew performance scoreboard
    """
    try:
        # Filter users to get crew members (DRIVER, MOVER)
        crew_users = [u for u in ALL_USERS if u["role"] in ["DRIVER", "MOVER"]]
        
        if client_id:
            crew_users = [u for u in crew_users if u["clientId"] == client_id]
        
        if location_id:
            crew_users = [u for u in crew_users if u["locationId"] == location_id]
        
        # Mock performance data
        crew_performance = []
        for user in crew_users:
            # Generate mock performance metrics
            import random
            performance = {
                "id": user["id"],
                "name": user["name"],
                "role": user["role"],
                "email": user["email"],
                "performance": {
                    "rating": round(random.uniform(3.5, 5.0), 1),
                    "journeys_completed": random.randint(10, 50),
                    "on_time_rate": round(random.uniform(85, 98), 1),
                    "customer_satisfaction": round(random.uniform(4.0, 5.0), 1),
                    "safety_score": round(random.uniform(90, 100), 1)
                },
                "last_active": datetime.now().isoformat() + "Z"
            }
            crew_performance.append(performance)
        
        # Sort by rating
        crew_performance.sort(key=lambda x: x["performance"]["rating"], reverse=True)
        
        return {
            "success": True,
            "data": {
                "crew": crew_performance,
                "total": len(crew_performance),
                "filters": {
                    "client_id": client_id,
                    "location_id": location_id
                }
            },
            "message": f"Retrieved performance data for {len(crew_performance)} crew members"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve crew scoreboard: {str(e)}"
        ) 