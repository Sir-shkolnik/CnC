import { create } from 'zustand';
import { Quote, QuoteCreate, QuoteUpdate, QuoteAnalytics, SalesPipelineAnalytics, ConversionAnalytics } from '@/types/quote';
import { api } from '@/lib/api';

interface QuoteState {
  quotes: Quote[];
  analytics: QuoteAnalytics | null;
  pipelineAnalytics: SalesPipelineAnalytics | null;
  conversionAnalytics: ConversionAnalytics | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchQuotes: (params?: {
    page?: number;
    customerId?: string;
    status?: string;
    createdBy?: string;
    isTemplate?: boolean;
  }) => Promise<void>;
  
  fetchQuote: (id: string) => Promise<Quote | null>;
  
  createQuote: (data: QuoteCreate) => Promise<Quote>;
  
  updateQuote: (id: string, data: QuoteUpdate) => Promise<Quote>;
  
  deleteQuote: (id: string) => Promise<void>;
  
  approveQuote: (id: string) => Promise<Quote>;
  
  rejectQuote: (id: string, reason: string) => Promise<Quote>;
  
  sendQuote: (id: string) => Promise<Quote>;
  
  convertToJourney: (id: string) => Promise<any>;
  
  duplicateQuote: (id: string) => Promise<Quote>;
  
  fetchAnalytics: () => Promise<void>;
  
  fetchPipelineAnalytics: () => Promise<void>;
  
  fetchConversionAnalytics: () => Promise<void>;
  
  clearError: () => void;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: [],
  analytics: null,
  pipelineAnalytics: null,
  conversionAnalytics: null,
  loading: false,
  error: null,

  fetchQuotes: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.customerId) searchParams.append('customerId', params.customerId);
      if (params.status) searchParams.append('status', params.status);
      if (params.createdBy) searchParams.append('createdBy', params.createdBy);
      if (params.isTemplate !== undefined) searchParams.append('isTemplate', params.isTemplate.toString());
      
      const response = await api.get(`/quotes?${searchParams.toString()}`);
      set({ quotes: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch quotes',
        loading: false 
      });
      throw error;
    }
  },

  fetchQuote: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get(`/quotes/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch quote',
        loading: false 
      });
      throw error;
    }
  },

  createQuote: async (data: QuoteCreate) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/quotes', data);
      const newQuote = response.data;
      
      // Add to current list
      set(state => ({
        quotes: [newQuote, ...state.quotes],
        loading: false
      }));
      
      return newQuote;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to create quote',
        loading: false 
      });
      throw error;
    }
  },

  updateQuote: async (id: string, data: QuoteUpdate) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.patch(`/quotes/${id}`, data);
      const updatedQuote = response.data;
      
      // Update in current list
      set(state => ({
        quotes: state.quotes.map(quote => 
          quote.id === id ? updatedQuote : quote
        ),
        loading: false
      }));
      
      return updatedQuote;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update quote',
        loading: false 
      });
      throw error;
    }
  },

  deleteQuote: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await api.delete(`/quotes/${id}`);
      
      // Remove from current list
      set(state => ({
        quotes: state.quotes.filter(quote => quote.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete quote',
        loading: false 
      });
      throw error;
    }
  },

  approveQuote: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post(`/quotes/${id}/approve`);
      const approvedQuote = response.data;
      
      // Update in current list
      set(state => ({
        quotes: state.quotes.map(quote => 
          quote.id === id ? approvedQuote : quote
        ),
        loading: false
      }));
      
      return approvedQuote;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to approve quote',
        loading: false 
      });
      throw error;
    }
  },

  rejectQuote: async (id: string, reason: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post(`/quotes/${id}/reject`, { rejection_reason: reason });
      const rejectedQuote = response.data;
      
      // Update in current list
      set(state => ({
        quotes: state.quotes.map(quote => 
          quote.id === id ? rejectedQuote : quote
        ),
        loading: false
      }));
      
      return rejectedQuote;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to reject quote',
        loading: false 
      });
      throw error;
    }
  },

  sendQuote: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post(`/quotes/${id}/send`);
      const sentQuote = response.data;
      
      // Update in current list
      set(state => ({
        quotes: state.quotes.map(quote => 
          quote.id === id ? sentQuote : quote
        ),
        loading: false
      }));
      
      return sentQuote;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to send quote',
        loading: false 
      });
      throw error;
    }
  },

  convertToJourney: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post(`/quotes/${id}/convert`);
      const result = response.data;
      
      // Update quote status in current list
      set(state => ({
        quotes: state.quotes.map(quote => 
          quote.id === id ? { ...quote, status: 'CONVERTED' } : quote
        ),
        loading: false
      }));
      
      return result;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to convert quote',
        loading: false 
      });
      throw error;
    }
  },

  duplicateQuote: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post(`/quotes/${id}/duplicate`);
      const duplicatedQuote = response.data;
      
      // Add to current list
      set(state => ({
        quotes: [duplicatedQuote, ...state.quotes],
        loading: false
      }));
      
      return duplicatedQuote;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to duplicate quote',
        loading: false 
      });
      throw error;
    }
  },

  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get('/quotes/analytics/overview');
      set({ analytics: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch analytics',
        loading: false 
      });
      throw error;
    }
  },

  fetchPipelineAnalytics: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get('/quotes/analytics/pipeline');
      set({ pipelineAnalytics: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch pipeline analytics',
        loading: false 
      });
      throw error;
    }
  },

  fetchConversionAnalytics: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get('/quotes/analytics/conversion');
      set({ conversionAnalytics: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch conversion analytics',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
})); 