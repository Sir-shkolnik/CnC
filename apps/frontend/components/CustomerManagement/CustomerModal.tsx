"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Tag, DollarSign } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { useCustomerStore } from '@/stores/customerStore';
import { Customer, CustomerCreate, CustomerUpdate, LeadStatus } from '@/types/customer';

interface CustomerModalProps {
  customer?: Customer | null;
  onClose: () => void;
  onSave: () => void;
}

export function CustomerModal({ customer, onClose, onSave }: CustomerModalProps) {
  const [formData, setFormData] = useState<CustomerCreate | CustomerUpdate>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada',
      unit: ''
    },
    leadSource: '',
    leadStatus: LeadStatus.NEW,
    assignedTo: '',
    estimatedValue: undefined,
    notes: '',
    tags: [],
    preferences: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  const { createCustomer, updateCustomer, loading } = useCustomerStore();

  const isEditing = !!customer;

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        leadSource: customer.leadSource || '',
        leadStatus: customer.leadStatus as LeadStatus,
        assignedTo: customer.assignedTo || '',
        estimatedValue: customer.estimatedValue,
        notes: customer.notes || '',
        tags: customer.tags,
        preferences: customer.preferences
      });
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address?.street?.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address?.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address?.province?.trim()) {
      newErrors['address.province'] = 'Province is required';
    }

    if (!formData.address?.postalCode?.trim()) {
      newErrors['address.postalCode'] = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && customer) {
        await updateCustomer(customer.id, formData as CustomerUpdate);
      } else {
        await createCustomer(formData as CustomerCreate);
      }
      onSave();
    } catch (error) {
      console.error('Error saving customer:', error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`address.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`address.${field}`]: ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
    'Prince Edward Island', 'Quebec', 'Saskatchewan',
    'Northwest Territories', 'Nunavut', 'Yukon'
  ];

  const leadSources = [
    'Website', 'Referral', 'Cold Call', 'Social Media',
    'Trade Show', 'Google Ads', 'Facebook Ads', 'Yellow Pages',
    'Word of Mouth', 'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="First Name"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Last Name"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={errors.lastName}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    icon={<Phone className="w-4 h-4" />}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  error={errors['address.street']}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.address?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    error={errors['address.city']}
                    required
                  />
                  <select
                    value={formData.address?.province || ''}
                    onChange={(e) => handleAddressChange('province', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  <Input
                    label="Postal Code"
                    value={formData.address?.postalCode || ''}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    error={errors['address.postalCode']}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Unit/Apartment"
                    value={formData.address?.unit || ''}
                    onChange={(e) => handleAddressChange('unit', e.target.value)}
                    placeholder="Optional"
                  />
                  <Input
                    label="Country"
                    value={formData.address?.country || 'Canada'}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </Card>

            {/* Lead Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Lead Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lead Source
                  </label>
                  <select
                    value={formData.leadSource || ''}
                    onChange={(e) => handleInputChange('leadSource', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Source</option>
                    {leadSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lead Status
                  </label>
                  <select
                    value={formData.leadStatus || LeadStatus.NEW}
                    onChange={(e) => handleInputChange('leadStatus', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(LeadStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Estimated Value"
                  type="number"
                  value={formData.estimatedValue || ''}
                  onChange={(e) => handleInputChange('estimatedValue', e.target.value ? parseFloat(e.target.value) : null)}
                  icon={<DollarSign className="w-4 h-4" />}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Add notes about this customer..."
              />
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 