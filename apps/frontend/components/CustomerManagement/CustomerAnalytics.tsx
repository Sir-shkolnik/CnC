'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface CustomerAnalyticsProps {
  analytics: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
    totalRevenue: number;
    conversionRate: number;
    averageDealSize: number;
    leadStatusBreakdown: {
      NEW: number;
      CONTACTED: number;
      QUALIFIED: number;
      PROPOSAL_SENT: number;
      NEGOTIATION: number;
      WON: number;
      LOST: number;
      ARCHIVED: number;
    };
  };
}

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ analytics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WON': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'NEGOTIATION': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'LOST': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'QUALIFIED': return <Target className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'success';
      case 'NEGOTIATION': return 'warning';
      case 'LOST': return 'error';
      case 'QUALIFIED': return 'primary';
      case 'PROPOSAL_SENT': return 'info';
      case 'CONTACTED': return 'secondary';
      case 'NEW': return 'secondary';
      case 'ARCHIVED': return 'secondary';
      default: return 'secondary';
    }
  };

  const leadStatusItems = Object.entries(analytics.leadStatusBreakdown).map(([status, count]) => ({
    status,
    count,
    icon: getStatusIcon(status),
    color: getStatusColor(status)
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Customers */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Customers</p>
              <p className="text-2xl font-bold text-text-primary">{analytics.totalCustomers}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Customers */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Customers</p>
              <p className="text-2xl font-bold text-text-primary">{analytics.activeCustomers}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New This Month */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">New This Month</p>
              <p className="text-2xl font-bold text-text-primary">{analytics.newCustomersThisMonth}</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Revenue</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CustomerAnalyticsDetailed: React.FC<CustomerAnalyticsProps> = ({ analytics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WON': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'NEGOTIATION': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'LOST': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'QUALIFIED': return <Target className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'success';
      case 'NEGOTIATION': return 'warning';
      case 'LOST': return 'error';
      case 'QUALIFIED': return 'primary';
      case 'PROPOSAL_SENT': return 'info';
      case 'CONTACTED': return 'secondary';
      case 'NEW': return 'secondary';
      case 'ARCHIVED': return 'secondary';
      default: return 'secondary';
    }
  };

  const leadStatusItems = Object.entries(analytics.leadStatusBreakdown).map(([status, count]) => ({
    status,
    count,
    icon: getStatusIcon(status),
    color: getStatusColor(status)
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Customers</p>
                <p className="text-2xl font-bold text-text-primary">{analytics.totalCustomers}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Customers</p>
                <p className="text-2xl font-bold text-text-primary">{analytics.activeCustomers}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Conversion Rate</p>
                <p className="text-2xl font-bold text-text-primary">{formatPercentage(analytics.conversionRate)}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Deal Size */}
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Avg Deal Size</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(analytics.averageDealSize)}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Status Breakdown */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-text-primary text-lg">Lead Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {leadStatusItems.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {item.status.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
                <Badge variant={item.color as any} className="text-xs">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 