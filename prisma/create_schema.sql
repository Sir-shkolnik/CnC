-- C&C CRM Database Schema Creation
-- This file creates all tables and relationships manually

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'MOVER', 'MANAGER', 'AUDITOR');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "JourneyStage" AS ENUM ('MORNING_PREP', 'EN_ROUTE', 'ONSITE', 'COMPLETED', 'AUDITED');
CREATE TYPE "EntryType" AS ENUM ('PHOTO', 'NOTE', 'GPS', 'SIGNATURE', 'CONFIRMATION');
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO', 'SIGNATURE');
CREATE TYPE "TagType" AS ENUM ('DAMAGE', 'COMPLETED', 'FEEDBACK', 'ERROR', 'ISSUE');

-- Create Client table
CREATE TABLE "Client" (
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
CREATE TABLE "Location" (
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
CREATE TABLE "User" (
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
CREATE TABLE "TruckJourney" (
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
CREATE TABLE "AssignedCrew" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedCrew_pkey" PRIMARY KEY ("id")
);

-- Create JourneyEntry table
CREATE TABLE "JourneyEntry" (
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
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "linkedTo" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- Create AuditEntry table
CREATE TABLE "AuditEntry" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" JSONB,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- Create MoveSource table
CREATE TABLE "MoveSource" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "price" DOUBLE PRECISION,
    "bookedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoveSource_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "User_clientId_locationId_idx" ON "User"("clientId", "locationId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Location_clientId_idx" ON "Location"("clientId");
CREATE INDEX "TruckJourney_clientId_locationId_idx" ON "TruckJourney"("clientId", "locationId");
CREATE INDEX "TruckJourney_date_idx" ON "TruckJourney"("date");
CREATE INDEX "TruckJourney_status_idx" ON "TruckJourney"("status");
CREATE INDEX "TruckJourney_createdById_idx" ON "TruckJourney"("createdById");
CREATE INDEX "AssignedCrew_journeyId_idx" ON "AssignedCrew"("journeyId");
CREATE INDEX "AssignedCrew_userId_idx" ON "AssignedCrew"("userId");
CREATE INDEX "JourneyEntry_journeyId_idx" ON "JourneyEntry"("journeyId");
CREATE INDEX "JourneyEntry_createdBy_idx" ON "JourneyEntry"("createdBy");
CREATE INDEX "JourneyEntry_type_idx" ON "JourneyEntry"("type");
CREATE INDEX "JourneyEntry_timestamp_idx" ON "JourneyEntry"("timestamp");
CREATE INDEX "Media_uploadedBy_idx" ON "Media"("uploadedBy");
CREATE INDEX "Media_type_idx" ON "Media"("type");
CREATE INDEX "Media_linkedTo_idx" ON "Media"("linkedTo");
CREATE INDEX "AuditEntry_clientId_locationId_idx" ON "AuditEntry"("clientId", "locationId");
CREATE INDEX "AuditEntry_entity_entityId_idx" ON "AuditEntry"("entity", "entityId");
CREATE INDEX "AuditEntry_userId_idx" ON "AuditEntry"("userId");
CREATE INDEX "AuditEntry_timestamp_idx" ON "AuditEntry"("timestamp");
CREATE INDEX "MoveSource_clientId_idx" ON "MoveSource"("clientId");
CREATE INDEX "MoveSource_externalId_idx" ON "MoveSource"("externalId");
CREATE INDEX "MoveSource_status_idx" ON "MoveSource"("status");

-- Create unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "AssignedCrew_journeyId_userId_key" ON "AssignedCrew"("journeyId", "userId");
CREATE UNIQUE INDEX "MoveSource_externalId_key" ON "MoveSource"("externalId");

-- Add foreign key constraints
ALTER TABLE "Location" ADD CONSTRAINT "Location_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TruckJourney" ADD CONSTRAINT "TruckJourney_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TruckJourney" ADD CONSTRAINT "TruckJourney_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TruckJourney" ADD CONSTRAINT "TruckJourney_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssignedCrew" ADD CONSTRAINT "AssignedCrew_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TruckJourney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssignedCrew" ADD CONSTRAINT "AssignedCrew_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JourneyEntry" ADD CONSTRAINT "JourneyEntry_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TruckJourney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JourneyEntry" ADD CONSTRAINT "JourneyEntry_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO c_and_c_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO c_and_c_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO c_and_c_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO c_and_c_user;

-- Log successful creation
SELECT 'C&C CRM database schema created successfully' as status;
