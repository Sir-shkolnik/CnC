'use client';

import React, { useState, useEffect } from 'react';
import { useStorageStore, useStorageUnits, useStorageLocations } from '@/stores/storageStore';
import { StorageUnit } from '@/types/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings,
  Building2,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Grid3X3,
  List,
  Download,
  Upload
} from 'lucide-react';
import { AddStorageUnitModal } from '@/components/StorageManagement/Modals/AddStorageUnitModal';
import toast from 'react-hot-toast';

export default function StorageUnitsPage() {
  const units = useStorageUnits();
  const locations = useStorageLocations();
  const { fetchStorageUnits, deleteStorageUnit, isDeleting } = useStorageStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchStorageUnits();
  }, []);

  // Filter units
  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || unit.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || unit.status === filterStatus;
    const matchesLocation = filterLocation === 'ALL' || unit.locationId === filterLocation;
    
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  const handleDeleteUnit = async (unitId: string) => {
    if (confirm('Are you sure you want to delete this storage unit?')) {
      try {
        await deleteStorageUnit(unitId);
        toast.success('Storage unit deleted successfully');
      } catch (error) {
        toast.error('Failed to delete storage unit');
      }
    }
  };

  const handleEditUnit = (unit: StorageUnit) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'POD':
        return '📦';
      case 'LOCKER':
        return '🔒';
      case 'CONTAINER':
        return '📦';
      default:
        return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'OCCUPIED':
        return 'bg-red-500';
      case 'RESERVED':
        return 'bg-yellow-500';
      case 'MAINTENANCE':
        return 'bg-gray-500';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-700';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ');
  };

  const getLocationName = (locationId: string) => {
    return locations.find(l => l.id === locationId)?.name || 'Unknown Location';
  };

  const exportUnits = () => {
    const csvContent = [
      ['Unit ID', 'Type', 'Status', 'Location', 'Size', 'Price', 'Features'].join(','),
      ...filteredUnits.map(unit => [
        unit.id,
        unit.type,
        unit.status,
        getLocationName(unit.locationId),
        `${unit.size.width}'×${unit.size.length}'×${unit.size.height}'`,
        `$${unit.pricing.basePrice}/${unit.pricing.billingCycle.toLowerCase()}`,
        unit.features.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storage-units.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Units exported successfully');
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredUnits.map((unit) => (
        <Card key={unit.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${getStatusColor(unit.status)}`}>
                {getUnitIcon(unit.type)}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditUnit(unit)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUnit(unit.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">{unit.type} Unit</h3>
                <p className="text-sm text-gray-600">{unit.id}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={unit.status === 'AVAILABLE' ? 'success' : unit.status === 'OCCUPIED' ? 'error' : 'warning'}>
                    {getStatusText(unit.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{getLocationName(unit.locationId)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {unit.size.width}' × {unit.size.length}' × {unit.size.height}'
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-green-600">
                    ${unit.pricing.basePrice}/{unit.pricing.billingCycle.toLowerCase()}
                  </span>
                </div>
              </div>

              {unit.features.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {unit.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {String(feature)}
                      </Badge>
                    ))}
                    {unit.features.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{unit.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderList = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-sm ${getStatusColor(unit.status)}`}>
                        {getUnitIcon(unit.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{unit.type} Unit</div>
                        <div className="text-sm text-gray-500">{unit.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={unit.status === 'AVAILABLE' ? 'success' : unit.status === 'OCCUPIED' ? 'error' : 'warning'}>
                      {getStatusText(unit.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getLocationName(unit.locationId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {unit.size.width}' × {unit.size.length}' × {unit.size.height}'
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-semibold text-green-600">
                      ${unit.pricing.basePrice}/{unit.pricing.billingCycle.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {unit.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {String(feature)}
                        </Badge>
                      ))}
                      {unit.features.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{unit.features.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUnit(unit)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.id)}
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
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storage Units</h1>
          <p className="text-gray-600">Manage all storage units across locations</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={exportUnits}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {units.filter(u => u.status === 'AVAILABLE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {units.filter(u => u.status === 'OCCUPIED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {units.filter(u => u.status === 'MAINTENANCE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{units.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}

              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="POD">POD</option>
                <option value="LOCKER">Locker</option>
                <option value="CONTAINER">Container</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="RESERVED">Reserved</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="ALL">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredUnits.length} of {units.length} units
          </p>
        </div>
        
        {filteredUnits.length > 0 ? (
          viewMode === 'grid' ? renderGrid() : renderList()
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Units Found</h3>
            <p className="text-gray-500">
              No storage units match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStorageUnitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        locationId={filterLocation === 'ALL' ? locations[0]?.id || '' : filterLocation}
        onSuccess={() => {
          setIsAddModalOpen(false);
          toast.success('Storage unit added successfully');
        }}
      />

      {selectedUnit && (
        <AddStorageUnitModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUnit(null);
          }}
          locationId={selectedUnit.locationId}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedUnit(null);
            toast.success('Storage unit updated successfully');
          }}
        />
      )}
    </div>
  );
} 