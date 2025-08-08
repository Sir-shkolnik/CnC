import { MenuItem } from '@/types/menu';
import { UserRole } from '@/types/enums';

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
      { id: 'user-list', label: 'All Users', href: '/users' },
      { id: 'user-create', label: 'Create User', href: '/users/create' },
      { id: 'roles', label: 'Role Management', href: '/users/roles' }
    ]
  },
  {
    id: 'clients',
    label: 'Client Management',
    icon: 'Building2',
    href: '/clients',
    badge: null,
    children: [
      { id: 'client-list', label: 'All Clients', href: '/clients' },
      { id: 'client-create', label: 'Create Client', href: '/clients/create' },
      { id: 'locations', label: 'Locations', href: '/clients/locations' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-list', label: 'All Crew', href: '/crew' },
      { id: 'crew-schedule', label: 'Scheduling', href: '/crew/schedule' },
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: 'Shield',
    href: '/audit',
    badge: null,
    children: [
      { id: 'audit-logs', label: 'Audit Logs', href: '/audit' },
      { id: 'compliance', label: 'Compliance', href: '/audit/compliance' },
      { id: 'reports', label: 'Reports', href: '/audit/reports' }
    ]
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'MessageSquare',
    href: '/feedback',
    badge: null,
    children: [
      { id: 'feedback-list', label: 'All Feedback', href: '/feedback' },
      { id: 'feedback-ratings', label: 'Ratings', href: '/feedback/ratings' },
      { id: 'feedback-nps', label: 'NPS Scores', href: '/feedback/nps' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: null,
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking' }
    ]
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'general', label: 'General', href: '/settings/general' },
      { id: 'security', label: 'Security', href: '/settings/security' },
      { id: 'integrations', label: 'Integrations', href: '/settings/integrations' }
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
      { id: 'journey-list', label: 'My Journeys', href: '/journeys' },
      { id: 'journey-create', label: 'Create Journey', href: '/journey/create' },
      { id: 'journey-calendar', label: 'Calendar View', href: '/calendar' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Assignment',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-list', label: 'Available Crew', href: '/crew' },
      { id: 'crew-schedule', label: 'Schedule', href: '/crew/schedule' }
    ]
  },
  {
    id: 'dispatch',
    label: 'Dispatch Center',
    icon: 'Radio',
    href: '/dispatch',
    badge: 'pending-assignments',
    children: [
      { id: 'active-journeys', label: 'Active Journeys', href: '/dispatch/active' },
      { id: 'pending-journeys', label: 'Pending', href: '/dispatch/pending' }
    ]
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'MessageSquare',
    href: '/feedback',
    badge: 'new-feedback-count',
    children: [
      { id: 'feedback-list', label: 'Recent Feedback', href: '/feedback' },
      { id: 'feedback-ratings', label: 'Ratings', href: '/feedback/ratings' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: 'FileText',
    href: '/audit',
    badge: null,
    children: [
      { id: 'audit-entries', label: 'My Actions', href: '/audit/entries' }
    ]
  },
  {
    id: 'settings',
    label: 'My Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' },
      { id: 'preferences', label: 'Preferences', href: '/settings/preferences' }
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
      { id: 'current-journey', label: 'Current Journey', href: '/journey/current' },
      { id: 'journey-history', label: 'History', href: '/journeys/history' }
    ]
  },
  {
    id: 'gps-tracking',
    label: 'GPS Tracking',
    icon: 'MapPin',
    href: '/gps',
    badge: null,
    children: [
      { id: 'live-tracking', label: 'Live Tracking', href: '/gps/live' },
      { id: 'route-history', label: 'Route History', href: '/gps/history' }
    ]
  },
  {
    id: 'media',
    label: 'Media Upload',
    icon: 'Camera',
    href: '/media',
    badge: null,
    children: [
      { id: 'upload-photos', label: 'Upload Photos', href: '/media/upload' },
      { id: 'media-gallery', label: 'Gallery', href: '/media/gallery' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking' }
    ]
  },
  {
    id: 'crew-chat',
    label: 'Crew Chat',
    icon: 'MessageCircle',
    href: '/chat',
    badge: 'unread-messages',
    children: [
      { id: 'active-chats', label: 'Active Chats', href: '/chat' },
      { id: 'chat-history', label: 'History', href: '/chat/history' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' },
      { id: 'gps-settings', label: 'GPS Settings', href: '/settings/gps' }
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
      { id: 'current-journey', label: 'Current Journey', href: '/journey/current' },
      { id: 'journey-history', label: 'History', href: '/journeys/history' }
    ]
  },
  {
    id: 'media',
    label: 'Media Upload',
    icon: 'Camera',
    href: '/media',
    badge: null,
    children: [
      { id: 'upload-photos', label: 'Upload Photos', href: '/media/upload' },
      { id: 'upload-videos', label: 'Upload Videos', href: '/media/videos' },
      { id: 'media-gallery', label: 'Gallery', href: '/media/gallery' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking' }
    ]
  },
  {
    id: 'activities',
    label: 'Activity Log',
    icon: 'ClipboardList',
    href: '/activities',
    badge: null,
    children: [
      { id: 'log-activity', label: 'Log Activity', href: '/activities/log' },
      { id: 'activity-history', label: 'History', href: '/activities/history' }
    ]
  },
  {
    id: 'crew-chat',
    label: 'Crew Chat',
    icon: 'MessageCircle',
    href: '/chat',
    badge: 'unread-messages',
    children: [
      { id: 'active-chats', label: 'Active Chats', href: '/chat' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' }
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
      { id: 'journey-list', label: 'All Journeys', href: '/journeys' },
      { id: 'journey-calendar', label: 'Calendar View', href: '/calendar' },
      { id: 'journey-reports', label: 'Reports', href: '/journeys/reports' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: 'Users',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-list', label: 'All Crew', href: '/crew' },
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance' },
      { id: 'crew-schedule', label: 'Scheduling', href: '/crew/schedule' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: 'BarChart3',
    href: '/reports',
    badge: null,
    children: [
      { id: 'operational-reports', label: 'Operational', href: '/reports/operational' },
      { id: 'financial-reports', label: 'Financial', href: '/reports/financial' },
      { id: 'performance-reports', label: 'Performance', href: '/reports/performance' }
    ]
  },
  {
    id: 'mobile',
    label: 'Field Operations',
    icon: 'Smartphone',
    href: '/mobile',
    badge: 'active-field-ops',
    children: [
      { id: 'mobile-app', label: 'Mobile App', href: '/mobile' },
      { id: 'mobile-journeys', label: 'Active Journeys', href: '/mobile/journeys' },
      { id: 'mobile-tracking', label: 'Live Tracking', href: '/mobile/tracking' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: 'Shield',
    href: '/audit',
    badge: 'pending-audits',
    children: [
      { id: 'audit-verify', label: 'Verify Journeys', href: '/audit/verify' },
      { id: 'audit-logs', label: 'Audit Logs', href: '/audit/logs' }
    ]
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'MessageSquare',
    href: '/feedback',
    badge: 'new-feedback-count',
    children: [
      { id: 'feedback-overview', label: 'Overview', href: '/feedback' },
      { id: 'feedback-ratings', label: 'Ratings', href: '/feedback/ratings' },
      { id: 'feedback-nps', label: 'NPS Scores', href: '/feedback/nps' }
    ]
  },
  {
    id: 'settings',
    label: 'Location Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'location-settings', label: 'Location', href: '/settings/location' },
      { id: 'crew-settings', label: 'Crew Settings', href: '/settings/crew' }
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
      { id: 'audit-logs', label: 'Audit Logs', href: '/audit' },
      { id: 'audit-verify', label: 'Verify Journeys', href: '/audit/verify' },
      { id: 'audit-reports', label: 'Audit Reports', href: '/audit/reports' }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: 'CheckCircle',
    href: '/compliance',
    badge: 'compliance-alerts',
    children: [
      { id: 'compliance-overview', label: 'Overview', href: '/compliance' },
      { id: 'compliance-reports', label: 'Reports', href: '/compliance/reports' },
      { id: 'compliance-violations', label: 'Violations', href: '/compliance/violations' }
    ]
  },
  {
    id: 'journeys',
    label: 'Journey Review',
    icon: 'Truck',
    href: '/journeys',
    badge: null,
    children: [
      { id: 'journey-audit', label: 'Audit Journeys', href: '/journeys/audit' },
      { id: 'journey-history', label: 'History', href: '/journeys/history' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Performance',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-scoreboard', label: 'Scoreboard', href: '/crew/scoreboard' },
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance' }
    ]
  },
  {
    id: 'reports',
    label: 'Compliance Reports',
    icon: 'FileText',
    href: '/reports',
    badge: null,
    children: [
      { id: 'compliance-reports', label: 'Compliance', href: '/reports/compliance' },
      { id: 'audit-reports', label: 'Audit', href: '/reports/audit' },
      { id: 'performance-reports', label: 'Performance', href: '/reports/performance' }
    ]
  },
  {
    id: 'settings',
    label: 'Audit Settings',
    icon: 'Settings',
    href: '/settings',
    badge: null,
    children: [
      { id: 'audit-settings', label: 'Audit Rules', href: '/settings/audit' },
      { id: 'compliance-settings', label: 'Compliance', href: '/settings/compliance' }
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