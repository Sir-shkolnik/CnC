'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { Badge } from '@/components/atoms/Badge'
import { 
  Truck,
  Users,
  Calendar,
  MapPin,
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

interface JourneyFormData {
  date: string
  truckNumber?: string
  moveSourceId?: string
  notes?: string
  crewIds: string[]
  locationId: string
}

interface CrewMember {
  id: string
  name: string
  email: string
  role: 'DRIVER' | 'MOVER' | 'DISPATCHER' | 'ADMIN'
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE'
  location: {
    id: string
    name: string
  }
}

interface Location {
  id: string
  name: string
  address: string
  client: {
    id: string
    name: string
  }
}

interface JourneyFormProps {
  mode: 'create' | 'edit'
  journeyId?: string
  initialData?: Partial<JourneyFormData>
  onSave: (journey: JourneyFormData) => Promise<void>
  onCancel: () => void
}

export default function JourneyForm({ 
  mode, 
  journeyId, 
  initialData, 
  onSave, 
  onCancel 
}: JourneyFormProps) {
  const [formData, setFormData] = useState<JourneyFormData>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    truckNumber: initialData?.truckNumber || '',
    moveSourceId: initialData?.moveSourceId || '',
    notes: initialData?.notes || '',
    crewIds: initialData?.crewIds || [],
    locationId: initialData?.locationId || ''
  })

  const [availableCrew, setAvailableCrew] = useState<CrewMember[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCrew, setSelectedCrew] = useState<CrewMember[]>([])

  // Load available crew and locations
  useEffect(() => {
    loadAvailableCrew()
    loadLocations()
  }, [])

  // Update selected crew when crewIds change
  useEffect(() => {
    const crew = availableCrew.filter(c => formData.crewIds.includes(c.id))
    setSelectedCrew(crew)
  }, [formData.crewIds, availableCrew])

  const loadAvailableCrew = async () => {
    try {
      // TODO: Replace with API call
      setAvailableCrew([])
    } catch (error) {
      console.error('Failed to load crew:', error)
      toast.error('Failed to load available crew')
    }
  }

  const loadLocations = async () => {
    try {
      // TODO: Replace with API call
      setLocations([])
    } catch (error) {
      console.error('Failed to load locations:', error)
      toast.error('Failed to load locations')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.locationId) {
      newErrors.locationId = 'Location is required'
    }

    if (formData.crewIds.length === 0) {
      newErrors.crew = 'At least one crew member is required'
    }

    // Check if we have at least one driver
    const hasDriver = selectedCrew.some(crew => crew.role === 'DRIVER')
    if (!hasDriver) {
      newErrors.crew = 'At least one driver is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    setIsLoading(true)
    try {
      await onSave(formData)
      toast.success(`Journey ${mode === 'create' ? 'created' : 'updated'} successfully`)
    } catch (error) {
      console.error('Failed to save journey:', error)
      toast.error(`Failed to ${mode} journey`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCrewToggle = (crewId: string) => {
    setFormData(prev => ({
      ...prev,
      crewIds: prev.crewIds.includes(crewId)
        ? prev.crewIds.filter(id => id !== crewId)
        : [...prev.crewIds, crewId]
    }))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DRIVER': return 'primary'
      case 'MOVER': return 'secondary'
      case 'DISPATCHER': return 'info'
      case 'ADMIN': return 'warning'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success'
      case 'ASSIGNED': return 'warning'
      case 'ON_LEAVE': return 'error'
      default: return 'default'
    }
  }

  const availableCrewForLocation = availableCrew.filter(crew => 
    crew.status === 'AVAILABLE' && 
    crew.location.id === formData.locationId
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            {mode === 'create' ? 'Create New Journey' : 'Edit Journey'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={`mt-1 ${errors.date ? 'border-error' : ''}`}
                  required
                />
                {errors.date && <p className="text-sm text-error mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">Truck Number</label>
                <Input
                  value={formData.truckNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, truckNumber: e.target.value }))}
                  placeholder="e.g., TRUCK-001"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">Move Source ID</label>
                <Input
                  value={formData.moveSourceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, moveSourceId: e.target.value }))}
                  placeholder="e.g., MS-001"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">Location *</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                  className={`w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary ${errors.locationId ? 'border-error' : ''}`}
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.client.name}
                    </option>
                  ))}
                </select>
                {errors.locationId && <p className="text-sm text-error mt-1">{errors.locationId}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-text-secondary">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add journey notes, special instructions, or requirements..."
                className="w-full mt-1 p-3 bg-surface border border-border rounded-lg text-text-primary resize-none h-24"
              />
            </div>

            {/* Crew Assignment */}
            <div>
              <label className="text-sm font-medium text-text-secondary">Crew Assignment *</label>
              {formData.locationId ? (
                <div className="mt-2 space-y-3">
                  {availableCrewForLocation.length === 0 ? (
                    <div className="text-center py-4 text-text-secondary">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p>No available crew for this location</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableCrewForLocation.map((crew) => (
                        <div
                          key={crew.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.crewIds.includes(crew.id)
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleCrewToggle(crew.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {crew.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">{crew.name}</p>
                                <p className="text-sm text-text-secondary">{crew.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getRoleColor(crew.role)}>
                                {crew.role}
                              </Badge>
                              {formData.crewIds.includes(crew.id) && (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.crew && <p className="text-sm text-error mt-1">{errors.crew}</p>}
                </div>
              ) : (
                <p className="text-sm text-text-secondary mt-1">Select a location to see available crew</p>
              )}
            </div>

            {/* Selected Crew Summary */}
            {selectedCrew.length > 0 && (
              <div className="bg-surface rounded-lg p-4">
                <h3 className="font-medium text-text-primary mb-3">Selected Crew ({selectedCrew.length})</h3>
                <div className="space-y-2">
                  {selectedCrew.map((crew) => (
                    <div key={crew.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-primary">{crew.name}</span>
                        <Badge variant={getRoleColor(crew.role)} className="text-xs">
                          {crew.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCrewToggle(crew.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
              <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Journey' : 'Update Journey'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 