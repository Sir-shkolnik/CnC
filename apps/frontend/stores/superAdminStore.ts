import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  SuperAdminUser, 
  SuperAdminSession, 
  Company, 
  SuperAdminPermissions,
  SuperAdminAnalytics,
  CompanyAccessLog
} from '@/types/superAdmin';

interface SuperAdminState {
  // Authentication
  superAdmin: SuperAdminUser | null;
  session: SuperAdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Company Context
  currentCompany: Company | null;
  availableCompanies: Company[];
  
  // Data
  companies: Company[];
  analytics: SuperAdminAnalytics | null;
  auditLogs: CompanyAccessLog[];
  
  // UI State
  selectedCompanyId: string | null;
  showCompanySelector: boolean;
}

interface SuperAdminActions {
  // Authentication
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  
  // Company Management
  switchCompany: (companyId: string) => Promise<void>;
  setCurrentCompany: (company: Company) => void;
  loadCompanies: () => Promise<void>;
  
  // Data Management
  loadAnalytics: () => Promise<void>;
  loadAuditLogs: (filters?: any) => Promise<void>;
  
  // UI Actions
  setSelectedCompanyId: (companyId: string | null) => void;
  toggleCompanySelector: () => void;
  clearError: () => void;
}

type SuperAdminStore = SuperAdminState & SuperAdminActions;

// Default permissions for development
const defaultPermissions: SuperAdminPermissions = {
  VIEW_ALL_COMPANIES: true,
  CREATE_COMPANIES: true,
  UPDATE_COMPANIES: true,
  DELETE_COMPANIES: true,
  VIEW_ALL_USERS: true,
  CREATE_USERS: true,
  UPDATE_USERS: true,
  DELETE_USERS: true,
  VIEW_ALL_LOCATIONS: true,
  CREATE_LOCATIONS: true,
  UPDATE_LOCATIONS: true,
  DELETE_LOCATIONS: true,
  VIEW_ALL_JOURNEYS: true,
  CREATE_JOURNEYS: true,
  UPDATE_JOURNEYS: true,
  DELETE_JOURNEYS: true,
  MANAGE_SYSTEM_SETTINGS: true,
  VIEW_AUDIT_LOGS: true,
  EXPORT_DATA: true,
};

// Default super admin for development
const defaultSuperAdmin: SuperAdminUser = {
  id: 'super-admin-1',
  username: 'udi.shkolnik',
  email: 'udi.shkolnik@lgm.com',
  role: 'SUPER_ADMIN',
  permissions: Object.keys(defaultPermissions),
  status: 'ACTIVE',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Real LGM Companies based on actual data
const lgmCompanies: Company[] = [
  {
    id: 'lgm-corporate',
    name: 'LGM Corporate',
    type: 'CORPORATE',
    status: 'ACTIVE',
    contactEmail: 'corporate@lgm.com',
    contactPhone: '1-800-LGM-MOVE',
    address: 'Corporate Headquarters, Toronto, ON',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'lgm-british-columbia',
    name: 'LGM British Columbia',
    type: 'CORPORATE',
    status: 'ACTIVE',
    contactEmail: 'bc@lgm.com',
    contactPhone: '604-LGM-MOVE',
    address: 'Vancouver, BC',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'lgm-alberta',
    name: 'LGM Alberta',
    type: 'CORPORATE',
    status: 'ACTIVE',
    contactEmail: 'alberta@lgm.com',
    contactPhone: '780-LGM-MOVE',
    address: 'Edmonton, AB',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'lgm-ontario',
    name: 'LGM Ontario',
    type: 'CORPORATE',
    status: 'ACTIVE',
    contactEmail: 'ontario@lgm.com',
    contactPhone: '416-LGM-MOVE',
    address: 'Toronto, ON',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'lgm-quebec',
    name: 'LGM Quebec',
    type: 'CORPORATE',
    status: 'ACTIVE',
    contactEmail: 'quebec@lgm.com',
    contactPhone: '514-LGM-MOVE',
    address: 'Montreal, QC',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'lgm-maritimes',
    name: 'LGM Maritimes',
    type: 'CORPORATE',
    status: 'ACTIVE',
    contactEmail: 'maritimes@lgm.com',
    contactPhone: '506-LGM-MOVE',
    address: 'Halifax, NS',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'lgm-prairies',
    name: 'LGM Prairies',
    type: 'CORPORATE',
    status: 'ACTIVE',
    contactEmail: 'prairies@lgm.com',
    contactPhone: '306-LGM-MOVE',
    address: 'Winnipeg, MB',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }
];

// Real LGM Analytics based on actual data
const lgmAnalytics: SuperAdminAnalytics = {
  totalCompanies: 7,
  totalUsers: 37, // Based on the user count from the document
  totalLocations: 50, // 42 franchise + 8 corporate
  totalJourneys: 127, // Based on truck count
  activeJourneys: 45,
  completedJourneys: 82,
  revenueThisMonth: 1250000, // Estimated based on 50 locations
  revenueLastMonth: 1180000,
};

export const useSuperAdminStore = create<SuperAdminStore>()(
  persist(
    (set, get) => ({
      // State
      superAdmin: defaultSuperAdmin,
      session: {
        id: 'session-1',
        superAdminId: defaultSuperAdmin.id,
        sessionToken: 'dev-super-admin-token',
        currentCompanyId: undefined,
        permissionsScope: defaultPermissions,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      
      currentCompany: null,
      availableCompanies: lgmCompanies,
      companies: lgmCompanies,
      analytics: lgmAnalytics,
      auditLogs: [],
      
      selectedCompanyId: null,
      showCompanySelector: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/super-admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
          });
          
          if (!response.ok) {
            throw new Error('Login failed');
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Set cookie for middleware
            document.cookie = `super-admin-token=${data.data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
            
            set({
              superAdmin: data.data.superAdmin,
              session: {
                id: data.data.session?.id || 'session-1',
                superAdminId: data.data.superAdmin.id,
                sessionToken: data.data.accessToken,
                currentCompanyId: data.data.session?.currentCompanyId || lgmCompanies[0]?.id,
                permissionsScope: data.data.session?.permissionsScope || defaultPermissions,
                expiresAt: data.data.session?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: data.data.session?.createdAt || new Date().toISOString(),
                lastActivity: data.data.session?.lastActivity || new Date().toISOString(),
              },
              isAuthenticated: true,
              currentCompany: lgmCompanies[0] || null,
              availableCompanies: lgmCompanies,
              companies: lgmCompanies,
              analytics: lgmAnalytics,
              selectedCompanyId: lgmCompanies[0]?.id || null,
              isLoading: false,
            });
          } else {
            throw new Error(data.message || 'Login failed');
          }
        } catch (error) {
          // Fallback to mock data for development
          if (email === 'udi.shkolnik@lgm.com' && password === 'Id200633048!') {
            set({
              superAdmin: defaultSuperAdmin,
              session: {
                id: 'session-1',
                superAdminId: defaultSuperAdmin.id,
                sessionToken: 'dev-super-admin-token',
                currentCompanyId: lgmCompanies[0].id,
                permissionsScope: defaultPermissions,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
              },
              isAuthenticated: true,
              currentCompany: lgmCompanies[0],
              availableCompanies: lgmCompanies,
              companies: lgmCompanies,
              analytics: lgmAnalytics,
              selectedCompanyId: lgmCompanies[0].id,
              isLoading: false,
            });
          } else {
            set({ 
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false 
            });
          }
        }
      },

      logout: () => {
        // Clear cookies
        document.cookie = 'super-admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Clear localStorage
        localStorage.removeItem('super-admin-token');
        localStorage.removeItem('auth-token');
        
        set({
          superAdmin: null,
          session: null,
          isAuthenticated: false,
          currentCompany: null,
          availableCompanies: [],
          companies: [],
          analytics: null,
          auditLogs: [],
          selectedCompanyId: null,
          showCompanySelector: false,
          error: null,
        });
      },

      refreshSession: async () => {
        set({ isLoading: true });
        
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { session } = get();
          if (session) {
            set({
              session: {
                ...session,
                lastActivity: new Date().toISOString(),
              },
              isLoading: false,
            });
          }
        } catch (error) {
          set({ 
            error: 'Session refresh failed',
            isLoading: false 
          });
        }
      },

      switchCompany: async (companyId: string) => {
        set({ isLoading: true });
        
        try {
          // TODO: Replace with actual API call
          // const response = await fetch('/api/super-admin/auth/switch-company', {
          //   method: 'POST',
          //   headers: { 
          //     'Content-Type': 'application/json',
          //     'Authorization': `Bearer ${get().session?.sessionToken}`,
          //   },
          //   body: JSON.stringify({ company_id: companyId }),
          // });
          // const data = await response.json();
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const company = lgmCompanies.find(c => c.id === companyId);
          if (company) {
            set({
              currentCompany: company,
              selectedCompanyId: companyId,
              session: {
                ...get().session!,
                currentCompanyId: companyId,
                lastActivity: new Date().toISOString(),
              },
              isLoading: false,
            });
          } else {
            throw new Error('Company not found');
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Company switch failed',
            isLoading: false 
          });
        }
      },

      setCurrentCompany: (company: Company) => {
        set({ currentCompany: company, selectedCompanyId: company.id });
      },

      loadCompanies: async () => {
        set({ isLoading: true });
        
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({
            companies: lgmCompanies,
            availableCompanies: lgmCompanies,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: 'Failed to load companies',
            isLoading: false 
          });
        }
      },

      loadAnalytics: async () => {
        set({ isLoading: true });
        
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({
            analytics: lgmAnalytics,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: 'Failed to load analytics',
            isLoading: false 
          });
        }
      },

      loadAuditLogs: async (filters?: any) => {
        set({ isLoading: true });
        
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock audit logs based on real LGM data
          const mockAuditLogs: CompanyAccessLog[] = [
            {
              id: 'log-1',
              superAdminId: defaultSuperAdmin.id,
              companyId: lgmCompanies[0].id,
              actionType: 'COMPANY_SWITCH',
              actionDetails: { companyName: lgmCompanies[0].name },
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0...',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'log-2',
              superAdminId: defaultSuperAdmin.id,
              companyId: lgmCompanies[1].id,
              actionType: 'USER_VIEW',
              actionDetails: { userId: 'user-1' },
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0...',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ];
          
          set({
            auditLogs: mockAuditLogs,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: 'Failed to load audit logs',
            isLoading: false 
          });
        }
      },

      setSelectedCompanyId: (companyId: string | null) => {
        set({ selectedCompanyId: companyId });
      },

      toggleCompanySelector: () => {
        set(state => ({ showCompanySelector: !state.showCompanySelector }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'super-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        superAdmin: state.superAdmin,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        currentCompany: state.currentCompany,
        selectedCompanyId: state.selectedCompanyId,
      }),
    }
  )
);

// Export selectors for better performance
export const useSuperAdmin = () => useSuperAdminStore((state) => state.superAdmin);
export const useSuperAdminSession = () => useSuperAdminStore((state) => state.session);
export const useIsSuperAdminAuthenticated = () => useSuperAdminStore((state) => state.isAuthenticated);
export const useSuperAdminLoading = () => useSuperAdminStore((state) => state.isLoading);
export const useSuperAdminError = () => useSuperAdminStore((state) => state.error);
export const useCurrentCompany = () => useSuperAdminStore((state) => state.currentCompany);
export const useAvailableCompanies = () => useSuperAdminStore((state) => state.availableCompanies);
export const useSuperAdminAnalytics = () => useSuperAdminStore((state) => state.analytics);
export const useAuditLogs = () => useSuperAdminStore((state) => state.auditLogs);
export const useSelectedCompanyId = () => useSuperAdminStore((state) => state.selectedCompanyId);
export const useShowCompanySelector = () => useSuperAdminStore((state) => state.showCompanySelector); 