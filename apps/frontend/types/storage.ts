// Storage System TypeScript Interfaces
// Based on 17_storage_system.md and 18_storage_system_manager.md

import type {
  StorageUnitType, 
  StorageUnitStatus, 
  StorageLocationType, 
  StorageLocationStatus, 
  PaymentStatus, 
  BookingStatus, 
  StorageUserRole,
  Currency,
  BillingCycle,
  PaymentMethod,
  DiscountType,
  DiscountPolicyType,
  AccessType,
  SecurityFeatureType,
  AlertSeverity,
  AlertType,
  MaintenanceType,
  TemperatureUnit,
  BookingSource,
  BookingUrgency,
  ChangeType,
  ApiResponseStatus
} from './enums';


// Storage Unit Interfaces
export interface StorageSize {
  width: number;
  length: number;
  height: number;
  unit: 'feet' | 'meters';
}

export interface MapPosition {
  x: number;
  y: number;
  rotation: number;
  gridPosition: GridPosition;
}

export interface GridPosition {
  row: number;
  column: number;
}

export interface StoragePricing {
  basePrice: number;
  currency: Currency;
  billingCycle: BillingCycle;
  discounts: Discount[];
}

export interface Discount {
  id: string;
  type: DiscountType;
  value: number;
  description: string;
  validFrom: Date;
  validTo: Date;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  startDate: Date;
  endDate?: Date;
  paymentStatus: PaymentStatus;
}

export interface StorageFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: MaintenanceType;
  description: string;
  cost: number;
  performedBy: string;
  notes: string;
}

export interface StorageUnit {
  id: string;
  locationId: string;
  type: StorageUnitType;
  size: StorageSize;
  position: MapPosition;
  status: StorageUnitStatus;
  pricing: StoragePricing;
  customer?: CustomerInfo;
  features: StorageFeature[];
  maintenanceHistory: MaintenanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

// Storage Location Interfaces
export interface StorageLocation {
  id: string;
  name: string;
  companyId: string;
  type: StorageLocationType;
  status: StorageLocationStatus;
  address: {
    street: string;
    city: string;
    province: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contact: {
    manager: string;
    phone: string;
    email: string;
    emergency: string;
  };
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
    timezone: string;
  };
  storage: {
    types: StorageUnitType[];
    totalCapacity: number;
    availableCapacity: number;
    layout: StorageLayout;
    security: SecurityFeatures[];
  };
  policies: {
    accessHours: string;
    securityRequirements: string[];
    maintenanceSchedule: string;
    emergencyProcedures: string;
  };
  pricing: {
    baseRates: StoragePricing;
    discounts: DiscountPolicy[];
    paymentTerms: PaymentTerms;
    lateFees: LateFeePolicy;
  };
}

export interface StorageLayout {
  width: number;
  length: number;
  height: number;
  unit: 'feet' | 'meters';
  gridSize: number;
  accessPaths: AccessPath[];
}

export interface AccessPath {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  width: number;
  type: 'MAIN' | 'SECONDARY' | 'EMERGENCY';
}

export interface SecurityFeatures {
  id: string;
  name: string;
  type: SecurityFeatureType;
  enabled: boolean;
  description: string;
}

export interface DiscountPolicy {
  id: string;
  name: string;
  type: DiscountPolicyType;
  value: number;
  conditions: string[];
  validFrom: Date;
  validTo: Date;
}

export interface PaymentTerms {
  dueDate: number; // days from invoice
  lateFeePercentage: number;
  gracePeriod: number;
  autoRenewal: boolean;
}

export interface LateFeePolicy {
  percentage: number;
  minimumAmount: number;
  maximumAmount: number;
  gracePeriod: number;
}

// Storage Zone Interface
export interface StorageZone {
  id: string;
  locationId: string;
  name: string;
  type: StorageUnitType | 'MIXED';
  status: StorageLocationStatus;
  layout: {
    width: number;
    length: number;
    height: number;
    unit: 'feet' | 'meters';
    gridSize: number;
    accessPaths: AccessPath[];
  };
  capacity: {
    totalUnits: number;
    availableUnits: number;
    reservedUnits: number;
    maintenanceUnits: number;
    utilizationRate: number;
  };
  security: {
    accessType: AccessType;
    surveillance: boolean;
    lighting: boolean;
    fencing: boolean;
    accessLogs: boolean;
  };
  environment: {
    climateControlled: boolean;
    temperature: {
      min: number;
      max: number;
      unit: TemperatureUnit;
    };
    humidity: {
      min: number;
      max: number;
    };
    ventilation: boolean;
  };
}

// Storage Map Interface
export interface StorageMap {
  locationId: string;
  mapConfig: MapConfiguration;
  storageUnits: StorageUnit[];
  zones: StorageZone[];
  capacity: StorageCapacity;
  realTimeData: RealTimeStorageData;
}

export interface MapConfiguration {
  width: number;
  height: number;
  gridSize: number;
  snapToGrid: boolean;
  collisionDetection: boolean;
  undoRedo: boolean;
}

export interface StorageCapacity {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  utilizationRate: number;
}

export interface RealTimeStorageData {
  lastUpdated: Date;
  activeUsers: number;
  recentChanges: StorageChange[];
  alerts: StorageAlert[];
}

export interface StorageChange {
  id: string;
  timestamp: Date;
  userId: string;
  unitId: string;
  changeType: ChangeType;
  oldValue: any;
  newValue: any;
}

export interface StorageAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// Drag and Drop Configuration
export interface DragDropConfig {
  draggable: boolean;
  resizable: boolean;
  rotatable: boolean;
  snapToGrid: boolean;
  collisionDetection: boolean;
  undoRedo: boolean;
}

// Analytics Interfaces
export interface StorageAnalytics {
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  utilizationRate: number;
  revenuePerUnit: number;
  totalRevenue: number;
  averageOccupancy: number;
  turnoverRate: number;
}

export interface OperationalKPIs {
  utilization: {
    overallUtilization: number;
    unitUtilization: number;
    zoneUtilization: number;
    seasonalUtilization: number;
  };
  customerService: {
    responseTime: number;
    resolutionTime: number;
    customerSatisfaction: number;
    complaintRate: number;
  };
  maintenance: {
    preventiveMaintenance: number;
    emergencyMaintenance: number;
    maintenanceCost: number;
    downtime: number;
  };
  security: {
    securityIncidents: number;
    unauthorizedAccess: number;
    securityResponseTime: number;
    complianceScore: number;
  };
}

export interface FinancialKPIs {
  revenue: {
    totalRevenue: number;
    revenuePerUnit: number;
    revenueGrowth: number;
    averageOccupancy: number;
  };
  costs: {
    operationalCosts: number;
    maintenanceCosts: number;
    securityCosts: number;
    staffCosts: number;
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    returnOnInvestment: number;
    breakEvenPoint: number;
  };
  billing: {
    paymentOnTime: number;
    latePayments: number;
    collectionRate: number;
    averagePaymentTime: number;
  };
}

// Booking Interfaces
export interface StorageBooking {
  id: string;
  unitId: string;
  customerId: string;
  startDate: Date;
  endDate?: Date;
  totalCost: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWorkflow {
  step1: {
    customerInquiry: {
      source: BookingSource;
      requirements: StorageRequirements;
      timeline: BookingTimeline;
    };
  };
  step2: {
    availabilityCheck: {
      location: string;
      unitType: StorageUnitType;
      size: StorageSize;
      duration: number;
      startDate: Date;
    };
  };
  step3: {
    pricingCalculation: {
      basePrice: number;
      duration: number;
      discounts: Discount[];
      taxes: number;
      totalPrice: number;
    };
  };
  step4: {
    customerRegistration: {
      personalInfo: CustomerInfo;
      contactInfo: ContactDetails;
      paymentInfo: StoragePaymentMethod;
      termsAcceptance: boolean;
    };
  };
  step5: {
    bookingConfirmation: {
      bookingId: string;
      unitAssignment: StorageUnit;
      accessInstructions: AccessInfo;
      paymentConfirmation: PaymentConfirmation;
    };
  };
  step6: {
    customerOnboarding: {
      welcomeEmail: boolean;
      accessCodeIssuance: boolean;
      facilityOrientation: boolean;
      supportContact: boolean;
    };
  };
}

export interface StorageRequirements {
  size: StorageSize;
  type: StorageUnitType;
  duration: number;
  specialNeeds: string[];
  budget: number;
}

export interface BookingTimeline {
  startDate: Date;
  endDate?: Date;
  flexible: boolean;
  urgency: BookingUrgency;
}

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface StoragePaymentMethod {
  type: PaymentMethod;
  details: any;
  autoRenewal: boolean;
}

export interface AccessInfo {
  accessCode: string;
  accessHours: string;
  facilityRules: string[];
  emergencyContact: string;
}

export interface PaymentConfirmation {
  transactionId: string;
  amount: number;
  status: ApiResponseStatus;
  receipt: string;
}

// User Permissions Interface
export interface UserPermissions {
  system: {
    configuration: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    maintenance: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    backups: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
  companies: {
    create: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    read: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    update: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    delete: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
  locations: {
    create: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    read: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    update: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    delete: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
  storage_units: {
    create: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    read: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    update: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    delete: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    layout: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
  customers: {
    create: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    read: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    update: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    delete: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
  bookings: {
    create: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    read: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    update: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    cancel: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
  analytics: {
    system_wide: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    financial: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    operational: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
  audit: {
    logs: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    compliance: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
    reports: 'FULL_ACCESS' | 'READ_ONLY' | 'NO_ACCESS';
  };
}

export interface StorageUser {
  id: string;
  username: string;
  email: string;
  role: StorageUserRole;
  permissions: UserPermissions;
  companyId?: string;
  locationId?: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Interfaces
export interface StorageFilter {
  locationId?: string;
  type?: StorageUnitType;
  status?: StorageUnitStatus;
  size?: StorageSize;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface LocationFilter {
  companyId?: string;
  type?: StorageLocationType;
  status?: StorageLocationStatus;
  province?: string;
  hasStorage?: boolean;
} 