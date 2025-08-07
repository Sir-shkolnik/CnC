-- C&C CRM Unified Database Schema
-- Complete schema including original operations + new CRM functionality
-- Phase 1: Customer Management + Phase 2: Sales Pipeline

-- ===== ORIGINAL ENUMS =====
CREATE TYPE IF NOT EXISTS "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'MOVER', 'MANAGER', 'AUDITOR');
CREATE TYPE IF NOT EXISTS "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE IF NOT EXISTS "JourneyStage" AS ENUM ('MORNING_PREP', 'EN_ROUTE', 'ONSITE', 'COMPLETED', 'AUDITED');
CREATE TYPE IF NOT EXISTS "EntryType" AS ENUM ('PHOTO', 'NOTE', 'GPS', 'SIGNATURE', 'CONFIRMATION');
CREATE TYPE IF NOT EXISTS "MediaType" AS ENUM ('PHOTO', 'VIDEO', 'SIGNATURE');
CREATE TYPE IF NOT EXISTS "TagType" AS ENUM ('DAMAGE', 'COMPLETED', 'FEEDBACK', 'ERROR', 'ISSUE');

-- ===== NEW CRM ENUMS =====
CREATE TYPE IF NOT EXISTS lead_status AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'WON',
    'LOST',
    'ARCHIVED'
);

CREATE TYPE IF NOT EXISTS lead_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

CREATE TYPE IF NOT EXISTS sales_activity_type AS ENUM (
    'PHONE_CALL',
    'EMAIL',
    'MEETING',
    'PROPOSAL_SENT',
    'FOLLOW_UP',
    'DEMO',
    'SITE_VISIT',
    'OTHER'
);

CREATE TYPE IF NOT EXISTS quote_status AS ENUM (
    'DRAFT',
    'SENT',
    'VIEWED',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED',
    'CONVERTED'
);

CREATE TYPE IF NOT EXISTS quote_item_category AS ENUM (
    'MOVING_SERVICES',
    'STORAGE_SERVICES',
    'PACKING_SERVICES',
    'SPECIALTY_SERVICES',
    'EQUIPMENT_RENTAL',
    'INSURANCE',
    'OTHER'
);

-- ===== ORIGINAL TABLES =====

-- Create Client table
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "isFranchise" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- Create Location table
CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "locationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create TruckJourney table
CREATE TABLE IF NOT EXISTS "TruckJourney" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "JourneyStage" NOT NULL DEFAULT 'MORNING_PREP',
    "truckNumber" TEXT,
    "moveSourceId" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TruckJourney_pkey" PRIMARY KEY ("id")
);

-- Create AssignedCrew table
CREATE TABLE IF NOT EXISTS "AssignedCrew" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedCrew_pkey" PRIMARY KEY ("id")
);

-- Create JourneyEntry table
CREATE TABLE IF NOT EXISTS "JourneyEntry" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "type" "EntryType" NOT NULL,
    "data" JSONB NOT NULL,
    "tag" "TagType",
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyEntry_pkey" PRIMARY KEY ("id")
);

-- Create Media table
CREATE TABLE IF NOT EXISTS "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "journeyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- Create AuditEntry table
CREATE TABLE IF NOT EXISTS "AuditEntry" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" INET,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- Create MoveSource table
CREATE TABLE IF NOT EXISTS "MoveSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoveSource_pkey" PRIMARY KEY ("id")
);

-- ===== NEW CRM TABLES - PHASE 1: CUSTOMER MANAGEMENT =====

-- Customer Management Model
CREATE TABLE IF NOT EXISTS "Customer" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    clientId TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address JSONB NOT NULL,
    leadSource TEXT,
    leadStatus TEXT NOT NULL DEFAULT 'NEW',
    assignedTo TEXT,
    estimatedValue DECIMAL(10,2),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    preferences JSONB,
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    createdBy TEXT,
    updatedBy TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_customer_client FOREIGN KEY (clientId) REFERENCES "Client"(id) ON DELETE RESTRICT,
    CONSTRAINT fk_customer_assigned_user FOREIGN KEY (assignedTo) REFERENCES "User"(id) ON DELETE SET NULL,
    
    -- Unique constraints
    CONSTRAINT unique_customer_email_client UNIQUE (email, clientId),
    CONSTRAINT unique_customer_phone_client UNIQUE (phone, clientId)
);

-- Lead Management Model
CREATE TABLE IF NOT EXISTS "Lead" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    customerId TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    estimatedMoveDate TIMESTAMP,
    estimatedValue DECIMAL(10,2),
    notes TEXT,
    followUpDate TIMESTAMP,
    lastContact TIMESTAMP,
    contactHistory JSONB,
    score INTEGER NOT NULL DEFAULT 0,
    qualificationCriteria JSONB,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    createdBy TEXT,
    updatedBy TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_lead_customer FOREIGN KEY (customerId) REFERENCES "Customer"(id) ON DELETE CASCADE
);

-- Sales Activity Model
CREATE TABLE IF NOT EXISTS "SalesActivity" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    leadId TEXT,
    customerId TEXT,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT,
    description TEXT NOT NULL,
    outcome TEXT,
    nextAction TEXT,
    scheduledDate TIMESTAMP,
    completedDate TIMESTAMP,
    duration INTEGER,
    cost DECIMAL(10,2),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_sales_activity_lead FOREIGN KEY (leadId) REFERENCES "Lead"(id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_activity_customer FOREIGN KEY (customerId) REFERENCES "Customer"(id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_activity_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE RESTRICT
);

-- ===== NEW CRM TABLES - PHASE 2: SALES PIPELINE =====

-- Quote Management Model
CREATE TABLE IF NOT EXISTS "Quote" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    customerId TEXT NOT NULL,
    clientId TEXT NOT NULL,
    locationId TEXT NOT NULL,
    createdBy TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    totalAmount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CAD',
    validUntil TIMESTAMP NOT NULL,
    terms TEXT,
    notes TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    isTemplate BOOLEAN NOT NULL DEFAULT false,
    templateName TEXT,
    approvedBy TEXT,
    approvedAt TIMESTAMP,
    rejectionReason TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_quote_customer FOREIGN KEY (customerId) REFERENCES "Customer"(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_client FOREIGN KEY (clientId) REFERENCES "Client"(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_location FOREIGN KEY (locationId) REFERENCES "Location"(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_created_user FOREIGN KEY (createdBy) REFERENCES "User"(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quote_approved_user FOREIGN KEY (approvedBy) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Quote Item Model
CREATE TABLE IF NOT EXISTS "QuoteItem" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    quoteId TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice DECIMAL(10,2) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    notes TEXT,
    isOptional BOOLEAN NOT NULL DEFAULT false,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_quote_item_quote FOREIGN KEY (quoteId) REFERENCES "Quote"(id) ON DELETE CASCADE
);

-- ===== RELATIONSHIP UPDATES =====

-- Add quoteId to TruckJourney for converted quotes
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS quoteId TEXT;
ALTER TABLE "TruckJourney" ADD CONSTRAINT fk_journey_quote 
    FOREIGN KEY (quoteId) REFERENCES "Quote"(id) ON DELETE SET NULL;

-- ===== INDEXES FOR PERFORMANCE =====

-- Original indexes
CREATE INDEX IF NOT EXISTS "idx_User_clientId" ON "User"("clientId");
CREATE INDEX IF NOT EXISTS "idx_User_locationId" ON "User"("locationId");
CREATE INDEX IF NOT EXISTS "idx_User_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_TruckJourney_clientId" ON "TruckJourney"("clientId");
CREATE INDEX IF NOT EXISTS "idx_TruckJourney_locationId" ON "TruckJourney"("locationId");
CREATE INDEX IF NOT EXISTS "idx_TruckJourney_date" ON "TruckJourney"("date");
CREATE INDEX IF NOT EXISTS "idx_TruckJourney_status" ON "TruckJourney"("status");
CREATE INDEX IF NOT EXISTS "idx_AssignedCrew_journeyId" ON "AssignedCrew"("journeyId");
CREATE INDEX IF NOT EXISTS "idx_AssignedCrew_userId" ON "AssignedCrew"("userId");
CREATE INDEX IF NOT EXISTS "idx_JourneyEntry_journeyId" ON "JourneyEntry"("journeyId");
CREATE INDEX IF NOT EXISTS "idx_JourneyEntry_createdBy" ON "JourneyEntry"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_JourneyEntry_timestamp" ON "JourneyEntry"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_Media_journeyId" ON "Media"("journeyId");
CREATE INDEX IF NOT EXISTS "idx_Media_createdBy" ON "Media"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_AuditEntry_clientId" ON "AuditEntry"("clientId");
CREATE INDEX IF NOT EXISTS "idx_AuditEntry_locationId" ON "AuditEntry"("locationId");
CREATE INDEX IF NOT EXISTS "idx_AuditEntry_userId" ON "AuditEntry"("userId");
CREATE INDEX IF NOT EXISTS "idx_AuditEntry_entityType_entityId" ON "AuditEntry"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "idx_AuditEntry_createdAt" ON "AuditEntry"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_MoveSource_clientId" ON "MoveSource"("clientId");
CREATE INDEX IF NOT EXISTS "idx_MoveSource_locationId" ON "MoveSource"("locationId");

-- Customer Management indexes
CREATE INDEX IF NOT EXISTS idx_customer_client_lead_status ON "Customer"(clientId, leadStatus);
CREATE INDEX IF NOT EXISTS idx_customer_client_active ON "Customer"(clientId, isActive);
CREATE INDEX IF NOT EXISTS idx_customer_email_client ON "Customer"(email, clientId);
CREATE INDEX IF NOT EXISTS idx_customer_assigned_lead_status ON "Customer"(assignedTo, leadStatus);
CREATE INDEX IF NOT EXISTS idx_customer_created_at ON "Customer"(createdAt);

CREATE INDEX IF NOT EXISTS idx_lead_customer_status ON "Lead"(customerId, status);
CREATE INDEX IF NOT EXISTS idx_lead_status_priority ON "Lead"(status, priority);
CREATE INDEX IF NOT EXISTS idx_lead_follow_up_date ON "Lead"(followUpDate);
CREATE INDEX IF NOT EXISTS idx_lead_estimated_move_date ON "Lead"(estimatedMoveDate);
CREATE INDEX IF NOT EXISTS idx_lead_score ON "Lead"(score);

CREATE INDEX IF NOT EXISTS idx_sales_activity_lead_type ON "SalesActivity"(leadId, type);
CREATE INDEX IF NOT EXISTS idx_sales_activity_customer_type ON "SalesActivity"(customerId, type);
CREATE INDEX IF NOT EXISTS idx_sales_activity_user_scheduled ON "SalesActivity"(userId, scheduledDate);
CREATE INDEX IF NOT EXISTS idx_sales_activity_scheduled_completed ON "SalesActivity"(scheduledDate, completedDate);

-- Sales Pipeline indexes
CREATE INDEX IF NOT EXISTS idx_quote_customer_status ON "Quote"(customerId, status);
CREATE INDEX IF NOT EXISTS idx_quote_client_status ON "Quote"(clientId, status);
CREATE INDEX IF NOT EXISTS idx_quote_valid_until ON "Quote"(validUntil);
CREATE INDEX IF NOT EXISTS idx_quote_created_by_status ON "Quote"(createdBy, status);
CREATE INDEX IF NOT EXISTS idx_quote_approved_by ON "Quote"(approvedBy);
CREATE INDEX IF NOT EXISTS idx_quote_template ON "Quote"(isTemplate, templateName);

CREATE INDEX IF NOT EXISTS idx_quote_item_quote_category ON "QuoteItem"(quoteId, category);
CREATE INDEX IF NOT EXISTS idx_quote_item_category_subcategory ON "QuoteItem"(category, subcategory);

-- Journey quote relationship index
CREATE INDEX IF NOT EXISTS idx_journey_quote ON "TruckJourney"(quoteId);

-- ===== AUDIT TRAIL FUNCTIONS =====

-- Customer audit function
CREATE OR REPLACE FUNCTION audit_customer_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO "AuditEntry" (
            id, clientId, locationId, userId, action, entityType, entityId, 
            oldValues, newValues, ipAddress, userAgent, createdAt
        ) VALUES (
            gen_random_uuid(), NEW.clientId, 
            (SELECT locationId FROM "User" WHERE id = NEW.createdBy LIMIT 1),
            NEW.createdBy, 'CREATE', 'Customer', NEW.id, 
            '{}', to_jsonb(NEW), 
            (SELECT inet_client_addr()), 
            (SELECT current_setting('application_name', true)), 
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO "AuditEntry" (
            id, clientId, locationId, userId, action, entityType, entityId, 
            oldValues, newValues, ipAddress, userAgent, createdAt
        ) VALUES (
            gen_random_uuid(), NEW.clientId, 
            (SELECT locationId FROM "User" WHERE id = NEW.updatedBy LIMIT 1),
            NEW.updatedBy, 'UPDATE', 'Customer', NEW.id, 
            to_jsonb(OLD), to_jsonb(NEW), 
            (SELECT inet_client_addr()), 
            (SELECT current_setting('application_name', true)), 
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO "AuditEntry" (
            id, clientId, locationId, userId, action, entityType, entityId, 
            oldValues, newValues, ipAddress, userAgent, createdAt
        ) VALUES (
            gen_random_uuid(), OLD.clientId, 
            (SELECT locationId FROM "User" WHERE id = OLD.updatedBy LIMIT 1),
            OLD.updatedBy, 'DELETE', 'Customer', OLD.id, 
            to_jsonb(OLD), '{}', 
            (SELECT inet_client_addr()), 
            (SELECT current_setting('application_name', true)), 
            NOW()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Quote audit function
CREATE OR REPLACE FUNCTION audit_quote_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO "AuditEntry" (
            id, clientId, locationId, userId, action, entityType, entityId, 
            oldValues, newValues, ipAddress, userAgent, createdAt
        ) VALUES (
            gen_random_uuid(), NEW.clientId, NEW.locationId,
            NEW.createdBy, 'CREATE', 'Quote', NEW.id, 
            '{}', to_jsonb(NEW), 
            (SELECT inet_client_addr()), 
            (SELECT current_setting('application_name', true)), 
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO "AuditEntry" (
            id, clientId, locationId, userId, action, entityType, entityId, 
            oldValues, newValues, ipAddress, userAgent, createdAt
        ) VALUES (
            gen_random_uuid(), NEW.clientId, NEW.locationId,
            NEW.createdBy, 'UPDATE', 'Quote', NEW.id, 
            to_jsonb(OLD), to_jsonb(NEW), 
            (SELECT inet_client_addr()), 
            (SELECT current_setting('application_name', true)), 
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO "AuditEntry" (
            id, clientId, locationId, userId, action, entityType, entityId, 
            oldValues, newValues, ipAddress, userAgent, createdAt
        ) VALUES (
            gen_random_uuid(), OLD.clientId, OLD.locationId,
            OLD.createdBy, 'DELETE', 'Quote', OLD.id, 
            to_jsonb(OLD), '{}', 
            (SELECT inet_client_addr()), 
            (SELECT current_setting('application_name', true)), 
            NOW()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===== AUDIT TRIGGERS =====

-- Customer audit triggers
CREATE TRIGGER trigger_audit_customer_changes
    AFTER INSERT OR UPDATE OR DELETE ON "Customer"
    FOR EACH ROW EXECUTE FUNCTION audit_customer_changes();

CREATE TRIGGER trigger_audit_lead_changes
    AFTER INSERT OR UPDATE OR DELETE ON "Lead"
    FOR EACH ROW EXECUTE FUNCTION audit_customer_changes();

CREATE TRIGGER trigger_audit_sales_activity_changes
    AFTER INSERT OR UPDATE OR DELETE ON "SalesActivity"
    FOR EACH ROW EXECUTE FUNCTION audit_customer_changes();

-- Quote audit triggers
CREATE TRIGGER trigger_audit_quote_changes
    AFTER INSERT OR UPDATE OR DELETE ON "Quote"
    FOR EACH ROW EXECUTE FUNCTION audit_quote_changes();

CREATE TRIGGER trigger_audit_quote_item_changes
    AFTER INSERT OR UPDATE OR DELETE ON "QuoteItem"
    FOR EACH ROW EXECUTE FUNCTION audit_quote_changes();

-- ===== SAMPLE DATA INSERTION =====

-- Insert sample client if not exists
INSERT INTO "Client" (id, name, industry, isFranchise, settings, createdAt, updatedAt)
VALUES (
    'clm_f55e13de_a5c4_4990_ad02_34bb07187daa',
    'LGM (Let''s Get Moving)',
    'Moving & Logistics',
    true,
    '{"timezone": "America/Toronto", "currency": "CAD"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample location if not exists
INSERT INTO "Location" (id, clientId, name, timezone, address, createdAt, updatedAt)
VALUES (
    'loc_burnaby_main',
    'clm_f55e13de_a5c4_4990_ad02_34bb07187daa',
    'BURNABY',
    'America/Vancouver',
    'Burnaby, BC, Canada',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample user if not exists
INSERT INTO "User" (id, name, email, role, locationId, clientId, status, createdAt, updatedAt)
VALUES (
    'usr_sample_admin',
    'Sample Admin',
    'admin@lgm.com',
    'ADMIN',
    'loc_burnaby_main',
    'clm_f55e13de_a5c4_4990_ad02_34bb07187daa',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING; 