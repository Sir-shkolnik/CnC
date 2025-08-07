'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Pause,
  Camera,
  MapPin,
  Users,
  Truck,
  Package,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JourneyPhase {
  id: string;
  phaseNumber: number;
  phaseName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime?: string;
  completionTime?: string;
  checklistItems: any[];
  mediaRequirements: any[];
  responsibleRoles: string[];
}

interface JourneyProgressProps {
  journeyId: string;
  currentPhase?: number;
  progress?: number;
  phases?: JourneyPhase[];
}

export function JourneyProgress({ journeyId, currentPhase = 1, progress = 0, phases = [] }: JourneyProgressProps) {
  const [activePhase, setActivePhase] = useState(currentPhase);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActivePhase(currentPhase);
  }, [currentPhase]);

  const handlePhaseStart = async (phaseId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/journey-workflow/${journeyId}/phases/${phaseId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Phase started successfully');
        // Refresh phases data
        window.location.reload();
      } else {
        toast.error('Failed to start phase');
      }
    } catch (error) {
      toast.error('Error starting phase');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhaseComplete = async (phaseId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/journey-workflow/${journeyId}/phases/${phaseId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Phase completed successfully');
        // Refresh phases data
        window.location.reload();
      } else {
        toast.error('Failed to complete phase');
      }
    } catch (error) {
      toast.error('Error completing phase');
    } finally {
      setIsLoading(false);
    }
  };

  const getPhaseIcon = (phaseName: string) => {
    switch (phaseName) {
      case 'JOURNEY_CREATION':
        return <Truck className="w-5 h-5" />;
      case 'MORNING_PREP':
        return <Clock className="w-5 h-5" />;
      case 'PICKUP_OPERATIONS':
        return <Package className="w-5 h-5" />;
      case 'TRANSPORT_OPERATIONS':
        return <MapPin className="w-5 h-5" />;
      case 'DELIVERY_OPERATIONS':
        return <Home className="w-5 h-5" />;
      case 'JOURNEY_COMPLETION':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getPhaseColor = (status: string, phaseNumber: number) => {
    if (status === 'COMPLETED') return 'success';
    if (status === 'IN_PROGRESS') return 'warning';
    if (phaseNumber === activePhase) return 'primary';
    return 'default';
  };

  const getPhaseStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const canStartPhase = (phase: JourneyPhase) => {
    return phase.status === 'PENDING' && phase.phaseNumber === activePhase;
  };

  const canCompletePhase = (phase: JourneyPhase) => {
    return phase.status === 'IN_PROGRESS' && phase.phaseNumber === activePhase;
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-surface rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text-primary">Journey Progress</h3>
          <Badge variant="primary" className="text-sm">
            {progress.toFixed(1)}% Complete
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-background rounded-full h-3 mb-4">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Phase {activePhase} of 6</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Phases Container */}
      <div className="grid gap-4">
        {phases.map((phase, index) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isActive={phase.phaseNumber === activePhase}
            canStart={canStartPhase(phase)}
            canComplete={canCompletePhase(phase)}
            onStart={() => handlePhaseStart(phase.id)}
            onComplete={() => handlePhaseComplete(phase.id)}
            isLoading={isLoading}
            getPhaseIcon={getPhaseIcon}
            getPhaseColor={getPhaseColor}
            getPhaseStatusText={getPhaseStatusText}
          />
        ))}
      </div>
    </div>
  );
}

interface PhaseCardProps {
  phase: JourneyPhase;
  isActive: boolean;
  canStart: boolean;
  canComplete: boolean;
  onStart: () => void;
  onComplete: () => void;
  isLoading: boolean;
  getPhaseIcon: (phaseName: string) => React.ReactNode;
  getPhaseColor: (status: string, phaseNumber: number) => string;
  getPhaseStatusText: (status: string) => string;
}

function PhaseCard({
  phase,
  isActive,
  canStart,
  canComplete,
  onStart,
  onComplete,
  isLoading,
  getPhaseIcon,
  getPhaseColor,
  getPhaseStatusText
}: PhaseCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className={`transition-all duration-200 ${
      isActive ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface">
              {getPhaseIcon(phase.phaseName)}
            </div>
            <div>
              <CardTitle className="text-lg">
                Phase {phase.phaseNumber}: {phase.phaseName.replace('_', ' ')}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getPhaseColor(phase.status, phase.phaseNumber) as any}>
                  {getPhaseStatusText(phase.status)}
                </Badge>
                <span className="text-sm text-text-secondary">
                  {phase.responsibleRoles.join(', ')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canStart && (
              <Button
                onClick={onStart}
                disabled={isLoading}
                size="sm"
                variant="primary"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}
            
            {canComplete && (
              <Button
                onClick={onComplete}
                disabled={isLoading}
                size="sm"
                variant="success"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete
              </Button>
            )}
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              size="sm"
              variant="ghost"
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Checklist Items */}
            <div>
              <h4 className="font-medium text-text-primary mb-2">Checklist Items</h4>
              <div className="space-y-2">
                {phase.checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm text-text-secondary">{item.title}</span>
                    {item.mediaRequired && (
                      <Camera className="w-4 h-4 text-warning" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Media Requirements */}
            {phase.mediaRequirements.length > 0 && (
              <div>
                <h4 className="font-medium text-text-primary mb-2">Media Requirements</h4>
                <div className="space-y-2">
                  {phase.mediaRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-primary" />
                      <span className="text-sm text-text-secondary">{req.title}</span>
                      {req.required && (
                        <Badge variant="warning" size="sm">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timing Information */}
            {(phase.startTime || phase.completionTime) && (
              <div>
                <h4 className="font-medium text-text-primary mb-2">Timing</h4>
                <div className="space-y-1 text-sm text-text-secondary">
                  {phase.startTime && (
                    <div>Started: {new Date(phase.startTime).toLocaleString()}</div>
                  )}
                  {phase.completionTime && (
                    <div>Completed: {new Date(phase.completionTime).toLocaleString()}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
