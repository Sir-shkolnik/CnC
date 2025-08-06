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
  Target
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useJourneyStore } from '@/stores/journeyStore'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { journeys, isLoading } = useJourneyStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, router])

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
    onTime: journeys.filter(j => j.status === 'COMPLETED').length, // Simplified for demo
    revenue: journeys.filter(j => j.status === 'COMPLETED').length * 250 // Mock calculation
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
    <div className="space-y-6">
      {/* Page Header - Improved Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
          <p className="text-text-secondary text-sm">
            Welcome back, {user?.name || 'User'}! Here's your operations overview.
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="secondary" size="sm" className="h-9">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button onClick={handleCreateJourney} size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-2" />
            New Journey
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Improved Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Truck className="w-5 h-5 text-primary" />
              <p className="text-xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <p className="text-xs text-text-secondary">Total Journeys</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              <p className="text-xl font-bold text-text-primary">{stats.active}</p>
            </div>
            <p className="text-xs text-text-secondary">Active</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="text-xl font-bold text-text-primary">{stats.completed}</p>
            </div>
            <p className="text-xs text-text-secondary">Completed</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-info" />
              <p className="text-xl font-bold text-text-primary">${stats.revenue.toLocaleString()}</p>
            </div>
            <p className="text-xs text-text-secondary">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - New Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/journeys')}>
          <CardContent className="p-4 text-center">
            <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-text-primary mb-1">View All Journeys</h3>
            <p className="text-xs text-text-secondary">Manage and track all operations</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/crew')}>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
            <h3 className="font-semibold text-text-primary mb-1">Crew Management</h3>
            <p className="text-xs text-text-secondary">Assign and manage teams</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/calendar')}>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-success mx-auto mb-2" />
            <h3 className="font-semibold text-text-primary mb-1">Calendar View</h3>
            <p className="text-xs text-text-secondary">Schedule and planning</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/audit')}>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-warning mx-auto mb-2" />
            <h3 className="font-semibold text-text-primary mb-1">Audit & Reports</h3>
            <p className="text-xs text-text-secondary">Compliance and analytics</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Improved Layout */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <Input
                placeholder="Search journeys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
              className="h-10"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Journeys - Improved Layout */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Truck className="w-5 h-5 mr-2 text-primary" />
            Recent Journeys ({filteredJourneys.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-16 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredJourneys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Journey</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Crew</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJourneys.slice(0, 10).map((journey) => (
                    <tr key={journey.id} className="border-b border-gray-700 hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{journey.truckNumber || 'Unassigned'}</p>
                          <p className="text-sm text-text-secondary">ID: {journey.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusColor(journey.status)}>
                          {getStatusText(journey.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {formatDate(journey.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-text-secondary" />
                          <span className="text-sm text-text-secondary">2 crew</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-text-secondary" />
                          <span className="text-sm text-text-secondary">Location {journey.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleJourneyAction(journey.id, 'view')}
                            title="View Journey"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleJourneyAction(journey.id, 'edit')}
                            title="Edit Journey"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No journeys found</h3>
              <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating your first journey.'
                }
              </p>
              <Button onClick={handleCreateJourney} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Journey
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 