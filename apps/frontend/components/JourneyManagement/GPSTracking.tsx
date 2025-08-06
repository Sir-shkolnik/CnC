'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { 
  MapPin,
  Navigation,
  Clock,
  Gauge,
  Compass,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Share,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface GPSLocation {
  id: string
  journeyId: string
  userId: string
  timestamp: string
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  heading?: number
  altitude?: number
  address?: string
}

interface RoutePoint {
  latitude: number
  longitude: number
  timestamp: string
  speed?: number
}

interface GPSTrackingProps {
  journeyId: string
  currentUserId: string
  onLocationUpdate?: (location: GPSLocation) => void
  isTracking?: boolean
  onTrackingToggle?: (isTracking: boolean) => void
}

export default function GPSTracking({
  journeyId,
  currentUserId,
  onLocationUpdate,
  isTracking = false,
  onTrackingToggle
}: GPSTrackingProps) {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null)
  const [locationHistory, setLocationHistory] = useState<GPSLocation[]>([])
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Load location history on mount
  useEffect(() => {
    loadLocationHistory()
  }, [journeyId])

  // Start/stop tracking based on isTracking prop
  useEffect(() => {
    if (isTracking) {
      startTracking()
    } else {
      stopTracking()
    }

    return () => {
      stopTracking()
    }
  }, [isTracking])

  const loadLocationHistory = async () => {
    try {
      // TODO: Replace with API call
      setLocationHistory([])
      setRoutePoints([])
    } catch (error) {
      console.error('Failed to load location history:', error)
      toast.error('Failed to load location history')
    }
  }

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      )
    })
  }

  const startTracking = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get initial location
      const position = await getCurrentLocation()
      const location: GPSLocation = {
        id: `loc_${Date.now()}`,
        journeyId,
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || 0,
        heading: position.coords.heading || 0,
        altitude: position.coords.altitude || 0
      }

      setCurrentLocation(location)
      setLastUpdate(new Date())
      onLocationUpdate?.(location)

      // Start continuous tracking
      const interval = setInterval(async () => {
        try {
          const position = await getCurrentLocation()
          const newLocation: GPSLocation = {
            id: `loc_${Date.now()}`,
            journeyId,
            userId: currentUserId,
            timestamp: new Date().toISOString(),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            altitude: position.coords.altitude || 0
          }

          setCurrentLocation(newLocation)
          setLocationHistory(prev => [...prev, newLocation])
          setRoutePoints(prev => [...prev, {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            timestamp: newLocation.timestamp,
            speed: newLocation.speed
          }])
          setLastUpdate(new Date())
          onLocationUpdate?.(newLocation)
        } catch (error) {
          console.error('Failed to get location update:', error)
          setError('Failed to get location update')
        }
      }, 30000) // Update every 30 seconds

      setTrackingInterval(interval)
      toast.success('GPS tracking started')
    } catch (error) {
      console.error('Failed to start GPS tracking:', error)
      setError('Failed to start GPS tracking')
      toast.error('Failed to start GPS tracking')
    } finally {
      setIsLoading(false)
    }
  }

  const stopTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval)
      setTrackingInterval(null)
    }
    toast.success('GPS tracking stopped')
  }

  const handleTrackingToggle = () => {
    const newTrackingState = !isTracking
    onTrackingToggle?.(newTrackingState)
  }

  const handleRefreshLocation = async () => {
    try {
      setIsLoading(true)
      const position = await getCurrentLocation()
      const location: GPSLocation = {
        id: `loc_${Date.now()}`,
        journeyId,
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || 0,
        heading: position.coords.heading || 0,
        altitude: position.coords.altitude || 0
      }

      setCurrentLocation(location)
      setLastUpdate(new Date())
      onLocationUpdate?.(location)
      toast.success('Location refreshed')
    } catch (error) {
      console.error('Failed to refresh location:', error)
      toast.error('Failed to refresh location')
    } finally {
      setIsLoading(false)
    }
  }

  const exportLocationData = () => {
    const data = {
      journeyId,
      locations: locationHistory,
      route: routePoints,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journey-${journeyId}-gps-data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Location data exported')
  }

  const shareLocation = () => {
    if (currentLocation) {
      const url = `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`
      navigator.clipboard.writeText(url)
      toast.success('Location link copied to clipboard')
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatSpeed = (speed: number) => {
    return `${Math.round(speed * 2.237)} mph` // Convert m/s to mph
  }

  const formatDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return `${distance.toFixed(2)} km`
  }

  const calculateTotalDistance = () => {
    if (routePoints.length < 2) return 0
    
    let totalDistance = 0
    for (let i = 1; i < routePoints.length; i++) {
      const prev = routePoints[i - 1]
      const curr = routePoints[i]
      totalDistance += parseFloat(formatDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude))
    }
    return totalDistance
  }

  return (
    <div className="space-y-6">
      {/* Current Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Current Location
            </div>
            <div className="flex items-center space-x-2">
              {currentLocation && (
                <Badge variant="success" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
              {error && (
                <Badge variant="error" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentLocation ? (
            <div className="space-y-4">
              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Latitude</label>
                  <p className="text-lg font-mono text-text-primary">
                    {currentLocation.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Longitude</label>
                  <p className="text-lg font-mono text-text-primary">
                    {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Speed and Heading */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-text-secondary" />
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Speed</label>
                    <p className="text-text-primary">{formatSpeed(currentLocation.speed || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-text-secondary" />
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Heading</label>
                    <p className="text-text-primary">{currentLocation.heading || 0}°</p>
                  </div>
                </div>
              </div>

              {/* Accuracy and Altitude */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Accuracy</label>
                  <p className="text-text-primary">±{currentLocation.accuracy || 0}m</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Altitude</label>
                  <p className="text-text-primary">{currentLocation.altitude || 0}m</p>
                </div>
              </div>

              {/* Last Update */}
              {lastUpdate && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Address */}
              {currentLocation.address && (
                <div>
                  <label className="text-sm font-medium text-text-secondary">Address</label>
                  <p className="text-text-primary">{currentLocation.address}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
              <p className="text-text-secondary">No location data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleTrackingToggle}
                disabled={isLoading}
                variant={isTracking ? 'danger' : 'primary'}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Tracking
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleRefreshLocation}
                disabled={isLoading}
                variant="secondary"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={shareLocation}
                disabled={!currentLocation}
                variant="ghost"
                size="sm"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={exportLocationData}
                disabled={locationHistory.length === 0}
                variant="ghost"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location History */}
      <Card>
        <CardHeader>
          <CardTitle>Location History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-text-secondary">Total Points:</span>
                  <span className="ml-2 font-medium text-text-primary">{locationHistory.length}</span>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Total Distance:</span>
                  <span className="ml-2 font-medium text-text-primary">
                    {calculateTotalDistance().toFixed(2)} km
                  </span>
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {locationHistory.slice(-10).reverse().map((location) => (
                <div key={location.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatTime(location.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {location.speed && location.speed > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {formatSpeed(location.speed)}
                      </Badge>
                    )}
                    <span className="text-xs text-text-secondary">
                      ±{location.accuracy || 0}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-error">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-error">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 