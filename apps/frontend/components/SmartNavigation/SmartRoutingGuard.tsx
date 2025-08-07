'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { InterfaceConfig } from '@/utils/interfaceDetection';

interface SmartRoutingGuardProps {
  children: React.ReactNode;
  interfaceConfig: InterfaceConfig;
}

export const SmartRoutingGuard: React.FC<SmartRoutingGuardProps> = ({ children, interfaceConfig }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  // Check if current route is allowed for this interface
  const isRouteAllowed = () => {
    if (!interfaceConfig || !user) return true;

    // Field worker restrictions
    if (interfaceConfig.type === 'MOBILE_FIELD_OPS' || interfaceConfig.type === 'DESKTOP_FIELD_OPS') {
      const allowedRoutes = [
        '/journey/current',
        '/journey/steps',
        '/media/upload',
        '/gps',
        '/chat',
        '/settings'
      ];
      
      return allowedRoutes.some(route => pathname.startsWith(route));
    }

    // Management restrictions
    if (interfaceConfig.type === 'MOBILE_MANAGEMENT') {
      const restrictedRoutes = [
        '/users',
        '/clients',
        '/audit'
      ];
      
      // Only ADMIN can access restricted routes
      if (user.role !== 'ADMIN') {
        return !restrictedRoutes.some(route => pathname.startsWith(route));
      }
    }

    return true;
  };

  // Redirect if route is not allowed
  useEffect(() => {
    if (!isRouteAllowed()) {
      if (interfaceConfig.type === 'MOBILE_FIELD_OPS' || interfaceConfig.type === 'DESKTOP_FIELD_OPS') {
        router.push('/journey/current');
      } else {
        router.push('/dashboard');
      }
    }
  }, [pathname, interfaceConfig, user, router]);

  if (!isRouteAllowed()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to appropriate interface...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 