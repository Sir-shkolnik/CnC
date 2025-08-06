'use client';

import React, { useState, useEffect } from 'react';
import { useStorageStore, useStorageBookings, useStorageLocations } from '@/stores/storageStore';
import { StorageBooking, StorageLocation } from '@/types/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Package,
  Eye,
  Edit,
  Send,
  Printer,
  Mail,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BillingRecord {
  id: string;
  bookingId: string;
  customerName: string;
  locationName: string;
  unitType: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: Date;
  paidDate?: Date;
  invoiceNumber: string;
  description: string;
}

export default function StorageBillingPage() {
  const bookings = useStorageBookings();
  const locations = useStorageLocations();
  const { fetchBookings } = useStorageStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter'>('month');
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Mock billing records based on bookings
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Generate mock billing records from bookings
    const records: BillingRecord[] = bookings.map((booking, index) => ({
      id: `bill_${index + 1}`,
      bookingId: booking.id,
      customerName: `Customer ${index + 1}`,
      locationName: locations.find(l => l.id === booking.unitId.split('_')[0])?.name || 'Unknown Location',
      unitType: ['POD', 'LOCKER', 'CONTAINER'][index % 3],
      amount: booking.totalCost,
      status: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'][index % 4] as any,
      dueDate: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)),
      paidDate: index % 3 === 0 ? new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) : undefined,
      invoiceNumber: `INV-${String(index + 1).padStart(4, '0')}`,
      description: `Storage rental for ${booking.endDate?.toLocaleDateString() || 'ongoing'}`
    }));
    setBillingRecords(records);
  }, [bookings, locations]);

  // Filter records
  const filteredRecords = billingRecords.filter(record => {
    const matchesSearch = record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || record.status === filterStatus;
    const matchesLocation = filterLocation === 'ALL' || record.locationName === filterLocation;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Calculate totals
  const totalRevenue = billingRecords.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = billingRecords.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0);
  const overdueAmount = billingRecords.filter(r => r.status === 'OVERDUE').reduce((sum, r) => sum + r.amount, 0);
  const totalInvoices = billingRecords.length;

  const handleSendInvoice = (record: BillingRecord) => {
    toast.success(`Invoice ${record.invoiceNumber} sent to ${record.customerName}`);
  };

  const handleMarkAsPaid = (record: BillingRecord) => {
    setBillingRecords(prev => prev.map(r => 
      r.id === record.id 
        ? { ...r, status: 'PAID' as const, paidDate: new Date() }
        : r
    ));
    toast.success(`Invoice ${record.invoiceNumber} marked as paid`);
  };

  const handleViewInvoice = (record: BillingRecord) => {
    setSelectedRecord(record);
    setIsInvoiceModalOpen(true);
  };

  const exportBillingData = () => {
    const csvContent = [
      ['Invoice #', 'Customer', 'Location', 'Unit Type', 'Amount', 'Status', 'Due Date', 'Paid Date'].join(','),
      ...filteredRecords.map(record => [
        record.invoiceNumber,
        record.customerName,
        record.locationName,
        record.unitType,
        record.amount,
        record.status,
        record.dueDate.toLocaleDateString(),
        record.paidDate?.toLocaleDateString() || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'billing-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Billing data exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'OVERDUE':
        return 'bg-red-500';
      case 'CANCELLED':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'OVERDUE':
        return <Badge variant="error">Overdue</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="primary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
          <p className="text-gray-600">Manage invoices, payments, and financial reporting</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={exportBillingData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="primary"
            onClick={() => toast.success('Generate new invoice feature coming soon')}
          >
            <FileText className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${overdueAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search invoices or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="ALL">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">{record.unitType} Unit</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.locationName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ${record.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.dueDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(record)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {record.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendInvoice(record)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsPaid(record)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.print()}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="font-semibold">${(totalRevenue / 12).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Collection Rate</span>
                <span className="font-semibold text-green-600">
                  {totalRevenue > 0 ? Math.round((totalRevenue / (totalRevenue + pendingAmount + overdueAmount)) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Invoice</span>
                <span className="font-semibold">
                  ${totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Paid</span>
                </div>
                <span className="text-sm font-semibold">
                  {billingRecords.filter(r => r.status === 'PAID').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-semibold">
                  {billingRecords.filter(r => r.status === 'PENDING').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Overdue</span>
                </div>
                <span className="text-sm font-semibold">
                  {billingRecords.filter(r => r.status === 'OVERDUE').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => toast.success('Send payment reminders feature coming soon')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => toast.success('Generate financial reports feature coming soon')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => toast.success('Reconcile payments feature coming soon')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Reconcile Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Modal */}
      {selectedRecord && isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Invoice {selectedRecord.invoiceNumber}</h2>
              <Button
                variant="ghost"
                onClick={() => setIsInvoiceModalOpen(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <p>{selectedRecord.customerName}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Invoice Date:</h3>
                  <p>{selectedRecord.dueDate.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Description:</h3>
                <p>{selectedRecord.description}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${selectedRecord.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    window.print();
                    setIsInvoiceModalOpen(false);
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSendInvoice(selectedRecord)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 