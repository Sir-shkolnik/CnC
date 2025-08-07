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

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login: authLogin, isLoading: authLoading } = useAuthStore();
  const { login: superAdminLogin, isLoading: superAdminLoading } = useSuperAdminStore();
  
  const [step, setStep] = useState<'company' | 'login'>('company');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const loadCompanyUsers = async (companyId: string) => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/companies/${companyId}/users`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    await loadCompanyUsers(company.id);
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
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const role = userData.data?.user?.role || '';
        const userType = userData.data?.user?.user_type || '';
        
        // Super admin gets super interface
        if (role.toUpperCase() === 'SUPER_ADMIN' || userType === 'super_admin') {
          return 'super';
        }
        
        // Mobile roles get mobile interface
        if (['DRIVER', 'MOVER'].includes(role.toUpperCase())) {
          return 'mobile';
        }
        
        // Web roles get web interface
        return 'web';
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      // Fallback to email-based detection for development
      if (email === 'udi.shkolnik@candc.com') return 'super';
      
      const mobileRoles = ['driver', 'mover'];
      const emailLower = email.toLowerCase();
      if (mobileRoles.some(role => emailLower.includes(role))) return 'mobile';
      
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
      
      switch (userType) {
        case 'super':
          await superAdminLogin(formData.email, formData.password);
          router.push('/super-admin/dashboard');
          break;
          
        case 'mobile':
          await authLogin(formData.email, formData.password, selectedCompany?.id);
          router.push('/mobile'); // Mobile-specific interface
          break;
          
        case 'web':
          await authLogin(formData.email, formData.password, selectedCompany?.id);
          router.push('/dashboard'); // Web interface
          break;
      }
      
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      className="p-4 text-left bg-surface/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-text-primary">{company.name}</h3>
                          <p className="text-sm text-text-secondary">{company.industry}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={company.isFranchise ? 'warning' : 'success'} className="text-xs">
                              {company.isFranchise ? 'Franchise' : 'Corporate'}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-text-secondary" />
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
          
          {/* Mobile Access Button */}
          <div className="mt-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => router.push('/mobile')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Field Operations Mobile App
            </Button>
          </div>
          
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Form */}
          <Card className="bg-surface border-gray-700">
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
                >
                  ← Back to Company Selection
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Company Users */}
          <Card className="bg-surface border-gray-700">
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
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-text-secondary">Loading users...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 bg-surface/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getRoleIcon(user.role)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-text-primary truncate">
                              {user.name}
                            </h4>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, email: user.email }));
                            toast.success(`Filled ${user.name}'s email`);
                          }}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* User Count */}
              <div className="mt-4 text-center">
                <p className="text-xs text-text-secondary">
                  {filteredUsers.length} of {users.length} users
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