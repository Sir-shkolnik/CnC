'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  MapPin, 
  Package, 
  Camera, 
  Video, 
  CheckCircle, 
  AlertCircle,
  Clock,
  UserCheck,
  Truck,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface PointsAStepProps {
  journeyId: string;
  userRole: string;
  onStepComplete: (stepNumber: number) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  condition: 'good' | 'damaged' | 'missing';
  notes?: string;
}

interface CustomerInteraction {
  customerName: string;
  contactNumber: string;
  specialInstructions: string;
  signature: string;
  photos: string[];
}

interface LoadingProcess {
  itemsLoaded: number;
  totalItems: number;
  truckSpace: number;
  specialHandling: string[];
  photos: string[];
}

export const PointsAStep: React.FC<PointsAStepProps> = ({
  journeyId,
  userRole,
  onStepComplete
}) => {
  const { user } = useAuthStore();
  const [stepStatus, setStepStatus] = useState<'pending' | 'in_progress' | 'completed' | 'approved'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  // Manager state
  const [customerInteraction, setCustomerInteraction] = useState<CustomerInteraction>({
    customerName: '',
    contactNumber: '',
    specialInstructions: '',
    signature: '',
    photos: []
  });

  // Driver state
  const [loadingProcess, setLoadingProcess] = useState<LoadingProcess>({
    itemsLoaded: 0,
    totalItems: 0,
    truckSpace: 0,
    specialHandling: [],
    photos: []
  });

  // Mover state
  const [inventoryCheck, setInventoryCheck] = useState<InventoryItem[]>([]);
  const [inventoryNotes, setInventoryNotes] = useState('');

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
      console.log('Loading Points A step data for journey:', journeyId);
    } catch (error) {
      console.error('Failed to load step data:', error);
    }
  };

  const startStep = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to start step
      setStepStatus('in_progress');
      toast.success('Step 2: Points A started');
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
      onStepComplete(2);
      toast.success('Step 2: Points A completed');
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
              <MapPin className="w-5 h-5 text-primary" />
              Step 2: Points A - Pickup Location
            </CardTitle>
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-sm">
            Customer interaction, inventory check, and loading process at pickup location
          </p>
        </CardContent>
      </Card>

      {/* Manager Section */}
      {userRole === 'MANAGER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Customer Interaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">Customer Name</label>
                <input
                  type="text"
                  value={customerInteraction.customerName}
                  onChange={(e) => setCustomerInteraction(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="Enter customer name"
                  disabled={!canEdit()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Contact Number</label>
                <input
                  type="tel"
                  value={customerInteraction.contactNumber}
                  onChange={(e) => setCustomerInteraction(prev => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="Enter contact number"
                  disabled={!canEdit()}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Special Instructions</label>
              <textarea
                value={customerInteraction.specialInstructions}
                onChange={(e) => setCustomerInteraction(prev => ({ ...prev, specialInstructions: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="Any special instructions from customer"
                rows={3}
                disabled={!canEdit()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Add Video
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
              Loading Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">Items Loaded</label>
                <input
                  type="number"
                  value={loadingProcess.itemsLoaded}
                  onChange={(e) => setLoadingProcess(prev => ({ ...prev, itemsLoaded: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="0"
                  disabled={!canEdit()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Total Items</label>
                <input
                  type="number"
                  value={loadingProcess.totalItems}
                  onChange={(e) => setLoadingProcess(prev => ({ ...prev, totalItems: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  placeholder="0"
                  disabled={!canEdit()}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Truck Space Used (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={loadingProcess.truckSpace}
                onChange={(e) => setLoadingProcess(prev => ({ ...prev, truckSpace: parseInt(e.target.value) }))}
                className="w-full"
                disabled={!canEdit()}
              />
              <div className="text-sm text-text-secondary">{loadingProcess.truckSpace}%</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePhotoUpload} disabled={!canEdit()}>
                <Camera className="w-4 h-4 mr-2" />
                Document Loading
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
              Inventory Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Inventory Notes</label>
              <textarea
                value={inventoryNotes}
                onChange={(e) => setInventoryNotes(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                placeholder="Document any inventory issues or special items"
                rows={3}
                disabled={!canEdit()}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Item Checklist</h4>
              {['Furniture', 'Electronics', 'Appliances', 'Boxes', 'Special Items'].map((item) => (
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
                Document Items
              </Button>
              <Button onClick={handleVideoUpload} disabled={!canEdit()}>
                <Video className="w-4 h-4 mr-2" />
                Record Inventory
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