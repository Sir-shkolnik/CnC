'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Eye,
  Navigation,
  Camera
} from 'lucide-react';

interface DispatcherJourneyInterfaceProps {
  journeyId: string;
  journey: any;
}

export const DispatcherJourneyInterface: React.FC<DispatcherJourneyInterfaceProps> = ({ 
  journeyId, 
  journey 
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [journeyData, setJourneyData] = useState(journey);

  // 4-Step Dispatcher Workflow
  const dispatcherSteps = [
    {
      id: 1,
      title: 'Create & Plan',
      icon: Truck,
      status: 'completed',
      actions: ['Create Journey', 'Set Route', 'Add Customer Info'],
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Assign Crew',
      icon: Users,
      status: 'active',
      actions: ['Assign Driver', 'Assign Movers', 'Send Notifications'],
      color: 'bg-orange-500'
    },
    {
      id: 3,
      title: 'Monitor Progress',
      icon: Navigation,
      status: 'pending',
      actions: ['Track GPS', 'Receive Updates', 'Handle Issues'],
      color: 'bg-green-500'
    },
    {
      id: 4,
      title: 'Complete & Review',
      icon: CheckCircle,
      status: 'pending',
      actions: ['Review Photos', 'Confirm Completion', 'Generate Invoice'],
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    { label: 'Call Driver', icon: Phone, action: 'call_driver', urgent: false },
    { label: 'Send Message', icon: MessageSquare, action: 'send_message', urgent: false },
    { label: 'Emergency Stop', icon: AlertTriangle, action: 'emergency', urgent: true },
    { label: 'Add Crew', icon: Plus, action: 'add_crew', urgent: false }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'call_driver':
        // Implement call functionality
        break;
      case 'send_message':
        // Open messaging modal
        break;
      case 'emergency':
        // Handle emergency stop
        break;
      case 'add_crew':
        // Open crew assignment
        break;
    }
  };

  const handleStepAction = (stepId: number, actionIndex: number) => {
    // Handle step-specific actions
    console.log(`Step ${stepId}, Action ${actionIndex}`);
  };

  const renderStepContent = (step: any) => {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center`}>
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <Badge variant={step.status === 'completed' ? 'success' : step.status === 'active' ? 'warning' : 'secondary'}>
                  {step.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Step {step.id} of 4</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {step.actions.map((action: string, index: number) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                className="justify-start h-auto p-3"
                onClick={() => handleStepAction(step.id, index)}
                disabled={step.status === 'completed'}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${step.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm">{action}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Journey Header - Dispatcher View */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Journey #{journeyId}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Toronto → Ottawa
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Today, 9:00 AM
                  </div>
                  <Badge variant="warning">Active</Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.urgent ? "danger" : "secondary"}
                  size="sm"
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center space-x-1"
                >
                  <action.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="w-5 h-5 mr-2" />
            Journey Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {dispatcherSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
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
                <div className="ml-2 text-center">
                  <div className={`text-sm font-medium ${
                    step.status === 'active' ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < dispatcherSteps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Step: {dispatcherSteps.find(s => s.status === 'active')?.title}</h3>
          {dispatcherSteps
            .filter(step => step.status === 'active' || step.status === 'pending')
            .slice(0, 2)
            .map(step => renderStepContent(step))
          }
        </div>
        
        {/* Live Updates */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Live Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Driver confirmed departure</div>
                    <div className="text-xs text-gray-500">2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Camera className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Vehicle inspection photos uploaded</div>
                    <div className="text-xs text-gray-500">5 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Crew assignment completed</div>
                    <div className="text-xs text-gray-500">15 minutes ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CRUD Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Dispatcher Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="secondary" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <Edit className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm">Edit Journey</div>
              </div>
            </Button>
            <Button variant="secondary" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm">Manage Crew</div>
              </div>
            </Button>
            <Button variant="secondary" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm">Send Message</div>
              </div>
            </Button>
            <Button variant="secondary" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm">View Reports</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};