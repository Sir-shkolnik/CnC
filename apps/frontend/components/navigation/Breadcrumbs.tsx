'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import { User } from '@/types/menu';
import { getRoleBasedMenuItems } from '@/utils/menuItems';

interface BreadcrumbsProps {
  pathname: string;
  user: User;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: string;
  isLast: boolean;
  key: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ pathname, user }) => {
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Add home
    items.push({
      label: 'Home',
      href: '/dashboard',
      icon: 'Home',
      isLast: segments.length === 0,
      key: 'home'
    });

    // Build breadcrumbs based on path
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      const menuItems = getRoleBasedMenuItems(user.role);
      const menuItem = findMenuItemByPath(currentPath, menuItems);
      
      if (menuItem) {
        items.push({
          label: menuItem.label,
          href: currentPath,
          icon: menuItem.icon,
          isLast: index === segments.length - 1,
          key: `segment-${index}-${segment}`
        });
      } else {
        // Fallback for unknown paths
        items.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
          isLast: index === segments.length - 1,
          key: `segment-${index}-${segment}`
        });
      }
    });

    return items;
  }, [pathname, user.role]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-text-secondary" aria-label="Breadcrumb">
      {breadcrumbs.map((item) => (
        <div key={item.key} className="flex items-center">
          {item.key !== 'home' && <ChevronRight className="w-3 h-3 mx-1" />}
          <Link
            href={item.href}
            className={cn(
              "flex items-center space-x-1 hover:text-text-primary transition-colors",
              item.isLast && "text-text-primary font-medium"
            )}
          >
            {item.icon === 'Home' && <Home className="w-3 h-3" />}
            <span className="text-xs">{item.label}</span>
          </Link>
        </div>
      ))}
    </nav>
  );
};

// Helper function to find menu item by path
const findMenuItemByPath = (path: string, menuItems: any[]): any => {
  for (const item of menuItems) {
    if (item.href === path) {
      return item;
    }
    if (item.children) {
      const child = item.children.find((child: any) => child.href === path);
      if (child) {
        return child;
      }
    }
  }
  return null;
}; 