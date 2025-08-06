'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Smartphone, Loader2 } from 'lucide-react';

export default function MobileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to mobile field operations
    router.push('/mobile');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">C&C CRM</h1>
            <p className="text-sm text-text-secondary">Mobile Field Operations</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-text-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to mobile app...</span>
        </div>
        
        <p className="text-xs text-text-secondary mt-4">
          If you're not redirected automatically, 
          <button 
            onClick={() => router.push('/mobile')}
            className="text-primary hover:text-primary/80 ml-1"
          >
            click here
          </button>
        </p>
      </div>
    </div>
  );
} 