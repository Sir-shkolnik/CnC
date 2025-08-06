'use client';

import React, { useState, useEffect } from 'react';
import { useMobileFieldOpsStore } from '@/stores/mobileFieldOpsStore';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Navigation,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Square
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileJourneyInterfaceProps {
  className?: string;
}

export const MobileJourneyInterface: React.FC<MobileJourneyInterfaceProps> = ({ className = '' }) => {
  const {
    currentJourney,
    user,
    location,
    journeySteps,
    currentStep,
    progress,
    locationData,
    syncStatus,
    isOnline,
    quickActions,
    logout,
    completeJourneyStep,
    skipJourneyStep,
    updateLocation,
    syncData
  } = useMobileFieldOpsStore();

  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isJourneyActive, setIsJourneyActive] = useState(false);

  useEffect(() => {
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsLocationEnabled(true);
        },
        (error) => {
          console.error('Location error:', error);
          setIsLocationEnabled(false);
        }
      );
    }
  }, [updateLocation]);

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add_photo':
        toast.success('Camera opened');
        break;
      case 'mark_complete':
        if (currentStep < journeySteps.length) {
          completeJourneyStep(journeySteps[currentStep].id);
          toast.success('Step completed!');
        }
        break;
      case 'report_issue':
        toast.info('Issue reporting feature coming soon');
        break;
      case 'update_location':
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
              toast.success('Location updated');
            },
            (error) => {
              toast.error('Failed to get location');
            }
          );
        }
        break;
      case 'add_note':
        toast.info('Note feature coming soon');
        break;
      case 'call_customer':
        toast.info('Call feature coming soon');
        break;
      default:
        break;
    }
  };

  const handleJourneyControl = () => {
    setIsJourneyActive(!isJourneyActive);
    toast.success(isJourneyActive ? 'Journey paused' : 'Journey started');
  };

  const handleSync = async () => {
    try {
      await syncData();
      toast.success('Data synced successfully');
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  const getCurrentStep = () => {
    return journeySteps[currentStep] || null;
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'skipped': return 'warning';
      default: return 'secondary';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'skipped': return <ChevronRight className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!currentJourney) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
          <CardContent className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Active Journey</h2>
            <p className="text-gray-400 mb-4">
              You don't have any active journeys assigned at the moment.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Journey #{currentJourney.id.slice(-6)}
              </h1>
              <p className="text-sm text-gray-400">
                {currentJourney.status.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sync Status */}
            <Badge 
              variant={isOnline ? 'success' : 'error'} 
              className="text-xs flex items-center gap-1"
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {syncStatus.pendingUpdates > 0 && `(${syncStatus.pendingUpdates})`}
            </Badge>
            
            {/* Settings Menu */}
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Current Location */}
        {locationData && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Current Location</p>
                  <p className="text-white font-medium">
                    {locationData.currentLocation.lat.toFixed(6)}, {locationData.currentLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Accuracy: {locationData.currentLocation.accuracy.toFixed(0)}m
                  </p>
                </div>
                <Badge variant={isLocationEnabled ? 'success' : 'error'} className="text-xs">
                  {isLocationEnabled ? 'GPS Active' : 'GPS Off'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Step */}
        {getCurrentStep() && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">
                  Current Step: {getCurrentStep()?.title}
                </CardTitle>
                <Badge 
                  variant={getStepStatusColor(getCurrentStep()?.status || 'pending')}
                  className="text-xs"
                >
                  {getCurrentStep()?.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                {getCurrentStep()?.description}
              </p>
              
              {/* Checklist */}
              {getCurrentStep()?.checklist && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Checklist:</h4>
                  {getCurrentStep()?.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
                      />
                      <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {item.title}
                      </span>
                      {item.mediaRequired && (
                        <Camera className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Step Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => completeJourneyStep(getCurrentStep()?.id || '')}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Step
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => skipJourneyStep(getCurrentStep()?.id || '')}
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {progress && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Progress</span>
                <span className="text-sm text-white font-medium">
                  {progress.completedSteps}/{progress.totalSteps} Steps
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>Started: {new Date(progress.actualStartTime).toLocaleTimeString()}</span>
                <span>ETA: {new Date(progress.estimatedCompletion).toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Quick Actions</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  onClick={() => handleQuickAction(action.id)}
                  disabled={action.disabled}
                  className="h-16 flex flex-col items-center justify-center gap-1 text-xs"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Journey Control */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Journey Control</h3>
                <p className="text-sm text-gray-400">
                  {isJourneyActive ? 'Journey is active' : 'Journey is paused'}
                </p>
              </div>
              <Button
                onClick={handleJourneyControl}
                variant={isJourneyActive ? 'warning' : 'success'}
                className="flex items-center gap-2"
              >
                {isJourneyActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Recent Activity</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-gray-300">Step completed - Vehicle Check</span>
                <span className="text-gray-500 text-xs">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-gray-300">Photo added - Loading items</span>
                <span className="text-gray-500 text-xs">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-gray-300">Location updated</span>
                <span className="text-gray-500 text-xs">10 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSync} disabled={!isOnline}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {user?.name} • {location?.name}
            </span>
          </div>
          
          <Button variant="ghost" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}; 