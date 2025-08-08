-- Job Management System Schema
-- Supports daily branch-based job data and user assignments

-- Job table for storing job/opportunity data
CREATE TABLE "Job" (
  "id" TEXT PRIMARY KEY,
  "externalId" TEXT,
  "branchId" TEXT NOT NULL,
  "customerId" TEXT,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT,
  "customerEmail" TEXT,
  "pickupAddress" TEXT NOT NULL,
  "deliveryAddress" TEXT NOT NULL,
  "scheduledDate" TIMESTAMP NOT NULL,
  "estimatedDuration" INTEGER, -- in minutes
  "moveSize" TEXT,
  "serviceType" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Scheduled', -- Scheduled, In Progress, Completed, Cancelled
  "crewSize" INTEGER DEFAULT 2,
  "specialRequirements" TEXT,
  "notes" TEXT,
  "priority" TEXT DEFAULT 'Medium', -- High, Medium, Low
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  FOREIGN KEY ("branchId") REFERENCES "CompanyBranch"("id") ON DELETE CASCADE
);

-- Job Assignment table for assigning users to jobs
CREATE TABLE "JobAssignment" (
  "id" TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL, -- 'driver', 'mover', 'supervisor', 'coordinator'
  "assignedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "assignedBy" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "notes" TEXT,
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "CompanyUser"("id") ON DELETE CASCADE
);

-- Job Tag table for intelligent data organization
CREATE TABLE "JobTag" (
  "id" TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "tagType" TEXT NOT NULL, -- 'location', 'date', 'status', 'priority', 'service', 'customer'
  "tagValue" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE
);

-- Job Status History for tracking status changes
CREATE TABLE "JobStatusHistory" (
  "id" TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "changedBy" TEXT,
  "changedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE
);

-- Job Notes for additional job information
CREATE TABLE "JobNote" (
  "id" TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "noteType" TEXT DEFAULT 'General', -- 'General', 'Customer', 'Internal', 'Dispatch'
  "createdBy" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE
);

-- User Availability for scheduling
CREATE TABLE "UserAvailability" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "startTime" TIME,
  "endTime" TIME,
  "isAvailable" BOOLEAN DEFAULT TRUE,
  "reason" TEXT, -- 'Sick', 'Vacation', 'Training', 'Other'
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "CompanyUser"("id") ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX "idx_job_branch_date" ON "Job"("branchId", "scheduledDate");
CREATE INDEX "idx_job_status" ON "Job"("status");
CREATE INDEX "idx_job_assignment_job" ON "JobAssignment"("jobId");
CREATE INDEX "idx_job_assignment_user" ON "JobAssignment"("userId");
CREATE INDEX "idx_job_tag_job" ON "JobTag"("jobId");
CREATE INDEX "idx_job_tag_type_value" ON "JobTag"("tagType", "tagValue");
CREATE INDEX "idx_job_status_history_job" ON "JobStatusHistory"("jobId");
CREATE INDEX "idx_user_availability_user_date" ON "UserAvailability"("userId", "date");

-- Create unique constraints
CREATE UNIQUE CONSTRAINT "Job_externalId_branchId_key" ON "Job"("externalId", "branchId");
CREATE UNIQUE CONSTRAINT "JobAssignment_jobId_userId_role_key" ON "JobAssignment"("jobId", "userId", "role");
CREATE UNIQUE CONSTRAINT "JobTag_jobId_tagType_tagValue_key" ON "JobTag"("jobId", "tagType", "tagValue");
CREATE UNIQUE CONSTRAINT "UserAvailability_userId_date_key" ON "UserAvailability"("userId", "date");

-- Add audit fields to existing tables if needed
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "auditData" JSONB;
ALTER TABLE "JobAssignment" ADD COLUMN IF NOT EXISTS "auditData" JSONB;
ALTER TABLE "JobTag" ADD COLUMN IF NOT EXISTS "auditData" JSONB;
