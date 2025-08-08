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
  
  // Location filtering
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

  // Extract unique locations from users
  useEffect(() => {
    if (companyUsers.length > 0) {
      const uniqueLocations = Array.from(
        new Map(
          companyUsers
            .filter(user => user.locationName && user.locationId)
            .map(user => [
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
      setSelectedLocation('ALL');
    }
  }, [companyUsers]);

  // Filter users based on search term and selected location
  useEffect(() => {
    let filtered = companyUsers;
    
    // Filter by location first
    if (selectedLocation !== 'ALL') {
      filtered = filtered.filter(user => user.locationId === selectedLocation);
    }
    
    // Then filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user =>
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
        let users = data.data || [];
        
        // Simplified fallback: Show a few key LGM users
        if (companyId === "clm_f55e13de_a5c4_4990_ad02_34bb07187daa") {
          console.log("Loading LGM users");
          users = [
            {
              id: "usr_shahbaz_burnaby",
              name: "Shahbaz",
              email: "shahbaz@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_burnaby_corporate_001",
              status: "ACTIVE",
              locationName: "BURNABY",
              locationType: "CORPORATE"
            },
            {
              id: "usr_arshdeep_downtown_toronto",
              name: "Arshdeep",
              email: "arshdeep@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_downtown_toronto_corporate_001",
              status: "ACTIVE",
              locationName: "DOWNTOWN TORONTO",
              locationType: "CORPORATE"
            },
            {
              id: "usr_danylo_edmonton",
              name: "Danylo",
              email: "danylo@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_edmonton_corporate_001",
              status: "ACTIVE",
              locationName: "EDMONTON",
              locationType: "CORPORATE"
            },
            {
              id: "usr_kyle_london",
              name: "Kyle",
              email: "kyle@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_london_franchise_001",
              status: "ACTIVE",
              locationName: "LONDON",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_hanze_ottawa",
              name: "Hanze",
              email: "hanze@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_ottawa_franchise_001",
              status: "ACTIVE",
              locationName: "OTTAWA",
              locationType: "FRANCHISE"
            }
          ];
        }
        
        setCompanyUsers(users);
      }
    } catch (error) {
      console.error('Failed to fetch company users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setStep('login');
    setFormData({ email: '', password: '' });
    setSearchTerm('');
    setSelectedLocation('ALL');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const detectUserType = async (email: string, password: string): Promise<{ type: 'web' | 'mobile' | 'super', userData: any }> => {
    try {
      const userResponse = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company_id: selectedCompany?.id })
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        if (userData.success && userData.user && userData.access_token) {
          localStorage.setItem('access_token', userData.access_token);
          localStorage.setItem('user_data', JSON.stringify(userData.user));
          
          const role = userData.user?.role || '';
          const userType = userData.user?.user_type || '';
          
          if (role.toUpperCase() === 'SUPER_ADMIN' || userType === 'super_admin') {
            return { type: 'super', userData };
          }
          
          if (['DRIVER', 'MOVER'].includes(role.toUpperCase())) {
            return { type: 'mobile', userData };
          }
          
          return { type: 'web', userData };
        }
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Error detecting user type:', error);
      throw new Error('Login failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { type, userData } = await detectUserType(formData.email, formData.password);
      
      if (type === 'super') {
        await superAdminLogin(formData.email, formData.password);
        router.push('/super-admin/dashboard');
      } else if (type === 'mobile') {
        await authLogin(formData.email, formData.password);
        router.push('/mobile');
      } else {
        await authLogin(formData.email, formData.password);
        router.push('/dashboard');
      }
      
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'destructive';
      case 'ADMIN':
        return 'default';
      case 'MANAGER':
        return 'secondary';
      case 'DISPATCHER':
        return 'outline';
      case 'DRIVER':
        return 'default';
      case 'MOVER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return <Building2 className="w-4 h-4" />;
      case 'ADMIN':
        return <Building2 className="w-4 h-4" />;
      case 'MANAGER':
        return <User className="w-4 h-4" />;
      case 'DISPATCHER':
        return <Truck className="w-4 h-4" />;
      case 'DRIVER':
        return <Truck className="w-4 h-4" />;
      case 'MOVER':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const handleUserSelect = (user: CompanyUser) => {
    setFormData({
      email: user.email,
      password: '1234' // Default password for all users
    });
  };

  if (step === 'company') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">C&C CRM</h1>
            <p className="text-blue-200">Trust the Journey</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
              <p className="text-blue-200">Select your company to continue</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCompanies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-blue-200">Loading companies...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company) => (
                    <Button
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className="w-full justify-between bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      variant="outline"
                    >
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">{company.name}</div>
                          <div className="text-sm text-blue-200">{company.industry}</div>
                        </div>
                      </div>
                      {company.isFranchise && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                          Franchise
                        </Badge>
                      )}
                    </Button>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">C&C CRM</h1>
          <p className="text-blue-200">Trust the Journey</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <p className="text-blue-200">Sign in to your account</p>
            
            {/* Company Selection */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                {selectedCompany?.name}
                <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
                  {selectedCompany?.isFranchise ? 'Franchise' : 'Corporate'}
                </Badge>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Sign In Form */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sign In</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
              
              <Button
                variant="ghost"
                onClick={() => setStep('company')}
                className="w-full mt-4 text-blue-200 hover:text-white hover:bg-white/10"
              >
                ← Back to Company Selection
              </Button>
            </div>

            {/* Company Users */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company Users</h3>
              
              {/* Location Filter */}
              <div className="mb-4">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="ALL">All Locations ({locations.length})</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-200" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 pl-10"
                />
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="ml-2 text-blue-200">Loading users...</span>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-blue-200">{user.email}</div>
                          {user.locationName && (
                            <div className="text-xs text-blue-300 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {user.locationName} {user.locationType}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUserSelect(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Use
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-blue-200">
                    {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                  </div>
                )}
              </div>

              {/* Location Filter Info */}
              {selectedLocation !== 'ALL' && (
                <div className="mt-2 text-xs text-blue-300 flex items-center">
                  <Filter className="w-3 h-3 mr-1" />
                  Filtered by: {locations.find(l => l.id === selectedLocation)?.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 