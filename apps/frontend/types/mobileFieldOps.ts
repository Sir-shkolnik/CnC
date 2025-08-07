// Mobile Field Operations TypeScript Interfaces
// Integrated with C&C CRM main system

import { 
  Journey, 
  JourneyStage, 
  User, 
  Location, 
  Client,
  JourneyEntry,
  Media,
  AssignedCrew
} from '@/types/journey';
import { UserRole, UserStatus } from '@/types/enums';

// Mobile Authentication
export interface MobileLoginRequest {
  locationId: string;
  username: string;
  password: string;
  deviceId: string;
}

export interface MobileLoginResponse {
  success: boolean;
  data: {
    user: User;
    location: Location;
    client: Client;
    activeJourney: Journey | null;
    pendingJourneys: Journey[];
    token: string;
    permissions: MobilePermissions;
  };
  message: string;
}

// Mobile Permissions
export interface MobilePermissions {
  viewAssignedJourneys: boolean;
  updateJourneyStatus: boolean;
  addMedia: boolean;
  viewCustomerInfo: boolean;
  accessGPS: boolean;
  completeChecklists: boolean;
  getCustomerSignature: boolean;
  manageCrew: boolean;
  handleIssues: boolean;
  viewAnalytics: boolean;
  overrideStatus: boolean;
}

// Mobile Session
export interface MobileSession {
  id: string;
  userId: string;
  deviceId: string;
  locationId: string;
  lastActive: string;
  offlineData: OfflineData;
  syncStatus: 'online' | 'offline' | 'syncing';
  permissions: MobilePermissions;
}

// Offline Data Management
export interface OfflineData {
  currentJourney: Journey | null;
  pendingUpdates: MobileJourneyUpdate[];
  mediaQueue: MobileMediaItem[];
  lastSync: string;
  user: User;
  location: Location;
}

// Mobile Journey Updates
export interface MobileJourneyUpdate {
  id: string;
  journeyId: string;
  userId: string;
  updateType: 'status' | 'location' | 'note' | 'checklist' | 'media';
  data: Record<string, any>;
  timestamp: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

// Mobile Media Items
export interface MobileMediaItem {
  id: string;
  journeyId: string;
  type: 'photo' | 'video' | 'signature';
  file: File | string; // File object or base64 string
  metadata: {
    location?: { lat: number; lng: number };
    timestamp: string;
    deviceId: string;
    stepId?: string;
  };
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  localPath?: string; // For offline storage
}

// Quick Actions
export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  action: () => void;
  color: 'primary' | 'success' | 'warning' | 'error';
  requiresConfirmation: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// Journey Steps for Mobile
export interface MobileJourneyStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  required: boolean;
  mediaRequired: boolean;
  checklist: ChecklistItem[];
  order: number;
  estimatedTime: number; // minutes
}

// Checklist Items
export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  required: boolean;
  mediaRequired: boolean;
  timestamp?: string;
}

// Progress Tracking
export interface JourneyProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  progressPercentage: number;
  estimatedCompletion: string;
  actualStartTime: string;
  actualEndTime?: string;
}

// Location Services
export interface LocationData {
  currentLocation: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: string;
  };
  journeyRoute: RoutePoint[];
  distanceToDestination: number;
  estimatedArrival: string;
  autoLocationUpdate: boolean;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  address: string;
  type: 'pickup' | 'delivery' | 'waypoint';
}

// Camera Services
export interface CameraData {
  capturePhoto: () => Promise<PhotoCapture>;
  captureVideo: () => Promise<VideoCapture>;
  captureSignature: () => Promise<SignatureCapture>;
  autoCompression: boolean;
  metadataExtraction: boolean;
}

export interface PhotoCapture {
  file: File;
  base64: string;
  metadata: {
    location?: { lat: number; lng: number };
    timestamp: string;
    deviceId: string;
    journeyId: string;
    stepId?: string;
  };
}

export interface VideoCapture {
  file: File;
  base64: string;
  duration: number;
  metadata: {
    location?: { lat: number; lng: number };
    timestamp: string;
    deviceId: string;
    journeyId: string;
    stepId?: string;
  };
}

export interface SignatureCapture {
  file: File;
  base64: string;
  customerName: string;
  timestamp: string;
  journeyId: string;
}

// Notification System
export interface MobileNotification {
  id: string;
  type: 'journey_update' | 'new_assignment' | 'urgent_alert' | 'sync_status' | 'custom';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
  action?: () => void;
}

// Sync Status
export interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingUpdates: number;
  pendingMedia: number;
  syncProgress: number;
  error?: string;
}

// Mobile Analytics
export interface MobileAnalytics {
  currentStatus: JourneyStage;
  todayProgress: {
    journeysCompleted: number;
    totalJourneys: number;
    averageTime: number;
    mediaCaptured: number;
  };
  weeklyPerformance: {
    journeysCompleted: number;
    onTimeRate: number;
    customerSatisfaction: number;
    issuesResolved: number;
  };
  teamOverview: {
    activeUsers: number;
    totalJourneys: number;
    averageCompletionTime: number;
  };
}

// API Request/Response Types
export interface GetCurrentJourneyRequest {
  userId: string;
  locationId: string;
}

export interface UpdateJourneyStatusRequest {
  journeyId: string;
  status: JourneyStage;
  userId: string;
  location?: { lat: number; lng: number };
  notes?: string;
}

export interface AddJourneyMediaRequest {
  journeyId: string;
  type: 'photo' | 'video' | 'signature';
  file: File;
  metadata: {
    location?: { lat: number; lng: number };
    stepId?: string;
    notes?: string;
  };
}

export interface SyncDataRequest {
  userId: string;
  deviceId: string;
  pendingUpdates: MobileJourneyUpdate[];
  pendingMedia: MobileMediaItem[];
  lastSync: string;
}

export interface SyncDataResponse {
  success: boolean;
  data: {
    syncedUpdates: string[];
    syncedMedia: string[];
    newJourneyData?: Journey;
    notifications: MobileNotification[];
    conflicts?: any[];
  };
  message: string;
}

// Mobile UI State
export interface MobileUIState {
  isLoading: boolean;
  error: string | null;
  currentView: 'login' | 'journey' | 'settings' | 'offline';
  offlineMode: boolean;
  syncStatus: SyncStatus;
  notifications: MobileNotification[];
  quickActions: QuickAction[];
}

 