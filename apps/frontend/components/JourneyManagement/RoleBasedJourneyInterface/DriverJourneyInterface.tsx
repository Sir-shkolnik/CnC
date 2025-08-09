'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Navigation, 
  Camera, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Upload,
  MessageSquare,
  Truck,
  Route,
  Timer
} from 'lucide-react';

interface DriverJourneyInterfaceProps {
  journeyId: string;
  journey: any;
}

export const DriverJourneyInterface: React.FC<DriverJourneyInterfaceProps> = ({ 
  journeyId, 
  journey 
}) => {
  const [currentLocation, setCurrentLocation] = useState('Loading...');
  const [isTracking, setIsTracking] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);

  // Driver-specific workflow steps
  const driverSteps = [
    {
      id: 1,
      title: 'Vehicle Check',
      icon: Truck,
      status: 'completed',
      required: ['Exterior inspection', 'Interior check', 'Equipment verification'],
      color: 'bg-green-500'
    },
    {
      id: 2,
      title: 'En Route to Pickup',
      icon: Navigation,
      status: 'active',
      required: ['Start GPS tracking', 'Confirm ETA', 'Update dispatcher'],
      color: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'At Pickup Location',
      icon: MapPin,
      status: 'pending',
      required: ['Arrival photo', 'Customer contact', 'Inventory check'],
      color: 'bg-orange-500'
    },
    {
      id: 4,
      title: 'Loading Complete',
      icon: Upload,
      status: 'pending',
      required: ['Loading photos', 'Customer signature', 'Departure confirmation'],
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    { 
      label: 'Take Photo', 
      icon: Camera, 
      action: 'camera',
      color: 'bg-blue-500',
      urgent: false 
    },
    { 
      label: 'Call Dispatcher', 
      icon: Phone, 
      action: 'call',
      color: 'bg-green-500',
      urgent: false 
    },
    { 
      label: 'Report Issue', 
      icon: AlertTriangle, 
      action: 'report',
      color: 'bg-red-500',
      urgent: true 
    },
    { 
      label: 'Send Message', 
      icon: MessageSquare, 
      action: 'message',
      color: 'bg-indigo-500',
      urgent: false 
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'camera':
        // Open camera for photo capture
        break;
      case 'call':
        // Initiate call to dispatcher
        break;
      case 'report':
        // Open issue reporting modal
        break;
      case 'message':
        // Open messaging interface
        break;
    }
  };

  const handleStepComplete = (stepId: number) => {
    // Mark step as complete and move to next
    setCurrentStep(stepId + 1);
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    // Implement GPS tracking logic
  };

  const renderCurrentStep = () => {
    const step = driverSteps.find(s => s.id === currentStep);
    if (!step) return null;

    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${step.color} flex items-center justify-center`}>
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <Badge variant="warning">Current Step</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Step {step.id} of {driverSteps.length}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Required Actions:</h4>
            {step.required.map((requirement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{requirement}</span>
                </div>
                <Button size="sm" variant="secondary">
                  Complete
                </Button>
              </div>
            ))}
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={() => handleStepComplete(step.id)}
            >
              Complete {step.title}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Mobile Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Truck className="w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold">Journey #{journeyId}</h1>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm opacity-90">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Toronto → Ottawa
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                9:00 AM
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Tracking Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-blue-500" />
              <span className="font-medium">GPS Tracking</span>
            </div>
            <Button
              variant={isTracking ? "danger" : "primary"}
              size="sm"
              onClick={toggleTracking}
              className="flex items-center space-x-1"
            >
              {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTracking ? 'Stop' : 'Start'}</span>
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Current Location:</span>
              <span className="font-medium">{currentLocation}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>ETA to Pickup:</span>
              <span className="font-medium text-green-600">23 minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {driverSteps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'active' ? step.color :
                'bg-gray-300'
              }`}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>
            <span className={`text-xs mt-1 text-center ${
              step.status === 'active' ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}>
              {step.title.split(' ')[0]}
            </span>
            {index < driverSteps.length - 1 && (
              <div className={`w-16 h-1 mt-2 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Details */}
      {renderCurrentStep()}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.urgent ? "danger" : "secondary"}
                className="flex flex-col items-center justify-center h-20 p-3"
                onClick={() => handleQuickAction(action.action)}
              >
                <action.icon className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Timer className="w-5 h-5 mr-2" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm font-medium">Vehicle inspection completed</div>
                <div className="text-xs text-gray-500">5 minutes ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Navigation className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">GPS tracking started</div>
                <div className="text-xs text-gray-500">8 minutes ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">Emergency Contact</span>
            </div>
            <Button variant="danger" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};