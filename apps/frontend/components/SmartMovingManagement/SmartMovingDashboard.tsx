'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { apiClient } from '@/lib/api';

interface SmartMovingStats {
  totalJobs: number;
  syncedJobs: number;
  pendingJobs: number;
  failedJobs: number;
  lastSync: string;
  apiConnection: string;
  status: string;
}

interface SmartMovingJob {
  externalId: string;
  smartmovingJobNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  estimatedValue: number;
  serviceType: string;
  moveSize: string;
  originAddress: string;
  destinationAddress: string;
  scheduledDate: string;
  confirmed: boolean;
  dataSource: string;
  lastSyncAt: string;
  syncStatus: string;
}

interface SmartMovingLocation {
  id: string;
  name: string;
  phoneNumber: string;
  fullAddress: string;
  city: string;
  state: string;
  isPrimary: boolean;
  isActive: boolean;
}

export default function SmartMovingDashboard() {
  const [stats, setStats] = useState<SmartMovingStats | null>(null);
  const [todayJobs, setTodayJobs] = useState<SmartMovingJob[]>([]);
  const [tomorrowJobs, setTomorrowJobs] = useState<SmartMovingJob[]>([]);
  const [locations, setLocations] = useState<SmartMovingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'locations' | 'sync'>('overview');

  useEffect(() => {
    loadSmartMovingData();
  }, []);

  const loadSmartMovingData = async () => {
    try {
      setLoading(true);
      
      // Load sync status
      const statusResponse = await apiClient.getSmartMovingSyncStatus();
      if (statusResponse.success) {
        setStats({
          totalJobs: statusResponse.data.totalJobs || 0,
          syncedJobs: statusResponse.data.syncedJobs || 0,
          pendingJobs: statusResponse.data.pendingJobs || 0,
          failedJobs: statusResponse.data.failedJobs || 0,
          lastSync: statusResponse.data.lastSync || 'Never',
          apiConnection: 'connected',
          status: 'operational'
        });
      }

      // Load today's jobs
      const todayResponse = await apiClient.getSmartMovingTodayJobs();
      if (todayResponse.success) {
        setTodayJobs(todayResponse.data.jobs || []);
      }

      // Load tomorrow's jobs
      const tomorrowResponse = await apiClient.getSmartMovingTomorrowJobs();
      if (tomorrowResponse.success) {
        setTomorrowJobs(tomorrowResponse.data.jobs || []);
      }

      // Load locations
      const locationsResponse = await apiClient.getSmartMovingLocations();
      if (locationsResponse.success) {
        setLocations(locationsResponse.data.locations || []);
      }

    } catch (error) {
      console.error('Error loading SmartMoving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncJobs = async () => {
    try {
      setSyncing(true);
      const response = await apiClient.syncSmartMovingJobs();
      if (response.success) {
        // Reload data after sync
        await loadSmartMovingData();
        alert('SmartMoving jobs synchronized successfully!');
      } else {
        alert('Sync failed: ' + response.message);
      }
    } catch (error) {
      console.error('Error syncing jobs:', error);
      alert('Error syncing jobs. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SYNCED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading SmartMoving data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SmartMoving Integration</h1>
          <p className="text-gray-600 mt-2">Manage SmartMoving API integration and data synchronization</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleSyncJobs} 
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? 'Syncing...' : 'Sync Jobs'}
          </Button>
          <Button 
            onClick={loadSmartMovingData}
            variant="secondary"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'jobs', label: 'Jobs' },
            { id: 'locations', label: 'Locations' },
            { id: 'sync', label: 'Sync Status' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Badge variant="default">{stats?.totalJobs || 0}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All SmartMoving jobs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Synced Jobs</CardTitle>
                <Badge variant="success">{stats?.syncedJobs || 0}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.syncedJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully synced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
                <Badge variant="warning">{stats?.pendingJobs || 0}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendingJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting sync
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
                <Badge variant="error">{stats?.failedJobs || 0}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.failedJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Sync errors
                </p>
              </CardContent>
            </Card>
          </div>

          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle>API Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  stats?.apiConnection === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium">
                    SmartMoving API: {stats?.apiConnection === 'connected' ? 'Connected' : 'Disconnected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last sync: {stats?.lastSync ? formatDate(stats.lastSync) : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Jobs ({todayJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayJobs.slice(0, 5).map((job) => (
                    <div key={job.externalId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{job.customerName}</p>
                        <p className="text-sm text-gray-600">{job.smartmovingJobNumber}</p>
                      </div>
                      <Badge variant={getStatusColor(job.syncStatus)}>
                        {job.syncStatus}
                      </Badge>
                    </div>
                  ))}
                  {todayJobs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No jobs for today</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tomorrow's Jobs ({tomorrowJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tomorrowJobs.slice(0, 5).map((job) => (
                    <div key={job.externalId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{job.customerName}</p>
                        <p className="text-sm text-gray-600">{job.smartmovingJobNumber}</p>
                      </div>
                      <Badge variant={getStatusColor(job.syncStatus)}>
                        {job.syncStatus}
                      </Badge>
                    </div>
                  ))}
                  {tomorrowJobs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No jobs for tomorrow</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Jobs ({todayJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayJobs.map((job) => (
                    <div key={job.externalId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{job.customerName}</h3>
                        <Badge variant={getStatusColor(job.syncStatus)}>
                          {job.syncStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Job Number</p>
                          <p className="font-medium">{job.smartmovingJobNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Estimated Value</p>
                          <p className="font-medium">{formatCurrency(job.estimatedValue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Service Type</p>
                          <p className="font-medium">{job.serviceType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Move Size</p>
                          <p className="font-medium">{job.moveSize}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Origin</p>
                          <p className="font-medium">{job.originAddress}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Destination</p>
                          <p className="font-medium">{job.destinationAddress}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {todayJobs.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No jobs for today</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tomorrow's Jobs ({tomorrowJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tomorrowJobs.map((job) => (
                    <div key={job.externalId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{job.customerName}</h3>
                        <Badge variant={getStatusColor(job.syncStatus)}>
                          {job.syncStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Job Number</p>
                          <p className="font-medium">{job.smartmovingJobNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Estimated Value</p>
                          <p className="font-medium">{formatCurrency(job.estimatedValue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Service Type</p>
                          <p className="font-medium">{job.serviceType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Move Size</p>
                          <p className="font-medium">{job.moveSize}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Origin</p>
                          <p className="font-medium">{job.originAddress}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Destination</p>
                          <p className="font-medium">{job.destinationAddress}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tomorrowJobs.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No jobs for tomorrow</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <Card>
          <CardHeader>
            <CardTitle>SmartMoving Locations ({locations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{location.name}</h3>
                    <div className="flex space-x-1">
                      {location.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                      <Badge variant={location.isActive ? 'success' : 'error'}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{location.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium">{location.fullAddress}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">City, State</p>
                      <p className="font-medium">{location.city}, {location.state}</p>
                    </div>
                  </div>
                </div>
              ))}
              {locations.length === 0 && (
                <p className="text-gray-500 text-center py-8 col-span-full">No locations found</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Status Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">API Configuration</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">API Base URL</p>
                      <p className="font-mono text-sm">https://api-public.smartmoving.com/v1</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">API Key</p>
                      <p className="font-mono text-sm">185840176c73420fbd3a473c2fdccedb</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client ID</p>
                      <p className="font-mono text-sm">b0db4e2b-74af-44e2-8ecd-6f4921ec836f</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Sync Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Sync Frequency</p>
                      <p className="font-medium">Every 12 hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Sync</p>
                      <p className="font-medium">{stats?.lastSync ? formatDate(stats.lastSync) : 'Never'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={stats?.status === 'operational' ? 'success' : 'error'}>
                        {stats?.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalJobs || 0}</div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.syncedJobs || 0}</div>
                  <p className="text-sm text-gray-600">Synced</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats?.pendingJobs || 0}</div>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats?.failedJobs || 0}</div>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
