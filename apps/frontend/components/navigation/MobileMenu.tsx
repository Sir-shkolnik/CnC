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
        "fixed left-0 top-0 h-full w-80 bg-surface border-r border-border transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-surface/95 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{user.name}</p>
              <p className="text-xs text-text-secondary capitalize">{user.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
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
        <div className="p-3 border-t border-border bg-surface/95 backdrop-blur-sm">
          <div className="space-y-2">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-2 text-xs"
              >
                <User className="w-4 h-4 mb-1" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-2 text-xs"
              >
                <Bell className="w-4 h-4 mb-1" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-2 text-xs"
              >
                <Settings className="w-4 h-4 mb-1" />
                Settings
              </Button>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-text-secondary hover:text-text-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
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