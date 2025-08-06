'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  Truck, 
  BarChart3, 
  Shield, 
  Download, 
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Globe,
  Calendar,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useCurrentCompany } from '@/stores/superAdminStore';
import { useSuperAdminAnalytics } from '@/stores/superAdminStore';
import { useAvailableCompanies } from '@/stores/superAdminStore';
import { useShowCompanySelector } from '@/stores/superAdminStore';
import { useSuperAdminLoading } from '@/stores/superAdminStore';
import { useSuperAdminError } from '@/stores/superAdminStore';
import toast from 'react-hot-toast';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const currentCompany = useCurrentCompany();
  const analytics = useSuperAdminAnalytics();
  const availableCompanies = useAvailableCompanies();
  const showCompanySelector = useShowCompanySelector();
  const isLoading = useSuperAdminLoading();
  const error = useSuperAdminError();
  
  const { 
    loadAnalytics, 
    loadCompanies, 
    switchCompany, 
    toggleCompanySelector,
    logout 
  } = useSuperAdminStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }

    // Load initial data
    loadAnalytics();
    loadCompanies();
  }, [superAdmin, router, loadAnalytics, loadCompanies]);

  const handleCompanySwitch = async (companyId: string) => {
    try {
      await switchCompany(companyId);
      toast.success('Company switched successfully');
    } catch (error) {
      toast.error('Failed to switch company');
    }
  };

  const handleLogout = () => {
    logout();
            router.push('/auth/login');
    toast.success('Logged out successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-CA').format(num);
  };

  const getRevenueChange = () => {
    if (!analytics) return 0;
    const change = analytics.revenueThisMonth - analytics.revenueLastMonth;
    const percentage = (change / analytics.revenueLastMonth) * 100;
    return percentage;
  };

  const revenueChange = getRevenueChange();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-surface rounded"></div>
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
            <h1 className="text-2xl font-bold text-text-primary mb-1">Super Admin Dashboard</h1>
            <p className="text-text-secondary text-sm">
              Welcome back, {superAdmin?.username}! Managing {analytics?.totalCompanies || 0} companies.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Company Selector */}
            <div className="relative">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={toggleCompanySelector}
                className="h-9"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {currentCompany?.name || 'Select Company'}
              </Button>
              
              {showCompanySelector && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-700">
                    <h3 className="text-sm font-medium text-text-primary">Switch Company</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {availableCompanies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleCompanySwitch(company.id)}
                        className={`w-full p-3 text-left hover:bg-surface/50 transition-colors ${
                          currentCompany?.id === company.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{company.name}</p>
                            <p className="text-xs text-text-secondary">{company.type}</p>
                          </div>
                          <Badge variant={company.status === 'ACTIVE' ? 'success' : 'warning'}>
                            {company.status}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout} className="h-9">
              Logout
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Companies */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-text-secondary">Total Companies</CardTitle>
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {formatNumber(analytics.totalCompanies)}
                </div>
                <p className="text-xs text-text-secondary">Active companies in system</p>
              </CardContent>
            </Card>

            {/* Total Users */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-text-secondary">Total Users</CardTitle>
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {formatNumber(analytics.totalUsers)}
                </div>
                <p className="text-xs text-text-secondary">Active users across companies</p>
              </CardContent>
            </Card>

            {/* Total Locations */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-text-secondary">Total Locations</CardTitle>
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {formatNumber(analytics.totalLocations)}
                </div>
                <p className="text-xs text-text-secondary">Active locations</p>
              </CardContent>
            </Card>

            {/* Total Journeys */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-text-secondary">Total Journeys</CardTitle>
                  <Truck className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {formatNumber(analytics.totalJourneys)}
                </div>
                <p className="text-xs text-text-secondary">
                  {analytics.activeJourneys} active, {analytics.completedJourneys} completed
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Overview */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-primary" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">This Month</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatCurrency(analytics.revenueThisMonth)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">Last Month</p>
                    <p className="text-lg text-text-primary">
                      {formatCurrency(analytics.revenueLastMonth)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {revenueChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-error" />
                  )}
                  <span className={`text-sm font-medium ${
                    revenueChange >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                  </span>
                  <span className="text-sm text-text-secondary">vs last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Journey Status */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Journey Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
                    <p className="text-lg font-bold text-success">
                      {analytics.completedJourneys}
                    </p>
                    <p className="text-xs text-text-secondary">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-warning mx-auto mb-2" />
                    <p className="text-lg font-bold text-warning">
                      {analytics.activeJourneys}
                    </p>
                    <p className="text-xs text-text-secondary">Active</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(analytics.completedJourneys / analytics.totalJourneys) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary text-center">
                  {((analytics.completedJourneys / analytics.totalJourneys) * 100).toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/super-admin/companies')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Building2 className="w-6 h-6" />
                <span>Manage Companies</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => router.push('/super-admin/users')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => router.push('/super-admin/analytics')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <BarChart3 className="w-6 h-6" />
                <span>View Analytics</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => router.push('/super-admin/audit')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Shield className="w-6 h-6" />
                <span>Audit Logs</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => router.push('/super-admin/database')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Database className="w-6 h-6" />
                <span>Database Health</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Company Context */}
        {currentCompany && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary" />
                Current Company Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Company Name</p>
                  <p className="font-medium text-text-primary">{currentCompany.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Type</p>
                  <Badge variant={currentCompany.type === 'CORPORATE' ? 'primary' : 'secondary'}>
                    {currentCompany.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Status</p>
                  <Badge variant={currentCompany.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {currentCompany.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-error/20 bg-error/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-error">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 