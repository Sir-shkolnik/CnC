'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified login
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-text-secondary">Redirecting to login...</span>
        </div>
        <p className="text-sm text-text-secondary">
          If you are not redirected automatically, 
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-primary hover:underline ml-1"
          >
            click here
          </button>
        </p>
      </div>
    </div>
  );
}
