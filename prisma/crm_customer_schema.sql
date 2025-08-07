-- Customer Management Schema for C&C CRM
-- Phase 1: Customer & Sales Management

-- Customer Management Models
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

-- Create indexes for performance
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

-- Create enums
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

-- Add audit trail triggers
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

-- Create triggers
CREATE TRIGGER trigger_audit_customer_changes
    AFTER INSERT OR UPDATE OR DELETE ON "Customer"
    FOR EACH ROW EXECUTE FUNCTION audit_customer_changes();

CREATE TRIGGER trigger_audit_lead_changes
    AFTER INSERT OR UPDATE OR DELETE ON "Lead"
    FOR EACH ROW EXECUTE FUNCTION audit_customer_changes();

CREATE TRIGGER trigger_audit_sales_activity_changes
    AFTER INSERT OR UPDATE OR DELETE ON "SalesActivity"
    FOR EACH ROW EXECUTE FUNCTION audit_customer_changes(); 