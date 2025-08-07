-- Sales Pipeline Schema for C&C CRM
-- Phase 2: Sales Pipeline & Quoting System

-- Quote Management Models
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_customer_status ON "Quote"(customerId, status);
CREATE INDEX IF NOT EXISTS idx_quote_client_status ON "Quote"(clientId, status);
CREATE INDEX IF NOT EXISTS idx_quote_valid_until ON "Quote"(validUntil);
CREATE INDEX IF NOT EXISTS idx_quote_created_by_status ON "Quote"(createdBy, status);
CREATE INDEX IF NOT EXISTS idx_quote_approved_by ON "Quote"(approvedBy);
CREATE INDEX IF NOT EXISTS idx_quote_template ON "Quote"(isTemplate, templateName);

CREATE INDEX IF NOT EXISTS idx_quote_item_quote_category ON "QuoteItem"(quoteId, category);
CREATE INDEX IF NOT EXISTS idx_quote_item_category_subcategory ON "QuoteItem"(category, subcategory);

-- Create enums
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

-- Add audit trail triggers
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

-- Create triggers
CREATE TRIGGER trigger_audit_quote_changes
    AFTER INSERT OR UPDATE OR DELETE ON "Quote"
    FOR EACH ROW EXECUTE FUNCTION audit_quote_changes();

CREATE TRIGGER trigger_audit_quote_item_changes
    AFTER INSERT OR UPDATE OR DELETE ON "QuoteItem"
    FOR EACH ROW EXECUTE FUNCTION audit_quote_changes();

-- Add relationship to TruckJourney for converted quotes
ALTER TABLE "TruckJourney" ADD COLUMN IF NOT EXISTS quoteId TEXT;
ALTER TABLE "TruckJourney" ADD CONSTRAINT fk_journey_quote 
    FOREIGN KEY (quoteId) REFERENCES "Quote"(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_journey_quote ON "TruckJourney"(quoteId); 