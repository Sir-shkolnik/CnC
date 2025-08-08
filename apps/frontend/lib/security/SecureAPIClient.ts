/**
 * Secure API Client
 * CISSP Compliant - Secure API communication with automatic token refresh
 */

import SecureTokenManager from './SecureTokenManager';
import RateLimiter from './RateLimiter';
import SecureSessionManager from './SecureSessionManager';

export class SecureAPIClient {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private static readonly TIMEOUT = 30000; // 30 seconds
  
  /**
   * Make a secure API request
   */
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = SecureTokenManager.getSecureToken();
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId(),
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      'X-Client-Platform': 'web',
      'X-Client-Timestamp': Date.now().toString()
    };
    
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.TIMEOUT)
    };
    
    try {
      // Apply rate limiting
      const response = await RateLimiter.executeAPICall(endpoint, async () => {
        return fetch(`${this.BASE_URL}${endpoint}`, config);
      });
      
      if (response.status === 401) {
        // Token expired, try refresh
        const refreshed = await this.refreshTokenAndRetry(endpoint, config);
        if (refreshed) {
          return refreshed;
        }
        throw new Error('Authentication failed');
      }
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Extend session on successful API call
      SecureSessionManager.extendSession();
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
  
  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Refresh token and retry request
   */
  private static async refreshTokenAndRetry(
    endpoint: string,
    config: RequestInit
  ): Promise<any> {
    try {
      const refreshToken = SecureTokenManager.getRefreshToken();
      if (!refreshToken) return null;
      
      const refreshResponse = await fetch(`${this.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        SecureTokenManager.setSecureToken(data.access_token, data.refresh_token);
        
        // Retry original request with new token
        if (config.headers) {
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${data.access_token}`;
        }
        const retryResponse = await fetch(`${this.BASE_URL}${endpoint}`, config);
        
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * GET request
   */
  static async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  /**
   * POST request
   */
  static async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * PUT request
   */
  static async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * PATCH request
   */
  static async patch<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
  
  /**
   * Upload file with progress
   */
  static async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const token = SecureTokenManager.getSecureToken();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers: Record<string, string> = {
      'X-Request-ID': this.generateRequestId(),
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      'X-Client-Platform': 'web',
      'X-Client-Timestamp': Date.now().toString()
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText as any);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });
      
      xhr.open('POST', `${this.BASE_URL}${endpoint}`);
      
      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      
      xhr.send(formData);
    });
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return SecureTokenManager.isAuthenticated();
  }
  
  /**
   * Get authentication status
   */
  static getAuthStatus(): {
    isAuthenticated: boolean;
    tokenExpired: boolean;
    timeUntilExpiry: number;
  } {
    return {
      isAuthenticated: SecureTokenManager.isAuthenticated(),
      tokenExpired: SecureTokenManager.isTokenExpired(),
      timeUntilExpiry: SecureTokenManager.getTimeUntilExpiry()
    };
  }
}

export default SecureAPIClient;
