import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Journey Types
interface Journey {
  id: string;
  title?: string;
  truckNumber?: string;
  date: string;
  status: 'MORNING_PREP' | 'EN_ROUTE' | 'ONSITE' | 'COMPLETED' | 'AUDITED';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  startLocation?: string;
  endLocation?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  locationId?: string;
  clientId?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

interface JourneyEntry {
  id: string;
  journeyId: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  location?: string;
  userId?: string;
  metadata?: any;
}

interface Media {
  id: string;
  journeyId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy?: string;
  description?: string;
}

interface AssignedCrew {
  id: string;
  journeyId: string;
  userId: string;
  role: string;
  assignedAt: string;
  assignedBy?: string;
}

interface JourneyStats {
  total: number;
  active: number;
  completed: number;
  onTime: number;
  revenue: number;
}

interface JourneyTimelineEvent {
  id: string;
  journeyId: string;
  timestamp: string;
  event: string;
  description: string;
  user?: string;
}

// API Request Types
interface GetJourneysRequest {
  limit?: number;
  offset?: number;
  status?: string;
  locationId?: string;
}

interface CreateJourneyRequest {
  truckNumber: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  crewMembers?: string[];
}

interface CreateJourneyEntryRequest {
  journeyId: string;
  type: string;
  title: string;
  description?: string;
  location?: string;
}

interface AssignCrewRequest {
  journeyId: string;
  userId: string;
  role: string;
}

// Store State
interface JourneyState {
  journeys: Journey[];
  currentJourney: Journey | null;
  journeyEntries: JourneyEntry[];
  journeyMedia: Media[];
  assignedCrew: AssignedCrew[];
  stats: JourneyStats;
  timeline: JourneyTimelineEvent[];
  isLoading: boolean;
  error: string | null;
}

// Store Actions
interface JourneyActions {
  // Journey Management
  setJourneys: (journeys: Journey[]) => void;
  addJourney: (journey: Journey) => void;
  updateJourney: (id: string, updates: Partial<Journey>) => void;
  deleteJourney: (id: string) => void;
  setCurrentJourney: (journey: Journey | null) => void;
  
  // Journey Entries
  setJourneyEntries: (entries: JourneyEntry[]) => void;
  updateJourneyEntry: (id: string, updates: Partial<JourneyEntry>) => void;
  
  // Media Management
  setJourneyMedia: (media: Media[]) => void;
  addJourneyMedia: (media: Media) => void;
  removeJourneyMedia: (id: string) => void;
  
  // Crew Management
  setAssignedCrew: (crew: AssignedCrew[]) => void;
  assignCrew: (assignment: AssignedCrew) => void;
  removeCrewAssignment: (id: string) => void;
  
  // Statistics and Timeline
  setStats: (stats: JourneyStats) => void;
  setTimeline: (timeline: JourneyTimelineEvent[]) => void;
  
  // Loading and Error States
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // API Actions (ONLY REAL LGM DATA)
  fetchJourneys: (params?: GetJourneysRequest) => Promise<void>;
  fetchTodayJourneys: (location_id?: string) => Promise<void>;
  fetchTomorrowJourneys: (location_id?: string) => Promise<void>;
  triggerSmartMovingSync: () => Promise<void>;
  createJourney: (data: CreateJourneyRequest) => Promise<Journey>;
  updateJourneyStatus: (id: string, status: Journey['status']) => Promise<void>;
  addJourneyEntry: (data: CreateJourneyEntryRequest) => Promise<JourneyEntry>;
  assignCrewMember: (data: AssignCrewRequest) => Promise<AssignedCrew>;
}

type JourneyStore = JourneyState & JourneyActions;

// Initial state - NO DEMO DATA
const initialJourneys: Journey[] = [];
const initialStats: JourneyStats = {
  total: 0,
  active: 0,
  completed: 0,
  onTime: 0,
  revenue: 0
};

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      // State
      journeys: initialJourneys,
      currentJourney: null,
      journeyEntries: [],
      journeyMedia: [],
      assignedCrew: [],
      stats: initialStats,
      timeline: [],
      isLoading: false,
      error: null,

      // Actions
      setJourneys: (journeys) => set({ journeys }),
      
      addJourney: (journey) => set(state => ({
        journeys: [...state.journeys, journey]
      })),
      
      updateJourney: (id, updates) => set(state => ({
        journeys: state.journeys.map(journey =>
          journey.id === id ? { ...journey, ...updates, updatedAt: new Date().toISOString() } : journey
        )
      })),
      
      deleteJourney: (id) => set(state => ({
        journeys: state.journeys.filter(journey => journey.id !== id)
      })),
      
      setCurrentJourney: (journey) => set({ currentJourney: journey }),
      
      // Journey Entries
      setJourneyEntries: (entries) => set({ journeyEntries: entries }),
      
      updateJourneyEntry: (id, updates) => set(state => ({
        journeyEntries: state.journeyEntries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      })),
      
      // Media Management
      setJourneyMedia: (media) => set({ journeyMedia: media }),
      
      addJourneyMedia: (media) => set(state => ({
        journeyMedia: [...state.journeyMedia, media]
      })),
      
      removeJourneyMedia: (id) => set(state => ({
        journeyMedia: state.journeyMedia.filter(media => media.id !== id)
      })),
      
      // Crew Management
      setAssignedCrew: (crew) => set({ assignedCrew: crew }),
      
      assignCrew: (assignment) => set(state => ({
        assignedCrew: [...state.assignedCrew, assignment]
      })),
      
      removeCrewAssignment: (id) => set(state => ({
        assignedCrew: state.assignedCrew.filter(assignment => assignment.id !== id)
      })),
      
      // Statistics and Timeline
      setStats: (stats) => set({ stats }),
      
      setTimeline: (timeline) => set({ timeline }),
      
      // Loading and Error States
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // API Actions (ONLY REAL LGM DATA - NO DEMO DATA, NO FALLBACKS)
      fetchJourneys: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('access_token') || 
                       localStorage.getItem('auth-token') || 
                       document.cookie.split('auth-token=')[1]?.split(';')[0];
          
          if (!token) {
            throw new Error('No authentication token found');
          }

          // Use ONLY real LGM data endpoint - NO DEMO DATA
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/smartmoving-real/journeys/today`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.success) {
            console.log(`✅ Fetched ${data.journeys?.length || 0} REAL LGM journeys from database`);
            console.log('Data source:', data.dataSource); // Should show "LGM_DATABASE_REAL"
            
            set({ 
              journeys: data.journeys || [], 
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(data.message || 'Failed to fetch real LGM journeys');
          }
        } catch (error) {
          console.error('❌ Error fetching real LGM journeys:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch real LGM journeys' 
          });
        }
      },

      fetchTodayJourneys: async (location_id) => {
        // Use the same real data endpoint
        await get().fetchJourneys({ locationId: location_id });
      },

      fetchTomorrowJourneys: async (location_id) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('access_token') || 
                       localStorage.getItem('auth-token') || 
                       document.cookie.split('auth-token=')[1]?.split(';')[0];
          
          if (!token) {
            throw new Error('No authentication token found');
          }

          // Tomorrow's journeys would be a similar endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/smartmoving-real/journeys/tomorrow`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.success) {
            console.log(`✅ Fetched ${data.journeys?.length || 0} REAL LGM journeys for tomorrow`);
            set({ 
              journeys: data.journeys || [], 
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(data.message || 'Failed to fetch tomorrow\'s real LGM journeys');
          }
        } catch (error) {
          console.error('❌ Error fetching tomorrow\'s real LGM journeys:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch tomorrow\'s real LGM journeys' 
          });
        }
      },

      triggerSmartMovingSync: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('access_token') || 
                       localStorage.getItem('auth-token') || 
                       document.cookie.split('auth-token=')[1]?.split(';')[0];
          
          if (!token) {
            throw new Error('No authentication token found');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/smartmoving/sync/jobs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.success) {
            console.log('✅ SmartMoving sync triggered successfully');
            // Refresh journeys after sync
            await get().fetchJourneys();
          } else {
            throw new Error(data.message || 'Failed to trigger SmartMoving sync');
          }
        } catch (error) {
          console.error('❌ Error triggering SmartMoving sync:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to trigger SmartMoving sync' 
          });
        }
      },

      createJourney: async (data) => {
        // This would call real API to create journey
        throw new Error('Create journey not implemented - use SmartMoving integration');
      },

      updateJourneyStatus: async (id, status) => {
        // This would call real API to update journey status
        throw new Error('Update journey status not implemented - use SmartMoving integration');
      },

      addJourneyEntry: async (data) => {
        // This would call real API to add journey entry
        throw new Error('Add journey entry not implemented - use SmartMoving integration');
      },

      assignCrewMember: async (data) => {
        // This would call real API to assign crew member
        throw new Error('Assign crew member not implemented - use SmartMoving integration');
      }
    }),
    {
      name: 'journey-store',
      partialize: (state) => ({
        journeys: state.journeys,
        currentJourney: state.currentJourney,
        stats: state.stats
      }),
    }
  )
);

// Export selectors for better performance
export const useJourneys = () => useJourneyStore((state) => state.journeys);
export const useCurrentJourney = () => useJourneyStore((state) => state.currentJourney);
export const useJourneyStats = () => useJourneyStore((state) => state.stats);
export const useJourneyLoading = () => useJourneyStore((state) => state.isLoading);
export const useJourneyError = () => useJourneyStore((state) => state.error);