// Journey Management TypeScript Interfaces
// Aligned with database schema and documentation

export type JourneyStage = 'MORNING_PREP' | 'EN_ROUTE' | 'ONSITE' | 'COMPLETED' | 'AUDITED';
export type EntryType = 'PHOTO' | 'NOTE' | 'GPS' | 'SIGNATURE' | 'CONFIRMATION';
export type TagType = 'DAMAGE' | 'COMPLETED' | 'FEEDBACK' | 'ERROR' | 'ISSUE';
export type MediaType = 'PHOTO' | 'VIDEO' | 'SIGNATURE';

// Core Journey Interface - Aligned with TruckJourney model
export interface Journey {
  id: string;
  locationId: string;
  clientId: string;
  date: string; // ISO date string
  status: JourneyStage;
  truckNumber?: string;
  moveSourceId?: string;
  startTime?: string; // ISO date string
  endTime?: string; // ISO date string
  notes?: string;
  createdById: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Relations (populated when fetched)
  location?: Location;
  client?: Client;
  createdBy?: User;
  assignedCrew?: AssignedCrew[];
  entries?: JourneyEntry[];
  media?: Media[];
}

// Journey Entry Interface - Aligned with JourneyEntry model
export interface JourneyEntry {
  id: string;
  journeyId: string;
  createdBy: string;
  type: EntryType;
  data: Record<string, any>; // JSON data
  tag?: TagType;
  timestamp: string; // ISO date string
  
  // Relations
  journey?: Journey;
  creator?: User;
}

// Media Interface - Aligned with Media model
export interface Media {
  id: string;
  url: string;
  type: MediaType;
  linkedTo: string; // JourneyEntry ID or TruckJourney ID
  uploadedBy: string;
  
  // Relations
  uploader?: User;
}

// Assigned Crew Interface - Aligned with AssignedCrew model
export interface AssignedCrew {
  id: string;
  journeyId: string;
  userId: string;
  role: UserRole;
  assignedAt: string; // ISO date string
  
  // Relations
  journey?: Journey;
  user?: User;
}

// Move Source Interface - Aligned with MoveSource model
export interface MoveSource {
  id: string;
  externalId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  price?: number;
  bookedBy?: string;
  status: string; // Default "ACTIVE"
  source: string; // CRM source (e.g., "HubSpot", "ClickUp")
  clientId: string;
  
  // Relations
  client?: Client;
}

// Supporting Types
export interface Location {
  id: string;
  clientId: string;
  name: string;
  timezone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  isFranchise: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locationId: string;
  clientId: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'MOVER' | 'MANAGER' | 'AUDITOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// API Request/Response Types
export interface CreateJourneyRequest {
  locationId: string;
  clientId: string;
  date: string;
  truckNumber?: string;
  moveSourceId?: string;
  notes?: string;
}

export interface UpdateJourneyRequest {
  status?: JourneyStage;
  truckNumber?: string;
  moveSourceId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface GetJourneysRequest {
  locationId?: string;
  clientId?: string;
  status?: JourneyStage;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateJourneyEntryRequest {
  journeyId: string;
  type: EntryType;
  data: Record<string, any>;
  tag?: TagType;
}

export interface AssignCrewRequest {
  journeyId: string;
  userId: string;
  role: UserRole;
}

// Journey Statistics
export interface JourneyStats {
  total: number;
  active: number;
  completed: number;
  onTime: number;
  revenue: number;
}

// Journey Timeline
export interface JourneyTimelineEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'ENTRY' | 'MEDIA' | 'CREW_ASSIGNMENT';
  timestamp: string;
  title: string;
  description: string;
  data?: Record<string, any>;
}

// Export all types
export type {
  Journey,
  JourneyEntry,
  Media,
  AssignedCrew,
  MoveSource,
  Location,
  Client,
  User,
  JourneyStats,
  JourneyTimelineEvent,
  CreateJourneyRequest,
  UpdateJourneyRequest,
  GetJourneysRequest,
  CreateJourneyEntryRequest,
  AssignCrewRequest
}; 