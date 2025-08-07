'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Shield, User, Calendar, Clock, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin, useSuperAdminSession, useCurrentCompany } from '@/stores/superAdminStore';

export default function SuperAdminProfilePage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const session = useSuperAdminSession();
  const currentCompany = useCurrentCompany();
  const { logout } = useSuperAdminStore();

  useEffect(() => {
    if (!superAdmin || !session) {
      router.push('/auth/login');
    }
  }, [superAdmin, session, router]);

  const handleLogout = () => {
    logout();
    router.push('/super-admin/auth/logout');
  };

  const handleBackToDashboard = () => {
    router.push('/super-admin/dashboard');
  };

  if (!superAdmin || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleBackToDashboard}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-background" />
                </div>
                <div>
                  <CardTitle className="text-text-primary">Super Admin Profile</CardTitle>
                  <p className="text-text-secondary">Account Information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Username</p>
                  <p className="text-text-primary font-medium">{superAdmin.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Email</p>
                  <p className="text-text-primary font-medium">{superAdmin.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Role</p>
                  <Badge variant="primary">{superAdmin.role}</Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Member Since</p>
                  <p className="text-text-primary font-medium">
                    {formatDate(superAdmin.createdAt)}
                  </p>
                </div>
              </div>
              
              {superAdmin.lastLogin && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Last Login</p>
                    <p className="text-text-primary font-medium">
                      {formatDate(superAdmin.lastLogin)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Information */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-background" />
                </div>
                <div>
                  <CardTitle className="text-text-primary">Session Details</CardTitle>
                  <p className="text-text-secondary">Current Session</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Session Created</p>
                  <p className="text-text-primary font-medium">
                    {formatDate(session.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Last Activity</p>
                  <p className="text-text-primary font-medium">
                    {formatDate(session.lastActivity)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Expires At</p>
                  <p className="text-text-primary font-medium">
                    {formatDate(session.expiresAt)}
                  </p>
                </div>
              </div>
              
              {currentCompany && (
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Current Company</p>
                    <p className="text-text-primary font-medium">{currentCompany.name}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-text-secondary mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(session.permissionsScope).map(([permission, hasAccess]) => (
                    hasAccess && (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission.replace(/_/g, ' ')}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 