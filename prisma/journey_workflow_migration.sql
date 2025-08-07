-- Journey Workflow Migration
-- Adds JourneyPhase table and progress tracking to TruckJourney
-- This completes the 6-phase workflow system

BEGIN;

-- Create JourneyPhase table
CREATE TABLE IF NOT EXISTS "JourneyPhase" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    journeyId TEXT NOT NULL,
    phaseNumber INTEGER NOT NULL,
    phaseName TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    startTime TIMESTAMP,
    completionTime TIMESTAMP,
    checklistItems JSONB,
    mediaRequirements JSONB,
    responsibleRoles TEXT[],
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_journey_phase_journey FOREIGN KEY (journeyId) REFERENCES "TruckJourney"(id) ON DELETE CASCADE
);

-- Create JourneyChecklist table
CREATE TABLE IF NOT EXISTS "JourneyChecklist" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    phaseId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    required BOOLEAN NOT NULL DEFAULT true,
    mediaRequired BOOLEAN NOT NULL DEFAULT false,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    completedBy TEXT,
    completedAt TIMESTAMP,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_checklist_phase FOREIGN KEY (phaseId) REFERENCES "JourneyPhase"(id) ON DELETE CASCADE
);

-- Create JourneyMediaRequirement table
CREATE TABLE IF NOT EXISTS "JourneyMediaRequirement" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    phaseId TEXT NOT NULL,
    mediaType TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    required BOOLEAN NOT NULL DEFAULT true,
    qualityStandards JSONB,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_media_requirement_phase FOREIGN KEY (phaseId) REFERENCES "JourneyPhase"(id) ON DELETE CASCADE
);

-- Add progress tracking columns to TruckJourney
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS currentPhase INTEGER DEFAULT 1;
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS checklistCompletion TEXT DEFAULT '0/0';
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS mediaCompletion TEXT DEFAULT '0/0';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journey_phase_status ON "JourneyPhase"(status);
CREATE INDEX IF NOT EXISTS idx_journey_phase_journey ON "JourneyPhase"(journeyId);
CREATE INDEX IF NOT EXISTS idx_journey_phase_number ON "JourneyPhase"(journeyId, phaseNumber);
CREATE INDEX IF NOT EXISTS idx_checklist_phase_status ON "JourneyChecklist"(phaseId, status);
CREATE INDEX IF NOT EXISTS idx_media_requirement_phase ON "JourneyMediaRequirement"(phaseId);

-- Insert default phase templates (commented out for now - will be handled by service)
-- INSERT INTO "JourneyPhaseTemplate" (phaseNumber, phaseName, checklistItems, mediaRequirements, responsibleRoles) VALUES
-- (1, 'JOURNEY_CREATION', 
--  '[
--    {"id": "create_journey", "title": "Create journey", "required": true, "mediaRequired": false},
--    {"id": "assign_crew", "title": "Assign crew", "required": true, "mediaRequired": false},
--    {"id": "set_schedule", "title": "Set schedule", "required": true, "mediaRequired": false}
--  ]', 
--  '[]',
--  ARRAY['DISPATCHER']),
-- (2, 'MORNING_PREP', 
--  '[
--    {"id": "vehicle_inspection", "title": "Vehicle inspection", "required": true, "mediaRequired": true},
--    {"id": "equipment_check", "title": "Equipment check", "required": true, "mediaRequired": false},
--    {"id": "route_planning", "title": "Route planning", "required": true, "mediaRequired": false}
--  ]', 
--  '[
--    {"mediaType": "PHOTO", "title": "Vehicle photos", "required": true}
--  ]',
--  ARRAY['DRIVER', 'MOVER']),
-- (3, 'PICKUP_OPERATIONS', 
--  '[
--    {"id": "arrive_pickup", "title": "Arrive at pickup", "required": true, "mediaRequired": true},
--    {"id": "customer_verification", "title": "Customer verification", "required": true, "mediaRequired": false},
--    {"id": "inventory_check", "title": "Inventory check", "required": true, "mediaRequired": true},
--    {"id": "loading_process", "title": "Loading process", "required": true, "mediaRequired": true}
--  ]', 
--  '[
--    {"mediaType": "PHOTO", "title": "Arrival photo", "required": true},
--    {"mediaType": "PHOTO", "title": "Inventory photos", "required": true},
--    {"mediaType": "SIGNATURE", "title": "Customer signature", "required": true}
--  ]',
--  ARRAY['DRIVER', 'MOVER']),
-- (4, 'TRANSPORT_OPERATIONS', 
--  '[
--    {"id": "gps_tracking", "title": "GPS tracking active", "required": true, "mediaRequired": false},
--    {"id": "route_confirmation", "title": "Route confirmation", "required": true, "mediaRequired": false},
--    {"id": "eta_updates", "title": "ETA updates", "required": false, "mediaRequired": false}
--  ]', 
--  '[
--    {"mediaType": "GPS", "title": "GPS tracking data", "required": true}
--  ]',
--  ARRAY['DRIVER']),
-- (5, 'DELIVERY_OPERATIONS', 
--  '[
--    {"id": "arrive_delivery", "title": "Arrive at delivery", "required": true, "mediaRequired": true},
--    {"id": "customer_verification", "title": "Customer verification", "required": true, "mediaRequired": false},
--    {"id": "unloading_process", "title": "Unloading process", "required": true, "mediaRequired": true},
--    {"id": "condition_verification", "title": "Condition verification", "required": true, "mediaRequired": true}
--  ]', 
--  '[
--    {"mediaType": "PHOTO", "title": "Delivery arrival photo", "required": true},
--    {"mediaType": "PHOTO", "title": "Unloading photos", "required": true},
--    {"mediaType": "SIGNATURE", "title": "Completion signature", "required": true}
--  ]',
--  ARRAY['DRIVER', 'MOVER']),
-- (6, 'JOURNEY_COMPLETION', 
--  '[
--    {"id": "final_verification", "title": "Final verification", "required": true, "mediaRequired": false},
--    {"id": "paperwork_completion", "title": "Paperwork completion", "required": true, "mediaRequired": false},
--    {"id": "customer_feedback", "title": "Customer feedback", "required": false, "mediaRequired": false},
--    {"id": "return_base", "title": "Return to base", "required": true, "mediaRequired": false}
--  ]', 
--  '[
--    {"mediaType": "SIGNATURE", "title": "Final signature", "required": true}
--  ]',
--  ARRAY['DRIVER', 'MOVER']);

COMMIT;
