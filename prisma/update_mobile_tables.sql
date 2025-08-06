-- Update Mobile Tables to match new schema
-- This script updates the existing mobile tables to match the new Prisma schema

-- Drop existing mobile tables
DROP TABLE IF EXISTS "MobileSession" CASCADE;
DROP TABLE IF EXISTS "MobileJourneyUpdate" CASCADE;
DROP TABLE IF EXISTS "MobileMediaItem" CASCADE;
DROP TABLE IF EXISTS "MobileNotification" CASCADE;

-- Recreate MobileSession table with new schema
CREATE TABLE "MobileSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offlineData" JSONB,
    "syncStatus" TEXT NOT NULL DEFAULT 'online',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobileSession_pkey" PRIMARY KEY ("id")
);

-- Recreate MobileJourneyUpdate table with new schema
CREATE TABLE "MobileJourneyUpdate" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updateType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "MobileJourneyUpdate_pkey" PRIMARY KEY ("id")
);

-- Recreate MobileMediaItem table with new schema
CREATE TABLE "MobileMediaItem" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "metadata" JSONB,
    "uploadStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobileMediaItem_pkey" PRIMARY KEY ("id")
);

-- Recreate MobileNotification table with new schema
CREATE TABLE "MobileNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MobileNotification_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "MobileSession_userId_idx" ON "MobileSession"("userId");
CREATE INDEX "MobileSession_locationId_idx" ON "MobileSession"("locationId");
CREATE INDEX "MobileSession_syncStatus_idx" ON "MobileSession"("syncStatus");
CREATE UNIQUE INDEX "MobileSession_userId_deviceId_key" ON "MobileSession"("userId", "deviceId");

CREATE INDEX "MobileJourneyUpdate_journeyId_idx" ON "MobileJourneyUpdate"("journeyId");
CREATE INDEX "MobileJourneyUpdate_userId_idx" ON "MobileJourneyUpdate"("userId");
CREATE INDEX "MobileJourneyUpdate_timestamp_idx" ON "MobileJourneyUpdate"("timestamp");
CREATE INDEX "MobileJourneyUpdate_syncStatus_idx" ON "MobileJourneyUpdate"("syncStatus");

CREATE INDEX "MobileMediaItem_journeyId_idx" ON "MobileMediaItem"("journeyId");
CREATE INDEX "MobileMediaItem_userId_idx" ON "MobileMediaItem"("userId");
CREATE INDEX "MobileMediaItem_type_idx" ON "MobileMediaItem"("type");
CREATE INDEX "MobileMediaItem_uploadStatus_idx" ON "MobileMediaItem"("uploadStatus");

CREATE INDEX "MobileNotification_userId_idx" ON "MobileNotification"("userId");
CREATE INDEX "MobileNotification_read_idx" ON "MobileNotification"("read");
CREATE INDEX "MobileNotification_timestamp_idx" ON "MobileNotification"("timestamp");

-- Add foreign key constraints
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MobileJourneyUpdate" ADD CONSTRAINT "MobileJourneyUpdate_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TruckJourney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MobileJourneyUpdate" ADD CONSTRAINT "MobileJourneyUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MobileMediaItem" ADD CONSTRAINT "MobileMediaItem_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TruckJourney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MobileMediaItem" ADD CONSTRAINT "MobileMediaItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MobileNotification" ADD CONSTRAINT "MobileNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 