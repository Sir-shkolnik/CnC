'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSmartNavigationStore, useInterfaceConfig, useUserContext } from '@/stores/smartNavigationStore';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getSmartRoute } from '@/utils/interfaceDetection';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { MobileFieldOpsLayout } from './MobileFieldOpsLayout';
import { DesktopFieldOpsLayout } from './DesktopFieldOpsLayout';
import { SmartRoutingGuard } from './SmartRoutingGuard';

interface SmartNavigationProps {
  children: React.ReactNode;
}

export const SmartNavigation: React.FC<SmartNavigationProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { deviceType } = useDeviceDetection();
  
  // Smart navigation state
  const interfaceConfig = useInterfaceConfig();
  const userContext = useUserContext();
  const { 
    setCurrentRoute, 
    navigateTo, 
    updateUserContext,
    setOnlineStatus,
    setActiveJourney 
  } = useSmartNavigationStore();

  // Update current route when pathname changes
  useEffect(() => {
    setCurrentRoute(pathname);
  }, [pathname, setCurrentRoute]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  // Smart routing based on interface configuration
  useEffect(() => {
    if (!user || !interfaceConfig || !userContext) return;

    const smartRoute = getSmartRoute(
      user.role as any,
      deviceType,
      pathname,
      userContext.hasActiveJourney
    );

    if (smartRoute !== pathname) {
      router.push(smartRoute);
    }
  }, [user, interfaceConfig, userContext, deviceType, pathname, router]);

  // Don't render navigation for auth pages or if no user
  if (!isAuthenticated || !user || pathname.startsWith('/auth') || pathname === '/') {
    return <>{children}</>;
  }

  // Render appropriate layout based on interface configuration
  if (!interfaceConfig) {
    // Fallback to regular navigation while interface is being detected
    return <MainNavigation>{children}</MainNavigation>;
  }

  // Field worker interfaces
  if (interfaceConfig.type === 'MOBILE_FIELD_OPS') {
    return (
      <MobileFieldOpsLayout user={user} interfaceConfig={interfaceConfig}>
        <SmartRoutingGuard interfaceConfig={interfaceConfig}>
          {children}
        </SmartRoutingGuard>
      </MobileFieldOpsLayout>
    );
  }

  if (interfaceConfig.type === 'DESKTOP_FIELD_OPS') {
    return (
      <DesktopFieldOpsLayout user={user} interfaceConfig={interfaceConfig}>
        <SmartRoutingGuard interfaceConfig={interfaceConfig}>
          {children}
        </SmartRoutingGuard>
      </DesktopFieldOpsLayout>
    );
  }

  // Management interfaces
  if (interfaceConfig.type === 'MOBILE_MANAGEMENT') {
    return (
      <MainNavigation>
        <SmartRoutingGuard interfaceConfig={interfaceConfig}>
          {children}
        </SmartRoutingGuard>
      </MainNavigation>
    );
  }

  // Default to desktop management
  return (
    <MainNavigation>
      <SmartRoutingGuard interfaceConfig={interfaceConfig}>
        {children}
      </SmartRoutingGuard>
    </MainNavigation>
  );
};



// ===== INTERFACE STATUS INDICATOR =====
export const InterfaceStatusIndicator: React.FC = () => {
  const interfaceConfig = useInterfaceConfig();
  const userContext = useUserContext();
  const { isOnline } = useSmartNavigationStore();

  if (!interfaceConfig || !userContext) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Interface Type Indicator */}
      <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium">
        {interfaceConfig.type.replace('_', ' ')}
      </div>
      
      {/* Online Status */}
      {!isOnline && (
        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          Offline Mode
        </div>
      )}
      
      {/* Active Journey Indicator */}
      {userContext.hasActiveJourney && (
        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          Active Journey
        </div>
      )}
      
      {/* GPS Status */}
      {userContext.location.lat && userContext.location.lng && (
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          GPS Active
        </div>
      )}
    </div>
  );
}; 