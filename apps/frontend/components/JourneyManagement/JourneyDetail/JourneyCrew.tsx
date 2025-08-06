'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Phone, Mail, Users, MapPin, Clock, Star } from 'lucide-react';

interface CrewMember {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  phone: string;
  email: string;
  location?: string;
  rating?: number;
  experience?: string;
}

interface JourneyCrewProps {
  journeyId: string;
}

export const JourneyCrew: React.FC<JourneyCrewProps> = ({ journeyId }) => {
  // In a real app, this would fetch crew data from the API
  const crewMembers: CrewMember[] = [
    { 
      name: 'Mike Wilson', 
      role: 'Driver', 
      status: 'online', 
      phone: '+1 (555) 123-4567', 
      email: 'mike@lgm.com',
      location: 'Toronto, ON',
      rating: 4.8,
      experience: '5 years'
    },
    { 
      name: 'Sarah Johnson', 
      role: 'Mover', 
      status: 'online', 
      phone: '+1 (555) 234-5678', 
      email: 'sarah@lgm.com',
      location: 'Toronto, ON',
      rating: 4.6,
      experience: '3 years'
    },
    { 
      name: 'David Chen', 
      role: 'Mover', 
      status: 'busy', 
      phone: '+1 (555) 345-6789', 
      email: 'david@lgm.com',
      location: 'Mississauga, ON',
      rating: 4.9,
      experience: '7 years'
    }
  ];

  const handleCall = (phone: string) => {
    // In a real app, this would initiate a call
    console.log('Calling:', phone);
  };

  const handleEmail = (email: string) => {
    // In a real app, this would open email client
    window.open(`mailto:${email}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'secondary';
      case 'busy': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'busy': return 'Busy';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center">
          <Users className="w-4 h-4 mr-2 text-primary" />
          Crew Members ({crewMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {crewMembers.map((member, index) => (
            <div key={index} className="p-4 bg-surface/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Member Info */}
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div className={`
                      absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background
                      ${member.status === 'online' ? 'bg-success' : ''}
                      ${member.status === 'offline' ? 'bg-gray-500' : ''}
                      ${member.status === 'busy' ? 'bg-warning' : ''}
                    `} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-text-primary truncate">{member.name}</h3>
                      <Badge variant={getStatusColor(member.status)} className="text-xs">
                        {getStatusText(member.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">{member.role}</p>
                    <div className="flex items-center space-x-4 text-xs text-text-secondary">
                      {member.location && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {member.location}
                        </div>
                      )}
                      {member.experience && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {member.experience}
                        </div>
                      )}
                      {member.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-warning fill-current" />
                          {member.rating}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleCall(member.phone)}
                    title={`Call ${member.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEmail(member.email)}
                    title={`Email ${member.name}`}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Crew Summary */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-surface/30 rounded-lg">
              <div className="text-lg font-bold text-primary">
                {crewMembers.length}
              </div>
              <div className="text-xs text-text-secondary">Total Crew</div>
            </div>
            <div className="p-3 bg-surface/30 rounded-lg">
              <div className="text-lg font-bold text-success">
                {crewMembers.filter(m => m.status === 'online').length}
              </div>
              <div className="text-xs text-text-secondary">Available</div>
            </div>
            <div className="p-3 bg-surface/30 rounded-lg">
              <div className="text-lg font-bold text-warning">
                {crewMembers.filter(m => m.status === 'busy').length}
              </div>
              <div className="text-xs text-text-secondary">Busy</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 