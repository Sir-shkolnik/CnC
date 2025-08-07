'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Loader2, Shield, LogOut, CheckCircle } from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import toast from 'react-hot-toast';

export default function SuperAdminLogoutPage() {
  const router = useRouter();
  const { logout } = useSuperAdminStore();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        setIsLoggingOut(true);
        
        // Perform logout
        logout();
        
        // Clear any stored data
        localStorage.removeItem('super-admin-token');
        sessionStorage.clear();
        
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoggedOut(true);
        toast.success('Logged out successfully');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed');
        router.push('/auth/login');
      } finally {
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-surface border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Super Admin</h1>
                <p className="text-sm text-text-secondary">C&C CRM</p>
              </div>
            </div>
            <CardTitle className="text-text-primary text-lg">
              {isLoggedOut ? 'Logged Out Successfully' : 'Logging Out...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {isLoggingOut ? (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-text-secondary">Logging out...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-text-secondary">Successfully logged out</span>
              </div>
            )}
            
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
              variant="secondary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 