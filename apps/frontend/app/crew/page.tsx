'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { 
  UserCheck, 
  Plus, 
  Clock, 
  Star, 
  MapPin, 
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CrewMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  location_name?: string;
  company_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export default function CrewPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch real LGM crew data
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchCrewData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter for crew members (DRIVER and MOVER roles)
          const crew = data.data?.filter((member: CrewMember) => 
            member.role === 'DRIVER' || member.role === 'MOVER'
          ) || [];
          setCrewMembers(crew);
        } else {
          console.warn('Failed to fetch crew data, using empty list');
          setCrewMembers([]);
          toast.error('Failed to load crew data');
        }
      } catch (error) {
        console.error('Error fetching crew data:', error);
        setCrewMembers([]);
        toast.error('Error loading crew data');
      } finally {
        setLoading(false);
      }
    };

    fetchCrewData();
  }, [isAuthenticated, router]);

  // Filter crew members based on search and role
  const filteredCrew = crewMembers.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Calculate real statistics
  const stats = {
    total: crewMembers.length,
    drivers: crewMembers.filter(m => m.role === 'DRIVER').length,
    movers: crewMembers.filter(m => m.role === 'MOVER').length,
    available: crewMembers.filter(m => m.status === 'ACTIVE').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Available</Badge>;
      case 'INACTIVE':
        return <Badge variant="error">Inactive</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'DRIVER' ? 
      <Badge variant="primary">🚛 Driver</Badge> : 
      <Badge variant="secondary">📦 Mover</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading crew data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Crew Management</h1>
          <p className="text-text-secondary mt-2">
            Manage LGM crew members, assignments, and performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule View
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Crew Member
          </Button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Crew</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Drivers</p>
                <p className="text-2xl font-bold text-text-primary">{stats.drivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Movers</p>
                <p className="text-2xl font-bold text-text-primary">{stats.movers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Available</p>
                <p className="text-2xl font-bold text-text-primary">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search crew members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="DRIVER">Drivers</option>
                <option value="MOVER">Movers</option>
              </select>
              <Button variant="secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Crew Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            LGM Crew Members ({filteredCrew.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCrew.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No crew members found</h3>
              <p className="text-text-secondary">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Add your first crew member to get started.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCrew.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {member.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{member.name}</h3>
                          <p className="text-sm text-text-secondary">{member.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(member.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Role:</span>
                        {getRoleBadge(member.role)}
                      </div>
                      
                      {member.location_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Location:</span>
                          <div className="flex items-center text-sm text-text-primary">
                            <MapPin className="w-3 h-3 mr-1" />
                            {member.location_name}
                          </div>
                        </div>
                      )}
                      
                      {member.company_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Company:</span>
                          <span className="text-sm text-text-primary">{member.company_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      {member.phone && (
                        <Button variant="secondary" size="sm" className="flex-1">
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" className="flex-1">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}