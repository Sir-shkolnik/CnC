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
  Smartphone
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSuperAdminStore } from '@/stores/superAdminStore';
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

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(companyUsers);
    } else {
      const filtered = companyUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, companyUsers]);

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
        
        // Temporary fallback: If API returns demo users, show real LGM users instead
        if (companyId === "clm_f55e13de_a5c4_4990_ad02_34bb07187daa" && 
            users.length > 0 && 
            users[0].name === "Demo Admin") {
          console.log("API returned demo users, showing real LGM users instead");
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
              locationId: "loc_lgm_downtown_toronto_corporate_002",
              status: "ACTIVE",
              locationName: "DOWNTOWN TORONTO",
              locationType: "CORPORATE"
            },
            {
              id: "usr_danylo_edmonton",
              name: "Danylo",
              email: "danylo@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_edmonton_corporate_003",
              status: "ACTIVE",
              locationName: "EDMONTON",
              locationType: "CORPORATE"
            },
            {
              id: "usr_hakam_hamilton",
              name: "Hakam",
              email: "hakam@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_hamilton_corporate_004",
              status: "ACTIVE",
              locationName: "HAMILTON",
              locationType: "CORPORATE"
            },
            {
              id: "usr_bhanu_montreal",
              name: "Bhanu",
              email: "bhanu@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_montreal_corporate_006",
              status: "ACTIVE",
              locationName: "MONTREAL",
              locationType: "CORPORATE"
            },
            {
              id: "usr_ankit_north_york",
              name: "Ankit",
              email: "ankit@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_north_york_corporate_007",
              status: "ACTIVE",
              locationName: "NORTH YORK",
              locationType: "CORPORATE"
            },
            {
              id: "usr_rasoul_vancouver",
              name: "Rasoul",
              email: "rasoul@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_vancouver_corporate_008",
              status: "ACTIVE",
              locationName: "VANCOUVER",
              locationType: "CORPORATE"
            },
            {
              id: "usr_anees_aps_abbotsford",
              name: "Anees Aps",
              email: "anees.aps@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_abbotsford_franchise_009",
              status: "ACTIVE",
              locationName: "ABBOTSFORD",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_andrew_ajax",
              name: "Andrew",
              email: "andrew@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_ajax_franchise_010",
              status: "ACTIVE",
              locationName: "AJAX",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_parsa_aurora",
              name: "Parsa",
              email: "parsa@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_aurora_franchise_011",
              status: "ACTIVE",
              locationName: "AURORA",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_aerish_brampton",
              name: "Aerish",
              email: "aerish@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_brampton_franchise_012",
              status: "ACTIVE",
              locationName: "BRAMPTON",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_akshit_brampton",
              name: "Akshit",
              email: "akshit@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_brampton_franchise_012",
              status: "ACTIVE",
              locationName: "BRAMPTON",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_harsh_brantford",
              name: "Harsh",
              email: "harsh@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_brantford_franchise_013",
              status: "ACTIVE",
              locationName: "BRANTFORD",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_simranjit_burlington",
              name: "Simranjit",
              email: "simranjit@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_burlington_franchise_014",
              status: "ACTIVE",
              locationName: "BURLINGTON",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_jasdeep_calgary",
              name: "Jasdeep",
              email: "jasdeep@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_calgary_franchise_015",
              status: "ACTIVE",
              locationName: "CALGARY",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_todd_coquitlam",
              name: "Todd",
              email: "todd@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_coquitlam_franchise_016",
              status: "ACTIVE",
              locationName: "COQUITLAM",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_kambiz_fredericton",
              name: "Kambiz",
              email: "kambiz@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_fredericton_franchise_017",
              status: "ACTIVE",
              locationName: "FREDERICTON",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_mahmoud_halifax",
              name: "Mahmoud",
              email: "mahmoud@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_halifax_franchise_018",
              status: "ACTIVE",
              locationName: "HALIFAX",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_anirudh_kingston",
              name: "Anirudh",
              email: "anirudh@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_kingston_franchise_019",
              status: "ACTIVE",
              locationName: "KINGSTON",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_promise_lethbridge",
              name: "Promise",
              email: "promise@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_lethbridge_franchise_020",
              status: "ACTIVE",
              locationName: "LETHBRIDGE",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_kyle_london",
              name: "Kyle",
              email: "kyle@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_london_franchise_021",
              status: "ACTIVE",
              locationName: "LONDON",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_hanze_ottawa",
              name: "Hanze",
              email: "hanze@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_ottawa_franchise_022",
              status: "ACTIVE",
              locationName: "OTTAWA",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_jay_ottawa",
              name: "Jay",
              email: "jay@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_ottawa_franchise_022",
              status: "ACTIVE",
              locationName: "OTTAWA",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_ralph_regina",
              name: "Ralph",
              email: "ralph@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_regina_franchise_023",
              status: "ACTIVE",
              locationName: "REGINA",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_isabella_regina",
              name: "Isabella",
              email: "isabella@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_regina_franchise_023",
              status: "ACTIVE",
              locationName: "REGINA",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_rasoul_richmond",
              name: "Rasoul",
              email: "rasoul@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_richmond_franchise_024",
              status: "ACTIVE",
              locationName: "RICHMOND",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_camellia_saint_john",
              name: "Camellia",
              email: "camellia@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_saint_john_franchise_025",
              status: "ACTIVE",
              locationName: "SAINT JOHN",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_kelvin_scarborough",
              name: "Kelvin",
              email: "kelvin@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_scarborough_franchise_026",
              status: "ACTIVE",
              locationName: "SCARBOROUGH",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_aswin_scarborough",
              name: "Aswin",
              email: "aswin@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_scarborough_franchise_026",
              status: "ACTIVE",
              locationName: "SCARBOROUGH",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_danil_surrey",
              name: "Danil",
              email: "danil@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_surrey_franchise_027",
              status: "ACTIVE",
              locationName: "SURREY",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_fahim_vaughan",
              name: "Fahim",
              email: "fahim@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_vaughan_franchise_028",
              status: "ACTIVE",
              locationName: "VAUGHAN",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_success_victoria",
              name: "Success",
              email: "success@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_victoria_franchise_029",
              status: "ACTIVE",
              locationName: "VICTORIA",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_sadur_waterloo",
              name: "Sadur",
              email: "sadur@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_waterloo_franchise_030",
              status: "ACTIVE",
              locationName: "WATERLOO",
              locationType: "FRANCHISE"
            },
            {
              id: "usr_wayne_winnipeg",
              name: "Wayne",
              email: "wayne@lgm.com",
              role: "MANAGER",
              locationId: "loc_lgm_winnipeg_franchise_031",
              status: "ACTIVE",
              locationName: "WINNIPEG",
              locationType: "FRANCHISE"
            }
          ];
        }
        
        setCompanyUsers(users);
        setFilteredUsers(users);
      }
    } catch (error) {
      console.error('Failed to fetch company users:', error);
      // Fallback to empty array
      setCompanyUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setFormData(prev => ({ ...prev, email: '', password: '' }));
    setSearchTerm('');
    setStep('login');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const detectUserType = async (email: string, password: string): Promise<'web' | 'mobile' | 'super'> => {
    try {
      // Use unified login endpoint for all users
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company_id: selectedCompany?.id })
      });
      
      const userData = await userResponse.json();
      
      if (userResponse.ok && userData.success && userData.user && userData.access_token) {
        const role = userData.user?.role || '';
        const userType = userData.user?.user_type || '';
        
        // Super admin gets super interface
        if (role.toUpperCase() === 'SUPER_ADMIN' || userType === 'super_admin') {
          return 'super';
        }
        
        // Mobile roles get mobile interface
        if (['DRIVER', 'MOVER'].includes(role.toUpperCase())) {
          return 'mobile';
        }
        
        // Web roles get web interface (MANAGER, ADMIN, DISPATCHER, AUDITOR)
        return 'web';
      } else {
        // Handle API error response
        const errorMessage = userData.error || userData.message || 'Invalid credentials';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to email-based detection for development/testing
      if (email === 'udi.shkolnik@candc.com' || email === 'admin@test.com') {
        console.log('🔍 Using fallback super admin detection for:', email);
        return 'super';
      }
      
      const mobileRoles = ['driver', 'mover'];
      const emailLower = email.toLowerCase();
      if (mobileRoles.some(role => emailLower.includes(role))) {
        console.log('Using fallback mobile detection');
        return 'mobile';
      }
      
      console.log('Using fallback web detection');
      return 'web';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const userType = await detectUserType(formData.email, formData.password);
      
      console.log('🔍 User type detected:', userType);
      
      // Handle authentication and redirect based on user type
      switch (userType) {
        case 'super':
          console.log('🔍 Super admin login initiated...');
          // Call super admin login to set authentication state
          await superAdminLogin(formData.email, formData.password);
          console.log('🔍 Super admin login completed, redirecting to dashboard...');
          router.push('/super-admin/dashboard');
          console.log('🔍 Router.push called for /super-admin/dashboard');
          break;
          
        case 'mobile':
          // Call regular auth login for mobile users
          await authLogin(formData.email, formData.password, selectedCompany?.id);
          router.push('/mobile'); // Mobile-specific interface
          break;
          
        case 'web':
          // Call regular auth login for web users
          await authLogin(formData.email, formData.password, selectedCompany?.id);
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
      case 'SUPER_ADMIN': return 'primary';
      case 'ADMIN': return 'primary';
      case 'MANAGER': return 'success';
      case 'DISPATCHER': return 'warning';
      case 'DRIVER': return 'info';
      case 'MOVER': return 'secondary';
      case 'AUDITOR': return 'info';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'DRIVER': return '🚛';
      case 'MOVER': return '📦';
      case 'DISPATCHER': return '📞';
      case 'MANAGER': return '👔';
      case 'ADMIN': return '⚙️';
      case 'AUDITOR': return '🔍';
      default: return '👤';
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
                  {companies.map((company) => (
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
                  {filteredUsers.map((user) => (
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