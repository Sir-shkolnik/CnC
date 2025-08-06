'use client';

import React, { useState, useEffect } from 'react';
import { useStorageStore, useStorageLocations, useStorageUnitsByLocation } from '@/stores/storageStore';
import { StorageUnit, StorageUnitType, StorageBooking } from '@/types/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { 
  Building2, 
  Package, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
  User,
  Phone,
  Mail,
  Shield,
  Truck,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StorageBookingPage() {
  const locations = useStorageLocations();
  const { fetchLocations, createBooking, isCreating } = useStorageStore();
  
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
  const [filterType, setFilterType] = useState<StorageUnitType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStep, setCurrentStep] = useState<'location' | 'unit' | 'details' | 'payment' | 'confirmation'>('location');
  
  const storageUnits = useStorageUnitsByLocation(selectedLocation);
  
  const [bookingData, setBookingData] = useState({
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    bookingDetails: {
      startDate: '',
      endDate: '',
      duration: 1,
      specialRequirements: ''
    },
    paymentInfo: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    }
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  // Filter available units
  const availableUnits = storageUnits.filter(unit => {
    const matchesType = filterType === 'ALL' || unit.type === filterType;
    const matchesSearch = unit.id.toLowerCase().includes(searchTerm.toLowerCase());
    const isAvailable = unit.status === 'AVAILABLE';
    return matchesType && matchesSearch && isAvailable;
  });

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setCurrentStep('unit');
  };

  const handleUnitSelect = (unit: StorageUnit) => {
    setSelectedUnit(unit);
    setCurrentStep('details');
  };

  const handleCustomerInfoChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value
      }
    }));
  };

  const handleBookingDetailsChange = (field: string, value: any) => {
    setBookingData(prev => ({
      ...prev,
      bookingDetails: {
        ...prev.bookingDetails,
        [field]: value
      }
    }));
  };

  const handlePaymentInfoChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        [field]: value
      }
    }));
  };

  const calculateTotalCost = () => {
    if (!selectedUnit) return 0;
    const basePrice = selectedUnit.pricing.basePrice;
    const duration = bookingData.bookingDetails.duration;
    return basePrice * duration;
  };

  const handleBookingSubmit = async () => {
    if (!selectedUnit) return;

    try {
      const booking: Omit<StorageBooking, 'id'> = {
        unitId: selectedUnit.id,
        customerId: 'customer_' + Date.now(), // Mock customer ID
        startDate: new Date(bookingData.bookingDetails.startDate),
        endDate: new Date(bookingData.bookingDetails.endDate),
        totalCost: calculateTotalCost(),
        paymentStatus: 'PENDING',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await createBooking(booking);
      if (result.success) {
        setCurrentStep('confirmation');
        toast.success('Booking created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const getUnitIcon = (type: StorageUnitType) => {
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
      default:
        return 'bg-blue-500';
    }
  };

  const renderLocationSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Storage Space</h1>
        <p className="text-gray-600">Select a location and find the perfect storage unit for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card
            key={location.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
            onClick={() => handleLocationSelect(location.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.address.city}, {location.address.province}</p>
                  </div>
                </div>
                <Badge variant={location.type === 'CORPORATE' ? 'primary' : 'secondary'}>
                  {location.type}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Storage: {location.storage.types.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>From ${location.pricing.baseRates.basePrice}/{location.pricing.baseRates.billingCycle.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{location.policies.accessHours}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Capacity: {location.storage.totalCapacity} units</span>
                  <span>Available: {location.storage.availableCapacity} units</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderUnitSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep('location')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Locations
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Select Storage Unit</h1>
          <p className="text-gray-600">
            {locations.find(l => l.id === selectedLocation)?.name}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            <div className="flex gap-2">
              {(['ALL', 'POD', 'LOCKER', 'CONTAINER'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type === 'ALL' ? 'All Types' : type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableUnits.map((unit) => (
          <Card
            key={unit.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg"
            onClick={() => handleUnitSelect(unit)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${getUnitColor(unit.status)}`}>
                  {getUnitIcon(unit.type)}
                </div>
                <Badge variant="success">Available</Badge>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{unit.type} Unit</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{unit.size.width}' × {unit.size.length}' × {unit.size.height}'</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">${unit.pricing.basePrice}/{unit.pricing.billingCycle.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>{unit.features.length} features</span>
                </div>
              </div>

              {unit.features.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {unit.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {unit.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{unit.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {availableUnits.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Available Units</h3>
          <p className="text-gray-500">
            No storage units match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep('unit')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Units
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600">Complete your storage booking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Unit Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Selected Unit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUnit && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl ${getUnitColor(selectedUnit.status)}`}>
                    {getUnitIcon(selectedUnit.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedUnit.type} Unit</h3>
                    <p className="text-sm text-gray-600">
                      {selectedUnit.size.width}' × {selectedUnit.size.length}' × {selectedUnit.size.height}'
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ${selectedUnit.pricing.basePrice}/{selectedUnit.pricing.billingCycle.toLowerCase()}
                    </p>
                  </div>
                </div>

                {selectedUnit.features.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUnit.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={bookingData.customerInfo.name}
              onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={bookingData.customerInfo.email}
              onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="416-555-0123"
              value={bookingData.customerInfo.phone}
              onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
              required
            />
            <Input
              label="Address"
              placeholder="123 Main St, Toronto, ON"
              value={bookingData.customerInfo.address}
              onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
              required
            />
          </CardContent>
        </Card>
      </div>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={bookingData.bookingDetails.startDate}
              onChange={(e) => handleBookingDetailsChange('startDate', e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={bookingData.bookingDetails.endDate}
              onChange={(e) => handleBookingDetailsChange('endDate', e.target.value)}
              required
            />
            <Input
              label="Duration (months)"
              type="number"
              placeholder="1"
              value={bookingData.bookingDetails.duration}
              onChange={(e) => handleBookingDetailsChange('duration', parseInt(e.target.value))}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any special requirements or notes..."
                value={bookingData.bookingDetails.specialRequirements}
                onChange={(e) => handleBookingDetailsChange('specialRequirements', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Cost</h3>
              <p className="text-gray-600">
                {bookingData.bookingDetails.duration} month(s) × ${selectedUnit?.pricing.basePrice}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                ${calculateTotalCost()}
              </p>
              <p className="text-sm text-gray-600">CAD</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setCurrentStep('payment')}
          disabled={!bookingData.customerInfo.name || !bookingData.customerInfo.email}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep('details')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Details
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Information</h1>
          <p className="text-gray-600">Secure payment processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={bookingData.paymentInfo.cardNumber}
              onChange={(e) => handlePaymentInfoChange('cardNumber', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={bookingData.paymentInfo.expiryDate}
                onChange={(e) => handlePaymentInfoChange('expiryDate', e.target.value)}
                required
              />
              <Input
                label="CVV"
                placeholder="123"
                value={bookingData.paymentInfo.cvv}
                onChange={(e) => handlePaymentInfoChange('cvv', e.target.value)}
                required
              />
            </div>
            <Input
              label="Cardholder Name"
              placeholder="John Doe"
              value={bookingData.paymentInfo.cardholderName}
              onChange={(e) => handlePaymentInfoChange('cardholderName', e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Storage Unit</span>
                <span className="font-medium">{selectedUnit?.type} Unit</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Duration</span>
                <span className="font-medium">{bookingData.bookingDetails.duration} month(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unit Price</span>
                <span className="font-medium">${selectedUnit?.pricing.basePrice}/month</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-green-600">${calculateTotalCost()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleBookingSubmit}
          loading={isCreating}
          disabled={!bookingData.paymentInfo.cardNumber || !bookingData.paymentInfo.cardholderName}
        >
          Complete Booking
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your storage unit has been successfully booked. You will receive a confirmation email shortly.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Unit:</span>
              <span>{selectedUnit?.type} Unit</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span>{locations.find(l => l.id === selectedLocation)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{bookingData.bookingDetails.duration} month(s)</span>
            </div>
            <div className="flex justify-between">
              <span>Total Cost:</span>
              <span className="font-semibold">${calculateTotalCost()}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Check your email for access instructions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Visit the location during business hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Bring valid ID for verification</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-x-4">
        <Button
          variant="primary"
          onClick={() => window.location.href = '/storage'}
        >
          Back to Storage
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
        >
          Print Receipt
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentStep === 'location' && renderLocationSelection()}
        {currentStep === 'unit' && renderUnitSelection()}
        {currentStep === 'details' && renderBookingDetails()}
        {currentStep === 'payment' && renderPayment()}
        {currentStep === 'confirmation' && renderConfirmation()}
      </div>
    </div>
  );
} 