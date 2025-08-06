import Link from 'next/link'
import { Truck, Users, Shield, Zap, ArrowRight, CheckCircle, MapPin, Clock, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Compact Layout */}
      <header className="bg-surface/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-background" />
              </div>
              <span className="text-lg font-bold text-gradient">C&C CRM</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/auth/login" 
                className="px-3 py-1.5 text-text-primary hover:text-primary transition-colors font-medium text-sm"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-3 py-1.5 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Compact Layout */}
      <section className="py-16 px-4 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Trust the{' '}
            <span className="text-gradient">Journey</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
            Mobile-first operations management for moving & logistics. 
            Track, manage, and optimize your field operations with real-time data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link 
              href="/demo" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-surface border border-gray-700 text-text-primary rounded-lg hover:bg-surface/80 transition-colors font-medium"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Compact Layout */}
      <section className="py-16 px-4 sm:py-20 lg:py-24 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Built for Modern Operations</h2>
            <p className="text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Designed specifically for moving and logistics companies that need 
              real-time field data and operational excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Truck Journey Tracking</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Real-time tracking of every journey from dispatch to completion with GPS, photos, and status updates.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Crew Management</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Assign crews, track performance, and manage roles across dispatchers, drivers, and movers.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-info" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Audit & Compliance</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Complete audit trails, compliance monitoring, and quality assurance for every operation.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Offline-First</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Works seamlessly offline with automatic sync when connection is restored.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Multi-Location</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Manage multiple locations and franchises with centralized control and local autonomy.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Analytics & Insights</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Powerful analytics and reporting to optimize operations and improve efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Compact */}
      <section className="py-12 px-4 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-text-secondary">Locations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary mb-1">1,000+</div>
              <div className="text-sm text-text-secondary">Journeys</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success mb-1">99.9%</div>
              <div className="text-sm text-text-secondary">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning mb-1">24/7</div>
              <div className="text-sm text-text-secondary">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="py-16 px-4 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Transform Your Operations?</h2>
          <p className="text-base text-text-secondary mb-6 leading-relaxed">
            Join hundreds of moving companies that trust C&C CRM to manage their field operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-surface border border-gray-700 text-text-primary rounded-lg hover:bg-surface/80 transition-colors font-medium"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Compact */}
      <footer className="bg-surface border-t border-gray-800 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-background" />
                </div>
                <span className="text-lg font-bold text-gradient">C&C CRM</span>
              </div>
              <p className="text-sm text-text-secondary">
                Trust the Journey. Mobile-first operations management for modern logistics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-3 text-sm">Product</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-primary transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-3 text-sm">Company</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-3 text-sm">Support</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-primary transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-text-secondary">
            <p>&copy; 2025 C&C CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 