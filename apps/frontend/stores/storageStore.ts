import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  StorageUnit,
  StorageLocation,
  StorageZone,
  StorageMap,
  StorageAnalytics,
  StorageBooking,
  StorageUser,
  StorageFilter,
  LocationFilter,
  OperationalKPIs,
  FinancialKPIs,
  ApiResponse,
  PaginatedResponse
} from '@/types/storage';

// Storage System State Interface
interface StorageState {
  // Core Data
  locations: StorageLocation[];
  storageUnits: StorageUnit[];
  storageZones: StorageZone[];
  storageMaps: StorageMap[];
  bookings: StorageBooking[];
  users: StorageUser[];
  
  // Analytics
  analytics: StorageAnalytics | null;
  operationalKPIs: OperationalKPIs | null;
  financialKPIs: FinancialKPIs | null;
  
  // UI State
  selectedLocation: string | null;
  selectedUnit: string | null;
  selectedZone: string | null;
  viewMode: 'GRID' | '3D' | 'LIST' | 'ANALYTICS';
  filters: StorageFilter;
  locationFilters: LocationFilter;
  
  // Loading States
  isLoading: boolean;
  isUpdating: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  
  // Error States
  error: string | null;
  lastError: string | null;
  
  // Real-time Data
  lastUpdated: Date | null;
  activeUsers: number;
  recentChanges: any[];
  alerts: any[];
  
  // Drag and Drop State
  isDragging: boolean;
  draggedUnit: string | null;
  dragPreview: any;
  undoStack: any[];
  redoStack: any[];
  
  // Actions - Location Management
  setLocations: (locations: StorageLocation[]) => void;
  addLocation: (location: StorageLocation) => void;
  updateLocation: (id: string, updates: Partial<StorageLocation>) => void;
  deleteLocation: (id: string) => void;
  selectLocation: (id: string | null) => void;
  
  // Actions - Storage Unit Management
  setStorageUnits: (units: StorageUnit[]) => void;
  addStorageUnit: (unit: StorageUnit) => void;
  updateStorageUnit: (id: string, updates: Partial<StorageUnit>) => void;
  deleteStorageUnit: (id: string) => void;
  selectUnit: (id: string | null) => void;
  moveUnit: (id: string, position: any) => void;
  resizeUnit: (id: string, size: any) => void;
  rotateUnit: (id: string, rotation: number) => void;
  
  // Actions - Storage Zone Management
  setStorageZones: (zones: StorageZone[]) => void;
  addStorageZone: (zone: StorageZone) => void;
  updateStorageZone: (id: string, updates: Partial<StorageZone>) => void;
  deleteStorageZone: (id: string) => void;
  selectZone: (id: string | null) => void;
  
  // Actions - Storage Map Management
  setStorageMaps: (maps: StorageMap[]) => void;
  updateStorageMap: (locationId: string, updates: Partial<StorageMap>) => void;
  getStorageMap: (locationId: string) => StorageMap | null;
  
  // Actions - Booking Management
  setBookings: (bookings: StorageBooking[]) => void;
  addBooking: (booking: StorageBooking) => void;
  updateBooking: (id: string, updates: Partial<StorageBooking>) => void;
  deleteBooking: (id: string) => void;
  
  // Actions - User Management
  setUsers: (users: StorageUser[]) => void;
  addUser: (user: StorageUser) => void;
  updateUser: (id: string, updates: Partial<StorageUser>) => void;
  deleteUser: (id: string) => void;
  
  // Actions - Analytics
  setAnalytics: (analytics: StorageAnalytics) => void;
  setOperationalKPIs: (kpis: OperationalKPIs) => void;
  setFinancialKPIs: (kpis: FinancialKPIs) => void;
  
  // Actions - UI State
  setViewMode: (mode: 'GRID' | '3D' | 'LIST' | 'ANALYTICS') => void;
  setFilters: (filters: Partial<StorageFilter>) => void;
  setLocationFilters: (filters: Partial<LocationFilter>) => void;
  clearFilters: () => void;
  
  // Actions - Loading States
  setLoading: (loading: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setCreating: (creating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  
  // Actions - Error Handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Actions - Real-time Data
  setLastUpdated: (date: Date) => void;
  setActiveUsers: (count: number) => void;
  addRecentChange: (change: any) => void;
  addAlert: (alert: any) => void;
  resolveAlert: (alertId: string) => void;
  
  // Actions - Drag and Drop
  setDragging: (dragging: boolean) => void;
  setDraggedUnit: (unitId: string | null) => void;
  setDragPreview: (preview: any) => void;
  addToUndoStack: (action: any) => void;
  addToRedoStack: (action: any) => void;
  undo: () => void;
  redo: () => void;
  clearUndoRedo: () => void;
  
  // Actions - API Integration
  fetchLocations: () => Promise<void>;
  fetchStorageUnits: (locationId?: string) => Promise<void>;
  fetchStorageZones: (locationId?: string) => Promise<void>;
  fetchBookings: (filters?: StorageFilter) => Promise<void>;
  fetchAnalytics: (locationId?: string) => Promise<void>;
  fetchKPIs: (locationId?: string) => Promise<void>;
  
  // Actions - CRUD Operations
  createLocation: (location: Omit<StorageLocation, 'id'>) => Promise<ApiResponse<StorageLocation>>;
  createStorageUnit: (unit: Omit<StorageUnit, 'id'>) => Promise<ApiResponse<StorageUnit>>;
  createBooking: (booking: Omit<StorageBooking, 'id'>) => Promise<ApiResponse<StorageBooking>>;
  
  updateLocationById: (id: string, updates: Partial<StorageLocation>) => Promise<ApiResponse<StorageLocation>>;
  updateStorageUnitById: (id: string, updates: Partial<StorageUnit>) => Promise<ApiResponse<StorageUnit>>;
  updateBookingById: (id: string, updates: Partial<StorageBooking>) => Promise<ApiResponse<StorageBooking>>;
  
  deleteLocationById: (id: string) => Promise<ApiResponse<void>>;
  deleteStorageUnitById: (id: string) => Promise<ApiResponse<void>>;
  deleteBookingById: (id: string) => Promise<ApiResponse<void>>;
  
  // Actions - Real-time Updates
  subscribeToLocation: (locationId: string) => void;
  unsubscribeFromLocation: (locationId: string) => void;
  handleRealTimeUpdate: (update: any) => void;
  
  // Actions - Utility
  reset: () => void;
  exportData: (type: 'LOCATIONS' | 'UNITS' | 'BOOKINGS' | 'ANALYTICS') => void;
  importData: (data: any, type: string) => Promise<void>;
}

// Initial State
const initialState = {
  // Core Data
  locations: [],
  storageUnits: [],
  storageZones: [],
  storageMaps: [],
  bookings: [],
  users: [],
  
  // Analytics
  analytics: null,
  operationalKPIs: null,
  financialKPIs: null,
  
  // UI State
  selectedLocation: null,
  selectedUnit: null,
  selectedZone: null,
  viewMode: 'GRID' as const,
  filters: {},
  locationFilters: {},
  
  // Loading States
  isLoading: false,
  isUpdating: false,
  isCreating: false,
  isDeleting: false,
  
  // Error States
  error: null,
  lastError: null,
  
  // Real-time Data
  lastUpdated: null,
  activeUsers: 0,
  recentChanges: [],
  alerts: [],
  
  // Drag and Drop State
  isDragging: false,
  draggedUnit: null,
  dragPreview: null,
  undoStack: [],
  redoStack: [],
};

// Create Zustand Store
export const useStorageStore = create<StorageState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Location Management Actions
      setLocations: (locations) => set({ locations }),
      addLocation: (location) => set((state) => ({ 
        locations: [...state.locations, location] 
      })),
      updateLocation: (id, updates) => set((state) => ({
        locations: state.locations.map(loc => 
          loc.id === id ? { ...loc, ...updates } : loc
        )
      })),
      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter(loc => loc.id !== id)
      })),
      selectLocation: (id) => set({ selectedLocation: id }),
      
      // Storage Unit Management Actions
      setStorageUnits: (units) => set({ storageUnits: units }),
      addStorageUnit: (unit) => set((state) => ({ 
        storageUnits: [...state.storageUnits, unit] 
      })),
      updateStorageUnit: (id, updates) => set((state) => ({
        storageUnits: state.storageUnits.map(unit => 
          unit.id === id ? { ...unit, ...updates } : unit
        )
      })),
      deleteStorageUnit: (id) => set((state) => ({
        storageUnits: state.storageUnits.filter(unit => unit.id !== id)
      })),
      selectUnit: (id) => set({ selectedUnit: id }),
      moveUnit: (id, position) => set((state) => ({
        storageUnits: state.storageUnits.map(unit => 
          unit.id === id ? { ...unit, position } : unit
        )
      })),
      resizeUnit: (id, size) => set((state) => ({
        storageUnits: state.storageUnits.map(unit => 
          unit.id === id ? { ...unit, size } : unit
        )
      })),
      rotateUnit: (id, rotation) => set((state) => ({
        storageUnits: state.storageUnits.map(unit => 
          unit.id === id ? { ...unit, position: { ...unit.position, rotation } } : unit
        )
      })),
      
      // Storage Zone Management Actions
      setStorageZones: (zones) => set({ storageZones: zones }),
      addStorageZone: (zone) => set((state) => ({ 
        storageZones: [...state.storageZones, zone] 
      })),
      updateStorageZone: (id, updates) => set((state) => ({
        storageZones: state.storageZones.map(zone => 
          zone.id === id ? { ...zone, ...updates } : zone
        )
      })),
      deleteStorageZone: (id) => set((state) => ({
        storageZones: state.storageZones.filter(zone => zone.id !== id)
      })),
      selectZone: (id) => set({ selectedZone: id }),
      
      // Storage Map Management Actions
      setStorageMaps: (maps) => set({ storageMaps: maps }),
      updateStorageMap: (locationId, updates) => set((state) => ({
        storageMaps: state.storageMaps.map(map => 
          map.locationId === locationId ? { ...map, ...updates } : map
        )
      })),
      getStorageMap: (locationId) => {
        const state = get();
        return state.storageMaps.find(map => map.locationId === locationId) || null;
      },
      
      // Booking Management Actions
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({ 
        bookings: [...state.bookings, booking] 
      })),
      updateBooking: (id, updates) => set((state) => ({
        bookings: state.bookings.map(booking => 
          booking.id === id ? { ...booking, ...updates } : booking
        )
      })),
      deleteBooking: (id) => set((state) => ({
        bookings: state.bookings.filter(booking => booking.id !== id)
      })),
      
      // User Management Actions
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ 
        users: [...state.users, user] 
      })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...updates } : user
        )
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(user => user.id !== id)
      })),
      
      // Analytics Actions
      setAnalytics: (analytics) => set({ analytics }),
      setOperationalKPIs: (kpis) => set({ operationalKPIs: kpis }),
      setFinancialKPIs: (kpis) => set({ financialKPIs: kpis }),
      
      // UI State Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),
      setLocationFilters: (filters) => set((state) => ({ 
        locationFilters: { ...state.locationFilters, ...filters } 
      })),
      clearFilters: () => set({ filters: {}, locationFilters: {} }),
      
      // Loading State Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setUpdating: (updating) => set({ isUpdating: updating }),
      setCreating: (creating) => set({ isCreating: creating }),
      setDeleting: (deleting) => set({ isDeleting: deleting }),
      
      // Error Handling Actions
      setError: (error) => set({ error, lastError: error }),
      clearError: () => set({ error: null }),
      
      // Real-time Data Actions
      setLastUpdated: (date) => set({ lastUpdated: date }),
      setActiveUsers: (count) => set({ activeUsers: count }),
      addRecentChange: (change) => set((state) => ({
        recentChanges: [change, ...state.recentChanges.slice(0, 49)] // Keep last 50
      })),
      addAlert: (alert) => set((state) => ({
        alerts: [alert, ...state.alerts]
      })),
      resolveAlert: (alertId) => set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      })),
      
      // Drag and Drop Actions
      setDragging: (dragging) => set({ isDragging: dragging }),
      setDraggedUnit: (unitId) => set({ draggedUnit: unitId }),
      setDragPreview: (preview) => set({ dragPreview: preview }),
      addToUndoStack: (action) => set((state) => ({
        undoStack: [...state.undoStack, action],
        redoStack: [] // Clear redo stack when new action is added
      })),
      addToRedoStack: (action) => set((state) => ({
        redoStack: [...state.redoStack, action]
      })),
      undo: () => {
        const state = get();
        if (state.undoStack.length > 0) {
          const lastAction = state.undoStack[state.undoStack.length - 1];
          const newUndoStack = state.undoStack.slice(0, -1);
          set({
            undoStack: newUndoStack,
            redoStack: [...state.redoStack, lastAction]
          });
          // Apply undo action
          // This would need to be implemented based on the action type
        }
      },
      redo: () => {
        const state = get();
        if (state.redoStack.length > 0) {
          const lastAction = state.redoStack[state.redoStack.length - 1];
          const newRedoStack = state.redoStack.slice(0, -1);
          set({
            redoStack: newRedoStack,
            undoStack: [...state.undoStack, lastAction]
          });
          // Apply redo action
          // This would need to be implemented based on the action type
        }
      },
      clearUndoRedo: () => set({ undoStack: [], redoStack: [] }),
      
      // API Integration Actions (TODO: Replace with real API calls)
      fetchLocations: async () => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          set({ locations: [], isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch locations', isLoading: false });
        }
      },
      
      fetchStorageUnits: async (locationId) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          set({ storageUnits: [], isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch storage units', isLoading: false });
        }
      },
      
      fetchStorageZones: async (locationId) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          set({ storageZones: [], isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch storage zones', isLoading: false });
        }
      },
      
      fetchBookings: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          set({ bookings: [], isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch bookings', isLoading: false });
        }
      },
      
      fetchAnalytics: async (locationId) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockAnalytics: StorageAnalytics = {
            totalUnits: 100,
            occupiedUnits: 75,
            availableUnits: 25,
            utilizationRate: 75,
            revenuePerUnit: 150,
            totalRevenue: 11250,
            averageOccupancy: 85,
            turnoverRate: 12
          };
          set({ analytics: mockAnalytics, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch analytics', isLoading: false });
        }
      },
      
      fetchKPIs: async (locationId) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          set({ 
            operationalKPIs: null, 
            financialKPIs: null, 
            isLoading: false 
          });
        } catch (error) {
          set({ error: 'Failed to fetch KPIs', isLoading: false });
        }
      },
      
      // CRUD Operations (Mock implementations)
      createLocation: async (location) => {
        set({ isCreating: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const newLocation: StorageLocation = {
            ...location,
            id: `loc_${Date.now()}`
          };
          set((state) => ({ 
            locations: [...state.locations, newLocation], 
            isCreating: false 
          }));
          return { success: true, data: newLocation };
        } catch (error) {
          set({ error: 'Failed to create location', isCreating: false });
          return { success: false, error: 'Failed to create location' };
        }
      },
      
      createStorageUnit: async (unit) => {
        set({ isCreating: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const newUnit: StorageUnit = {
            ...unit,
            id: `unit_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          set((state) => ({ 
            storageUnits: [...state.storageUnits, newUnit], 
            isCreating: false 
          }));
          return { success: true, data: newUnit };
        } catch (error) {
          set({ error: 'Failed to create storage unit', isCreating: false });
          return { success: false, error: 'Failed to create storage unit' };
        }
      },
      
      createBooking: async (booking) => {
        set({ isCreating: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const newBooking: StorageBooking = {
            ...booking,
            id: `booking_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          set((state) => ({ 
            bookings: [...state.bookings, newBooking], 
            isCreating: false 
          }));
          return { success: true, data: newBooking };
        } catch (error) {
          set({ error: 'Failed to create booking', isCreating: false });
          return { success: false, error: 'Failed to create booking' };
        }
      },
      
      updateLocationById: async (id, updates) => {
        set({ isUpdating: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set((state) => ({
            locations: state.locations.map(loc => 
              loc.id === id ? { ...loc, ...updates, updatedAt: new Date() } : loc
            ),
            isUpdating: false
          }));
          return { success: true };
        } catch (error) {
          set({ error: 'Failed to update location', isUpdating: false });
          return { success: false, error: 'Failed to update location' };
        }
      },
      
      updateStorageUnitById: async (id, updates) => {
        set({ isUpdating: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set((state) => ({
            storageUnits: state.storageUnits.map(unit => 
              unit.id === id ? { ...unit, ...updates, updatedAt: new Date() } : unit
            ),
            isUpdating: false
          }));
          return { success: true };
        } catch (error) {
          set({ error: 'Failed to update storage unit', isUpdating: false });
          return { success: false, error: 'Failed to update storage unit' };
        }
      },
      
      updateBookingById: async (id, updates) => {
        set({ isUpdating: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set((state) => ({
            bookings: state.bookings.map(booking => 
              booking.id === id ? { ...booking, ...updates, updatedAt: new Date() } : booking
            ),
            isUpdating: false
          }));
          return { success: true };
        } catch (error) {
          set({ error: 'Failed to update booking', isUpdating: false });
          return { success: false, error: 'Failed to update booking' };
        }
      },
      
      deleteLocationById: async (id) => {
        set({ isDeleting: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set((state) => ({
            locations: state.locations.filter(loc => loc.id !== id),
            isDeleting: false
          }));
          return { success: true };
        } catch (error) {
          set({ error: 'Failed to delete location', isDeleting: false });
          return { success: false, error: 'Failed to delete location' };
        }
      },
      
      deleteStorageUnitById: async (id) => {
        set({ isDeleting: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set((state) => ({
            storageUnits: state.storageUnits.filter(unit => unit.id !== id),
            isDeleting: false
          }));
          return { success: true };
        } catch (error) {
          set({ error: 'Failed to delete storage unit', isDeleting: false });
          return { success: false, error: 'Failed to delete storage unit' };
        }
      },
      
      deleteBookingById: async (id) => {
        set({ isDeleting: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set((state) => ({
            bookings: state.bookings.filter(booking => booking.id !== id),
            isDeleting: false
          }));
          return { success: true };
        } catch (error) {
          set({ error: 'Failed to delete booking', isDeleting: false });
          return { success: false, error: 'Failed to delete booking' };
        }
      },
      
      // Real-time Updates (Mock implementations)
      subscribeToLocation: (locationId) => {
        console.log(`Subscribed to location: ${locationId}`);
        // In real implementation, this would establish WebSocket connection
      },
      
      unsubscribeFromLocation: (locationId) => {
        console.log(`Unsubscribed from location: ${locationId}`);
        // In real implementation, this would close WebSocket connection
      },
      
      handleRealTimeUpdate: (update) => {
        set((state) => ({
          recentChanges: [update, ...state.recentChanges.slice(0, 49)],
          lastUpdated: new Date()
        }));
      },
      
      // Utility Actions
      reset: () => set(initialState),
      
      exportData: (type) => {
        const state = get();
        let data;
        switch (type) {
          case 'LOCATIONS':
            data = state.locations;
            break;
          case 'UNITS':
            data = state.storageUnits;
            break;
          case 'BOOKINGS':
            data = state.bookings;
            break;
          case 'ANALYTICS':
            data = {
              analytics: state.analytics,
              operationalKPIs: state.operationalKPIs,
              financialKPIs: state.financialKPIs
            };
            break;
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      
      importData: async (data, type) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          switch (type) {
            case 'LOCATIONS':
              set({ locations: data, isLoading: false });
              break;
            case 'UNITS':
              set({ storageUnits: data, isLoading: false });
              break;
            case 'BOOKINGS':
              set({ bookings: data, isLoading: false });
              break;
            default:
              set({ error: 'Invalid import type', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to import data', isLoading: false });
        }
      },
    }),
    {
      name: 'storage-store',
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        selectedUnit: state.selectedUnit,
        selectedZone: state.selectedZone,
        viewMode: state.viewMode,
        filters: state.filters,
        locationFilters: state.locationFilters,
        undoStack: state.undoStack,
        redoStack: state.redoStack,
      }),
    }
  )
);

// Selector Hooks
export const useStorageLocations = () => useStorageStore((state) => state.locations);
export const useStorageUnits = () => useStorageStore((state) => state.storageUnits);
export const useStorageZones = () => useStorageStore((state) => state.storageZones);
export const useStorageBookings = () => useStorageStore((state) => state.bookings);
export const useStorageUsers = () => useStorageStore((state) => state.users);

export const useStorageAnalytics = () => useStorageStore((state) => state.analytics);
export const useOperationalKPIs = () => useStorageStore((state) => state.operationalKPIs);
export const useFinancialKPIs = () => useStorageStore((state) => state.financialKPIs);

export const useSelectedLocation = () => useStorageStore((state) => state.selectedLocation);
export const useSelectedUnit = () => useStorageStore((state) => state.selectedUnit);
export const useSelectedZone = () => useStorageStore((state) => state.selectedZone);
export const useViewMode = () => useStorageStore((state) => state.viewMode);

export const useStorageLoading = () => useStorageStore((state) => state.isLoading);
export const useStorageUpdating = () => useStorageStore((state) => state.isUpdating);
export const useStorageCreating = () => useStorageStore((state) => state.isCreating);
export const useStorageDeleting = () => useStorageStore((state) => state.isDeleting);

export const useStorageError = () => useStorageStore((state) => state.error);
export const useStorageLastError = () => useStorageStore((state) => state.lastError);

export const useStorageRealTime = () => useStorageStore((state) => ({
  lastUpdated: state.lastUpdated,
  activeUsers: state.activeUsers,
  recentChanges: state.recentChanges,
  alerts: state.alerts,
}));

export const useStorageDragDrop = () => useStorageStore((state) => ({
  isDragging: state.isDragging,
  draggedUnit: state.draggedUnit,
  dragPreview: state.dragPreview,
  undoStack: state.undoStack,
  redoStack: state.redoStack,
}));

// Computed Selectors
export const useStorageUnitsByLocation = (locationId: string) => 
  useStorageStore((state) => state.storageUnits.filter(unit => unit.locationId === locationId));

export const useStorageZonesByLocation = (locationId: string) => 
  useStorageStore((state) => state.storageZones.filter(zone => zone.locationId === locationId));

export const useStorageBookingsByUnit = (unitId: string) => 
  useStorageStore((state) => state.bookings.filter(booking => booking.unitId === unitId));

export const useStorageUnitsByStatus = (status: string) => 
  useStorageStore((state) => state.storageUnits.filter(unit => unit.status === status));

export const useStorageUnitsByType = (type: string) => 
  useStorageStore((state) => state.storageUnits.filter(unit => unit.type === type));

export const useStorageCapacity = (locationId: string) => {
  const units = useStorageUnitsByLocation(locationId);
  const total = units.length;
  const available = units.filter(unit => unit.status === 'AVAILABLE').length;
  const occupied = units.filter(unit => unit.status === 'OCCUPIED').length;
  const reserved = units.filter(unit => unit.status === 'RESERVED').length;
  const maintenance = units.filter(unit => unit.status === 'MAINTENANCE').length;
  
  return {
    total,
    available,
    occupied,
    reserved,
    maintenance,
    utilizationRate: total > 0 ? ((total - available) / total) * 100 : 0
  };
}; 