'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { CheckCircle, Clock, MapPin, Truck, Users, Package } from 'lucide-react';

interface TimelineEvent {
  time: string;
  event: string;
  status: 'completed' | 'current' | 'pending';
  icon?: React.ReactNode;
  description?: string;
}

interface JourneyTimelineProps {
  journeyId: string;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ journeyId }) => {
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchJourneyTimeline = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        // Fetch real timeline data from API for this specific journey
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/journey-workflow/${journeyId}/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTimelineEvents(data.timeline || []);
        } else {
          console.warn(`No timeline data found for journey ${journeyId}, using empty timeline`);
          setTimelineEvents([]);
        }
      } catch (error) {
        console.error('Failed to fetch journey timeline:', error);
        setTimelineEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyTimeline();
  }, [journeyId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Journey Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading timeline...</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'current': return 'primary';
      case 'pending': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'current': return 'In Progress';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center">
          <Clock className="w-4 h-4 mr-2 text-primary" />
          Journey Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No timeline events yet</p>
              <p className="text-xs mt-1">Timeline will be populated as the journey progresses</p>
            </div>
          ) : (
            timelineEvents.map((item, index) => (
            <div key={index} className="relative">
              {/* Timeline Line */}
              {index < timelineEvents.length - 1 && (
                <div className={`
                  absolute left-6 top-8 w-0.5 h-12 transform -translate-x-1/2
                  ${item.status === 'completed' ? 'bg-success' : 'bg-gray-600'}
                `} />
              )}
              
              {/* Timeline Item */}
              <div className="flex items-start space-x-4">
                {/* Icon and Status Indicator */}
                <div className="relative flex-shrink-0">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${item.status === 'completed' ? 'bg-success/20 text-success' : ''}
                    ${item.status === 'current' ? 'bg-primary/20 text-primary' : ''}
                    ${item.status === 'pending' ? 'bg-gray-600/20 text-gray-400' : ''}
                  `}>
                    {item.icon}
                  </div>
                  {item.status === 'completed' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-text-primary truncate">
                      {item.event}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(item.status)} className="text-xs">
                        {getStatusText(item.status)}
                      </Badge>
                      <span className="text-xs text-text-secondary font-mono">
                        {item.time}
                      </span>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>
        
        {/* Timeline Summary - only show if there are events */}
        {timelineEvents.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-surface/30 rounded-lg">
                <div className="text-lg font-bold text-success">
                  {timelineEvents.filter(e => e.status === 'completed').length}
                </div>
                <div className="text-xs text-text-secondary">Completed</div>
              </div>
              <div className="p-3 bg-surface/30 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {timelineEvents.filter(e => e.status === 'current').length}
                </div>
                <div className="text-xs text-text-secondary">In Progress</div>
              </div>
              <div className="p-3 bg-surface/30 rounded-lg">
                <div className="text-lg font-bold text-gray-400">
                  {timelineEvents.filter(e => e.status === 'pending').length}
                </div>
                <div className="text-xs text-text-secondary">Pending</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 