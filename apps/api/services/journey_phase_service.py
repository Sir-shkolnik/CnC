"""
Journey Phase Service
C&C CRM - Complete 6-phase journey workflow management
"""

import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from decimal import Decimal
import json
from databases import Database

class JourneyPhaseService:
    def __init__(self, client_id: str, location_id: str, db: Database):
        self.client_id = client_id
        self.location_id = location_id
        self.db = db
    
    async def create_journey_phases(self, journey_id: str) -> List[Dict]:
        """Create all 6 phases for a new journey"""
        try:
            # Get phase templates
            templates = await self._get_phase_templates()
            
            phases = []
            for template in templates:
                phase_data = {
                    "journeyId": journey_id,
                    "phaseNumber": template["phaseNumber"],
                    "phaseName": template["phaseName"],
                    "status": "PENDING" if template["phaseNumber"] == 1 else "PENDING",
                    "responsibleRoles": template["responsibleRoles"],
                    "checklistItems": template["checklistItems"],
                    "mediaRequirements": template["mediaRequirements"],
                    "startTime": datetime.utcnow() if template["phaseNumber"] == 1 else None,
                    "completionTime": None
                }
                
                # Insert phase
                query = """
                    INSERT INTO "JourneyPhase" (
                        journeyId, phaseNumber, phaseName, status, responsibleRoles,
                        checklistItems, mediaRequirements, startTime, completionTime
                    ) VALUES (
                        :journeyId, :phaseNumber, :phaseName, :status, :responsibleRoles,
                        :checklistItems, :mediaRequirements, :startTime, :completionTime
                    ) RETURNING *
                """
                phase = await self.db.fetch_one(query, phase_data)
                phases.append(dict(phase))
                
                # Create checklist items for this phase
                await self._create_checklist_items(phase["id"], template["checklistItems"])
                
                # Create media requirements for this phase
                await self._create_media_requirements(phase["id"], template["mediaRequirements"])
            
            # Update journey with initial progress
            await self._update_journey_progress(journey_id)
            
            return phases
            
        except Exception as e:
            raise Exception(f"Failed to create journey phases: {str(e)}")
    
    async def get_journey_phases(self, journey_id: str) -> List[Dict]:
        """Get all phases for a journey with detailed information"""
        try:
            query = """
                SELECT 
                    jp.*,
                    COUNT(jc.id) as total_checklist_items,
                    COUNT(CASE WHEN jc.status = 'COMPLETED' THEN 1 END) as completed_checklist_items,
                    COUNT(jmr.id) as total_media_requirements,
                    COUNT(m.id) as completed_media
                FROM "JourneyPhase" jp
                LEFT JOIN "JourneyChecklist" jc ON jp.id = jc.phaseId
                LEFT JOIN "JourneyMediaRequirement" jmr ON jp.id = jmr.phaseId
                LEFT JOIN "Media" m ON jp.journeyId = m.journeyId AND jmr.mediaType = m.mediaType
                WHERE jp.journeyId = :journey_id
                GROUP BY jp.id, jp.journeyId, jp.phaseNumber, jp.phaseName, jp.status, 
                         jp.startTime, jp.completionTime, jp.responsibleRoles, 
                         jp.checklistItems, jp.mediaRequirements, jp.createdAt, jp.updatedAt
                ORDER BY jp.phaseNumber
            """
            phases = await self.db.fetch_all(query, {"journey_id": journey_id})
            return [dict(phase) for phase in phases]
            
        except Exception as e:
            raise Exception(f"Failed to get journey phases: {str(e)}")
    
    async def start_phase(self, phase_id: str, user_id: str) -> Dict:
        """Start a journey phase"""
        try:
            # Get current phase
            phase = await self._get_phase(phase_id)
            if not phase:
                raise Exception("Phase not found")
            
            if phase["status"] != "PENDING":
                raise Exception(f"Cannot start phase in {phase['status']} status")
            
            # Update phase status
            query = """
                UPDATE "JourneyPhase" 
                SET status = 'IN_PROGRESS', startTime = :start_time, updatedAt = :updated_at
                WHERE id = :phase_id
                RETURNING *
            """
            updated_phase = await self.db.fetch_one(query, {
                "phase_id": phase_id,
                "start_time": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            # Update journey progress
            await self._update_journey_progress(phase["journeyId"])
            
            return dict(updated_phase)
            
        except Exception as e:
            raise Exception(f"Failed to start phase: {str(e)}")
    
    async def complete_phase(self, phase_id: str, user_id: str) -> Dict:
        """Complete a journey phase"""
        try:
            # Get current phase
            phase = await self._get_phase(phase_id)
            if not phase:
                raise Exception("Phase not found")
            
            if phase["status"] != "IN_PROGRESS":
                raise Exception(f"Cannot complete phase in {phase['status']} status")
            
            # Check if all required checklist items are completed
            checklist_complete = await self._validate_checklist_completion(phase_id)
            if not checklist_complete:
                raise Exception("All required checklist items must be completed before completing phase")
            
            # Check if all required media is captured
            media_complete = await self._validate_media_completion(phase_id)
            if not media_complete:
                raise Exception("All required media must be captured before completing phase")
            
            # Update phase status
            query = """
                UPDATE "JourneyPhase" 
                SET status = 'COMPLETED', completionTime = :completion_time, updatedAt = :updated_at
                WHERE id = :phase_id
                RETURNING *
            """
            updated_phase = await self.db.fetch_one(query, {
                "phase_id": phase_id,
                "completion_time": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            # Start next phase if available
            await self._start_next_phase(phase["journeyId"], phase["phaseNumber"])
            
            # Update journey progress
            await self._update_journey_progress(phase["journeyId"])
            
            return dict(updated_phase)
            
        except Exception as e:
            raise Exception(f"Failed to complete phase: {str(e)}")
    
    async def complete_checklist_item(self, item_id: str, user_id: str, media_files: List = None, notes: str = None) -> Dict:
        """Complete a checklist item with optional media"""
        try:
            # Get checklist item
            query = """
                SELECT jc.*, jp.journeyId, jp.phaseNumber
                FROM "JourneyChecklist" jc
                JOIN "JourneyPhase" jp ON jc.phaseId = jp.id
                WHERE jc.id = :item_id
            """
            item = await self.db.fetch_one(query, {"item_id": item_id})
            if not item:
                raise Exception("Checklist item not found")
            
            # Update checklist item
            update_query = """
                UPDATE "JourneyChecklist" 
                SET status = 'COMPLETED', completedBy = :user_id, completedAt = :completed_at, 
                    notes = :notes, updatedAt = :updated_at
                WHERE id = :item_id
                RETURNING *
            """
            updated_item = await self.db.fetch_one(update_query, {
                "item_id": item_id,
                "user_id": user_id,
                "completed_at": datetime.utcnow(),
                "notes": notes,
                "updated_at": datetime.utcnow()
            })
            
            # Handle media files if provided
            if media_files and item["mediaRequired"]:
                await self._save_checklist_media(item["journeyId"], item_id, media_files)
            
            # Update journey progress
            await self._update_journey_progress(item["journeyId"])
            
            return dict(updated_item)
            
        except Exception as e:
            raise Exception(f"Failed to complete checklist item: {str(e)}")
    
    async def get_journey_progress(self, journey_id: str) -> Dict:
        """Get comprehensive journey progress with all phases"""
        try:
            # Get journey with progress
            journey_query = """
                SELECT * FROM "JourneyProgressView" WHERE journey_id = :journey_id
            """
            journey_progress = await self.db.fetch_one(journey_query, {"journey_id": journey_id})
            
            # Get phases with detailed progress
            phases = await self.get_journey_phases(journey_id)
            
            # Get checklist progress
            checklist_query = """
                SELECT * FROM "JourneyChecklistProgressView" WHERE journey_id = :journey_id
            """
            checklist_progress = await self.db.fetch_all(checklist_query, {"journey_id": journey_id})
            
            # Get media progress
            media_query = """
                SELECT * FROM "JourneyMediaProgressView" WHERE journey_id = :journey_id
            """
            media_progress = await self.db.fetch_all(media_query, {"journey_id": journey_id})
            
            return {
                "journey": dict(journey_progress) if journey_progress else {},
                "phases": phases,
                "checklistProgress": [dict(cp) for cp in checklist_progress],
                "mediaProgress": [dict(mp) for mp in media_progress],
                "overallProgress": self._calculate_overall_progress(phases, checklist_progress, media_progress)
            }
            
        except Exception as e:
            raise Exception(f"Failed to get journey progress: {str(e)}")
    
    async def _get_phase_templates(self) -> List[Dict]:
        """Get phase templates from database"""
        query = "SELECT * FROM \"JourneyPhaseTemplate\" ORDER BY phaseNumber"
        templates = await self.db.fetch_all(query)
        return [dict(template) for template in templates]
    
    async def _create_checklist_items(self, phase_id: str, checklist_items: List[Dict]):
        """Create checklist items for a phase"""
        for item in checklist_items:
            query = """
                INSERT INTO "JourneyChecklist" (
                    phaseId, itemId, title, status, required, mediaRequired, sortOrder
                ) VALUES (
                    :phaseId, :itemId, :title, :status, :required, :mediaRequired, :sortOrder
                )
            """
            await self.db.execute(query, {
                "phaseId": phase_id,
                "itemId": item["id"],
                "title": item["title"],
                "status": "PENDING",
                "required": item["required"],
                "mediaRequired": item["mediaRequired"],
                "sortOrder": item.get("sortOrder", 0)
            })
    
    async def _create_media_requirements(self, phase_id: str, media_requirements: List[Dict]):
        """Create media requirements for a phase"""
        for req in media_requirements:
            query = """
                INSERT INTO "JourneyMediaRequirement" (
                    phaseId, mediaType, title, required, qualityStandards, sortOrder
                ) VALUES (
                    :phaseId, :mediaType, :title, :required, :qualityStandards, :sortOrder
                )
            """
            await self.db.execute(query, {
                "phaseId": phase_id,
                "mediaType": req["mediaType"],
                "title": req["title"],
                "required": req["required"],
                "qualityStandards": req.get("qualityStandards", {}),
                "sortOrder": req.get("sortOrder", 0)
            })
    
    async def _get_phase(self, phase_id: str) -> Optional[Dict]:
        """Get a single phase by ID"""
        query = "SELECT * FROM \"JourneyPhase\" WHERE id = :phase_id"
        phase = await self.db.fetch_one(query, {"phase_id": phase_id})
        return dict(phase) if phase else None
    
    async def _validate_checklist_completion(self, phase_id: str) -> bool:
        """Validate that all required checklist items are completed"""
        query = """
            SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
            FROM "JourneyChecklist" 
            WHERE phaseId = :phase_id AND required = true
        """
        result = await self.db.fetch_one(query, {"phase_id": phase_id})
        return result["total"] == result["completed"]
    
    async def _validate_media_completion(self, phase_id: str) -> bool:
        """Validate that all required media is captured"""
        query = """
            SELECT COUNT(*) as total, COUNT(m.id) as completed
            FROM "JourneyMediaRequirement" jmr
            LEFT JOIN "Media" m ON jmr.phaseId = m.phaseId AND jmr.mediaType = m.mediaType
            WHERE jmr.phaseId = :phase_id AND jmr.required = true
        """
        result = await self.db.fetch_one(query, {"phase_id": phase_id})
        return result["total"] == result["completed"]
    
    async def _start_next_phase(self, journey_id: str, current_phase_number: int):
        """Start the next phase if available"""
        next_phase_query = """
            SELECT id FROM "JourneyPhase" 
            WHERE journeyId = :journey_id AND phaseNumber = :next_phase
        """
        next_phase = await self.db.fetch_one(next_phase_query, {
            "journey_id": journey_id,
            "next_phase": current_phase_number + 1
        })
        
        if next_phase:
            await self.start_phase(next_phase["id"], "system")
    
    async def _update_journey_progress(self, journey_id: str):
        """Update journey progress based on phase completion"""
        # Calculate progress
        phases_query = """
            SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
            FROM "JourneyPhase" WHERE journeyId = :journey_id
        """
        progress_result = await self.db.fetch_one(phases_query, {"journey_id": journey_id})
        
        total_phases = progress_result["total"]
        completed_phases = progress_result["completed"]
        progress = (completed_phases / total_phases * 100) if total_phases > 0 else 0
        
        # Get current phase
        current_phase_query = """
            SELECT phaseNumber FROM "JourneyPhase" 
            WHERE journeyId = :journey_id AND status = 'IN_PROGRESS'
            ORDER BY phaseNumber LIMIT 1
        """
        current_phase_result = await self.db.fetch_one(current_phase_query, {"journey_id": journey_id})
        current_phase = current_phase_result["phaseNumber"] if current_phase_result else 1
        
        # Update journey
        update_query = """
            UPDATE "TruckJourney" 
            SET currentPhase = :current_phase, progress = :progress, updatedAt = :updated_at
            WHERE id = :journey_id
        """
        await self.db.execute(update_query, {
            "journey_id": journey_id,
            "current_phase": current_phase,
            "progress": progress,
            "updated_at": datetime.utcnow()
        })
    
    async def _save_checklist_media(self, journey_id: str, checklist_item_id: str, media_files: List):
        """Save media files for a checklist item"""
        # Implementation for saving media files
        # This would integrate with the existing Media service
        pass
    
    def _calculate_overall_progress(self, phases: List[Dict], checklist_progress: List, media_progress: List) -> Dict:
        """Calculate overall progress metrics"""
        total_phases = len(phases)
        completed_phases = len([p for p in phases if p["status"] == "COMPLETED"])
        active_phases = len([p for p in phases if p["status"] == "IN_PROGRESS"])
        
        total_checklist_items = sum(cp["total_checklist_items"] for cp in checklist_progress)
        completed_checklist_items = sum(cp["completed_items"] for cp in checklist_progress)
        
        total_media_requirements = sum(mp["total_media_requirements"] for mp in media_progress)
        completed_media = sum(mp["completed_media"] for mp in media_progress)
        
        return {
            "phaseProgress": (completed_phases / total_phases * 100) if total_phases > 0 else 0,
            "checklistProgress": (completed_checklist_items / total_checklist_items * 100) if total_checklist_items > 0 else 0,
            "mediaProgress": (completed_media / total_media_requirements * 100) if total_media_requirements > 0 else 0,
            "overallProgress": (completed_phases / total_phases * 100) if total_phases > 0 else 0,
            "activePhase": active_phases,
            "completedPhases": completed_phases,
            "totalPhases": total_phases
        } 