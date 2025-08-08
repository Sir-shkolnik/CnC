'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  ArrowRight,
  Search,
  Users,
  MapPin,
  Smartphone,
  Filter
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useMobileFieldOpsStore } from '@/stores/mobileFieldOpsStore';
import toast from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  industry: string;
  isFranchise: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  locationId: string;
  status: string;
}

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  locationId: string;
  status: string;
  locationName?: string;
  locationType?: 'CORPORATE' | 'FRANCHISE';
}

interface Location {
  id: string;
  name: string;
  type: 'CORPORATE' | 'FRANCHISE';
}

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login: authLogin, isLoading: authLoading } = useAuthStore();
  const { login: superAdminLogin, isLoading: superAdminLoading } = useSuperAdminStore();
  
  const [step, setStep] = useState<'company' | 'login'>('company');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  // State for company users
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CompanyUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // New state for location filtering
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  const isLoading = authLoading || superAdminLoading;

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Fetch company users when company is selected
  useEffect(() => {
    if (selectedCompany?.id) {
      fetchCompanyUsers(selectedCompany.id);
    }
  }, [selectedCompany]);

  // Extract unique locations from users and update location filter
  useEffect(() => {
    if (companyUsers.length > 0) {
      const uniqueLocations = Array.from(
        new Map(
          companyUsers
            .filter((user: CompanyUser) => user.locationName && user.locationId)
            .map((user: CompanyUser) => [
              user.locationId,
              {
                id: user.locationId,
                name: user.locationName!,
                type: user.locationType || 'CORPORATE'
              }
            ])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name));
      
      setLocations(uniqueLocations);
      setSelectedLocation('ALL'); // Reset location filter when users change
    }
  }, [companyUsers]);

  // Filter users based on search term and selected location
  useEffect(() => {
    let filtered = companyUsers;
    
    // Filter by location first
    if (selectedLocation !== 'ALL') {
      filtered = filtered.filter((user: CompanyUser) => user.locationId === selectedLocation);
    }
    
    // Then filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((user: CompanyUser) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.locationName && user.locationName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, companyUsers, selectedLocation]);

  const loadCompanies = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/companies`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCompanies(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const fetchCompanyUsers = async (companyId: string) => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/companies/${companyId}/users`);
      if (response.ok) {
        const data = await response.json();
        const users = data.data || [];
        
        console.log("Fetched users from API:", users.length);
        
        // Set users directly from API
        setCompanyUsers(users);
        setFilteredUsers(users);
        
        // Extract unique locations for filtering
        const uniqueLocations = Array.from(new Set(users.map((user: CompanyUser) => user.location_name)))
          .filter(Boolean)
          .map(locationName => ({
            id: locationName,
            name: locationName,
            type: users.find((u: CompanyUser) => u.location_name === locationName)?.location_type || 'FRANCHISE'
          }));
        
        setLocations(uniqueLocations);
        console.log("Extracted locations:", uniqueLocations.length);
        
      } else {
        console.error("Failed to fetch users:", response.status);
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setFormData(prev => ({ ...prev, email: '', password: '' }));
    setSearchTerm('');
    setSelectedLocation('ALL'); // Reset location filter
    setStep('login');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const detectUserType = async (email: string, password: string): Promise<{ type: 'web' | 'mobile' | 'super', userData: any }> => {
    try {
      // Use unified login endpoint for all users
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company_id: selectedCompany?.id })
      });
      
      const userData = await userResponse.json();
      
      if (!userResponse.ok) {
        throw new Error(userData.message || 'Login failed');
      }
      
      if (userData.success && userData.user) {
        const user = userData.user;
        
        // Determine user type based on role
        if (user.role === 'SUPER_ADMIN') {
          return { type: 'super', userData };
        } else if (['DRIVER', 'MOVER'].includes(user.role)) {
          return { type: 'mobile', userData };
        } else {
          return { type: 'web', userData };
        }
      } else {
        throw new Error(userData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error detecting user type:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      toast.error('Please select a company first');
      return;
    }

    try {
      const result = await detectUserType(formData.email, formData.password);
      
      // Handle authentication and redirect based on user type
      switch (result.type) {
        case 'super':
          // For super admin, we already have the data, just set the store state
          if (result.userData) {
            // Set super admin store state
            const { login } = useSuperAdminStore.getState();
            await login(formData.email, formData.password);
          }
          router.push('/super-admin/dashboard');
          break;
          
        case 'mobile':
          // For mobile users, we already have the data, just set the store state
          if (result.userData) {
            // Set mobile store state
            const { login } = useMobileFieldOpsStore.getState();
            await login({
              username: formData.email,
              password: formData.password,
              deviceId: 'web-device',
              locationId: result.userData.user.location_id || 'default-location'
            });
          }
          router.push('/mobile'); // Mobile-specific interface
          break;
          
        case 'web':
          // For web users, we already have the data, just set the store state
          if (result.userData) {
            // Set auth store state
            const { login } = useAuthStore.getState();
            await login(formData.email, formData.password, selectedCompany?.id);
          }
          router.push('/dashboard'); // Web interface
          break;
      }
      
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'error';
      case 'MANAGER':
        return 'default';
      case 'DISPATCHER':
        return 'secondary';
      case 'DRIVER':
        return 'outline';
      case 'MOVER':
        return 'warning';
      case 'AUDITOR':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return <User className="w-4 h-4" />;
      case 'MANAGER':
        return <Building2 className="w-4 h-4" />;
      case 'DISPATCHER':
        return <Users className="w-4 h-4" />;
      case 'DRIVER':
        return <Truck className="w-4 h-4" />;
      case 'MOVER':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const handleUserSelect = (user: CompanyUser) => {
    setFormData(prev => ({ ...prev, email: user.email }));
    toast.success(`Filled ${user.name}'s email`);
  };

  if (step === 'company') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">C&C CRM</h1>
                <p className="text-sm text-text-secondary">Trust the Journey</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Select Your Company</h2>
            <p className="text-text-secondary">Choose your company to continue</p>
          </div>

          {/* Company Selection */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <CardTitle className="text-text-primary text-lg text-center">
                Available Companies
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {isLoadingCompanies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-text-secondary">Loading companies...</span>
                </div>
              ) : (
                <div className="grid gap-4">
                  {companies.map((company: Company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className="p-4 text-left bg-surface/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors hover:shadow-lg w-full"
                      type="button"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-text-primary truncate">{company.name}</h3>
                          <p className="text-sm text-text-secondary truncate">{company.industry}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={company.isFranchise ? 'warning' : 'success'} className="text-xs">
                              {company.isFranchise ? 'Franchise' : 'Corporate'}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">C&C CRM</h1>
              <p className="text-sm text-text-secondary">Trust the Journey</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
          <p className="text-text-secondary">Sign in to your account</p>
          
          {/* Selected Company */}
          {selectedCompany && (
            <div className="mt-4 p-3 bg-surface/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-primary">{selectedCompany.name}</span>
                <Badge variant={selectedCompany.isFranchise ? 'warning' : 'success'} className="text-xs">
                  {selectedCompany.isFranchise ? 'Franchise' : 'Corporate'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Login Form */}
          <Card className="bg-surface border-gray-700 order-1 lg:order-1">
            <CardHeader>
              <CardTitle className="text-text-primary text-lg text-center">
                Sign In
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-surface border-gray-600 text-text-primary"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-surface border-gray-600 text-text-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Back to Company Selection */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('company')}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                  type="button"
                >
                  ← Back to Company Selection
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Company Users */}
          <Card className="bg-surface border-gray-700 order-2 lg:order-2">
            <CardHeader>
              <CardTitle className="text-text-primary text-lg text-center">
                Company Users
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Location Filter */}
              <div className="mb-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="ALL">📍 All Locations ({locations.length})</option>
                    {locations.map((location: Location) => (
                      <option key={location.id} value={location.id}>
                        📍 {location.name} ({location.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-surface border-gray-600 text-text-primary"
                  />
                </div>
              </div>

              {/* Users List */}
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-text-secondary">Loading users...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.map((user: CompanyUser) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-surface rounded-lg border border-gray-700 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-medium text-text-primary truncate">{user.name}</span>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs flex-shrink-0">
                              {user.role}
                            </Badge>
                            {user.locationType && (
                              <Badge variant={user.locationType === 'CORPORATE' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                                {user.locationType}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary truncate">
                            {user.email}
                          </div>
                          {user.locationName && (
                            <div className="text-xs text-text-secondary truncate">
                              📍 {user.locationName}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserSelect(user);
                        }}
                        className="flex-shrink-0"
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* User Count */}
              <div className="mt-4 text-center">
                <p className="text-xs text-text-secondary">
                  {filteredUsers.length} of {companyUsers.length} users
                  {selectedLocation !== 'ALL' && (
                    <span className="ml-1 text-primary">
                      • {locations.find(l => l.id === selectedLocation)?.name}
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary">
            C&C CRM - Database-Driven Login System v2.6.0
          </p>
        </div>
      </div>
    </div>
  );
} 