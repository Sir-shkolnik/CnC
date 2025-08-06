'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useMenuStore } from '@/stores/menuStore';
import { MobileMenu } from './MobileMenu';
import { DesktopMenu } from './DesktopMenu';
import { Breadcrumbs } from './Breadcrumbs';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/utils/cn';
import { getRoleBasedMenuItems } from '@/utils/menuItems';
import { useMenuItems } from '@/hooks/useMenuItems';

interface MainNavigationProps {
  children: React.ReactNode;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    isMobileMenuOpen, 
    isDesktopMenuCollapsed,
    toggleMobileMenu, 
    toggleDesktopMenu,
    setActiveMenuItem 
  } = useMenuStore();
  
  const { menuItems } = useMenuItems();
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle online/offline state after mount to prevent hydration errors
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
  }, [pathname, menuItems, setActiveMenuItem]);

  useEffect(() => {
    updateActiveMenuItem();
  }, [updateActiveMenuItem]);

  // Don't render navigation for auth pages or if no user
  if (!isAuthenticated || !user || pathname.startsWith('/auth') || pathname === '/') {
    return <>{children}</>;
  }

  // Don't render navigation for super admin pages (they have their own layout)
  if (pathname.startsWith('/super-admin')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        menuItems={menuItems}
        user={user as any}
      />

      {/* Desktop Menu */}
      <DesktopMenu
        isCollapsed={isDesktopMenuCollapsed}
        onToggle={toggleDesktopMenu}
        menuItems={menuItems}
        user={user as any}
      />

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-300",
        isDesktopMenuCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-surface border-b border-border">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Left Side - Mobile Menu Button & Breadcrumbs */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="lg:hidden text-text-secondary hover:text-text-primary"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              <Breadcrumbs pathname={pathname} user={user as any} />
            </div>

            {/* Right Side - User Menu & Actions */}
            <div className="flex items-center space-x-2">
              {/* Offline Indicator */}
              {mounted && (
                <div className="hidden sm:flex items-center space-x-2 text-xs text-text-secondary">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-success" : "bg-warning"
                  )} />
                  <span>{isOnline ? "Online" : "Offline"}</span>
                </div>
              )}

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                </div>
                
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}; 