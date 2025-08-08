import { UserRole } from '@/types/enums';

// ===== INTERFACE TYPES =====
export type InterfaceType = 
  | 'MOBILE_FIELD_OPS' 
  | 'MOBILE_MANAGEMENT' 
  | 'DESKTOP_FIELD_OPS' 
  | 'DESKTOP_MANAGEMENT';

export type DeviceType = 'mobile' | 'desktop';

// ===== INTERFACE CONFIGURATION =====
export interface InterfaceConfig {
  type: InterfaceType;
  navigation: NavigationConfig;
  features: FeatureConfig;
  layout: LayoutConfig;
}

export interface NavigationConfig {
  showFullMenu: boolean;
  showJourneyOnly: boolean;
  showManagement: boolean;
  showFieldOps: boolean;
  maxMenuItems: number;
  priorityItems: string[];
}

export interface FeatureConfig {
  enableGPS: boolean;
  enableMediaCapture: boolean;
  enableOfflineSync: boolean;
  enableRealTimeUpdates: boolean;
  enableJourneyCreation: boolean;
  enableUserManagement: boolean;
  enableAuditLogs: boolean;
}

export interface LayoutConfig {
  isMobileFirst: boolean;
  showSidebar: boolean;
  showQuickActions: boolean;
  showStatusBar: boolean;
  compactMode: boolean;
}

// ===== USER CONTEXT =====
export interface UserContext {
  role: UserRole;
  deviceType: DeviceType;
  isOnline: boolean;
  hasActiveJourney: boolean;
  location: {
    lat?: number;
    lng?: number;
    accuracy?: number;
  };
  permissions: string[];
}

// ===== INTERFACE DETECTION LOGIC =====
export const getInterfaceConfig = (
  userRole: UserRole, 
  deviceType: DeviceType,
  userContext: UserContext
): InterfaceConfig => {
  // Field workers (DRIVER, MOVER) get simplified interfaces
  const isFieldWorker = ['DRIVER', 'MOVER'].includes(userRole);
  
  // Management roles (DISPATCHER, MANAGER, ADMIN) get full interfaces
  const isManagement = ['DISPATCHER', 'MANAGER', 'ADMIN'].includes(userRole);
  
  if (deviceType === 'mobile') {
    if (isFieldWorker) {
      return getMobileFieldOpsConfig(userContext);
    } else if (isManagement) {
      return getMobileManagementConfig(userContext);
    }
  } else {
    if (isFieldWorker) {
      return getDesktopFieldOpsConfig(userContext);
    } else if (isManagement) {
      return getDesktopManagementConfig(userContext);
    }
  }
  
  // Default to desktop management
  return getDesktopManagementConfig(userContext);
};

// ===== MOBILE FIELD OPERATIONS CONFIG =====
const getMobileFieldOpsConfig = (context: UserContext): InterfaceConfig => ({
  type: 'MOBILE_FIELD_OPS',
  navigation: {
    showFullMenu: false,
    showJourneyOnly: true,
    showManagement: false,
    showFieldOps: true,
    maxMenuItems: 5,
    priorityItems: ['current_journey', 'journey_steps', 'media_upload', 'gps_tracking', 'crew_chat']
  },
  features: {
    enableGPS: true,
    enableMediaCapture: true,
    enableOfflineSync: true,
    enableRealTimeUpdates: true,
    enableJourneyCreation: false,
    enableUserManagement: false,
    enableAuditLogs: false
  },
  layout: {
    isMobileFirst: true,
    showSidebar: false,
    showQuickActions: true,
    showStatusBar: true,
    compactMode: true
  }
});

// ===== MOBILE MANAGEMENT CONFIG =====
const getMobileManagementConfig = (context: UserContext): InterfaceConfig => ({
  type: 'MOBILE_MANAGEMENT',
  navigation: {
    showFullMenu: true,
    showJourneyOnly: false,
    showManagement: true,
    showFieldOps: true,
    maxMenuItems: 8,
    priorityItems: ['dashboard', 'journeys', 'crew', 'mobile', 'feedback', 'audit', 'settings']
  },
  features: {
    enableGPS: context.role === 'DRIVER' || context.role === 'MOVER',
    enableMediaCapture: true,
    enableOfflineSync: true,
    enableRealTimeUpdates: true,
    enableJourneyCreation: true,
    enableUserManagement: context.role === 'ADMIN',
    enableAuditLogs: true
  },
  layout: {
    isMobileFirst: true,
    showSidebar: false,
    showQuickActions: true,
    showStatusBar: true,
    compactMode: false
  }
});

// ===== DESKTOP FIELD OPERATIONS CONFIG =====
const getDesktopFieldOpsConfig = (context: UserContext): InterfaceConfig => ({
  type: 'DESKTOP_FIELD_OPS',
  navigation: {
    showFullMenu: false,
    showJourneyOnly: true,
    showManagement: false,
    showFieldOps: true,
    maxMenuItems: 6,
    priorityItems: ['current_journey', 'journey_steps', 'media_upload', 'gps_tracking', 'crew_chat', 'settings']
  },
  features: {
    enableGPS: true,
    enableMediaCapture: true,
    enableOfflineSync: true,
    enableRealTimeUpdates: true,
    enableJourneyCreation: false,
    enableUserManagement: false,
    enableAuditLogs: false
  },
  layout: {
    isMobileFirst: false,
    showSidebar: true,
    showQuickActions: true,
    showStatusBar: true,
    compactMode: false
  }
});

// ===== DESKTOP MANAGEMENT CONFIG =====
const getDesktopManagementConfig = (context: UserContext): InterfaceConfig => ({
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
});

// ===== DEVICE DETECTION =====
export const detectDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  return width < 768 ? 'mobile' : 'desktop';
};

// ===== SMART ROUTING =====
export const getSmartRoute = (
  userRole: UserRole,
  deviceType: DeviceType,
  currentPath: string,
  hasActiveJourney: boolean
): string => {
  // Auto-redirect field workers to journey interface on mobile
  if (deviceType === 'mobile' && ['DRIVER', 'MOVER'].includes(userRole)) {
    if (currentPath === '/dashboard') {
      return hasActiveJourney ? '/journey/current' : '/mobile';
    }
    if (currentPath === '/journeys') {
      return hasActiveJourney ? '/journey/current' : '/mobile';
    }
  }
  
  // Auto-redirect management to dashboard on desktop
  if (deviceType === 'desktop' && ['DISPATCHER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    if (currentPath === '/mobile') {
      return '/dashboard';
    }
  }
  
  return currentPath;
};

// ===== INTERFACE VALIDATION =====
export const validateInterfaceConfig = (config: InterfaceConfig): boolean => {
  // Validate navigation config
  if (config.navigation.maxMenuItems < 1) return false;
  if (config.navigation.priorityItems.length > config.navigation.maxMenuItems) return false;
  
  // Validate feature config
  if (config.features.enableGPS && !config.features.enableRealTimeUpdates) return false;
  if (config.features.enableMediaCapture && !config.features.enableOfflineSync) return false;
  
  // Validate layout config
  if (config.layout.isMobileFirst && !config.layout.showQuickActions) return false;
  if (config.layout.showSidebar && config.layout.isMobileFirst) return false;
  
  return true;
};

// ===== INTERFACE PREFERENCES =====
export const saveInterfacePreferences = (userId: string, config: InterfaceConfig): void => {
  if (typeof window === 'undefined') return;
  
  const preferences = {
    userId,
    config,
    timestamp: new Date().toISOString()
  };
  
  // Use sessionStorage for interface preferences (less sensitive data)
  sessionStorage.setItem(`interface_preferences_${userId}`, JSON.stringify(preferences));
};

export const loadInterfacePreferences = (userId: string): InterfaceConfig | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = sessionStorage.getItem(`interface_preferences_${userId}`);
  if (!stored) return null;
  
  try {
    const preferences = JSON.parse(stored);
    return preferences.config;
  } catch {
    return null;
  }
};

// ===== EXPORT UTILITIES =====
export const isFieldWorkerInterface = (config: InterfaceConfig): boolean => {
  return config.type === 'MOBILE_FIELD_OPS' || config.type === 'DESKTOP_FIELD_OPS';
};

export const isManagementInterface = (config: InterfaceConfig): boolean => {
  return config.type === 'MOBILE_MANAGEMENT' || config.type === 'DESKTOP_MANAGEMENT';
};

export const isMobileInterface = (config: InterfaceConfig): boolean => {
  return config.type === 'MOBILE_FIELD_OPS' || config.type === 'MOBILE_MANAGEMENT';
};

export const isDesktopInterface = (config: InterfaceConfig): boolean => {
  return config.type === 'DESKTOP_FIELD_OPS' || config.type === 'DESKTOP_MANAGEMENT';
}; 