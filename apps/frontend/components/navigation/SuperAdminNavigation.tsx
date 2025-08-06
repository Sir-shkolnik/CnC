'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronLeft, ChevronRight, Shield, LogOut, Building2 } from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useCurrentCompany } from '@/stores/superAdminStore';
import { useShowCompanySelector } from '@/stores/superAdminStore';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';
import { getRoleBasedSuperAdminMenuItems } from '@/utils/superAdminMenuItems';
import toast from 'react-hot-toast';

interface SuperAdminNavigationProps {
  children: React.ReactNode;
}

export const SuperAdminNavigation: React.FC<SuperAdminNavigationProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const currentCompany = useCurrentCompany();
  const showCompanySelector = useShowCompanySelector();
  
  const { 
    logout, 
    switchCompany, 
    toggleCompanySelector,
    session 
  } = useSuperAdminStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuCollapsed, setIsDesktopMenuCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  // Get menu items based on super admin role and permissions
  const menuItems = session?.permissionsScope 
    ? getRoleBasedSuperAdminMenuItems(superAdmin?.role || 'SUPER_ADMIN', session.permissionsScope)
    : [];

  // Handle online/offline state
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update active menu item based on current path
  const updateActiveMenuItem = useCallback(() => {
    if (!menuItems.length) return;
    
    const activeItem = menuItems.find(item => 
      item.href === pathname || 
      item.children?.some(child => child.href === pathname)
    );
    
    if (activeItem) {
      setActiveMenuItem(activeItem.id);
    }
  }, [pathname, menuItems]);

  useEffect(() => {
    updateActiveMenuItem();
  }, [updateActiveMenuItem]);

  const handleLogout = () => {
    logout();
            router.push('/auth/login');
    toast.success('Logged out successfully');
  };

  const handleCompanySwitch = async (companyId: string) => {
    try {
      await switchCompany(companyId);
      setIsMobileMenuOpen(false);
      toast.success('Company switched successfully');
    } catch (error) {
      toast.error('Failed to switch company');
    }
  };

  // Don't render navigation for login page
      if (pathname === '/auth/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-700 rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Super Admin Menu</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Company Selector */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">Current Company</h4>
              <div className="p-3 bg-surface/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{currentCompany?.name}</p>
                    <p className="text-xs text-text-secondary">{currentCompany?.type}</p>
                  </div>
                  <Badge variant={currentCompany?.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {currentCompany?.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full p-3 text-left rounded-lg transition-colors",
                    activeMenuItem === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-text-primary hover:bg-surface/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {/* Icon placeholder - you can add actual icons here */}
                      <div className="w-4 h-4 bg-current rounded-sm" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="primary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Menu */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 bg-surface border-r border-gray-700 transition-all duration-300 z-40",
        isDesktopMenuCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isDesktopMenuCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-background" />
              </div>
              <span className="text-lg font-bold text-gradient">Super Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDesktopMenuCollapsed(!isDesktopMenuCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isDesktopMenuCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Company Selector */}
        {!isDesktopMenuCollapsed && currentCompany && (
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-xs font-medium text-text-secondary mb-2">CURRENT COMPANY</h4>
            <div className="p-3 bg-surface/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-primary truncate">{currentCompany.name}</p>
                <Badge variant={currentCompany.status === 'ACTIVE' ? 'success' : 'warning'} className="text-xs">
                  {currentCompany.status}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">{currentCompany.type}</p>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                  activeMenuItem === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-text-primary hover:bg-surface/50"
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {/* Icon placeholder */}
                  <div className="w-4 h-4 bg-current rounded-sm" />
                </div>
                {!isDesktopMenuCollapsed && (
                  <>
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="primary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!isDesktopMenuCollapsed && (
            <div className="mb-3">
              <p className="text-xs text-text-secondary">Logged in as</p>
              <p className="text-sm font-medium text-text-primary">{superAdmin?.username}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start",
              isDesktopMenuCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!isDesktopMenuCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-300",
        isDesktopMenuCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-surface border-b border-gray-700">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden h-8 w-8 p-0"
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              {/* Online/Offline Indicator */}
              {mounted && (
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-success" : "bg-error"
                  )} />
                  <span className="text-xs text-text-secondary">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              )}
            </div>

            {/* Company Selector */}
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleCompanySelector}
                className="h-8"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {currentCompany?.name || 'Select Company'}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}; 