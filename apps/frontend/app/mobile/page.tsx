'use client';

import React, { useEffect } from 'react';
import { useMobileFieldOpsStore, useMobileIsAuthenticated, useMobileUIState } from '@/stores/mobileFieldOpsStore';
import { MobileLogin } from '@/components/MobileFieldOps/MobileLogin';
import { MobileJourneyInterface } from '@/components/MobileFieldOps/MobileJourneyInterface';
import { Toaster } from 'react-hot-toast';

export default function MobileFieldOpsPage() {
  const isAuthenticated = useMobileIsAuthenticated();
  const { currentView } = useMobileUIState();
  const { checkAuth } = useMobileFieldOpsStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
    
    // Set up online/offline listeners
    const handleOnline = () => {
      console.log('Device is online');
    };
    
    const handleOffline = () => {
      console.log('Device is offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkAuth]);

  // Show loading state while checking auth
  if (currentView === 'login' && !isAuthenticated) {
    return (
      <>
        <MobileLogin />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </>
    );
  }

  // Show main journey interface when authenticated
  if (isAuthenticated) {
    return (
      <>
        <MobileJourneyInterface />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </>
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
} 