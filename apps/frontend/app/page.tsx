import Link from 'next/link'
import { Truck, Users, Shield, Zap, ArrowRight, CheckCircle, MapPin, Clock, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Improved Layout */}
      <header className="bg-surface/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-background" />
              </div>
              <span className="text-xl font-bold text-gradient">C&C CRM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="px-4 py-2 text-text-primary hover:text-primary transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Improved Layout */}
      <section className="py-20 px-4 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Trust the{' '}
            <span className="text-gradient">Journey</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
            Mobile-first operations management for moving & logistics. 
            Track, manage, and optimize your field operations with real-time data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/demo" 
              className="inline-flex items-center justify-center px-8 py-3 bg-surface border border-gray-700 text-text-primary rounded-lg hover:bg-surface/80 transition-colors font-medium text-lg"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Improved Layout */}
      <section className="py-20 px-4 sm:py-24 lg:py-32 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Modern Operations</h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Designed specifically for moving and logistics companies that need 
              real-time field data and operational excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Truck Journey Tracking</h3>
              <p className="text-text-secondary leading-relaxed">
                Real-time tracking of every journey from dispatch to completion with GPS, photos, and status updates.
              </p>
            </div>

            <div className="p-6 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Crew Management</h3>
              <p className="text-text-secondary leading-relaxed">
                Assign crews, track performance, and manage roles across dispatchers, drivers, and movers.
              </p>
            </div>

            <div className="p-6 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-info" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Audit & Compliance</h3>
              <p className="text-text-secondary leading-relaxed">
                Complete audit trails, compliance monitoring, and quality assurance for every operation.
              </p>
            </div>

            <div className="p-6 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Offline-First</h3>
              <p className="text-text-secondary leading-relaxed">
                Works seamlessly offline with automatic sync when connection is restored.
              </p>
            </div>

            <div className="p-6 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Multi-Location</h3>
              <p className="text-text-secondary leading-relaxed">
                Manage multiple locations and franchises with centralized control and local autonomy.
              </p>
            </div>

            <div className="p-6 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Analytics & Insights</h3>
              <p className="text-text-secondary leading-relaxed">
                Powerful analytics and reporting to optimize operations and improve efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - New */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-text-secondary">Locations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">1,000+</div>
              <div className="text-text-secondary">Journeys</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success mb-2">99.9%</div>
              <div className="text-text-secondary">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning mb-2">24/7</div>
              <div className="text-text-secondary">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Improved */}
      <section className="py-20 px-4 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Transform Your Operations?</h2>
          <p className="text-lg text-text-secondary mb-8 leading-relaxed">
            Join hundreds of moving companies that trust C&C CRM to manage their field operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 bg-surface border border-gray-700 text-text-primary rounded-lg hover:bg-surface/80 transition-colors font-medium text-lg"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Improved */}
      <footer className="bg-surface border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-background" />
                </div>
                <span className="text-xl font-bold text-gradient">C&C CRM</span>
              </div>
              <p className="text-text-secondary">
                Trust the Journey. Mobile-first operations management for modern logistics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-4">Product</h3>
              <ul className="space-y-2 text-text-secondary">
                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-primary transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-4">Company</h3>
              <ul className="space-y-2 text-text-secondary">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-4">Support</h3>
              <ul className="space-y-2 text-text-secondary">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-primary transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-text-secondary">
            <p>&copy; 2025 C&C CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 