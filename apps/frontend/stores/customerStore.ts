import { create } from 'zustand';
import { Customer, CustomerCreate, CustomerUpdate, CustomerAnalytics } from '@/types/customer';

// Mock API client for now - replace with real API when available
const apiClient = {
  get: async (url: string) => {
    // Mock response for development
    return {
      data: {
        customers: [
          {
            id: 'cust_001',
            name: 'ABC Corporation',
            email: 'contact@abccorp.com',
            phone: '+1-416-555-0123',
            leadStatus: 'QUALIFIED',
            assignedTo: 'sarah.johnson@lgm.com',
            isActive: true,
            totalRevenue: 15000,
            lastContact: '2025-01-15T10:30:00Z',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z'
          },
          {
            id: 'cust_002',
            name: 'XYZ Industries',
            email: 'info@xyzindustries.com',
            phone: '+1-416-555-0456',
            leadStatus: 'NEGOTIATION',
            assignedTo: 'michael.chen@lgm.com',
            isActive: true,
            totalRevenue: 8500,
            lastContact: '2025-01-14T14:20:00Z',
            createdAt: '2025-01-05T00:00:00Z',
            updatedAt: '2025-01-14T14:20:00Z'
          }
        ]
      }
    };
  },
  post: async (url: string, data: any) => {
    return {
      data: {
        id: 'cust_new',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  },
  put: async (url: string, data: any) => {
    return {
      data: {
        ...data,
        updatedAt: new Date().toISOString()
      }
    };
  },
  delete: async (url: string) => {
    return { data: { success: true } };
  }
};

interface CustomerState {
  customers: Customer[];
  analytics: CustomerAnalytics | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCustomers: (params?: {
    page?: number;
    search?: string;
    leadStatus?: string;
    assignedTo?: string;
    isActive?: boolean;
  }) => Promise<void>;
  
  fetchCustomer: (id: string) => Promise<Customer | null>;
  
  createCustomer: (data: CustomerCreate) => Promise<Customer>;
  
  updateCustomer: (id: string, data: CustomerUpdate) => Promise<Customer>;
  
  deleteCustomer: (id: string) => Promise<void>;
  
  fetchAnalytics: () => Promise<void>;
  
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  analytics: {
    totalCustomers: 45,
    activeCustomers: 38,
    newCustomersThisMonth: 12,
    totalRevenue: 125000,
    conversionRate: 68.5,
    averageDealSize: 2800,
    leadStatusBreakdown: {
      NEW: 8,
      CONTACTED: 12,
      QUALIFIED: 15,
      PROPOSAL_SENT: 6,
      NEGOTIATION: 3,
      WON: 25,
      LOST: 5,
      ARCHIVED: 2
    }
  },
  loading: false,
  error: null,

  fetchCustomers: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.leadStatus) searchParams.append('leadStatus', params.leadStatus);
      if (params.assignedTo) searchParams.append('assignedTo', params.assignedTo);
      if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
      
      const response = await apiClient.get(`/customers?${searchParams.toString()}`);
      set({ customers: response.data.customers, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch customers',
        loading: false 
      });
      throw error;
    }
  },

  fetchCustomer: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiClient.get(`/customers/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch customer',
        loading: false 
      });
      throw error;
    }
  },

  createCustomer: async (data: CustomerCreate) => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiClient.post('/customers', data);
      const newCustomer = response.data;
      
      // Add to current list
      set(state => ({
        customers: [newCustomer, ...state.customers],
        loading: false
      }));
      
      return newCustomer;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to create customer',
        loading: false 
      });
      throw error;
    }
  },

  updateCustomer: async (id: string, data: CustomerUpdate) => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiClient.put(`/customers/${id}`, data);
      const updatedCustomer = response.data;
      
      // Update in current list
      set(state => ({
        customers: state.customers.map(customer => 
          customer.id === id ? updatedCustomer : customer
        ),
        loading: false
      }));
      
      return updatedCustomer;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update customer',
        loading: false 
      });
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await apiClient.delete(`/customers/${id}`);
      
      // Remove from current list
      set(state => ({
        customers: state.customers.filter(customer => customer.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete customer',
        loading: false 
      });
      throw error;
    }
  },

  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    
    try {
      // Mock analytics data - replace with real API call
      const mockAnalytics: CustomerAnalytics = {
        totalCustomers: 45,
        activeCustomers: 38,
        newCustomersThisMonth: 12,
        totalRevenue: 125000,
        conversionRate: 68.5,
        averageDealSize: 2800,
        leadStatusBreakdown: {
          NEW: 8,
          CONTACTED: 12,
          QUALIFIED: 15,
          PROPOSAL_SENT: 6,
          NEGOTIATION: 3,
          WON: 25,
          LOST: 5,
          ARCHIVED: 2
        }
      };
      
      set({ analytics: mockAnalytics, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch analytics',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
})); 