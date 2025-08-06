'use client';

import React from 'react';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { Users } from 'lucide-react';

interface CrewStepProps {
  crewMembers: string[];
  onCrewChange: (index: number, value: string) => void;
}

export const CrewStep: React.FC<CrewStepProps> = ({
  crewMembers,
  onCrewChange
}) => {
  const roles = ['Driver', 'Mover 1', 'Mover 2'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Assign Crew Members *
        </label>
        <div className="space-y-2">
          {roles.map((role, index) => (
            <div key={role} className="flex items-center space-x-2">
              <Input
                placeholder={`Enter ${role} name`}
                value={crewMembers[index] || ''}
                onChange={(e) => onCrewChange(index, e.target.value)}
              />
              <Badge variant="secondary" className="text-xs">
                {role}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 bg-surface/50 rounded-lg">
        <p className="text-sm text-text-secondary">
          <Users className="w-4 h-4 inline mr-2" />
          Crew members will be notified once the journey is created
        </p>
      </div>
    </div>
  );
}; 