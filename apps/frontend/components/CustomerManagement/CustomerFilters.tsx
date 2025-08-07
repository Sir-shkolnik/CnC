'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Filter, X, Search } from 'lucide-react';

interface CustomerFiltersProps {
  filters: {
    leadStatus: string;
    assignedTo: string;
    isActive: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  searchTerm,
  onSearchChange
}) => {
  const leadStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
    { value: 'NEGOTIATION', label: 'Negotiation' },
    { value: 'WON', label: 'Won' },
    { value: 'LOST', label: 'Lost' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const assignedToOptions = [
    { value: '', label: 'All Users' },
    { value: 'sarah.johnson@lgm.com', label: 'Sarah Johnson' },
    { value: 'michael.chen@lgm.com', label: 'Michael Chen' },
    { value: 'emily.davis@lgm.com', label: 'Emily Davis' }
  ];

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.leadStatus || filters.assignedTo || !filters.isActive || searchTerm;

  return (
    <Card className="bg-surface border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-text-primary text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Search Customers
          </label>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Lead Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Lead Status
          </label>
          <select
            value={filters.leadStatus}
            onChange={(e) => handleFilterChange('leadStatus', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {leadStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Assigned To
          </label>
          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {assignedToOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Status
          </label>
          <div className="flex gap-2">
            <Button
              variant={filters.isActive ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('isActive', true)}
              className="flex-1"
            >
              Active
            </Button>
            <Button
              variant={!filters.isActive ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('isActive', false)}
              className="flex-1"
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {filters.leadStatus && (
                <Badge variant="secondary" className="text-xs">
                  Status: {leadStatusOptions.find(opt => opt.value === filters.leadStatus)?.label}
                </Badge>
              )}
              {filters.assignedTo && (
                <Badge variant="secondary" className="text-xs">
                  Assigned: {assignedToOptions.find(opt => opt.value === filters.assignedTo)?.label}
                </Badge>
              )}
              {!filters.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive Only
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 