'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin, useSuperAdminSession } from '@/stores/superAdminStore';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const router = useRouter();
  const { isAuthenticated, superAdmin } = useSuperAdminStore();
  const session = useSuperAdminSession();

  useEffect(() => {
    if (!isAuthenticated || !superAdmin || !session) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, superAdmin, session, router]);

  // Show fallback or loading state while checking auth
  if (!isAuthenticated || !superAdmin || !session) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SuperAdminGuard; 