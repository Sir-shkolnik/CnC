import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  InterfaceConfig, 
  UserContext, 
  DeviceType, 
  getInterfaceConfig, 
  detectDeviceType,
  saveInterfacePreferences,
  loadInterfacePreferences
} from '@/utils/interfaceDetection';
import { UserRole } from '@/types/enums';

// ===== STATE INTERFACE =====
interface SmartNavigationState {
  // Interface Configuration
  interfaceConfig: InterfaceConfig | null;
  userContext: UserContext | null;
  deviceType: DeviceType;
  
  // Navigation State
  currentRoute: string;
  previousRoute: string;
  navigationHistory: string[];
  
  // User Preferences
  userPreferences: {
    compactMode: boolean;
    showQuickActions: boolean;
    autoRedirect: boolean;
    rememberInterface: boolean;
  };
  
  // Real-time State
  isOnline: boolean;
  hasActiveJourney: boolean;
  location: {
    lat?: number;
    lng?: number;
    accuracy?: number;
    timestamp?: number;
  };
  
  // Actions
  setInterfaceConfig: (config: InterfaceConfig) => void;
  updateUserContext: (context: Partial<UserContext>) => void;
  setDeviceType: (deviceType: DeviceType) => void;
  setCurrentRoute: (route: string) => void;
  navigateTo: (route: string) => void;
  goBack: () => void;
  updateLocation: (location: { lat?: number; lng?: number; accuracy?: number }) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setActiveJourney: (hasActiveJourney: boolean) => void;
  updateUserPreferences: (preferences: Partial<SmartNavigationState['userPreferences']>) => void;
  resetNavigation: () => void;
  
  // Computed Actions
  detectAndSetInterface: (userRole: UserRole) => void;
  savePreferences: () => void;
  loadPreferences: (userId: string) => void;
}

// ===== DEFAULT STATE =====
const defaultInterfaceConfig: InterfaceConfig = {
  type: 'DESKTOP_MANAGEMENT',
  navigation: {
    showFullMenu: true,
    showJourneyOnly: false,
    showManagement: true,
    showFieldOps: true,
    maxMenuItems: 12,
    priorityItems: ['dashboard', 'journeys', 'users', 'clients', 'crew', 'audit', 'feedback', 'mobile', 'settings']
  },
  features: {
    enableGPS: false,
    enableMediaCapture: false,
    enableOfflineSync: false,
    enableRealTimeUpdates: true,
    enableJourneyCreation: true,
    enableUserManagement: true,
    enableAuditLogs: true
  },
  layout: {
    isMobileFirst: false,
    showSidebar: true,
    showQuickActions: false,
    showStatusBar: false,
    compactMode: false
  }
};

const defaultUserContext: UserContext = {
  role: 'DISPATCHER',
  deviceType: 'desktop',
  isOnline: true,
  hasActiveJourney: false,
  location: {},
  permissions: []
};

const defaultUserPreferences = {
  compactMode: false,
  showQuickActions: true,
  autoRedirect: true,
  rememberInterface: true
};

// ===== STORE CREATION =====
export const useSmartNavigationStore = create<SmartNavigationState>()(
  persist(
    (set, get) => ({
      // Initial State
      interfaceConfig: null,
      userContext: null,
      deviceType: detectDeviceType(),
      currentRoute: '/',
      previousRoute: '/',
      navigationHistory: [],
      userPreferences: defaultUserPreferences,
      isOnline: navigator.onLine,
      hasActiveJourney: false,
      location: {},

      // ===== ACTIONS =====
      
      setInterfaceConfig: (config: InterfaceConfig) => {
        set({ interfaceConfig: config });
        
        // Save preferences if enabled
        const { userContext, userPreferences } = get();
        if (userPreferences.rememberInterface && userContext) {
          saveInterfacePreferences(userContext.role, config);
        }
      },

      updateUserContext: (context: Partial<UserContext>) => {
        set(state => ({
          userContext: state.userContext ? { ...state.userContext, ...context } : null
        }));
      },

      setDeviceType: (deviceType: DeviceType) => {
        set({ deviceType });
        
        // Update user context if it exists
        const { userContext } = get();
        if (userContext) {
          get().updateUserContext({ deviceType });
        }
      },

      setCurrentRoute: (route: string) => {
        set(state => ({
          previousRoute: state.currentRoute,
          currentRoute: route,
          navigationHistory: [...state.navigationHistory, route].slice(-10) // Keep last 10 routes
        }));
      },

      navigateTo: (route: string) => {
        const { setCurrentRoute } = get();
        setCurrentRoute(route);
        
        // Auto-redirect based on interface config
        const { interfaceConfig, userPreferences } = get();
        if (userPreferences.autoRedirect && interfaceConfig) {
          // Implement smart routing logic here
        }
      },

      goBack: () => {
        const { navigationHistory, setCurrentRoute } = get();
        if (navigationHistory.length > 1) {
          const previousRoute = navigationHistory[navigationHistory.length - 2];
          setCurrentRoute(previousRoute);
        }
      },

      updateLocation: (location: { lat?: number; lng?: number; accuracy?: number }) => {
        set(state => ({
          location: {
            ...state.location,
            ...location,
            timestamp: Date.now()
          }
        }));
        
        // Update user context
        get().updateUserContext({ location });
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        get().updateUserContext({ isOnline });
      },

      setActiveJourney: (hasActiveJourney: boolean) => {
        set({ hasActiveJourney });
        get().updateUserContext({ hasActiveJourney });
      },

      updateUserPreferences: (preferences: Partial<SmartNavigationState['userPreferences']>) => {
        set(state => ({
          userPreferences: { ...state.userPreferences, ...preferences }
        }));
      },

      resetNavigation: () => {
        set({
          currentRoute: '/',
          previousRoute: '/',
          navigationHistory: [],
          interfaceConfig: null,
          userContext: null
        });
      },

      // ===== COMPUTED ACTIONS =====

      detectAndSetInterface: (userRole: UserRole) => {
        const { deviceType, userContext, userPreferences } = get();
        
        // Create or update user context
        const context: UserContext = {
          role: userRole,
          deviceType,
          isOnline: navigator.onLine,
          hasActiveJourney: false,
          location: {},
          permissions: []
        };
        
        set({ userContext: context });
        
        // Load saved preferences if enabled
        let config: InterfaceConfig;
        if (userPreferences.rememberInterface) {
          const savedConfig = loadInterfacePreferences(userRole);
          if (savedConfig) {
            config = savedConfig;
          } else {
            config = getInterfaceConfig(userRole, deviceType, context);
          }
        } else {
          config = getInterfaceConfig(userRole, deviceType, context);
        }
        
        set({ interfaceConfig: config });
      },

      savePreferences: () => {
        const { userContext, interfaceConfig, userPreferences } = get();
        if (userContext && interfaceConfig && userPreferences.rememberInterface) {
          saveInterfacePreferences(userContext.role, interfaceConfig);
        }
      },

      loadPreferences: (userId: string) => {
        const savedConfig = loadInterfacePreferences(userId);
        if (savedConfig) {
          set({ interfaceConfig: savedConfig });
        }
      }
    }),
    {
      name: 'smart-navigation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        navigationHistory: state.navigationHistory,
        location: state.location
      })
    }
  )
);

// ===== SELECTORS =====
export const useInterfaceConfig = () => useSmartNavigationStore(state => state.interfaceConfig);
export const useUserContext = () => useSmartNavigationStore(state => state.userContext);
export const useDeviceType = () => useSmartNavigationStore(state => state.deviceType);
export const useCurrentRoute = () => useSmartNavigationStore(state => state.currentRoute);
export const useNavigationHistory = () => useSmartNavigationStore(state => state.navigationHistory);
export const useUserPreferences = () => useSmartNavigationStore(state => state.userPreferences);
export const useOnlineStatus = () => useSmartNavigationStore(state => state.isOnline);
export const useActiveJourney = () => useSmartNavigationStore(state => state.hasActiveJourney);
export const useLocation = () => useSmartNavigationStore(state => state.location);

// ===== UTILITY HOOKS =====
export const useIsFieldWorker = () => {
  const interfaceConfig = useInterfaceConfig();
  return interfaceConfig?.type === 'MOBILE_FIELD_OPS' || interfaceConfig?.type === 'DESKTOP_FIELD_OPS';
};

export const useIsManagement = () => {
  const interfaceConfig = useInterfaceConfig();
  return interfaceConfig?.type === 'MOBILE_MANAGEMENT' || interfaceConfig?.type === 'DESKTOP_MANAGEMENT';
};

export const useIsMobile = () => {
  const interfaceConfig = useInterfaceConfig();
  return interfaceConfig?.type === 'MOBILE_FIELD_OPS' || interfaceConfig?.type === 'MOBILE_MANAGEMENT';
};

export const useIsDesktop = () => {
  const interfaceConfig = useInterfaceConfig();
  return interfaceConfig?.type === 'DESKTOP_FIELD_OPS' || interfaceConfig?.type === 'DESKTOP_MANAGEMENT';
}; 