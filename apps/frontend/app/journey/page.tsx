'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Journey {
  id: string;
  date: string;
  truckNumber: string;
  status: string;
  location: string;
  driver: string;
  mover: string;
  jobs: number;
  startTime?: string;
  endTime?: string;
}

export default function JourneyPage() {
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/journey');
      if (response.ok) {
        const data = await response.json();
        setJourneys(data);
      }
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'morning_prep':
        return 'bg-blue-100 text-blue-800';
      case 'on_road':
        return 'bg-green-100 text-green-800';
      case 'on_site':
        return 'bg-yellow-100 text-yellow-800';
      case 'returning':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'morning_prep':
        return <Clock className="w-4 h-4" />;
      case 'on_road':
        return <Truck className="w-4 h-4" />;
      case 'on_site':
        return <MapPin className="w-4 h-4" />;
      case 'returning':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journey.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journey.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || journey.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journey Management</h1>
          <p className="text-gray-600">Manage truck journeys and crew assignments</p>
        </div>
        <Button onClick={() => router.push('/journey/create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Journey
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by truck, driver, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="morning_prep">Morning Prep</option>
                <option value="on_road">On Road</option>
                <option value="on_site">On Site</option>
                <option value="returning">Returning</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" onClick={fetchJourneys}>
                <Filter className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journeys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            All Journeys ({filteredJourneys.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJourneys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No journeys found</p>
              <p className="text-sm">Create your first journey to get started</p>
              <Button 
                onClick={() => router.push('/journey/create')}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Journey
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJourneys.map((journey) => (
                <div key={journey.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Truck className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">Truck {journey.truckNumber}</h3>
                          <Badge className={getStatusColor(journey.status)}>
                            {getStatusIcon(journey.status)}
                            <span className="ml-1">{journey.status.replace('_', ' ').toUpperCase()}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(journey.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {journey.location}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {journey.jobs} jobs
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          <span className="mr-4"><strong>Driver:</strong> {journey.driver}</span>
                          <span><strong>Mover:</strong> {journey.mover}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {journey.startTime && (
                        <div className="text-sm text-gray-500">
                          <strong>Start:</strong> {journey.startTime}
                        </div>
                      )}
                      {journey.endTime && (
                        <div className="text-sm text-gray-500">
                          <strong>End:</strong> {journey.endTime}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/journey/${journey.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
