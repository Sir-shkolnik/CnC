'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Users, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Settings,
  FileText,
  Calendar
} from 'lucide-react';

interface ManagerJourneyInterfaceProps {
  journeyId: string;
  journey: any;
}

export const ManagerJourneyInterface: React.FC<ManagerJourneyInterfaceProps> = ({ 
  journeyId, 
  journey 
}) => {
  const [activeView, setActiveView] = useState('overview');

  const overviewMetrics = [
    {
      title: 'Journey Status',
      value: 'In Progress',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Team Performance',
      value: '95%',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      icon: CheckCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Estimated Revenue',
      value: '$2,450',
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const teamMembers = [
    {
      name: 'Mike Chen',
      role: 'DRIVER',
      status: 'Active',
      performance: '98%',
      location: 'En Route to Pickup'
    },
    {
      name: 'Sarah Johnson',
      role: 'MOVER',
      status: 'Active',
      performance: '95%',
      location: 'En Route to Pickup'
    },
    {
      name: 'David Wilson',
      role: 'MOVER',
      status: 'Active',
      performance: '92%',
      location: 'En Route to Pickup'
    }
  ];

  const recentAlerts = [
    {
      type: 'info',
      message: 'Driver confirmed departure from depot',
      time: '2 minutes ago',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      type: 'warning',
      message: 'Minor delay due to traffic - ETA updated',
      time: '8 minutes ago',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      type: 'info',
      message: 'Vehicle inspection completed successfully',
      time: '15 minutes ago',
      icon: CheckCircle,
      color: 'text-green-500'
    }
  ];

  const managerActions = [
    {
      label: 'Review Performance',
      icon: BarChart3,
      action: 'performance',
      description: 'View team metrics and KPIs'
    },
    {
      label: 'Communicate',
      icon: MessageSquare,
      action: 'communicate',
      description: 'Send messages to team'
    },
    {
      label: 'Escalate Issue',
      icon: AlertTriangle,
      action: 'escalate',
      description: 'Report to higher management'
    },
    {
      label: 'Generate Report',
      icon: FileText,
      action: 'report',
      description: 'Create journey report'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Manager Dashboard Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Journey Management</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  January 9, 2025
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  3 Team Members
                </div>
                <Badge variant="warning">Monitoring</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="secondary" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Team Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role} • {member.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={member.status === 'Active' ? 'success' : 'secondary'}>
                      {member.status}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">{member.performance}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center space-x-2 mt-4">
                <Button variant="secondary" size="sm" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Team
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Conference Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <alert.icon className={`w-5 h-5 mt-0.5 ${alert.color}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4">
              <Eye className="w-4 h-4 mr-2" />
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Manager Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Management Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {managerActions.map((action, index) => (
              <Button
                key={index}
                variant="secondary"
                className="flex flex-col items-center justify-center h-24 p-4"
              >
                <action.icon className="w-6 h-6 mb-2" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">98%</div>
              <div className="text-sm text-gray-600">On-Time Performance</div>
              <div className="text-xs text-gray-500 mt-1">+2% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">4.8</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
              <div className="text-xs text-gray-500 mt-1">+0.3 from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">$2.4k</div>
              <div className="text-sm text-gray-600">Revenue per Journey</div>
              <div className="text-xs text-gray-500 mt-1">+15% from last month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};