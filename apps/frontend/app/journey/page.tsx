'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JourneyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct journeys page
    router.replace('/journeys');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Redirecting to journeys...</p>
      </div>
    </div>
  );
}
