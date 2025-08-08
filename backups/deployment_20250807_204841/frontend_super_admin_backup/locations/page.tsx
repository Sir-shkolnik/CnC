'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  MapPin, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Phone,
  Building2,
  Truck,
  Package,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useSuperAdminLoading } from '@/stores/superAdminStore';
import { useSuperAdminError } from '@/stores/superAdminStore';
import toast from 'react-hot-toast';

// TODO: Replace with API data
interface MockLocation {
  id: string;
  name: string;
  contact: string;
  directLine: string;
  ownershipType: 'CORPORATE' | 'FRANCHISE';
  companyId: string;
  companyName: string;
  trucks: number;
  storageType: 'LOCKER' | 'POD' | 'NO';
  storagePricing: string;
  cxCare: boolean;
  province: string;
  region: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

const mockLocations: MockLocation[] = [
  {
    id: 'location-1',
    name: 'Toronto Main',
    contact: 'Sarah Manager',
    directLine: '+1-416-555-0101',
    ownershipType: 'CORPORATE',
    companyId: 'company-1',
    companyName: 'LGM Corporate',
    trucks: 5,
    storageType: 'LOCKER',
    storagePricing: '$75/month',
    cxCare: true,
    province: 'Ontario',
    region: 'Greater Toronto Area',
    address: '123 Main St, Toronto, ON M5V 1A1',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'location-5',
    name: 'Vancouver East',
    contact: 'David Manager',
    directLine: '+1-604-555-0505',
    ownershipType: 'FRANCHISE',
    companyId: 'company-2',
    companyName: 'LGM Vancouver',
    trucks: 3,
    storageType: 'POD',
    storagePricing: '$65/month',
    cxCare: false,
    province: 'British Columbia',
    region: 'Greater Vancouver',
    address: '654 East St, Vancouver, BC V5K 1B3',
    coordinates: { lat: 49.2488, lng: -123.0090 },
    status: 'ACTIVE',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z'
  }
];

export default function SuperAdminLocationsPage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const isLoading = useSuperAdminLoading();
  const error = useSuperAdminError();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('ALL');
  const [filterProvince, setFilterProvince] = useState<string>('ALL');
  const [filterStorageType, setFilterStorageType] = useState<'ALL' | 'LOCKER' | 'POD' | 'NO'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }
  }, [superAdmin, router]);

  // Filter locations based on search and filters
  const filteredLocations = mockLocations.filter(location => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = filterCompany === 'ALL' || location.companyId === filterCompany;
    const matchesProvince = filterProvince === 'ALL' || location.province === filterProvince;
    const matchesStorageType = filterStorageType === 'ALL' || location.storageType === filterStorageType;
    const matchesStatus = filterStatus === 'ALL' || location.status === filterStatus;
    
    return matchesSearch && matchesCompany && matchesProvince && matchesStorageType && matchesStatus;
  });

  const handleCreateLocation = () => {
    router.push('/super-admin/locations/create');
  };

  const handleViewLocation = (locationId: string) => {
    router.push(`/super-admin/locations/${locationId}`);
  };

  const handleEditLocation = (locationId: string) => {
    router.push(`/super-admin/locations/${locationId}/edit`);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      // TODO: Implement delete functionality
      toast.success('Location deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStorageTypeIcon = (storageType: string) => {
    switch (storageType) {
      case 'LOCKER': return <Package className="w-4 h-4" />;
      case 'POD': return <Truck className="w-4 h-4" />;
      case 'NO': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStorageTypeColor = (storageType: string) => {
    switch (storageType) {
      case 'LOCKER': return 'text-success';
      case 'POD': return 'text-warning';
      case 'NO': return 'text-text-secondary';
      default: return 'text-text-secondary';
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
              <h1 className="text-2xl font-bold text-text-primary">Location Management</h1>
            </div>
            <p className="text-text-secondary text-sm">
              Manage locations across all companies in the C&C CRM system
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button onClick={handleCreateLocation} size="sm" className="h-9">
              <Plus className="w-4 h-4 mr-2" />
              Create Location
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search locations..."
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

              {/* Province Filter */}
              <div>
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Provinces</option>
                  <option value="Ontario">Ontario</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Alberta">Alberta</option>
                </select>
              </div>

              {/* Storage Type Filter */}
              <div>
                <select
                  value={filterStorageType}
                  onChange={(e) => setFilterStorageType(e.target.value as any)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Storage Types</option>
                  <option value="LOCKER">Locker</option>
                  <option value="POD">POD</option>
                  <option value="NO">No Storage</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {filteredLocations.length} of {mockLocations.length} locations
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {location.name}
                      </h3>
                      <Badge variant={location.ownershipType === 'CORPORATE' ? 'primary' : 'secondary'}>
                        {location.ownershipType}
                      </Badge>
                    </div>
                    <Badge variant={location.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {location.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewLocation(location.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLocation(location.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLocation(location.id)}
                      className="h-8 w-8 p-0 text-error hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Location Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{location.companyName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{location.contact}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{location.directLine}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{location.address}</span>
                  </div>
                </div>

                {/* Location Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">
                      {location.trucks}
                    </div>
                    <div className="text-xs text-text-secondary">Trucks</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {getStorageTypeIcon(location.storageType)}
                      <span className={`text-sm font-medium ${getStorageTypeColor(location.storageType)}`}>
                        {location.storageType}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary">Storage</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">CX Care:</span>
                    <div className="flex items-center space-x-1">
                      {location.cxCare ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-text-secondary" />
                      )}
                      <span className={location.cxCare ? 'text-success' : 'text-text-secondary'}>
                        {location.cxCare ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  {location.storageType !== 'NO' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Storage Pricing:</span>
                      <span className="text-text-primary font-medium">{location.storagePricing}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Region:</span>
                    <span className="text-text-primary">{location.region}</span>
                  </div>
                </div>

                {/* Updated Date */}
                <div className="flex items-center space-x-2 text-xs text-text-secondary pt-2 border-t border-gray-700">
                  <Calendar className="w-3 h-3" />
                  <span>Updated {formatDate(location.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredLocations.length === 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No locations found</h3>
                <p className="text-text-secondary mb-4">
                  {searchTerm || filterCompany !== 'ALL' || filterProvince !== 'ALL' || filterStorageType !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first location'
                  }
                </p>
                {!searchTerm && filterCompany === 'ALL' && filterProvince === 'ALL' && filterStorageType === 'ALL' && (
                  <Button onClick={handleCreateLocation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Location
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