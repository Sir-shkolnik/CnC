import { SuperAdminMenuItem, SuperAdminPermissions } from '@/types/superAdmin';

// Super Admin Menu Items
export const superAdminMenuItems: SuperAdminMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Super Admin Dashboard',
    icon: 'LayoutDashboard',
    href: '/super-admin/dashboard',
    badge: null,
    children: [],
    permission: 'VIEW_ALL_COMPANIES',
  },
  {
    id: 'companies',
    label: 'Company Management',
    icon: 'Building2',
    href: '/super-admin/companies',
    badge: null,
    children: [
      { 
        id: 'company-list', 
        label: 'All Companies', 
        href: '/super-admin/companies',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
      { 
        id: 'company-create', 
        label: 'Create Company', 
        href: '/super-admin/companies/create',
        badge: null,
        children: [],
        permission: 'CREATE_COMPANIES',
      },
      { 
        id: 'company-analytics', 
        label: 'Company Analytics', 
        href: '/super-admin/companies/analytics',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
      { 
        id: 'company-integrations', 
        label: 'External Integrations', 
        href: '/super-admin/companies',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
    ],
    permission: 'VIEW_ALL_COMPANIES',
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'Users',
    href: '/super-admin/users',
    badge: null,
    children: [
      { 
        id: 'user-list', 
        label: 'All Users', 
        href: '/super-admin/users',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_USERS',
      },
      { 
        id: 'user-create', 
        label: 'Create User', 
        href: '/super-admin/users/create',
        badge: null,
        children: [],
        permission: 'CREATE_USERS',
      },
      { 
        id: 'user-roles', 
        label: 'Role Management', 
        href: '/super-admin/users/roles',
        badge: null,
        children: [],
        permission: 'UPDATE_USERS',
      },
    ],
    permission: 'VIEW_ALL_USERS',
  },
  {
    id: 'locations',
    label: 'Location Management',
    icon: 'MapPin',
    href: '/super-admin/locations',
    badge: null,
    children: [
      { 
        id: 'location-list', 
        label: 'All Locations', 
        href: '/super-admin/locations',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_LOCATIONS',
      },
      { 
        id: 'location-create', 
        label: 'Create Location', 
        href: '/super-admin/locations/create',
        badge: null,
        children: [],
        permission: 'CREATE_LOCATIONS',
      },
      { 
        id: 'location-map', 
        label: 'Location Map', 
        href: '/super-admin/locations/map',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_LOCATIONS',
      },
    ],
    permission: 'VIEW_ALL_LOCATIONS',
  },
  {
    id: 'journeys',
    label: 'Journey Management',
    icon: 'Truck',
    href: '/super-admin/journeys',
    badge: null,
    children: [
      { 
        id: 'journey-list', 
        label: 'All Journeys', 
        href: '/super-admin/journeys',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_JOURNEYS',
      },
      { 
        id: 'journey-create', 
        label: 'Create Journey', 
        href: '/super-admin/journeys/create',
        badge: null,
        children: [],
        permission: 'CREATE_JOURNEYS',
      },
      { 
        id: 'journey-analytics', 
        label: 'Journey Analytics', 
        href: '/super-admin/journeys/analytics',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_JOURNEYS',
      },
    ],
    permission: 'VIEW_ALL_JOURNEYS',
  },
  {
    id: 'backup',
    label: 'Backup Management',
    icon: 'Database',
    href: '/super-admin/backup',
    badge: null,
    children: [
      { 
        id: 'backup-overview', 
        label: 'Backup Overview', 
        href: '/super-admin/backup',
        badge: null,
        children: [],
        permission: 'MANAGE_SYSTEM_SETTINGS',
      },
      { 
        id: 'backup-logs', 
        label: 'Backup Logs', 
        href: '/super-admin/backup/logs',
        badge: null,
        children: [],
        permission: 'VIEW_AUDIT_LOGS',
      },
      { 
        id: 'backup-settings', 
        label: 'Backup Settings', 
        href: '/super-admin/backup/settings',
        badge: null,
        children: [],
        permission: 'MANAGE_SYSTEM_SETTINGS',
      },
      { 
        id: 'backup-restore', 
        label: 'Restore & Recovery', 
        href: '/super-admin/backup/restore',
        badge: null,
        children: [],
        permission: 'MANAGE_SYSTEM_SETTINGS',
      },
    ],
    permission: 'MANAGE_SYSTEM_SETTINGS',
  },
  {
    id: 'smartmoving',
    label: 'SmartMoving Integration',
    icon: 'Zap',
    href: '/super-admin/smartmoving',
    badge: null,
    children: [
      { 
        id: 'smartmoving-dashboard', 
        label: 'Integration Dashboard', 
        href: '/super-admin/smartmoving',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
      { 
        id: 'smartmoving-jobs', 
        label: 'Job Management', 
        href: '/super-admin/smartmoving/jobs',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
      { 
        id: 'smartmoving-locations', 
        label: 'Location Management', 
        href: '/super-admin/smartmoving/locations',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
      { 
        id: 'smartmoving-sync', 
        label: 'Sync Configuration', 
        href: '/super-admin/smartmoving/sync',
        badge: null,
        children: [],
        permission: 'MANAGE_SYSTEM_SETTINGS',
      },
    ],
    permission: 'VIEW_ALL_COMPANIES',
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: 'Shield',
    href: '/super-admin/audit',
    badge: null,
    children: [
      { 
        id: 'audit-logs', 
        label: 'Audit Logs', 
        href: '/super-admin/audit/logs',
        badge: null,
        children: [],
        permission: 'VIEW_AUDIT_LOGS',
      },
      { 
        id: 'audit-reports', 
        label: 'Audit Reports', 
        href: '/super-admin/audit/reports',
        badge: null,
        children: [],
        permission: 'VIEW_AUDIT_LOGS',
      },
      { 
        id: 'compliance', 
        label: 'Compliance', 
        href: '/super-admin/audit/compliance',
        badge: null,
        children: [],
        permission: 'VIEW_AUDIT_LOGS',
      },
    ],
    permission: 'VIEW_AUDIT_LOGS',
  },
  {
    id: 'analytics',
    label: 'System Analytics',
    icon: 'BarChart3',
    href: '/super-admin/analytics',
    badge: null,
    children: [
      { 
        id: 'overview', 
        label: 'System Overview', 
        href: '/super-admin/analytics/overview',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
      { 
        id: 'performance', 
        label: 'Performance Metrics', 
        href: '/super-admin/analytics/performance',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
      { 
        id: 'revenue', 
        label: 'Revenue Analytics', 
        href: '/super-admin/analytics/revenue',
        badge: null,
        children: [],
        permission: 'VIEW_ALL_COMPANIES',
      },
    ],
    permission: 'VIEW_ALL_COMPANIES',
  },
  {
    id: 'export',
    label: 'Data Export',
    icon: 'Download',
    href: '/super-admin/export',
    badge: null,
    children: [
      { 
        id: 'export-users', 
        label: 'Export Users', 
        href: '/super-admin/export/users',
        badge: null,
        children: [],
        permission: 'EXPORT_DATA',
      },
      { 
        id: 'export-journeys', 
        label: 'Export Journeys', 
        href: '/super-admin/export/journeys',
        badge: null,
        children: [],
        permission: 'EXPORT_DATA',
      },
      { 
        id: 'export-audit', 
        label: 'Export Audit Logs', 
        href: '/super-admin/export/audit',
        badge: null,
        children: [],
        permission: 'EXPORT_DATA',
      },
    ],
    permission: 'EXPORT_DATA',
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: 'Settings',
    href: '/super-admin/settings',
    badge: null,
    children: [
      { 
        id: 'general-settings', 
        label: 'General Settings', 
        href: '/super-admin/settings/general',
        badge: null,
        children: [],
        permission: 'MANAGE_SYSTEM_SETTINGS',
      },
      { 
        id: 'security-settings', 
        label: 'Security Settings', 
        href: '/super-admin/settings/security',
        badge: null,
        children: [],
        permission: 'MANAGE_SYSTEM_SETTINGS',
      },
      { 
        id: 'user-settings', 
        label: 'User Settings', 
        href: '/super-admin/settings/users',
        badge: null,
        children: [],
        permission: 'MANAGE_SYSTEM_SETTINGS',
      },
    ],
    permission: 'MANAGE_SYSTEM_SETTINGS',
  },
];

// Function to filter menu items based on permissions
export const getFilteredSuperAdminMenuItems = (
  menuItems: SuperAdminMenuItem[],
  permissions: SuperAdminPermissions
): SuperAdminMenuItem[] => {
  return menuItems
    .filter(item => {
      // Check if user has permission for this menu item
      if (item.permission && !permissions[item.permission]) {
        return false;
      }
      
      // Filter children recursively
      if (item.children.length > 0) {
        const filteredChildren = getFilteredSuperAdminMenuItems(item.children, permissions);
        return filteredChildren.length > 0;
      }
      
      return true;
    })
    .map(item => ({
      ...item,
      children: item.children.length > 0 
        ? getFilteredSuperAdminMenuItems(item.children, permissions)
        : [],
    }));
};

// Function to check if user has permission for a specific menu item
export const hasSuperAdminMenuItemPermission = (
  item: SuperAdminMenuItem,
  permissions: SuperAdminPermissions
): boolean => {
  if (!item.permission) {
    return true;
  }
  
  return permissions[item.permission] || false;
};

// Function to get menu items for a specific super admin role
export const getRoleBasedSuperAdminMenuItems = (
  role: string,
  permissions: SuperAdminPermissions
): SuperAdminMenuItem[] => {
  let filteredItems = superAdminMenuItems;
  
  // Filter based on role
  switch (role) {
    case 'SUPER_ADMIN':
      // Full access - no filtering needed
      break;
    case 'COMPANY_ADMIN':
      // Remove system settings and some analytics
      filteredItems = superAdminMenuItems.filter(item => 
        !['settings'].includes(item.id)
      );
      break;
    case 'AUDITOR':
      // Read-only access
      filteredItems = superAdminMenuItems.filter(item => 
        ['dashboard', 'companies', 'users', 'locations', 'journeys', 'audit', 'analytics'].includes(item.id)
      );
      break;
    case 'SUPPORT_ADMIN':
      // Limited management access
      filteredItems = superAdminMenuItems.filter(item => 
        !['settings', 'export'].includes(item.id)
      );
      break;
    default:
      // No access
      return [];
  }
  
  // Apply permission-based filtering
  return getFilteredSuperAdminMenuItems(filteredItems, permissions);
}; 