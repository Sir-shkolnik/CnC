'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { 
  Users, 
  X, 
  Search, 
  Plus, 
  Truck, 
  UserPlus,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CrewMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'DRIVER' | 'MOVER';
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  location: string;
  rating: number;
  experience: string;
  currentJourneyId?: string;
}

interface CrewAssignmentModalProps {
  journeyId: string;
  journeyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: (assignedCrew: CrewMember[]) => void;
  currentCrew?: CrewMember[];
}

export const CrewAssignmentModal: React.FC<CrewAssignmentModalProps> = ({
  journeyId,
  journeyTitle,
  isOpen,
  onClose,
  onAssignmentComplete,
  currentCrew = []
}) => {
  const [availableCrew, setAvailableCrew] = useState<CrewMember[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember[]>(currentCrew);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'DRIVER' | 'MOVER'>('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCrew();
    }
  }, [isOpen]);

  const fetchAvailableCrew = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crew/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCrew(data.crew || []);
      } else {
        console.error('Failed to fetch available crew');
        toast.error('Failed to load available crew');
      }
    } catch (error) {
      console.error('Error fetching crew:', error);
      toast.error('Error loading crew data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrew = availableCrew.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || member.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const toggleCrewSelection = (member: CrewMember) => {
    setSelectedCrew(prev => {
      const isSelected = prev.some(crew => crew.id === member.id);
      if (isSelected) {
        return prev.filter(crew => crew.id !== member.id);
      } else {
        // Check role limits
        const drivers = prev.filter(crew => crew.role === 'DRIVER');
        const movers = prev.filter(crew => crew.role === 'MOVER');
        
        if (member.role === 'DRIVER' && drivers.length >= 1) {
          toast.error('Only one driver can be assigned per journey');
          return prev;
        }
        
        if (member.role === 'MOVER' && movers.length >= 3) {
          toast.error('Maximum 3 movers can be assigned per journey');
          return prev;
        }
        
        return [...prev, member];
      }
    });
  };

  const handleSaveAssignment = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/journey/${journeyId}/assign-crew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          crewIds: selectedCrew.map(crew => crew.id)
        })
      });

      if (response.ok) {
        toast.success('Crew assigned successfully!');
        onAssignmentComplete(selectedCrew);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to assign crew');
      }
    } catch (error) {
      console.error('Error assigning crew:', error);
      toast.error('Error assigning crew');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'BUSY': return 'warning';
      case 'OFFLINE': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'DRIVER' ? <Truck className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" />
              Assign Crew to Journey
            </h2>
            <p className="text-text-secondary text-sm mt-1">{journeyTitle}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex h-[600px]">
          {/* Available Crew List */}
          <div className="flex-1 p-6 border-r border-gray-700">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Available Crew</h3>
              
              {/* Search and Filters */}
              <div className="flex space-x-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                  <Input
                    placeholder="Search crew members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'ALL' | 'DRIVER' | 'MOVER')}
                  className="px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Roles</option>
                  <option value="DRIVER">Drivers</option>
                  <option value="MOVER">Movers</option>
                </select>
              </div>
            </div>

            {/* Crew List */}
            <div className="space-y-3 overflow-y-auto max-h-[450px]">
              {loading ? (
                <div className="text-center py-8 text-text-secondary">
                  Loading crew members...
                </div>
              ) : filteredCrew.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No crew members found</p>
                  <Button size="sm" className="mt-3">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New Crew Member
                  </Button>
                </div>
              ) : (
                filteredCrew.map((member) => {
                  const isSelected = selectedCrew.some(crew => crew.id === member.id);
                  
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleCrewSelection(member)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-700 bg-surface/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-text-primary">{member.name}</h4>
                              <Badge variant={getStatusColor(member.status)} className="text-xs">
                                {member.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-text-secondary mt-1">
                              <div className="flex items-center space-x-1">
                                {getRoleIcon(member.role)}
                                <span>{member.role}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{member.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span>{member.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Crew Summary */}
          <div className="w-80 p-6 bg-surface/30">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Selected Crew ({selectedCrew.length})
            </h3>
            
            {/* Crew Requirements */}
            <div className="mb-4 p-3 bg-info/10 border border-info/30 rounded-lg">
              <h4 className="text-sm font-medium text-info mb-2">Crew Requirements</h4>
              <div className="text-xs text-info/80 space-y-1">
                <div>• 1 Driver (required)</div>
                <div>• 1-3 Movers (recommended: 2+)</div>
                <div>• All crew must be available</div>
              </div>
            </div>

            {/* Selected Crew List */}
            <div className="space-y-3 mb-6">
              {selectedCrew.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No crew selected</p>
                  <p className="text-xs mt-1">Select crew members from the left</p>
                </div>
              ) : (
                selectedCrew.map((member) => (
                  <div key={member.id} className="p-3 bg-surface/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary text-sm">{member.name}</div>
                          <div className="text-xs text-text-secondary flex items-center space-x-1">
                            {getRoleIcon(member.role)}
                            <span>{member.role}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleCrewSelection(member)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Assignment Validation */}
            <div className="mb-4">
              {selectedCrew.filter(c => c.role === 'DRIVER').length === 0 && (
                <div className="flex items-center space-x-2 text-warning text-sm mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Driver required</span>
                </div>
              )}
              {selectedCrew.filter(c => c.role === 'MOVER').length === 0 && (
                <div className="flex items-center space-x-2 text-warning text-sm mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>At least 1 mover recommended</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleSaveAssignment}
                disabled={saving || selectedCrew.length === 0}
                className="w-full"
              >
                {saving ? 'Assigning...' : `Assign ${selectedCrew.length} Crew Member${selectedCrew.length !== 1 ? 's' : ''}`}
              </Button>
              <Button variant="secondary" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};