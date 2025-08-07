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
  UserX,
  Settings,
  Lock,
  Unlock,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Clock,
  Activity
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useSuperAdminLoading } from '@/stores/superAdminStore';
import { useSuperAdminError } from '@/stores/superAdminStore';
import { UserRole, UserStatus, Permission } from '@/types/enums';
import toast from 'react-hot-toast';

// Enhanced User Interface with RBAC
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  companyId: string;
  companyName: string;
  locationId: string;
  locationName: string;
  permissions: Permission[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  sessionCount: number;
  journeyCount: number;
  auditScore: number;
  locationAccess: {
    locationId: string;
    locationName: string;
    accessType: 'MANAGE' | 'VIEW' | 'NONE';
  }[];
}

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'user.create', 'user.edit', 'user.delete', 'user.view',
    'journey.create', 'journey.edit', 'journey.delete', 'journey.view',
    'client.create', 'client.edit', 'client.delete', 'client.view',
    'crew.assign', 'crew.view', 'audit.view', 'audit.create',
    'feedback.view', 'feedback.create', 'settings.edit', 'settings.view',
    'storage.create', 'storage.edit', 'storage.delete', 'storage.view',
    'booking.create', 'booking.edit', 'booking.delete', 'booking.view'
  ],
  MANAGER: [
    'user.view', 'journey.create', 'journey.edit', 'journey.view',
    'client.create', 'client.edit', 'client.view', 'crew.assign', 'crew.view',
    'audit.view', 'feedback.view', 'feedback.create', 'settings.view',
    'storage.view', 'booking.view'
  ],
  DISPATCHER: [
    'journey.create', 'journey.edit', 'journey.view', 'client.view',
    'crew.assign', 'crew.view', 'feedback.view', 'storage.view'
  ],
  DRIVER: [
    'journey.view', 'client.view', 'feedback.create', 'storage.view'
  ],
  MOVER: [
    'journey.view', 'client.view', 'feedback.create'
  ],
  AUDITOR: [
    'journey.view', 'audit.view', 'audit.create', 'feedback.view'
  ]
};

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'john.doe',
    email: 'john.doe@lgm.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN',
    status: 'ACTIVE',
    companyId: 'company-1',
    companyName: 'LGM Corporate',
    locationId: 'loc-1',
    locationName: 'LGM Burnaby Corporate',
    permissions: ROLE_PERMISSIONS.ADMIN,
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    isOnline: true,
    sessionCount: 15,
    journeyCount: 45,
    auditScore: 95,
    locationAccess: [
      { locationId: 'loc-1', locationName: 'LGM Burnaby Corporate', accessType: 'MANAGE' },
      { locationId: 'loc-2', locationName: 'LGM Vancouver', accessType: 'VIEW' }
    ]
  },
  {
    id: 'user-2',
    username: 'jane.smith',
    email: 'jane.smith@lgm.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'MANAGER',
    status: 'ACTIVE',
    companyId: 'company-1',
    companyName: 'LGM Corporate',
    locationId: 'loc-2',
    locationName: 'LGM Vancouver',
    permissions: ROLE_PERMISSIONS.MANAGER,
    lastLogin: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z',
    isOnline: false,
    sessionCount: 8,
    journeyCount: 23,
    auditScore: 88,
    locationAccess: [
      { locationId: 'loc-2', locationName: 'LGM Vancouver', accessType: 'MANAGE' }
    ]
  },
  {
    id: 'user-3',
    username: 'mike.wilson',
    email: 'mike.wilson@lgm.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'DRIVER',
    status: 'ACTIVE',
    companyId: 'company-1',
    companyName: 'LGM Corporate',
    locationId: 'loc-1',
    locationName: 'LGM Burnaby Corporate',
    permissions: ROLE_PERMISSIONS.DRIVER,
    lastLogin: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-20T13:15:00Z',
    isOnline: true,
    sessionCount: 12,
    journeyCount: 67,
    auditScore: 92,
    locationAccess: [
      { locationId: 'loc-1', locationName: 'LGM Burnaby Corporate', accessType: 'VIEW' }
    ]
  }
];

export default function UsersPage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const isLoading = useSuperAdminLoading();
  const error = useSuperAdminError();

  // State management
  // Real user data from database
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'status' | 'lastLogin' | 'auditScore'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Determine user's role and permissions
  const isSuperAdmin = superAdmin?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = superAdmin?.role === 'COMPANY_ADMIN';
  const canCreateUsers = isSuperAdmin || isCompanyAdmin;
  const canEditUsers = isSuperAdmin || isCompanyAdmin;
  const canDeleteUsers = isSuperAdmin;
  const canManageRoles = isSuperAdmin || isCompanyAdmin;
  const canViewAllCompanies = isSuperAdmin;

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }

    // Load users based on permissions
    loadUsers();
  }, [superAdmin, router]);

  useEffect(() => {
    // Apply filters and search
    applyFilters();
  }, [users, searchTerm, filterRole, filterStatus, filterLocation, sortBy, sortOrder]);

  const loadUsers = async () => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/users', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // const data = await response.json();
    // setUsers(data.users);
    
    // For now, use mock data
    setUsers(mockUsers);
  };

  const applyFilters = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'ALL' || user.role === filterRole;
      const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;
      const matchesLocation = filterLocation === 'ALL' || user.locationId === filterLocation;
      
      return matchesSearch && matchesRole && matchesStatus && matchesLocation;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastLogin':
          aValue = a.lastLogin || '';
          bValue = b.lastLogin || '';
          break;
        case 'auditScore':
          aValue = a.auditScore;
          bValue = b.auditScore;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    router.push('/users/create');
  };

  const handleViewUser = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // TODO: Implement delete functionality
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      // TODO: Implement bulk actions
      toast.success(`${action} completed for ${selectedUsers.length} users`);
      setSelectedUsers([]);
    } catch (error) {
      toast.error(`Failed to ${action} users`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // TODO: Implement role change
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, permissions: ROLE_PERMISSIONS[newRole] }
          : user
      ));
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      // TODO: Implement status change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Failed to update user status');
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

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'primary';
      case 'MANAGER': return 'success';
      case 'DISPATCHER': return 'warning';
      case 'DRIVER': return 'info';
      case 'MOVER': return 'secondary';
      case 'AUDITOR': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'INACTIVE':
        return <XCircle className="w-4 h-4 text-error" />;
      case 'SUSPENDED':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getAuditScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
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
                onClick={() => router.push('/dashboard')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
              {isSuperAdmin && (
                <Badge variant="primary">Super Admin</Badge>
              )}
            </div>
            <p className="text-text-secondary text-sm">
              {isSuperAdmin 
                ? 'Manage users across all companies in the C&C CRM system'
                : 'Manage users within your company'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            >
              {viewMode === 'grid' ? 'Table View' : 'Grid View'}
            </Button>
            
            {canCreateUsers && (
              <Button onClick={handleCreateUser} size="sm" className="h-9">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

              {/* Role Filter */}
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as UserRole | 'ALL')}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Roles</option>
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
                  onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'ALL')}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="ALL">All Locations</option>
                  <option value="loc-1">LGM Burnaby Corporate</option>
                  <option value="loc-2">LGM Vancouver</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="role-asc">Role (A-Z)</option>
                  <option value="role-desc">Role (Z-A)</option>
                  <option value="lastLogin-desc">Last Login (Recent)</option>
                  <option value="lastLogin-asc">Last Login (Oldest)</option>
                  <option value="auditScore-desc">Audit Score (High)</option>
                  <option value="auditScore-asc">Audit Score (Low)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-text-primary">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                  {canDeleteUsers && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={loadUsers}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Users Grid/Table */}
        {viewMode === 'grid' ? (
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
                        {user.isOnline && (
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-600"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEditUsers && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeleteUsers && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="h-8 w-8 p-0 text-error hover:text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
                    {canViewAllCompanies && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Building2 className="w-4 h-4 text-text-secondary" />
                        <span className="text-text-secondary">{user.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-secondary">{user.locationName}</span>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-lg font-bold text-text-primary">
                        {user.sessionCount}
                      </div>
                      <div className="text-xs text-text-secondary">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-text-primary">
                        {user.journeyCount}
                      </div>
                      <div className="text-xs text-text-secondary">Journeys</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getAuditScoreColor(user.auditScore)}`}>
                        {user.auditScore}%
                      </div>
                      <div className="text-xs text-text-secondary">Audit Score</div>
                    </div>
                  </div>

                  {/* Permissions Summary */}
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-text-secondary">Permissions</span>
                      <span className="text-text-primary">{user.permissions.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {permission.split('.')[1]}
                        </Badge>
                      ))}
                      {user.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.permissions.length - 3} more
                        </Badge>
                      )}
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
        ) : (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map(user => user.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="rounded border-gray-600"
                        />
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">User</th>
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">Role</th>
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">Location</th>
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">Last Login</th>
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">Audit Score</th>
                      <th className="text-left p-3 text-sm font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700 hover:bg-surface/50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="rounded border-gray-600"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-text-secondary">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.status)}
                            <span className="text-sm">{user.status}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-text-secondary">
                          {user.locationName}
                        </td>
                        <td className="p-3 text-sm text-text-secondary">
                          {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                        </td>
                        <td className="p-3">
                          <span className={`font-medium ${getAuditScoreColor(user.auditScore)}`}>
                            {user.auditScore}%
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canEditUsers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {canDeleteUsers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="h-8 w-8 p-0 text-error hover:text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No users found</h3>
                <p className="text-text-secondary mb-4">
                  {searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL' || filterLocation !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first user'
                  }
                </p>
                {!searchTerm && filterRole === 'ALL' && filterStatus === 'ALL' && filterLocation === 'ALL' && canCreateUsers && (
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