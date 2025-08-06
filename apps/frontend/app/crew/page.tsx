'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { UserCheck, Plus, Clock, Star, MapPin, Calendar } from 'lucide-react';

export default function CrewPage() {
  // TODO: Replace with API data
  const mockCrew: any[] = [];

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: 'success',
      ON_JOURNEY: 'warning',
      OFF_DUTY: 'default',
      SICK: 'destructive'
    } as const;
    
    const labels = {
      AVAILABLE: 'Available',
      ON_JOURNEY: 'On Journey',
      OFF_DUTY: 'Off Duty',
      SICK: 'Sick Leave'
    };
    
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  const getRoleBadge = (role: string) => {
    return role === 'DRIVER' ? 
      <Badge variant="default">Driver</Badge> : 
      <Badge variant="secondary">Mover</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Crew Management</h1>
          <p className="text-text-secondary mt-2">Manage crew assignments, scheduling, and performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule View
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Crew Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Crew</p>
                <p className="text-2xl font-bold text-text-primary">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Available</p>
                <p className="text-2xl font-bold text-text-primary">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">On Journey</p>
                <p className="text-2xl font-bold text-text-primary">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Avg Rating</p>
                <p className="text-2xl font-bold text-text-primary">4.7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockCrew.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{member.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{member.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Status */}
                {member.currentJourney && (
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm font-medium text-warning">Currently on Journey</p>
                    <p className="text-sm text-text-secondary">{member.currentJourney}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-surface/50 rounded-lg">
                    <p className="text-sm font-medium text-text-primary">
                      {member.completedJourneys}
                    </p>
                    <p className="text-xs text-text-secondary">Journeys</p>
                  </div>
                  <div className="text-center p-3 bg-surface/50 rounded-lg">
                    <p className="text-sm font-medium text-text-primary">
                      {member.availability}
                    </p>
                    <p className="text-xs text-text-secondary">Availability</p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="secondary" size="sm">
                    View Profile
                  </Button>
                  <Button variant="ghost" size="sm">
                    Assign Journey
                  </Button>
                  <Button variant="ghost" size="sm">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary mb-2">98%</p>
              <p className="text-sm text-text-secondary">On-time Completion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary mb-2">4.7/5</p>
              <p className="text-sm text-text-secondary">Customer Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary mb-2">156</p>
              <p className="text-sm text-text-secondary">Journeys This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 