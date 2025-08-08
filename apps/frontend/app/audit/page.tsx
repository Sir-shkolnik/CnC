'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Shield, FileText, CheckCircle, AlertTriangle, Download, Filter } from 'lucide-react';

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || 
                   document.cookie.split('auth-token=')[1]?.split(';')[0];
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/super-admin/audit-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAuditLogs(data.data.logs || []);
        } else {
          setAuditLogs([]);
        }
      } else {
        setError(`Failed to fetch audit logs: ${response.status}`);
        setAuditLogs([]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to fetch audit logs');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const variants = {
      CREATE: 'success',
      UPDATE: 'warning',
      DELETE: 'error',
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
      <Badge variant="error">Failed</Badge>;
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
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter Logs
          </Button>
          <Button variant="secondary">
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-text-secondary mt-2">Loading audit logs...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <AlertTriangle className="w-6 h-6 text-error mx-auto mb-2" />
                      <p className="text-error text-sm">{error}</p>
                      <Button onClick={fetchAuditLogs} className="mt-2" variant="secondary" size="sm">
                        Retry
                      </Button>
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-text-secondary">
                      No audit logs available
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, index) => (
                    <tr key={index} className="border-b border-border hover:bg-surface/50">
                      <td className="py-3 px-4">
                        {getActionBadge(log.action || 'VIEW')}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{log.userName || log.user || 'Unknown'}</p>
                          <p className="text-sm text-text-secondary">{log.userRole || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {log.entity || 'System'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary max-w-xs truncate">
                        {log.details || 'No details'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {log.location || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {formatTimestamp(log.timestamp || new Date().toISOString())}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(log.status || 'SUCCESS')}
                      </td>
                    </tr>
                  ))
                )}
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