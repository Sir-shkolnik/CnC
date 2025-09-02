'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { 
  Truck, 
  Calendar, 
  MapPin, 
  Users, 
  Save, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface CreateJourneyForm {
  date: string;
  truckNumber: string;
  locationId: string;
  driverId: string;
  moverId: string;
  estimatedStartTime: string;
  estimatedEndTime: string;
  notes: string;
}

export default function CreateJourneyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateJourneyForm>({
    date: new Date().toISOString().split('T')[0],
    truckNumber: '',
    locationId: '',
    driverId: '',
    moverId: '',
    estimatedStartTime: '08:00',
    estimatedEndTime: '17:00',
    notes: ''
  });

  const handleInputChange = (field: keyof CreateJourneyForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/journey/${result.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create journey');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.date && 
           formData.truckNumber && 
           formData.locationId && 
           formData.driverId && 
           formData.moverId;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Journey</h1>
          <p className="text-gray-600">Set up a new truck journey for your crew</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Journey Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Truck */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Journey Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="truckNumber">Truck Number</Label>
                <Input
                  id="truckNumber"
                  placeholder="e.g., T-001"
                  value={formData.truckNumber}
                  onChange={(e) => handleInputChange('truckNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                value={formData.locationId}
                onChange={(e) => handleInputChange('locationId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a location</option>
                <option value="loc-001">Toronto Main Office</option>
                <option value="loc-002">Mississauga Branch</option>
                <option value="loc-003">Brampton Branch</option>
              </select>
            </div>

            {/* Crew Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverId">Driver</Label>
                <select
                  id="driverId"
                  value={formData.driverId}
                  onChange={(e) => handleInputChange('driverId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a driver</option>
                  <option value="user-001">John Smith (Driver)</option>
                  <option value="user-002">Mike Johnson (Driver)</option>
                  <option value="user-003">Sarah Wilson (Driver)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moverId">Mover</Label>
                <select
                  id="moverId"
                  value={formData.moverId}
                  onChange={(e) => handleInputChange('moverId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a mover</option>
                  <option value="user-004">Alex Brown (Mover)</option>
                  <option value="user-005">Chris Davis (Mover)</option>
                  <option value="user-006">Emma Taylor (Mover)</option>
                </select>
              </div>
            </div>

            {/* Time Estimates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedStartTime">Estimated Start Time</Label>
                <Input
                  id="estimatedStartTime"
                  type="time"
                  value={formData.estimatedStartTime}
                  onChange={(e) => handleInputChange('estimatedStartTime', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedEndTime">Estimated End Time</Label>
                <Input
                  id="estimatedEndTime"
                  type="time"
                  value={formData.estimatedEndTime}
                  onChange={(e) => handleInputChange('estimatedEndTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Any special instructions or notes for this journey..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!isFormValid() || loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Journey
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 