import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useJourneyStore } from '@/stores/journeyStore';
import { getRoleBasedMenuItems, hasMenuItemPermission } from '@/utils/menuItems';
import { MenuItem, BadgeContext, UserRole } from '@/types/menu';

export const useMenuItems = () => {
  const { user } = useAuthStore();
  const { journeys } = useJourneyStore();

  const getMenuItems = useCallback(() => {
    if (!user) return [];

    // Base menu items based on role
    let items = getRoleBasedMenuItems(user.role as UserRole);

    // Add dynamic badges and counts
    items = items.map(item => {
      const badge = getMenuItemBadge(item.id, {
        activeJourneys: journeys.filter(j => j.status !== 'COMPLETED').length,
        unreadMessages: 0, // TODO: Implement chat store
        pendingAudits: 0, // TODO: Implement audit store
        user: user as any
      });

      return { ...item, badge };
    });

    // Filter items based on user permissions
    items = items.filter(item => hasMenuItemPermission(item, user, {}));

    return items;
  }, [user, journeys]);

  const menuItems = useMemo(() => getMenuItems(), [getMenuItems]);

  return { menuItems };
};

const getMenuItemBadge = (itemId: string, context: BadgeContext): string | null => {
  switch (itemId) {
    case 'journeys':
    case 'my-journeys':
      return context.activeJourneys > 0 ? context.activeJourneys.toString() : null;
    case 'crew-chat':
      return context.unreadMessages > 0 ? context.unreadMessages.toString() : null;
    case 'audit':
      return context.pendingAudits > 0 ? context.pendingAudits.toString() : null;
    case 'dispatch':
      return context.activeJourneys > 0 ? context.activeJourneys.toString() : null;
    case 'feedback':
      return '3'; // TODO: Implement real feedback count
    case 'reports':
      return null; // No badge for reports
    default:
      return null;
  }
}; 