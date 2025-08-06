-- Add Mobile Tables to C&C CRM Database
-- This script adds the mobile-specific tables for the mobile field operations portal

-- MobileSession table
CREATE TABLE IF NOT EXISTS "MobileSession" (
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

-- MobileJourneyUpdate table
CREATE TABLE IF NOT EXISTS "MobileJourneyUpdate" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updateType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "MobileJourneyUpdate_pkey" PRIMARY KEY ("id")
);

-- MobileMediaItem table
CREATE TABLE IF NOT EXISTS "MobileMediaItem" (
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

-- MobileNotification table
CREATE TABLE IF NOT EXISTS "MobileNotification" (
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
CREATE INDEX IF NOT EXISTS "MobileSession_userId_idx" ON "MobileSession"("userId");
CREATE INDEX IF NOT EXISTS "MobileSession_locationId_idx" ON "MobileSession"("locationId");
CREATE INDEX IF NOT EXISTS "MobileSession_syncStatus_idx" ON "MobileSession"("syncStatus");
CREATE UNIQUE INDEX IF NOT EXISTS "MobileSession_userId_deviceId_key" ON "MobileSession"("userId", "deviceId");

CREATE INDEX IF NOT EXISTS "MobileJourneyUpdate_journeyId_idx" ON "MobileJourneyUpdate"("journeyId");
CREATE INDEX IF NOT EXISTS "MobileJourneyUpdate_userId_idx" ON "MobileJourneyUpdate"("userId");
CREATE INDEX IF NOT EXISTS "MobileJourneyUpdate_timestamp_idx" ON "MobileJourneyUpdate"("timestamp");
CREATE INDEX IF NOT EXISTS "MobileJourneyUpdate_syncStatus_idx" ON "MobileJourneyUpdate"("syncStatus");

CREATE INDEX IF NOT EXISTS "MobileMediaItem_journeyId_idx" ON "MobileMediaItem"("journeyId");
CREATE INDEX IF NOT EXISTS "MobileMediaItem_userId_idx" ON "MobileMediaItem"("userId");
CREATE INDEX IF NOT EXISTS "MobileMediaItem_type_idx" ON "MobileMediaItem"("type");
CREATE INDEX IF NOT EXISTS "MobileMediaItem_uploadStatus_idx" ON "MobileMediaItem"("uploadStatus");

CREATE INDEX IF NOT EXISTS "MobileNotification_userId_idx" ON "MobileNotification"("userId");
CREATE INDEX IF NOT EXISTS "MobileNotification_read_idx" ON "MobileNotification"("read");
CREATE INDEX IF NOT EXISTS "MobileNotification_timestamp_idx" ON "MobileNotification"("timestamp");

-- Add foreign key constraints
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MobileJourneyUpdate" ADD CONSTRAINT "MobileJourneyUpdate_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TruckJourney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MobileJourneyUpdate" ADD CONSTRAINT "MobileJourneyUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MobileMediaItem" ADD CONSTRAINT "MobileMediaItem_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TruckJourney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MobileMediaItem" ADD CONSTRAINT "MobileMediaItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MobileNotification" ADD CONSTRAINT "MobileNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 