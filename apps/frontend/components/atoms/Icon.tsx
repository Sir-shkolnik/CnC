'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/utils/cn';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className,
  size = 24 
}) => {
  // Map icon names to Lucide React components
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Dashboard
    'LayoutDashboard': LucideIcons.LayoutDashboard,
    'Dashboard': LucideIcons.LayoutDashboard,
    
    // Journey Management
    'Truck': LucideIcons.Truck,
    'Route': LucideIcons.MapPin,
    'Calendar': LucideIcons.Calendar,
    
    // User Management
    'Users': LucideIcons.Users,
    'User': LucideIcons.User,
    'UserCheck': LucideIcons.UserCheck,
    'UserPlus': LucideIcons.UserPlus,
    
    // Client Management
    'Building2': LucideIcons.Building2,
    'Building': LucideIcons.Building,
    'MapPin': LucideIcons.MapPin,
    
    // Crew Management
    'UserCheck': LucideIcons.UserCheck,
    'Users': LucideIcons.Users,
    'Clock': LucideIcons.Clock,
    
    // Audit & Compliance
    'Shield': LucideIcons.Shield,
    'CheckCircle': LucideIcons.CheckCircle,
    'FileText': LucideIcons.FileText,
    'AlertTriangle': LucideIcons.AlertTriangle,
    
    // Feedback
    'MessageSquare': LucideIcons.MessageSquare,
    'MessageCircle': LucideIcons.MessageCircle,
    'Star': LucideIcons.Star,
    
    // Settings
    'Settings': LucideIcons.Settings,
    'Cog': LucideIcons.Cog,
    'Wrench': LucideIcons.Wrench,
    
    // Media
    'Camera': LucideIcons.Camera,
    'Video': LucideIcons.Video,
    'Image': LucideIcons.Image,
    'File': LucideIcons.File,
    
    // GPS & Tracking
    'MapPin': LucideIcons.MapPin,
    'Navigation': LucideIcons.Navigation,
    'Compass': LucideIcons.Compass,
    
    // Communication
    'MessageCircle': LucideIcons.MessageCircle,
    'MessageSquare': LucideIcons.MessageSquare,
    'Phone': LucideIcons.Phone,
    
    // Activities
    'ClipboardList': LucideIcons.ClipboardList,
    'List': LucideIcons.List,
    'CheckSquare': LucideIcons.CheckSquare,
    
    // Reports
    'BarChart3': LucideIcons.BarChart3,
    'PieChart': LucideIcons.PieChart,
    'TrendingUp': LucideIcons.TrendingUp,
    
    // Dispatch
    'Radio': LucideIcons.Radio,
    'WalkieTalkie': LucideIcons.Radio,
    
    // Navigation
    'Home': LucideIcons.Home,
    'ChevronRight': LucideIcons.ChevronRight,
    'ChevronLeft': LucideIcons.ChevronLeft,
    'ChevronDown': LucideIcons.ChevronDown,
    'ChevronUp': LucideIcons.ChevronUp,
    
    // Actions
    'Plus': LucideIcons.Plus,
    'Edit': LucideIcons.Edit,
    'Trash': LucideIcons.Trash,
    'Eye': LucideIcons.Eye,
    'Download': LucideIcons.Download,
    'Upload': LucideIcons.Upload,
    
    // Status
    'Check': LucideIcons.Check,
    'X': LucideIcons.X,
    'AlertCircle': LucideIcons.AlertCircle,
    'Info': LucideIcons.Info,
    
    // Default fallback
    'default': LucideIcons.Circle
  };

  const IconComponent = iconMap[name] || iconMap['default'];

  return (
    <IconComponent 
      className={cn("transition-colors", className)} 
      size={size}
    />
  );
}; 