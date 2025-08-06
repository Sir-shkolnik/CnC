'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Eye, EyeOff, Mail, Lock, Truck, Users, Shield, Activity, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Clear error when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      await login({
        email: formData.email,
        password: formData.password
      })
      
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const demoCredentials = [
    { email: 'sarah.johnson@lgm.com', password: 'password123', role: 'Admin' },
    { email: 'mike.chen@lgm.com', password: 'password123', role: 'Dispatcher' },
    { email: 'david.rodriguez@lgm.com', password: 'password123', role: 'Driver' },
    { email: 'frank.williams@lgmhamilton.com', password: 'password123', role: 'Franchise Owner' }
  ]

  const fillDemoCredentials = (credentials: typeof demoCredentials[0]) => {
    setFormData({
      email: credentials.email,
      password: credentials.password
    })
    toast.success(`Filled ${credentials.role} credentials`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header - Improved Layout */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">C&C CRM</h1>
              <p className="text-sm text-text-secondary">Trust the Journey</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
          <p className="text-text-secondary">Sign in to your account to continue</p>
        </div>

        {/* Login Form - Improved Layout */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface border-gray-600 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-text-secondary">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Credentials - Improved Layout */}
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-text-primary mb-3">Demo Accounts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoCredentials.map((credentials, index) => (
                  <button
                    key={index}
                    onClick={() => fillDemoCredentials(credentials)}
                    className="p-2 text-left bg-surface/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">{credentials.role}</p>
                        <p className="text-xs text-text-secondary truncate">{credentials.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview - New Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-surface/30 rounded-lg">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Crew Management</p>
          </div>
          <div className="text-center p-3 bg-surface/30 rounded-lg">
            <Shield className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Audit & Compliance</p>
          </div>
          <div className="text-center p-3 bg-surface/30 rounded-lg">
            <Activity className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Real-time Tracking</p>
          </div>
        </div>
      </div>
    </div>
  )
} 