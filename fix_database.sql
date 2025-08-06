-- C&C CRM Database Fix Script
-- Run this manually in the Render.com PostgreSQL database

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

-- Insert sample data
INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") 
VALUES 
('clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Lets Get Moving', 'Moving & Storage', false, '{"theme": "dark", "features": ["journey_tracking", "mobile_ops", "storage_management"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") 
VALUES 
('loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'Toronto Main Office', 'America/Toronto', '123 Main St, Toronto, ON', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add foreign key constraints
ALTER TABLE "Location" ADD CONSTRAINT "Location_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 