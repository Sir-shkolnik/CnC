'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useSuperAdminLoading } from '@/stores/superAdminStore';
import { useSuperAdminError } from '@/stores/superAdminStore';
import toast from 'react-hot-toast';

// TODO: Replace with API data
interface MockUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  companyName: string;
  locationId: string;
  locationName: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

const mockUsers: MockUser[] = [];

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const isLoading = useSuperAdminLoading();
  const error = useSuperAdminError();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }
  }, [superAdmin, router]);

  // Filter users based on search and filters
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = filterCompany === 'ALL' || user.companyId === filterCompany;
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;
    
    return matchesSearch && matchesCompany && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    router.push('/super-admin/users/create');
  };

  const handleViewUser = (userId: string) => {
    router.push(`/super-admin/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/super-admin/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // TODO: Implement delete functionality
      toast.success('User deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
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
              <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
            </div>
            <p className="text-text-secondary text-sm">
              Manage users across all companies in the C&C CRM system
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button onClick={handleCreateUser} size="sm" className="h-9">
              <Plus className="w-4 h-4 mr-2" />
              Create User
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
                    placeholder="Search users..."
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

              {/* Role Filter */}
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="DRIVER">Driver</option>
                  <option value="MOVER">Mover</option>
                  <option value="AUDITOR">Auditor</option>
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
            Showing {filteredUsers.length} of {mockUsers.length} users
          </p>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewUser(user.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="h-8 w-8 p-0 text-error hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* User Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{user.username}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{user.companyName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{user.locationName}</span>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">
                      {user.permissions.length}
                    </div>
                    <div className="text-xs text-text-secondary">Permissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-primary">
                      {user.lastLogin ? 'Online' : 'Offline'}
                    </div>
                    <div className="text-xs text-text-secondary">Status</div>
                  </div>
                </div>

                {/* Last Login */}
                {user.lastLogin && (
                  <div className="flex items-center space-x-2 text-xs text-text-secondary pt-2 border-t border-gray-700">
                    <Calendar className="w-3 h-3" />
                    <span>Last login {formatDateTime(user.lastLogin)}</span>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center space-x-2 text-xs text-text-secondary pt-2 border-t border-gray-700">
                  <Calendar className="w-3 h-3" />
                  <span>Created {formatDate(user.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No users found</h3>
                <p className="text-text-secondary mb-4">
                  {searchTerm || filterCompany !== 'ALL' || filterRole !== 'ALL' || filterStatus !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first user'
                  }
                </p>
                {!searchTerm && filterCompany === 'ALL' && filterRole === 'ALL' && filterStatus === 'ALL' && (
                  <Button onClick={handleCreateUser}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
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