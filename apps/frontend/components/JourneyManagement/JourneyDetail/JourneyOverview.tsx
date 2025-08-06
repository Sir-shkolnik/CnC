'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Play,
  Pause,
  Edit,
  Share2,
  CheckCircle,
  Truck,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { Journey } from '@/types/menu';
import toast from 'react-hot-toast';

interface JourneyOverviewProps {
  journey: Journey;
  journeyId: string;
  isTracking: boolean;
  onTrackingToggle: (tracking: boolean) => void;
}

export const JourneyOverview: React.FC<JourneyOverviewProps> = ({
  journey,
  journeyId,
  isTracking,
  onTrackingToggle
}) => {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return 'warning';
      case 'EN_ROUTE': return 'info';
      case 'ONSITE': return 'secondary';
      case 'COMPLETED': return 'success';
      case 'AUDITED': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return '🕐 Morning Prep';
      case 'EN_ROUTE': return '🚛 En Route';
      case 'ONSITE': return '📍 On Site';
      case 'COMPLETED': return '✅ Completed';
      case 'AUDITED': return '📋 Audited';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const handleStatusUpdate = (newStatus: string) => {
    toast.success(`Status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Journey Info Cards - Improved Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Journey Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center">
              <Truck className="w-4 h-4 mr-2 text-primary" />
              Journey Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 bg-surface/30 rounded-lg">
                <span className="text-text-secondary text-sm flex items-center">
                  <Truck className="w-3 h-3 mr-2" />
                  Truck Number:
                </span>
                <span className="text-text-primary font-medium text-sm">
                  {journey.truckNumber || 'Unassigned'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface/30 rounded-lg">
                <span className="text-text-secondary text-sm flex items-center">
                  <Calendar className="w-3 h-3 mr-2" />
                  Date:
                </span>
                <span className="text-text-primary text-sm">
                  {formatDate(journey.date)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface/30 rounded-lg">
                <span className="text-text-secondary text-sm flex items-center">
                  <MapPin className="w-3 h-3 mr-2" />
                  Location ID:
                </span>
                <span className="text-text-primary text-sm font-mono">
                  {journey.id}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface/30 rounded-lg">
                <span className="text-text-secondary text-sm flex items-center">
                  <Clock className="w-3 h-3 mr-2" />
                  Status:
                </span>
                <Badge variant={getStatusColor(journey.status)} className="text-xs">
                  {getStatusText(journey.status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start h-10"
              onClick={() => onTrackingToggle(!isTracking)}
            >
              {isTracking ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start h-10"
              onClick={() => router.push(`/journey/${journeyId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Journey
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start h-10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Updates - Improved Layout */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-success" />
            Update Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['MORNING_PREP', 'EN_ROUTE', 'ONSITE', 'COMPLETED'].map((status) => (
              <Button
                key={status}
                variant={journey.status === status ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1 sm:flex-none min-w-[120px] h-10"
                onClick={() => handleStatusUpdate(status)}
                disabled={journey.status === status}
              >
                {getStatusText(status)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 