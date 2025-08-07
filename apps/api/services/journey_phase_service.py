"""
Journey Phase Service
Handles 6-phase journey workflow with checklists and media requirements
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
import json
from enum import Enum

class PhaseStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class JourneyPhaseService:
    def __init__(self, client_id: str, location_id: str, db_connection):
        self.client_id = client_id
        self.location_id = location_id
        self.db = db_connection
    
    def _get_default_phases(self) -> List[Dict]:
        """Get default 6-phase configuration"""
        return [
            {
                "phaseNumber": 1,
                "phaseName": "JOURNEY_CREATION",
                "responsibleRoles": ["DISPATCHER"],
                "checklistItems": [
                    {"id": "create_journey", "title": "Create journey", "required": True, "mediaRequired": False},
                    {"id": "assign_crew", "title": "Assign crew", "required": True, "mediaRequired": False},
                    {"id": "set_schedule", "title": "Set schedule", "required": True, "mediaRequired": False}
                ],
                "mediaRequirements": []
            },
            {
                "phaseNumber": 2,
                "phaseName": "MORNING_PREP",
                "responsibleRoles": ["DRIVER", "MOVER"],
                "checklistItems": [
                    {"id": "vehicle_inspection", "title": "Vehicle inspection", "required": True, "mediaRequired": True},
                    {"id": "equipment_check", "title": "Equipment check", "required": True, "mediaRequired": False},
                    {"id": "route_planning", "title": "Route planning", "required": True, "mediaRequired": False}
                ],
                "mediaRequirements": [
                    {"mediaType": "PHOTO", "title": "Vehicle photos", "required": True}
                ]
            },
            {
                "phaseNumber": 3,
                "phaseName": "PICKUP_OPERATIONS",
                "responsibleRoles": ["DRIVER", "MOVER"],
                "checklistItems": [
                    {"id": "arrive_pickup", "title": "Arrive at pickup", "required": True, "mediaRequired": True},
                    {"id": "customer_verification", "title": "Customer verification", "required": True, "mediaRequired": False},
                    {"id": "inventory_check", "title": "Inventory check", "required": True, "mediaRequired": True},
                    {"id": "loading_process", "title": "Loading process", "required": True, "mediaRequired": True}
                ],
                "mediaRequirements": [
                    {"mediaType": "PHOTO", "title": "Arrival photo", "required": True},
                    {"mediaType": "PHOTO", "title": "Inventory photos", "required": True},
                    {"mediaType": "SIGNATURE", "title": "Customer signature", "required": True}
                ]
            },
            {
                "phaseNumber": 4,
                "phaseName": "TRANSPORT_OPERATIONS",
                "responsibleRoles": ["DRIVER"],
                "checklistItems": [
                    {"id": "gps_tracking", "title": "GPS tracking active", "required": True, "mediaRequired": False},
                    {"id": "route_confirmation", "title": "Route confirmation", "required": True, "mediaRequired": False},
                    {"id": "eta_updates", "title": "ETA updates", "required": False, "mediaRequired": False}
                ],
                "mediaRequirements": [
                    {"mediaType": "GPS", "title": "GPS tracking data", "required": True}
                ]
            },
            {
                "phaseNumber": 5,
                "phaseName": "DELIVERY_OPERATIONS",
                "responsibleRoles": ["DRIVER", "MOVER"],
                "checklistItems": [
                    {"id": "arrive_delivery", "title": "Arrive at delivery", "required": True, "mediaRequired": True},
                    {"id": "customer_verification", "title": "Customer verification", "required": True, "mediaRequired": False},
                    {"id": "unloading_process", "title": "Unloading process", "required": True, "mediaRequired": True},
                    {"id": "condition_verification", "title": "Condition verification", "required": True, "mediaRequired": True}
                ],
                "mediaRequirements": [
                    {"mediaType": "PHOTO", "title": "Delivery arrival photo", "required": True},
                    {"mediaType": "PHOTO", "title": "Unloading photos", "required": True},
                    {"mediaType": "SIGNATURE", "title": "Completion signature", "required": True}
                ]
            },
            {
                "phaseNumber": 6,
                "phaseName": "JOURNEY_COMPLETION",
                "responsibleRoles": ["DRIVER", "MOVER"],
                "checklistItems": [
                    {"id": "final_verification", "title": "Final verification", "required": True, "mediaRequired": False},
                    {"id": "paperwork_completion", "title": "Paperwork completion", "required": True, "mediaRequired": False},
                    {"id": "customer_feedback", "title": "Customer feedback", "required": False, "mediaRequired": False},
                    {"id": "return_base", "title": "Return to base", "required": True, "mediaRequired": False}
                ],
                "mediaRequirements": [
                    {"mediaType": "SIGNATURE", "title": "Final signature", "required": True}
                ]
            }
        ]
    
    async def create_journey_phases(self, journey_id: str) -> List[Dict]:
        """Create all 6 phases for a new journey"""
        try:
            phases = self._get_default_phases()
            created_phases = []
            
            for phase_config in phases:
                # Create phase
                phase_query = """
                    INSERT INTO "JourneyPhase" (
                        journeyId, phaseNumber, phaseName, status, 
                        checklistItems, mediaRequirements, responsibleRoles,
                        createdAt, updatedAt
                    ) VALUES (
                        :journey_id, :phase_number, :phase_name, :status,
                        :checklist_items, :media_requirements, :responsible_roles,
                        NOW(), NOW()
                    ) RETURNING id, phaseNumber, phaseName, status
                """
                
                phase_result = await self.db.fetch_one(phase_query, {
                    "journey_id": journey_id,
                    "phase_number": phase_config["phaseNumber"],
                    "phase_name": phase_config["phaseName"],
                    "status": PhaseStatus.PENDING.value,
                    "checklist_items": json.dumps(phase_config["checklistItems"]),
                    "media_requirements": json.dumps(phase_config["mediaRequirements"]),
                    "responsible_roles": phase_config["responsibleRoles"]
                })
                
                created_phases.append({
                    "id": phase_result["id"],
                    "phaseNumber": phase_result["phaseNumber"],
                    "phaseName": phase_result["phaseName"],
                    "status": phase_result["status"]
                })
            
            # Update journey with initial progress
            await self.update_journey_progress(journey_id)
            
            return created_phases
            
        except Exception as e:
            print(f"Error creating journey phases: {e}")
            raise
    
    async def update_phase_status(self, phase_id: str, status: str, user_id: str) -> Dict:
        """Update phase status and trigger next phase if needed"""
        try:
            # Update phase status
            update_query = """
                UPDATE "JourneyPhase" 
                SET status = :status, 
                    startTime = CASE WHEN :status = 'IN_PROGRESS' AND startTime IS NULL THEN NOW() ELSE startTime END,
                    completionTime = CASE WHEN :status = 'COMPLETED' THEN NOW() ELSE completionTime END,
                    updatedAt = NOW()
                WHERE id = :phase_id
                RETURNING id, phaseNumber, phaseName, status, startTime, completionTime
            """
            
            result = await self.db.fetch_one(update_query, {
                "phase_id": phase_id,
                "status": status
            })
            
            if result:
                # Get journey ID for progress update
                journey_query = "SELECT journeyId FROM \"JourneyPhase\" WHERE id = :phase_id"
                journey_result = await self.db.fetch_one(journey_query, {"phase_id": phase_id})
                
                if journey_result:
                    # Update journey progress
                    await self.update_journey_progress(journey_result["journeyId"])
                    
                    # Auto-start next phase if current phase completed
                    if status == PhaseStatus.COMPLETED.value:
                        await self.auto_start_next_phase(journey_result["journeyId"], result["phaseNumber"])
                
                return {
                    "id": result["id"],
                    "phaseNumber": result["phaseNumber"],
                    "phaseName": result["phaseName"],
                    "status": result["status"],
                    "startTime": result["startTime"],
                    "completionTime": result["completionTime"]
                }
            
            return {}
            
        except Exception as e:
            print(f"Error updating phase status: {e}")
            raise
    
    async def complete_checklist_item(self, item_id: str, user_id: str, media_files: List = None) -> Dict:
        """Complete a checklist item with optional media"""
        try:
            # This would be implemented to update specific checklist items
            # For now, return success response
            return {
                "success": True,
                "itemId": item_id,
                "completedBy": user_id,
                "completedAt": datetime.utcnow().isoformat(),
                "mediaFiles": media_files or []
            }
            
        except Exception as e:
            print(f"Error completing checklist item: {e}")
            raise
    
    async def get_journey_progress(self, journey_id: str) -> Dict:
        """Get comprehensive journey progress with all phases"""
        try:
            # Get all phases for journey
            phases_query = """
                SELECT id, phaseNumber, phaseName, status, startTime, completionTime,
                       checklistItems, mediaRequirements, responsibleRoles
                FROM "JourneyPhase"
                WHERE journeyId = :journey_id
                ORDER BY phaseNumber
            """
            
            phases = await self.db.fetch_all(phases_query, {"journey_id": journey_id})
            
            # Calculate progress
            total_phases = len(phases)
            completed_phases = len([p for p in phases if p["status"] == PhaseStatus.COMPLETED.value])
            progress_percentage = (completed_phases / total_phases * 100) if total_phases > 0 else 0
            
            # Find current phase
            current_phase = 1
            for phase in phases:
                if phase["status"] in [PhaseStatus.PENDING.value, PhaseStatus.IN_PROGRESS.value]:
                    current_phase = phase["phaseNumber"]
                    break
            
            return {
                "journeyId": journey_id,
                "currentPhase": current_phase,
                "totalPhases": total_phases,
                "completedPhases": completed_phases,
                "progressPercentage": round(progress_percentage, 2),
                "phases": [
                    {
                        "id": phase["id"],
                        "phaseNumber": phase["phaseNumber"],
                        "phaseName": phase["phaseName"],
                        "status": phase["status"],
                        "startTime": phase["startTime"],
                        "completionTime": phase["completionTime"],
                        "checklistItems": json.loads(phase["checklistItems"]) if phase["checklistItems"] else [],
                        "mediaRequirements": json.loads(phase["mediaRequirements"]) if phase["mediaRequirements"] else [],
                        "responsibleRoles": phase["responsibleRoles"]
                    }
                    for phase in phases
                ]
            }
            
        except Exception as e:
            print(f"Error getting journey progress: {e}")
            raise
    
    async def update_journey_progress(self, journey_id: str) -> None:
        """Update journey progress in TruckJourney table"""
        try:
            progress_data = await self.get_journey_progress(journey_id)
            
            update_query = """
                UPDATE "TruckJourney"
                SET currentPhase = :current_phase,
                    progress = :progress,
                    updatedAt = NOW()
                WHERE id = :journey_id
            """
            
            await self.db.execute(update_query, {
                "journey_id": journey_id,
                "current_phase": progress_data["currentPhase"],
                "progress": progress_data["progressPercentage"]
            })
            
        except Exception as e:
            print(f"Error updating journey progress: {e}")
            raise
    
    async def auto_start_next_phase(self, journey_id: str, current_phase_number: int) -> None:
        """Automatically start the next phase when current phase is completed"""
        try:
            next_phase_number = current_phase_number + 1
            
            if next_phase_number <= 6:  # Only 6 phases total
                next_phase_query = """
                    UPDATE "JourneyPhase"
                    SET status = 'IN_PROGRESS',
                        startTime = NOW(),
                        updatedAt = NOW()
                    WHERE journeyId = :journey_id AND phaseNumber = :phase_number
                """
                
                await self.db.execute(next_phase_query, {
                    "journey_id": journey_id,
                    "phase_number": next_phase_number
                })
                
        except Exception as e:
            print(f"Error auto-starting next phase: {e}")
            raise 