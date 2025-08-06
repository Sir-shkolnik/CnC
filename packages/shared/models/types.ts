// Shared types for C&C CRM

import { UserRole, JourneyStage, EntryType, MediaType, TagType } from './enums';

// ===== CORE ENTITY TYPES =====

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locationId: string;
  clientId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
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

export interface Location {
  id: string;
  clientId: string;
  name: string;
  timezone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TruckJourney {
  id: string;
  locationId: string;
  clientId: string;
  date: string;
  status: JourneyStage;
  truckNumber?: string;
  moveSourceId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  location?: Location;
  client?: Client;
  createdBy?: User;
  assignedCrew?: AssignedCrew[];
  entries?: JourneyEntry[];
  media?: Media[];
}

export interface AssignedCrew {
  id: string;
  journeyId: string;
  userId: string;
  role: UserRole;
  assignedAt: string;
  
  // Relations
  user?: User;
}

export interface JourneyEntry {
  id: string;
  journeyId: string;
  createdBy: string;
  type: EntryType;
  data: Record<string, any>;
  tag?: TagType;
  timestamp: string;
  
  // Relations
  user?: User;
}

export interface Media {
  id: string;
  url: string;
  type: MediaType;
  linkedTo: string;
  uploadedBy: string;
  createdAt: string;
  
  // Relations
  user?: User;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  locationId: string;
  clientId: string;
  timestamp: string;
  diff?: Record<string, any>;
  
  // Relations
  user?: User;
  location?: Location;
}

// ===== API REQUEST/RESPONSE TYPES =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== FORM TYPES =====

export interface CreateJourneyForm {
  locationId: string;
  date: string;
  truckNumber?: string;
  moveSourceId?: string;
  notes?: string;
  crewIds: string[];
}

export interface UpdateJourneyForm {
  status?: JourneyStage;
  startTime?: string;
  endTime?: string;
  notes?: string;
  truckNumber?: string;
}

export interface CreateEntryForm {
  journeyId: string;
  type: EntryType;
  data: Record<string, any>;
  tag?: TagType;
}

export interface UploadMediaForm {
  file: File;
  type: MediaType;
  linkedTo: string;
  metadata?: Record<string, any>;
}

// ===== AUTH TYPES =====

export interface LoginForm {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// ===== UI STATE TYPES =====

export interface JourneyFilters {
  status?: JourneyStage[];
  dateFrom?: string;
  dateTo?: string;
  truckNumber?: string;
  crewMember?: string;
}

export interface OfflineQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
}

// ===== C&C MODULE TYPES =====

export interface CCModuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  features: string[];
  pricing?: {
    monthly: number;
    yearly: number;
  };
}

export interface ClientSettings {
  clientId: string;
  enabledModules: string[];
  customFields: Record<string, any>;
  branding: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
  features: {
    offlineMode: boolean;
    auditTrail: boolean;
    aiFeatures: boolean;
    crmSync: boolean;
  };
} 