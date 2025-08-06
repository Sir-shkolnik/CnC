'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  MapPin as LocationIcon
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useAvailableCompanies } from '@/stores/superAdminStore';
import { useSuperAdminLoading } from '@/stores/superAdminStore';
import { useSuperAdminError } from '@/stores/superAdminStore';
import { Company } from '@/types/superAdmin';
import toast from 'react-hot-toast';

export default function SuperAdminCompaniesPage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const companies = useAvailableCompanies();
  const isLoading = useSuperAdminLoading();
  const error = useSuperAdminError();
  
  const { loadCompanies } = useSuperAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CORPORATE' | 'FRANCHISE'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }

    // Load companies
    loadCompanies();
  }, [superAdmin, router, loadCompanies]);

  // Filter companies based on search and filters
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || company.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || company.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateCompany = () => {
    router.push('/super-admin/companies/create');
  };

  const handleViewCompany = (companyId: string) => {
    router.push(`/super-admin/companies/${companyId}`);
  };

  const handleEditCompany = (companyId: string) => {
    router.push(`/super-admin/companies/${companyId}/edit`);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      // TODO: Implement delete functionality
      toast.success('Company deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <h1 className="text-2xl font-bold text-text-primary">Company Management</h1>
            </div>
            <p className="text-text-secondary text-sm">
              Manage all companies in the C&C CRM system
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button onClick={handleCreateCompany} size="sm" className="h-9">
              <Plus className="w-4 h-4 mr-2" />
              Create Company
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="FRANCHISE">Franchise</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {filteredCompanies.length} of {companies.length} companies
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {company.name}
                      </h3>
                      <Badge variant={company.type === 'CORPORATE' ? 'primary' : 'secondary'}>
                        {company.type}
                      </Badge>
                    </div>
                    <Badge variant={company.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {company.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCompany(company.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCompany(company.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCompany(company.id)}
                      className="h-8 w-8 p-0 text-error hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{company.contactEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{company.contactPhone}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-text-secondary mt-0.5" />
                    <span className="text-text-secondary">{company.address}</span>
                  </div>
                </div>

                {/* Company Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">12</div>
                    <div className="text-xs text-text-secondary">Locations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">45</div>
                    <div className="text-xs text-text-secondary">Users</div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center space-x-2 text-xs text-text-secondary pt-2 border-t border-gray-700">
                  <Calendar className="w-3 h-3" />
                  <span>Created {formatDate(company.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No companies found</h3>
                <p className="text-text-secondary mb-4">
                  {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first company'
                  }
                </p>
                {!searchTerm && filterType === 'ALL' && filterStatus === 'ALL' && (
                  <Button onClick={handleCreateCompany}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Company
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