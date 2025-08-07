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
  Square,
  MessageSquare,
  Upload,
  Home,
  Menu
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
  const [currentView, setCurrentView] = useState<'journey' | 'steps' | 'media' | 'gps' | 'chat' | 'settings'>('journey');

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
        toast('Issue reporting feature coming soon');
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
        toast('Note feature coming soon');
        break;
      case 'call_customer':
        toast('Call feature coming soon');
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-surface border-border max-w-md w-full">
          <CardContent className="text-center py-8">
            <Truck className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">No Active Journey</h2>
            <p className="text-text-secondary mb-4">
              You don't have any active journeys assigned at the moment.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile-First Header
  const renderHeader = () => (
    <div className="bg-surface border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Field Operations
            </h1>
            <p className="text-sm text-text-secondary">
              Journey #{currentJourney.id.slice(-6)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Online Status */}
          <Badge 
            variant={isOnline ? 'success' : 'error'} 
            className="text-xs flex items-center gap-1"
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          
          {/* GPS Status */}
          <Badge 
            variant={isLocationEnabled ? 'success' : 'error'} 
            className="text-xs flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            GPS
          </Badge>
        </div>
      </div>
    </div>
  );

  // Mobile-First Bottom Navigation
  const renderBottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setCurrentView('journey')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            currentView === 'journey' ? 'bg-primary/10 text-primary' : 'text-text-secondary'
          }`}
        >
          <Truck className="w-5 h-5 mb-1" />
          <span className="text-xs">Journey</span>
        </button>
        
        <button
          onClick={() => setCurrentView('steps')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            currentView === 'steps' ? 'bg-primary/10 text-primary' : 'text-text-secondary'
          }`}
        >
          <CheckCircle className="w-5 h-5 mb-1" />
          <span className="text-xs">Steps</span>
        </button>
        
        <button
          onClick={() => setCurrentView('media')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            currentView === 'media' ? 'bg-primary/10 text-primary' : 'text-text-secondary'
          }`}
        >
          <Camera className="w-5 h-5 mb-1" />
          <span className="text-xs">Media</span>
        </button>
        
        <button
          onClick={() => setCurrentView('chat')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            currentView === 'chat' ? 'bg-primary/10 text-primary' : 'text-text-secondary'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-xs">Chat</span>
        </button>
        
        <button
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            currentView === 'settings' ? 'bg-primary/10 text-primary' : 'text-text-secondary'
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Menu</span>
        </button>
      </div>
    </div>
  );

  // Main Content Area
  const renderMainContent = () => {
    switch (currentView) {
      case 'journey':
        return renderJourneyView();
      case 'steps':
        return renderStepsView();
      case 'media':
        return renderMediaView();
      case 'gps':
        return renderGPSView();
      case 'chat':
        return renderChatView();
      case 'settings':
        return renderSettingsView();
      default:
        return renderJourneyView();
    }
  };

  const renderJourneyView = () => (
    <div className="p-4 space-y-4 pb-20">
      {/* Journey Progress */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">Journey Progress</h3>
            <Badge variant="primary" className="text-xs">
              {progress?.toString() || '0'}% Complete
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-background rounded-full h-3 mb-4">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Started: {currentJourney.startTime ? new Date(currentJourney.startTime).toLocaleTimeString() : 'Not started'}</span>
            <span className="text-text-secondary">ETA: {currentJourney.estimatedCompletion ? new Date(currentJourney.estimatedCompletion).toLocaleTimeString() : 'Not set'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {getCurrentStep() && (
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-text-primary text-base">
                Current Step: {getCurrentStep()?.title}
              </CardTitle>
              <Badge 
                variant={getStepStatusColor(getCurrentStep()?.status || 'pending')}
                className="text-xs"
              >
                {getCurrentStep()?.status?.replace('_', ' ') || 'Unknown'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-text-secondary text-sm">
              {getCurrentStep()?.description}
            </p>
            
            {/* Step Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={() => completeJourneyStep(getCurrentStep()?.id || '')}
                className="flex-1 h-12"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Step
              </Button>
              <Button 
                variant="secondary"
                onClick={() => skipJourneyStep(getCurrentStep()?.id || '')}
                className="h-12"
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-text-primary text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => handleQuickAction('add_photo')}
              variant="secondary"
              className="h-12"
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
            <Button 
              onClick={() => handleQuickAction('update_location')}
              variant="secondary"
              className="h-12"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Update Location
            </Button>
            <Button 
              onClick={() => handleQuickAction('call_customer')}
              variant="secondary"
              className="h-12"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Customer
            </Button>
            <Button 
              onClick={() => handleQuickAction('report_issue')}
              variant="secondary"
              className="h-12"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepsView = () => (
    <div className="p-4 space-y-4 pb-20">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Journey Steps</h2>
      
      {journeySteps.map((step, index) => (
        <Card key={step.id} className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.description}</p>
                </div>
              </div>
              <Badge variant={getStepStatusColor(step.status)} className="text-xs">
                {step.status.replace('_', ' ')}
              </Badge>
            </div>
            
            {step.checklist && (
              <div className="mt-3 space-y-2">
                {step.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                    <span className={`text-sm ${item.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMediaView = () => (
    <div className="p-4 space-y-4 pb-20">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Media Upload</h2>
      
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Upload Media</h3>
            <p className="text-text-secondary mb-4">
              Capture photos and videos for this journey
            </p>
            <Button onClick={() => handleQuickAction('add_photo')} className="h-12">
              <Camera className="w-4 h-4 mr-2" />
              Open Camera
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGPSView = () => (
    <div className="p-4 space-y-4 pb-20">
      <h2 className="text-xl font-semibold text-text-primary mb-4">GPS Tracking</h2>
      
      {locationData && (
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-text-secondary">Current Location</p>
                <p className="text-text-primary font-medium">
                  {locationData.currentLocation.lat.toFixed(6)}, {locationData.currentLocation.lng.toFixed(6)}
                </p>
                <p className="text-xs text-text-secondary">
                  Accuracy: {locationData.currentLocation.accuracy.toFixed(0)}m
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => handleQuickAction('update_location')}
              className="w-full h-12"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderChatView = () => (
    <div className="p-4 space-y-4 pb-20">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Crew Chat</h2>
      
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Crew Communication</h3>
            <p className="text-text-secondary mb-4">
              Chat with your crew members
            </p>
            <Button variant="secondary" className="h-12">
              <MessageSquare className="w-4 h-4 mr-2" />
              Open Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsView = () => (
    <div className="p-4 space-y-4 pb-20">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Settings</h2>
      
      <Card className="bg-surface border-border">
        <CardContent className="p-4 space-y-4">
          <Button 
            onClick={handleSync}
            variant="secondary"
            className="w-full h-12"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Data
          </Button>
          
          <Button 
            onClick={handleJourneyControl}
            variant="secondary"
            className="w-full h-12"
          >
            {isJourneyActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isJourneyActive ? 'Pause Journey' : 'Start Journey'}
          </Button>
          
          <Button 
            onClick={logout}
            variant="error"
            className="w-full h-12"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {renderHeader()}
      {renderMainContent()}
      {renderBottomNavigation()}
    </div>
  );
}; 