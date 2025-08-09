'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { 
  MapPin, 
  Clock, 
  Users, 
  Camera, 
  CheckCircle,
  AlertCircle,
  Navigation,
  Phone,
  MessageCircle,
  ChevronRight,
  Truck,
  Package,
  FileText
} from 'lucide-react';

interface MobileJourneyCardProps {
  journey: any;
  userRole: string;
  onStartJourney?: (journeyId: string) => void;
  onCompleteStep?: (journeyId: string, stepId: string) => void;
  onTakePhoto?: (journeyId: string, stepId: string) => void;
}

export const MobileJourneyCard: React.FC<MobileJourneyCardProps> = ({
  journey,
  userRole,
  onStartJourney,
  onCompleteStep,
  onTakePhoto
}) => {
  const router = useRouter();
  const [expandedSteps, setExpandedSteps] = useState(false);

  // Simple journey steps based on SmartMoving workflow
  const getJourneySteps = () => {
    const baseSteps = [
      {
        id: 'morning_prep',
        title: 'Morning Preparation',
        description: 'Vehicle inspection & equipment check',
        icon: CheckCircle,
        status: journey.status === 'MORNING_PREP' ? 'active' : 
               ['EN_ROUTE', 'ONSITE', 'COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['photo', 'check'],
        required: true
      },
      {
        id: 'en_route',
        title: 'En Route to Customer',
        description: 'Traveling to pickup location',
        icon: Navigation,
        status: journey.status === 'EN_ROUTE' ? 'active' :
               ['ONSITE', 'COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['location', 'photo'],
        required: true
      },
      {
        id: 'arrival',
        title: 'Arrival at Location',
        description: 'Check-in with customer',
        icon: MapPin,
        status: journey.status === 'ONSITE' ? 'active' :
               ['COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['photo', 'signature'],
        required: true
      },
      {
        id: 'service',
        title: 'Service Execution',
        description: 'Perform moving/packing service',
        icon: Package,
        status: journey.status === 'ONSITE' ? 'active' :
               ['COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['photo', 'inventory', 'notes'],
        required: true
      },
      {
        id: 'completion',
        title: 'Job Completion',
        description: 'Final inspection & customer sign-off',
        icon: FileText,
        status: journey.status === 'COMPLETED' ? 'completed' : 'pending',
        actions: ['photo', 'signature', 'invoice'],
        required: true
      }
    ];

    return baseSteps;
  };

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
      case 'MORNING_PREP': return '🔧 Preparing';
      case 'EN_ROUTE': return '🚛 En Route';
      case 'ONSITE': return '📍 On Site';
      case 'COMPLETED': return '✅ Complete';
      case 'AUDITED': return '📋 Audited';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const steps = getJourneySteps();
  const currentStep = steps.find(step => step.status === 'active');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercent = (completedSteps / steps.length) * 100;

  return (
    <Card className="mb-4 border-l-4 border-l-primary hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg text-text-primary">
                {journey.truckNumber || 'Truck TBD'}
              </h3>
              <Badge variant={getStatusColor(journey.status)} className="text-xs">
                {getStatusText(journey.status)}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">Job #{journey.id.slice(-8)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">{formatDate(journey.date)}</p>
            <p className="text-xs text-text-secondary">{formatTime(journey.startTime || journey.date)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>Progress</span>
            <span>{completedSteps}/{steps.length} steps</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 p-3 bg-surface/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-secondary" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {journey.customerName || 'Customer TBD'}
                </p>
                <p className="text-xs text-text-secondary">
                  {journey.startLocation || journey.pickupAddress || 'Address loading...'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" className="p-2">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="p-2">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <currentStep.icon className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-text-primary">{currentStep.title}</h4>
            </div>
            <p className="text-sm text-text-secondary mb-3">{currentStep.description}</p>
            
            {/* Quick Actions for Current Step */}
            <div className="flex space-x-2">
              {currentStep.actions.includes('photo') && (
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => onTakePhoto?.(journey.id, currentStep.id)}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Photo
                </Button>
              )}
              {currentStep.actions.includes('check') && (
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => onCompleteStep?.(journey.id, currentStep.id)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              )}
              {currentStep.actions.includes('signature') && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Sign
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Steps Toggle */}
        <div className="border-t border-gray-700 pt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpandedSteps(!expandedSteps)}
            className="w-full justify-between"
          >
            <span>All Steps ({completedSteps}/{steps.length})</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${expandedSteps ? 'rotate-90' : ''}`} />
          </Button>
          
          {expandedSteps && (
            <div className="mt-3 space-y-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-3 p-2 rounded ${
                      step.status === 'completed' ? 'bg-success/10' :
                      step.status === 'active' ? 'bg-primary/10' :
                      'bg-surface/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-success text-white' :
                      step.status === 'active' ? 'bg-primary text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-success' :
                        step.status === 'active' ? 'text-primary' :
                        'text-text-secondary'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-text-secondary">{step.description}</p>
                    </div>
                    {step.status === 'active' && (
                      <div className="flex space-x-1">
                        {step.actions.includes('photo') && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            className="p-1"
                            onClick={() => onTakePhoto?.(journey.id, step.id)}
                          >
                            <Camera className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Action Button */}
        <div className="mt-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full min-h-[56px]"
            onClick={() => router.push(`/journey/${journey.id}`)}
          >
            <span className="text-base font-semibold">Start Journey</span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { 
  MapPin, 
  Clock, 
  Users, 
  Camera, 
  CheckCircle,
  AlertCircle,
  Navigation,
  Phone,
  MessageCircle,
  ChevronRight,
  Truck,
  Package,
  FileText
} from 'lucide-react';

interface MobileJourneyCardProps {
  journey: any;
  userRole: string;
  onStartJourney?: (journeyId: string) => void;
  onCompleteStep?: (journeyId: string, stepId: string) => void;
  onTakePhoto?: (journeyId: string, stepId: string) => void;
}

export const MobileJourneyCard: React.FC<MobileJourneyCardProps> = ({
  journey,
  userRole,
  onStartJourney,
  onCompleteStep,
  onTakePhoto
}) => {
  const router = useRouter();
  const [expandedSteps, setExpandedSteps] = useState(false);

  // Simple journey steps based on SmartMoving workflow
  const getJourneySteps = () => {
    const baseSteps = [
      {
        id: 'morning_prep',
        title: 'Morning Preparation',
        description: 'Vehicle inspection & equipment check',
        icon: CheckCircle,
        status: journey.status === 'MORNING_PREP' ? 'active' : 
               ['EN_ROUTE', 'ONSITE', 'COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['photo', 'check'],
        required: true
      },
      {
        id: 'en_route',
        title: 'En Route to Customer',
        description: 'Traveling to pickup location',
        icon: Navigation,
        status: journey.status === 'EN_ROUTE' ? 'active' :
               ['ONSITE', 'COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['location', 'photo'],
        required: true
      },
      {
        id: 'arrival',
        title: 'Arrival at Location',
        description: 'Check-in with customer',
        icon: MapPin,
        status: journey.status === 'ONSITE' ? 'active' :
               ['COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['photo', 'signature'],
        required: true
      },
      {
        id: 'service',
        title: 'Service Execution',
        description: 'Perform moving/packing service',
        icon: Package,
        status: journey.status === 'ONSITE' ? 'active' :
               ['COMPLETED', 'AUDITED'].includes(journey.status) ? 'completed' : 'pending',
        actions: ['photo', 'inventory', 'notes'],
        required: true
      },
      {
        id: 'completion',
        title: 'Job Completion',
        description: 'Final inspection & customer sign-off',
        icon: FileText,
        status: journey.status === 'COMPLETED' ? 'completed' : 'pending',
        actions: ['photo', 'signature', 'invoice'],
        required: true
      }
    ];

    return baseSteps;
  };

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
      case 'MORNING_PREP': return '🔧 Preparing';
      case 'EN_ROUTE': return '🚛 En Route';
      case 'ONSITE': return '📍 On Site';
      case 'COMPLETED': return '✅ Complete';
      case 'AUDITED': return '📋 Audited';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const steps = getJourneySteps();
  const currentStep = steps.find(step => step.status === 'active');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercent = (completedSteps / steps.length) * 100;

  return (
    <Card className="mb-4 border-l-4 border-l-primary hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg text-text-primary">
                {journey.truckNumber || 'Truck TBD'}
              </h3>
              <Badge variant={getStatusColor(journey.status)} className="text-xs">
                {getStatusText(journey.status)}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">Job #{journey.id.slice(-8)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">{formatDate(journey.date)}</p>
            <p className="text-xs text-text-secondary">{formatTime(journey.startTime || journey.date)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>Progress</span>
            <span>{completedSteps}/{steps.length} steps</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 p-3 bg-surface/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-secondary" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {journey.customerName || 'Customer TBD'}
                </p>
                <p className="text-xs text-text-secondary">
                  {journey.startLocation || journey.pickupAddress || 'Address loading...'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" className="p-2">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="p-2">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <currentStep.icon className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-text-primary">{currentStep.title}</h4>
            </div>
            <p className="text-sm text-text-secondary mb-3">{currentStep.description}</p>
            
            {/* Quick Actions for Current Step */}
            <div className="flex space-x-2">
              {currentStep.actions.includes('photo') && (
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => onTakePhoto?.(journey.id, currentStep.id)}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Photo
                </Button>
              )}
              {currentStep.actions.includes('check') && (
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => onCompleteStep?.(journey.id, currentStep.id)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              )}
              {currentStep.actions.includes('signature') && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Sign
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Steps Toggle */}
        <div className="border-t border-gray-700 pt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpandedSteps(!expandedSteps)}
            className="w-full justify-between"
          >
            <span>All Steps ({completedSteps}/{steps.length})</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${expandedSteps ? 'rotate-90' : ''}`} />
          </Button>
          
          {expandedSteps && (
            <div className="mt-3 space-y-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-3 p-2 rounded ${
                      step.status === 'completed' ? 'bg-success/10' :
                      step.status === 'active' ? 'bg-primary/10' :
                      'bg-surface/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-success text-white' :
                      step.status === 'active' ? 'bg-primary text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-success' :
                        step.status === 'active' ? 'text-primary' :
                        'text-text-secondary'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-text-secondary">{step.description}</p>
                    </div>
                    {step.status === 'active' && (
                      <div className="flex space-x-1">
                        {step.actions.includes('photo') && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            className="p-1"
                            onClick={() => onTakePhoto?.(journey.id, step.id)}
                          >
                            <Camera className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Action Button */}
        <div className="mt-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full min-h-[56px]"
            onClick={() => router.push(`/journey/${journey.id}`)}
          >
            <span className="text-base font-semibold">Start Journey</span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};