'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

interface SmartMovingJobCardProps {
  job: {
    externalId: string;
    smartmovingJobNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    estimatedValue: number;
    serviceType: string;
    moveSize: string;
    originAddress: string;
    destinationAddress: string;
    scheduledDate: string;
    confirmed: boolean;
    dataSource: string;
    lastSyncAt: string;
    syncStatus: string;
  };
  onViewDetails?: (jobId: string) => void;
  onAssignCrew?: (jobId: string) => void;
  onEditJob?: (jobId: string) => void;
}

export default function SmartMovingJobCard({
  job,
  onViewDetails,
  onAssignCrew,
  onEditJob
}: SmartMovingJobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SYNCED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{job.customerName}</CardTitle>
            <p className="text-sm text-gray-600">#{job.smartmovingJobNumber}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(job.syncStatus)}>
              {job.syncStatus}
            </Badge>
            {job.confirmed && (
              <Badge variant="success">Confirmed</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Estimated Value</p>
            <p className="font-semibold text-green-600">{formatCurrency(job.estimatedValue)}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Service Type</p>
            <p className="font-medium">{job.serviceType}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Move Size</p>
            <p className="font-medium">{job.moveSize}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Scheduled Date</p>
            <p className="font-medium">{formatDate(job.scheduledDate)}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-3">
          <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{job.customerPhone || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{job.customerEmail || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="border-t pt-3">
          <h4 className="font-medium text-gray-900 mb-2">Move Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Origin</p>
              <p className="font-medium">{job.originAddress}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Destination</p>
              <p className="font-medium">{job.destinationAddress}</p>
            </div>
          </div>
        </div>

        {/* Sync Information */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last synced: {job.lastSyncAt ? formatTime(job.lastSyncAt) : 'Never'}</span>
            <span>Source: {job.dataSource}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-3">
          <div className="flex space-x-2">
            {onViewDetails && (
              <Button
                onClick={() => onViewDetails(job.externalId)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                View Details
              </Button>
            )}
            {onAssignCrew && (
              <Button
                onClick={() => onAssignCrew(job.externalId)}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Assign Crew
              </Button>
            )}
            {onEditJob && (
              <Button
                onClick={() => onEditJob(job.externalId)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Edit Job
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
