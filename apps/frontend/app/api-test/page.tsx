'use client'

import { useState, useEffect } from 'react'

export default function ApiTestPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/health`)
      const data = await response.json()
      setHealthStatus(data)
      if (data.success) {
        alert('Health check successful!')
      } else {
        alert('Health check failed')
      }
    } catch (error) {
      console.error('Health check failed:', error)
      alert('Health check failed')
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'shahbaz@lgm.com',
          password: '1234'
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Login successful!')
        console.log('Token:', data.access_token)
      } else {
        alert('Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API Integration Test</h1>
          <p className="text-gray-400">Test the connection between frontend and backend</p>
        </div>

        {/* API Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Check */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Health Check</h2>
            <button 
              onClick={testHealthCheck} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded mb-4"
            >
              {loading ? 'Testing...' : 'Test API Health'}
            </button>
            {healthStatus && (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-400">Status: </span>
                  <span className="text-green-400">{healthStatus.status}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Version: </span>
                  <span className="text-white">{healthStatus.version}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Modules: </span>
                  <div className="mt-1 space-y-1">
                    {Object.entries(healthStatus.modules || {}).map(([module, status]) => (
                      <div key={module} className="flex items-center space-x-2">
                        <span className="text-gray-400">{module}:</span>
                        <span className={`text-xs px-2 py-1 rounded ${status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                          {status as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login Test */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Authentication Test</h2>
            <button 
              onClick={testLogin} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded mb-4"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            <p className="text-sm text-gray-400">
              Tests login with shahbaz@lgm.com / 1234
            </p>
          </div>
        </div>

        {/* API Info */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">API Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">API Base URL: </span>
              <span className="text-white">{process.env.NEXT_PUBLIC_API_URL || 'https://c-and-c-crm-api.onrender.com'}</span>
            </div>
            <div>
              <span className="text-gray-400">Frontend URL: </span>
              <span className="text-white">{process.env.NEXT_PUBLIC_APP_URL || 'https://c-and-c-crm-frontend.onrender.com'}</span>
            </div>
            <div>
              <span className="text-gray-400">Environment: </span>
              <span className="text-white">{process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 