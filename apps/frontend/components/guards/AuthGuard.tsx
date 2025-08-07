'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback,
  requiredRole 
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, requiredRole, router]);

  // Show fallback or loading state while checking auth
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Access Denied</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard; 