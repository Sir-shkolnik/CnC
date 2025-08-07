// Centralized Enums for C&C CRM
// Standardized enum definitions aligned with database schema

// User Management Enums
export type UserRole = 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'MOVER' | 'MANAGER' | 'AUDITOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// Journey Management Enums
export type JourneyStage = 'MORNING_PREP' | 'EN_ROUTE' | 'ONSITE' | 'COMPLETED' | 'AUDITED';
export type EntryType = 'PHOTO' | 'NOTE' | 'GPS' | 'SIGNATURE' | 'CONFIRMATION';
export type TagType = 'DAMAGE' | 'COMPLETED' | 'FEEDBACK' | 'ERROR' | 'ISSUE';
export type MediaType = 'PHOTO' | 'VIDEO' | 'SIGNATURE';

// Super Admin Enums
export type SuperAdminRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'AUDITOR' | 'SUPPORT_ADMIN';
export type AccessActionType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'COMPANY_SWITCH'
  | 'USER_VIEW'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'JOURNEY_VIEW'
  | 'JOURNEY_CREATE'
  | 'JOURNEY_UPDATE'
  | 'JOURNEY_DELETE'
  | 'LOCATION_VIEW'
  | 'LOCATION_CREATE'
  | 'LOCATION_UPDATE'
  | 'LOCATION_DELETE'
  | 'AUDIT_VIEW'
  | 'SETTINGS_UPDATE';

// Storage System Enums
export type StorageUnitType = 'POD' | 'LOCKER' | 'CONTAINER';
export type StorageUnitStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type StorageLocationType = 'CORPORATE' | 'FRANCHISE';
export type StorageLocationStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type BookingStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
export type StorageUserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'LOCATION_MANAGER' | 'STORAGE_OPERATOR' | 'CUSTOMER_SERVICE' | 'FINANCE_MANAGER' | 'AUDITOR' | 'CUSTOMER';

// Permission Enums
export type Permission = 
  | 'journey.create'
  | 'journey.edit'
  | 'journey.delete'
  | 'journey.view'
  | 'user.create'
  | 'user.edit'
  | 'user.delete'
  | 'user.view'
  | 'client.create'
  | 'client.edit'
  | 'client.delete'
  | 'client.view'
  | 'crew.assign'
  | 'crew.view'
  | 'audit.view'
  | 'audit.create'
  | 'feedback.view'
  | 'feedback.create'
  | 'settings.edit'
  | 'settings.view'
  | 'storage.create'
  | 'storage.edit'
  | 'storage.delete'
  | 'storage.view'
  | 'booking.create'
  | 'booking.edit'
  | 'booking.delete'
  | 'booking.view';

// Company and Location Enums
export type CompanyType = 'CORPORATE' | 'FRANCHISE';
export type CompanyStatus = 'ACTIVE' | 'INACTIVE';
export type LocationOwnershipType = 'CORPORATE' | 'FRANCHISE';
export type StorageType = 'LOCKER' | 'POD' | 'NO';

// Financial Enums
export type Currency = 'CAD' | 'USD';
export type BillingCycle = 'MONTHLY' | 'WEEKLY' | 'DAILY';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountPolicyType = 'LOYALTY' | 'SEASONAL' | 'BULK' | 'PROMOTIONAL';

// Security and Access Enums
export type AccessType = 'KEY' | 'CODE' | 'CARD' | 'BIOMETRIC';
export type SecurityFeatureType = 'SURVEILLANCE' | 'ACCESS_CONTROL' | 'LIGHTING' | 'FENCING';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'CAPACITY' | 'MAINTENANCE' | 'SECURITY' | 'PAYMENT';

// Maintenance Enums
export type MaintenanceType = 'PREVENTIVE' | 'EMERGENCY' | 'REPAIR';
export type TemperatureUnit = 'celsius' | 'fahrenheit';

// Booking and Customer Enums
export type BookingSource = 'WEBSITE' | 'PHONE' | 'WALK_IN' | 'REFERRAL';
export type BookingUrgency = 'LOW' | 'MEDIUM' | 'HIGH';
export type ChangeType = 'POSITION' | 'STATUS' | 'CUSTOMER' | 'MAINTENANCE';

// API Response Enums
export type ApiResponseStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

// Export all enums for easy importing
export {
  UserRole,
  UserStatus,
  JourneyStage,
  EntryType,
  TagType,
  MediaType,
  SuperAdminRole,
  AccessActionType,
  StorageUnitType,
  StorageUnitStatus,
  StorageLocationType,
  StorageLocationStatus,
  PaymentStatus,
  BookingStatus,
  StorageUserRole,
  Permission,
  CompanyType,
  CompanyStatus,
  LocationOwnershipType,
  StorageType,
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
}; 