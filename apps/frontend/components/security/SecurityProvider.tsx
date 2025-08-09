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
      // Check if user is a field worker who needs extended sessions
      const userData = localStorage.getItem('user_data');
      let isFieldWorker = false;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          isFieldWorker = user.role && ['DRIVER', 'MOVER'].includes(user.role.toUpperCase());
        } catch (e) {
          console.warn('Could not parse user data for session configuration');
        }
      }
      
      // Initialize with appropriate timeout settings
      SecureSessionManager.initializeSession({
        disableInactivityTimeout: false // Always enable, but with role-based timeouts
      });
      
      if (isFieldWorker) {
        console.log('🔐 Extended session timeout enabled for field worker');
      }
    } else {
      SecureSessionManager.stopSessionManagement();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default SecurityProvider;

      }
      
      // Initialize with appropriate timeout settings
      SecureSessionManager.initializeSession({
        disableInactivityTimeout: false // Always enable, but with role-based timeouts
      });
      
      if (isFieldWorker) {
        console.log('🔐 Extended session timeout enabled for field worker');
      }
    } else {
      SecureSessionManager.stopSessionManagement();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default SecurityProvider;
