// Super Admin Types and Interfaces
import { SuperAdminRole, AccessActionType, CompanyType, CompanyStatus, LocationOwnershipType, StorageType } from './enums';

export interface SuperAdminUser {
  id: string;
  username: string;
  email: string;
  role: SuperAdminRole;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminSession {
  id: string;
  superAdminId: string;
  sessionToken: string;
  currentCompanyId?: string;
  permissionsScope: SuperAdminPermissions;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
}

export interface SuperAdminPermissions {
  // Company Management
  VIEW_ALL_COMPANIES: boolean;
  CREATE_COMPANIES: boolean;
  UPDATE_COMPANIES: boolean;
  DELETE_COMPANIES: boolean;
  
  // User Management
  VIEW_ALL_USERS: boolean;
  CREATE_USERS: boolean;
  UPDATE_USERS: boolean;
  DELETE_USERS: boolean;
  
  // Location Management
  VIEW_ALL_LOCATIONS: boolean;
  CREATE_LOCATIONS: boolean;
  UPDATE_LOCATIONS: boolean;
  DELETE_LOCATIONS: boolean;
  
  // Journey Management
  VIEW_ALL_JOURNEYS: boolean;
  CREATE_JOURNEYS: boolean;
  UPDATE_JOURNEYS: boolean;
  DELETE_JOURNEYS: boolean;
  
  // System Management
  MANAGE_SYSTEM_SETTINGS: boolean;
  VIEW_AUDIT_LOGS: boolean;
  EXPORT_DATA: boolean;
}

export interface CompanyAccessLog {
  id: string;
  superAdminId: string;
  companyId: string;
  actionType: AccessActionType;
  actionDetails?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SuperAdminAuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    superAdmin: SuperAdminUser;
    expiresIn: number;
  };
}

export interface CompanyContextResponse {
  success: boolean;
  message: string;
  data: {
    currentCompany: Company;
    availableCompanies: Company[];
    permissionsScope: SuperAdminPermissions;
  };
}

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  status: CompanyStatus;
  contactEmail: string;
  contactPhone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminAnalytics {
  totalCompanies: number;
  totalUsers: number;
  totalLocations: number;
  totalJourneys: number;
  activeJourneys: number;
  completedJourneys: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

// API Request/Response Types

export interface SuperAdminLoginRequest {
  username: string;
  password: string;
}

export interface SuperAdminLogoutRequest {
  sessionToken: string;
}

export interface SwitchCompanyRequest {
  companyId: string;
}

export interface GetCompaniesRequest {
  page?: number;
  limit?: number;
  search?: string;
  type?: CompanyType | 'ALL';
  status?: CompanyStatus | 'ALL';
}

export interface CreateCompanyRequest {
  name: string;
  type: CompanyType;
  contactEmail: string;
  contactPhone: string;
  address: string;
  settings?: Record<string, any>;
}

export interface UpdateCompanyRequest {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  settings?: Record<string, any>;
  status?: CompanyStatus;
}

export interface GetUsersRequest {
  companyId?: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
}

export interface CreateUserRequest {
  companyId: string;
  username: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
  profile: Record<string, any>;
}

export interface GetLocationsRequest {
  companyId?: string;
  page?: number;
  limit?: number;
  search?: string;
  province?: string;
  storageType?: StorageType;
  cxCare?: boolean;
}

export interface CreateLocationRequest {
  companyId: string;
  name: string;
  contact: string;
  directLine: string;
  ownershipType: LocationOwnershipType;
  trucks: number;
  storageType: StorageType;
  storagePricing: string;
  cxCare: boolean;
  province: string;
  region: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface GetJourneysRequest {
  companyId?: string;
  locationId?: string;
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface GetAuditLogsRequest {
  companyId?: string;
  userId?: string;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ExportDataRequest {
  dataType: 'USERS' | 'JOURNEYS' | 'LOCATIONS' | 'AUDIT_LOGS';
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  format: 'CSV' | 'JSON' | 'EXCEL';
}

// Super Admin Menu Items
export interface SuperAdminMenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string | null;
  children: SuperAdminMenuItem[];
  permission?: keyof SuperAdminPermissions;
} 