import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useJourneyStore } from '@/stores/journeyStore';

export interface RealTimeData {
  activeJourneys: number;
  unreadMessages: number;
  pendingAudits: number;
  newFeedback: number;
  activeFieldOps: number;
  pendingApprovals: number;
  systemAlerts: number;
  locationUpdates: number;
}

export interface RealTimeContext {
  data: RealTimeData;
  lastUpdated: Date;
  isConnected: boolean;
  error: string | null;
}

export const useRealTimeData = () => {
  const { user } = useAuthStore();
  const { journeys } = useJourneyStore();
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    activeJourneys: 0,
    unreadMessages: 0,
    pendingAudits: 0,
    newFeedback: 0,
    activeFieldOps: 0,
    pendingApprovals: 0,
    systemAlerts: 0,
    locationUpdates: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time data from API
  const fetchRealTimeData = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/real-time/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRealTimeData(data);
        setLastUpdated(new Date());
        setError(null);
        setIsConnected(true);
      } else {
        throw new Error('Failed to fetch real-time data');
      }
    } catch (err) {
      console.error('Real-time data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
      
      // Fallback to local data
      const localData: RealTimeData = {
        activeJourneys: journeys.filter(j => j.status !== 'COMPLETED').length,
        unreadMessages: Math.floor(Math.random() * 5), // Simulated for demo
        pendingAudits: Math.floor(Math.random() * 3), // Simulated for demo
        newFeedback: Math.floor(Math.random() * 2), // Simulated for demo
        activeFieldOps: journeys.filter(j => j.status === 'EN_ROUTE').length,
        pendingApprovals: Math.floor(Math.random() * 4), // Simulated for demo
        systemAlerts: Math.floor(Math.random() * 2), // Simulated for demo
        locationUpdates: Math.floor(Math.random() * 10) // Simulated for demo
      };
      setRealTimeData(localData);
    }
  }, [user, journeys]);

  // Poll for real-time updates
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchRealTimeData();

    // Set up polling interval
    const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [fetchRealTimeData, user]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      fetchRealTimeData(); // Refresh data when coming back online
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchRealTimeData]);

  return {
    data: realTimeData,
    lastUpdated,
    isConnected,
    error,
    refresh: fetchRealTimeData
  };
};

// ===== UTILITY FUNCTIONS =====

export const getBadgeValue = (itemId: string, realTimeData: RealTimeData): string | null => {
  switch (itemId) {
    case 'current_journey':
    case 'journeys':
      return realTimeData.activeJourneys > 0 ? realTimeData.activeJourneys.toString() : null;
    
    case 'crew_chat':
    case 'chat':
      return realTimeData.unreadMessages > 0 ? realTimeData.unreadMessages.toString() : null;
    
    case 'audit':
      return realTimeData.pendingAudits > 0 ? realTimeData.pendingAudits.toString() : null;
    
    case 'feedback':
      return realTimeData.newFeedback > 0 ? realTimeData.newFeedback.toString() : null;
    
    case 'mobile':
    case 'field_ops':
      return realTimeData.activeFieldOps > 0 ? realTimeData.activeFieldOps.toString() : null;
    
    case 'approvals':
      return realTimeData.pendingApprovals > 0 ? realTimeData.pendingApprovals.toString() : null;
    
    case 'alerts':
      return realTimeData.systemAlerts > 0 ? realTimeData.systemAlerts.toString() : null;
    
    case 'gps':
    case 'location':
      return realTimeData.locationUpdates > 0 ? realTimeData.locationUpdates.toString() : null;
    
    default:
      return null;
  }
};

export const getBadgeVariant = (itemId: string, realTimeData: RealTimeData): 'success' | 'warning' | 'danger' | 'info' => {
  const value = getBadgeValue(itemId, realTimeData);
  if (!value) return 'info';

  const numValue = parseInt(value);
  
  switch (itemId) {
    case 'alerts':
      return numValue > 5 ? 'danger' : 'warning';
    
    case 'audit':
      return numValue > 10 ? 'danger' : 'warning';
    
    case 'approvals':
      return numValue > 5 ? 'warning' : 'info';
    
    case 'current_journey':
    case 'journeys':
      return 'success';
    
    case 'crew_chat':
    case 'chat':
      return numValue > 10 ? 'danger' : 'warning';
    
    default:
      return 'info';
  }
}; 