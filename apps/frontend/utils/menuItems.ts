import { MenuItem, UserRole } from '@/types/menu';

// Admin Menu (Full System Access)
const adminMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    badge: null,
    children: []
  },
  {
    id: 'journeys',
    label: 'Journey Management',
    icon: 'Truck',
    href: '/journeys',
    badge: null,
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
    children: [
      { id: 'user-list', label: 'All Users', href: '/users', icon: 'Settings' },
      { id: 'user-create', label: 'Create User', href: '/users/create', icon: 'Settings' },
      { id: 'roles', label: 'Role Management', href: '/users/roles', icon: 'Settings' }
    ]
  },
  {
    id: 'clients',
    label: 'Client Management',
    icon: 'Building2',
    href: '/clients',
    badge: null,
    children: [
      { id: 'client-list', label: 'All Clients', href: '/clients', icon: 'Settings' },
      { id: 'client-create', label: 'Create Client', href: '/clients/create', icon: 'Settings' },
      { id: 'locations', label: 'Locations', href: '/clients/locations', icon: 'Settings' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-list', label: 'All Crew', href: '/crew', icon: 'Settings' },
      { id: 'crew-schedule', label: 'Scheduling', href: '/crew/schedule', icon: 'Settings' },
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance', icon: 'Settings' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: 'Shield',
    href: '/audit',
    badge: null,
    children: [
      { id: 'audit-logs', label: 'Audit Logs', href: '/audit/logs', icon: 'Settings' },
      { id: 'compliance', label: 'Compliance', href: '/audit/compliance', icon: 'Settings' },
      { id: 'reports', label: 'Reports', href: '/audit/reports', icon: 'Settings' }
    ]
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'MessageSquare',
    href: '/feedback',
    badge: null,
    children: [
      { id: 'feedback-list', label: 'All Feedback', href: '/feedback', icon: 'Settings' },
      { id: 'feedback-ratings', label: 'Ratings', href: '/feedback/ratings', icon: 'Settings' },
      { id: 'feedback-nps', label: 'NPS Scores', href: '/feedback/nps', icon: 'Settings' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: null,
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile', icon: 'Settings' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys', icon: 'Settings' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking', icon: 'Settings' }
    ]
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'general', label: 'General', href: '/settings/general', icon: 'Settings' },
      { id: 'security', label: 'Security', href: '/settings/security', icon: 'Settings' },
      { id: 'integrations', label: 'Integrations', href: '/settings/integrations', icon: 'Settings' }
    ]
  }
];

// Dispatcher Menu (Journey Management Focus)
const dispatcherMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Operations Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    badge: null,
    children: []
  },
  {
    id: 'journeys',
    label: 'Journey Management',
    icon: 'Truck',
    href: '/journeys',
    badge: 'active-journeys-count',
    children: [
      { id: 'journey-list', label: 'My Journeys', href: '/journeys', icon: 'Settings' },
      { id: 'journey-create', label: 'Create Journey', href: '/journey/create', icon: 'Settings' },
      { id: 'journey-calendar', label: 'Calendar View', href: '/calendar', icon: 'Settings' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Assignment',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-list', label: 'Available Crew', href: '/crew', icon: 'Settings' },
      { id: 'crew-schedule', label: 'Schedule', href: '/crew/schedule', icon: 'Settings' }
    ]
  },
  {
    id: 'dispatch',
    label: 'Dispatch Center',
    icon: 'Radio',
    href: '/dispatch',
    badge: 'pending-assignments',
    children: [
      { id: 'active-journeys', label: 'Active Journeys', href: '/dispatch/active', icon: 'Settings' },
      { id: 'pending-journeys', label: 'Pending', href: '/dispatch/pending', icon: 'Settings' }
    ]
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'MessageSquare',
    href: '/feedback',
    badge: 'new-feedback-count',
    children: [
      { id: 'feedback-list', label: 'Recent Feedback', href: '/feedback', icon: 'Settings' },
      { id: 'feedback-ratings', label: 'Ratings', href: '/feedback/ratings', icon: 'Settings' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile', icon: 'Settings' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys', icon: 'Settings' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking', icon: 'Settings' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: 'FileText',
    href: '/audit',
    badge: null,
    children: [
      { id: 'audit-entries', label: 'My Actions', href: '/audit/entries', icon: 'Settings' }
    ]
  },
  {
    id: 'settings',
    label: 'My Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile', icon: 'Settings' },
      { id: 'preferences', label: 'Preferences', href: '/settings/preferences', icon: 'Settings' }
    ]
  }
];

// Driver Menu (Field Operations Focus)
const driverMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'My Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    badge: null,
    children: []
  },
  {
    id: 'my-journeys',
    label: 'My Journeys',
    icon: 'Truck',
    href: '/journeys',
    badge: 'active-journey-count',
    children: [
      { id: 'current-journey', label: 'Current Journey', href: '/journey/current', icon: 'Settings' },
      { id: 'journey-history', label: 'History', href: '/journeys/history', icon: 'Settings' }
    ]
  },
  {
    id: 'gps-tracking',
    label: 'GPS Tracking',
    icon: 'MapPin',
    href: '/gps',
    badge: null,
    children: [
      { id: 'live-tracking', label: 'Live Tracking', href: '/gps/live', icon: 'Settings' },
      { id: 'route-history', label: 'Route History', href: '/gps/history', icon: 'Settings' }
    ]
  },
  {
    id: 'media',
    label: 'Media Upload',
    icon: 'Camera',
    href: '/media',
    badge: null,
    children: [
      { id: 'upload-photos', label: 'Upload Photos', href: '/media/upload', icon: 'Settings' },
      { id: 'media-gallery', label: 'Gallery', href: '/media/gallery', icon: 'Settings' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile', icon: 'Settings' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys', icon: 'Settings' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking', icon: 'Settings' }
    ]
  },
  {
    id: 'crew-chat',
    label: 'Crew Chat',
    icon: 'MessageCircle',
    href: '/chat',
    badge: 'unread-messages',
    children: [
      { id: 'active-chats', label: 'Active Chats', href: '/chat', icon: 'Settings' },
      { id: 'chat-history', label: 'History', href: '/chat/history', icon: 'Settings' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile', icon: 'Settings' },
      { id: 'gps-settings', label: 'GPS Settings', href: '/settings/gps', icon: 'Settings' }
    ]
  }
];

// Mover Menu (Field Support Focus)
const moverMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'My Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    badge: null,
    children: []
  },
  {
    id: 'my-journeys',
    label: 'My Journeys',
    icon: 'Truck',
    href: '/journeys',
    badge: 'active-journey-count',
    children: [
      { id: 'current-journey', label: 'Current Journey', href: '/journey/current', icon: 'Settings' },
      { id: 'journey-history', label: 'History', href: '/journeys/history', icon: 'Settings' }
    ]
  },
  {
    id: 'media',
    label: 'Media Upload',
    icon: 'Camera',
    href: '/media',
    badge: null,
    children: [
      { id: 'upload-photos', label: 'Upload Photos', href: '/media/upload', icon: 'Settings' },
      { id: 'upload-videos', label: 'Upload Videos', href: '/media/videos', icon: 'Settings' },
      { id: 'media-gallery', label: 'Gallery', href: '/media/gallery', icon: 'Settings' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile', icon: 'Settings' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys', icon: 'Settings' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking', icon: 'Settings' }
    ]
  },
  {
    id: 'activities',
    label: 'Activity Log',
    icon: 'ClipboardList',
    href: '/activities',
    badge: null,
    children: [
      { id: 'log-activity', label: 'Log Activity', href: '/activities/log', icon: 'Settings' },
      { id: 'activity-history', label: 'History', href: '/activities/history', icon: 'Settings' }
    ]
  },
  {
    id: 'crew-chat',
    label: 'Crew Chat',
    icon: 'MessageCircle',
    href: '/chat',
    badge: 'unread-messages',
    children: [
      { id: 'active-chats', label: 'Active Chats', href: '/chat', icon: 'Settings' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile', icon: 'Settings' }
    ]
  }
];

// Manager Menu (Oversight Focus)
const managerMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Management Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    badge: null,
    children: []
  },
  {
    id: 'journeys',
    label: 'Journey Overview',
    icon: 'Truck',
    href: '/journeys',
    badge: 'pending-approvals',
    children: [
      { id: 'journey-list', label: 'All Journeys', href: '/journeys', icon: 'Settings' },
      { id: 'journey-calendar', label: 'Calendar View', href: '/calendar', icon: 'Settings' },
      { id: 'journey-reports', label: 'Reports', href: '/journeys/reports', icon: 'Settings' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: 'Users',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-list', label: 'All Crew', href: '/crew', icon: 'Settings' },
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance', icon: 'Settings' },
      { id: 'crew-schedule', label: 'Scheduling', href: '/crew/schedule', icon: 'Settings' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: 'BarChart3',
    href: '/reports',
    badge: null,
    children: [
      { id: 'operational-reports', label: 'Operational', href: '/reports/operational', icon: 'Settings' },
      { id: 'financial-reports', label: 'Financial', href: '/reports/financial', icon: 'Settings' },
      { id: 'performance-reports', label: 'Performance', href: '/reports/performance', icon: 'Settings' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile', icon: 'Settings' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys', icon: 'Settings' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking', icon: 'Settings' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: 'Shield',
    href: '/audit',
    badge: 'pending-audits',
    children: [
      { id: 'audit-verify', label: 'Verify Journeys', href: '/audit/verify', icon: 'Settings' },
      { id: 'audit-logs', label: 'Audit Logs', href: '/audit/logs', icon: 'Settings' }
    ]
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'MessageSquare',
    href: '/feedback',
    badge: 'new-feedback-count',
    children: [
      { id: 'feedback-overview', label: 'Overview', href: '/feedback', icon: 'Settings' },
      { id: 'feedback-ratings', label: 'Ratings', href: '/feedback/ratings', icon: 'Settings' },
      { id: 'feedback-nps', label: 'NPS Scores', href: '/feedback/nps', icon: 'Settings' }
    ]
  },
  {
    id: 'settings',
    label: 'Location Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'location-settings', label: 'Location', href: '/settings/location', icon: 'Settings' },
      { id: 'crew-settings', label: 'Crew Settings', href: '/settings/crew', icon: 'Settings' }
    ]
  }
];

// Auditor Menu (Compliance Focus)
const auditorMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Audit Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    badge: null,
    children: []
  },
  {
    id: 'audit',
    label: 'Audit Management',
    icon: 'Shield',
    href: '/audit',
    badge: 'pending-audits',
    children: [
      { id: 'audit-logs', label: 'Audit Logs', href: '/audit/logs', icon: 'Settings' },
      { id: 'audit-verify', label: 'Verify Journeys', href: '/audit/verify', icon: 'Settings' },
      { id: 'audit-reports', label: 'Audit Reports', href: '/audit/reports', icon: 'Settings' }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: 'CheckCircle',
    href: '/compliance',
    badge: 'compliance-alerts',
    children: [
      { id: 'compliance-overview', label: 'Overview', href: '/compliance', icon: 'Settings' },
      { id: 'compliance-reports', label: 'Reports', href: '/compliance/reports', icon: 'Settings' },
      { id: 'compliance-violations', label: 'Violations', href: '/compliance/violations', icon: 'Settings' }
    ]
  },
  {
    id: 'journeys',
    label: 'Journey Review',
    icon: 'Truck',
    href: '/journeys',
    badge: null,
    children: [
      { id: 'journey-audit', label: 'Audit Journeys', href: '/journeys/audit', icon: 'Settings' },
      { id: 'journey-history', label: 'History', href: '/journeys/history', icon: 'Settings' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Performance',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-scoreboard', label: 'Scoreboard', href: '/crew/scoreboard', icon: 'Settings' },
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance', icon: 'Settings' }
    ]
  },
  {
    id: 'reports',
    label: 'Compliance Reports',
    icon: 'FileText',
    href: '/reports',
    badge: null,
    children: [
      { id: 'compliance-reports', label: 'Compliance', href: '/reports/compliance', icon: 'Settings' },
      { id: 'audit-reports', label: 'Audit', href: '/reports/audit', icon: 'Settings' },
      { id: 'performance-reports', label: 'Performance', href: '/reports/performance', icon: 'Settings' }
    ]
  },
  {
    id: 'settings',
    label: 'Audit Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'audit-settings', label: 'Audit Rules', href: '/settings/audit', icon: 'Settings' },
      { id: 'compliance-settings', label: 'Compliance', href: '/settings/compliance', icon: 'Settings' }
    ]
  }
];

// Menu configuration map
const menuConfigs: Record<UserRole, MenuItem[]> = {
  ADMIN: adminMenuItems,
  DISPATCHER: dispatcherMenuItems,
  DRIVER: driverMenuItems,
  MOVER: moverMenuItems,
  MANAGER: managerMenuItems,
  AUDITOR: auditorMenuItems
};

export const getRoleBasedMenuItems = (role: UserRole): MenuItem[] => {
  return menuConfigs[role] || [];
};

export const hasMenuItemPermission = (
  item: MenuItem,
  user: any,
  client: any
): boolean => {
  // Check role-based access
  if (item.roles && !item.roles.includes(user.role)) {
    return false;
  }

  // Check specific permission
  if (item.permission && !hasPermission(user, item.permission)) {
    return false;
  }

  // Check client type restrictions
  if (item.clientTypes && !item.clientTypes.includes(client?.type)) {
    return false;
  }

  // Check location restrictions
  if (item.locations && !item.locations.includes(user.locationId)) {
    return false;
  }

  return true;
};

const hasPermission = (user: any, permission: string): boolean => {
  return user.permissions?.includes(permission) || false;
}; 