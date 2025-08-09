'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Camera,
  Grid,
  List
} from 'lucide-react';
import { useJourneyStore } from '@/stores/journeyStore';
import { useAuthStore } from '@/stores/authStore';
import { MobileJourneyCard } from '@/components/JourneyManagement/MobileJourneyCard';
import toast from 'react-hot-toast';

export default function JourneysPage() {
  const router = useRouter();
  const { journeys, isLoading, fetchJourneys } = useJourneyStore();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'mobile' | 'table'>('mobile'); // Default to mobile-friendly view

  // Fetch journeys on component mount
  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  // Filter and sort journeys
  const filteredJourneys = journeys
    .filter(journey => {
      const matchesSearch = 
        journey.truckNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journey.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || journey.status === statusFilter;
      
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === 'today' && new Date(journey.date).toDateString() === new Date().toDateString()) ||
        (dateFilter === 'week' && new Date(journey.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'truck':
          return (a.truckNumber || '').localeCompare(b.truckNumber || '');
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return 'warning';
      case 'EN_ROUTE': return 'info';
      case 'ONSITE': return 'secondary';
      case 'COMPLETED': return 'success';
      case 'AUDITED': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return '🕐 Morning Prep';
      case 'EN_ROUTE': return '🚛 En Route';
      case 'ONSITE': return '📍 On Site';
      case 'COMPLETED': return '✅ Completed';
      case 'AUDITED': return '📋 Audited';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleJourneyAction = (journeyId: string, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/journey/${journeyId}`);
        break;
      case 'edit':
        // Navigate to journey detail page where edit modal can be opened
        router.push(`/journey/${journeyId}?tab=edit`);
        break;
      case 'delete':
        toast('Delete functionality coming soon!');
        break;
      default:
        break;
    }
  };

  // Mobile journey handlers
  const handleStartJourney = (journeyId: string) => {
    toast.success('Journey started!');
    router.push(`/journey/${journeyId}`);
  };

  const handleCompleteStep = (journeyId: string, stepId: string) => {
    toast.success('Step completed!');
    // Here you would call an API to update the journey step
  };

  const handleTakePhoto = (journeyId: string, stepId: string) => {
    // For now, just show a toast - in production this would open camera
    toast.success('Photo capture opened');
    // In production: router.push(`/journey/${journeyId}/photo/${stepId}`);
  };

  const handleCreateJourney = () => {
    router.push('/journey/create');
  };

  const stats = {
    total: journeys.length,
    active: journeys.filter(j => j.status === 'MORNING_PREP' || j.status === 'EN_ROUTE' || j.status === 'ONSITE').length,
    completed: journeys.filter(j => j.status === 'COMPLETED').length,
    today: journeys.filter(j => new Date(j.date).toDateString() === new Date().toDateString()).length
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Improved Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Journey Management</h1>
          <p className="text-text-secondary text-sm">Manage and track all truck journeys</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* View Mode Toggle */}
          <div className="flex bg-surface border border-gray-600 rounded-lg p-1">
            <Button
              variant={viewMode === 'mobile' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className="px-3 py-1 h-8"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="px-3 py-1 h-8"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-9"
            onClick={() => {
              fetchJourneys();
              toast.success('Journeys refreshed!');
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateJourney} size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-2" />
            New Journey
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Improved Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Truck className="w-5 h-5 text-primary" />
              <p className="text-xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <p className="text-xs text-text-secondary">Total Journeys</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              <p className="text-xl font-bold text-text-primary">{stats.active}</p>
            </div>
            <p className="text-xs text-text-secondary">Active</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="text-xl font-bold text-text-primary">{stats.completed}</p>
            </div>
            <p className="text-xs text-text-secondary">Completed</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-info" />
              <p className="text-xl font-bold text-text-primary">{stats.today}</p>
            </div>
            <p className="text-xs text-text-secondary">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Improved Layout */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <Input
                placeholder="Search journeys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="MORNING_PREP">Morning Prep</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="ONSITE">On Site</option>
              <option value="COMPLETED">Completed</option>
              <option value="AUDITED">Audited</option>
            </select>
            <select
              className="px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
            <select
              className="px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="truck">Sort by Truck</option>
            </select>
            <Button 
              variant="secondary" 
              size="sm"
              className="h-10"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setSortBy('date');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Journeys List - Mobile/Table View */}
      {viewMode === 'mobile' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              Journeys ({filteredJourneys.length})
            </h2>
            {user && ['DRIVER', 'MOVER'].includes(user.role) && (
              <Badge variant="info" className="text-xs">
                Touch-optimized for field work
              </Badge>
            )}
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-32 bg-surface/50 rounded-lg border border-gray-700"></div>
                </div>
              ))}
            </div>
          ) : filteredJourneys.length > 0 ? (
            <div className="space-y-4">
              {filteredJourneys.map((journey) => (
                <MobileJourneyCard
                  key={journey.id}
                  journey={journey}
                  userRole={user?.role || 'GUEST'}
                  onStartJourney={handleStartJourney}
                  onCompleteStep={handleCompleteStep}
                  onTakePhoto={handleTakePhoto}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No journeys found</h3>
              <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating your first journey.'
                }
              </p>
              <Button onClick={handleCreateJourney} size="lg" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Journey
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              Journeys ({filteredJourneys.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-16 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredJourneys.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Journey</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Crew</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJourneys.map((journey) => (
                      <tr key={journey.id} className="border-b border-gray-700 hover:bg-surface/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-text-primary">{journey.truckNumber || 'Unassigned'}</p>
                            <p className="text-sm text-text-secondary">ID: {journey.id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusColor(journey.status)}>
                            {getStatusText(journey.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-text-primary">
                          {formatDate(journey.date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-text-secondary" />
                            <span className="text-sm text-text-secondary">2 crew</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-text-secondary" />
                            <span className="text-sm text-text-secondary">Location {journey.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleJourneyAction(journey.id, 'view')}
                              title="View Journey"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleJourneyAction(journey.id, 'edit')}
                              title="Edit Journey"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleJourneyAction(journey.id, 'delete')}
                              title="Delete Journey"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">No journeys found</h3>
                <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters to find what you\'re looking for.'
                    : 'Get started by creating your first journey.'
                  }
                </p>
                <Button onClick={handleCreateJourney} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Journey
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 