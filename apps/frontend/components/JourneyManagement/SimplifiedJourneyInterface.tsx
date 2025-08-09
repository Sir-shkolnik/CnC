'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { 
  CheckCircle,
  Circle,
  Camera,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  User,
  Truck,
  Package,
  FileText,
  Navigation,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Upload,
  Edit3
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed';
  actions: string[];
  required: boolean;
  photoRequired: boolean;
  hasPhoto?: boolean;
  hasNotes?: boolean;
  checklist: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

interface SimplifiedJourneyInterfaceProps {
  journeyId: string;
  journey: any;
  userRole: 'DRIVER' | 'MOVER';
}

export const SimplifiedJourneyInterface: React.FC<SimplifiedJourneyInterfaceProps> = ({
  journeyId,
  journey,
  userRole
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showStepDetails, setShowStepDetails] = useState(false);

  // Get role-specific journey steps
  const getJourneySteps = (): JourneyStep[] => {
    if (userRole === 'DRIVER') {
      return [
        {
          id: 'morning_prep',
          title: 'Morning Preparation',
          description: 'Vehicle inspection & equipment check',
          icon: CheckCircle,
          status: getStepStatus('morning_prep'),
          actions: ['photo', 'checklist'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'truck_condition', title: 'Check truck condition (tires, fluids, lights)', completed: false },
            { id: 'equipment_check', title: 'Verify equipment (straps, dollies, blankets)', completed: false },
            { id: 'route_review', title: 'Review journey details and route', completed: false }
          ]
        },
        {
          id: 'en_route',
          title: 'En Route to Customer',
          description: 'Traveling to pickup location',
          icon: Navigation,
          status: getStepStatus('en_route'),
          actions: ['gps', 'photo', 'contact'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'gps_start', title: 'Start GPS navigation', completed: false },
            { id: 'status_update', title: 'Update status to "En Route"', completed: false },
            { id: 'customer_contact', title: 'Contact customer if needed', completed: false }
          ]
        },
        {
          id: 'arrival',
          title: 'Arrival at Location',
          description: 'Check-in with customer',
          icon: MapPin,
          status: getStepStatus('arrival'),
          actions: ['photo', 'contact', 'checklist'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'customer_confirm', title: 'Confirm arrival with customer', completed: false },
            { id: 'parking_access', title: 'Assess parking/access', completed: false },
            { id: 'team_coordinate', title: 'Coordinate with mover team', completed: false }
          ]
        },
        {
          id: 'loading',
          title: 'Loading/Service Execution',
          description: 'Oversee loading and transportation',
          icon: Package,
          status: getStepStatus('loading'),
          actions: ['photo', 'checklist', 'notes'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'monitor_loading', title: 'Monitor loading process', completed: false },
            { id: 'secure_cargo', title: 'Secure cargo properly', completed: false },
            { id: 'safety_checks', title: 'Complete safety checks', completed: false }
          ]
        },
        {
          id: 'completion',
          title: 'Journey Completion',
          description: 'Final delivery and customer sign-off',
          icon: FileText,
          status: getStepStatus('completion'),
          actions: ['photo', 'signature', 'notes'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'delivery_confirm', title: 'Confirm delivery completion', completed: false },
            { id: 'customer_signature', title: 'Get customer signature/approval', completed: false },
            { id: 'final_status', title: 'Update final status', completed: false }
          ]
        }
      ];
    } else {
      // MOVER steps
      return [
        {
          id: 'assessment',
          title: 'Pre-Move Assessment',
          description: 'Site assessment and preparation',
          icon: CheckCircle,
          status: getStepStatus('assessment'),
          actions: ['photo', 'checklist', 'notes'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'walkthrough', title: 'Walk-through with customer', completed: false },
            { id: 'fragile_items', title: 'Identify fragile/valuable items', completed: false },
            { id: 'access_points', title: 'Check access points (stairs, elevators, doors)', completed: false },
            { id: 'protective_materials', title: 'Set up protective materials', completed: false }
          ]
        },
        {
          id: 'packing',
          title: 'Packing & Protection',
          description: 'Prepare items for transport',
          icon: Package,
          status: getStepStatus('packing'),
          actions: ['photo', 'inventory', 'notes'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'wrap_furniture', title: 'Wrap furniture in blankets/plastic', completed: false },
            { id: 'pack_fragile', title: 'Pack fragile items carefully', completed: false },
            { id: 'label_items', title: 'Label boxes and items', completed: false },
            { id: 'inventory_list', title: 'Create inventory list', completed: false }
          ]
        },
        {
          id: 'loading_ops',
          title: 'Loading Operations',
          description: 'Load items into truck safely',
          icon: Truck,
          status: getStepStatus('loading_ops'),
          actions: ['photo', 'checklist', 'notes'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'systematic_loading', title: 'Load items systematically (heavy first)', completed: false },
            { id: 'secure_items', title: 'Secure items with straps/ties', completed: false },
            { id: 'space_efficiency', title: 'Maximize space efficiency', completed: false },
            { id: 'load_inspection', title: 'Final load inspection', completed: false }
          ]
        },
        {
          id: 'delivery',
          title: 'Delivery & Unloading',
          description: 'Unload and place items at destination',
          icon: MapPin,
          status: getStepStatus('delivery'),
          actions: ['photo', 'placement', 'notes'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'careful_unload', title: 'Unload items carefully', completed: false },
            { id: 'room_placement', title: 'Place items in designated rooms', completed: false },
            { id: 'remove_protection', title: 'Remove protective materials', completed: false },
            { id: 'damage_check', title: 'Check for any damage', completed: false }
          ]
        },
        {
          id: 'customer_signoff',
          title: 'Customer Sign-Off',
          description: 'Final inspection and customer approval',
          icon: FileText,
          status: getStepStatus('customer_signoff'),
          actions: ['photo', 'signature', 'cleanup'],
          required: true,
          photoRequired: true,
          checklist: [
            { id: 'customer_walkthrough', title: 'Walk through with customer', completed: false },
            { id: 'address_concerns', title: 'Address any concerns', completed: false },
            { id: 'get_signature', title: 'Get customer signature/approval', completed: false },
            { id: 'cleanup_debris', title: 'Clean up any debris', completed: false }
          ]
        }
      ];
    }
  };

  const steps = getJourneySteps();
  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercent = (completedSteps / steps.length) * 100;

  function getStepStatus(stepId: string): 'pending' | 'active' | 'completed' {
    // This would normally come from the journey data
    // For now, simulate based on journey status
    const journeyStatus = journey?.status || 'MORNING_PREP';
    
    switch (stepId) {
      case 'morning_prep':
      case 'assessment':
        return journeyStatus === 'MORNING_PREP' ? 'active' : 
               ['EN_ROUTE', 'ONSITE', 'COMPLETED'].includes(journeyStatus) ? 'completed' : 'pending';
      case 'en_route':
      case 'packing':
        return journeyStatus === 'EN_ROUTE' ? 'active' :
               ['ONSITE', 'COMPLETED'].includes(journeyStatus) ? 'completed' : 'pending';
      case 'arrival':
      case 'loading_ops':
        return journeyStatus === 'ONSITE' ? 'active' :
               journeyStatus === 'COMPLETED' ? 'completed' : 'pending';
      case 'loading':
      case 'delivery':
        return journeyStatus === 'ONSITE' ? 'active' :
               journeyStatus === 'COMPLETED' ? 'completed' : 'pending';
      case 'completion':
      case 'customer_signoff':
        return journeyStatus === 'COMPLETED' ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  }

  const handleTakePhoto = (stepId: string) => {
    toast.success('📷 Camera opened for step documentation');
    // In production: open camera interface
  };

  const handleCompleteChecklist = (stepId: string, checklistId: string) => {
    toast.success('✅ Checklist item completed');
    // Update checklist item status
  };

  const handleCompleteStep = (stepId: string) => {
    toast.success('🎉 Step completed successfully!');
    // Move to next step
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleContactCustomer = () => {
    toast.success('📞 Customer contact opened');
    // In production: open phone/message interface
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

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">
              {userRole === 'DRIVER' ? '🚛 Driver' : '👷 Mover'} Journey
            </h1>
            <p className="text-sm text-text-secondary">
              Job #{journey.id.slice(-8)} • {formatDate(journey.date)} • {formatTime(journey.startTime || journey.date)}
            </p>
          </div>
          <Badge variant="info" className="text-xs">
            {userRole}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Journey Progress</span>
            <span>{completedSteps}/{steps.length} steps completed</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="mb-6 border-l-4 border-l-secondary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {journey.customerName || 'Customer TBD'}
                </h3>
                <p className="text-sm text-text-secondary">
                  {journey.startLocation || journey.pickupAddress || 'Address loading...'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" className="p-2" onClick={handleContactCustomer}>
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="p-2" onClick={handleContactCustomer}>
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Pickup:</span>
              <p className="text-text-primary font-medium">
                {journey.startLocation || 'Loading...'}
              </p>
            </div>
            <div>
              <span className="text-text-secondary">Delivery:</span>
              <p className="text-text-primary font-medium">
                {journey.endLocation || 'Loading...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Card */}
      {currentStep && (
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentStep.status === 'completed' ? 'bg-success' :
                currentStep.status === 'active' ? 'bg-primary' :
                'bg-gray-600'
              }`}>
                {currentStep.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <currentStep.icon className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {currentStep.title}
                </h3>
                <p className="text-text-secondary mb-3">
                  {currentStep.description}
                </p>
                
                {/* Step Status */}
                <div className="flex items-center space-x-2 mb-4">
                  <Badge 
                    variant={
                      currentStep.status === 'completed' ? 'success' :
                      currentStep.status === 'active' ? 'info' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {currentStep.status === 'completed' ? '✅ Completed' :
                     currentStep.status === 'active' ? '🔄 In Progress' :
                     '⏳ Pending'}
                  </Badge>
                  {currentStep.photoRequired && (
                    <Badge variant="warning" className="text-xs">
                      📷 Photo Required
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleTakePhoto(currentStep.id)}
                    className="flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => handleCompleteStep(currentStep.id)}
                    className="flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-medium text-text-primary mb-3">Step Checklist:</h4>
              <div className="space-y-2">
                {currentStep.checklist.map((item, index) => (
                  <div 
                    key={item.id}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-surface/30"
                  >
                    <button
                      onClick={() => handleCompleteChecklist(currentStep.id, item.id)}
                      className="flex-shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <span className={`text-sm ${
                      item.completed ? 'text-success line-through' : 'text-text-primary'
                    }`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Steps Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">All Journey Steps</h3>
            <Badge variant="info" className="text-xs">
              {completedSteps}/{steps.length} Complete
            </Badge>
          </div>
          
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(index)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    index === currentStepIndex ? 'bg-primary/20 border border-primary/30' :
                    step.status === 'completed' ? 'bg-success/10' :
                    'bg-surface/30 hover:bg-surface/50'
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
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-success' :
                      step.status === 'active' ? 'text-primary' :
                      'text-text-primary'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-text-secondary">{step.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};