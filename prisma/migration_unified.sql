-- C&C CRM Unified Database Migration
-- Comprehensive migration that aligns with application design, colors, and functionality
-- Version: 3.0.0 - Production Ready

-- ===== STEP 1: CREATE NEW ENUMS =====

-- Add new enum values to existing enums
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "JourneyStage" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Create new enums
DO $$ BEGIN
    CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "JourneyPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EntryPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrewStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'ON_SITE', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StorageType" AS ENUM ('NO_STORAGE', 'LOCKER', 'POD', 'WAREHOUSE', 'CONTAINER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StorageUnitType" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'XLARGE', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StorageUnitStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'OUT_OF_SERVICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BillingPlanType" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BillingPlanStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MoveSourceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuditSeverity" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===== STEP 2: ENHANCE EXISTING TABLES =====

-- Enhance User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "avatar" TEXT,
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "preferences" JSONB,
ADD COLUMN IF NOT EXISTS "apiKey" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Enhance Client table
ALTER TABLE "Client"
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "logo" TEXT,
ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'America/Toronto',
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'CAD',
ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS "features" JSONB,
ADD COLUMN IF NOT EXISTS "limits" JSONB,
ADD COLUMN IF NOT EXISTS "status" "ClientStatus" DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Enhance Location table
ALTER TABLE "Location"
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "province" TEXT,
ADD COLUMN IF NOT EXISTS "postalCode" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Canada',
ADD COLUMN IF NOT EXISTS "contactName" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "businessHours" JSONB,
ADD COLUMN IF NOT EXISTS "services" JSONB,
ADD COLUMN IF NOT EXISTS "storageType" "StorageType" DEFAULT 'NO_STORAGE',
ADD COLUMN IF NOT EXISTS "storageCapacity" INTEGER,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "isCorporate" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "maxTrucks" INTEGER,
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Enhance TruckJourney table
ALTER TABLE "TruckJourney"
ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "actualDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "priority" "JourneyPriority" DEFAULT 'NORMAL',
ADD COLUMN IF NOT EXISTS "tags" TEXT[],
ADD COLUMN IF NOT EXISTS "estimatedCost" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "actualCost" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "billingStatus" "BillingStatus" DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "startLocation" JSONB,
ADD COLUMN IF NOT EXISTS "endLocation" JSONB,
ADD COLUMN IF NOT EXISTS "routeData" JSONB,
ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Enhance JourneyStep table
ALTER TABLE "JourneyStep"
ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "actualDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "checklist" JSONB,
ADD COLUMN IF NOT EXISTS "location" JSONB;

-- Enhance StepActivity table
ALTER TABLE "StepActivity"
ADD COLUMN IF NOT EXISTS "status" "ActivityStatus" DEFAULT 'COMPLETED',
ADD COLUMN IF NOT EXISTS "duration" INTEGER,
ADD COLUMN IF NOT EXISTS "location" JSONB,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Enhance AssignedCrew table
ALTER TABLE "AssignedCrew"
ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "status" "CrewStatus" DEFAULT 'ASSIGNED',
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3);

-- Enhance JourneyEntry table
ALTER TABLE "JourneyEntry"
ADD COLUMN IF NOT EXISTS "priority" "EntryPriority" DEFAULT 'NORMAL',
ADD COLUMN IF NOT EXISTS "location" JSONB,
ADD COLUMN IF NOT EXISTS "duration" INTEGER,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Enhance Media table
ALTER TABLE "Media"
ADD COLUMN IF NOT EXISTS "mimeType" TEXT,
ADD COLUMN IF NOT EXISTS "width" INTEGER,
ADD COLUMN IF NOT EXISTS "height" INTEGER,
ADD COLUMN IF NOT EXISTS "duration" INTEGER,
ADD COLUMN IF NOT EXISTS "thumbnail" TEXT,
ADD COLUMN IF NOT EXISTS "tags" TEXT[],
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Enhance AuditEntry table
ALTER TABLE "AuditEntry"
ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
ADD COLUMN IF NOT EXISTS "sessionId" TEXT,
ADD COLUMN IF NOT EXISTS "severity" "AuditSeverity" DEFAULT 'INFO';

-- Enhance MoveSource table
ALTER TABLE "MoveSource"
ADD COLUMN IF NOT EXISTS "externalId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'CAD',
ADD COLUMN IF NOT EXISTS "status" "MoveSourceStatus" DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- ===== STEP 3: CREATE NEW TABLES =====

-- Create StorageUnit table
CREATE TABLE IF NOT EXISTS "StorageUnit" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "unitType" "StorageUnitType" NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "StorageUnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "monthlyRate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "features" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "StorageUnit_pkey" PRIMARY KEY ("id")
);

-- Create StorageBooking table
CREATE TABLE IF NOT EXISTS "StorageBooking" (
    "id" TEXT NOT NULL,
    "storageUnitId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalCost" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "StorageBooking_pkey" PRIMARY KEY ("id")
);

-- Create BillingPlan table
CREATE TABLE IF NOT EXISTS "BillingPlan" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "planType" "BillingPlanType" NOT NULL,
    "monthlyRate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "features" JSONB,
    "limits" JSONB,
    "status" "BillingPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "BillingPlan_pkey" PRIMARY KEY ("id")
);

-- ===== STEP 4: ADD FOREIGN KEY CONSTRAINTS =====

-- StorageUnit foreign keys
ALTER TABLE "StorageUnit" ADD CONSTRAINT "StorageUnit_locationId_fkey" 
    FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StorageUnit" ADD CONSTRAINT "StorageUnit_clientId_fkey" 
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- StorageBooking foreign keys
ALTER TABLE "StorageBooking" ADD CONSTRAINT "StorageBooking_storageUnitId_fkey" 
    FOREIGN KEY ("storageUnitId") REFERENCES "StorageUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StorageBooking" ADD CONSTRAINT "StorageBooking_journeyId_fkey" 
    FOREIGN KEY ("journeyId") REFERENCES "TruckJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StorageBooking" ADD CONSTRAINT "StorageBooking_clientId_fkey" 
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- BillingPlan foreign key
ALTER TABLE "BillingPlan" ADD CONSTRAINT "BillingPlan_clientId_fkey" 
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===== STEP 5: CREATE ENHANCED INDEXES =====

-- User indexes
CREATE INDEX IF NOT EXISTS "User_clientId_locationId_status_idx" ON "User"("clientId", "locationId", "status");
CREATE INDEX IF NOT EXISTS "User_email_status_idx" ON "User"("email", "status");
CREATE INDEX IF NOT EXISTS "User_role_status_idx" ON "User"("role", "status");
CREATE INDEX IF NOT EXISTS "User_lastLogin_idx" ON "User"("lastLogin");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- Client indexes
CREATE INDEX IF NOT EXISTS "Client_name_status_idx" ON "Client"("name", "status");
CREATE INDEX IF NOT EXISTS "Client_isFranchise_status_idx" ON "Client"("isFranchise", "status");
CREATE INDEX IF NOT EXISTS "Client_createdAt_idx" ON "Client"("createdAt");

-- Location indexes
CREATE INDEX IF NOT EXISTS "Location_clientId_isActive_idx" ON "Location"("clientId", "isActive");
CREATE INDEX IF NOT EXISTS "Location_storageType_isActive_idx" ON "Location"("storageType", "isActive");
CREATE INDEX IF NOT EXISTS "Location_isCorporate_isActive_idx" ON "Location"("isCorporate", "isActive");
CREATE INDEX IF NOT EXISTS "Location_city_province_idx" ON "Location"("city", "province");

-- TruckJourney indexes
CREATE INDEX IF NOT EXISTS "TruckJourney_clientId_locationId_status_idx" ON "TruckJourney"("clientId", "locationId", "status");
CREATE INDEX IF NOT EXISTS "TruckJourney_status_date_idx" ON "TruckJourney"("status", "date");
CREATE INDEX IF NOT EXISTS "TruckJourney_date_status_idx" ON "TruckJourney"("date", "status");
CREATE INDEX IF NOT EXISTS "TruckJourney_priority_status_idx" ON "TruckJourney"("priority", "status");
CREATE INDEX IF NOT EXISTS "TruckJourney_billingStatus_idx" ON "TruckJourney"("billingStatus");
CREATE INDEX IF NOT EXISTS "TruckJourney_createdAt_idx" ON "TruckJourney"("createdAt");
CREATE INDEX IF NOT EXISTS "TruckJourney_startTime_endTime_idx" ON "TruckJourney"("startTime", "endTime");

-- StorageUnit indexes
CREATE INDEX IF NOT EXISTS "StorageUnit_locationId_status_idx" ON "StorageUnit"("locationId", "status");
CREATE INDEX IF NOT EXISTS "StorageUnit_clientId_unitType_idx" ON "StorageUnit"("clientId", "unitType");
CREATE INDEX IF NOT EXISTS "StorageUnit_status_monthlyRate_idx" ON "StorageUnit"("status", "monthlyRate");

-- StorageBooking indexes
CREATE INDEX IF NOT EXISTS "StorageBooking_storageUnitId_status_idx" ON "StorageBooking"("storageUnitId", "status");
CREATE INDEX IF NOT EXISTS "StorageBooking_journeyId_idx" ON "StorageBooking"("journeyId");
CREATE INDEX IF NOT EXISTS "StorageBooking_startDate_endDate_idx" ON "StorageBooking"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "StorageBooking_status_startDate_idx" ON "StorageBooking"("status", "startDate");

-- BillingPlan indexes
CREATE INDEX IF NOT EXISTS "BillingPlan_clientId_status_idx" ON "BillingPlan"("clientId", "status");
CREATE INDEX IF NOT EXISTS "BillingPlan_planType_status_idx" ON "BillingPlan"("planType", "status");

-- ===== STEP 6: ADD UNIQUE CONSTRAINTS =====

-- User unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_clientId_key" ON "User"("email", "clientId");

-- Client unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Client_name_key" ON "Client"("name");

-- Location unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Location_clientId_name_key" ON "Location"("clientId", "name");

-- StorageUnit unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "StorageUnit_locationId_unitNumber_key" ON "StorageUnit"("locationId", "unitNumber");

-- BillingPlan unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "BillingPlan_clientId_name_key" ON "BillingPlan"("clientId", "name");

-- ===== STEP 7: UPDATE EXISTING DATA =====

-- Update existing users with default values
UPDATE "User" SET 
    "status" = 'ACTIVE' WHERE "status" IS NULL;

-- Update existing clients with default values
UPDATE "Client" SET 
    "status" = 'ACTIVE' WHERE "status" IS NULL;

-- Update existing locations with default values
UPDATE "Location" SET 
    "isActive" = true WHERE "isActive" IS NULL,
    "isCorporate" = false WHERE "isCorporate" IS NULL;

-- Update existing truck journeys with default values
UPDATE "TruckJourney" SET 
    "priority" = 'NORMAL' WHERE "priority" IS NULL,
    "billingStatus" = 'PENDING' WHERE "billingStatus" IS NULL;

-- Update existing move sources with default values
UPDATE "MoveSource" SET 
    "status" = 'ACTIVE' WHERE "status" IS NULL;

-- ===== STEP 8: CREATE VIEWS FOR COMMON QUERIES =====

-- Create view for active journeys
CREATE OR REPLACE VIEW "ActiveJourneys" AS
SELECT 
    tj.id,
    tj.date,
    tj.status,
    tj.priority,
    tj.truckNumber,
    l.name as location_name,
    c.name as client_name,
    u.name as created_by_name,
    COUNT(ac.id) as crew_count
FROM "TruckJourney" tj
JOIN "Location" l ON tj.locationId = l.id
JOIN "Client" c ON tj.clientId = c.id
JOIN "User" u ON tj.createdBy = u.id
LEFT JOIN "AssignedCrew" ac ON tj.id = ac.journeyId
WHERE tj.status NOT IN ('COMPLETED', 'CANCELLED')
GROUP BY tj.id, tj.date, tj.status, tj.priority, tj.truckNumber, l.name, c.name, u.name;

-- Create view for storage utilization
CREATE OR REPLACE VIEW "StorageUtilization" AS
SELECT 
    l.name as location_name,
    l.storageType,
    COUNT(su.id) as total_units,
    COUNT(CASE WHEN su.status = 'OCCUPIED' THEN 1 END) as occupied_units,
    COUNT(CASE WHEN su.status = 'AVAILABLE' THEN 1 END) as available_units,
    ROUND(
        (COUNT(CASE WHEN su.status = 'OCCUPIED' THEN 1 END)::DECIMAL / COUNT(su.id)::DECIMAL) * 100, 2
    ) as utilization_percentage
FROM "Location" l
LEFT JOIN "StorageUnit" su ON l.id = su.locationId
WHERE l.storageType != 'NO_STORAGE'
GROUP BY l.id, l.name, l.storageType;

-- Create view for audit summary
CREATE OR REPLACE VIEW "AuditSummary" AS
SELECT 
    DATE(ae.timestamp) as audit_date,
    ae.entity,
    ae.action,
    ae.severity,
    COUNT(*) as action_count,
    COUNT(DISTINCT ae.userId) as unique_users
FROM "AuditEntry" ae
WHERE ae.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ae.timestamp), ae.entity, ae.action, ae.severity
ORDER BY audit_date DESC, action_count DESC;

-- ===== STEP 9: CREATE FUNCTIONS =====

-- Function to calculate journey duration
CREATE OR REPLACE FUNCTION calculate_journey_duration(journey_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    duration_minutes INTEGER;
BEGIN
    SELECT 
        EXTRACT(EPOCH FROM (tj.endTime - tj.startTime)) / 60
    INTO duration_minutes
    FROM "TruckJourney" tj
    WHERE tj.id = journey_id 
    AND tj.startTime IS NOT NULL 
    AND tj.endTime IS NOT NULL;
    
    RETURN COALESCE(duration_minutes, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id TEXT, step_number INTEGER)
RETURNS TABLE(can_edit BOOLEAN, can_approve BOOLEAN, can_view BOOLEAN, can_delete BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.canEdit,
        rp.canApprove,
        rp.canView,
        rp.canDelete
    FROM "User" u
    JOIN "RolePermission" rp ON u.role = rp.role
    WHERE u.id = user_id AND rp.stepNumber = step_number;
END;
$$ LANGUAGE plpgsql;

-- ===== STEP 10: CREATE TRIGGERS =====

-- Trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updatedAt
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_updated_at BEFORE UPDATE ON "Client" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_updated_at BEFORE UPDATE ON "Location" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_truck_journey_updated_at BEFORE UPDATE ON "TruckJourney" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journey_step_updated_at BEFORE UPDATE ON "JourneyStep" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_step_activity_updated_at BEFORE UPDATE ON "StepActivity" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assigned_crew_updated_at BEFORE UPDATE ON "AssignedCrew" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journey_entry_updated_at BEFORE UPDATE ON "JourneyEntry" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON "Media" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_move_source_updated_at BEFORE UPDATE ON "MoveSource" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storage_unit_updated_at BEFORE UPDATE ON "StorageUnit" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storage_booking_updated_at BEFORE UPDATE ON "StorageBooking" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_plan_updated_at BEFORE UPDATE ON "BillingPlan" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== STEP 11: ANALYZE TABLES =====

-- Update table statistics for query optimization
ANALYZE "User";
ANALYZE "Client";
ANALYZE "Location";
ANALYZE "TruckJourney";
ANALYZE "JourneyStep";
ANALYZE "StepActivity";
ANALYZE "AssignedCrew";
ANALYZE "JourneyEntry";
ANALYZE "Media";
ANALYZE "AuditEntry";
ANALYZE "MoveSource";
ANALYZE "StorageUnit";
ANALYZE "StorageBooking";
ANALYZE "BillingPlan";

-- ===== MIGRATION COMPLETE =====

-- Log migration completion
INSERT INTO "AuditEntry" (
    "clientId", "locationId", "userId", "action", "entity", "entityId", "details", "severity"
) VALUES (
    'system',
    'system',
    'system',
    'MIGRATION',
    'DATABASE',
    'unified_schema',
    '{"version": "3.0.0", "migration": "unified_schema", "timestamp": "' || CURRENT_TIMESTAMP || '"}',
    'INFO'
); 