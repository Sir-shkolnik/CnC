'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';
import { MenuItem as MenuItemType } from '@/types/menu';
import { Icon } from '@/components/atoms/Icon';

interface MenuItemProps {
  item: MenuItemType;
  isActive?: boolean;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isCollapsed = false,
  isMobile = false,
  onClick
}) => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href ||
    item.children?.some(child => pathname === child.href);

  const handleClick = () => {
    if (hasChildren && !isCollapsed) {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  return (
    <div className="relative">
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium transition-colors relative group",
          "hover:bg-primary/10 hover:text-primary",
          isActive && "bg-primary/20 text-primary border-r-2 border-primary",
          isCollapsed && "justify-center px-2",
          isMobile && "px-4 py-3"
        )}
      >
        {/* Icon */}
        <Icon
          name={item.icon}
          className={cn(
            "transition-transform",
            isCollapsed ? "mr-0" : "mr-3",
            isMobile ? "w-5 h-5" : "w-4 h-4"
          )}
        />

        {/* Label */}
        {!isCollapsed && (
          <span className="flex-1">{item.label}</span>
        )}

        {/* Badge */}
        {item.badge && !isCollapsed && (
          <Badge
            variant="secondary"
            className="ml-auto bg-primary text-white text-xs"
          >
            {item.badge}
          </Badge>
        )}

        {/* Expand/Collapse Arrow */}
        {hasChildren && !isCollapsed && (
          <ChevronDown
            className={cn(
              "transition-transform",
              isExpanded && "rotate-180",
              isMobile ? "w-4 h-4 ml-2" : "w-3 h-3 ml-2"
            )}
          />
        )}

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
        )}
      </Link>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-96" : "max-h-0"
        )}>
          <div className={cn(
            "space-y-1",
            isMobile ? "pl-8" : "pl-6"
          )}>
            {item.children?.map(child => (
              <Link
                key={child.id}
                href={child.href}
                onClick={onClick}
                className={cn(
                  "flex items-center px-3 py-2 text-sm transition-colors",
                  pathname === child.href
                    ? "text-primary bg-primary/10"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 