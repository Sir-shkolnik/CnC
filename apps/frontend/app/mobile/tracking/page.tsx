'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { MapPin, Truck, Clock, Users } from 'lucide-react';

export default function MobileTrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Live Tracking</h1>
          <p className="text-text-secondary">Real-time journey tracking and location monitoring</p>
        </div>
        <Button>
          <MapPin className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2 text-blue-500" />
              Active Journeys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-text-primary">T-001</p>
                    <p className="text-sm text-text-secondary">Vancouver → Burnaby</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">En Route</p>
                  <p className="text-xs text-text-secondary">ETA: 2:30 PM</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-text-primary">T-002</p>
                    <p className="text-sm text-text-secondary">Downtown → North York</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">On Site</p>
                  <p className="text-xs text-text-secondary">Loading</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Crew Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    MJ
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Mike Johnson</p>
                    <p className="text-sm text-text-secondary">Driver - T-001</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-500">Online</p>
                  <p className="text-xs text-text-secondary">Last seen: 2 min ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    SL
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Sarah Lee</p>
                    <p className="text-sm text-text-secondary">Mover - T-002</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-500">Online</p>
                  <p className="text-xs text-text-secondary">Last seen: 5 min ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Map View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-text-secondary">Map view coming soon</p>
              <p className="text-sm text-text-secondary">Real-time GPS tracking will be available here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
