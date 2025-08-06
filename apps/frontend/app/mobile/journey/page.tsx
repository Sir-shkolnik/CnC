'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Video,
  LogOut
} from 'lucide-react';
import { ReadyToGoStep } from '@/components/JourneyManagement/JourneySteps/ReadyToGoStep';
import { PointsAStep } from '@/components/JourneyManagement/JourneySteps/PointsAStep';
import { NewLocationStep } from '@/components/JourneyManagement/JourneySteps/NewLocationStep';
import { BackToDispatcherStep } from '@/components/JourneyManagement/JourneySteps/BackToDispatcherStep';
import { toast } from 'react-hot-toast';

export default function MobileJourneyPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { superAdmin, isAuthenticated: isSuperAdminAuthenticated, logout: superAdminLogout } = useSuperAdminStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [journeyId, setJourneyId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Mobile Journey - Auth Check:', { 
      isAuthenticated, 
      user, 
      isSuperAdminAuthenticated, 
      superAdmin 
    });
    
    if ((!isAuthenticated || !user) && (!isSuperAdminAuthenticated || !superAdmin)) {
      console.log('Mobile Journey - Redirecting to login');
      router.push('/mobile');
      return;
    }

    const currentUser = user || superAdmin;
    console.log('Mobile Journey - User authenticated:', currentUser);
    // Generate a journey ID for this session
    setJourneyId(`journey_${currentUser?.id}_${Date.now()}`);
  }, [isAuthenticated, user, isSuperAdminAuthenticated, superAdmin, router]);

  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
    } else if (isSuperAdminAuthenticated) {
      superAdminLogout();
    }
    router.push('/mobile');
    toast.success('Logged out successfully');
  };

  const handleStepComplete = (stepNumber: number) => {
    setCurrentStep(stepNumber + 1);
    toast.success(`Step ${stepNumber} completed!`);
  };

  const handleBackToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  if ((!isAuthenticated || !user) && (!isSuperAdminAuthenticated || !superAdmin)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/mobile')}
              className="text-text-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Field Operations</h1>
              <p className="text-sm text-text-secondary">Journey Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-xs">
              {(user || superAdmin)?.role}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-text-secondary"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-primary text-white'
                    : step < currentStep
                    ? 'bg-success text-white'
                    : 'bg-surface border border-border text-text-secondary'
                }`}
              >
                {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-success' : 'bg-surface border border-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex items-center justify-between mb-6 text-xs text-text-secondary">
          <span className={currentStep === 1 ? 'text-primary font-medium' : ''}>
            Ready to Go
          </span>
          <span className={currentStep === 2 ? 'text-primary font-medium' : ''}>
            Points A
          </span>
          <span className={currentStep === 3 ? 'text-primary font-medium' : ''}>
            New Location
          </span>
          <span className={currentStep === 4 ? 'text-primary font-medium' : ''}>
            Back to Dispatcher
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-4 pb-4">
        {currentStep === 1 && (
          <ReadyToGoStep
            journeyId={journeyId || ''}
            userRole={(user || superAdmin)?.role || 'USER'}
            onStepComplete={handleStepComplete}
          />
        )}

        {currentStep === 2 && (
          <PointsAStep
            journeyId={journeyId || ''}
            userRole={(user || superAdmin)?.role || 'USER'}
            onStepComplete={handleStepComplete}
          />
        )}

        {currentStep === 3 && (
          <NewLocationStep
            journeyId={journeyId || ''}
            userRole={(user || superAdmin)?.role || 'USER'}
            onStepComplete={handleStepComplete}
          />
        )}

        {currentStep === 4 && (
          <BackToDispatcherStep
            journeyId={journeyId || ''}
            userRole={(user || superAdmin)?.role || 'USER'}
            onStepComplete={handleStepComplete}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep > 1 && (
        <div className="fixed bottom-4 left-4 right-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleBackToStep(currentStep - 1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Step
            </Button>
            {currentStep < 4 && (
              <Button
                onClick={() => handleStepComplete(currentStep)}
                className="flex-1"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 