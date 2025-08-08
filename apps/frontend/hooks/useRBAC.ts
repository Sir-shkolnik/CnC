/**
 * React Hooks for Role-Based Access Control (RBAC)
 * CISSP Compliant - Frontend permission validation
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import FrontendRBAC, { Permission, UserRole } from '@/lib/security/FrontendRBAC';
import { usePathname } from 'next/navigation';

export const useRBAC = () => {
  const { user } = useAuthStore();
  const pathname = usePathname();
  
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user?.role) return false;
    return FrontendRBAC.hasPermission(user.role as UserRole, permission);
  }, [user?.role]);
  
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!user?.role) return false;
    return FrontendRBAC.hasAnyPermission(user.role as UserRole, permissions);
  }, [user?.role]);
  
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!user?.role) return false;
    return FrontendRBAC.hasAllPermissions(user.role as UserRole, permissions);
  }, [user?.role]);
  
  const canAccessRoute = useCallback((route?: string): boolean => {
    if (!user?.role) return false;
    const targetRoute = route || pathname;
    return FrontendRBAC.canAccessRoute(user.role as UserRole, targetRoute);
  }, [user?.role, pathname]);
  
  const canManageRole = useCallback((targetRole: UserRole): boolean => {
    if (!user?.role) return false;
    return FrontendRBAC.canManageRole(user.role as UserRole, targetRole);
  }, [user?.role]);
  
  const getManageableRoles = useCallback((): UserRole[] => {
    if (!user?.role) return [];
    return FrontendRBAC.getManageableRoles(user.role as UserRole);
  }, [user?.role]);
  
  const getRolePermissions = useCallback((): Permission[] => {
    if (!user?.role) return [];
    return FrontendRBAC.getRolePermissions(user.role as UserRole);
  }, [user?.role]);
  
  const getRoleHierarchyLevel = useCallback((): number => {
    if (!user?.role) return 0;
    return FrontendRBAC.getRoleHierarchyLevel(user.role as UserRole);
  }, [user?.role]);
  
  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Route access
    canAccessRoute,
    
    // Role management
    canManageRole,
    getManageableRoles,
    
    // Role information
    getRolePermissions,
    getRoleHierarchyLevel,
    
    // Current user info
    userRole: user?.role as UserRole | undefined,
    isAuthenticated: !!user,
    
    // Utility functions
    getPermissionDescription: FrontendRBAC.getPermissionDescription
  };
};

export default useRBAC;
