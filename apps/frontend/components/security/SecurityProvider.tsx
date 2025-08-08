/**
 * Security Provider Component
 * CISSP Compliant - Initializes security system on app startup
 */

'use client';

import { useEffect } from 'react';
import SecureSessionManager from '@/lib/security/SecureSessionManager';
import SecureTokenManager from '@/lib/security/SecureTokenManager';
import { useAuthStore } from '@/stores/authStore';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize security system when app starts
    if (typeof window !== 'undefined') {
      // Initialize session management
      SecureSessionManager.initializeSession();
      
      // Check if user is authenticated
      if (SecureTokenManager.isAuthenticated()) {
        console.log('🔐 Security system initialized - User authenticated');
      } else {
        console.log('🔐 Security system initialized - No active session');
      }
    }
  }, []);

  useEffect(() => {
    // Re-initialize session management when authentication state changes
    if (isAuthenticated) {
      SecureSessionManager.initializeSession();
    } else {
      SecureSessionManager.stopSessionManagement();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default SecurityProvider;
