import { MenuItem } from '@/types/menu';
import { UserRole } from '@/types/enums';
import { InterfaceConfig, UserContext } from './interfaceDetection';
import { RealTimeData } from '@/hooks/useRealTimeData';

// ===== FIELD WORKER MENU ITEMS =====
const fieldWorkerMenuItems: MenuItem[] = [
  {
    id: 'current_journey',
    label: 'Current Journey',
    icon: 'Truck',
    href: '/journey/current',
    badge: 'active',
    priority: 'high',
    mobileOnly: true,
    roles: ['DRIVER', 'MOVER']
  },
  {
    id: 'journey_steps',
    label: 'Journey Steps',
    icon: 'List',
    href: '/journey/steps',
    badge: null,
    priority: 'high',
    roles: ['DRIVER', 'MOVER']
  },
  {
    id: 'media_upload',
    label: 'Upload Media',
    icon: 'Camera',
    href: '/media/upload',
    badge: null,
    priority: 'medium',
    roles: ['DRIVER', 'MOVER']
  },
  {
    id: 'gps_tracking',
    label: 'GPS Tracking',
    icon: 'MapPin',
    href: '/gps',
    badge: null,
    priority: 'medium',
    roles: ['DRIVER', 'MOVER']
  },
  {
    id: 'crew_chat',
    label: 'Crew Chat',
    icon: 'MessageCircle',
    href: '/chat',
    badge: 'unread',
    priority: 'low',
    roles: ['DRIVER', 'MOVER']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    priority: 'low',
    roles: ['DRIVER', 'MOVER']
  }
];

// ===== MANAGEMENT MENU ITEMS =====
const managementMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    badge: null,
    priority: 'high',
    roles: ['DISPATCHER', 'MANAGER', 'ADMIN']
  },
  {
    id: 'journeys',
    label: 'Journey Management',
    icon: 'Truck',
    href: '/journeys',
    badge: 'active-journeys',
    priority: 'high',
    roles: ['DISPATCHER', 'MANAGER', 'ADMIN'],
    children: [
      { id: 'journey-list', label: 'All Journeys', href: '/journeys', icon: 'List' },
      { id: 'journey-create', label: 'Create Journey', href: '/journey/create', icon: 'Plus' },
      { id: 'journey-calendar', label: 'Calendar View', href: '/calendar', icon: 'Calendar' }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'Users',
    href: '/users',
    badge: null,
    priority: 'medium',
    roles: ['ADMIN'],
    children: [
      { id: 'user-list', label: 'All Users', href: '/users', icon: 'List' },
      { id: 'user-create', label: 'Create User', href: '/users/create', icon: 'Plus' },
      { id: 'roles', label: 'Role Management', href: '/users/roles', icon: 'Shield' }
    ]
  },
  {
    id: 'clients',
    label: 'Client Management',
    icon: 'Building2',
    href: '/clients',
    badge: null,
    priority: 'medium',
    roles: ['ADMIN'],
    children: [
      { id: 'client-list', label: 'All Clients', href: '/clients', icon: 'List' },
      { id: 'client-create', label: 'Create Client', href: '/clients/create', icon: 'Plus' },
      { id: 'locations', label: 'Locations', href: '/clients/locations', icon: 'MapPin' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    priority: 'medium',
    roles: ['DISPATCHER', 'MANAGER', 'ADMIN'],
    children: [
      { id: 'crew-list', label: 'All Crew', href: '/crew', icon: 'List' },
      { id: 'crew-schedule', label: 'Scheduling', href: '/crew/schedule', icon: 'Calendar' },
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance', icon: 'BarChart3' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: 'Shield',
    href: '/audit',
    badge: null,
    priority: 'medium',
    roles: ['MANAGER', 'ADMIN'],
    children: [
      { id: 'audit-logs', label: 'Audit Logs', href: '/audit', icon: 'FileText' },
      { id: 'compliance', label: 'Compliance', href: '/audit/compliance', icon: 'CheckCircle' },
      { id: 'reports', label: 'Reports', href: '/audit/reports', icon: 'BarChart3' }
    ]
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'MessageSquare',
    href: '/feedback',
    badge: 'new-feedback-count',
    priority: 'medium',
    roles: ['DISPATCHER', 'MANAGER', 'ADMIN'],
    children: [
      { id: 'feedback-list', label: 'All Feedback', href: '/feedback', icon: 'List' },
      { id: 'feedback-ratings', label: 'Ratings', href: '/feedback/ratings', icon: 'Star' },
      { id: 'feedback-nps', label: 'NPS Scores', href: '/feedback/nps', icon: 'TrendingUp' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    priority: 'medium',
    roles: ['DISPATCHER', 'MANAGER', 'ADMIN'],
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile', icon: 'Smartphone' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys', icon: 'Truck' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking', icon: 'MapPin' }
    ]
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    priority: 'low',
    roles: ['ADMIN'],
    children: [
      { id: 'general', label: 'General', href: '/settings/general', icon: 'Settings' },
      { id: 'security', label: 'Security', href: '/settings/security', icon: 'Shield' },
      { id: 'integrations', label: 'Integrations', href: '/settings/integrations', icon: 'Link' }
    ]
  }
];

// ===== SMART MENU GENERATION =====
export const generateSmartMenuItems = (
  userRole: UserRole,
  interfaceConfig: InterfaceConfig,
  userContext: UserContext,
  realTimeData?: RealTimeData
): MenuItem[] => {
  // Get base menu items based on role
  let baseItems: MenuItem[] = [];
  
  if (['DRIVER', 'MOVER'].includes(userRole)) {
    baseItems = fieldWorkerMenuItems;
  } else if (['DISPATCHER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    baseItems = managementMenuItems;
  }
  
  // Filter items based on interface configuration
  let filteredItems = baseItems.filter(item => {
    // Check role permissions
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }
    
    // Check interface type restrictions
    if (interfaceConfig.type === 'MOBILE_FIELD_OPS') {
      // Field workers on mobile see only journey-related items
      return item.id === 'current_journey' || 
             item.id === 'journey_steps' || 
             item.id === 'media_upload' || 
             item.id === 'gps_tracking' || 
             item.id === 'crew_chat' ||
             item.id === 'settings';
    }
    
    if (interfaceConfig.type === 'MOBILE_MANAGEMENT') {
      // Management on mobile see limited items
      return item.id === 'dashboard' || 
             item.id === 'journeys' || 
             item.id === 'crew' || 
             item.id === 'mobile' || 
             item.id === 'feedback' || 
             item.id === 'audit' || 
             item.id === 'settings';
    }
    
    if (interfaceConfig.type === 'DESKTOP_FIELD_OPS') {
      // Field workers on desktop see journey-focused items
      return item.id === 'current_journey' || 
             item.id === 'journey_steps' || 
             item.id === 'media_upload' || 
             item.id === 'gps_tracking' || 
             item.id === 'crew_chat' ||
             item.id === 'settings';
    }
    
    // Desktop management sees all items
    return true;
  });
  
  // Apply interface-specific filtering
  filteredItems = applyInterfaceFiltering(filteredItems, interfaceConfig);
  
  // Add contextual items based on user context and real-time data
  const contextualItems = getContextualItems(userContext, realTimeData);
  
  // Limit items based on interface configuration
  const maxItems = interfaceConfig.navigation.maxMenuItems;
  const priorityItems = interfaceConfig.navigation.priorityItems;
  
  // Sort by priority and limit
  const sortedItems = sortByPriority(filteredItems, priorityItems);
  const limitedItems = sortedItems.slice(0, maxItems);
  
  return [...limitedItems, ...contextualItems];
};

// ===== INTERFACE FILTERING =====
const applyInterfaceFiltering = (items: MenuItem[], config: InterfaceConfig): MenuItem[] => {
  return items.filter(item => {
    // Mobile-specific filtering
    if (config.layout.isMobileFirst) {
      // Remove complex nested menus on mobile
      if (item.children && item.children.length > 2) {
        return false;
      }
      
      // Prioritize touch-friendly items
      if (item.id === 'settings' && config.layout.compactMode) {
        return false;
      }
    }
    
    // Field operations filtering
    if (config.navigation.showJourneyOnly) {
      return item.id === 'current_journey' || 
             item.id === 'journey_steps' || 
             item.id === 'media_upload' || 
             item.id === 'gps_tracking' || 
             item.id === 'crew_chat';
    }
    
    // Management filtering
    if (config.navigation.showManagement) {
      return true; // Show all management items
    }
    
    return true;
  });
};

// ===== CONTEXTUAL ITEMS =====
const getContextualItems = (userContext: UserContext, realTimeData?: RealTimeData): MenuItem[] => {
  const contextualItems: MenuItem[] = [];
  
  // Add offline indicator if offline
  if (!userContext.isOnline) {
    contextualItems.push({
      id: 'offline_indicator',
      label: 'Offline Mode',
      icon: 'WifiOff',
      href: '#',
      badge: 'offline',
      priority: 'high',
      roles: ['DRIVER', 'MOVER', 'DISPATCHER', 'MANAGER', 'ADMIN']
    });
  }
  
  // Add active journey indicator
  if (userContext.hasActiveJourney) {
    contextualItems.push({
      id: 'active_journey_indicator',
      label: 'Active Journey',
      icon: 'Play',
      href: '/journey/current',
      badge: 'live',
      priority: 'high',
      roles: ['DRIVER', 'MOVER']
    });
  }
  
  // Add location indicator if GPS is available
  if (userContext.location.lat && userContext.location.lng) {
    contextualItems.push({
      id: 'location_indicator',
      label: 'Location Active',
      icon: 'MapPin',
      href: '/gps',
      badge: realTimeData?.locationUpdates ? realTimeData.locationUpdates.toString() : 'gps',
      priority: 'medium',
      roles: ['DRIVER', 'MOVER']
    });
  }

  // Add system alerts if any
  if (realTimeData?.systemAlerts && realTimeData.systemAlerts > 0) {
    contextualItems.push({
      id: 'system_alerts',
      label: 'System Alerts',
      icon: 'AlertTriangle',
      href: '/alerts',
      badge: realTimeData.systemAlerts.toString(),
      priority: 'high',
      roles: ['DRIVER', 'MOVER', 'DISPATCHER', 'MANAGER', 'ADMIN']
    });
  }

  // Add pending approvals for managers and admins
  if (realTimeData?.pendingApprovals && realTimeData.pendingApprovals > 0 && 
      ['MANAGER', 'ADMIN'].includes(userContext.role)) {
    contextualItems.push({
      id: 'pending_approvals',
      label: 'Pending Approvals',
      icon: 'Clock',
      href: '/approvals',
      badge: realTimeData.pendingApprovals.toString(),
      priority: 'high',
      roles: ['MANAGER', 'ADMIN']
    });
  }
  
  return contextualItems;
};

// ===== PRIORITY SORTING =====
const sortByPriority = (items: MenuItem[], priorityItems: string[]): MenuItem[] => {
  return items.sort((a, b) => {
    const aPriority = priorityItems.indexOf(a.id);
    const bPriority = priorityItems.indexOf(b.id);
    
    // Items in priority list come first
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    }
    
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    
    // Then sort by priority level
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aLevel = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
    const bLevel = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
    
    return aLevel - bLevel;
  });
};

// ===== BADGE GENERATION =====
export const generateMenuItemBadge = (
  itemId: string,
  userContext: UserContext,
  realData: {
    activeJourneys?: number;
    unreadMessages?: number;
    pendingAudits?: number;
    newFeedback?: number;
  }
): string | null => {
  switch (itemId) {
    case 'current_journey':
      return userContext.hasActiveJourney ? 'active' : null;
    
    case 'journeys':
      return realData.activeJourneys ? `${realData.activeJourneys}` : null;
    
    case 'crew_chat':
      return realData.unreadMessages ? `${realData.unreadMessages}` : null;
    
    case 'audit':
      return realData.pendingAudits ? `${realData.pendingAudits}` : null;
    
    case 'feedback':
      return realData.newFeedback ? `${realData.newFeedback}` : null;
    
    case 'mobile':
      return userContext.hasActiveJourney ? 'active' : null;
    
    default:
      return null;
  }
};

// ===== MENU VALIDATION =====
export const validateMenuItem = (item: MenuItem, userRole: UserRole): boolean => {
  // Check role permissions
  if (item.roles && !item.roles.includes(userRole)) {
    return false;
  }
  
  // Check required fields
  if (!item.id || !item.label || !item.href) {
    return false;
  }
  
  return true;
};

// ===== EXPORT UTILITIES =====
export const getMenuItemsByRole = (userRole: UserRole): MenuItem[] => {
  if (['DRIVER', 'MOVER'].includes(userRole)) {
    return fieldWorkerMenuItems;
  } else if (['DISPATCHER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    return managementMenuItems;
  }
  
  return [];
};

export const isMenuItemVisible = (
  item: MenuItem,
  userRole: UserRole,
  interfaceConfig: InterfaceConfig
): boolean => {
  // Check role permissions
  if (item.roles && !item.roles.includes(userRole)) {
    return false;
  }
  
  // Check interface type
  if (interfaceConfig.type === 'MOBILE_FIELD_OPS' && item.mobileOnly === false) {
    return false;
  }
  
  return true;
}; 