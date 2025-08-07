import { useCallback, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useJourneyStore } from '@/stores/journeyStore';
import { useSmartNavigationStore, useInterfaceConfig, useUserContext } from '@/stores/smartNavigationStore';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { generateSmartMenuItems, generateMenuItemBadge } from '@/utils/smartMenuItems';
import { MenuItem } from '@/types/menu';
import { UserRole } from '@/types/enums';

export const useMenuItems = () => {
  const { user } = useAuthStore();
  const { journeys } = useJourneyStore();
  const { deviceType } = useDeviceDetection();
  
  // Smart navigation state
  const interfaceConfig = useInterfaceConfig();
  const userContext = useUserContext();
  const { detectAndSetInterface, updateUserContext } = useSmartNavigationStore();

  // Initialize interface detection when user changes
  useEffect(() => {
    if (user && user.role) {
      detectAndSetInterface(user.role as UserRole);
      
      // Update user context with real data
      updateUserContext({
        role: user.role as UserRole,
        deviceType,
        isOnline: navigator.onLine,
        hasActiveJourney: journeys.some(j => j.status !== 'COMPLETED'),
        location: {},
        permissions: []
      });
    }
  }, [user, deviceType, journeys, detectAndSetInterface, updateUserContext]);

  const getMenuItems = useCallback(() => {
    if (!user || !interfaceConfig || !userContext) return [];

    // Generate smart menu items based on interface configuration
    let items = generateSmartMenuItems(
      user.role as UserRole,
      interfaceConfig,
      userContext
    );

    // Add real-time badges and counts
    items = items.map(item => {
      const badge = generateMenuItemBadge(item.id, userContext, {
        activeJourneys: journeys.filter(j => j.status !== 'COMPLETED').length,
        unreadMessages: 0, // TODO: Implement chat store
        pendingAudits: 0, // TODO: Implement audit store
        newFeedback: 0 // TODO: Implement feedback store
      });

      return { ...item, badge };
    });

    return items;
  }, [user, interfaceConfig, userContext, journeys]);

  const menuItems = useMemo(() => getMenuItems(), [getMenuItems]);

  return { menuItems };
};

 