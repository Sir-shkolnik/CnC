/**
 * RBAC Protected Components
 * CISSP Compliant - Secure component rendering based on permissions
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import useRBAC from '@/hooks/useRBAC';
import { Permission } from '@/lib/security/FrontendRBAC';

interface RBACProtectedProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * RBAC Protected Component - Hides content based on permissions
 */
export const RBACProtected: React.FC<RBACProtectedProps> = ({ 
  permission, 
  fallback = null, 
  children 
}) => {
  const { hasPermission } = useRBAC();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * RBAC Protected Route - Redirects based on permissions
 */
export const RBACRoute: React.FC<RBACProtectedProps> = ({ 
  permission, 
  fallback = <div>Access Denied</div>, 
  children,
  redirectTo
}) => {
  const { hasPermission } = useRBAC();
  const router = useRouter();
  
  React.useEffect(() => {
    if (!hasPermission(permission)) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/unauthorized');
      }
    }
  }, [hasPermission, permission, redirectTo, router]);
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * RBAC Protected with Multiple Permissions
 */
export const RBACProtectedAny: React.FC<{
  permissions: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permissions, fallback = null, children }) => {
  const { hasAnyPermission } = useRBAC();
  
  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * RBAC Protected with All Permissions Required
 */
export const RBACProtectedAll: React.FC<{
  permissions: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permissions, fallback = null, children }) => {
  const { hasAllPermissions } = useRBAC();
  
  if (!hasAllPermissions(permissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * RBAC Protected Route Access
 */
export const RBACRouteProtected: React.FC<{
  route?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  redirectTo?: string;
}> = ({ route, fallback = <div>Access Denied</div>, children, redirectTo }) => {
  const { canAccessRoute } = useRBAC();
  const router = useRouter();
  
  React.useEffect(() => {
    if (!canAccessRoute(route)) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/unauthorized');
      }
    }
  }, [canAccessRoute, route, redirectTo, router]);
  
  if (!canAccessRoute(route)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * RBAC Role Management Component
 */
export const RBACRoleManager: React.FC<{
  targetRole: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ targetRole, fallback = null, children }) => {
  const { canManageRole } = useRBAC();
  
  if (!canManageRole(targetRole as any)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * RBAC Conditional Render Component
 */
export const RBACConditional: React.FC<{
  condition: (rbac: ReturnType<typeof useRBAC>) => boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ condition, fallback = null, children }) => {
  const rbac = useRBAC();
  
  if (!condition(rbac)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default RBACProtected;
