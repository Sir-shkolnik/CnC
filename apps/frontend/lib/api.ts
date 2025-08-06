// API utility functions for making authenticated requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth-storage') 
      ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token 
      : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.message || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Journeys
  async getActiveJourneys() {
    return this.request('/journey/active');
  }

  async getJourney(journeyId: string) {
    return this.request(`/journey/${journeyId}`);
  }

  async createJourney(journeyData: any) {
    return this.request('/journey/', {
      method: 'POST',
      body: JSON.stringify(journeyData),
    });
  }

  async updateJourney(journeyId: string, updates: any) {
    return this.request(`/journey/${journeyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Users
  async getUsers(params?: {
    client_id?: string;
    location_id?: string;
    role?: string;
    status?: string;
  }) {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/users?${queryParams}`);
  }

  async getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }

  // Super Admin endpoints
  async getSuperAdminCompanies() {
    return this.request('/super-admin/companies');
  }

  async getSuperAdminUsers() {
    return this.request('/super-admin/users');
  }

  async getSuperAdminLocations() {
    return this.request('/super-admin/locations');
  }

  async getSuperAdminJourneys() {
    return this.request('/super-admin/journeys');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Get all journeys (for testing)
  async getJourneys() {
    return this.request('/journey/');
  }
}

export const apiClient = new ApiClient();

 