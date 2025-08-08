"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { Icon } from '@/components/atoms/Icon';

interface Company {
  id: string;
  name: string;
  apiSource: string;
  apiBaseUrl: string;
  isActive: boolean;
  syncFrequencyHours: number;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  syncStatus: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

interface CompanyStats {
  company: {
    id: string;
    name: string;
    apiSource: string;
    isActive: boolean;
    syncFrequencyHours: number;
    lastSyncAt: string | null;
    nextSyncAt: string | null;
    syncStatus: string;
  };
  counts: {
    branches: number;
    materials: number;
    serviceTypes: number;
    moveSizes: number;
    roomTypes: number;
    users: number;
    referralSources: number;
  };
  latestSync: {
    id: string | null;
    syncType: string | null;
    status: string | null;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    startedAt: string | null;
    completedAt: string | null;
    errorMessage: string | null;
  };
}

interface SyncLog {
  id: string;
  syncType: string;
  status: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  metadata: any;
}

export default function CompanyManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'materials' | 'service-types' | 'move-sizes' | 'room-types' | 'users' | 'referral-sources' | 'sync-logs'>('overview');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyStats(selectedCompany.id);
      fetchSyncLogs(selectedCompany.id);
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/company-management/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompany(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyStats = async (companyId: string) => {
    try {
      const response = await fetch(`/api/company-management/companies/${companyId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanyStats(data);
      }
    } catch (error) {
      console.error('Error fetching company stats:', error);
    }
  };

  const fetchSyncLogs = async (companyId: string) => {
    try {
      const response = await fetch(`/api/company-management/companies/${companyId}/sync-logs?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data);
      }
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const triggerSync = async (companyId: string) => {
    setSyncing(true);
    try {
      const response = await fetch(`/api/company-management/companies/${companyId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        }
      });
      
      if (response.ok) {
        // Refresh data after sync
        setTimeout(() => {
          fetchCompanies();
          if (selectedCompany) {
            fetchCompanyStats(selectedCompany.id);
            fetchSyncLogs(selectedCompany.id);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'SYNCING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const formatTimeUntil = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Overdue';
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-2">Manage external company integrations and data synchronization</p>
        </div>
        <Button variant="primary" size="lg">
          <Icon name="plus" className="mr-2" />
          Add Company
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Company List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCompany?.id === company.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCompany(company)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600">{company.apiSource}</p>
                      </div>
                      <Badge variant={company.isActive ? 'success' : 'secondary'}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Sync: {company.syncFrequencyHours}h</span>
                      <Badge variant={getStatusColor(company.syncStatus)} size="sm">
                        {company.syncStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Details */}
        <div className="lg:col-span-3">
          {selectedCompany ? (
            <div className="space-y-6">
              {/* Company Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedCompany.name}</CardTitle>
                      <p className="text-gray-600">{selectedCompany.apiSource} • {selectedCompany.apiBaseUrl}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedCompany.isActive ? 'success' : 'secondary'}>
                        {selectedCompany.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => triggerSync(selectedCompany.id)}
                        disabled={syncing}
                      >
                        {syncing ? (
                          <>
                            <Icon name="loader" className="animate-spin mr-2" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <Icon name="refresh" className="mr-2" />
                            Sync Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Last Sync</p>
                      <p className="font-medium">{formatDate(selectedCompany.lastSyncAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Sync</p>
                      <p className="font-medium">{formatTimeUntil(selectedCompany.nextSyncAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sync Frequency</p>
                      <p className="font-medium">{selectedCompany.syncFrequencyHours} hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={getStatusColor(selectedCompany.syncStatus)}>
                        {selectedCompany.syncStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { id: 'overview', label: 'Overview', icon: 'bar-chart' },
                  { id: 'branches', label: 'Branches', icon: 'map-pin' },
                  { id: 'materials', label: 'Materials', icon: 'package' },
                  { id: 'service-types', label: 'Services', icon: 'settings' },
                  { id: 'move-sizes', label: 'Move Sizes', icon: 'truck' },
                  { id: 'room-types', label: 'Room Types', icon: 'home' },
                  { id: 'users', label: 'Users', icon: 'users' },
                  { id: 'referral-sources', label: 'Referrals', icon: 'link' },
                  { id: 'sync-logs', label: 'Sync Logs', icon: 'activity' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon name={tab.icon} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <Card>
                <CardContent className="p-6">
                  {activeTab === 'overview' && companyStats && (
                    <div className="space-y-6">
                      {/* Statistics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{companyStats.counts.branches}</p>
                          <p className="text-sm text-gray-600">Branches</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{companyStats.counts.materials}</p>
                          <p className="text-sm text-gray-600">Materials</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{companyStats.counts.serviceTypes}</p>
                          <p className="text-sm text-gray-600">Service Types</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{companyStats.counts.users}</p>
                          <p className="text-sm text-gray-600">Users</p>
                        </div>
                      </div>

                      {/* Latest Sync Info */}
                      {companyStats.latestSync.id && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-2">Latest Sync</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Status</p>
                              <Badge variant={getStatusColor(companyStats.latestSync.status || '')}>
                                {companyStats.latestSync.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-gray-600">Processed</p>
                              <p className="font-medium">{companyStats.latestSync.recordsProcessed}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Created</p>
                              <p className="font-medium text-green-600">{companyStats.latestSync.recordsCreated}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Updated</p>
                              <p className="font-medium text-blue-600">{companyStats.latestSync.recordsUpdated}</p>
                            </div>
                          </div>
                          {companyStats.latestSync.errorMessage && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                              Error: {companyStats.latestSync.errorMessage}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'sync-logs' && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Recent Sync Logs</h3>
                      <div className="space-y-2">
                        {syncLogs.map((log) => (
                          <div key={log.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{log.syncType}</p>
                                <p className="text-sm text-gray-600">
                                  {formatDate(log.startedAt)} - {log.completedAt ? formatDate(log.completedAt) : 'In Progress'}
                                </p>
                              </div>
                              <Badge variant={getStatusColor(log.status)}>{log.status}</Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Processed:</span> {log.recordsProcessed}
                              </div>
                              <div>
                                <span className="text-gray-600">Created:</span> {log.recordsCreated}
                              </div>
                              <div>
                                <span className="text-gray-600">Updated:</span> {log.recordsUpdated}
                              </div>
                              <div>
                                <span className="text-gray-600">Failed:</span> {log.recordsFailed}
                              </div>
                            </div>
                            {log.errorMessage && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                {log.errorMessage}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Placeholder for other tabs */}
                  {activeTab !== 'overview' && activeTab !== 'sync-logs' && (
                    <div className="text-center py-12">
                      <Icon name="database" className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Data Loading</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {activeTab.replace('-', ' ')} data will be loaded here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="building" className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Company Selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a company from the list to view details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 