'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorageStore } from '@/stores/storageStore';
import { StorageUnit } from '@/types/storage';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  X, 
  Package, 
  Ruler, 
  DollarSign, 
  MapPin, 
  Settings,
  Save,
  Plus,
  Grid3X3,
  RotateCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AddStorageUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  onSuccess?: (unit: StorageUnit) => void;
}

export const AddStorageUnitModal: React.FC<AddStorageUnitModalProps> = ({
  isOpen,
  onClose,
  locationId,
  onSuccess
}) => {
  const { createStorageUnit, isCreating } = useStorageStore();
  
  const [formData, setFormData] = useState({
    locationId: locationId,
    type: 'POD' as string,
    size: {
      width: 5,
      length: 7,
      height: 7,
      unit: 'feet' as const
    },
    position: {
      x: 0,
      y: 0,
      rotation: 0,
      gridPosition: {
        row: 0,
        column: 0
      }
    },
    status: 'AVAILABLE' as string,
    pricing: {
      basePrice: 99,
      currency: 'CAD' as const,
      billingCycle: 'MONTHLY' as const,
      discounts: []
    },
    features: [] as string[],
    maintenanceHistory: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSizeChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      size: {
        ...prev.size,
        [field]: value
      }
    }));
  };

  const handlePositionChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      position: {
        ...prev.position,
        [field]: value
      }
    }));
  };

  const handlePricingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async () => {
    try {
      const result = await createStorageUnit({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any);
      if (result.success && result.data) {
        toast.success('Storage unit created successfully!');
        onSuccess?.(result.data);
        onClose();
        // Reset form
        setFormData({
          locationId: locationId,
          type: 'POD',
          size: {
            width: 5,
            length: 7,
            height: 7,
            unit: 'feet'
          },
          position: {
            x: 0,
            y: 0,
            rotation: 0,
            gridPosition: {
              row: 0,
              column: 0
            }
          },
          status: 'AVAILABLE',
          pricing: {
            basePrice: 99,
            currency: 'CAD',
            billingCycle: 'MONTHLY',
            discounts: []
          },
          features: [],
          maintenanceHistory: []
        });
        setCurrentStep(1);
      }
    } catch (error) {
      toast.error('Failed to create storage unit');
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

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'POD':
        return '📦';
      case 'LOCKER':
        return '🔒';
      case 'CONTAINER':
        return '📦';
      default:
        return '📦';
    }
  };

  const getUnitColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'OCCUPIED':
        return 'bg-red-500';
      case 'RESERVED':
        return 'bg-yellow-500';
      case 'MAINTENANCE':
        return 'bg-gray-500';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-700';
      default:
        return 'bg-blue-500';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Unit Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {(['POD', 'LOCKER', 'CONTAINER'] as string[]).map((type) => (
                      <Button
                        key={type}
                        variant={formData.type === type ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleInputChange('type', type)}
                        className="justify-start"
                      >
                        <span className="mr-2">{getUnitIcon(type)}</span>
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Status
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE'] as string[]).map((status) => (
                      <Button
                        key={status}
                        variant={formData.status === status ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleInputChange('status', status)}
                        className="justify-start"
                      >
                        <div className={`w-3 h-3 rounded-full mr-2 ${getUnitColor(status)}`} />
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Features
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Climate Controlled',
                      '24/7 Access',
                      'Security Camera',
                      'Drive-up Access',
                      'Ground Level',
                      'Weather Resistant'
                    ].map((feature) => (
                      <label key={feature} className="flex items-center p-2 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                        />
                        {feature}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Dimensions & Position
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Dimensions (feet)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Width"
                      type="number"
                      placeholder="5"
                      value={formData.size.width}
                      onChange={(e) => handleSizeChange('width', parseFloat(e.target.value))}
                      required
                    />
                    <Input
                      label="Length"
                      type="number"
                      placeholder="7"
                      value={formData.size.length}
                      onChange={(e) => handleSizeChange('length', parseFloat(e.target.value))}
                      required
                    />
                    <Input
                      label="Height"
                      type="number"
                      placeholder="7"
                      value={formData.size.height}
                      onChange={(e) => handleSizeChange('height', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Position
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="X Position"
                      type="number"
                      placeholder="0"
                      value={formData.position.x}
                      onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                    />
                    <Input
                      label="Y Position"
                      type="number"
                      placeholder="0"
                      value={formData.position.y}
                      onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                    />
                    <Input
                      label="Rotation (degrees)"
                      type="number"
                      placeholder="0"
                      value={formData.position.rotation}
                      onChange={(e) => handlePositionChange('rotation', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grid Position
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Row"
                      type="number"
                      placeholder="0"
                      value={formData.position.gridPosition.row}
                      onChange={(e) => (handlePositionChange as any)('gridPosition', {
                        ...formData.position.gridPosition,
                        row: parseInt(e.target.value)
                      })}
                    />
                    <Input
                      label="Column"
                      type="number"
                      placeholder="0"
                      value={formData.position.gridPosition.column}
                      onChange={(e) => (handlePositionChange as any)('gridPosition', {
                        ...formData.position.gridPosition,
                        column: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Configuration
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Base Price (CAD)"
                    type="number"
                    placeholder="99"
                    value={formData.pricing.basePrice}
                    onChange={(e) => handlePricingChange('basePrice', parseFloat(e.target.value))}
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Cycle
                    </label>
                    <div className="flex gap-2">
                      {(['MONTHLY', 'WEEKLY', 'DAILY'] as const).map((cycle) => (
                        <Button
                          key={cycle}
                          variant={formData.pricing.billingCycle === cycle ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => handlePricingChange('billingCycle', cycle)}
                        >
                          {cycle}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <div className="flex gap-2">
                    {(['CAD', 'USD'] as const).map((currency) => (
                      <Button
                        key={currency}
                        variant={formData.pricing.currency === currency ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePricingChange('currency', currency)}
                      >
                        {currency}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Unit Preview</h4>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl ${getUnitColor(formData.status)}`}>
                      {getUnitIcon(formData.type)}
                    </div>
                    <div>
                      <p className="font-medium">{formData.type} Unit</p>
                      <p className="text-sm text-gray-600">
                        {formData.size.width}' × {formData.size.length}' × {formData.size.height}'
                      </p>
                      <p className="text-sm text-gray-600">
                        ${formData.pricing.basePrice}/{formData.pricing.billingCycle.toLowerCase()}
                      </p>
                    </div>
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Storage Unit
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
                        disabled={!formData.size.width || !formData.size.length}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Create Unit
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={nextStep}
                        disabled={!formData.type}
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