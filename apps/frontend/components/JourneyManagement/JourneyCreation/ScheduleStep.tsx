'use client';

import React from 'react';
import { Input } from '@/components/atoms/Input';

interface ScheduleStepProps {
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  onFieldChange: (field: string, value: string) => void;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  date,
  startTime,
  endTime,
  status,
  onFieldChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Date *
        </label>
        <Input
          type="date"
          value={date}
          onChange={(e) => onFieldChange('date', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Start Time *
          </label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onFieldChange('startTime', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            End Time
          </label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => onFieldChange('endTime', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Initial Status
        </label>
        <select
          className="w-full px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          value={status}
          onChange={(e) => onFieldChange('status', e.target.value)}
        >
          <option value="MORNING_PREP">Morning Prep</option>
          <option value="EN_ROUTE">En Route</option>
          <option value="ONSITE">On Site</option>
        </select>
      </div>
    </div>
  );
}; 