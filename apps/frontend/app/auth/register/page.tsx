'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Truck, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Building, Phone, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast.success('Registration successful! Welcome to C&C CRM!')
      // TODO: Redirect to dashboard or email verification
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header - Improved Layout */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">C&C CRM</h1>
              <p className="text-sm text-text-secondary">Trust the Journey</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Create Your Account</h2>
          <p className="text-text-secondary">Join C&C CRM to transform your operations</p>
        </div>

        {/* Registration Form - Improved Layout */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-center">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-error">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-xs text-error">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
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
                {errors.email && (
                  <p className="text-xs text-error">{errors.email}</p>
                )}
              </div>

              {/* Phone and Company Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-error">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Enter company name"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.company && (
                    <p className="text-xs text-error">{errors.company}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
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
                  {errors.password && (
                    <p className="text-xs text-error">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-error">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 text-primary bg-surface border-gray-600 rounded focus:ring-primary focus:ring-2 mt-1"
                />
                <label className="text-sm text-text-secondary">
                  I agree to the{' '}
                  <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-sm text-text-secondary">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section - New */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-surface/30 rounded-lg">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Free 14-day trial</p>
          </div>
          <div className="text-center p-3 bg-surface/30 rounded-lg">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-xs text-text-secondary">No credit card required</p>
          </div>
          <div className="text-center p-3 bg-surface/30 rounded-lg">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  )
} 