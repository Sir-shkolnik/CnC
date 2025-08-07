'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  Users, 
  MapPin, 
  FileText, 
  Camera, 
  Video, 
  CheckCircle, 
  AlertCircle,
  Clock,
  UserCheck,
  Wrench,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface ReadyToGoStepProps {
  journeyId: string;
  userRole: string;
  onStepComplete: (stepNumber: number) => void;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  assignedTime?: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  status: 'available' | 'missing' | 'damaged';
  checkedBy?: string;
}

interface TruckInspection {
  fuelLevel: number;
  tireCondition: string;
  lightsWorking: boolean;
  brakesWorking: boolean;
  photos: string[];
}

interface MaterialsCheck {
  packingMaterials: boolean;
  protectiveGear: boolean;
  toolsAvailable: boolean;
  safetyEquipment: boolean;
  photos: string[];
}

export const ReadyToGoStep: React.FC<ReadyToGoStepProps> = ({
  journeyId,
  userRole,
  onStepComplete
}) => {
  const { user } = useAuthStore();
  const [stepStatus, setStepStatus] = useState<'pending' | 'in_progress' | 'completed' | 'approved'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  // Manager state
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [routePlan, setRoutePlan] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    estimatedTime: '',
    notes: ''
  });
  const [importantNotes, setImportantNotes] = useState('');

  // Driver state
  const [truckInspection, setTruckInspection] = useState<TruckInspection>({
    fuelLevel: 0,
    tireCondition: 'good',
    lightsWorking: true,
    brakesWorking: true,
    photos: []
  });

  // Mover state
  const [materialsCheck, setMaterialsCheck] = useState<MaterialsCheck>({
    packingMaterials: false,
    protectiveGear: false,
    toolsAvailable: false,
    safetyEquipment: false,
    photos: []
  });

  // Common state
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  useEffect(() => {
    loadStepData();
  }, [journeyId]);

  const loadStepData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/journeys/${journeyId}/steps/1`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStepStatus(data.data.step.status);
          // Load activities and populate state
        }
      }
    } catch (error) {
      console.error('Failed to load step data:', error);
    }
  };

  const startStep = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/journeys/${journeyId}/steps/1/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setStepStatus('in_progress');
        toast.success('Step 1: Ready to Go started');
      }
    } catch (error) {
      toast.error('Failed to start step');
    } finally {
      setIsLoading(false);
    }
  };

  const completeStep = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/journeys/${journeyId}/steps/1/complete`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setStepStatus('completed');
        toast.success('Step 1: Ready to Go completed');
        onStepComplete(1);
      }
    } catch (error) {
      toast.error('Failed to complete step');
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (activityType: string, data: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/journeys/${journeyId}/steps/1/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: activityType,
          data: data,
          creator_id: user?.id
        })
      });
      
      if (response.ok) {
        toast.success('Activity recorded');
      }
    } catch (error) {
      toast.error('Failed to record activity');
    }
  };

  const canEdit = () => {
    if (userRole === 'MANAGER') return true;
    if (userRole === 'DRIVER') return true;
    if (userRole === 'MOVER') return true;
    return false;
  };

  const canApprove = () => {
    return userRole === 'MANAGER';
  };

  const getStatusColor = () => {
    switch (stepStatus) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'approved': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (stepStatus) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'approved': return 'Approved';
      default: return 'Pending';
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Step 1: Ready to Go</CardTitle>
                <p className="text-sm text-text-secondary">Preparation phase - Crew assignment, equipment check, route planning</p>
              </div>
            </div>
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Manager Section */}
      {userRole === 'MANAGER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Crew Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Crew Members */}
            <div className="space-y-3">
              <h4 className="font-medium">Crew Members</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {crewMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-text-secondary">{member.role}</p>
                    </div>
                    <Badge variant="secondary">{member.assignedTime || 'Not assigned'}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm">
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Crew
              </Button>
            </div>

            {/* Equipment List */}
            <div className="space-y-3">
              <h4 className="font-medium">Equipment Check</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {equipmentList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    <Badge 
                      variant={item.status === 'available' ? 'success' : item.status === 'missing' ? 'error' : 'warning'}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Planning */}
            <div className="space-y-3">
              <h4 className="font-medium">Route Planning</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pickup Address</label>
                  <input
                    type="text"
                    value={routePlan.pickupAddress}
                    onChange={(e) => setRoutePlan(prev => ({ ...prev, pickupAddress: e.target.value }))}
                    className="w-full mt-1 p-2 bg-surface border border-border rounded-lg"
                    placeholder="Enter pickup address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Address</label>
                  <input
                    type="text"
                    value={routePlan.deliveryAddress}
                    onChange={(e) => setRoutePlan(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    className="w-full mt-1 p-2 bg-surface border border-border rounded-lg"
                    placeholder="Enter delivery address"
                  />
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="space-y-3">
              <h4 className="font-medium">Important Notes</h4>
              <textarea
                value={importantNotes}
                onChange={(e) => setImportantNotes(e.target.value)}
                className="w-full p-3 bg-surface border border-border rounded-lg"
                rows={3}
                placeholder="Add special instructions, customer requirements, etc."
              />
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
              Truck Inspection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Fuel Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={truckInspection.fuelLevel}
                  onChange={(e) => setTruckInspection(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                  className="w-full mt-1 p-2 bg-surface border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tire Condition</label>
                <select
                  value={truckInspection.tireCondition}
                  onChange={(e) => setTruckInspection(prev => ({ ...prev, tireCondition: e.target.value }))}
                  className="w-full mt-1 p-2 bg-surface border border-border rounded-lg"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={truckInspection.lightsWorking}
                  onChange={(e) => setTruckInspection(prev => ({ ...prev, lightsWorking: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="text-sm">Lights Working</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={truckInspection.brakesWorking}
                  onChange={(e) => setTruckInspection(prev => ({ ...prev, brakesWorking: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="text-sm">Brakes Working</label>
              </div>
            </div>

            {/* Photo/Video Upload */}
            <div className="space-y-3">
              <h4 className="font-medium">Documentation</h4>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
                <Button variant="secondary" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mover Section */}
      {userRole === 'MOVER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Materials Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={materialsCheck.packingMaterials}
                  onChange={(e) => setMaterialsCheck(prev => ({ ...prev, packingMaterials: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="text-sm">Packing Materials</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={materialsCheck.protectiveGear}
                  onChange={(e) => setMaterialsCheck(prev => ({ ...prev, protectiveGear: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="text-sm">Protective Gear</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={materialsCheck.toolsAvailable}
                  onChange={(e) => setMaterialsCheck(prev => ({ ...prev, toolsAvailable: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="text-sm">Moving Tools</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={materialsCheck.safetyEquipment}
                  onChange={(e) => setMaterialsCheck(prev => ({ ...prev, safetyEquipment: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="text-sm">Safety Equipment</label>
              </div>
            </div>

            {/* Photo/Video Upload */}
            <div className="space-y-3">
              <h4 className="font-medium">Documentation</h4>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
                <Button variant="secondary" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {stepStatus === 'pending' && (
            <Button onClick={startStep} disabled={isLoading}>
              <Clock className="w-4 h-4 mr-2" />
              Start Step
            </Button>
          )}
          
          {stepStatus === 'in_progress' && canEdit() && (
            <Button onClick={completeStep} disabled={isLoading}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Step
            </Button>
          )}
        </div>

        {stepStatus === 'completed' && canApprove() && (
          <Button variant="success">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Step
          </Button>
        )}
      </div>
    </div>
  );
}; 