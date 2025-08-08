'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Input } from '@/components/atoms/Input'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Truck,
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Filter,
  Search,
  ArrowLeft,
  User,
  Phone,
  Mail
} from 'lucide-react'
import { useAuthStore, useUser } from '@/stores/authStore'
import { useJourneyStore } from '@/stores/journeyStore'
import toast from 'react-hot-toast'

interface CalendarJourney {
  id: string
  date: string
  status: 'MORNING_PREP' | 'EN_ROUTE' | 'ONSITE' | 'COMPLETED' | 'AUDITED'
  truckNumber: string
  startTime: string
  endTime?: string
  notes?: string
  location: {
    name: string
    address: string
  }
  client: {
    name: string
  }
  assignedCrew: {
    user: {
      name: string
      role: string
    }
  }[]
  capacity: {
    used: number
    total: number
  }
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  journeys: CalendarJourney[]
}

export default function CalendarPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { fetchJourneys } = useJourneyStore()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadCalendarData()
  }, [isAuthenticated, router, currentDate, viewMode])

  const loadCalendarData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch real journey data from API
      const token = localStorage.getItem('auth-token') || document.cookie.split('auth-token=')[1]?.split(';')[0];
      if (!token) {
        console.log('No authentication token found for calendar data');
        generateCalendarDays([]);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/journey/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const realJourneys: CalendarJourney[] = (data.data || []).map((journey: any) => ({
          id: journey.id,
          date: journey.date?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: journey.status,
          truckNumber: journey.truckNumber || `T-${journey.id}`,
          startTime: journey.startTime?.split('T')[1]?.substring(0, 5) || '08:00',
          endTime: journey.endTime?.split('T')[1]?.substring(0, 5),
          notes: journey.notes || 'Real LGM journey',
          location: {
            name: journey.locationName || 'LGM Location',
            address: journey.locationAddress || 'LGM Address'
          },
          client: {
            name: 'Lets Get Moving'
          },
          assignedCrew: journey.assignedCrew || [],
          capacity: { used: 0, total: 3 }
        }));
        
        console.log(`Loaded ${realJourneys.length} real journeys for calendar`);
        generateCalendarDays(realJourneys);
      } else {
        console.log('No real journey data available yet');
        generateCalendarDays([]);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setIsLoading(false)
    }
  }

  const generateCalendarDays = (journeys: CalendarJourney[]) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days: CalendarDay[] = []
    const currentDateObj = new Date()
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayJourneys = journeys.filter(j => j.date === dateStr)
      
      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === month,
        isToday: d.toDateString() === currentDateObj.toDateString(),
        journeys: dayJourneys
      })
    }
    
    setCalendarDays(days)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return 'warning'
      case 'EN_ROUTE': return 'info'
      case 'ONSITE': return 'secondary'
      case 'COMPLETED': return 'success'
      case 'AUDITED': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return '🕐 Prep'
      case 'EN_ROUTE': return '🚛 Route'
      case 'ONSITE': return '📍 Site'
      case 'COMPLETED': return '✅ Done'
      case 'AUDITED': return '📋 Audit'
      default: return status
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (time: string) => {
    return time
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleCreateJourney = () => {
    router.push('/journeys')
    toast('Navigate to journeys page to create new journey')
  }

  const handleJourneyClick = (journeyId: string) => {
    router.push(`/journey/${journeyId}`)
  }

  const filteredDays = calendarDays.map(day => ({
    ...day,
    journeys: day.journeys.filter(journey => {
      const matchesSearch = 
        journey.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journey.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journey.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || journey.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-32 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Calendar</h1>
              <p className="text-text-secondary">Journey scheduling and capacity management</p>
            </div>
          </div>
          <Button onClick={handleCreateJourney}>
            <Plus className="w-4 h-4 mr-2" />
            New Journey
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-text-primary">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <Button variant="ghost" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search journeys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              leftIcon={<Search className="w-4 h-4" />}
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
            >
              <option value="all">All Status</option>
              <option value="MORNING_PREP">Morning Prep</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="ONSITE">On Site</option>
              <option value="COMPLETED">Completed</option>
              <option value="AUDITED">Audited</option>
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-surface border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center font-medium text-text-secondary">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {filteredDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-32 border-r border-b border-border p-2 ${
                  !day.isCurrentMonth ? 'bg-background/50' : 'bg-surface'
                } ${day.isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      day.isCurrentMonth ? 'text-text-primary' : 'text-text-secondary'
                    } ${day.isToday ? 'text-primary' : ''}`}
                  >
                    {day.date.getDate()}
                  </span>
                  {day.journeys.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {day.journeys.length}
                    </Badge>
                  )}
                </div>

                {/* Journeys */}
                <div className="space-y-1">
                  {day.journeys.slice(0, 3).map((journey) => (
                    <div
                      key={journey.id}
                      className="p-2 bg-background rounded cursor-pointer hover:bg-surface transition-colors"
                      onClick={() => handleJourneyClick(journey.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={getStatusColor(journey.status)} className="text-xs">
                          {getStatusText(journey.status)}
                        </Badge>
                        <span className="text-xs text-text-secondary">
                          {formatTime(journey.startTime)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-text-primary truncate">
                        {journey.truckNumber}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {journey.location.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-text-secondary" />
                          <span className="text-xs text-text-secondary">
                            {journey.capacity.used}/{journey.capacity.total}
                          </span>
                        </div>
                        {journey.capacity.used === journey.capacity.total && (
                          <AlertTriangle className="w-3 h-3 text-warning" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {day.journeys.length > 3 && (
                    <div className="text-xs text-text-secondary text-center py-1">
                      +{day.journeys.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Overview */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Capacity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-text-secondary">Total Trucks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">8</div>
                  <div className="text-sm text-text-secondary">Available Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">4</div>
                  <div className="text-sm text-text-secondary">At Capacity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="warning">🕐 Prep</Badge>
                  <span className="text-sm text-text-secondary">Morning Preparation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">🚛 Route</Badge>
                  <span className="text-sm text-text-secondary">En Route</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">📍 Site</Badge>
                  <span className="text-sm text-text-secondary">On Site</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success">✅ Done</Badge>
                  <span className="text-sm text-text-secondary">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">📋 Audit</Badge>
                  <span className="text-sm text-text-secondary">Audited</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 