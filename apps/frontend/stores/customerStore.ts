import { create } from 'zustand';
import { Customer, CustomerCreate, CustomerUpdate, CustomerAnalytics } from '@/types/customer';

// Mock API client for now - replace with real API when available
const apiClient = {
  get: async (url: string) => {
    // Mock response for development
    if (url.includes('/customers/') && !url.includes('?')) {
      // Individual customer request
      const customerId = url.split('/').pop();
      return {
        data: {
          id: customerId,
          firstName: 'ABC',
          lastName: 'Corporation',
          email: 'contact@abccorp.com',
          phone: '+1-416-555-0123',
          address: {
            street: '123 Business St',
            city: 'Toronto',
            province: 'ON',
            postalCode: 'M5V 2H1',
            country: 'Canada'
          },
          leadStatus: 'QUALIFIED',
          assignedTo: 'sarah.johnson@lgm.com',
          assignedUserName: 'Sarah Johnson',
          estimatedValue: 15000,
          notes: 'Corporate client',
          tags: ['corporate', 'qualified'],
          preferences: {},
          isActive: true,
          leadCount: 1,
          activityCount: 3,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-15T10:30:00Z'
        }
      };
    } else {
      // List customers request
      return {
        data: {
          customers: [
            {
              id: 'cust_001',
              firstName: 'ABC',
              lastName: 'Corporation',
              email: 'contact@abccorp.com',
              phone: '+1-416-555-0123',
              address: {
                street: '123 Business St',
                city: 'Toronto',
                province: 'ON',
                postalCode: 'M5V 2H1',
                country: 'Canada'
              },
              leadStatus: 'QUALIFIED',
              assignedTo: 'sarah.johnson@lgm.com',
              assignedUserName: 'Sarah Johnson',
              estimatedValue: 15000,
              notes: 'Corporate client',
              tags: ['corporate', 'qualified'],
              preferences: {},
              isActive: true,
              leadCount: 1,
              activityCount: 3,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-15T10:30:00Z'
            },
            {
              id: 'cust_002',
              firstName: 'XYZ',
              lastName: 'Industries',
              email: 'info@xyzindustries.com',
              phone: '+1-416-555-0456',
              address: {
                street: '456 Industry Ave',
                city: 'Vancouver',
                province: 'BC',
                postalCode: 'V6B 1A1',
                country: 'Canada'
              },
              leadStatus: 'NEGOTIATION',
              assignedTo: 'michael.chen@lgm.com',
              assignedUserName: 'Michael Chen',
              estimatedValue: 8500,
              notes: 'Manufacturing client',
              tags: ['manufacturing', 'negotiation'],
              preferences: {},
              isActive: true,
              leadCount: 1,
              activityCount: 2,
              createdAt: '2025-01-05T00:00:00Z',
              updatedAt: '2025-01-14T14:20:00Z'
            }
          ]
        }
      };
    }
  },
  post: async (url: string, data: any) => {
    return {
      data: {
        id: 'cust_new',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        leadSource: data.leadSource,
        leadStatus: data.leadStatus,
        assignedTo: data.assignedTo,
        assignedUserName: data.assignedUserName,
        estimatedValue: data.estimatedValue,
        notes: data.notes,
        tags: data.tags || [],
        preferences: data.preferences || {},
        isActive: true,
        leadCount: 0,
        activityCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  },
  put: async (url: string, data: any) => {
    return {
      data: {
        id: url.split('/').pop(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        leadSource: data.leadSource,
        leadStatus: data.leadStatus,
        assignedTo: data.assignedTo,
        assignedUserName: data.assignedUserName,
        estimatedValue: data.estimatedValue,
        notes: data.notes,
        tags: data.tags || [],
        preferences: data.preferences || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
        leadCount: 0,
        activityCount: 0,
        createdAt: new Date().toISOString(),
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
      // Return the customer data directly since it's already properly typed
      return response.data as Customer;
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
      const updatedCustomer = response.data as Customer;
      
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