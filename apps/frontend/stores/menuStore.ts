import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MenuState, MenuActions } from '@/types/menu';

type MenuStore = MenuState & MenuActions;

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      // State
      isMobileMenuOpen: false,
      isDesktopMenuCollapsed: false,
      activeMenuItem: null,
      searchTerm: '',

      // Actions
      toggleMobileMenu: () => set(state => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen 
      })),

      toggleDesktopMenu: () => set(state => ({ 
        isDesktopMenuCollapsed: !state.isDesktopMenuCollapsed 
      })),

      setActiveMenuItem: (itemId: string) => {
        const currentState = get();
        if (currentState.activeMenuItem !== itemId) {
          set({ activeMenuItem: itemId });
        }
      },

      setSearchTerm: (term: string) => set({ searchTerm: term }),

      closeAllMenus: () => set({ 
        isMobileMenuOpen: false 
      })
    }),
    {
      name: 'menu-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isDesktopMenuCollapsed: state.isDesktopMenuCollapsed,
        activeMenuItem: state.activeMenuItem
      }),
    }
  )
); 