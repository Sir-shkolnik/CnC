'use client';

import React, { useState, useEffect } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { Badge } from '@/components/atoms/Badge';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RealTimeStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const RealTimeStatusIndicator: React.FC<RealTimeStatusIndicatorProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const { data: realTimeData, isConnected, lastUpdated, error, refresh } = useRealTimeData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      toast.success('Data refreshed');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  const getConnectionStatus = () => {
    if (!isConnected) return { status: 'offline', color: 'text-red-500', icon: WifiOff };
    if (error) return { status: 'error', color: 'text-yellow-500', icon: AlertTriangle };
    return { status: 'online', color: 'text-green-500', icon: Wifi };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className={`real-time-status-indicator ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <connectionStatus.icon 
          size={16} 
          className={connectionStatus.color}
        />
        
        {showDetails && (
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {/* Last Updated */}
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatLastUpdated(lastUpdated)}</span>
            </div>

            {/* Active Journeys */}
            {realTimeData.activeJourneys > 0 && (
              <div className="flex items-center gap-1">
                <Activity size={12} />
                <span>{realTimeData.activeJourneys} active</span>
              </div>
            )}

            {/* System Alerts */}
            {realTimeData.systemAlerts > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle size={12} className="text-yellow-500" />
                <span>{realTimeData.systemAlerts} alerts</span>
              </div>
            )}

            {/* Pending Approvals */}
            {realTimeData.pendingApprovals > 0 && (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-blue-500" />
                <span>{realTimeData.pendingApprovals} pending</span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Refresh data"
            >
              <RefreshCw 
                size={12} 
                className={`${isRefreshing ? 'animate-spin' : ''} text-gray-400 hover:text-white`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Status Badges */}
      {showDetails && (
        <div className="flex items-center gap-2 mt-2">
          {/* Connection Badge */}
          <Badge 
            variant={connectionStatus.status === 'online' ? 'success' : 'error'} 
            size="sm"
          >
            {connectionStatus.status}
          </Badge>

          {/* Data Freshness Badge */}
          {isConnected && (
            <Badge 
              variant={Date.now() - lastUpdated.getTime() < 60000 ? 'success' : 'warning'} 
              size="sm"
            >
              Live
            </Badge>
          )}

          {/* Error Badge */}
          {error && (
            <Badge variant="error" size="sm">
              Error
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

// ===== COMPACT VERSION =====
export const CompactRealTimeStatus: React.FC = () => {
  const { isConnected, error } = useRealTimeData();
  
  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-500';
    if (error) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs text-gray-400">
        {!isConnected ? 'Offline' : error ? 'Error' : 'Live'}
      </span>
    </div>
  );
};

// ===== DETAILED VERSION =====
export const DetailedRealTimeStatus: React.FC = () => {
  const { data: realTimeData, isConnected, lastUpdated, error } = useRealTimeData();

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">System Status</h3>
        <RealTimeStatusIndicator showDetails={false} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Active Journeys */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Active Journeys</span>
          <Badge variant="success" size="sm">
            {realTimeData.activeJourneys}
          </Badge>
        </div>

        {/* Field Operations */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Field Ops</span>
          <Badge variant="info" size="sm">
            {realTimeData.activeFieldOps}
          </Badge>
        </div>

        {/* System Alerts */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Alerts</span>
          <Badge 
            variant={realTimeData.systemAlerts > 0 ? 'error' : 'success'} 
            size="sm"
          >
            {realTimeData.systemAlerts}
          </Badge>
        </div>

        {/* Pending Approvals */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Approvals</span>
          <Badge 
            variant={realTimeData.pendingApprovals > 0 ? 'warning' : 'success'} 
            size="sm"
          >
            {realTimeData.pendingApprovals}
          </Badge>
        </div>

        {/* Location Updates */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">GPS Updates</span>
          <Badge variant="info" size="sm">
            {realTimeData.locationUpdates}
          </Badge>
        </div>

        {/* Unread Messages */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Messages</span>
          <Badge 
            variant={realTimeData.unreadMessages > 0 ? 'warning' : 'success'} 
            size="sm"
          >
            {realTimeData.unreadMessages}
          </Badge>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last Updated</span>
          <span>{lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-900 bg-opacity-20 border border-red-700 rounded text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle size={12} />
            <span>Connection Error: {error}</span>
          </div>
        </div>
      )}
    </div>
  );
}; 