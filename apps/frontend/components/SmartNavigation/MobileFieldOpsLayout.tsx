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
  Menu,
  X,
  Wifi,
  WifiOff,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Navigation,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileFieldOpsLayoutProps {
  children: React.ReactNode;
  user: any;
  interfaceConfig: InterfaceConfig;
}

export const MobileFieldOpsLayout: React.FC<MobileFieldOpsLayoutProps> = ({ 
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

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

  // Quick actions for field workers
  const quickActions = [
    {
      id: 'add_photo',
      label: 'Add Photo',
      icon: Camera,
      color: 'primary',
      onClick: () => {
        toast.success('Camera opened');
        // TODO: Implement camera capture
      }
    },
    {
      id: 'update_location',
      label: 'Update Location',
      icon: MapPin,
      color: 'secondary',
      onClick: () => {
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
      }
    },
    {
      id: 'start_journey',
      label: 'Start Journey',
      icon: Play,
      color: 'success',
      disabled: hasActiveJourney,
      onClick: () => {
        setActiveJourney(true);
        toast.success('Journey started');
        router.push('/journey/current');
      }
    },
    {
      id: 'complete_journey',
      label: 'Complete',
      icon: CheckCircle,
      color: 'success',
      disabled: !hasActiveJourney,
      onClick: () => {
        setActiveJourney(false);
        toast.success('Journey completed');
        router.push('/journey/steps');
      }
    }
  ];

  return (
    <div className="mobile-field-ops-layout min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-white">Field Operations</h1>
            <p className="text-sm text-gray-400">{user.name}</p>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {/* Online Status */}
            <div className={`p-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
              {isOnline ? <Wifi size={16} className="text-white" /> : <WifiOff size={16} className="text-white" />}
            </div>

            {/* GPS Status */}
            {isLocationEnabled && (
              <div className="p-1 rounded-full bg-blue-500">
                <MapPin size={16} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed left-0 top-0 h-full w-80 bg-gray-800 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-300 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Info */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    router.push('/journey/current');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <Truck size={20} />
                  <span>Current Journey</span>
                  {hasActiveJourney && <Badge variant="success" size="sm">Active</Badge>}
                </button>

                <button
                  onClick={() => {
                    router.push('/journey/steps');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <Navigation size={20} />
                  <span>Journey Steps</span>
                </button>

                <button
                  onClick={() => {
                    router.push('/media/upload');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <Camera size={20} />
                  <span>Upload Media</span>
                </button>

                <button
                  onClick={() => {
                    router.push('/gps');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <MapPin size={20} />
                  <span>GPS Tracking</span>
                  {isLocationEnabled && <Badge variant="info" size="sm">Active</Badge>}
                </button>

                <button
                  onClick={() => {
                    router.push('/chat');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <MessageCircle size={20} />
                  <span>Crew Chat</span>
                  <Badge variant="warning" size="sm">3</Badge>
                </button>

                <button
                  onClick={() => {
                    router.push('/settings');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </button>
              </nav>

              {/* Logout */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left text-red-400 hover:text-red-300 hover:bg-red-900 bg-opacity-20 rounded-lg"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4">
        {children}
      </main>

      {/* Quick Actions Bar */}
      {interfaceConfig.layout.showQuickActions && (
        <div className="fixed bottom-4 left-4 right-4">
          <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
            <div className="flex gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.color as any}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="flex-1"
                >
                  <action.icon size={16} className="mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {interfaceConfig.layout.showStatusBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>Device: {deviceType}</span>
              <span>Interface: {interfaceConfig.type}</span>
            </div>
            <div className="flex items-center gap-4">
              {location.lat && location.lng && (
                <span>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              )}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 