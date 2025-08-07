'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Loader2, Shield, ArrowRight } from 'lucide-react';

function SuperAdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Redirect to unified login with super admin context
    const context = searchParams.get('context') || 'super-admin';
    router.push(`/auth/login?context=${context}`);
  }, [router, searchParams]);

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
              Redirecting to Login
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-text-secondary">Redirecting to unified login...</span>
            </div>
            <Button 
              onClick={() => router.push('/auth/login?context=super-admin')}
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <SuperAdminLoginContent />
    </Suspense>
  );
} 