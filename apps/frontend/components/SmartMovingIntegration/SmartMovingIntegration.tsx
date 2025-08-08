'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  RefreshCw, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Settings,
  Upload,
  Download,
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SmartMovingHealth {
  success: boolean;
  api_status: string;
  api_key: string;
  client_id: string;
  timestamp: string;
  error?: string;
}

interface SyncResult {
  customer_id: string;
  status: 'success' | 'error' | 'skipped';
  smartmoving_lead_id?: string;
  message: string;
}

interface BulkSyncResult {
  success: boolean;
  total_customers: number;
  success_count: number;
  error_count: number;
  results: SyncResult[];
}

export const SmartMovingIntegration: React.FC = () => {
  const [health, setHealth] = useState<SmartMovingHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<BulkSyncResult | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Check SmartMoving API health
  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/smartmoving/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      setHealth(data);
      
      if (data.success) {
        toast.success('SmartMoving API is healthy');
      } else {
        toast.error('SmartMoving API is not responding');
      }
    } catch (error) {
      console.error('Error checking SmartMoving health:', error);
      toast.error('Failed to check SmartMoving API health');
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk sync customers to SmartMoving
  const bulkSyncCustomers = async () => {
    if (!confirm('This will sync all customers to SmartMoving. Continue?')) {
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/smartmoving/sync/bulk/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data: BulkSyncResult = await response.json();
      setSyncResults(data);
      
      if (data.success) {
        toast.success(`Synced ${data.success_count} customers to SmartMoving`);
      } else {
        toast.error('Bulk sync failed');
      }
    } catch (error) {
      console.error('Error during bulk sync:', error);
      toast.error('Failed to sync customers to SmartMoving');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync individual customer
  const syncCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/smartmoving/sync/customer/${customerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sync_type: 'lead',
          force_sync: false
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Customer synced to SmartMoving (Lead ID: ${data.lead_id})`);
      } else {
        toast.error(`Sync failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error syncing customer:', error);
      toast.error('Failed to sync customer to SmartMoving');
    }
  };

  // Create test lead in SmartMoving
  const createTestLead = async () => {
    try {
      const testLead = {
        FullName: "Test Customer",
        FirstName: "Test",
        LastName: "Customer",
        Email: "test@example.com",
        Phone: "+1-416-555-0123",
        MoveDate: "2025-08-20T09:00:00Z",
        MoveSize: "2 Bedroom Apartment",
        ServiceType: "Full Service Move",
        ReferralSource: "C&C CRM Integration Test",
        Notes: "This is a test lead created from C&C CRM integration",
        OriginAddress: {
          Street1: "123 Test Street",
          City: "Toronto",
          State: "ON",
          PostalCode: "M5J2N1",
          Country: "Canada"
        },
        CustomFields: [
          { FieldName: "Test Field", FieldValue: "Test Value" }
        ]
      };

      const response = await fetch(`${API_BASE_URL}/smartmoving/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testLead)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Test lead created in SmartMoving (ID: ${data.lead_id})`);
      } else {
        toast.error(`Failed to create test lead: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating test lead:', error);
      toast.error('Failed to create test lead in SmartMoving');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'unhealthy': return 'error';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'unhealthy': 
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">SmartMoving Integration</h1>
          <p className="text-text-secondary text-sm">
            Sync customers and leads between C&C CRM and SmartMoving
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={checkHealth}
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Check Health
          </Button>
          <Button
            onClick={() => window.open('https://smartmoving.com', '_blank')}
            variant="secondary"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            SmartMoving
          </Button>
        </div>
      </div>

      {/* API Health Status */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            API Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getHealthStatusIcon(health.api_status)}
                  <span className="font-medium">API Status</span>
                </div>
                <Badge variant={getHealthStatusColor(health.api_status)}>
                  {health.api_status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">API Key</p>
                  <p className="font-mono text-text-primary">{health.api_key}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Client ID</p>
                  <p className="font-mono text-text-primary">{health.client_id}</p>
                </div>
              </div>
              
              {health.error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-error text-sm">{health.error}</p>
                </div>
              )}
              
              <div className="text-xs text-text-secondary">
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">Click "Check Health" to verify API connection</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Test Lead Creation */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-warning" />
              Test Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm mb-4">
              Create a test lead in SmartMoving to verify the integration
            </p>
            <Button
              onClick={createTestLead}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Create Test Lead
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Sync */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-primary" />
              Bulk Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm mb-4">
              Sync all customers from C&C CRM to SmartMoving
            </p>
            <Button
              onClick={bulkSyncCustomers}
              variant="primary"
              size="sm"
              className="w-full"
              disabled={isSyncing}
            >
              <Download className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All Customers'}
            </Button>
          </CardContent>
        </Card>

        {/* Individual Sync */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Settings className="w-4 h-4 mr-2 text-secondary" />
              Individual Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm mb-4">
              Sync a specific customer by ID
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Customer ID"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={() => selectedCustomer && syncCustomer(selectedCustomer)}
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={!selectedCustomer}
              >
                <Upload className="w-4 h-4 mr-2" />
                Sync Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Results */}
      {syncResults && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-2xl font-bold text-text-primary">{syncResults.total_customers}</p>
                  <p className="text-xs text-text-secondary">Total</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">{syncResults.success_count}</p>
                  <p className="text-xs text-text-secondary">Success</p>
                </div>
                <div className="p-3 bg-error/10 rounded-lg">
                  <p className="text-2xl font-bold text-error">{syncResults.error_count}</p>
                  <p className="text-xs text-text-secondary">Errors</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-text-secondary">Customer ID</th>
                      <th className="text-left py-2 text-text-secondary">Status</th>
                      <th className="text-left py-2 text-text-secondary">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncResults.results.map((result, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-2 font-mono text-xs">{result.customer_id}</td>
                        <td className="py-2">
                          <Badge 
                            variant={result.status === 'success' ? 'success' : result.status === 'error' ? 'error' : 'secondary'}
                            size="sm"
                          >
                            {result.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-text-secondary text-xs">
                          {result.message}
                          {result.smartmoving_lead_id && (
                            <span className="block font-mono text-primary">
                              Lead ID: {result.smartmoving_lead_id}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Info */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="w-5 h-5 mr-2 text-primary" />
            Integration Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-text-primary mb-2">Features</h4>
              <ul className="space-y-1 text-text-secondary">
                <li>• Create leads in SmartMoving from C&C CRM customers</li>
                <li>• Bulk sync all customers to SmartMoving</li>
                <li>• Real-time webhook processing for SmartMoving events</li>
                <li>• API health monitoring and validation</li>
                <li>• Custom field mapping and data transformation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">Webhook URL</h4>
              <p className="font-mono text-xs text-text-secondary bg-surface p-2 rounded">
                {API_BASE_URL}/smartmoving/webhook/receive
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Configure this URL in your SmartMoving webhook settings
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">Supported Events</h4>
              <ul className="space-y-1 text-text-secondary">
                <li>• lead_created - Creates customer in C&C CRM</li>
                <li>• lead_updated - Updates customer in C&C CRM</li>
                <li>• job_created - Creates journey in C&C CRM</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
