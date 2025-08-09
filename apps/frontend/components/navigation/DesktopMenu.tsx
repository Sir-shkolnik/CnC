'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { MenuItems } from './MenuItems';
import { cn } from '@/utils/cn';
import { MenuItem } from '@/types/menu';
import { User } from '@/types/menu';

interface DesktopMenuProps {
  isCollapsed: boolean;
  onToggle: () => void;
  menuItems: MenuItem[];
  user: User;
}

export const DesktopMenu: React.FC<DesktopMenuProps> = ({
  isCollapsed,
  onToggle,
  menuItems,
  user
}) => {
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-surface border-r border-border transition-all duration-300 z-40",
      // Hide on mobile, show on desktop
      "hidden lg:block",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Desktop Menu Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-surface/95 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-text-primary text-sm">C&C CRM</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-text-secondary hover:text-text-primary"
          aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Desktop Menu Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        <MenuItems
          items={menuItems}
          isCollapsed={isCollapsed}
          onItemClick={() => {}}
        />
      </nav>

      {/* Desktop Menu Footer */}
      <div className="p-3 border-t border-border bg-surface/95 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-text-secondary capitalize truncate">{user.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}; 
  );
}; 