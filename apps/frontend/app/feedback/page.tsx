'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Input } from '@/components/atoms/Input'
import { 
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Calendar,
  Truck,
  Phone,
  Mail,
  Filter,
  Search,
  Download,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Award,
  Clock,
  MapPin
} from 'lucide-react'
import { useAuthStore, useUser } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface Feedback {
  id: string
  journeyId: string
  journeyName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  rating: number
  npsScore: number
  category: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'VERY_POOR'
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'ESCALATED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags: string[]
  comments: string
  crewRating: {
    driver: number
    mover: number
    overall: number
  }
  journeyDetails: {
    date: string
    truckNumber: string
    location: string
    crew: string[]
  }
  escalationFlags: {
    isEscalated: boolean
    reason?: string
    escalatedBy?: string
    escalatedAt?: string
  }
  followUpRequired: boolean
  followUpNotes?: string
  createdAt: string
  updatedAt: string
}

export default function FeedbackPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadFeedbackData()
  }, [isAuthenticated, router])

  const loadFeedbackData = async () => {
    try {
      setIsLoading(true)
      
      // In a real app, this would fetch from the API
      // For now, we'll use mock data that matches our schema
      const mockFeedbacks: Feedback[] = [
        {
          id: 'feedback_001',
          journeyId: 'journey_001',
          journeyName: 'Downtown Office Relocation',
          customerName: 'John Smith',
          customerEmail: 'john.smith@company.com',
          customerPhone: '+1 (416) 555-0123',
          rating: 5,
          npsScore: 10,
          category: 'EXCELLENT',
          status: 'RESOLVED',
          priority: 'LOW',
          tags: ['On Time', 'Professional', 'Careful Handling'],
          comments: 'Excellent service! The crew was professional, on time, and handled our fragile items with great care. Highly recommend!',
          crewRating: {
            driver: 5,
            mover: 5,
            overall: 5
          },
          journeyDetails: {
            date: '2024-01-15',
            truckNumber: 'TRUCK-001',
            location: 'Downtown Office Building',
            crew: ['Mike Wilson', 'David Rodriguez']
          },
          escalationFlags: {
            isEscalated: false
          },
          followUpRequired: false,
          createdAt: '2024-01-15T16:30:00Z',
          updatedAt: '2024-01-15T16:30:00Z'
        },
        {
          id: 'feedback_002',
          journeyId: 'journey_002',
          journeyName: 'Warehouse Inventory Transfer',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah.johnson@warehouse.com',
          customerPhone: '+1 (416) 555-0124',
          rating: 4,
          npsScore: 8,
          category: 'GOOD',
          status: 'REVIEWED',
          priority: 'MEDIUM',
          tags: ['Good Service', 'Minor Delay'],
          comments: 'Good overall service. There was a minor delay due to traffic, but the crew was communicative and professional.',
          crewRating: {
            driver: 4,
            mover: 4,
            overall: 4
          },
          journeyDetails: {
            date: '2024-01-15',
            truckNumber: 'TRUCK-002',
            location: 'Industrial Warehouse',
            crew: ['Sarah Johnson', 'Emma Davis']
          },
          escalationFlags: {
            isEscalated: false
          },
          followUpRequired: false,
          createdAt: '2024-01-15T15:45:00Z',
          updatedAt: '2024-01-15T16:00:00Z'
        },
        {
          id: 'feedback_003',
          journeyId: 'journey_003',
          journeyName: 'Residential Move - Family of 4',
          customerName: 'Michael Brown',
          customerEmail: 'michael.brown@email.com',
          customerPhone: '+1 (416) 555-0125',
          rating: 2,
          npsScore: 3,
          category: 'POOR',
          status: 'ESCALATED',
          priority: 'HIGH',
          tags: ['Late Arrival', 'Damaged Items', 'Poor Communication'],
          comments: 'Very disappointed with the service. Crew arrived 2 hours late, damaged some furniture, and communication was poor throughout.',
          crewRating: {
            driver: 2,
            mover: 3,
            overall: 2
          },
          journeyDetails: {
            date: '2024-01-16',
            truckNumber: 'TRUCK-003',
            location: 'Suburban Home',
            crew: ['Tom Wilson', 'Rachel Green']
          },
          escalationFlags: {
            isEscalated: true,
            reason: 'Customer complaint about damaged items and late arrival',
            escalatedBy: 'Sarah Johnson',
            escalatedAt: '2024-01-16T14:00:00Z'
          },
          followUpRequired: true,
          followUpNotes: 'Customer service team to contact customer for resolution',
          createdAt: '2024-01-16T13:30:00Z',
          updatedAt: '2024-01-16T14:00:00Z'
        },
        {
          id: 'feedback_004',
          journeyId: 'journey_004',
          journeyName: 'Office Furniture Delivery',
          customerName: 'Lisa Davis',
          customerEmail: 'lisa.davis@startup.com',
          customerPhone: '+1 (416) 555-0126',
          rating: 5,
          npsScore: 10,
          category: 'EXCELLENT',
          status: 'RESOLVED',
          priority: 'LOW',
          tags: ['Excellent Service', 'On Time', 'Professional'],
          comments: 'Perfect service! Everything was delivered on time and in perfect condition. The crew was very professional and helpful.',
          crewRating: {
            driver: 5,
            mover: 5,
            overall: 5
          },
          journeyDetails: {
            date: '2024-01-17',
            truckNumber: 'TRUCK-001',
            location: 'Tech Startup Office',
            crew: ['Mike Wilson', 'David Rodriguez']
          },
          escalationFlags: {
            isEscalated: false
          },
          followUpRequired: false,
          createdAt: '2024-01-17T17:00:00Z',
          updatedAt: '2024-01-17T17:00:00Z'
        },
        {
          id: 'feedback_005',
          journeyId: 'journey_005',
          journeyName: 'Storage Unit Cleanout',
          customerName: 'Robert Wilson',
          customerEmail: 'robert.wilson@email.com',
          customerPhone: '+1 (416) 555-0127',
          rating: 3,
          npsScore: 6,
          category: 'AVERAGE',
          status: 'PENDING',
          priority: 'MEDIUM',
          tags: ['Average Service', 'Communication Issues'],
          comments: 'Service was okay but could have been better. Some communication issues and the crew seemed rushed.',
          crewRating: {
            driver: 3,
            mover: 4,
            overall: 3
          },
          journeyDetails: {
            date: '2024-01-18',
            truckNumber: 'TRUCK-002',
            location: 'Storage Facility',
            crew: ['Sarah Johnson', 'Emma Davis']
          },
          escalationFlags: {
            isEscalated: false
          },
          followUpRequired: true,
          followUpNotes: 'Review communication protocols with crew',
          createdAt: '2024-01-18T16:15:00Z',
          updatedAt: '2024-01-18T16:15:00Z'
        }
      ]
      
      setFeedbacks(mockFeedbacks)
    } catch (error) {
      console.error('Failed to load feedback data:', error)
      toast.error('Failed to load feedback data')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EXCELLENT': return 'success'
      case 'GOOD': return 'secondary'
      case 'AVERAGE': return 'info'
      case 'POOR': return 'warning'
      case 'VERY_POOR': return 'error'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'REVIEWED': return 'info'
      case 'RESOLVED': return 'success'
      case 'ESCALATED': return 'error'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'success'
      case 'MEDIUM': return 'warning'
      case 'HIGH': return 'error'
      case 'URGENT': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳ Pending'
      case 'REVIEWED': return '👁️ Reviewed'
      case 'RESOLVED': return '✅ Resolved'
      case 'ESCALATED': return '🚨 Escalated'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return '🟢 Low'
      case 'MEDIUM': return '🟡 Medium'
      case 'HIGH': return '🔴 High'
      case 'URGENT': return '🚨 Urgent'
      default: return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-warning fill-current' : 'text-text-secondary'}`}
      />
    ))
  }

  const handleViewFeedback = (feedbackId: string) => {
    toast(`View feedback ${feedbackId} - functionality coming soon`)
  }

  const handleEditFeedback = (feedbackId: string) => {
    toast(`Edit feedback ${feedbackId} - functionality coming soon`)
  }

  const handleDeleteFeedback = (feedbackId: string) => {
    toast(`Delete feedback ${feedbackId} - functionality coming soon`)
  }

  const handleExportFeedback = () => {
    toast('Export functionality coming soon')
  }

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.journeyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.comments.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRating = ratingFilter === 'all' || feedback.rating.toString() === ratingFilter
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || feedback.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || feedback.category === categoryFilter
    
    return matchesSearch && matchesRating && matchesStatus && matchesPriority && matchesCategory
  })

  const stats = {
    total: feedbacks.length,
    averageRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
    averageNPS: feedbacks.reduce((sum, f) => sum + f.npsScore, 0) / feedbacks.length,
    excellent: feedbacks.filter(f => f.category === 'EXCELLENT').length,
    poor: feedbacks.filter(f => f.category === 'POOR' || f.category === 'VERY_POOR').length,
    escalated: feedbacks.filter(f => f.escalationFlags.isEscalated).length,
    pending: feedbacks.filter(f => f.status === 'PENDING').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-surface rounded"></div>
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
              <h1 className="text-3xl font-bold text-text-primary">Customer Feedback</h1>
              <p className="text-text-secondary">Manage customer feedback, ratings, and escalations</p>
            </div>
          </div>
          <Button onClick={handleExportFeedback}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-text-secondary">Total Feedback</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-text-secondary">Avg Rating</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-info">{stats.averageNPS.toFixed(1)}</div>
                <div className="text-sm text-text-secondary">Avg NPS</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{stats.excellent}</div>
                <div className="text-sm text-text-secondary">Excellent</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-error">{stats.poor}</div>
                <div className="text-sm text-text-secondary">Poor</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-error">{stats.escalated}</div>
                <div className="text-sm text-text-secondary">Escalated</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                <div className="text-sm text-text-secondary">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            leftIcon={<Search className="w-4 h-4" />}
          />
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
          >
            <option value="all">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
          >
            <option value="all">All Categories</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="AVERAGE">Average</option>
            <option value="POOR">Poor</option>
            <option value="VERY_POOR">Very Poor</option>
          </select>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {feedback.customerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{feedback.customerName}</h3>
                      <p className="text-sm text-text-secondary">{feedback.journeyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant={getCategoryColor(feedback.category)}>
                      {feedback.category}
                    </Badge>
                    <Badge variant={getStatusColor(feedback.status)}>
                      {getStatusText(feedback.status)}
                    </Badge>
                    <Badge variant={getPriorityColor(feedback.priority)}>
                      {getPriorityText(feedback.priority)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(feedback.rating)}
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {feedback.rating}/5
                  </span>
                  <span className="text-sm text-text-secondary">
                    (NPS: {feedback.npsScore}/10)
                  </span>
                </div>

                {/* Comments */}
                <div>
                  <p className="text-sm text-text-primary line-clamp-3">{feedback.comments}</p>
                </div>

                {/* Journey Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{formatDate(feedback.journeyDetails.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{feedback.journeyDetails.truckNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary truncate">{feedback.journeyDetails.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{feedback.journeyDetails.crew.length} crew</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex flex-wrap gap-1">
                    {feedback.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Escalation */}
                {feedback.escalationFlags.isEscalated && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Flag className="w-4 h-4 text-error" />
                      <span className="text-sm font-medium text-error">Escalated</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {feedback.escalationFlags.reason}
                    </p>
                  </div>
                )}

                {/* Follow Up */}
                {feedback.followUpRequired && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-warning">Follow Up Required</span>
                    </div>
                    {feedback.followUpNotes && (
                      <p className="text-xs text-text-secondary mt-1">
                        {feedback.followUpNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewFeedback(feedback.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFeedback(feedback.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(feedback.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No feedback found</h3>
            <p className="text-text-secondary mb-4">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
} 