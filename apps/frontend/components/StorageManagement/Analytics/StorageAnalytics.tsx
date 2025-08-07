'use client';

import React, { useEffect, useState } from 'react';
import { 
  useStorageStore, 
  useStorageAnalytics, 
  useOperationalKPIs, 
  useFinancialKPIs,
  useSelectedLocation,
  useStorageCapacity
} from '@/stores/storageStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  Calendar,
  MapPin,
  Building2
} from 'lucide-react';

interface StorageAnalyticsProps {
  locationId?: string;
  className?: string;
}

export const StorageAnalytics: React.FC<StorageAnalyticsProps> = ({ 
  locationId, 
  className = '' 
}) => {
  const selectedLocation = useSelectedLocation();
  const currentLocationId = locationId || selectedLocation;
  
  const analytics = useStorageAnalytics();
  const operationalKPIs = useOperationalKPIs();
  const financialKPIs = useFinancialKPIs();
  const capacity = useStorageCapacity(currentLocationId || '');
  
  const { fetchAnalytics, fetchKPIs, setViewMode } = useStorageStore();
  
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [selectedMetric, setSelectedMetric] = useState<'utilization' | 'revenue' | 'performance'>('utilization');

  useEffect(() => {
    if (currentLocationId) {
      fetchAnalytics(currentLocationId);
      fetchKPIs(currentLocationId);
    }
  }, [currentLocationId, timeRange]);

  // Helper functions for trend indicators
  const getTrendIcon = (value: number, target: number) => {
    if (value >= target) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value >= target * 0.8) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getStatusIcon = (value: number, target: number) => {
    if (value >= target) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (value >= target * 0.8) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (value: number, target: number) => {
    if (value >= target) return 'text-green-600';
    if (value >= target * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!currentLocationId) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Location Selected
            </h3>
            <p className="text-gray-500">
              Please select a storage location to view analytics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Storage Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Performance metrics and insights for your storage operations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setViewMode('GRID')}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
              <div className="flex gap-1">
                {(['7D', '30D', '90D', '1Y'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Location: {currentLocationId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Utilization Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.utilizationRate || capacity.utilizationRate || 0}%
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {getTrendIcon(analytics?.utilizationRate || 0, 85)}
              <span className={`text-sm font-medium ${getStatusColor(analytics?.utilizationRate || 0, 85)}`}>
                Target: 85%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics?.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {getTrendIcon(analytics?.totalRevenue || 0, 10000)}
              <span className="text-sm text-gray-600">
                ${analytics?.revenuePerUnit || 0}/unit
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Units */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalUnits || capacity.total || 0}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {capacity.available || 0} available
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Occupancy */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.averageOccupancy || 0}%
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {getTrendIcon(analytics?.averageOccupancy || 0, 85)}
              <span className={`text-sm font-medium ${getStatusColor(analytics?.averageOccupancy || 0, 85)}`}>
                Target: 85%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Operational Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {operationalKPIs && (
              <>
                {/* Utilization */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Overall Utilization</p>
                      <p className="text-sm text-gray-600">Storage space efficiency</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {operationalKPIs.utilization.overallUtilization}%
                    </p>
                    {getStatusIcon(operationalKPIs.utilization.overallUtilization, 85)}
                  </div>
                </div>

                {/* Customer Service */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Response Time</p>
                      <p className="text-sm text-gray-600">Average customer response</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {operationalKPIs.customerService.responseTime}h
                    </p>
                    {getStatusIcon(operationalKPIs.customerService.responseTime, 2, true)}
                  </div>
                </div>

                {/* Maintenance */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">Preventive Maintenance</p>
                      <p className="text-sm text-gray-600">Scheduled maintenance completion</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {operationalKPIs.maintenance.preventiveMaintenance}%
                    </p>
                    {getStatusIcon(operationalKPIs.maintenance.preventiveMaintenance, 95)}
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Security Score</p>
                      <p className="text-sm text-gray-600">Compliance and security rating</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {operationalKPIs.security.complianceScore}%
                    </p>
                    {getStatusIcon(operationalKPIs.security.complianceScore, 100)}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Financial KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {financialKPIs && (
              <>
                {/* Revenue Growth */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Revenue Growth</p>
                      <p className="text-sm text-gray-600">Year-over-year growth</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      +{financialKPIs.revenue.revenueGrowth}%
                    </p>
                    {getTrendIcon(financialKPIs.revenue.revenueGrowth, 10)}
                  </div>
                </div>

                {/* Gross Margin */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Gross Margin</p>
                      <p className="text-sm text-gray-600">Profitability ratio</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {financialKPIs.profitability.grossMargin}%
                    </p>
                    {getStatusIcon(financialKPIs.profitability.grossMargin, 60)}
                  </div>
                </div>

                {/* Payment On Time */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Payment On Time</p>
                      <p className="text-sm text-gray-600">Customer payment compliance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {financialKPIs.billing.paymentOnTime}%
                    </p>
                    {getStatusIcon(financialKPIs.billing.paymentOnTime, 95)}
                  </div>
                </div>

                {/* ROI */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Return on Investment</p>
                      <p className="text-sm text-gray-600">Investment performance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {financialKPIs.profitability.returnOnInvestment}%
                    </p>
                    {getStatusIcon(financialKPIs.profitability.returnOnInvestment, 15)}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capacity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Capacity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{capacity.available}</div>
              <div className="text-sm text-green-700">Available</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{capacity.occupied}</div>
              <div className="text-sm text-red-700">Occupied</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{capacity.reserved}</div>
              <div className="text-sm text-yellow-700">Reserved</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{capacity.maintenance}</div>
              <div className="text-sm text-gray-700">Maintenance</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Utilization Rate</span>
              <span>{capacity.utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(capacity.utilizationRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => setViewMode('GRID')}
            >
              <Building2 className="w-6 h-6" />
              <span>View Storage Map</span>
            </Button>
            
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                // TODO: Open booking modal
                console.log('Open booking modal');
              }}
            >
              <Calendar className="w-6 h-6" />
              <span>Create Booking</span>
            </Button>
            
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                // TODO: Open report generator
                console.log('Open report generator');
              }}
            >
              <BarChart3 className="w-6 h-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 