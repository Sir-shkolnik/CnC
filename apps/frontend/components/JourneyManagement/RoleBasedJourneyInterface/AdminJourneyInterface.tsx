'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Settings, 
  Users, 
  Database, 
  Shield,
  Edit,
  Trash2,
  Plus,
  Eye,
  Download,
  Upload,
  Bell,
  Lock,
  Key,
  Activity,
  FileText,
  BarChart3
} from 'lucide-react';

interface AdminJourneyInterfaceProps {
  journeyId: string;
  journey: any;
}

export const AdminJourneyInterface: React.FC<AdminJourneyInterfaceProps> = ({ 
  journeyId, 
  journey 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'audit', label: 'Audit Trail', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const systemStats = [
    {
      title: 'Active Users',
      value: '34',
      change: '+2',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: '+0.1%',
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Data Storage',
      value: '2.4GB',
      change: '+150MB',
      icon: Database,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Security Score',
      value: 'A+',
      change: 'Excellent',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  const adminActions = [
    {
      category: 'Journey Management',
      actions: [
        { label: 'Edit Journey', icon: Edit, action: 'edit_journey', color: 'text-blue-500' },
        { label: 'Delete Journey', icon: Trash2, action: 'delete_journey', color: 'text-red-500' },
        { label: 'Clone Journey', icon: Plus, action: 'clone_journey', color: 'text-green-500' },
        { label: 'Export Data', icon: Download, action: 'export_data', color: 'text-purple-500' }
      ]
    },
    {
      category: 'User Management',
      actions: [
        { label: 'Manage Users', icon: Users, action: 'manage_users', color: 'text-blue-500' },
        { label: 'Set Permissions', icon: Lock, action: 'permissions', color: 'text-orange-500' },
        { label: 'Reset Password', icon: Key, action: 'reset_password', color: 'text-red-500' },
        { label: 'Activity Log', icon: Activity, action: 'activity_log', color: 'text-green-500' }
      ]
    },
    {
      category: 'System Operations',
      actions: [
        { label: 'Backup Data', icon: Upload, action: 'backup', color: 'text-indigo-500' },
        { label: 'System Settings', icon: Settings, action: 'settings', color: 'text-gray-500' },
        { label: 'Send Notifications', icon: Bell, action: 'notifications', color: 'text-yellow-500' },
        { label: 'Generate Reports', icon: FileText, action: 'reports', color: 'text-purple-500' }
      ]
    }
  ];

  const recentActions = [
    {
      user: 'John Smith (MANAGER)',
      action: 'Updated journey crew assignment',
      time: '5 minutes ago',
      type: 'modification'
    },
    {
      user: 'System',
      action: 'Automated backup completed',
      time: '1 hour ago',
      type: 'system'
    },
    {
      user: 'Sarah Johnson (DISPATCHER)',
      action: 'Created new journey #J2025-001',
      time: '2 hours ago',
      type: 'creation'
    },
    {
      user: 'Mike Chen (DRIVER)',
      action: 'Uploaded journey completion photos',
      time: '3 hours ago',
      type: 'upload'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Admin Actions Grid */}
            {adminActions.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {category.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant="secondary"
                        className="flex flex-col items-center justify-center h-24 p-4"
                      >
                        <action.icon className={`w-6 h-6 mb-2 ${action.color}`} />
                        <span className="text-sm text-center">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'audit':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      action.type === 'system' ? 'bg-blue-100' :
                      action.type === 'modification' ? 'bg-orange-100' :
                      action.type === 'creation' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {action.type === 'system' && <Settings className="w-4 h-4 text-blue-600" />}
                      {action.type === 'modification' && <Edit className="w-4 h-4 text-orange-600" />}
                      {action.type === 'creation' && <Plus className="w-4 h-4 text-green-600" />}
                      {action.type === 'upload' && <Upload className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{action.action}</div>
                      <div className="text-sm text-gray-600">{action.user}</div>
                      <div className="text-xs text-gray-500 mt-1">{action.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full mt-4">
                <Eye className="w-4 h-4 mr-2" />
                View Complete Audit Log
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {adminTabs.find(tab => tab.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600">This section is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div>Journey #{journeyId}</div>
                  <Badge variant="error">Admin Access</Badge>
                  <Badge variant="outline">Full Control</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="danger" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {adminTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </CardContent>
      </Card>

      {/* Quick Admin Actions */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <Bell className="w-5 h-5 mr-2" />
            Quick Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="secondary" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <Database className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Backup System</div>
                <div className="text-xs text-gray-500">Create full backup</div>
              </div>
            </Button>
            <Button variant="secondary" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-sm font-medium">System Report</div>
                <div className="text-xs text-gray-500">Generate analytics</div>
              </div>
            </Button>
            <Button variant="secondary" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <Bell className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Send Alert</div>
                <div className="text-xs text-gray-500">Notify all users</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};