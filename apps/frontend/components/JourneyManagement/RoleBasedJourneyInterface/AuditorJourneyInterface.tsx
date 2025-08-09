'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Download,
  Search,
  Calendar,
  Clock,
  User,
  MapPin,
  Camera,
  Activity,
  BarChart3,
  Filter
} from 'lucide-react';

interface AuditorJourneyInterfaceProps {
  journeyId: string;
  journey: any;
}

export const AuditorJourneyInterface: React.FC<AuditorJourneyInterfaceProps> = ({ 
  journeyId, 
  journey 
}) => {
  const [activeView, setActiveView] = useState('timeline');

  const auditViews = [
    { id: 'timeline', label: 'Audit Timeline', icon: Clock },
    { id: 'compliance', label: 'Compliance Check', icon: Shield },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'performance', label: 'Performance', icon: BarChart3 }
  ];

  const complianceChecks = [
    {
      category: 'Safety Compliance',
      status: 'passed',
      checks: [
        { item: 'Vehicle inspection completed', status: 'passed', time: '08:00 AM' },
        { item: 'Safety equipment verified', status: 'passed', time: '08:05 AM' },
        { item: 'Driver certification valid', status: 'passed', time: '08:00 AM' },
        { item: 'Insurance documentation', status: 'passed', time: '08:00 AM' }
      ]
    },
    {
      category: 'Documentation Compliance',
      status: 'warning',
      checks: [
        { item: 'Customer contract signed', status: 'passed', time: '07:30 AM' },
        { item: 'Inventory list completed', status: 'warning', time: 'Pending' },
        { item: 'Photos documented', status: 'passed', time: '09:15 AM' },
        { item: 'Delivery confirmation', status: 'pending', time: 'Not started' }
      ]
    },
    {
      category: 'Process Compliance',
      status: 'passed',
      checks: [
        { item: 'Crew assignment proper', status: 'passed', time: '07:00 AM' },
        { item: 'Route optimization', status: 'passed', time: '08:30 AM' },
        { item: 'Communication protocol', status: 'passed', time: 'Ongoing' },
        { item: 'Time tracking active', status: 'passed', time: '08:00 AM' }
      ]
    }
  ];

  const auditTimeline = [
    {
      time: '07:00 AM',
      event: 'Journey Created',
      user: 'Alex Thompson (DISPATCHER)',
      type: 'creation',
      compliance: 'passed',
      details: 'Journey #J2025-001 created with proper documentation'
    },
    {
      time: '07:15 AM',
      event: 'Crew Assigned',
      user: 'Alex Thompson (DISPATCHER)',
      type: 'assignment',
      compliance: 'passed',
      details: 'Driver and 2 movers assigned according to policy'
    },
    {
      time: '08:00 AM',
      event: 'Vehicle Inspection',
      user: 'Mike Chen (DRIVER)',
      type: 'safety',
      compliance: 'passed',
      details: 'Complete vehicle safety inspection with photos'
    },
    {
      time: '08:30 AM',
      event: 'Departure Confirmed',
      user: 'Mike Chen (DRIVER)',
      type: 'status',
      compliance: 'passed',
      details: 'GPS tracking activated, ETA communicated'
    },
    {
      time: '09:15 AM',
      event: 'Documentation Upload',
      user: 'Sarah Johnson (MOVER)',
      type: 'documentation',
      compliance: 'warning',
      details: 'Partial inventory documentation - missing 3 items'
    }
  ];

  const performanceMetrics = [
    {
      metric: 'Compliance Score',
      value: '92%',
      status: 'good',
      benchmark: '90%',
      trend: '+2%'
    },
    {
      metric: 'Documentation Completeness',
      value: '88%',
      status: 'warning',
      benchmark: '95%',
      trend: '-3%'
    },
    {
      metric: 'Safety Protocol Adherence',
      value: '100%',
      status: 'excellent',
      benchmark: '98%',
      trend: '+0%'
    },
    {
      metric: 'Process Efficiency',
      value: '94%',
      status: 'good',
      benchmark: '85%',
      trend: '+5%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'excellent':
        return 'text-green-500 bg-green-50';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50';
      case 'failed':
        return 'text-red-500 bg-red-50';
      case 'pending':
        return 'text-gray-500 bg-gray-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const renderViewContent = () => {
    switch (activeView) {
      case 'timeline':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Audit Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTimeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border-l-4 border-l-blue-200 bg-blue-50 rounded-r-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.compliance === 'passed' ? 'bg-green-100' :
                        event.compliance === 'warning' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        {event.type === 'creation' && <FileText className="w-4 h-4 text-blue-500" />}
                        {event.type === 'assignment' && <User className="w-4 h-4 text-purple-500" />}
                        {event.type === 'safety' && <Shield className="w-4 h-4 text-green-500" />}
                        {event.type === 'status' && <MapPin className="w-4 h-4 text-blue-500" />}
                        {event.type === 'documentation' && <Camera className="w-4 h-4 text-orange-500" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{event.event}</div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={event.compliance === 'passed' ? 'success' : 'warning'}>
                            {event.compliance}
                          </Badge>
                          <span className="text-sm text-gray-500">{event.time}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{event.user}</div>
                      <div className="text-sm text-gray-700 mt-2">{event.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            {complianceChecks.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      {category.category}
                    </CardTitle>
                    <Badge variant={
                      category.status === 'passed' ? 'success' :
                      category.status === 'warning' ? 'warning' :
                      'error'
                    }>
                      {category.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.checks.map((check, checkIndex) => (
                      <div key={checkIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {check.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                          {check.status === 'pending' && <Clock className="w-5 h-5 text-gray-500" />}
                          <span className="text-sm font-medium">{check.item}</span>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            check.status === 'passed' ? 'success' :
                            check.status === 'warning' ? 'warning' :
                            'secondary'
                          }>
                            {check.status}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">{check.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                      <div className="text-sm text-gray-600 mb-2">{metric.metric}</div>
                      <div className="flex items-center justify-center space-x-2 text-xs">
                        <span className="text-gray-500">vs {metric.benchmark}</span>
                        <Badge variant={
                          metric.status === 'excellent' ? 'success' :
                          metric.status === 'good' ? 'success' :
                          'warning'
                        }>
                          {metric.trend}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation Review</h3>
              <p className="text-gray-600">Complete documentation audit coming soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Auditor Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Journey Audit</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div>Journey #{journeyId}</div>
                  <Badge variant="secondary">Read-Only Access</Badge>
                  <Badge variant="secondary">Compliance Review</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {auditViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeView === view.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span>{view.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {renderViewContent()}
          </div>
        </CardContent>
      </Card>

      {/* Audit Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Activity className="w-5 h-5 mr-2" />
            Audit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <div className="text-sm text-green-700">Overall Compliance</div>
              <div className="text-xs text-green-600 mt-1">Above benchmark</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
              <div className="text-sm text-blue-700">Checks Completed</div>
              <div className="text-xs text-blue-600 mt-1">3 pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-sm text-purple-700">Critical Issues</div>
              <div className="text-xs text-purple-600 mt-1">2 warnings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};