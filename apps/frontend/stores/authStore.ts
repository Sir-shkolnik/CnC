import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/menu';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

// Default user for development/testing
const defaultUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@lgm.com',
  role: 'ADMIN',
  clientId: 'client1',
  locationId: 'location1',
  status: 'ACTIVE',
  permissions: []
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: defaultUser, // Set default user for development
      isAuthenticated: true, // Set to true for development
      token: 'dev-token',

      // Actions
      login: (user: User, token: string) => set({
        user,
        isAuthenticated: true,
        token
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        token: null
      }),

      updateUser: (user: User) => set({ user })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      }),
    }
  )
);

// Export selectors for better performance
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error) 