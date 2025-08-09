'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { 
  Users, 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  UserPlus,
  Truck,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Save,
  X as Cancel
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
  locationId: string;
  rating: number;
  experience: string;
  hireDate: string;
  emergencyContact?: string;
  licenseNumber?: string;
  certifications?: string[];
}

interface CrewManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrewUpdated?: () => void;
}

interface CrewFormData {
  name: string;
  email: string;
  phone: string;
  role: 'DRIVER' | 'MOVER';
  locationId: string;
  experience: string;
  emergencyContact: string;
  licenseNumber: string;
  certifications: string;
}

export const CrewManagementModal: React.FC<CrewManagementModalProps> = ({
  isOpen,
  onClose,
  onCrewUpdated
}) => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'DRIVER' | 'MOVER'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [formData, setFormData] = useState<CrewFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'DRIVER',
    locationId: '',
    experience: '',
    emergencyContact: '',
    licenseNumber: '',
    certifications: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCrewMembers();
      fetchLocations();
    }
  }, [isOpen]);

  const fetchCrewMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crew`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCrewMembers(data.crew || []);
      } else {
        console.error('Failed to fetch crew members');
        toast.error('Failed to load crew members');
      }
    } catch (error) {
      console.error('Error fetching crew:', error);
      toast.error('Error loading crew data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const filteredCrew = crewMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || member.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'DRIVER',
      locationId: '',
      experience: '',
      emergencyContact: '',
      licenseNumber: '',
      certifications: ''
    });
    setEditingCrew(null);
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    resetForm();
    setShowCreateForm(true);
  };

  const handleEdit = (crew: CrewMember) => {
    setFormData({
      name: crew.name,
      email: crew.email,
      phone: crew.phone,
      role: crew.role,
      locationId: crew.locationId,
      experience: crew.experience,
      emergencyContact: crew.emergencyContact || '',
      licenseNumber: crew.licenseNumber || '',
      certifications: crew.certifications?.join(', ') || ''
    });
    setEditingCrew(crew);
    setShowCreateForm(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      
      const payload = {
        ...formData,
        certifications: formData.certifications 
          ? formData.certifications.split(',').map(c => c.trim()).filter(c => c)
          : []
      };

      const url = editingCrew 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crew/${editingCrew.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crew`;
      
      const method = editingCrew ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingCrew ? 'Crew member updated successfully!' : 'Crew member created successfully!');
        resetForm();
        fetchCrewMembers();
        onCrewUpdated?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save crew member');
      }
    } catch (error) {
      console.error('Error saving crew member:', error);
      toast.error('Error saving crew member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (crewId: string) => {
    if (!confirm('Are you sure you want to delete this crew member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crew/${crewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Crew member deleted successfully!');
        fetchCrewMembers();
        onCrewUpdated?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete crew member');
      }
    } catch (error) {
      console.error('Error deleting crew member:', error);
      toast.error('Error deleting crew member');
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
      <div className="bg-surface rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" />
              Crew Management
            </h2>
            <p className="text-text-secondary text-sm mt-1">Manage drivers and movers</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[700px]">
          {/* Crew List */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Crew Members</h3>
              <Button onClick={handleCreateNew} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Crew
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex space-x-3 mb-6">
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

            {/* Crew Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="col-span-full text-center py-8 text-text-secondary">
                  Loading crew members...
                </div>
              ) : filteredCrew.length === 0 ? (
                <div className="col-span-full text-center py-8 text-text-secondary">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No crew members found</p>
                  <Button onClick={handleCreateNew} size="sm" className="mt-3">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Crew Member
                  </Button>
                </div>
              ) : (
                filteredCrew.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-text-primary">{member.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={getStatusColor(member.status)} className="text-xs">
                                {member.status}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-text-secondary">
                                {getRoleIcon(member.role)}
                                <span>{member.role}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(member.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-text-secondary">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3" />
                          <span>{member.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{member.experience} experience</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{member.rating}/5.0 rating</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="w-96 p-6 border-l border-gray-700 bg-surface/30 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {editingCrew ? 'Edit Crew Member' : 'Add New Crew Member'}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Phone *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'DRIVER' | 'MOVER' }))}
                    className="w-full px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="DRIVER">Driver</option>
                    <option value="MOVER">Mover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Location *
                  </label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Experience
                  </label>
                  <Input
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g., 3 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Emergency Contact
                  </label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Emergency contact number"
                  />
                </div>

                {formData.role === 'DRIVER' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      License Number
                    </label>
                    <Input
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="Driver's license number"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Certifications
                  </label>
                  <Input
                    value={formData.certifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                    placeholder="Comma-separated certifications"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !formData.name || !formData.email || !formData.phone || !formData.locationId}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : (editingCrew ? 'Update' : 'Create')}
                  </Button>
                  <Button variant="secondary" onClick={resetForm} className="flex-1">
                    <Cancel className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};