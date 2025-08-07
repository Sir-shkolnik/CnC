'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  Smartphone, 
  Building2, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  Search,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface MobileLoginProps {
  className?: string;
}

interface Company {
  id: string;
  name: string;
  industry?: string;
  isFranchise: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export const MobileLogin: React.FC<MobileLoginProps> = ({ className = '' }) => {
  const router = useRouter();
  const { login: authLogin, isLoading: authLoading } = useAuthStore();
  
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
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    // Check connectivity
    setIsOnline(navigator.onLine);
    
    // Load companies from database
    loadCompanies();
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCompanies = async () => {
    try {
      console.log('Loading companies from:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/companies`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/companies`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCompanies(data.data);
        }
      } else {
        console.error('Failed to load companies:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      // Fallback to demo company if API fails
      setCompanies([
        {
          id: 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa',
          name: 'LGM (Let\'s Get Moving)',
          industry: 'Moving & Logistics',
          isFranchise: false
        }
      ]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const loadUsersForCompany = async (companyId: string) => {
    setIsLoadingUsers(true);
    try {
      console.log('Loading users for company:', companyId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/companies/${companyId}/users`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUsers(data.data);
        }
      } else {
        console.error('Failed to load users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load users for company:', error);
      // Fallback to demo users if API fails
      setUsers([
        { id: 'usr_1ba8fa5a', name: 'ANKIT', email: 'ankit@lgm.com', role: 'MANAGER', status: 'ACTIVE' },
        { id: 'usr_2ba8fa5b', name: 'DAVID', email: 'david@lgm.com', role: 'DRIVER', status: 'ACTIVE' },
        { id: 'usr_3ba8fa5c', name: 'MARIA', email: 'maria@lgm.com', role: 'MOVER', status: 'ACTIVE' }
      ]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    setStep('login');
    await loadUsersForCompany(company.id);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      console.log('Mobile Login - Unified login attempt:', { 
        email: formData.email, 
        companyId: selectedCompany?.id 
      });
      
      // Use unified login - same for all users
      await authLogin(formData.email, formData.password, selectedCompany?.id);
      console.log('Mobile Login - Login successful');
      
      toast.success('Login successful!');
      router.push('/mobile/journey');
    } catch (error) {
      console.error('Mobile Login - Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'error';
    return 'success';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MANAGER': return 'warning';
      case 'DRIVER': return 'info';
      case 'MOVER': return 'success';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑';
      case 'MANAGER': return '👔';
      case 'DRIVER': return '🚛';
      case 'MOVER': return '📦';
      default: return '👤';
    }
  };

  if (step === 'company') {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center p-4 ${className}`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Field Operations
            </h1>
            <p className="text-text-secondary text-sm">
              Select your company to continue
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center mb-6">
            <Badge 
              variant={getStatusColor()} 
              className="text-xs flex items-center gap-1"
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>

          {/* Company Selection */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-text-primary text-lg text-center">
                Available Companies
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {isLoadingCompanies ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-text-secondary mt-2">Loading companies...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-primary">{company.name}</h3>
                          <p className="text-sm text-text-secondary">
                            {company.industry || 'Moving & Logistics'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={company.isFranchise ? 'secondary' : 'success'}>
                          {company.isFranchise ? 'Franchise' : 'Corporate'}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-text-secondary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-text-secondary">
              C&C CRM Mobile Field Operations v1.0.0
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Field Operations
          </h1>
          <p className="text-text-secondary text-sm">
            Sign in to manage your journeys
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center mb-6">
          <Badge 
            variant={getStatusColor()} 
            className="text-xs flex items-center gap-1"
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-text-primary text-lg">
                Sign In
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('company')}
                className="text-text-secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Company Info */}
            {selectedCompany && (
              <div className="p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-medium text-text-primary">{selectedCompany.name}</span>
                  <Badge variant={selectedCompany.isFranchise ? 'secondary' : 'success'} className="text-xs">
                    {selectedCompany.isFranchise ? 'Franchise' : 'Corporate'}
                  </Badge>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
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

              <Button
                type="submit"
                disabled={authLoading || !isOnline}
                className="w-full h-12 text-base font-medium"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sign In →
                  </div>
                )}
              </Button>
            </form>

            {/* Users List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {isLoadingUsers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-text-secondary text-sm mt-2">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, email: user.email }));
                        toast.success(`Selected ${user.name}`);
                      }}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getRoleIcon(user.role)}</span>
                        <div>
                          <p className="font-medium text-text-primary">{user.name}</p>
                          <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary">
            C&C CRM Mobile Field Operations v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}; 