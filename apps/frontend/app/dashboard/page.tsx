'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Input } from '@/components/atoms/Input'
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  DollarSign,
  Target,
  Smartphone
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useJourneyStore } from '@/stores/journeyStore'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { journeys, isLoading, fetchJourneys, clearMockData } = useJourneyStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Check authentication on mount and fetch journeys
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    // Clear any mock data first
    clearMockData()
    
    // Fetch real journey data from API
    fetchJourneys()
  }, [isAuthenticated, router, fetchJourneys, clearMockData])

  // Filter journeys based on search and status
  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = 
      journey.truckNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journey.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || journey.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: journeys.length,
    active: journeys.filter(j => j.status === 'MORNING_PREP' || j.status === 'EN_ROUTE' || j.status === 'ONSITE').length,
    completed: journeys.filter(j => j.status === 'COMPLETED').length,
    onTime: journeys.filter(j => j.status === 'COMPLETED').length, // TODO: Calculate from actual data
    revenue: 0 // TODO: Calculate from actual revenue data
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
      case 'MORNING_PREP': return '🕐 Morning Prep'
      case 'EN_ROUTE': return '🚛 En Route'
      case 'ONSITE': return '📍 On Site'
      case 'COMPLETED': return '✅ Completed'
      case 'AUDITED': return '📋 Audited'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleJourneyAction = (journeyId: string, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/journey/${journeyId}`)
        break
      case 'edit':
        router.push(`/journey/${journeyId}/edit`)
        break
      case 'delete':
        toast('Delete functionality coming soon!')
        break
      default:
        break
    }
  }

  const handleCreateJourney = () => {
    router.push('/journey/create')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Page Header - Compact Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary mb-1">Dashboard</h1>
          <p className="text-text-secondary text-sm">
            Welcome back, {user?.name || 'User'}! Here's your operations overview.
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="secondary" size="sm" className="h-8">
            <BarChart3 className="w-4 h-4 mr-1" />
            Reports
          </Button>
          <Button onClick={handleCreateJourney} size="sm" className="h-8">
            <Plus className="w-4 h-4 mr-1" />
            New Journey
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Compact Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Truck className="w-4 h-4 text-primary" />
              <p className="text-lg font-bold text-text-primary">{stats.total}</p>
            </div>
            <p className="text-xs text-text-secondary">Total Journeys</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-warning" />
              <p className="text-lg font-bold text-text-primary">{stats.active}</p>
            </div>
            <p className="text-xs text-text-secondary">Active</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <p className="text-lg font-bold text-text-primary">{stats.completed}</p>
            </div>
            <p className="text-xs text-text-secondary">Completed</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-info" />
              <p className="text-lg font-bold text-text-primary">${stats.revenue.toLocaleString()}</p>
            </div>
            <p className="text-xs text-text-secondary">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Compact Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/journeys')}>
          <CardContent className="p-3 text-center">
            <Truck className="w-6 h-6 text-primary mx-auto mb-1" />
            <h3 className="font-semibold text-text-primary mb-1 text-sm">View All Journeys</h3>
            <p className="text-xs text-text-secondary">Manage and track all operations</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/crew')}>
          <CardContent className="p-3 text-center">
            <Users className="w-6 h-6 text-secondary mx-auto mb-1" />
            <h3 className="font-semibold text-text-primary mb-1 text-sm">Crew Management</h3>
            <p className="text-xs text-text-secondary">Assign and manage teams</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/calendar')}>
          <CardContent className="p-3 text-center">
            <Calendar className="w-6 h-6 text-success mx-auto mb-1" />
            <h3 className="font-semibold text-text-primary mb-1 text-sm">Calendar View</h3>
            <p className="text-xs text-text-secondary">Schedule and planning</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/audit')}>
          <CardContent className="p-3 text-center">
            <Target className="w-6 h-6 text-warning mx-auto mb-1" />
            <h3 className="font-semibold text-text-primary mb-1 text-sm">Audit & Reports</h3>
            <p className="text-xs text-text-secondary">Compliance and analytics</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/mobile')}>
          <CardContent className="p-3 text-center">
            <Smartphone className="w-6 h-6 text-info mx-auto mb-1" />
            <h3 className="font-semibold text-text-primary mb-1 text-sm">Field Operations</h3>
            <p className="text-xs text-text-secondary">Mobile app for drivers & movers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Compact Layout */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <Input
                placeholder="Search journeys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <select
              className="px-2 py-1 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm h-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="MORNING_PREP">Morning Prep</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="ONSITE">On Site</option>
              <option value="COMPLETED">Completed</option>
              <option value="AUDITED">Audited</option>
            </select>
            <Button 
              variant="secondary" 
              size="sm"
              className="h-8"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
            >
              <Filter className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Journeys - Compact Layout */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Truck className="w-4 h-4 mr-2 text-primary" />
            Recent Journeys ({filteredJourneys.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-12 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredJourneys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-secondary">Journey</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-secondary">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-secondary">Date</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-secondary">Crew</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-secondary">Location</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJourneys.slice(0, 8).map((journey) => (
                    <tr key={journey.id} className="border-b border-gray-700 hover:bg-surface/50 transition-colors">
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium text-text-primary text-sm">{journey.truckNumber || 'Unassigned'}</p>
                          <p className="text-xs text-text-secondary">ID: {journey.id}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={getStatusColor(journey.status)} className="text-xs">
                          {getStatusText(journey.status)}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-text-primary text-sm">
                        {formatDate(journey.date)}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-text-secondary" />
                          <span className="text-xs text-text-secondary">2 crew</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-text-secondary" />
                          <span className="text-xs text-text-secondary">Location {journey.id}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleJourneyAction(journey.id, 'view')}
                            title="View Journey"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleJourneyAction(journey.id, 'edit')}
                            title="Edit Journey"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No journeys found</h3>
              <p className="text-text-secondary mb-4 text-sm max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating your first journey.'
                }
              </p>
              <Button onClick={handleCreateJourney} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create Journey
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 