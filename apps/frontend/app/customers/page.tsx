'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  moveDate?: string;
  moveSize?: string;
  serviceType?: string;
  source?: string;
  status: string;
  estimatedValue?: number;
  assignedTo?: {
    name: string;
    email: string;
  };
  quotes?: Array<{
    id: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CustomerAnalytics {
  overview: {
    totalCustomers: number;
    newLeads: number;
    qualifiedLeads: number;
    wonCustomers: number;
    conversionRate: number;
  };
  recentActivity: Customer[];
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCustomers();
    fetchAnalytics();
  }, [currentPage, statusFilter, sourceFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      
      const response = await fetch(`/api/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/customers/analytics/overview');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'proposal_sent':
        return 'bg-purple-100 text-purple-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <UserPlus className="w-4 h-4" />;
      case 'contacted':
        return <Phone className="w-4 h-4" />;
      case 'qualified':
        return <CheckCircle className="w-4 h-4" />;
      case 'proposal_sent':
        return <FileText className="w-4 h-4" />;
      case 'negotiation':
        return <Clock className="w-4 h-4" />;
      case 'won':
        return <CheckCircle className="w-4 h-4" />;
      case 'lost':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers();
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage leads, customers, and sales pipeline</p>
        </div>
        <Button onClick={() => router.push('/customers/create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.newLeads}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.qualifiedLeads}</div>
              <p className="text-xs text-muted-foreground">Ready for proposal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Leads to customers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="phone">Phone</option>
              </select>
              <Button variant="outline" onClick={handleSearch}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Customers & Leads ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Create your first customer to get started</p>
              <Button 
                onClick={() => router.push('/customers/create')}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Users className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                          <Badge className={getStatusColor(customer.status)}>
                            {getStatusIcon(customer.status)}
                            <span className="ml-1">{customer.status.replace('_', ' ').toUpperCase()}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-4">
                            {customer.email && (
                              <span className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {customer.email}
                              </span>
                            )}
                            {customer.phone && (
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {customer.phone}
                              </span>
                            )}
                            {customer.moveDate && (
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(customer.moveDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          <span className="mr-4">
                            <strong>Source:</strong> {customer.source || 'Unknown'}
                          </span>
                          {customer.estimatedValue && (
                            <span className="mr-4">
                              <strong>Value:</strong> {formatCurrency(customer.estimatedValue)}
                            </span>
                          )}
                          {customer.assignedTo && (
                            <span>
                              <strong>Assigned:</strong> {customer.assignedTo.name}
                            </span>
                          )}
                        </div>
                        {customer.quotes && customer.quotes.length > 0 && (
                          <div className="text-sm text-gray-500 mt-2">
                            <strong>Latest Quote:</strong> {formatCurrency(customer.quotes[0].totalPrice)} 
                            <span className="ml-2">({customer.quotes[0].status})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/customers/${customer.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/customers/${customer.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/customers/${customer.id}/quotes/new`)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Quote
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 