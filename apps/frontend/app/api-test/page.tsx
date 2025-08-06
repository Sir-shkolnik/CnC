'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function ApiTestPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [journeys, setJourneys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testHealthCheck = async () => {
    setLoading(true)
    try {
      const health = await apiClient.healthCheck()
      setHealthStatus(health)
      toast.success('Health check successful!')
    } catch (error) {
      console.error('Health check failed:', error)
      toast.error('Health check failed')
    } finally {
      setLoading(false)
    }
  }

  const testJourneys = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    try {
      const journeyData = await apiClient.getJourneys()
      setJourneys(journeyData)
      toast.success(`Found ${journeyData.length} journeys`)
    } catch (error) {
      console.error('Failed to fetch journeys:', error)
      toast.error('Failed to fetch journeys')
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      await apiClient.login({
        email: 'sarah.johnson@lgm.com',
        password: 'password123'
      })
      toast.success('Login successful!')
      // Refresh the page to update auth state
      window.location.reload()
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const testLogout = async () => {
    setLoading(true)
    try {
      await apiClient.logout()
      toast.success('Logout successful!')
      // Refresh the page to update auth state
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-h2 mb-2">API Integration Test</h1>
          <p className="text-text-secondary">Test the connection between frontend and backend</p>
        </div>

        {/* Authentication Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant={isAuthenticated ? 'success' : 'error'}>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
              {user && (
                <div className="text-sm">
                  <span className="text-text-secondary">User: </span>
                  <span className="text-text-primary">{user.name}</span>
                  <span className="text-text-secondary ml-2">({user.role})</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {!isAuthenticated ? (
                <Button onClick={testLogin} loading={loading}>
                  Test Login
                </Button>
              ) : (
                <Button variant="secondary" onClick={testLogout} loading={loading}>
                  Test Logout
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Check */}
          <Card>
            <CardHeader>
              <CardTitle>Health Check</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testHealthCheck} loading={loading} className="mb-4">
                Test API Health
              </Button>
              {healthStatus && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-text-secondary">Status: </span>
                    <Badge variant="success">{healthStatus.status}</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Version: </span>
                    <span className="text-text-primary">{healthStatus.version}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-secondary">Modules: </span>
                    <div className="mt-1 space-y-1">
                      {Object.entries(healthStatus.modules || {}).map(([module, status]) => (
                        <div key={module} className="flex items-center space-x-2">
                          <span className="text-text-secondary">{module}:</span>
                          <Badge variant={status === 'active' ? 'success' : 'error'} className="text-xs">
                            {status as string}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Journeys Test */}
          <Card>
            <CardHeader>
              <CardTitle>Journeys API</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testJourneys} 
                loading={loading} 
                disabled={!isAuthenticated}
                className="mb-4"
              >
                Fetch Journeys
              </Button>
              {journeys.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-text-secondary">
                    Found {journeys.length} journeys:
                  </div>
                  {journeys.slice(0, 3).map((journey) => (
                    <div key={journey.id} className="p-2 bg-surface/50 rounded text-sm">
                      <div className="font-medium text-text-primary">
                        {journey.truckNumber || 'Unassigned Truck'}
                      </div>
                      <div className="text-text-secondary">
                        Status: {journey.status} | Date: {new Date(journey.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {journeys.length > 3 && (
                    <div className="text-xs text-text-secondary">
                      ... and {journeys.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">API Base URL: </span>
                <span className="text-text-primary">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</span>
              </div>
              <div>
                <span className="text-text-secondary">Frontend URL: </span>
                <span className="text-text-primary">{process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}</span>
              </div>
              <div>
                <span className="text-text-secondary">Environment: </span>
                <span className="text-text-primary">{process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'}</span>
              </div>
              <div>
                <span className="text-text-secondary">Token Status: </span>
                <Badge variant={apiClient.isAuthenticated() ? 'success' : 'error'} className="text-xs">
                  {apiClient.isAuthenticated() ? 'Present' : 'Missing'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 