'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  Save,
  X
} from 'lucide-react';
import { useJourneyStore } from '@/stores/journeyStore';
import toast from 'react-hot-toast';

interface JourneyFormData {
  truckNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  crewMembers: string[];
  status: string;
}

const initialFormData: JourneyFormData = {
  truckNumber: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  location: '',
  notes: '',
  crewMembers: [],
  status: 'MORNING_PREP'
};

export default function CreateJourneyPage() {
  const router = useRouter();
  const { addJourney } = useJourneyStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JourneyFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', icon: Truck },
    { id: 2, title: 'Schedule', icon: Calendar },
    { id: 3, title: 'Crew', icon: Users },
    { id: 4, title: 'Review', icon: Check }
  ];

  const handleInputChange = (field: keyof JourneyFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newJourney = {
        id: `journey_${Date.now()}`,
        truckNumber: formData.truckNumber,
        date: formData.date,
        status: 'MORNING_PREP' as const,
        notes: formData.notes,
        locationId: 'default-location',
        clientId: 'default-client',
        createdById: 'default-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      addJourney(newJourney);
      toast.success('Journey created successfully!');
      router.push('/journeys');
    } catch (error) {
      toast.error('Failed to create journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.truckNumber && formData.location;
      case 2:
        return formData.date && formData.startTime;
      case 3:
        return formData.crewMembers.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Truck Number *
              </label>
              <Input
                placeholder="Enter truck number (e.g., TRK-2024-001)"
                value={formData.truckNumber}
                onChange={(e) => handleInputChange('truckNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Location *
              </label>
              <Input
                placeholder="Enter location address"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Enter any special instructions or notes..."
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Initial Status
              </label>
              <select
                className="w-full px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="MORNING_PREP">Morning Prep</option>
                <option value="EN_ROUTE">En Route</option>
                <option value="ONSITE">On Site</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assign Crew Members *
              </label>
              <div className="space-y-2">
                {['Driver', 'Mover 1', 'Mover 2'].map((role, index) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Enter ${role} name`}
                      value={formData.crewMembers[index] || ''}
                      onChange={(e) => {
                        const newCrew = [...formData.crewMembers];
                        newCrew[index] = e.target.value;
                        handleInputChange('crewMembers', newCrew);
                      }}
                    />
                    <Badge variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-surface/50 rounded-lg">
              <p className="text-sm text-text-secondary">
                <Users className="w-4 h-4 inline mr-2" />
                Crew members will be notified once the journey is created
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Journey Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Truck:</span>
                    <span className="text-text-primary">{formData.truckNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Location:</span>
                    <span className="text-text-primary">{formData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Date:</span>
                    <span className="text-text-primary">{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Status:</span>
                    <Badge variant="warning" className="text-xs">
                      {formData.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Start Time:</span>
                    <span className="text-text-primary">{formData.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">End Time:</span>
                    <span className="text-text-primary">{formData.endTime || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Crew Size:</span>
                    <span className="text-text-primary">{formData.crewMembers.filter(m => m).length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            {formData.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary">{formData.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Create New Journey</h1>
            <p className="text-text-secondary text-sm">Set up a new truck journey</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                    ${isActive ? 'bg-primary border-primary text-white' : ''}
                    ${isCompleted ? 'bg-success border-success text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-600 text-text-secondary' : ''}
                  `}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`
                    ml-2 text-sm font-medium
                    ${isActive ? 'text-text-primary' : 'text-text-secondary'}
                  `}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-12 h-0.5 mx-4
                      ${isCompleted ? 'bg-success' : 'bg-gray-600'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Step {currentStep}: {steps[currentStep - 1]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => router.push('/journeys')}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid(currentStep)}
            >
              {isSubmitting ? 'Creating...' : 'Create Journey'}
              <Truck className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 