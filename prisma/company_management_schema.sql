-- Company Management System Migration
-- Adds support for external company data integration (LGM, future companies)

-- 1. Company Integration Table
CREATE TABLE IF NOT EXISTS "CompanyIntegration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiSource" TEXT NOT NULL,
    "apiBaseUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "clientId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncFrequencyHours" INTEGER NOT NULL DEFAULT 12,
    "lastSyncAt" TIMESTAMP(3),
    "nextSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyIntegration_pkey" PRIMARY KEY ("id")
);

-- 2. Company Data Sync Log
CREATE TABLE IF NOT EXISTS "CompanyDataSyncLog" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "CompanyDataSyncLog_pkey" PRIMARY KEY ("id")
);

-- 3. Company Branch Data
CREATE TABLE IF NOT EXISTS "CompanyBranch" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT NOT NULL,
    "provinceState" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "externalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyBranch_pkey" PRIMARY KEY ("id")
);

-- 4. Company Material Data
CREATE TABLE IF NOT EXISTS "CompanyMaterial" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rate" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "category" TEXT NOT NULL,
    "dimensions" TEXT,
    "maxSize" TEXT,
    "sizeRange" TEXT,
    "capacity" TEXT,
    "weight" TEXT,
    "contents" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "externalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMaterial_pkey" PRIMARY KEY ("id")
);

-- 5. Company Service Type Data
CREATE TABLE IF NOT EXISTS "CompanyServiceType" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scalingFactorPercentage" INTEGER NOT NULL DEFAULT 100,
    "hasActivityLoading" BOOLEAN NOT NULL DEFAULT false,
    "hasActivityFinishedLoading" BOOLEAN NOT NULL DEFAULT false,
    "hasActivityUnloading" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "externalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyServiceType_pkey" PRIMARY KEY ("id")
);

-- 6. Company Move Size Data
CREATE TABLE IF NOT EXISTS "CompanyMoveSize" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "volume" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "externalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMoveSize_pkey" PRIMARY KEY ("id")
);

-- 7. Company Room Type Data
CREATE TABLE IF NOT EXISTS "CompanyRoomType" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "externalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyRoomType_pkey" PRIMARY KEY ("id")
);

-- 8. Company User Data
CREATE TABLE IF NOT EXISTS "CompanyUser" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "primaryBranchId" TEXT,
    "roleId" TEXT,
    "roleName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "externalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("id")
);

-- 9. Company Referral Source Data
CREATE TABLE IF NOT EXISTS "CompanyReferralSource" (
    "id" TEXT NOT NULL,
    "companyIntegrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isLeadProvider" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "externalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyReferralSource_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "CompanyIntegration_name_idx" ON "CompanyIntegration"("name");
CREATE INDEX IF NOT EXISTS "CompanyIntegration_apiSource_idx" ON "CompanyIntegration"("apiSource");
CREATE INDEX IF NOT EXISTS "CompanyIntegration_isActive_idx" ON "CompanyIntegration"("isActive");
CREATE INDEX IF NOT EXISTS "CompanyIntegration_nextSyncAt_idx" ON "CompanyIntegration"("nextSyncAt");

CREATE INDEX IF NOT EXISTS "CompanyDataSyncLog_companyIntegrationId_idx" ON "CompanyDataSyncLog"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyDataSyncLog_syncType_idx" ON "CompanyDataSyncLog"("syncType");
CREATE INDEX IF NOT EXISTS "CompanyDataSyncLog_status_idx" ON "CompanyDataSyncLog"("status");
CREATE INDEX IF NOT EXISTS "CompanyDataSyncLog_startedAt_idx" ON "CompanyDataSyncLog"("startedAt");

CREATE INDEX IF NOT EXISTS "CompanyBranch_companyIntegrationId_idx" ON "CompanyBranch"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyBranch_externalId_idx" ON "CompanyBranch"("externalId");
CREATE INDEX IF NOT EXISTS "CompanyBranch_city_idx" ON "CompanyBranch"("city");
CREATE INDEX IF NOT EXISTS "CompanyBranch_country_idx" ON "CompanyBranch"("country");
CREATE INDEX IF NOT EXISTS "CompanyBranch_isActive_idx" ON "CompanyBranch"("isActive");

CREATE INDEX IF NOT EXISTS "CompanyMaterial_companyIntegrationId_idx" ON "CompanyMaterial"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyMaterial_externalId_idx" ON "CompanyMaterial"("externalId");
CREATE INDEX IF NOT EXISTS "CompanyMaterial_category_idx" ON "CompanyMaterial"("category");
CREATE INDEX IF NOT EXISTS "CompanyMaterial_isActive_idx" ON "CompanyMaterial"("isActive");

CREATE INDEX IF NOT EXISTS "CompanyServiceType_companyIntegrationId_idx" ON "CompanyServiceType"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyServiceType_externalId_idx" ON "CompanyServiceType"("externalId");
CREATE INDEX IF NOT EXISTS "CompanyServiceType_isActive_idx" ON "CompanyServiceType"("isActive");

CREATE INDEX IF NOT EXISTS "CompanyMoveSize_companyIntegrationId_idx" ON "CompanyMoveSize"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyMoveSize_externalId_idx" ON "CompanyMoveSize"("externalId");
CREATE INDEX IF NOT EXISTS "CompanyMoveSize_isActive_idx" ON "CompanyMoveSize"("isActive");

CREATE INDEX IF NOT EXISTS "CompanyRoomType_companyIntegrationId_idx" ON "CompanyRoomType"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyRoomType_externalId_idx" ON "CompanyRoomType"("externalId");
CREATE INDEX IF NOT EXISTS "CompanyRoomType_isActive_idx" ON "CompanyRoomType"("isActive");

CREATE INDEX IF NOT EXISTS "CompanyUser_companyIntegrationId_idx" ON "CompanyUser"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyUser_externalId_idx" ON "CompanyUser"("externalId");
CREATE INDEX IF NOT EXISTS "CompanyUser_email_idx" ON "CompanyUser"("email");
CREATE INDEX IF NOT EXISTS "CompanyUser_isActive_idx" ON "CompanyUser"("isActive");

CREATE INDEX IF NOT EXISTS "CompanyReferralSource_companyIntegrationId_idx" ON "CompanyReferralSource"("companyIntegrationId");
CREATE INDEX IF NOT EXISTS "CompanyReferralSource_externalId_idx" ON "CompanyReferralSource"("externalId");
CREATE INDEX IF NOT EXISTS "CompanyReferralSource_isActive_idx" ON "CompanyReferralSource"("isActive");

-- Add foreign key constraints
ALTER TABLE "CompanyDataSyncLog" ADD CONSTRAINT "CompanyDataSyncLog_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyBranch" ADD CONSTRAINT "CompanyBranch_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyMaterial" ADD CONSTRAINT "CompanyMaterial_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyServiceType" ADD CONSTRAINT "CompanyServiceType_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyMoveSize" ADD CONSTRAINT "CompanyMoveSize_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyRoomType" ADD CONSTRAINT "CompanyRoomType_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyReferralSource" ADD CONSTRAINT "CompanyReferralSource_companyIntegrationId_fkey" FOREIGN KEY ("companyIntegrationId") REFERENCES "CompanyIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "CompanyIntegration" ADD CONSTRAINT "CompanyIntegration_name_key" UNIQUE ("name");
ALTER TABLE "CompanyBranch" ADD CONSTRAINT "CompanyBranch_companyIntegrationId_externalId_key" UNIQUE ("companyIntegrationId", "externalId");
ALTER TABLE "CompanyMaterial" ADD CONSTRAINT "CompanyMaterial_companyIntegrationId_externalId_key" UNIQUE ("companyIntegrationId", "externalId");
ALTER TABLE "CompanyServiceType" ADD CONSTRAINT "CompanyServiceType_companyIntegrationId_externalId_key" UNIQUE ("companyIntegrationId", "externalId");
ALTER TABLE "CompanyMoveSize" ADD CONSTRAINT "CompanyMoveSize_companyIntegrationId_externalId_key" UNIQUE ("companyIntegrationId", "externalId");
ALTER TABLE "CompanyRoomType" ADD CONSTRAINT "CompanyRoomType_companyIntegrationId_externalId_key" UNIQUE ("companyIntegrationId", "externalId");
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_companyIntegrationId_externalId_key" UNIQUE ("companyIntegrationId", "externalId");
ALTER TABLE "CompanyReferralSource" ADD CONSTRAINT "CompanyReferralSource_companyIntegrationId_externalId_key" UNIQUE ("companyIntegrationId", "externalId");

-- Insert LGM company integration
INSERT INTO "CompanyIntegration" (
    "id", 
    "name", 
    "apiSource", 
    "apiBaseUrl", 
    "apiKey", 
    "clientId", 
    "isActive", 
    "syncFrequencyHours", 
    "nextSyncAt",
    "syncStatus",
    "settings"
) VALUES (
    'lgm-integration-001',
    'Let''s Get Moving',
    'SmartMoving API',
    'https://api-public.smartmoving.com/v1',
    '185840176c73420fbd3a473c2fdccedb',
    'b0db4e2b-74af-44e2-8ecd-6f4921ec836f',
    true,
    12,
    CURRENT_TIMESTAMP + INTERVAL '12 hours',
    'PENDING',
    '{"dataExtractionDate": "2025-08-08", "totalBranches": 50, "totalMaterials": 59, "totalServiceTypes": 25, "totalMoveSizes": 38, "totalRoomTypes": 10, "totalUsers": 50, "totalReferralSources": 50}'
) ON CONFLICT ("name") DO NOTHING;
