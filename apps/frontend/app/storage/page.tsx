'use client';

import React, { useEffect, useState } from 'react';
import { useStorageStore, useStorageLocations, useSelectedLocation, useViewMode } from '@/stores/storageStore';
import { InteractiveMap } from '@/components/StorageManagement/StorageMap/InteractiveMap';
import { StorageAnalytics } from '@/components/StorageManagement/Analytics/StorageAnalytics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { 
  Building2, 
  MapPin, 
  Grid, 
  BarChart3, 
  List, 
  Plus, 
  Search, 
  Filter,
  Settings,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  Globe,
  Users,
  Package,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StorageSystemPage() {
  const locations = useStorageLocations();
  const selectedLocation = useSelectedLocation();
  const viewMode = useViewMode();
  
  const {
    fetchLocations,
    selectLocation,
    setViewMode,
    exportData,
    importData,
    clearError,
    error
  } = useStorageStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CORPORATE' | 'FRANCHISE'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Filter locations based on search and type
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || location.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleLocationSelect = (locationId: string) => {
    selectLocation(locationId);
    toast.success(`Selected ${locations.find(l => l.id === locationId)?.name}`);
  };

  const handleExport = (type: 'LOCATIONS' | 'UNITS' | 'BOOKINGS' | 'ANALYTICS') => {
    exportData(type);
    toast.success(`${type} data exported successfully`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const type = file.name.includes('locations') ? 'LOCATIONS' : 
                   file.name.includes('units') ? 'UNITS' : 
                   file.name.includes('bookings') ? 'BOOKINGS' : 'ANALYTICS';
      
      await importData(data, type);
      toast.success(`${type} data imported successfully`);
    } catch (error) {
      toast.error('Failed to import data');
    }
  };

  const getLocationStats = () => {
    const total = locations.length;
    const corporate = locations.filter(l => l.type === 'CORPORATE').length;
    const franchise = locations.filter(l => l.type === 'FRANCHISE').length;
    const withStorage = locations.filter(l => l.storage.types.length > 0).length;
    
    return { total, corporate, franchise, withStorage };
  };

  const stats = getLocationStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Storage System
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Interactive storage management with drag-and-drop functionality
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                // TODO: Open settings modal
                toast.success('Settings coming soon');
              }}
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              className="h-8"
              onClick={() => {
                // TODO: Open add location modal
                toast.success('Add location functionality coming soon');
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Locations</p>
                  <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Corporate</p>
                  <p className="text-lg font-bold text-gray-900">{stats.corporate}</p>
                </div>
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Building2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Franchise</p>
                  <p className="text-lg font-bold text-gray-900">{stats.franchise}</p>
                </div>
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">With Storage</p>
                  <p className="text-lg font-bold text-gray-900">{stats.withStorage}</p>
                </div>
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Compact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-1"
                onClick={() => setViewMode('GRID')}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-sm">View Storage Map</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-1"
                onClick={() => window.location.href = '/storage/booking'}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Customer Booking</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-1"
                onClick={() => window.location.href = '/storage/units'}
              >
                <Package className="w-5 h-5" />
                <span className="text-sm">Manage Units</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-1"
                onClick={() => window.location.href = '/storage/billing'}
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">Billing & Payments</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location Selection and Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Management
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'GRID' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('GRID')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={viewMode === 'ANALYTICS' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('ANALYTICS')}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={viewMode === 'LIST' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('LIST')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Export/Import */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('LOCATIONS')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <Button variant="ghost" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </label>
                </div>
                
                {/* Refresh */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    fetchLocations().finally(() => setIsLoading(false));
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {/* Filter Options */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <div className="flex gap-2">
                    {(['ALL', 'CORPORATE', 'FRANCHISE'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={filterType === type ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedLocation === location.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleLocationSelect(location.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.address.city}, {location.address.province}</p>
                      </div>
                      <Badge variant={location.type === 'CORPORATE' ? 'primary' : 'secondary'}>
                        {location.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Manager: {location.contact.manager}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Storage: {location.storage.types.join(', ')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>${location.pricing.baseRates.basePrice}/{location.pricing.baseRates.billingCycle.toLowerCase()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Status: {location.status}</span>
                        <span>Capacity: {location.storage.totalCapacity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Empty State */}
            {filteredLocations.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm || filterType !== 'ALL' ? 'No locations found' : 'No locations configured'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterType !== 'ALL' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first storage location'
                  }
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: Open add location modal
                    toast.success('Add location functionality coming soon');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="h-[600px]">
          {viewMode === 'GRID' && (
            <InteractiveMap locationId={selectedLocation} />
          )}
          
          {viewMode === 'ANALYTICS' && (
            <StorageAnalytics locationId={selectedLocation} />
          )}
          
          {viewMode === 'LIST' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Storage Units List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <List className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    List View Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Detailed list view of storage units will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">
            Storage System v1.0.0 • Interactive drag-and-drop storage management
          </p>
        </div>
      </div>
    </div>
  );
} 