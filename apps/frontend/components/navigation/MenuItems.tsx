'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { MenuItem } from './MenuItem';
import { cn } from '@/utils/cn';
import { MenuItem as MenuItemType } from '@/types/menu';

interface MenuItemsProps {
  items: MenuItemType[];
  isCollapsed?: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
}

export const MenuItems: React.FC<MenuItemsProps> = ({
  items,
  isCollapsed = false,
  isMobile = false,
  onItemClick
}) => {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}; 