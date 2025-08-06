import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  MobileSession,
  OfflineData,
  MobileJourneyUpdate,
  MobileMediaItem,
  QuickAction,
  MobileJourneyStep,
  JourneyProgress,
  LocationData,
  SyncStatus,
  MobileNotification,
  MobileUIState,
  MobilePermissions,
  MobileLoginRequest,
  MobileLoginResponse,
  UpdateJourneyStatusRequest,
  AddJourneyMediaRequest,
  SyncDataRequest,
  SyncDataResponse
} from '@/types/mobileFieldOps';
import { Journey, JourneyStage, User, Location, Client } from '@/types/journey';

interface MobileFieldOpsState {
  // Session & Authentication
  session: MobileSession | null;
  user: User | null;
  location: Location | null;
  client: Client | null;
  permissions: MobilePermissions | null;
  isAuthenticated: boolean;
  
  // Journey Data
  currentJourney: Journey | null;
  pendingJourneys: Journey[];
  completedJourneys: Journey[];
  
  // Journey Steps & Progress
  journeySteps: MobileJourneyStep[];
  currentStep: number;
  progress: JourneyProgress | null;
  
  // Offline Data
  offlineData: OfflineData;
  pendingUpdates: MobileJourneyUpdate[];
  mediaQueue: MobileMediaItem[];
  
  // Location & GPS
  locationData: LocationData | null;
  isLocationEnabled: boolean;
  
  // Sync & Connectivity
  syncStatus: SyncStatus;
  isOnline: boolean;
  
  // UI State
  uiState: MobileUIState;
  
  // Notifications
  notifications: MobileNotification[];
  
  // Quick Actions
  quickActions: QuickAction[];
}

interface MobileFieldOpsActions {
  // Authentication
  login: (request: MobileLoginRequest) => Promise<MobileLoginResponse>;
  logout: () => void;
  checkAuth: () => boolean;
  
  // Journey Management
  setCurrentJourney: (journey: Journey | null) => void;
  updateJourneyStatus: (request: UpdateJourneyStatusRequest) => Promise<void>;
  addJourneyMedia: (request: AddJourneyMediaRequest) => Promise<void>;
  completeJourneyStep: (stepId: string) => void;
  skipJourneyStep: (stepId: string) => void;
  
  // Progress Tracking
  updateProgress: (progress: JourneyProgress) => void;
  setCurrentStep: (step: number) => void;
  markStepComplete: (stepId: string) => void;
  
  // Location Services
  updateLocation: (location: { lat: number; lng: number; accuracy: number }) => void;
  enableLocation: () => void;
  disableLocation: () => void;
  
  // Offline Management
  addPendingUpdate: (update: MobileJourneyUpdate) => void;
  addMediaToQueue: (media: MobileMediaItem) => void;
  clearPendingUpdates: () => void;
  clearMediaQueue: () => void;
  
  // Sync Operations
  syncData: () => Promise<void>;
  checkConnectivity: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  
  // Notifications
  addNotification: (notification: MobileNotification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Quick Actions
  setQuickActions: (actions: QuickAction[]) => void;
  updateQuickAction: (id: string, updates: Partial<QuickAction>) => void;
  
  // UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentView: (view: MobileUIState['currentView']) => void;
  setOfflineMode: (offline: boolean) => void;
  
  // Utility
  generateDeviceId: () => string;
  getOfflineData: () => OfflineData;
  saveOfflineData: (data: Partial<OfflineData>) => void;
}

type MobileFieldOpsStore = MobileFieldOpsState & MobileFieldOpsActions;

// Default journey steps for mobile
const defaultJourneySteps: MobileJourneyStep[] = [
  {
    id: 'vehicle_check',
    title: 'Vehicle Check',
    description: 'Perform pre-trip inspection',
    status: 'pending',
    required: true,
    mediaRequired: false,
    checklist: [
      { id: 'fuel_check', title: 'Check fuel level', completed: false, required: true, mediaRequired: false },
      { id: 'tire_check', title: 'Check tire pressure', completed: false, required: true, mediaRequired: false },
      { id: 'equipment_check', title: 'Check moving equipment', completed: false, required: true, mediaRequired: false }
    ],
    order: 1,
    estimatedTime: 5
  },
  {
    id: 'pickup_arrival',
    title: 'Arrive at Pickup',
    description: 'Arrive at pickup location',
    status: 'pending',
    required: true,
    mediaRequired: true,
    checklist: [
      { id: 'location_confirm', title: 'Confirm pickup address', completed: false, required: true, mediaRequired: false },
      { id: 'customer_contact', title: 'Contact customer', completed: false, required: true, mediaRequired: false }
    ],
    order: 2,
    estimatedTime: 10
  },
  {
    id: 'loading',
    title: 'Loading',
    description: 'Load items into truck',
    status: 'pending',
    required: true,
    mediaRequired: true,
    checklist: [
      { id: 'inventory_check', title: 'Check inventory list', completed: false, required: true, mediaRequired: false },
      { id: 'item_photos', title: 'Take photos of items', completed: false, required: true, mediaRequired: true },
      { id: 'secure_load', title: 'Secure load properly', completed: false, required: true, mediaRequired: false }
    ],
    order: 3,
    estimatedTime: 30
  },
  {
    id: 'transit',
    title: 'Transit',
    description: 'Drive to delivery location',
    status: 'pending',
    required: true,
    mediaRequired: false,
    checklist: [
      { id: 'route_confirmation', title: 'Confirm route', completed: false, required: true, mediaRequired: false },
      { id: 'eta_update', title: 'Update ETA', completed: false, required: false, mediaRequired: false }
    ],
    order: 4,
    estimatedTime: 60
  },
  {
    id: 'delivery_arrival',
    title: 'Arrive at Delivery',
    description: 'Arrive at delivery location',
    status: 'pending',
    required: true,
    mediaRequired: true,
    checklist: [
      { id: 'location_confirm', title: 'Confirm delivery address', completed: false, required: true, mediaRequired: false },
      { id: 'customer_contact', title: 'Contact customer', completed: false, required: true, mediaRequired: false }
    ],
    order: 5,
    estimatedTime: 10
  },
  {
    id: 'unloading',
    title: 'Unloading',
    description: 'Unload items from truck',
    status: 'pending',
    required: true,
    mediaRequired: true,
    checklist: [
      { id: 'inventory_verify', title: 'Verify inventory', completed: false, required: true, mediaRequired: false },
      { id: 'item_photos', title: 'Take photos of items', completed: false, required: true, mediaRequired: true },
      { id: 'condition_check', title: 'Check item condition', completed: false, required: true, mediaRequired: false }
    ],
    order: 6,
    estimatedTime: 30
  },
  {
    id: 'customer_signature',
    title: 'Customer Signature',
    description: 'Get customer approval',
    status: 'pending',
    required: true,
    mediaRequired: true,
    checklist: [
      { id: 'signature_capture', title: 'Capture customer signature', completed: false, required: true, mediaRequired: true },
      { id: 'completion_confirm', title: 'Confirm completion', completed: false, required: true, mediaRequired: false }
    ],
    order: 7,
    estimatedTime: 5
  },
  {
    id: 'completion',
    title: 'Journey Complete',
    description: 'Final verification and completion',
    status: 'pending',
    required: true,
    mediaRequired: false,
    checklist: [
      { id: 'final_check', title: 'Final verification', completed: false, required: true, mediaRequired: false },
      { id: 'paperwork', title: 'Complete paperwork', completed: false, required: true, mediaRequired: false }
    ],
    order: 8,
    estimatedTime: 5
  }
];

// Default quick actions
const defaultQuickActions: QuickAction[] = [
  {
    id: 'add_photo',
    icon: '📸',
    label: 'Add Photo',
    action: () => {},
    color: 'primary',
    requiresConfirmation: false
  },
  {
    id: 'mark_complete',
    icon: '✅',
    label: 'Mark Complete',
    action: () => {},
    color: 'success',
    requiresConfirmation: true
  },
  {
    id: 'report_issue',
    icon: '⚠️',
    label: 'Report Issue',
    action: () => {},
    color: 'warning',
    requiresConfirmation: true
  },
  {
    id: 'update_location',
    icon: '📍',
    label: 'Update Location',
    action: () => {},
    color: 'primary',
    requiresConfirmation: false
  },
  {
    id: 'add_note',
    icon: '📝',
    label: 'Add Note',
    action: () => {},
    color: 'primary',
    requiresConfirmation: false
  },
  {
    id: 'call_customer',
    icon: '📞',
    label: 'Call Customer',
    action: () => {},
    color: 'primary',
    requiresConfirmation: false
  }
];

export const useMobileFieldOpsStore = create<MobileFieldOpsStore>()(
  persist(
    (set, get) => ({
      // Initial State
      session: null,
      user: null,
      location: null,
      client: null,
      permissions: null,
      isAuthenticated: false,
      
      currentJourney: null,
      pendingJourneys: [],
      completedJourneys: [],
      
      journeySteps: defaultJourneySteps,
      currentStep: 0,
      progress: null,
      
      offlineData: {
        currentJourney: null,
        pendingUpdates: [],
        mediaQueue: [],
        lastSync: new Date().toISOString(),
        user: null as any,
        location: null as any
      },
      pendingUpdates: [],
      mediaQueue: [],
      
      locationData: null,
      isLocationEnabled: false,
      
      syncStatus: {
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        lastSync: new Date().toISOString(),
        pendingUpdates: 0,
        pendingMedia: 0,
        syncProgress: 0
      },
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      
      uiState: {
        isLoading: false,
        error: null,
        currentView: 'login',
        offlineMode: false,
        syncStatus: {
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
          lastSync: new Date().toISOString(),
          pendingUpdates: 0,
          pendingMedia: 0,
          syncProgress: 0
        },
        notifications: [],
        quickActions: defaultQuickActions
      },
      
      notifications: [],
      quickActions: defaultQuickActions,

      // Actions
      login: async (request: MobileLoginRequest) => {
        set({ uiState: { ...get().uiState, isLoading: true, error: null } });
        
        try {
          // Real API call to mobile login endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/mobile/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });
          
          if (!response.ok) {
            throw new Error(`Login failed: ${response.statusText}`);
          }
          
          const result: MobileLoginResponse = await response.json();
          
          if (!result.success) {
            throw new Error(result.message || 'Login failed');
          }
          
          // Update state with real data
          set({
            user: result.data.user,
            location: result.data.location,
            client: result.data.client,
            currentJourney: result.data.activeJourney,
            pendingJourneys: result.data.pendingJourneys,
            permissions: result.data.permissions,
            isAuthenticated: true,
            uiState: { 
              ...get().uiState, 
              isLoading: false, 
              currentView: 'journey' 
            },
            session: {
              id: 'session1', // Will be updated with real session ID
              userId: result.data.user.id,
              deviceId: request.deviceId,
              locationId: request.locationId,
              lastActive: new Date().toISOString(),
              offlineData: {
                currentJourney: result.data.activeJourney,
                pendingUpdates: [],
                mediaQueue: [],
                lastSync: new Date().toISOString(),
                user: result.data.user,
                location: result.data.location
              },
              syncStatus: 'online',
              permissions: result.data.permissions
            }
          });
          
          return result;
        } catch (error) {
          set({ 
            uiState: { 
              ...get().uiState, 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Login failed' 
            } 
          });
          throw error;
        }
      },

      logout: () => {
        set({
          session: null,
          user: null,
          location: null,
          client: null,
          permissions: null,
          isAuthenticated: false,
          currentJourney: null,
          pendingJourneys: [],
          completedJourneys: [],
          uiState: { ...get().uiState, currentView: 'login' }
        });
      },

      checkAuth: () => {
        return get().isAuthenticated;
      },

      setCurrentJourney: (journey) => {
        set({ currentJourney: journey });
        if (journey) {
          // Reset steps for new journey
          set({ 
            journeySteps: defaultJourneySteps.map(step => ({ ...step, status: 'pending' })),
            currentStep: 0,
            progress: {
              totalSteps: defaultJourneySteps.length,
              completedSteps: 0,
              currentStep: 0,
              progressPercentage: 0,
              estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
              actualStartTime: new Date().toISOString()
            }
          });
        }
      },

      updateJourneyStatus: async (request) => {
        set({ uiState: { ...get().uiState, isLoading: true } });
        
        try {
          // Real API call to update journey status
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/mobile/journey/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to update status: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.message || 'Failed to update status');
          }
          
          // Update local state
          set(state => ({
            currentJourney: state.currentJourney ? {
              ...state.currentJourney,
              status: request.status,
              updatedAt: new Date().toISOString()
            } : null,
            uiState: { ...state.uiState, isLoading: false }
          }));
          
          // Add to pending updates for sync
          const update: MobileJourneyUpdate = {
            id: `update_${Date.now()}`,
            journeyId: request.journeyId,
            userId: request.userId,
            updateType: 'status',
            data: { status: request.status, location: request.location, notes: request.notes },
            timestamp: new Date().toISOString(),
            syncStatus: 'synced'
          };
          
          set(state => ({
            pendingUpdates: [...state.pendingUpdates, update]
          }));
        } catch (error) {
          set({ 
            uiState: { 
              ...get().uiState, 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to update status' 
            } 
          });
        }
      },

      addJourneyMedia: async (request) => {
        set({ uiState: { ...get().uiState, isLoading: true } });
        
        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('journey_id', request.journeyId);
          formData.append('media_type', request.type);
          formData.append('file', request.file);
          if (request.metadata.location) {
            formData.append('location', JSON.stringify(request.metadata.location));
          }
          if (request.metadata.stepId) {
            formData.append('step_id', request.metadata.stepId);
          }
          if (request.metadata.notes) {
            formData.append('notes', request.metadata.notes);
          }
          
          // Real API call to upload media
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/mobile/journey/media`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Failed to upload media: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.message || 'Failed to upload media');
          }
          
          const mediaItem: MobileMediaItem = {
            id: result.data.mediaId,
            journeyId: request.journeyId,
            type: request.type,
            file: request.file,
            metadata: {
              location: request.metadata.location,
              timestamp: new Date().toISOString(),
              deviceId: get().session?.deviceId || 'unknown',
              stepId: request.metadata.stepId
            },
            uploadStatus: 'completed'
          };
          
          set(state => ({
            mediaQueue: [...state.mediaQueue, mediaItem],
            uiState: { ...state.uiState, isLoading: false }
          }));
        } catch (error) {
          set({ 
            uiState: { 
              ...get().uiState, 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to add media' 
            } 
          });
        }
      },

      completeJourneyStep: (stepId) => {
        set(state => ({
          journeySteps: state.journeySteps.map(step =>
            step.id === stepId ? { ...step, status: 'completed' } : step
          ),
          currentStep: state.currentStep + 1,
          progress: state.progress ? {
            ...state.progress,
            completedSteps: state.progress.completedSteps + 1,
            progressPercentage: ((state.progress.completedSteps + 1) / state.progress.totalSteps) * 100
          } : null
        }));
      },

      skipJourneyStep: (stepId) => {
        set(state => ({
          journeySteps: state.journeySteps.map(step =>
            step.id === stepId ? { ...step, status: 'skipped' } : step
          ),
          currentStep: state.currentStep + 1
        }));
      },

      updateProgress: (progress) => {
        set({ progress });
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      markStepComplete: (stepId) => {
        set(state => ({
          journeySteps: state.journeySteps.map(step =>
            step.id === stepId ? { ...step, status: 'completed' } : step
          )
        }));
      },

      updateLocation: (location) => {
        set(state => ({
          locationData: state.locationData ? {
            ...state.locationData,
            currentLocation: {
              ...location,
              timestamp: new Date().toISOString()
            }
          } : {
            currentLocation: {
              ...location,
              timestamp: new Date().toISOString()
            },
            journeyRoute: [],
            distanceToDestination: 0,
            estimatedArrival: new Date().toISOString(),
            autoLocationUpdate: true
          }
        }));
      },

      enableLocation: () => {
        set({ isLocationEnabled: true });
      },

      disableLocation: () => {
        set({ isLocationEnabled: false });
      },

      addPendingUpdate: (update) => {
        set(state => ({
          pendingUpdates: [...state.pendingUpdates, update]
        }));
      },

      addMediaToQueue: (media) => {
        set(state => ({
          mediaQueue: [...state.mediaQueue, media]
        }));
      },

      clearPendingUpdates: () => {
        set({ pendingUpdates: [] });
      },

      clearMediaQueue: () => {
        set({ mediaQueue: [] });
      },

      syncData: async () => {
        const state = get();
        if (!state.isOnline || state.pendingUpdates.length === 0) return;
        
        set({ syncStatus: { ...state.syncStatus, syncProgress: 0 } });
        
        try {
          // Real API call to sync data
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/mobile/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: state.user?.id,
              device_id: state.session?.deviceId,
              pending_updates: state.pendingUpdates,
              pending_media: state.mediaQueue,
              last_sync: state.syncStatus.lastSync
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Sync failed: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.message || 'Sync failed');
          }
          
          set({
            pendingUpdates: [],
            mediaQueue: [],
            syncStatus: {
              ...state.syncStatus,
              lastSync: new Date().toISOString(),
              pendingUpdates: 0,
              pendingMedia: 0,
              syncProgress: 100
            }
          });
        } catch (error) {
          set({ 
            syncStatus: { 
              ...state.syncStatus, 
              error: error instanceof Error ? error.message : 'Sync failed' 
            } 
          });
        }
      },

      checkConnectivity: () => {
        const isOnline = navigator.onLine;
        set({ 
          isOnline,
          syncStatus: { ...get().syncStatus, isOnline }
        });
      },

      setOnlineStatus: (isOnline) => {
        set({ 
          isOnline,
          syncStatus: { ...get().syncStatus, isOnline }
        });
      },

      addNotification: (notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications]
        }));
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      setQuickActions: (actions) => {
        set({ quickActions: actions });
      },

      updateQuickAction: (id, updates) => {
        set(state => ({
          quickActions: state.quickActions.map(action =>
            action.id === id ? { ...action, ...updates } : action
          )
        }));
      },

      setLoading: (loading) => {
        set(state => ({
          uiState: { ...state.uiState, isLoading: loading }
        }));
      },

      setError: (error) => {
        set(state => ({
          uiState: { ...state.uiState, error }
        }));
      },

      setCurrentView: (view) => {
        set(state => ({
          uiState: { ...state.uiState, currentView: view }
        }));
      },

      setOfflineMode: (offline) => {
        set(state => ({
          uiState: { ...state.uiState, offlineMode: offline }
        }));
      },

      generateDeviceId: () => {
        return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      },

      getOfflineData: () => {
        return get().offlineData;
      },

      saveOfflineData: (data) => {
        set(state => ({
          offlineData: { ...state.offlineData, ...data }
        }));
      }
    }),
    {
      name: 'mobile-field-ops-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        location: state.location,
        client: state.client,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        offlineData: state.offlineData,
        pendingUpdates: state.pendingUpdates,
        mediaQueue: state.mediaQueue
      }),
    }
  )
);

// Export selectors for better performance
export const useMobileSession = () => useMobileFieldOpsStore((state) => state.session);
export const useMobileUser = () => useMobileFieldOpsStore((state) => state.user);
export const useMobileLocation = () => useMobileFieldOpsStore((state) => state.location);
export const useMobilePermissions = () => useMobileFieldOpsStore((state) => state.permissions);
export const useMobileIsAuthenticated = () => useMobileFieldOpsStore((state) => state.isAuthenticated);
export const useMobileCurrentJourney = () => useMobileFieldOpsStore((state) => state.currentJourney);
export const useMobileJourneySteps = () => useMobileFieldOpsStore((state) => state.journeySteps);
export const useMobileCurrentStep = () => useMobileFieldOpsStore((state) => state.currentStep);
export const useMobileProgress = () => useMobileFieldOpsStore((state) => state.progress);
export const useMobileLocationData = () => useMobileFieldOpsStore((state) => state.locationData);
export const useMobileSyncStatus = () => useMobileFieldOpsStore((state) => state.syncStatus);
export const useMobileIsOnline = () => useMobileFieldOpsStore((state) => state.isOnline);
export const useMobileUIState = () => useMobileFieldOpsStore((state) => state.uiState);
export const useMobileNotifications = () => useMobileFieldOpsStore((state) => state.notifications);
export const useMobileQuickActions = () => useMobileFieldOpsStore((state) => state.quickActions); 