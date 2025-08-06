'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Input } from '@/components/atoms/Input'
import { 
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Smartphone,
  Database,
  Key,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  LogOut,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Building,
  Users,
  Lock,
  Unlock,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAuthStore, useUser } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface UserSettings {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'MOVER' | 'MANAGER' | 'AUDITOR'
  location: {
    id: string
    name: string
  }
  client: {
    id: string
    name: string
  }
  preferences: {
    theme: 'dark' | 'light' | 'auto'
    language: 'en' | 'fr' | 'es'
    timezone: string
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
    timeFormat: '12h' | '24h'
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
      journeyUpdates: boolean
      systemAlerts: boolean
      weeklyReports: boolean
    }
    pwa: {
      enabled: boolean
      autoUpdate: boolean
      offlineMode: boolean
    }
  }
  permissions: {
    canCreateJourneys: boolean
    canEditJourneys: boolean
    canDeleteJourneys: boolean
    canViewAudit: boolean
    canManageUsers: boolean
    canManageSettings: boolean
    canExportData: boolean
    canViewReports: boolean
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    loginHistory: {
      date: string
      ip: string
      device: string
      location: string
    }[]
  }
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadSettings()
  }, [isAuthenticated, router])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      
      // In a real app, this would fetch from the API
      // For now, we'll use mock data that matches our schema
      const mockSettings: UserSettings = {
        id: 'user_001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@lgm.com',
        phone: '+1 (416) 555-0101',
        role: 'ADMIN',
        location: {
          id: 'loc_001',
          name: 'LGM Toronto'
        },
        client: {
          id: 'client_001',
          name: 'LGM Corporate'
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'America/Toronto',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '24h',
          notifications: {
            email: true,
            push: true,
            sms: false,
            journeyUpdates: true,
            systemAlerts: true,
            weeklyReports: false
          },
          pwa: {
            enabled: true,
            autoUpdate: true,
            offlineMode: true
          }
        },
        permissions: {
          canCreateJourneys: true,
          canEditJourneys: true,
          canDeleteJourneys: true,
          canViewAudit: true,
          canManageUsers: true,
          canManageSettings: true,
          canExportData: true,
          canViewReports: true
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2024-01-01T00:00:00Z',
          loginHistory: [
            {
              date: '2024-01-15T10:00:00Z',
              ip: '192.168.1.100',
              device: 'Chrome on MacBook Pro',
              location: 'Toronto, Canada'
            },
            {
              date: '2024-01-14T15:30:00Z',
              ip: '192.168.1.100',
              device: 'Chrome on MacBook Pro',
              location: 'Toronto, Canada'
            },
            {
              date: '2024-01-13T09:15:00Z',
              ip: '192.168.1.100',
              device: 'Chrome on MacBook Pro',
              location: 'Toronto, Canada'
            }
          ]
        },
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
      
      setSettings(mockSettings)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      // In a real app, this would call the API
      setIsEditing(false)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      // In a real app, this would call the API
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully')
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    }
  }

  const handleExportData = () => {
    toast('Data export functionality coming soon')
  }

  const handleImportData = () => {
    toast('Data import functionality coming soon')
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Failed to logout:', error)
      toast.error('Failed to logout')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error'
      case 'DISPATCHER': return 'primary'
      case 'DRIVER': return 'secondary'
      case 'MOVER': return 'info'
      case 'MANAGER': return 'warning'
      case 'AUDITOR': return 'default'
      default: return 'default'
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'pwa', label: 'PWA Settings', icon: Smartphone }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-64 bg-surface rounded"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-surface rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Settings Not Found</h2>
            <p className="text-text-secondary mb-6">Unable to load user settings.</p>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
              <p className="text-text-secondary">Manage your account preferences and system settings</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-white'
                            : 'hover:bg-surface text-text-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {settings.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{settings.name}</h3>
                    <p className="text-sm text-text-secondary">{settings.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{settings.client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">{settings.location.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge variant={getRoleColor(settings.role)}>
                      {settings.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Full Name</label>
                      <Input
                        value={settings.name}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, name: e.target.value } : null)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Email</label>
                      <Input
                        value={settings.email}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, email: e.target.value } : null)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Phone</label>
                      <Input
                        value={settings.phone}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Role</label>
                      <div className="mt-1">
                        <Badge variant={getRoleColor(settings.role)}>
                          {settings.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-secondary">Current Password</label>
                        <div className="relative mt-1">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-secondary">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-secondary">Confirm New Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Theme</label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          preferences: { ...prev.preferences, theme: e.target.value as any }
                        } : null)}
                        disabled={!isEditing}
                        className="w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Language</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          preferences: { ...prev.preferences, language: e.target.value as any }
                        } : null)}
                        disabled={!isEditing}
                        className="w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Date Format</label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          preferences: { ...prev.preferences, dateFormat: e.target.value as any }
                        } : null)}
                        disabled={!isEditing}
                        className="w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Time Format</label>
                      <select
                        value={settings.preferences.timeFormat}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          preferences: { ...prev.preferences, timeFormat: e.target.value as any }
                        } : null)}
                        disabled={!isEditing}
                        className="w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                        <span className="text-sm font-medium text-text-primary">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <Badge variant={value ? 'success' : 'secondary'}>
                          {value ? 'Allowed' : 'Denied'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(settings.preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                        <span className="text-sm font-medium text-text-primary">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              notifications: {
                                ...prev.preferences.notifications,
                                [key]: e.target.checked
                              }
                            }
                          } : null)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div>
                      <h3 className="font-medium text-text-primary">Two-Factor Authentication</h3>
                      <p className="text-sm text-text-secondary">Add an extra layer of security to your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        security: { ...prev.security, twoFactorEnabled: e.target.checked }
                      } : null)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary"
                    />
                  </div>

                  <div>
                    <h3 className="font-medium text-text-primary mb-4">Login History</h3>
                    <div className="space-y-2">
                      {settings.security.loginHistory.map((login, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{login.device}</p>
                            <p className="text-xs text-text-secondary">{login.ip} • {login.location}</p>
                          </div>
                          <span className="text-xs text-text-secondary">{formatDate(login.date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PWA Settings Tab */}
            {activeTab === 'pwa' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    PWA Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(settings.preferences.pwa).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                        <div>
                          <h3 className="font-medium text-text-primary">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {key === 'enabled' && 'Enable Progressive Web App features'}
                            {key === 'autoUpdate' && 'Automatically update the app when new versions are available'}
                            {key === 'offlineMode' && 'Allow the app to work without internet connection'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              pwa: {
                                ...prev.preferences.pwa,
                                [key]: e.target.checked
                              }
                            }
                          } : null)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-text-primary mb-4">Data Management</h3>
                    <div className="flex space-x-4">
                      <Button onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="secondary" onClick={handleImportData}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 