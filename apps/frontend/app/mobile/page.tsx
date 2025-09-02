'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Square,
  Navigation,
  Phone,
  MessageSquare
} from 'lucide-react';

interface MobileJourney {
  id: string;
  truckNumber: string;
  status: string;
  currentLocation: string;
  nextJob: string;
  startTime: string;
  estimatedEndTime: string;
  jobsCompleted: number;
  totalJobs: number;
}

export default function MobileFieldOpsPage() {
  const router = useRouter();
  const [currentJourney, setCurrentJourney] = useState<MobileJourney | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchCurrentJourney();
  }, [router]);

  const fetchCurrentJourney = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch the user's current journey
      // For now, we'll simulate with mock data
      const mockJourney: MobileJourney = {
        id: 'journey-001',
        truckNumber: 'T-001',
        status: 'ON_SITE',
        currentLocation: '123 Main St, Toronto',
        nextJob: '456 Oak Ave, Toronto',
        startTime: '08:00',
        estimatedEndTime: '17:00',
        jobsCompleted: 3,
        totalJobs: 5
      };
      
      setCurrentJourney(mockJourney);
    } catch (error) {
      console.error('Error fetching journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    // In a real app, this would start GPS tracking
    console.log('GPS tracking started');
  };

  const stopTracking = () => {
    setIsTracking(false);
    // In a real app, this would stop GPS tracking
    console.log('GPS tracking stopped');
  };

  const markJobComplete = () => {
    if (currentJourney) {
      setCurrentJourney({
        ...currentJourney,
        jobsCompleted: currentJourney.jobsCompleted + 1
      });
    }
  };

  const takePhoto = () => {
    // In a real app, this would open the camera
    console.log('Opening camera for photo');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on_site':
        return 'bg-green-100 text-green-800';
      case 'on_road':
        return 'bg-blue-100 text-blue-800';
      case 'returning':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!currentJourney) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-12">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Journey</h2>
          <p className="text-gray-600 mb-4">You don't have any active journeys assigned.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Field Operations</h1>
            <p className="text-sm text-gray-600">Truck {currentJourney.truckNumber}</p>
          </div>
          <Badge className={getStatusColor(currentJourney.status)}>
            {currentJourney.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Current Journey Status */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Current Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentJourney.jobsCompleted}</div>
              <div className="text-sm text-blue-800">Jobs Completed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{currentJourney.totalJobs}</div>
              <div className="text-sm text-green-800">Total Jobs</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                <strong>Start:</strong> {currentJourney.startTime} | 
                <strong> Est. End:</strong> {currentJourney.estimatedEndTime}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                <strong>Current:</strong> {currentJourney.currentLocation}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                <strong>Next:</strong> {currentJourney.nextJob}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Tracking Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>GPS Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            {!isTracking ? (
              <Button onClick={startTracking} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Tracking
              </Button>
            ) : (
              <Button onClick={stopTracking} variant="destructive" className="flex-1">
                <Square className="w-4 h-4 mr-2" />
                Stop Tracking
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              <Navigation className="w-4 h-4 mr-2" />
              Navigation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={markJobComplete}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Job Complete
            </Button>
            <Button variant="outline" onClick={takePhoto}>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Call Dispatch
            </Button>
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentJourney.jobsCompleted} / {currentJourney.totalJobs}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentJourney.jobsCompleted / currentJourney.totalJobs) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {Math.round((currentJourney.jobsCompleted / currentJourney.totalJobs) * 100)}% Complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 