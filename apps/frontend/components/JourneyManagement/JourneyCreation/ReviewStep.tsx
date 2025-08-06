'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

interface ReviewStepProps {
  formData: {
    truckNumber: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
    crewMembers: string[];
    status: string;
  };
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
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
}; 