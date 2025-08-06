import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Truck, User, Mail, Eye, EyeOff, Search, Filter, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header - Improved Layout */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">Component Test Page</h1>
          <p className="text-text-secondary">Testing all components with improved alignment and responsiveness</p>
        </div>
        
        {/* Button Tests - Improved Layout */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              Button Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Button States</h3>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
                <Button leftIcon={<Plus />}>With Left Icon</Button>
                <Button rightIcon={<CheckCircle />}>With Right Icon</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Tests - Improved Layout */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Mail className="w-5 h-5 mr-2 text-primary" />
              Input Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Default Input</label>
                <Input placeholder="Default input" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">With Icon</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input placeholder="Search..." className="pl-10" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Email Input</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-text-secondary">We'll never share your email</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input 
                    placeholder="Enter username"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-error">Username is required</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Password Input</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input 
                    type="password"
                    placeholder="Enter password"
                    className="pl-10 pr-10"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Success Input</label>
                <Input 
                  placeholder="This is valid"
                  className="border-success"
                />
                <p className="text-xs text-success">Input is valid!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Tests - Improved Layout */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
              Badge Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Standard Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Journey Status Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="morning-prep">🕐 Morning Prep</Badge>
                <Badge variant="en-route">🚛 En Route</Badge>
                <Badge variant="onsite">📍 Onsite</Badge>
                <Badge variant="completed">✅ Completed</Badge>
                <Badge variant="audited">🔍 Audited</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Tests - Improved Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Hoverable Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">This card has hover effects and can be clicked.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center">
                <Truck className="w-4 h-4 mr-2 text-primary" />
                With Icon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">Card with an icon in the header.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Action Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-text-secondary">Card with action buttons.</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layout Test - New Section */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              Layout & Responsiveness Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-surface/50 rounded-lg border border-gray-700">
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-text-primary">Mobile First</h3>
                  <p className="text-xs text-text-secondary">Responsive design</p>
                </div>
              </div>
              
              <div className="p-4 bg-surface/50 rounded-lg border border-gray-700">
                <div className="text-center">
                  <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                  </div>
                  <h3 className="text-sm font-medium text-text-primary">Consistent</h3>
                  <p className="text-xs text-text-secondary">Aligned components</p>
                </div>
              </div>
              
              <div className="p-4 bg-surface/50 rounded-lg border border-gray-700">
                <div className="text-center">
                  <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-4 h-4 text-success" />
                  </div>
                  <h3 className="text-sm font-medium text-text-primary">Accessible</h3>
                  <p className="text-xs text-text-secondary">WCAG compliant</p>
                </div>
              </div>
              
              <div className="p-4 bg-surface/50 rounded-lg border border-gray-700">
                <div className="text-center">
                  <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Plus className="w-4 h-4 text-warning" />
                  </div>
                  <h3 className="text-sm font-medium text-text-primary">Extensible</h3>
                  <p className="text-xs text-text-secondary">Easy to customize</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 