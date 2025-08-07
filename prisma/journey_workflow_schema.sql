-- Journey Workflow Schema for C&C CRM
-- Complete 6-phase journey workflow with unified data architecture

-- Journey Phase Management
CREATE TABLE IF NOT EXISTS "JourneyPhase" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    journeyId TEXT NOT NULL,
    phaseNumber INTEGER NOT NULL,
    phaseName TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    startTime TIMESTAMP,
    completionTime TIMESTAMP,
    responsibleRoles TEXT[] NOT NULL,
    checklistItems JSONB,
    mediaRequirements JSONB,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_journey_phase_journey FOREIGN KEY (journeyId) REFERENCES "TruckJourney"(id) ON DELETE CASCADE
);

-- Journey Checklist Items
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

-- Journey Media Requirements
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

-- Enhanced Journey Tracking
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS currentPhase INTEGER DEFAULT 1;
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS checklistCompletion TEXT DEFAULT '0/0';
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS mediaCompletion TEXT DEFAULT '0/0';

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_journey_phase_status ON "JourneyPhase"(status);
CREATE INDEX IF NOT EXISTS idx_journey_phase_journey ON "JourneyPhase"(journeyId);
CREATE INDEX IF NOT EXISTS idx_journey_phase_number ON "JourneyPhase"(journeyId, phaseNumber);
CREATE INDEX IF NOT EXISTS idx_checklist_phase_status ON "JourneyChecklist"(phaseId, status);
CREATE INDEX IF NOT EXISTS idx_media_requirement_phase ON "JourneyMediaRequirement"(phaseId);

-- Journey Phase Templates
CREATE TABLE IF NOT EXISTS "JourneyPhaseTemplate" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    phaseNumber INTEGER NOT NULL UNIQUE,
    phaseName TEXT NOT NULL,
    description TEXT,
    responsibleRoles TEXT[] NOT NULL,
    checklistItems JSONB NOT NULL,
    mediaRequirements JSONB NOT NULL,
    estimatedDuration INTEGER, -- in minutes
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Insert default phase templates
INSERT INTO "JourneyPhaseTemplate" (phaseNumber, phaseName, description, responsibleRoles, checklistItems, mediaRequirements, estimatedDuration) VALUES
(1, 'JOURNEY_CREATION', 'Journey creation and crew assignment', ARRAY['DISPATCHER'], 
 '[
   {"id": "create_001", "title": "Create journey record", "required": true, "mediaRequired": false},
   {"id": "create_002", "title": "Assign driver and mover", "required": true, "mediaRequired": false},
   {"id": "create_003", "title": "Set journey schedule", "required": true, "mediaRequired": false},
   {"id": "create_004", "title": "Review customer requirements", "required": true, "mediaRequired": false}
 ]', 
 '[]', 
 30),

(2, 'MORNING_PREP', 'Morning preparation and equipment check', ARRAY['DRIVER', 'MOVER'], 
 '[
   {"id": "prep_001", "title": "Vehicle inspection", "required": true, "mediaRequired": true},
   {"id": "prep_002", "title": "Equipment check", "required": true, "mediaRequired": true},
   {"id": "prep_003", "title": "Route review", "required": true, "mediaRequired": false},
   {"id": "prep_004", "title": "Customer contact verification", "required": true, "mediaRequired": false},
   {"id": "prep_005", "title": "Safety equipment preparation", "required": true, "mediaRequired": false}
 ]', 
 '[
   {"mediaType": "PHOTO", "title": "Vehicle inspection photos", "required": true},
   {"mediaType": "PHOTO", "title": "Equipment checklist photos", "required": true},
   {"mediaType": "PHOTO", "title": "Route confirmation screenshot", "required": false}
 ]', 
 45),

(3, 'PICKUP_OPERATIONS', 'Pickup location operations and loading', ARRAY['DRIVER', 'MOVER'], 
 '[
   {"id": "pickup_001", "title": "Arrive at pickup location", "required": true, "mediaRequired": true},
   {"id": "pickup_002", "title": "Customer verification and greeting", "required": true, "mediaRequired": false},
   {"id": "pickup_003", "title": "Pre-move walkthrough and assessment", "required": true, "mediaRequired": true},
   {"id": "pickup_004", "title": "Loading operations with safety protocols", "required": true, "mediaRequired": true},
   {"id": "pickup_005", "title": "Customer signature on pickup documentation", "required": true, "mediaRequired": true}
 ]', 
 '[
   {"mediaType": "PHOTO", "title": "Arrival photo with location verification", "required": true},
   {"mediaType": "PHOTO", "title": "Pre-move condition photos of all items", "required": true},
   {"mediaType": "VIDEO", "title": "Loading process videos", "required": false},
   {"mediaType": "SIGNATURE", "title": "Customer signature", "required": true},
   {"mediaType": "PHOTO", "title": "Final pickup location photo", "required": true}
 ]', 
 120),

(4, 'TRANSPORT_OPERATIONS', 'Transport operations and GPS tracking', ARRAY['DRIVER'], 
 '[
   {"id": "transport_001", "title": "Safe driving with GPS tracking", "required": true, "mediaRequired": false},
   {"id": "transport_002", "title": "Route adherence monitoring", "required": true, "mediaRequired": false},
   {"id": "transport_003", "title": "Real-time location updates", "required": true, "mediaRequired": false},
   {"id": "transport_004", "title": "Communication with dispatcher and customer", "required": true, "mediaRequired": false}
 ]', 
 '[
   {"mediaType": "GPS", "title": "GPS tracking data", "required": true},
   {"mediaType": "PHOTO", "title": "Route progress photos", "required": false}
 ]', 
 180),

(5, 'DELIVERY_OPERATIONS', 'Delivery location operations and unloading', ARRAY['DRIVER', 'MOVER'], 
 '[
   {"id": "delivery_001", "title": "Arrive at delivery location", "required": true, "mediaRequired": true},
   {"id": "delivery_002", "title": "Customer verification and greeting", "required": true, "mediaRequired": false},
   {"id": "delivery_003", "title": "Unloading operations with care", "required": true, "mediaRequired": true},
   {"id": "delivery_004", "title": "Post-move inspection and verification", "required": true, "mediaRequired": true},
   {"id": "delivery_005", "title": "Customer signature on delivery documentation", "required": true, "mediaRequired": true}
 ]', 
 '[
   {"mediaType": "PHOTO", "title": "Arrival photo with location verification", "required": true},
   {"mediaType": "VIDEO", "title": "Unloading process videos", "required": false},
   {"mediaType": "PHOTO", "title": "Post-move condition photos", "required": true},
   {"mediaType": "SIGNATURE", "title": "Customer signature", "required": true},
   {"mediaType": "PHOTO", "title": "Final delivery location photo", "required": true}
 ]', 
 120),

(6, 'JOURNEY_COMPLETION', 'Journey completion and return to base', ARRAY['DRIVER', 'MOVER'], 
 '[
   {"id": "completion_001", "title": "Return to base location", "required": true, "mediaRequired": true},
   {"id": "completion_002", "title": "Vehicle and equipment cleanup", "required": true, "mediaRequired": true},
   {"id": "completion_003", "title": "Final journey documentation", "required": true, "mediaRequired": false},
   {"id": "completion_004", "title": "Handover to dispatcher", "required": true, "mediaRequired": false}
 ]', 
 '[
   {"mediaType": "PHOTO", "title": "Return to base photo", "required": true},
   {"mediaType": "PHOTO", "title": "Equipment condition photos", "required": true},
   {"mediaType": "DOCUMENT", "title": "Final journey summary", "required": true}
 ]', 
 60)
ON CONFLICT (phaseNumber) DO NOTHING;

-- Journey Progress Tracking View
CREATE OR REPLACE VIEW "JourneyProgressView" AS
SELECT 
    j.id as journey_id,
    j.status as journey_status,
    j.currentPhase,
    j.progress,
    j.checklistCompletion,
    j.mediaCompletion,
    COUNT(jp.id) as total_phases,
    COUNT(CASE WHEN jp.status = 'COMPLETED' THEN 1 END) as completed_phases,
    COUNT(CASE WHEN jp.status = 'IN_PROGRESS' THEN 1 END) as active_phases,
    COUNT(CASE WHEN jp.status = 'PENDING' THEN 1 END) as pending_phases,
    MAX(jp.updatedAt) as last_phase_update
FROM "TruckJourney" j
LEFT JOIN "JourneyPhase" jp ON j.id = jp.journeyId
GROUP BY j.id, j.status, j.currentPhase, j.progress, j.checklistCompletion, j.mediaCompletion;

-- Journey Checklist Progress View
CREATE OR REPLACE VIEW "JourneyChecklistProgressView" AS
SELECT 
    j.id as journey_id,
    jp.phaseNumber,
    jp.phaseName,
    COUNT(jc.id) as total_checklist_items,
    COUNT(CASE WHEN jc.status = 'COMPLETED' THEN 1 END) as completed_items,
    COUNT(CASE WHEN jc.status = 'PENDING' THEN 1 END) as pending_items,
    ROUND(
        (COUNT(CASE WHEN jc.status = 'COMPLETED' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(jc.id), 0)::DECIMAL) * 100, 2
    ) as completion_percentage
FROM "TruckJourney" j
JOIN "JourneyPhase" jp ON j.id = jp.journeyId
LEFT JOIN "JourneyChecklist" jc ON jp.id = jc.phaseId
GROUP BY j.id, jp.phaseNumber, jp.phaseName;

-- Journey Media Progress View
CREATE OR REPLACE VIEW "JourneyMediaProgressView" AS
SELECT 
    j.id as journey_id,
    jp.phaseNumber,
    jp.phaseName,
    COUNT(jmr.id) as total_media_requirements,
    COUNT(m.id) as completed_media,
    COUNT(CASE WHEN m.id IS NULL AND jmr.required = true THEN 1 END) as missing_required_media,
    ROUND(
        (COUNT(m.id)::DECIMAL / 
         NULLIF(COUNT(jmr.id), 0)::DECIMAL) * 100, 2
    ) as completion_percentage
FROM "TruckJourney" j
JOIN "JourneyPhase" jp ON j.id = jp.journeyId
LEFT JOIN "JourneyMediaRequirement" jmr ON jp.id = jmr.phaseId
LEFT JOIN "Media" m ON j.id = m.journeyId AND jmr.mediaType = m.mediaType
GROUP BY j.id, jp.phaseNumber, jp.phaseName;

-- Audit functions for journey workflow
CREATE OR REPLACE FUNCTION audit_journey_phase_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "AuditEntry" (
        id, clientId, locationId, userId, action, tableName, recordId, 
        oldValues, newValues, ipAddress, userAgent, createdAt
    ) VALUES (
        gen_random_uuid(),
        COALESCE(NEW.clientId, OLD.clientId),
        COALESCE(NEW.locationId, OLD.locationId),
        COALESCE(NEW.userId, OLD.userId),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'CREATE'
            WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
            WHEN TG_OP = 'DELETE' THEN 'DELETE'
        END,
        'JourneyPhase',
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr(),
        current_setting('application_name'),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER trigger_audit_journey_phase_changes
    AFTER INSERT OR UPDATE OR DELETE ON "JourneyPhase"
    FOR EACH ROW EXECUTE FUNCTION audit_journey_phase_changes();

CREATE TRIGGER trigger_audit_journey_checklist_changes
    AFTER INSERT OR UPDATE OR DELETE ON "JourneyChecklist"
    FOR EACH ROW EXECUTE FUNCTION audit_journey_phase_changes();

-- Sample data for testing
INSERT INTO "JourneyPhaseTemplate" (phaseNumber, phaseName, description, responsibleRoles, checklistItems, mediaRequirements, estimatedDuration) VALUES
(7, 'TEST_PHASE', 'Test phase for development', ARRAY['TESTER'], 
 '[
   {"id": "test_001", "title": "Test checklist item", "required": true, "mediaRequired": false}
 ]', 
 '[
   {"mediaType": "PHOTO", "title": "Test photo", "required": false}
 ]', 
 30)
ON CONFLICT (phaseNumber) DO NOTHING; 