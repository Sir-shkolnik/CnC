'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Shield,
  Settings,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  Activity,
  Key,
  Globe,
  Home,
  Truck,
  FileText,
  BarChart3,
  Download,
  Upload,
  Star,
  Clock,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
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

// Permission categories for better organization
const PERMISSION_CATEGORIES = {
  'User Management': ['user.create', 'user.edit', 'user.delete', 'user.view'],
  'Journey Management': ['journey.create', 'journey.edit', 'journey.delete', 'journey.view'],
  'Client Management': ['client.create', 'client.edit', 'client.delete', 'client.view'],
  'Crew Management': ['crew.assign', 'crew.view'],
  'Audit & Compliance': ['audit.view', 'audit.create'],
  'Feedback System': ['feedback.view', 'feedback.create'],
  'Settings & Configuration': ['settings.edit', 'settings.view'],
  'Storage Management': ['storage.create', 'storage.edit', 'storage.delete', 'storage.view'],
  'Booking Management': ['booking.create', 'booking.edit', 'booking.delete', 'booking.view']
};

// Mock locations for demonstration
const mockLocations = [
  { id: 'loc-1', name: 'LGM Burnaby Corporate', companyId: 'company-1' },
  { id: 'loc-2', name: 'LGM Vancouver', companyId: 'company-1' },
  { id: 'loc-3', name: 'LGM Calgary', companyId: 'company-2' },
  { id: 'loc-4', name: 'LGM Edmonton', companyId: 'company-2' }
];

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const superAdmin = useSuperAdmin();

  // State management
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'locations' | 'activity'>('profile');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'DRIVER' as UserRole,
    status: 'ACTIVE' as UserStatus,
    locationId: '',
    permissions: [] as Permission[],
    locationAccess: [] as { locationId: string; locationName: string; accessType: 'MANAGE' | 'VIEW' | 'NONE' }[]
  });

  // Determine user's permissions
  const isSuperAdmin = superAdmin?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = superAdmin?.role === 'COMPANY_ADMIN';
  const canEditUsers = isSuperAdmin || isCompanyAdmin;
  const canManageRoles = isSuperAdmin || isCompanyAdmin;
  const canDeleteUsers = isSuperAdmin;
  const canViewAllCompanies = isSuperAdmin;

  useEffect(() => {
    // Check if user is authenticated
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }

    // Load user data
    loadUser();
  }, [superAdmin, router, userId]);

  const loadUser = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/${userId}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setUser(data.user);
      
      // Mock user data
      const mockUser: User = {
        id: userId,
        username: 'john.doe',
        email: 'john.doe@lgm.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'DRIVER',
        status: 'ACTIVE',
        companyId: 'company-1',
        companyName: 'LGM Corporate',
        locationId: 'loc-1',
        locationName: 'LGM Burnaby Corporate',
        permissions: ROLE_PERMISSIONS.DRIVER,
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        isOnline: true,
        sessionCount: 15,
        journeyCount: 45,
        auditScore: 95,
        locationAccess: [
          { locationId: 'loc-1', locationName: 'LGM Burnaby Corporate', accessType: 'VIEW' }
        ]
      };

      setUser(mockUser);
      setFormData({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        status: mockUser.status,
        locationId: mockUser.locationId,
        permissions: mockUser.permissions,
        locationAccess: mockUser.locationAccess
      });
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Load user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canEditUsers) {
      toast.error('You do not have permission to edit users');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/${userId}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      
      // Update local state
      if (user) {
        setUser({
          ...user,
          ...formData,
          permissions: formData.permissions,
          locationAccess: formData.locationAccess
        });
      }
      
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Update user error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormData({
      ...formData,
      role: newRole,
      permissions: ROLE_PERMISSIONS[newRole]
    });
  };

  const handlePermissionToggle = (permission: Permission) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({
      ...formData,
      permissions: newPermissions
    });
  };

  const handleLocationAccessChange = (locationId: string, accessType: 'MANAGE' | 'VIEW' | 'NONE') => {
    const location = mockLocations.find(loc => loc.id === locationId);
    if (!location) return;

    const newLocationAccess = formData.locationAccess.filter(la => la.locationId !== locationId);
    
    if (accessType !== 'NONE') {
      newLocationAccess.push({
        locationId,
        locationName: location.name,
        accessType
      });
    }

    setFormData({
      ...formData,
      locationAccess: newLocationAccess
    });
  };

  const handleDeleteUser = async () => {
    if (!canDeleteUsers) {
      toast.error('You do not have permission to delete users');
      return;
    }

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // TODO: Implement delete functionality
        toast.success('User deleted successfully');
        router.push('/users');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-surface rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">User Not Found</h1>
            <p className="text-text-secondary mb-4">The user you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/users')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/users')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-text-primary">Edit User</h1>
              {isSuperAdmin && (
                <Badge variant="primary">Super Admin</Badge>
              )}
            </div>
            <p className="text-text-secondary text-sm">
              Manage user profile, permissions, and access settings
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {canDeleteUsers && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleDeleteUser}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            )}
            
            {canEditUsers && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm" 
                className="h-9"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {/* User Overview Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              User Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-surface rounded-lg">
                <div className="text-lg font-bold text-text-primary mb-1">
                  {user.sessionCount}
                </div>
                <div className="text-xs text-text-secondary">Sessions</div>
              </div>
              
              <div className="text-center p-3 bg-surface rounded-lg">
                <div className="text-lg font-bold text-text-primary mb-1">
                  {user.journeyCount}
                </div>
                <div className="text-xs text-text-secondary">Journeys</div>
              </div>
              
              <div className="text-center p-3 bg-surface rounded-lg">
                <div className="text-lg font-bold text-text-primary mb-1">
                  {user.auditScore}%
                </div>
                <div className="text-xs text-text-secondary">Audit Score</div>
              </div>
              
              <div className="text-center p-3 bg-surface rounded-lg">
                <div className="text-lg font-bold text-text-primary mb-1">
                  {user.isOnline ? 'Online' : 'Offline'}
                </div>
                <div className="text-xs text-text-secondary">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-surface rounded-lg p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'locations'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    First Name
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!canEditUsers}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Last Name
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!canEditUsers}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!canEditUsers}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Username
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!canEditUsers}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    disabled={!canManageRoles}
                    className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="DRIVER">Driver</option>
                    <option value="MOVER">Mover</option>
                    <option value="AUDITOR">Auditor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    disabled={!canEditUsers}
                    className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Primary Location
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  disabled={!canEditUsers}
                  className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-text-primary text-sm"
                >
                  {mockLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'permissions' && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Permissions Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                  <div key={category} className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-text-primary mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map(permission => (
                        <label key={permission} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission as any)}
                            onChange={() => handlePermissionToggle(permission as any)}
                            disabled={!canManageRoles}
                            className="rounded border-gray-600"
                          />
                          <span className="text-sm text-text-primary">
                            {permission.split('.')[1].charAt(0).toUpperCase() + permission.split('.')[1].slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'locations' && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Location Access Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLocations.map(location => {
                  const currentAccess = formData.locationAccess.find(la => la.locationId === location.id);
                  const accessType = currentAccess?.accessType || 'NONE';
                  
                  return (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                      <div>
                        <h4 className="font-medium text-text-primary">{location.name}</h4>
                        <p className="text-sm text-text-secondary">Location ID: {location.id}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={accessType}
                          onChange={(e) => handleLocationAccessChange(location.id, e.target.value as 'MANAGE' | 'VIEW' | 'NONE')}
                          disabled={!canEditUsers}
                          className="p-2 bg-surface border border-gray-600 rounded text-text-primary text-sm"
                        >
                          <option value="NONE">No Access</option>
                          <option value="VIEW">View Only</option>
                          <option value="MANAGE">Manage</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-surface rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">Created</span>
                    </div>
                    <p className="text-sm text-text-secondary">{formatDate(user.createdAt)}</p>
                  </div>
                  
                  <div className="p-3 bg-surface rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">Last Updated</span>
                    </div>
                    <p className="text-sm text-text-secondary">{formatDate(user.updatedAt)}</p>
                  </div>
                  
                  <div className="p-3 bg-surface rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">Last Login</span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-surface rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">Audit Score</span>
                    </div>
                    <p className="text-sm text-text-secondary">{user.auditScore}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 