'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSmartNavigationStore } from '@/stores/smartNavigationStore';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { InterfaceConfig } from '@/utils/interfaceDetection';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  MapPin, 
  Camera, 
  MessageCircle, 
  Settings, 
  Wifi,
  WifiOff,
  Play,
  CheckCircle,
  Navigation,
  Home,
  LogOut,
  User,
  Clock,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DesktopFieldOpsLayoutProps {
  children: React.ReactNode;
  user: any;
  interfaceConfig: InterfaceConfig;
}

export const DesktopFieldOpsLayout: React.FC<DesktopFieldOpsLayoutProps> = ({ 
  children, 
  user, 
  interfaceConfig 
}) => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { deviceType } = useDeviceDetection();
  const { 
    currentRoute, 
    isOnline, 
    hasActiveJourney, 
    location,
    updateLocation,
    setActiveJourney 
  } = useSmartNavigationStore();

  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Request location permission on mount
  useEffect(() => {
    if (interfaceConfig.features.enableGPS && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsLocationEnabled(true);
        },
        (error) => {
          console.error('Location error:', error);
          setIsLocationEnabled(false);
        }
      );
    }
  }, [interfaceConfig.features.enableGPS, updateLocation]);

  // Navigation items for field workers
  const navigationItems = [
    {
      id: 'current_journey',
      label: 'Current Journey',
      icon: Truck,
      href: '/journey/current',
      badge: hasActiveJourney ? 'Active' : null
    },
    {
      id: 'journey_steps',
      label: 'Journey Steps',
      icon: Navigation,
      href: '/journey/steps'
    },
    {
      id: 'media_upload',
      label: 'Upload Media',
      icon: Camera,
      href: '/media/upload'
    },
    {
      id: 'gps_tracking',
      label: 'GPS Tracking',
      icon: MapPin,
      href: '/gps',
      badge: isLocationEnabled ? 'Active' : null
    },
    {
      id: 'crew_chat',
      label: 'Crew Chat',
      icon: MessageCircle,
      href: '/chat',
      badge: '3'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings'
    }
  ];

  return (
    <div className="desktop-field-ops-layout min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-white font-medium">{user.name}</h2>
              <p className="text-gray-400 text-sm">{user.role}</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            {isLocationEnabled && (
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <MapPin size={12} />
                <span>GPS</span>
              </div>
            )}
          </div>

          {/* Current Time */}
          <div className="text-xs text-gray-400">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${
                  currentRoute === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge === 'Active' ? 'success' : 'warning'} 
                    size="sm"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 text-left text-red-400 hover:text-red-300 hover:bg-red-900 bg-opacity-20 rounded-lg"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Field Operations</h1>
              <p className="text-gray-400 text-sm">Journey-focused interface for {user.role.toLowerCase()}s</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        updateLocation({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                          accuracy: position.coords.accuracy
                        });
                        toast.success('Location updated');
                      },
                      (error) => {
                        toast.error('Failed to get location');
                      }
                    );
                  }
                }}
              >
                <MapPin size={16} className="mr-2" />
                Update Location
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  toast.success('Camera opened');
                  // TODO: Implement camera capture
                }}
              >
                <Camera size={16} className="mr-2" />
                Add Photo
              </Button>

              {!hasActiveJourney ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    setActiveJourney(true);
                    toast.success('Journey started');
                    router.push('/journey/current');
                  }}
                >
                  <Play size={16} className="mr-2" />
                  Start Journey
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    setActiveJourney(false);
                    toast.success('Journey completed');
                    router.push('/journey/steps');
                  }}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Complete Journey
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

        {/* Status Bar */}
        {interfaceConfig.layout.showStatusBar && (
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-6">
                <span>Device: {deviceType}</span>
                <span>Interface: {interfaceConfig.type}</span>
                <span>User: {user.name}</span>
              </div>
              <div className="flex items-center gap-6">
                {location.lat && location.lng && (
                  <span>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                )}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      {interfaceConfig.layout.showQuickActions && (
        <div className="fixed bottom-6 right-6">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
            <h3 className="text-white font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/journey/current')}
                className="w-full"
              >
                <Truck size={16} className="mr-2" />
                Current Journey
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/media/upload')}
                className="w-full"
              >
                <Camera size={16} className="mr-2" />
                Upload Media
              </Button>
                              <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/chat')}
                  className="w-full"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Crew Chat
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 