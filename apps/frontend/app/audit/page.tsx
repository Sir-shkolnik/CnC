'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Shield, FileText, CheckCircle, AlertTriangle, Download, Filter } from 'lucide-react';

export default function AuditPage() {
  const mockAuditLogs = [
    {
      id: '1',
      action: 'CREATE',
      entity: 'TruckJourney',
      entityId: 'journey_001',
      userId: 'user_001',
      userName: 'Mike Chen',
      userRole: 'DISPATCHER',
      location: 'Toronto',
      timestamp: '2024-01-15T10:30:00Z',
      details: 'Created new journey TRK-2024-001',
      status: 'SUCCESS'
    },
    {
      id: '2',
      action: 'UPDATE',
      entity: 'TruckJourney',
      entityId: 'journey_001',
      userId: 'user_002',
      userName: 'David Rodriguez',
      userRole: 'DRIVER',
      location: 'Toronto',
      timestamp: '2024-01-15T11:15:00Z',
      details: 'Updated journey status to EN_ROUTE',
      status: 'SUCCESS'
    },
    {
      id: '3',
      action: 'UPLOAD',
      entity: 'Media',
      entityId: 'media_001',
      userId: 'user_003',
      userName: 'Lisa Thompson',
      userRole: 'MOVER',
      location: 'Mississauga',
      timestamp: '2024-01-15T12:00:00Z',
      details: 'Uploaded 3 photos for journey TRK-2024-001',
      status: 'SUCCESS'
    },
    {
      id: '4',
      action: 'DELETE',
      entity: 'TruckJourney',
      entityId: 'journey_002',
      userId: 'user_001',
      userName: 'Mike Chen',
      userRole: 'DISPATCHER',
      location: 'Toronto',
      timestamp: '2024-01-15T09:45:00Z',
      details: 'Deleted cancelled journey TRK-2024-002',
      status: 'SUCCESS'
    }
  ];

  const getActionBadge = (action: string) => {
    const variants = {
      CREATE: 'success',
      UPDATE: 'warning',
      DELETE: 'destructive',
      UPLOAD: 'info',
      VIEW: 'default'
    } as const;
    
    return <Badge variant={variants[action as keyof typeof variants] || 'default'}>
      {action}
    </Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'SUCCESS' ? 
      <Badge variant="success">Success</Badge> : 
      <Badge variant="destructive">Failed</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Audit & Compliance</h1>
          <p className="text-text-secondary mt-2">View audit logs and compliance information</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Logs
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Actions</p>
                <p className="text-2xl font-bold text-text-primary">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Successful</p>
                <p className="text-2xl font-bold text-text-primary">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Failed</p>
                <p className="text-2xl font-bold text-text-primary">13</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Today</p>
                <p className="text-2xl font-bold text-text-primary">47</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Entity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Details</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-surface/50">
                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-text-primary">{log.userName}</p>
                        <p className="text-sm text-text-secondary">{log.userRole}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-text-secondary max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {log.location}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-primary">Data Retention</span>
                <Badge variant="success">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-primary">Access Controls</span>
                <Badge variant="success">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-primary">Audit Trail</span>
                <Badge variant="success">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-primary">Data Encryption</span>
                <Badge variant="success">Compliant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <p className="text-sm font-medium text-warning">Multiple failed login attempts</p>
                <p className="text-xs text-text-secondary">User: john.doe@lgm.com - 2 hours ago</p>
              </div>
              <div className="p-3 bg-error/10 rounded-lg">
                <p className="text-sm font-medium text-error">Unauthorized access attempt</p>
                <p className="text-xs text-text-secondary">IP: 192.168.1.100 - 4 hours ago</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <p className="text-sm font-medium text-info">New user registration</p>
                <p className="text-xs text-text-secondary">User: jane.smith@lgm.com - 6 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 