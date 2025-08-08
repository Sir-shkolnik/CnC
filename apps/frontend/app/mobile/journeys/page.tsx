'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Truck, Plus, Clock, MapPin, Users } from 'lucide-react';

export default function MobileJourneysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mobile Journeys</h1>
          <p className="text-text-secondary">Field operations and journey management</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Journey
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2 text-blue-500" />
              Active Journeys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">3</div>
            <p className="text-text-secondary text-sm">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">2</div>
            <p className="text-text-secondary text-sm">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Available Crew
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">8</div>
            <p className="text-text-secondary text-sm">Ready for assignment</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Journeys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">T-001 - Vancouver Move</h3>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Vancouver → Burnaby
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      8:00 AM - 4:00 PM
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="info">En Route</Badge>
                <p className="text-sm text-text-secondary mt-1">ETA: 2:30 PM</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">T-002 - Office Relocation</h3>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Downtown → North York
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      7:30 AM - 3:30 PM
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="warning">On Site</Badge>
                <p className="text-sm text-text-secondary mt-1">Loading</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">T-003 - Warehouse Transfer</h3>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Richmond → Surrey
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      9:00 AM - 5:00 PM
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">Scheduled</Badge>
                <p className="text-sm text-text-secondary mt-1">Starts in 1 hour</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
