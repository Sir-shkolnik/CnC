'use client';

import React from 'react';
import { Input } from '@/components/atoms/Input';

interface BasicInfoStepProps {
  truckNumber: string;
  location: string;
  notes: string;
  onFieldChange: (field: string, value: string) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  truckNumber,
  location,
  notes,
  onFieldChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Truck Number *
        </label>
        <Input
          placeholder="Enter truck number (e.g., TRK-2024-001)"
          value={truckNumber}
          onChange={(e) => onFieldChange('truckNumber', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Location *
        </label>
        <Input
          placeholder="Enter location address"
          value={location}
          onChange={(e) => onFieldChange('location', e.target.value)}
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
          value={notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}; 