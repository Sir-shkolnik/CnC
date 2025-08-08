/**
 * Frontend Role-Based Access Control (RBAC) System
 * CISSP Compliant - Implements least privilege principle
 */

export type Permission = 
  // System permissions
  | 'system:read' | 'system:write' | 'system:delete'
  
  // User management permissions
  | 'user:read' | 'user:write' | 'user:delete'
  
  // Company management permissions
  | 'company:read' | 'company:write' | 'company:delete'
  
  // Journey management permissions
  | 'journey:read' | 'journey:write' | 'journey:delete'
  
  // Client management permissions
  | 'client:read' | 'client:write' | 'client:delete'
  
  // Crew management permissions
  | 'crew:read' | 'crew:write' | 'crew:delete'
  
  // Audit permissions
  | 'audit:read' | 'audit:write'
  
  // Settings permissions
  | 'settings:read' | 'settings:write'
  
  // Reports permissions
  | 'reports:read' | 'reports:write'
  
  // Media permissions
  | 'media:read' | 'media:write' | 'media:delete'
  
  // GPS permissions
  | 'gps:read' | 'gps:write'
  
  // Storage permissions
  | 'storage:read' | 'storage:write' | 'storage:delete'
  
  // Booking permissions
  | 'booking:read' | 'booking:write' | 'booking:delete'
  
  // Backup management permissions
  | 'backup:read' | 'backup:write' | 'backup:delete' | 'backup:verify'
  
  // System management permissions
  | 'system:manage' | 'system:configure';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'DISPATCHER'
  | 'DRIVER'
  | 'MOVER'
  | 'AUDITOR'
  | 'STORAGE_MANAGER';

export class FrontendRBAC {
  private static readonly ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: [
      'system:read', 'system:write', 'system:delete',
      'user:read', 'user:write', 'user:delete',
      'company:read', 'company:write', 'company:delete',
      'journey:read', 'journey:write', 'journey:delete',
      'client:read', 'client:write', 'client:delete',
      'crew:read', 'crew:write', 'crew:delete',
      'audit:read', 'audit:write',
      'settings:read', 'settings:write',
      'reports:read', 'reports:write',
      'media:read', 'media:write', 'media:delete',
      'gps:read', 'gps:write',
      'storage:read', 'storage:write', 'storage:delete',
      'booking:read', 'booking:write', 'booking:delete',
      'backup:read', 'backup:write', 'backup:delete', 'backup:verify',
      'system:manage', 'system:configure'
    ],
    ADMIN: [
      'user:read', 'user:write',
      'journey:read', 'journey:write', 'journey:delete',
      'client:read', 'client:write',
      'crew:read', 'crew:write',
      'audit:read',
      'settings:read',
      'reports:read', 'reports:write',
      'media:read', 'media:write',
      'gps:read', 'gps:write',
      'storage:read', 'storage:write',
      'booking:read', 'booking:write'
    ],
    MANAGER: [
      'journey:read', 'journey:write',
      'crew:read', 'crew:write',
      'audit:read',
      'reports:read', 'reports:write',
      'media:read', 'media:write',
      'gps:read',
      'storage:read',
      'booking:read'
    ],
    DISPATCHER: [
      'journey:read', 'journey:write',
      'crew:read', 'crew:write',
      'client:read',
      'media:read', 'media:write',
      'gps:read', 'gps:write',
      'storage:read',
      'booking:read', 'booking:write'
    ],
    DRIVER: [
      'journey:read',
      'media:write',
      'gps:write',
      'storage:read'
    ],
    MOVER: [
      'journey:read',
      'media:write'
    ],
    AUDITOR: [
      'audit:read',
      'reports:read',
      'journey:read',
      'media:read'
    ],
    STORAGE_MANAGER: [
      'storage:read', 'storage:write', 'storage:delete',
      'booking:read', 'booking:write', 'booking:delete',
      'reports:read'
    ]
  };

  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = this.ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if a role has any of the specified permissions
   */
  static hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission));
  }

  /**
   * Check if a role has all of the specified permissions
   */
  static hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission));
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return this.ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Get all roles that have a specific permission
   */
  static getRolesWithPermission(permission: Permission): UserRole[] {
    return Object.entries(this.ROLE_PERMISSIONS)
      .filter(([_, permissions]) => permissions.includes(permission))
      .map(([role]) => role as UserRole);
  }

  /**
   * Check if a role can access a specific route
   */
  static canAccessRoute(role: UserRole, route: string): boolean {
    const routePermissions = this.getRoutePermissions(route);
    return this.hasAnyPermission(role, routePermissions);
  }

  /**
   * Get required permissions for a route
   */
  private static getRoutePermissions(route: string): Permission[] {
    const routePermissionMap: Record<string, Permission[]> = {
      '/dashboard': ['journey:read'],
      '/journeys': ['journey:read'],
      '/journey/create': ['journey:write'],
      '/journey/[id]/edit': ['journey:write'],
      '/journey/[id]/delete': ['journey:delete'],
      '/users': ['user:read'],
      '/users/create': ['user:write'],
      '/users/[id]/edit': ['user:write'],
      '/users/[id]/delete': ['user:delete'],
      '/clients': ['client:read'],
      '/clients/create': ['client:write'],
      '/clients/[id]/edit': ['client:write'],
      '/clients/[id]/delete': ['client:delete'],
      '/crew': ['crew:read'],
      '/crew/create': ['crew:write'],
      '/crew/[id]/edit': ['crew:write'],
      '/crew/[id]/delete': ['crew:delete'],
      '/audit': ['audit:read'],
      '/audit/logs': ['audit:read'],
      '/audit/create': ['audit:write'],
      '/settings': ['settings:read'],
      '/settings/general': ['settings:write'],
      '/settings/security': ['settings:write'],
      '/reports': ['reports:read'],
      '/reports/create': ['reports:write'],
      '/storage': ['storage:read'],
      '/storage/create': ['storage:write'],
      '/storage/[id]/edit': ['storage:write'],
      '/storage/[id]/delete': ['storage:delete'],
      '/bookings': ['booking:read'],
      '/bookings/create': ['booking:write'],
      '/bookings/[id]/edit': ['booking:write'],
      '/bookings/[id]/delete': ['booking:delete'],
      '/mobile': ['journey:read'],
      '/mobile/journey': ['journey:read'],
      '/mobile/media': ['media:write'],
      '/mobile/gps': ['gps:write']
    };

    return routePermissionMap[route] || ['journey:read'];
  }

  /**
   * Get role hierarchy level
   */
  static getRoleHierarchyLevel(role: UserRole): number {
    const hierarchy: Record<UserRole, number> = {
      'SUPER_ADMIN': 8,
      'ADMIN': 7,
      'MANAGER': 6,
      'DISPATCHER': 5,
      'AUDITOR': 4,
      'STORAGE_MANAGER': 3,
      'DRIVER': 2,
      'MOVER': 1
    };

    return hierarchy[role] || 0;
  }

  /**
   * Check if a role can manage another role
   */
  static canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    return this.getRoleHierarchyLevel(managerRole) > this.getRoleHierarchyLevel(targetRole);
  }

  /**
   * Get all manageable roles for a given role
   */
  static getManageableRoles(role: UserRole): UserRole[] {
    const allRoles: UserRole[] = Object.keys(this.ROLE_PERMISSIONS) as UserRole[];
    return allRoles.filter(targetRole => this.canManageRole(role, targetRole));
  }

  /**
   * Validate role and permission combination
   */
  static validateRolePermission(role: UserRole, permission: Permission): boolean {
    if (!this.ROLE_PERMISSIONS[role]) {
      return false;
    }

    return this.hasPermission(role, permission);
  }

  /**
   * Get permission description
   */
  static getPermissionDescription(permission: Permission): string {
    const descriptions: Record<Permission, string> = {
      'system:read': 'Read system information',
      'system:write': 'Modify system settings',
      'system:delete': 'Delete system data',
      'user:read': 'View user information',
      'user:write': 'Create and edit users',
      'user:delete': 'Delete users',
      'company:read': 'View company information',
      'company:write': 'Create and edit companies',
      'company:delete': 'Delete companies',
      'journey:read': 'View journeys',
      'journey:write': 'Create and edit journeys',
      'journey:delete': 'Delete journeys',
      'client:read': 'View client information',
      'client:write': 'Create and edit clients',
      'client:delete': 'Delete clients',
      'crew:read': 'View crew information',
      'crew:write': 'Create and edit crew',
      'crew:delete': 'Delete crew',
      'audit:read': 'View audit logs',
      'audit:write': 'Create audit entries',
      'settings:read': 'View settings',
      'settings:write': 'Modify settings',
      'reports:read': 'View reports',
      'reports:write': 'Create reports',
      'media:read': 'View media files',
      'media:write': 'Upload media files',
      'media:delete': 'Delete media files',
      'gps:read': 'View GPS data',
      'gps:write': 'Update GPS data',
      'storage:read': 'View storage information',
      'storage:write': 'Manage storage',
      'storage:delete': 'Delete storage data',
      'booking:read': 'View bookings',
      'booking:write': 'Create and edit bookings',
      'booking:delete': 'Delete bookings',
      'backup:read': 'View backup files and status',
      'backup:write': 'Create and manage backups',
      'backup:delete': 'Delete backup files',
      'backup:verify': 'Verify backup integrity',
      'system:manage': 'Manage system operations',
      'system:configure': 'Configure system settings'
    };

    return descriptions[permission] || 'Unknown permission';
  }
}

export default FrontendRBAC;
