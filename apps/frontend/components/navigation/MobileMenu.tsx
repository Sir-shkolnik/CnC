'use client';

import React from 'react';
import { X, LogOut, User, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/atoms/Button';
import { MenuItems } from './MenuItems';
import { cn } from '@/utils/cn';
import { MenuItem } from '@/types/menu';
import { User as UserType } from '@/types/menu';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  user: UserType;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  menuItems,
  user
}) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "fixed left-0 top-0 h-full bg-surface border-r border-border transform transition-transform duration-300",
        // Make menu wider on mobile for easier touch interaction
        "w-80 sm:w-72",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface/95 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-base">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-base font-medium text-text-primary">{user.name}</p>
              <p className="text-sm text-text-secondary capitalize">{user.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-3 min-h-[48px] min-w-[48px]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          <MenuItems
            items={menuItems}
            onItemClick={onClose}
            isMobile={true}
          />
        </nav>

        {/* Mobile Menu Footer */}
        <div className="p-4 border-t border-border bg-surface/95 backdrop-blur-sm">
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-col h-auto py-3 text-xs min-h-[56px]"
              >
                <User className="w-5 h-5 mb-1" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="flex-col h-auto py-3 text-xs min-h-[56px]"
              >
                <Bell className="w-5 h-5 mb-1" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="flex-col h-auto py-3 text-xs min-h-[56px]"
              >
                <Settings className="w-5 h-5 mb-1" />
                Settings
              </Button>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="danger"
              size="lg"
              onClick={handleLogout}
              className="w-full min-h-[48px] text-base"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
}; 