'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  ArrowLeft, 
  Package, 
  Camera, 
  Video, 
  CheckCircle, 
  AlertCircle,
  Clock,
  UserCheck,
  Truck,
  FileText,
  Wrench,
  Fuel
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface BackToDispatcherStepProps {
  journeyId: string;
  userRole: string;
  onStepComplete: (stepNumber: number) => void;
}

interface EquipmentReturn {
  toolsReturned: boolean;
  safetyEquipment: boolean;
  packingMaterials: boolean;
  missingItems: string[];
  photos: string[];
}

interface TruckReturn {
  fuelLevel: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  damageReport: string;
  maintenanceNeeded: string[];
  photos: string[];
}

interface JourneySummary {
  totalTime: string;
  distanceTraveled: number;
  issuesEncountered: string;
  recommendations: string;
  photos: string[];
}

export const BackToDispatcherStep: React.FC<BackToDispatcherStepProps> = ({
  journeyId,
  userRole,
  onStepComplete
}) => {
  const { user } = useAuthStore();
  const [stepStatus, setStepStatus] = useState<'pending' | 'in_progress' | 'completed' | 'approved'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  // Manager state
  const [journeySummary, setJourneySummary] = useState<JourneySummary>({
    totalTime: '',
    distanceTraveled: 0,
    issuesEncountered: '',
    recommendations: '',
    photos: []
  });

  // Driver state
  const [truckReturn, setTruckReturn] = useState<TruckReturn>({
    fuelLevel: 0,
    condition: 'good',
    damageReport: '',
    maintenanceNeeded: [],
    photos: []
  });

  // Mover state
  const [equipmentReturn, setEquipmentReturn] = useState<EquipmentReturn>({
    toolsReturned: false,
    safetyEquipment: false,
    packingMaterials: false,
    missingItems: [],
    photos: []
  });

  // Common state
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadStepData();
  }, [journeyId]);

  const loadStepData = async () => {
    try {
      // TODO: Load step data from API
      console.log('Loading Back to Dispatcher step data for journey:', journeyId);
    } catch (error) {
      console.error('Failed to load step data:', error);
    }
  };

  const startStep = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to start step
      setStepStatus('in_progress');
      toast.success('Step 4: Back to Dispatcher started');
    } catch (error) {
      toast.error('Failed to start step');
    } finally {
      setIsLoading(false);
    }
  };

  const completeStep = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to complete step
      setStepStatus('completed');
      onStepComplete(4);
      toast.success('Journey completed successfully!');
    } catch (error) {
      toast.error('Failed to complete journey');
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (activityType: string, data: any) => {
    try {
      // TODO: Call API to add activity
      console.log('Adding activity:', activityType, data);
      toast.success('Activity added successfully');
    } catch (error) {
      toast.error('Failed to add activity');
    }
  };

  const canEdit = () => {
    return stepStatus === 'pending' || stepStatus === 'in_progress';
  };

  const canApprove = () => {
    return userRole === 'MANAGER' && stepStatus === 'completed';
  };

  const getStatusColor = () => {
    switch (stepStatus) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'approved': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (stepStatus) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'approved': return 'Approved';
      default: return 'Pending';
    }
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload
    const newPhoto = `photo_${Date.now()}.jpg`;
    setPhotos(prev => [...prev, newPhoto]);
    addActivity('PHOTO', { url: newPhoto, type: 'general' });
  };

  const handleVideoUpload = () => {
    // TODO: Implement video upload
    const newVideo = `video_${Date.now()}.mp4`;
    setVideos(prev => [...prev, newVideo]);
    addActivity('VIDEO', { url: newVideo, type: 'general' });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-primary" />
              Step 4: Back to Dispatcher - Return & Equipment
            </CardTitle>
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-sm">
            Truck return, equipment check-in, and journey summary
          </p>
        </CardContent>
      </Card>

      {/* Manager Section */}
      {userRole === 'MANAGER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Journey Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">Total Time</label>
                <input
                  type="text"
                  value={journeySummary.totalTime}
                  onChange={(e) => setJourneySummary(prev => ({ ...prev, totalTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="e.g., 4h 30m"
                  disabled={!canEdit()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Distance Traveled (km)</label>
                <input
                  type="number"
                  value={journeySummary.distanceTraveled}
                  onChange={(e) => setJourneySummary(prev => ({ ...prev, distanceTraveled: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="0"
                  disabled={!canEdit()}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Issues Encountered</label>
              <textarea
                value={journeySummary.issuesEncountered}
                onChange={(e) => setJourneySummary(prev => ({ ...prev, issuesEncountered: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="Any issues or problems encountered during the journey"
                rows={3}
                disabled={!canEdit()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Recommendations</label>
              <textarea
                value={journeySummary.recommendations}
                onChange={(e) => setJourneySummary(prev => ({ ...prev, recommendations: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="Recommendations for future journeys"
                rows={3}
                disabled={!canEdit()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Document Summary
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Record Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver Section */}
      {userRole === 'DRIVER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Truck Return
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Fuel Level (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={truckReturn.fuelLevel}
                onChange={(e) => setTruckReturn(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                className="w-full"
                disabled={!canEdit()}
              />
              <div className="text-sm text-text-secondary">{truckReturn.fuelLevel}%</div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Truck Condition</label>
              <select
                value={truckReturn.condition}
                onChange={(e) => setTruckReturn(prev => ({ ...prev, condition: e.target.value as any }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                disabled={!canEdit()}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Damage Report</label>
              <textarea
                value={truckReturn.damageReport}
                onChange={(e) => setTruckReturn(prev => ({ ...prev, damageReport: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="Report any damage or issues with the truck"
                rows={3}
                disabled={!canEdit()}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Maintenance Needed</h4>
              {['Oil Change', 'Tire Rotation', 'Brake Check', 'Engine Service', 'Other'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={item}
                    className="rounded border-border"
                    disabled={!canEdit()}
                  />
                  <label htmlFor={item} className="text-sm text-text-primary">{item}</label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Document Truck
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Record Condition
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mover Section */}
      {userRole === 'MOVER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Equipment Return
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Equipment Checklist</h4>
              {[
                { key: 'toolsReturned', label: 'All tools returned and accounted for' },
                { key: 'safetyEquipment', label: 'Safety equipment returned' },
                { key: 'packingMaterials', label: 'Packing materials returned' }
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={equipmentReturn[item.key as keyof EquipmentReturn] as boolean}
                    onChange={(e) => setEquipmentReturn(prev => ({ 
                      ...prev, 
                      [item.key]: e.target.checked 
                    }))}
                    className="rounded border-border"
                    disabled={!canEdit()}
                  />
                  <label htmlFor={item.key} className="text-sm text-text-primary">{item.label}</label>
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Missing Items</label>
              <textarea
                value={equipmentReturn.missingItems.join(', ')}
                onChange={(e) => setEquipmentReturn(prev => ({ 
                  ...prev, 
                  missingItems: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="List any missing or damaged equipment"
                rows={2}
                disabled={!canEdit()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Document Equipment
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Record Return
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Final Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
            placeholder="Add any final notes about the journey..."
            rows={3}
            disabled={!canEdit()}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {stepStatus === 'pending' && (
            <Button onClick={startStep} disabled={isLoading}>
              <Clock className="w-4 h-4 mr-2" />
              Start Step
            </Button>
          )}
          <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
            <Camera className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
          <Button onClick={handleVideoUpload} disabled={!canEdit()}>
            <Video className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>
        <div className="flex gap-2">
          {stepStatus === 'in_progress' && (
            <Button onClick={completeStep} disabled={isLoading}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Journey
            </Button>
          )}
          {canApprove() && (
            <Button variant="success">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Journey
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 