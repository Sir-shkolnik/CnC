export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string | null;
  children?: MenuItem[];
  permission?: Permission;
  roles?: UserRole[];
  clientTypes?: string[];
  locations?: string[];
}

export interface BadgeContext {
  activeJourneys: number;
  unreadMessages: number;
  pendingAudits: number;
  user: User;
}

export interface MenuState {
  isMobileMenuOpen: boolean;
  isDesktopMenuCollapsed: boolean;
  activeMenuItem: string | null;
  searchTerm: string;
}

export interface MenuActions {
  toggleMobileMenu: () => void;
  toggleDesktopMenu: () => void;
  setActiveMenuItem: (itemId: string) => void;
  setSearchTerm: (term: string) => void;
  closeAllMenus: () => void;
}

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'MOVER' | 'MANAGER' | 'AUDITOR';

export type Permission = 
  | 'journey.create'
  | 'journey.edit'
  | 'journey.delete'
  | 'journey.view'
  | 'user.create'
  | 'user.edit'
  | 'user.delete'
  | 'user.view'
  | 'client.create'
  | 'client.edit'
  | 'client.delete'
  | 'client.view'
  | 'crew.assign'
  | 'crew.view'
  | 'audit.view'
  | 'audit.create'
  | 'feedback.view'
  | 'feedback.create'
  | 'settings.edit'
  | 'settings.view';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId: string;
  locationId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions?: Permission[];
}

export interface Client {
  id: string;
  name: string;
  type: string;
  isFranchise: boolean;
  settings?: Record<string, any>;
} 