/**
 * Secure Session Management System
 * CISSP Compliant - Automatic session timeout and inactivity detection
 */

import SecureTokenManager from './SecureTokenManager';

export class SecureSessionManager {
  private static readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private static readonly INACTIVITY_TIMEOUT_DESKTOP = 30 * 60 * 1000; // 30 minutes for desktop
  private static readonly INACTIVITY_TIMEOUT_MOBILE = 4 * 60 * 60 * 1000; // 4 hours for mobile field workers
  private static inactivityTimer: NodeJS.Timeout | null = null;
  private static lastActivity: number = Date.now();
  private static sessionHeartbeatInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize session management
   */
  static initializeSession(options?: { disableInactivityTimeout?: boolean }): void {
    // Only set up inactivity timer if not disabled
    if (!options?.disableInactivityTimeout) {
      this.resetInactivityTimer();
    }
    
    this.setupActivityListeners();
    this.startSessionHeartbeat();
    this.logSecurityEvent('SESSION_INITIALIZED', { timestamp: new Date().toISOString() });
  }
  
  /**
   * Get appropriate inactivity timeout based on user role
   */
  private static getInactivityTimeout(): number {
    // Check if user is a field worker (driver/mover) who needs longer sessions
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role && ['DRIVER', 'MOVER'].includes(user.role.toUpperCase())) {
          return this.INACTIVITY_TIMEOUT_MOBILE;
        }
      } catch (e) {
        // Fallback to desktop timeout if parsing fails
      }
    }
    
    // Default to desktop timeout for managers/admins
    return this.INACTIVITY_TIMEOUT_DESKTOP;
  }

  /**
   * Reset inactivity timer
   */
  private static resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    const timeout = this.getInactivityTimeout();
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, timeout);
  }
  
  /**
   * Setup activity listeners for user interaction
   */
  private static setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
        this.resetInactivityTimer();
      }, { passive: true });
    });
  }
  
  /**
   * Update last activity timestamp
   */
  private static updateLastActivity(): void {
    this.lastActivity = Date.now();
    SecureTokenManager.updateLastActivity();
  }
  
  /**
   * Start session heartbeat to check session validity
   */
  private static startSessionHeartbeat(): void {
    this.sessionHeartbeatInterval = setInterval(() => {
      this.checkSessionValidity();
    }, 60000); // Check every minute
  }
  
  /**
   * Check if session is still valid
   */
  private static async checkSessionValidity(): Promise<void> {
    const sessionData = SecureTokenManager.getSessionData();
    if (!sessionData) {
      this.handleSessionExpiry();
      return;
    }
    
    const now = Date.now();
    const sessionAge = now - sessionData.lastActivity;
    
    if (sessionAge > this.SESSION_TIMEOUT) {
      this.handleSessionExpiry();
    }
  }
  
  /**
   * Handle user inactivity
   */
  private static handleInactivity(): void {
    this.logout('Session expired due to inactivity');
  }
  
  /**
   * Handle session expiry
   */
  private static handleSessionExpiry(): void {
    this.logout('Session expired');
  }
  
  /**
   * Secure logout with cleanup
   */
  private static logout(reason: string): void {
    // Clear secure tokens
    SecureTokenManager.clearSecureTokens();
    
    // Stop timers
    this.stopSessionManagement();
    
    // Log logout event
    this.logSecurityEvent('LOGOUT', { reason, timestamp: new Date().toISOString() });
    
    // Redirect to login with reason
    window.location.href = `/auth/login?reason=${encodeURIComponent(reason)}`;
  }
  
  /**
   * Stop session management
   */
  static stopSessionManagement(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    if (this.sessionHeartbeatInterval) {
      clearInterval(this.sessionHeartbeatInterval);
      this.sessionHeartbeatInterval = null;
    }
  }
  
  /**
   * Get session status
   */
  static getSessionStatus(): {
    isActive: boolean;
    lastActivity: number;
    timeUntilInactivity: number;
    timeUntilExpiry: number;
  } {
    const sessionData = SecureTokenManager.getSessionData();
    const now = Date.now();
    
    if (!sessionData) {
      return {
        isActive: false,
        lastActivity: 0,
        timeUntilInactivity: 0,
        timeUntilExpiry: 0
      };
    }
    
    const timeSinceLastActivity = now - sessionData.lastActivity;
    const timeUntilInactivity = Math.max(0, this.getInactivityTimeout() - timeSinceLastActivity);
    const timeUntilExpiry = Math.max(0, this.SESSION_TIMEOUT - timeSinceLastActivity);
    
    return {
      isActive: true,
      lastActivity: sessionData.lastActivity,
      timeUntilInactivity,
      timeUntilExpiry
    };
  }
  
  /**
   * Extend session (called on successful API calls)
   */
  static extendSession(): void {
    this.updateLastActivity();
    this.resetInactivityTimer();
  }
  
  /**
   * Log security events
   */
  private static logSecurityEvent(event: string, data: any): void {
    // Log to console for now since backend endpoint doesn't exist yet
    console.log('🔐 Security Event:', event, data);
    
    // TODO: Implement backend security logging endpoint
    // Send security event to backend when endpoint is available
    /*
    fetch('/security/log', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SecureTokenManager.getSecureToken()}`
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        session_id: SecureTokenManager.getSessionId(),
        data
      })
    }).catch(() => {
      // Silently fail for security logs
    });
    */
  }
  
  /**
   * Check if session is about to expire (for warnings)
   */
  static isSessionExpiringSoon(warningMinutes: number = 5): boolean {
    const status = this.getSessionStatus();
    return status.isActive && status.timeUntilExpiry < (warningMinutes * 60 * 1000);
  }
  
  /**
   * Get formatted time until session expiry
   */
  static getTimeUntilExpiryFormatted(): string {
    const status = this.getSessionStatus();
    if (!status.isActive) return 'Session expired';
    
    const minutes = Math.floor(status.timeUntilExpiry / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  }
}

export default SecureSessionManager;

   * Check if session is about to expire (for warnings)
   */
  static isSessionExpiringSoon(warningMinutes: number = 5): boolean {
    const status = this.getSessionStatus();
    return status.isActive && status.timeUntilExpiry < (warningMinutes * 60 * 1000);
  }
  
  /**
   * Get formatted time until session expiry
   */
  static getTimeUntilExpiryFormatted(): string {
    const status = this.getSessionStatus();
    if (!status.isActive) return 'Session expired';
    
    const minutes = Math.floor(status.timeUntilExpiry / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  }
}

export default SecureSessionManager;
