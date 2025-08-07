export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  ARCHIVED = 'ARCHIVED'
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum SalesActivityType {
  PHONE_CALL = 'PHONE_CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  FOLLOW_UP = 'FOLLOW_UP',
  DEMO = 'DEMO',
  SITE_VISIT = 'SITE_VISIT',
  OTHER = 'OTHER'
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  unit?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  leadSource?: string;
  leadStatus: string;
  assignedTo?: string;
  assignedUserName?: string;
  estimatedValue?: number;
  notes?: string;
  tags: string[];
  preferences: Record<string, any>;
  isActive: boolean;
  leadCount: number;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  leadSource?: string;
  leadStatus?: LeadStatus;
  assignedTo?: string;
  estimatedValue?: number;
  notes?: string;
  tags?: string[];
  preferences?: Record<string, any>;
}

export interface CustomerUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  leadSource?: string;
  leadStatus?: LeadStatus;
  assignedTo?: string;
  estimatedValue?: number;
  notes?: string;
  tags?: string[];
  preferences?: Record<string, any>;
  isActive?: boolean;
}

export interface Lead {
  id: string;
  customerId: string;
  source: string;
  status: string;
  priority: string;
  estimatedMoveDate?: string;
  estimatedValue?: number;
  notes?: string;
  followUpDate?: string;
  lastContact?: string;
  contactHistory: Record<string, any>[];
  score: number;
  qualificationCriteria: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreate {
  source: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  estimatedMoveDate?: string;
  estimatedValue?: number;
  notes?: string;
  followUpDate?: string;
  contactHistory?: Record<string, any>[];
  score?: number;
  qualificationCriteria?: Record<string, any>;
}

export interface LeadUpdate {
  source?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  estimatedMoveDate?: string;
  estimatedValue?: number;
  notes?: string;
  followUpDate?: string;
  lastContact?: string;
  contactHistory?: Record<string, any>[];
  score?: number;
  qualificationCriteria?: Record<string, any>;
}

export interface SalesActivity {
  id: string;
  leadId?: string;
  customerId?: string;
  userId: string;
  userName?: string;
  type: string;
  subject?: string;
  description: string;
  outcome?: string;
  nextAction?: string;
  scheduledDate?: string;
  completedDate?: string;
  duration?: number;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesActivityCreate {
  leadId?: string;
  customerId?: string;
  type: SalesActivityType;
  subject?: string;
  description: string;
  outcome?: string;
  nextAction?: string;
  scheduledDate?: string;
  completedDate?: string;
  duration?: number;
  cost?: number;
  notes?: string;
}

export interface SalesActivityUpdate {
  leadId?: string;
  customerId?: string;
  type?: SalesActivityType;
  subject?: string;
  description?: string;
  outcome?: string;
  nextAction?: string;
  scheduledDate?: string;
  completedDate?: string;
  duration?: number;
  cost?: number;
  notes?: string;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  conversionRate: number;
  averageDealSize: number;
  leadStatusBreakdown: {
    NEW: number;
    CONTACTED: number;
    QUALIFIED: number;
    PROPOSAL_SENT: number;
    NEGOTIATION: number;
    WON: number;
    LOST: number;
    ARCHIVED: number;
  };
}

export interface LeadAnalytics {
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  leadsByPriority: Record<string, number>;
  leadsBySource: Record<string, number>;
  conversionRate: number;
  averageScore: number;
}

export interface SalesActivityAnalytics {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByUser: Record<string, number>;
  averageDuration: number;
  totalCost: number;
} 