'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useJourneyStore } from '@/stores/journeyStore';
import { 
  DispatcherJourneyInterface,
  DriverJourneyInterface,
  MoverJourneyInterface,
  ManagerJourneyInterface,
  AdminJourneyInterface,
  AuditorJourneyInterface
} from '@/components/JourneyManagement/RoleBasedJourneyInterface';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  ArrowLeft,
  Shield,
  AlertTriangle,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export default function SmartJourneyPage() {
  const router = useRouter();
  const params = useParams();
  const journeyId = params.id as string;
  const { user } = useAuthStore();
  const { journeys } = useJourneyStore();
  const [loading, setLoading] = useState(true);

  // Find the journey by ID
  const journey = journeys.find(j => j.id === journeyId);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading journey...</p>
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Journey not found</h3>
            <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
              The journey you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push('/journeys')} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journeys
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Authentication Required</h3>
            <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
              Please log in to view this journey.
            </p>
            <Button onClick={() => router.push('/auth/login')} size="sm">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role-based interface rendering
  const renderRoleBasedInterface = () => {
    const userRole = user.role?.toUpperCase();

    switch (userRole) {
      case 'DISPATCHER':
        return <DispatcherJourneyInterface journeyId={journeyId} journey={journey} />;
      
      case 'DRIVER':
        return <DriverJourneyInterface journeyId={journeyId} journey={journey} />;
      
      case 'MOVER':
        return <MoverJourneyInterface journeyId={journeyId} journey={journey} />;
      
      case 'MANAGER':
        return <ManagerJourneyInterface journeyId={journeyId} journey={journey} />;
      
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return <AdminJourneyInterface journeyId={journeyId} journey={journey} />;
      
      case 'AUDITOR':
        return <AuditorJourneyInterface journeyId={journeyId} journey={journey} />;
      
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">Role Not Supported</h3>
              <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
                Your role ({userRole}) doesn't have a specific journey interface yet.
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge variant="secondary">{userRole}</Badge>
                <Badge variant="secondary">{user.company_name}</Badge>
              </div>
              <Button onClick={() => router.push('/dashboard')} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  // Header with role context
  const renderRoleHeader = () => {
    const userRole = user.role?.toUpperCase();
    const roleColors = {
      'DISPATCHER': 'bg-blue-500',
      'DRIVER': 'bg-green-500',
      'MOVER': 'bg-orange-500',
      'MANAGER': 'bg-purple-500',
      'ADMIN': 'bg-red-500',
      'SUPER_ADMIN': 'bg-gray-800',
      'AUDITOR': 'bg-indigo-500'
    };

    const roleColor = roleColors[userRole as keyof typeof roleColors] || 'bg-gray-500';

    return (
      <div className="mb-6">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${roleColor} flex items-center justify-center`}>
                  {userRole === 'DISPATCHER' && <Users className="w-5 h-5 text-white" />}
                  {userRole === 'DRIVER' && <Truck className="w-5 h-5 text-white" />}
                  {userRole === 'MOVER' && <Users className="w-5 h-5 text-white" />}
                  {(userRole === 'MANAGER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && <Settings className="w-5 h-5 text-white" />}
                  {userRole === 'AUDITOR' && <Shield className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {user.name} • {userRole}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {user.company_name} • {user.location_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{userRole} View</Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/journeys')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {renderRoleHeader()}
        {renderRoleBasedInterface()}
      </div>
    </div>
  );
}