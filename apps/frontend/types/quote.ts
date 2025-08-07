export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CONVERTED = 'CONVERTED'
}

export enum QuoteItemCategory {
  MOVING_SERVICES = 'MOVING_SERVICES',
  STORAGE_SERVICES = 'STORAGE_SERVICES',
  PACKING_SERVICES = 'PACKING_SERVICES',
  SPECIALTY_SERVICES = 'SPECIALTY_SERVICES',
  EQUIPMENT_RENTAL = 'EQUIPMENT_RENTAL',
  INSURANCE = 'INSURANCE',
  OTHER = 'OTHER'
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  clientId: string;
  locationId: string;
  createdBy: string;
  createdUserName?: string;
  status: string;
  totalAmount: number;
  currency: string;
  validUntil: string;
  terms?: string;
  notes?: string;
  version: number;
  isTemplate: boolean;
  templateName?: string;
  approvedBy?: string;
  approvedUserName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteCreate {
  customerId: string;
  totalAmount: number;
  currency?: string;
  validUntil?: string;
  terms?: string;
  notes?: string;
  status?: QuoteStatus;
  version?: number;
  isTemplate?: boolean;
  templateName?: string;
}

export interface QuoteUpdate {
  totalAmount?: number;
  currency?: string;
  validUntil?: string;
  terms?: string;
  notes?: string;
  status?: QuoteStatus;
  version?: number;
  isTemplate?: boolean;
  templateName?: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  subcategory?: string;
  notes?: string;
  isOptional: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItemCreate {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: QuoteItemCategory;
  subcategory?: string;
  notes?: string;
  isOptional?: boolean;
  sortOrder?: number;
}

export interface QuoteItemUpdate {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  category?: QuoteItemCategory;
  subcategory?: string;
  notes?: string;
  isOptional?: boolean;
  sortOrder?: number;
}

export interface QuoteAnalytics {
  totalQuotes: number;
  quotesByStatus: Record<string, number>;
  totalValue: number;
  conversionRate: number;
  convertedQuotes: number;
}

export interface SalesPipelineAnalytics {
  pipeline: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
}

export interface ConversionAnalytics {
  conversionByMonth: Array<{
    month: string;
    totalQuotes: number;
    convertedQuotes: number;
    conversionRate: number;
    convertedValue: number;
  }>;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  totalAmount: number;
  currency: string;
  terms?: string;
  notes?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteTemplateCreate {
  name: string;
  description?: string;
  totalAmount: number;
  currency?: string;
  terms?: string;
  notes?: string;
  items?: QuoteItemCreate[];
} 