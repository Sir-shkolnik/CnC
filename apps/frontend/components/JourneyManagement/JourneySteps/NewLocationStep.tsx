'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  Home, 
  Package, 
  Camera, 
  Video, 
  CheckCircle, 
  AlertCircle,
  Clock,
  UserCheck,
  Truck,
  FileText,
  Star
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface NewLocationStepProps {
  journeyId: string;
  userRole: string;
  onStepComplete: (stepNumber: number) => void;
}

interface DeliveryProcess {
  itemsUnloaded: number;
  totalItems: number;
  placementCompleted: boolean;
  specialPlacement: string[];
  photos: string[];
}

interface CustomerSatisfaction {
  customerName: string;
  satisfactionRating: number;
  feedback: string;
  signature: string;
  photos: string[];
}

interface SetupCompletion {
  furnitureAssembled: boolean;
  appliancesConnected: boolean;
  boxesUnpacked: boolean;
  cleanupCompleted: boolean;
  photos: string[];
}

export const NewLocationStep: React.FC<NewLocationStepProps> = ({
  journeyId,
  userRole,
  onStepComplete
}) => {
  const { user } = useAuthStore();
  const [stepStatus, setStepStatus] = useState<'pending' | 'in_progress' | 'completed' | 'approved'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  // Manager state
  const [customerSatisfaction, setCustomerSatisfaction] = useState<CustomerSatisfaction>({
    customerName: '',
    satisfactionRating: 5,
    feedback: '',
    signature: '',
    photos: []
  });

  // Driver state
  const [deliveryProcess, setDeliveryProcess] = useState<DeliveryProcess>({
    itemsUnloaded: 0,
    totalItems: 0,
    placementCompleted: false,
    specialPlacement: [],
    photos: []
  });

  // Mover state
  const [setupCompletion, setSetupCompletion] = useState<SetupCompletion>({
    furnitureAssembled: false,
    appliancesConnected: false,
    boxesUnpacked: false,
    cleanupCompleted: false,
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
      console.log('Loading New Location step data for journey:', journeyId);
    } catch (error) {
      console.error('Failed to load step data:', error);
    }
  };

  const startStep = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to start step
      setStepStatus('in_progress');
      toast.success('Step 3: New Location started');
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
      onStepComplete(3);
      toast.success('Step 3: New Location completed');
    } catch (error) {
      toast.error('Failed to complete step');
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
              <Home className="w-5 h-5 text-primary" />
              Step 3: New Location - Delivery & Setup
            </CardTitle>
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-sm">
            Unloading, placement, setup completion, and customer satisfaction
          </p>
        </CardContent>
      </Card>

      {/* Manager Section */}
      {userRole === 'MANAGER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Customer Name</label>
              <input
                type="text"
                value={customerSatisfaction.customerName}
                onChange={(e) => setCustomerSatisfaction(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="Enter customer name"
                disabled={!canEdit()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Satisfaction Rating</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setCustomerSatisfaction(prev => ({ ...prev, satisfactionRating: rating }))}
                    disabled={!canEdit()}
                    className={`p-2 rounded-lg ${
                      customerSatisfaction.satisfactionRating >= rating
                        ? 'text-yellow-400'
                        : 'text-text-secondary'
                    }`}
                  >
                    <Star className="w-6 h-6" fill={customerSatisfaction.satisfactionRating >= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Customer Feedback</label>
              <textarea
                value={customerSatisfaction.feedback}
                onChange={(e) => setCustomerSatisfaction(prev => ({ ...prev, feedback: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="Customer feedback and comments"
                rows={3}
                disabled={!canEdit()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Document Setup
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Record Feedback
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
              Delivery Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">Items Unloaded</label>
                <input
                  type="number"
                  value={deliveryProcess.itemsUnloaded}
                  onChange={(e) => setDeliveryProcess(prev => ({ ...prev, itemsUnloaded: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="0"
                  disabled={!canEdit()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Total Items</label>
                <input
                  type="number"
                  value={deliveryProcess.totalItems}
                  onChange={(e) => setDeliveryProcess(prev => ({ ...prev, totalItems: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="0"
                  disabled={!canEdit()}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Placement Status</h4>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="placementCompleted"
                  checked={deliveryProcess.placementCompleted}
                  onChange={(e) => setDeliveryProcess(prev => ({ ...prev, placementCompleted: e.target.checked }))}
                  className="rounded border-border"
                  disabled={!canEdit()}
                />
                <label htmlFor="placementCompleted" className="text-sm text-text-primary">
                  All items placed in correct locations
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Document Delivery
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Record Process
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
              Setup Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Setup Checklist</h4>
              {[
                { key: 'furnitureAssembled', label: 'Furniture assembled and positioned' },
                { key: 'appliancesConnected', label: 'Appliances connected and tested' },
                { key: 'boxesUnpacked', label: 'Boxes unpacked and contents organized' },
                { key: 'cleanupCompleted', label: 'Cleanup and debris removal completed' }
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={setupCompletion[item.key as keyof SetupCompletion] as boolean}
                    onChange={(e) => setSetupCompletion(prev => ({ 
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
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Document Setup
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Record Setup
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
            General Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
            placeholder="Add any general notes about this step..."
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
              Complete Step
            </Button>
          )}
          {canApprove() && (
            <Button variant="success">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 