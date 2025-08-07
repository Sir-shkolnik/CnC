"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { CustomerModal } from '@/components/CustomerManagement/CustomerModal';
import { CustomerFilters } from '@/components/CustomerManagement/CustomerFilters';
import { CustomerAnalytics } from '@/components/CustomerManagement/CustomerAnalytics';
import { useCustomerStore } from '@/stores/customerStore';
import { Customer, LeadStatus } from '@/types/customer';

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filters, setFilters] = useState({
    leadStatus: '',
    assignedTo: '',
    isActive: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const {
    customers,
    analytics,
    fetchCustomers,
    fetchAnalytics,
    deleteCustomer,
    loading
  } = useCustomerStore();

  useEffect(() => {
    loadData();
  }, [currentPage, filters, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCustomers({
          page: currentPage,
          search: searchTerm,
          ...filters
        }),
        fetchAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setShowCreateModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCreateModal(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(customerId);
        loadData();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'secondary';
      case 'CONTACTED': return 'warning';
      case 'QUALIFIED': return 'success';
      case 'PROPOSAL_SENT': return 'info';
      case 'NEGOTIATION': return 'warning';
      case 'WON': return 'success';
      case 'LOST': return 'error';
      case 'ARCHIVED': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Customer Management</h1>
            <p className="text-gray-400 mt-2">Manage your customers and leads</p>
          </div>
          <Button
            onClick={handleCreateCustomer}
            variant="primary"
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </Button>
        </div>

        {/* Analytics */}
        <div className="mb-8">
          {analytics && <CustomerAnalytics analytics={analytics} />}
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <CustomerFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => {
              setFilters({
                leadStatus: '',
                assignedTo: '',
                isActive: true
              });
              setSearchTerm('');
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm">{customer.email}</p>
                  <p className="text-gray-400 text-sm">{customer.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(customer.leadStatus)}>
                    {customer.leadStatus}
                  </Badge>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => {
                        // Handle dropdown menu
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Address */}
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-white text-sm">
                    {customer.address.street}, {customer.address.city}
                  </p>
                </div>

                {/* Lead Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Estimated Value</p>
                    <p className="text-white font-semibold">
                      {formatCurrency(customer.estimatedValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Leads</p>
                    <p className="text-white font-semibold">{customer.leadCount}</p>
                  </div>
                </div>

                {/* Assigned To */}
                {customer.assignedUserName && (
                  <div>
                    <p className="text-sm text-gray-400">Assigned To</p>
                    <p className="text-white text-sm">{customer.assignedUserName}</p>
                  </div>
                )}

                {/* Tags */}
                {customer.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {customer.tags.length > 3 && (
                        <Badge variant="secondary" size="sm">
                          +{customer.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCustomer(customer)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCustomer(customer)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && customers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No customers found</h3>
              <p className="text-gray-500">
                {searchTerm || Object.values(filters).some(f => f !== '' && f !== true)
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first customer'
                }
              </p>
            </div>
            {!searchTerm && Object.values(filters).every(f => f === '' || f === true) && (
              <Button onClick={handleCreateCustomer} variant="primary">
                Add Your First Customer
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {customers.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, customers.length)} of {customers.length} customers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">Page {currentPage}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={customers.length < 20}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showCreateModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCustomer(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setSelectedCustomer(null);
            loadData();
          }}
        />
      )}
    </div>
  );
} 