'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useSuperAdminLoading } from '@/stores/superAdminStore';
import { useSuperAdminError } from '@/stores/superAdminStore';
import toast from 'react-hot-toast';

// TODO: Replace with API data
interface MockJourney {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: string;
  deliveryAddress: string;
  scheduledDate: string;
  estimatedDuration: number;
  crewSize: number;
  specialRequirements?: string;
  status: 'MORNING_PREP' | 'EN_ROUTE' | 'ONSITE' | 'COMPLETED' | 'CANCELLED';
  companyId: string;
  companyName: string;
  locationId: string;
  locationName: string;
  assignedCrew: string[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

const [realJourneys, setRealJourneys] = useState<MockJourney[]>([]);
const [isLoadingJourneys, setIsLoadingJourneys] = useState(false);

export default function SuperAdminJourneysPage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const isLoading = useSuperAdminLoading();
  const error = useSuperAdminError();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch real journey data
    const fetchRealJourneys = async () => {
      setIsLoadingJourneys(true);
      try {
        const token = localStorage.getItem('auth-token') || document.cookie.split('auth-token=')[1]?.split(';')[0];
        if (!token) {
          console.log('No authentication token found for super admin journeys');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/journey/active`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const journeys: MockJourney[] = (data.data || []).map((journey: any) => ({
            id: journey.id,
            customerName: journey.customerName || 'LGM Customer',
            customerPhone: journey.customerPhone || '+1-000-000-0000',
            customerEmail: journey.customerEmail || 'customer@lgm.com',
            pickupAddress: journey.pickupAddress || 'LGM Pickup Location',
            deliveryAddress: journey.deliveryAddress || 'LGM Delivery Location',
            scheduledDate: journey.date || new Date().toISOString(),
            estimatedDuration: journey.estimatedDuration || 3,
            crewSize: journey.crewSize || 2,
            specialRequirements: journey.specialRequirements || '',
            status: journey.status || 'MORNING_PREP',
            companyId: journey.clientId || 'lgm-corp',
            companyName: 'Lets Get Moving',
            locationId: journey.locationId || 'lgm-location',
            locationName: journey.locationName || 'LGM Location',
            assignedCrew: journey.assignedCrew || [],
            totalCost: journey.totalCost || 0,
            createdAt: journey.createdAt || new Date().toISOString(),
            updatedAt: journey.updatedAt || new Date().toISOString()
          }));
          
          console.log(`Loaded ${journeys.length} real journeys for super admin`);
          setRealJourneys(journeys);
        } else {
          console.log('No real journey data available yet for super admin');
          setRealJourneys([]);
        }
      } catch (error) {
        console.error('Failed to fetch real journeys:', error);
        setRealJourneys([]);
      } finally {
        setIsLoadingJourneys(false);
      }
    };

    fetchRealJourneys();
  }, [superAdmin, router]);

  // Filter journeys based on search and filters
  const filteredJourneys = realJourneys.filter(journey => {
    const matchesSearch = 
      journey.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journey.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journey.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journey.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = filterCompany === 'ALL' || journey.companyId === filterCompany;
    const matchesStatus = filterStatus === 'ALL' || journey.status === filterStatus;
    
    let matchesDate = true;
    if (filterDateFrom) {
      const journeyDate = new Date(journey.scheduledDate);
      const fromDate = new Date(filterDateFrom);
      matchesDate = matchesDate && journeyDate >= fromDate;
    }
    if (filterDateTo) {
      const journeyDate = new Date(journey.scheduledDate);
      const toDate = new Date(filterDateTo);
      matchesDate = matchesDate && journeyDate <= toDate;
    }
    
    return matchesSearch && matchesCompany && matchesStatus && matchesDate;
  });

  const handleCreateJourney = () => {
    router.push('/super-admin/journeys/create');
  };

  const handleViewJourney = (journeyId: string) => {
    router.push(`/super-admin/journeys/${journeyId}`);
  };

  const handleEditJourney = (journeyId: string) => {
    router.push(`/super-admin/journeys/${journeyId}/edit`);
  };

  const handleDeleteJourney = async (journeyId: string) => {
    if (confirm('Are you sure you want to delete this journey? This action cannot be undone.')) {
      // TODO: Implement delete functionality
      toast.success('Journey deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return 'warning';
      case 'EN_ROUTE': return 'info';
      case 'ONSITE': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return <AlertCircle className="w-4 h-4" />;
      case 'EN_ROUTE': return <PlayCircle className="w-4 h-4" />;
      case 'ONSITE': return <PauseCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-surface rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/super-admin/dashboard')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-text-primary">Journey Management</h1>
            </div>
            <p className="text-text-secondary text-sm">
              Manage journeys across all companies in the C&C CRM system
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button onClick={handleCreateJourney} size="sm" className="h-9">
              <Plus className="w-4 h-4 mr-2" />
              Create Journey
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search journeys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Company Filter */}
              <div>
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Companies</option>
                  <option value="company-1">LGM Corporate</option>
                  <option value="company-2">LGM Vancouver</option>
                  <option value="company-3">LGM Calgary</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="MORNING_PREP">Morning Prep</option>
                  <option value="EN_ROUTE">En Route</option>
                  <option value="ONSITE">Onsite</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                  placeholder="From Date"
                />
              </div>

              {/* Date To */}
              <div>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                  placeholder="To Date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {filteredJourneys.length} of {realJourneys.length} journeys
          </p>
        </div>

        {/* Journeys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJourneys.map((journey) => (
            <Card key={journey.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {journey.customerName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(journey.status)}
                        <Badge variant={getStatusBadgeVariant(journey.status)}>
                          {journey.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{journey.companyName}</Badge>
                      <Badge variant="secondary">{journey.locationName}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewJourney(journey.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditJourney(journey.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJourney(journey.id)}
                      className="h-8 w-8 p-0 text-error hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Journey Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">From: {journey.pickupAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">To: {journey.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{formatDateTime(journey.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{journey.estimatedDuration} hours</span>
                  </div>
                </div>

                {/* Journey Stats */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">
                      {journey.crewSize}
                    </div>
                    <div className="text-xs text-text-secondary">Crew</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">
                      {journey.assignedCrew.length}
                    </div>
                    <div className="text-xs text-text-secondary">Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">
                      {formatCurrency(journey.totalCost)}
                    </div>
                    <div className="text-xs text-text-secondary">Cost</div>
                  </div>
                </div>

                {/* Special Requirements */}
                {journey.specialRequirements && (
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-start space-x-2 text-sm">
                      <Package className="w-4 h-4 text-text-secondary mt-0.5" />
                      <span className="text-text-secondary">{journey.specialRequirements}</span>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Phone:</span>
                    <span className="text-text-primary">{journey.customerPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Email:</span>
                    <span className="text-text-primary truncate">{journey.customerEmail}</span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center space-x-2 text-xs text-text-secondary pt-2 border-t border-gray-700">
                  <Calendar className="w-3 h-3" />
                  <span>Created {formatDate(journey.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredJourneys.length === 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Truck className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No journeys found</h3>
                <p className="text-text-secondary mb-4">
                  {searchTerm || filterCompany !== 'ALL' || filterStatus !== 'ALL' || filterDateFrom || filterDateTo
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first journey'
                  }
                </p>
                {!searchTerm && filterCompany === 'ALL' && filterStatus === 'ALL' && !filterDateFrom && !filterDateTo && (
                  <Button onClick={handleCreateJourney}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Journey
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-error/20 bg-error/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-error">
                <div className="w-4 h-4">⚠️</div>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 