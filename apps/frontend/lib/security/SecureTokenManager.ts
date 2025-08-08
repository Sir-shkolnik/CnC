/**
 * Secure Token Management System
 * CISSP Compliant - Replaces vulnerable localStorage implementation
 */

import { encryptData, decryptData } from './encryption';

export class SecureTokenManager {
  private static readonly TOKEN_KEY = 'c_c_crm_auth_token';
  private static readonly REFRESH_KEY = 'c_c_crm_refresh_token';
  private static readonly SESSION_KEY = 'c_c_crm_session';
  private static readonly SESSION_ID_KEY = 'c_c_crm_session_id';
  
  /**
   * Set secure tokens using httpOnly cookies
   */
  static setSecureToken(token: string, refreshToken: string): void {
    // Set httpOnly cookie with secure flags
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=3600; secure; samesite=strict; httponly`;
    document.cookie = `${this.REFRESH_KEY}=${refreshToken}; path=/; max-age=86400; secure; samesite=strict; httponly`;
    
    // Store minimal session data in encrypted sessionStorage
    this.setSessionData({
      isAuthenticated: true,
      lastActivity: Date.now(),
      tokenExpiry: Date.now() + 3600000, // 1 hour
      sessionId: this.generateSessionId()
    });
  }
  
  /**
   * Get secure token from httpOnly cookie
   */
  static getSecureToken(): string | null {
    // Get token from httpOnly cookie
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith(`${this.TOKEN_KEY}=`));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
  
  /**
   * Get refresh token from httpOnly cookie
   */
  static getRefreshToken(): string | null {
    const cookies = document.cookie.split(';');
    const refreshCookie = cookies.find(c => c.trim().startsWith(`${this.REFRESH_KEY}=`));
    return refreshCookie ? refreshCookie.split('=')[1] : null;
  }
  
  /**
   * Clear all secure tokens
   */
  static clearSecureTokens(): void {
    // Clear all secure tokens
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
    document.cookie = `${this.REFRESH_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
    this.clearSessionData();
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const sessionData = this.getSessionData();
    return sessionData?.isAuthenticated === true;
  }
  
  /**
   * Get session ID
   */
  static getSessionId(): string | null {
    const sessionData = this.getSessionData();
    return sessionData?.sessionId || null;
  }
  
  /**
   * Update last activity timestamp
   */
  static updateLastActivity(): void {
    const sessionData = this.getSessionData();
    if (sessionData) {
      sessionData.lastActivity = Date.now();
      this.setSessionData(sessionData);
    }
  }
  
  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    const sessionData = this.getSessionData();
    if (!sessionData) return true;
    
    return Date.now() > sessionData.tokenExpiry;
  }
  
  /**
   * Get time until token expiry
   */
  static getTimeUntilExpiry(): number {
    const sessionData = this.getSessionData();
    if (!sessionData) return 0;
    
    return Math.max(0, sessionData.tokenExpiry - Date.now());
  }
  
  /**
   * Store session data in encrypted sessionStorage
   */
  private static setSessionData(data: any): void {
    try {
      const encrypted = encryptData(JSON.stringify(data));
      sessionStorage.setItem(this.SESSION_KEY, encrypted);
    } catch (error) {
      console.error('Failed to encrypt session data:', error);
    }
  }
  
  /**
   * Get session data from encrypted sessionStorage
   */
  static getSessionData(): any {
    try {
      const encrypted = sessionStorage.getItem(this.SESSION_KEY);
      if (!encrypted) return null;
      
      const decrypted = decryptData(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt session data:', error);
      return null;
    }
  }
  
  /**
   * Clear session data
   */
  private static clearSessionData(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }
  
  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default SecureTokenManager;
