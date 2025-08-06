'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { 
  Clock,
  MapPin,
  Users,
  Camera,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Navigation,
  Truck,
  User,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TimelineEvent {
  id: string
  journeyId: string
  type: 'STATUS_CHANGE' | 'CREW_ACTIVITY' | 'MEDIA_UPLOAD' | 'GPS_UPDATE' | 'NOTE' | 'SYSTEM'
  timestamp: string
  title: string
  description: string
  userId?: string
  userName?: string
  userRole?: string
  metadata?: {
    status?: string
    location?: {
      lat: number
      lng: number
      address: string
    }
    media?: {
      type: string
      url: string
      filename: string
    }
    crew?: {
      action: string
      members: string[]
    }
  }
}

interface JourneyTimelineProps {
  journeyId: string
  onEventClick?: (event: TimelineEvent) => void
  showFilters?: boolean
}

export default function JourneyTimeline({
  journeyId,
  onEventClick,
  showFilters = true
}: JourneyTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTimelineEvents()
  }, [journeyId])

  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter(event => activeFilters.includes(event.type)))
    }
  }, [events, activeFilters])

  const loadTimelineEvents = async () => {
    try {
      setIsLoading(true)
      
      // TODO: Replace with API call
      setEvents([])
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load timeline events:', error)
      setIsLoading(false)
    }
  }

  const handleFilterToggle = (filterType: string) => {
    setActiveFilters(prev => 
      prev.includes(filterType)
        ? prev.filter(f => f !== filterType)
        : [...prev, filterType]
    )
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return <Play className="w-4 h-4" />
      case 'CREW_ACTIVITY':
        return <Users className="w-4 h-4" />
      case 'MEDIA_UPLOAD':
        return <Camera className="w-4 h-4" />
      case 'GPS_UPDATE':
        return <MapPin className="w-4 h-4" />
      case 'NOTE':
        return <FileText className="w-4 h-4" />
      case 'SYSTEM':
        return <Truck className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return 'primary'
      case 'CREW_ACTIVITY':
        return 'secondary'
      case 'MEDIA_UPLOAD':
        return 'info'
      case 'GPS_UPDATE':
        return 'success'
      case 'NOTE':
        return 'warning'
      case 'SYSTEM':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MORNING_PREP':
        return 'warning'
      case 'EN_ROUTE':
        return 'info'
      case 'ONSITE':
        return 'secondary'
      case 'COMPLETED':
        return 'success'
      case 'AUDITED':
        return 'default'
      default:
        return 'default'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffMs = now.getTime() - eventTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-4 h-4 bg-surface rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface rounded w-3/4"></div>
                  <div className="h-3 bg-surface rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'STATUS_CHANGE', label: 'Status Changes', icon: Play },
                { type: 'CREW_ACTIVITY', label: 'Crew Activities', icon: Users },
                { type: 'MEDIA_UPLOAD', label: 'Media Uploads', icon: Camera },
                { type: 'GPS_UPDATE', label: 'GPS Updates', icon: MapPin },
                { type: 'NOTE', label: 'Notes', icon: FileText },
                { type: 'SYSTEM', label: 'System Events', icon: Truck }
              ].map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant={activeFilters.includes(type) ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleFilterToggle(type)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
                <p className="text-text-secondary">No timeline events found</p>
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`flex space-x-4 ${
                    onEventClick ? 'cursor-pointer hover:bg-surface/50 rounded-lg p-2 -m-2' : ''
                  }`}
                  onClick={() => onEventClick?.(event)}
                >
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${getEventColor(event.type)} text-white`}>
                      {getEventIcon(event.type)}
                    </div>
                    {index < filteredEvents.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-2"></div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-text-primary">{event.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-text-secondary">
                          {formatTime(event.timestamp)}
                        </span>
                        <Badge variant={getEventColor(event.type)} className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary">{event.description}</p>

                    {/* User Info */}
                    {event.userName && (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {event.userName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text-primary">{event.userName}</p>
                          <p className="text-xs text-text-secondary">{event.userRole}</p>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {event.metadata && (
                      <div className="space-y-2">
                        {/* Status */}
                        {event.metadata.status && (
                          <Badge variant={getStatusColor(event.metadata.status)} className="text-xs">
                            {event.metadata.status.replace('_', ' ')}
                          </Badge>
                        )}

                        {/* Location */}
                        {event.metadata.location && (
                          <div className="flex items-center space-x-2 text-xs text-text-secondary">
                            <MapPin className="w-3 h-3" />
                            <span>{event.metadata.location.address}</span>
                          </div>
                        )}

                        {/* Media */}
                        {event.metadata.media && (
                          <div className="flex items-center space-x-2 text-xs text-text-secondary">
                            {event.metadata.media.type === 'PHOTO' && <Camera className="w-3 h-3" />}
                            {event.metadata.media.type === 'VIDEO' && <FileText className="w-3 h-3" />}
                            {event.metadata.media.type === 'SIGNATURE' && <Shield className="w-3 h-3" />}
                            <span>{event.metadata.media.filename}</span>
                          </div>
                        )}

                        {/* Crew */}
                        {event.metadata.crew && (
                          <div className="flex items-center space-x-2 text-xs text-text-secondary">
                            <Users className="w-3 h-3" />
                            <span>{event.metadata.crew.members.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Time Ago */}
                    <p className="text-xs text-text-secondary">
                      {getTimeAgo(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 