import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Journey, 
  JourneyEntry, 
  Media, 
  AssignedCrew, 
  JourneyStats, 
  JourneyTimelineEvent,
  CreateJourneyRequest,
  UpdateJourneyRequest,
  GetJourneysRequest,
  CreateJourneyEntryRequest,
  AssignCrewRequest
} from '@/types/journey';

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
  
  // API Actions (Mock implementations for now)
  fetchJourneys: (params?: GetJourneysRequest) => Promise<void>;
  createJourney: (data: CreateJourneyRequest) => Promise<Journey>;
  updateJourneyStatus: (id: string, status: Journey['status']) => Promise<void>;
  addJourneyEntry: (data: CreateJourneyEntryRequest) => Promise<JourneyEntry>;
  assignCrewMember: (data: AssignCrewRequest) => Promise<AssignedCrew>;
}

type JourneyStore = JourneyState & JourneyActions;

// Mock data for development
const mockJourneys: Journey[] = [
  {
    id: '1',
    locationId: 'loc1',
    clientId: 'client1',
    date: '2024-01-15T08:00:00Z',
    status: 'MORNING_PREP',
    truckNumber: 'T-001',
    moveSourceId: 'move1',
    startTime: '2024-01-15T08:30:00Z',
    endTime: '2024-01-15T16:00:00Z',
    notes: 'Residential move - 3 bedroom house',
    createdById: 'user1',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z'
  },
  {
    id: '2',
    locationId: 'loc1',
    clientId: 'client1',
    date: '2024-01-16T09:00:00Z',
    status: 'EN_ROUTE',
    truckNumber: 'T-002',
    moveSourceId: 'move2',
    startTime: '2024-01-16T09:15:00Z',
    notes: 'Office relocation - downtown',
    createdById: 'user1',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  }
];

const mockStats: JourneyStats = {
  total: 2,
  active: 1,
  completed: 1,
  onTime: 1,
  revenue: 2500
};

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      // State
      journeys: mockJourneys,
      currentJourney: null,
      journeyEntries: [],
      journeyMedia: [],
      assignedCrew: [],
      stats: mockStats,
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
      
      // API Actions (Real API implementations)
      fetchJourneys: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/journey/active`, {
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
            set({ journeys: data.data || [], isLoading: false });
          } else {
            throw new Error(data.message || 'Failed to fetch journeys');
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch journeys',
            isLoading: false 
          });
        }
      },
      
      createJourney: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/journey/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (result.success) {
            const newJourney = result.data;
            set(state => ({
              journeys: [...state.journeys, newJourney],
              isLoading: false
            }));
            return newJourney;
          } else {
            throw new Error(result.message || 'Failed to create journey');
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create journey',
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateJourneyStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/journey/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (result.success) {
            set(state => ({
              journeys: state.journeys.map(journey =>
                journey.id === id ? { ...journey, status, updatedAt: new Date().toISOString() } : journey
              ),
              isLoading: false
            }));
          } else {
            throw new Error(result.message || 'Failed to update journey status');
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update journey status',
            isLoading: false 
          });
        }
      },
      
      addJourneyEntry: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with real API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newEntry: JourneyEntry = {
            id: `entry_${Date.now()}`,
            journeyId: data.journeyId,
            createdBy: 'user1', // TODO: Get from auth
            type: data.type,
            data: data.data,
            tag: data.tag,
            timestamp: new Date().toISOString()
          };
          
          set(state => ({
            journeyEntries: [...state.journeyEntries, newEntry],
            isLoading: false
          }));
          
          return newEntry;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add journey entry',
            isLoading: false 
          });
          throw error;
        }
      },
      
      assignCrewMember: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with real API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newAssignment: AssignedCrew = {
            id: `crew_${Date.now()}`,
            journeyId: data.journeyId,
            userId: data.userId,
            role: data.role,
            assignedAt: new Date().toISOString()
          };
          
          set(state => ({
            assignedCrew: [...state.assignedCrew, newAssignment],
            isLoading: false
          }));
          
          return newAssignment;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to assign crew member',
            isLoading: false 
          });
          throw error;
        }
      }
    }),
    {
      name: 'journey-storage',
      storage: createJSONStorage(() => localStorage),
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