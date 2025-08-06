'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Building2, Plus, MapPin, Users, Calendar } from 'lucide-react';

export default function ClientsPage() {
  // TODO: Replace with API data
  const mockClients: any[] = [];

  const getTypeBadge = (type: string, isFranchise: boolean) => {
    if (isFranchise) {
      return <Badge variant="secondary">Franchise</Badge>;
    }
    return type === 'CORPORATE' ? 
      <Badge variant="default">Corporate</Badge> : 
      <Badge variant="secondary">{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? 
      <Badge variant="success">Active</Badge> : 
      <Badge variant="error">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Client Management</h1>
          <p className="text-text-secondary mt-2">Manage clients and their locations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <MapPin className="w-4 h-4 mr-2" />
            Manage Locations
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Clients</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Locations</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-text-primary">156</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Active Journeys</p>
                <p className="text-2xl font-bold text-text-primary">28</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {getTypeBadge(client.type, client.isFranchise)}
                    {getStatusBadge(client.status)}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {client.isFranchise ? 'Franchise Business' : 'Corporate Business'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-surface/50 rounded-lg">
                    <p className="text-sm font-medium text-text-primary">
                      {client.locations}
                    </p>
                    <p className="text-xs text-text-secondary">Locations</p>
                  </div>
                  <div className="text-center p-3 bg-surface/50 rounded-lg">
                    <p className="text-sm font-medium text-text-primary">
                      {client.users}
                    </p>
                    <p className="text-xs text-text-secondary">Users</p>
                  </div>
                  <div className="text-center p-3 bg-surface/50 rounded-lg">
                    <p className="text-sm font-medium text-text-primary">
                      {client.activeJourneys}
                    </p>
                    <p className="text-xs text-text-secondary">Active</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Manage Users
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="secondary" className="h-20 flex-col">
              <Building2 className="w-6 h-6 mb-2" />
              <span>Add New Client</span>
            </Button>
            <Button variant="secondary" className="h-20 flex-col">
              <MapPin className="w-6 h-6 mb-2" />
              <span>Add Location</span>
            </Button>
            <Button variant="secondary" className="h-20 flex-col">
              <Users className="w-6 h-6 mb-2" />
              <span>Bulk User Import</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 