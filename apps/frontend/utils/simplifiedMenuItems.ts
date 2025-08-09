import { MenuItem } from '@/types/menu';

// ✅ SIMPLIFIED NAVIGATION - ONLY ESSENTIAL PAGES
// Dashboard + Journey Management + Crew Management

// Admin Menu (System Access)
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
      { id: 'journey-create', label: 'Create Journey', href: '/journey/create', icon: 'Plus' }
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
      { id: 'crew-schedule', label: 'Scheduling', href: '/crew/schedule' }
    ]
  }
];

// Dispatcher Menu (Journey Focus)
const dispatcherMenuItems: MenuItem[] = [
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
    badge: 'active-journeys-count',
    children: [
      { id: 'journey-list', label: 'My Journeys', href: '/journeys' },
      { id: 'journey-create', label: 'Create Journey', href: '/journey/create' }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: 'UserCheck',
    href: '/crew',
    badge: null,
    children: [
      { id: 'crew-list', label: 'Available Crew', href: '/crew' }
    ]
  }
];

// Driver Menu (Mobile Field)
const driverMenuItems: MenuItem[] = [
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
    label: 'My Journeys',
    icon: 'Truck',
    href: '/journeys',
    badge: 'active-journeys',
    children: []
  }
];

// Mover Menu (Mobile Field)
const moverMenuItems: MenuItem[] = [
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
    label: 'My Tasks',
    icon: 'Truck',
    href: '/journeys',
    badge: 'active-tasks',
    children: []
  }
];

// Manager Menu (Oversight)
const managerMenuItems: MenuItem[] = [
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
    badge: 'pending-approvals',
    children: [
      { id: 'journey-list', label: 'All Journeys', href: '/journeys' }
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
      { id: 'crew-performance', label: 'Performance', href: '/crew/performance' }
    ]
  }
];

// Auditor Menu (Read-Only)
const auditorMenuItems: MenuItem[] = [
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
    label: 'Journey Audit',
    icon: 'Truck',
    href: '/journeys',
    badge: null,
    children: []
  },
  {
    id: 'crew',
    label: 'Crew Audit',
    icon: 'Users',
    href: '/crew',
    badge: null,
    children: []
  }
];

// ✅ ROLE-BASED MENU MAPPING
export const getMenuItemsByRole = (role: string): MenuItem[] => {
  const normalizedRole = role?.toUpperCase();
  
  switch (normalizedRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return adminMenuItems;
    
    case 'DISPATCHER':
      return dispatcherMenuItems;
    
    case 'DRIVER':
      return driverMenuItems;
    
    case 'MOVER':
      return moverMenuItems;
    
    case 'MANAGER':
    case 'OPERATIONAL_MANAGER':
      return managerMenuItems;
    
    case 'AUDITOR':
      return auditorMenuItems;
    
    default:
      // Default to basic menu
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'LayoutDashboard',
          href: '/dashboard',
          badge: null,
          children: []
        }
      ];
  }
};

export default getMenuItemsByRole;