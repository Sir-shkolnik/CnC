import { create } from 'zustand';

interface Journey {
  id: string;
  status: string;
  truckNumber: string;
  date: string;
}

interface JourneyState {
  journeys: Journey[];
  isLoading: boolean;
}

interface JourneyActions {
  setJourneys: (journeys: Journey[]) => void;
  addJourney: (journey: Journey) => void;
  updateJourney: (id: string, updates: Partial<Journey>) => void;
}

type JourneyStore = JourneyState & JourneyActions;

// Mock data for development
const mockJourneys: Journey[] = [
  {
    id: '1',
    status: 'EN_ROUTE',
    truckNumber: 'TRK-2024-001',
    date: '2024-01-15'
  },
  {
    id: '2',
    status: 'COMPLETED',
    truckNumber: 'TRK-2024-002',
    date: '2024-01-14'
  },
  {
    id: '3',
    status: 'MORNING_PREP',
    truckNumber: 'TRK-2024-003',
    date: '2024-01-16'
  }
];

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  // State
  journeys: mockJourneys,
  isLoading: false,

  // Actions
  setJourneys: (journeys: Journey[]) => set({ journeys }),

  addJourney: (journey: Journey) => set(state => ({
    journeys: [...state.journeys, journey]
  })),

  updateJourney: (id: string, updates: Partial<Journey>) => set(state => ({
    journeys: state.journeys.map(journey =>
      journey.id === id ? { ...journey, ...updates } : journey
    )
  }))
})); 