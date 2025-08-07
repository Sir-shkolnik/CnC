'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorageStore } from '@/stores/storageStore';
import { StorageLocation } from '@/types/storage';
import { StorageLocationType, StorageLocationStatus, StorageUnitType } from '@/types/enums';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign, 
  Package,
  Save,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (location: StorageLocation) => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createLocation, isCreating } = useStorageStore();
  
  const [formData, setFormData] = useState({
    name: '',
    companyId: 'company_1', // Default company
    type: 'CORPORATE' as StorageLocationType,
    status: 'ACTIVE' as StorageLocationStatus,
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada'
    },
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    contact: {
      manager: '',
      phone: '',
      email: '',
      emergency: ''
    },
    hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false },
      timezone: 'America/Toronto'
    },
    storage: {
      types: [] as StorageUnitType[],
      totalCapacity: 100,
      availableCapacity: 100,
      layout: {
        width: 100,
        length: 150,
        height: 20,
        unit: 'feet' as const,
        gridSize: 10,
        accessPaths: []
      },
      security: []
    },
    policies: {
      accessHours: '24/7',
      securityRequirements: ['ID Required'],
      maintenanceSchedule: 'Weekly',
      emergencyProcedures: 'Call emergency number'
    },
    pricing: {
      baseRates: {
        basePrice: 99,
        currency: 'CAD' as const,
        billingCycle: 'MONTHLY' as const,
        discounts: []
      },
      discounts: [],
      paymentTerms: {
        dueDate: 30,
        lateFeePercentage: 5,
        gracePeriod: 7,
        autoRenewal: true
      },
      lateFees: {
        percentage: 5,
        minimumAmount: 10,
        maximumAmount: 50,
        gracePeriod: 7
      }
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleStorageTypeToggle = (type: StorageUnitType) => {
    setFormData(prev => ({
      ...prev,
      storage: {
        ...prev.storage,
        types: prev.storage.types.includes(type)
          ? prev.storage.types.filter(t => t !== type)
          : [...prev.storage.types, type]
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const result = await createLocation(formData);
      if (result.success && result.data) {
        toast.success('Location created successfully!');
        onSuccess?.(result.data);
        onClose();
        // Reset form
        setFormData({
          name: '',
          companyId: 'company_1',
          type: 'CORPORATE' as StorageLocationType,
          status: 'ACTIVE' as StorageLocationStatus,
          address: {
            street: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'Canada'
          },
          coordinates: { latitude: 0, longitude: 0 },
          contact: {
            manager: '',
            phone: '',
            email: '',
            emergency: ''
          },
          hours: {
            monday: { open: '08:00', close: '18:00', closed: false },
            tuesday: { open: '08:00', close: '18:00', closed: false },
            wednesday: { open: '08:00', close: '18:00', closed: false },
            thursday: { open: '08:00', close: '18:00', closed: false },
            friday: { open: '08:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: false },
            timezone: 'America/Toronto'
          },
          storage: {
            types: [],
            totalCapacity: 100,
            availableCapacity: 100,
            layout: {
              width: 100,
              length: 150,
              height: 20,
              unit: 'feet',
              gridSize: 10,
              accessPaths: []
            },
            security: []
          },
          policies: {
            accessHours: '24/7',
            securityRequirements: ['ID Required'],
            maintenanceSchedule: 'Weekly',
            emergencyProcedures: 'Call emergency number'
          },
          pricing: {
            baseRates: {
              basePrice: 99,
              currency: 'CAD',
              billingCycle: 'MONTHLY',
              discounts: []
            },
            discounts: [],
            paymentTerms: {
              dueDate: 30,
              lateFeePercentage: 5,
              gracePeriod: 7,
              autoRenewal: true
            },
            lateFees: {
              percentage: 5,
              minimumAmount: 10,
              maximumAmount: 50,
              gracePeriod: 7
            }
          }
        });
        setCurrentStep(1);
      }
    } catch (error) {
      toast.error('Failed to create location');
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Location Name"
                  placeholder="e.g., LGM Toronto Downtown"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={formData.type === 'CORPORATE' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handleInputChange('type', 'CORPORATE')}
                    >
                      Corporate
                    </Button>
                    <Button
                      variant={formData.type === 'FRANCHISE' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handleInputChange('type', 'FRANCHISE')}
                    >
                      Franchise
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Street Address"
                  placeholder="123 Main Street"
                  value={formData.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  required
                />
                
                <Input
                  label="City"
                  placeholder="Toronto"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  required
                />
                
                <Input
                  label="Province"
                  placeholder="Ontario"
                  value={formData.address.province}
                  onChange={(e) => handleAddressChange('province', e.target.value)}
                  required
                />
                
                <Input
                  label="Postal Code"
                  placeholder="M5V 3A8"
                  value={formData.address.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Manager Name"
                  placeholder="John Doe"
                  value={formData.contact.manager}
                  onChange={(e) => handleContactChange('manager', e.target.value)}
                  required
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="416-555-0123"
                  value={formData.contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  required
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="manager@lgm.com"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  required
                />
                
                <Input
                  label="Emergency Contact"
                  type="tel"
                  placeholder="416-555-9999"
                  value={formData.contact.emergency}
                  onChange={(e) => handleContactChange('emergency', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Operating Hours
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Monday - Friday"
                  value="8:00 AM - 6:00 PM"
                  disabled
                />
                <Input
                  label="Saturday"
                  value="9:00 AM - 5:00 PM"
                  disabled
                />
                <Input
                  label="Sunday"
                  value="10:00 AM - 4:00 PM"
                  disabled
                />
                <Input
                  label="Timezone"
                  value="America/Toronto"
                  disabled
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Storage Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Types Available
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {(['POD', 'LOCKER', 'CONTAINER'] as StorageUnitType[]).map((type) => (
                      <Button
                        key={type}
                        variant={formData.storage.types.includes(type) ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleStorageTypeToggle(type)}
                        className="justify-start"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total Capacity"
                    type="number"
                    placeholder="100"
                    value={formData.storage.totalCapacity}
                    onChange={(e) => handleNestedChange('storage', 'totalCapacity', parseInt(e.target.value))}
                    required
                  />
                  
                  <Input
                    label="Available Capacity"
                    type="number"
                    placeholder="100"
                    value={formData.storage.availableCapacity}
                    onChange={(e) => handleNestedChange('storage', 'availableCapacity', parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Layout
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Width (feet)"
                      type="number"
                      placeholder="100"
                      value={formData.storage.layout.width}
                      onChange={(e) => handleNestedChange('storage', 'layout', {
                        ...formData.storage.layout,
                        width: parseInt(e.target.value)
                      })}
                    />
                    <Input
                      label="Length (feet)"
                      type="number"
                      placeholder="150"
                      value={formData.storage.layout.length}
                      onChange={(e) => handleNestedChange('storage', 'layout', {
                        ...formData.storage.layout,
                        length: parseInt(e.target.value)
                      })}
                    />
                    <Input
                      label="Height (feet)"
                      type="number"
                      placeholder="20"
                      value={formData.storage.layout.height}
                      onChange={(e) => handleNestedChange('storage', 'layout', {
                        ...formData.storage.layout,
                        height: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Policies
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Base Price (CAD)"
                  type="number"
                  placeholder="99"
                  value={formData.pricing.baseRates.basePrice}
                  onChange={(e) => handleNestedChange('pricing', 'baseRates', {
                    ...formData.pricing.baseRates,
                    basePrice: parseInt(e.target.value)
                  })}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle
                  </label>
                  <div className="flex gap-2">
                    {['MONTHLY', 'WEEKLY', 'DAILY'].map((cycle) => (
                      <Button
                        key={cycle}
                        variant={formData.pricing.baseRates.billingCycle === cycle ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleNestedChange('pricing', 'baseRates', {
                          ...formData.pricing.baseRates,
                          billingCycle: cycle
                        })}
                      >
                        {cycle}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Hours
                  </label>
                  <Input
                    placeholder="24/7"
                    value={formData.policies.accessHours}
                    onChange={(e) => handleNestedChange('policies', 'accessHours', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Requirements
                  </label>
                  <div className="space-y-2">
                    {['ID Required', 'Background Check', 'Insurance Required'].map((req) => (
                      <label key={req} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.policies.securityRequirements.includes(req)}
                          onChange={(e) => {
                            const current = formData.policies.securityRequirements;
                            const updated = e.target.checked
                              ? [...current, req]
                              : current.filter(r => r !== req);
                            handleNestedChange('policies', 'securityRequirements', updated);
                          }}
                        />
                        {req}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Storage Location
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Step {currentStep} of {totalSteps}</span>
                    <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    
                    {currentStep === totalSteps ? (
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={isCreating}
                        disabled={!formData.name || !formData.address.street}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Create Location
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={nextStep}
                        disabled={!formData.name || !formData.address.street}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 