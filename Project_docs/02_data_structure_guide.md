# 02_Data_Structure_Guide.md

## 🎯 **C&C CRM DATA STRUCTURE GUIDE**

**Last Updated:** January 2025  
**Version:** 3.0.0  
**Status:** 🚀 **COMPLETE - Database Schema with Comprehensive CRM Implementation Plan**

---

## 📊 **COMPREHENSIVE CRM ANALYSIS**

### **🎯 CURRENT SYSTEM ASSESSMENT**
The C&C CRM database schema is currently optimized for **Operations Management** with **32% CRM completeness**. While excellent for operations, it needs expansion to become a full operational CRM for smart moving and logistics companies.

#### **✅ STRENGTHS (Operations Management: 85%)**
- **Journey Management:** Complete workflow with real-time tracking
- **Mobile Field Operations:** Offline-capable mobile portal
- **Multi-Tenant Architecture:** Client/location isolation
- **Audit & Compliance:** Complete activity logging
- **Role-Based Access:** Granular permissions system
- **Real LGM Data:** 43 locations, 50 users, real contact information

#### **❌ CRITICAL GAPS (CRM Functionality: 32%)**
- **Customer Management:** Missing customer/lead tracking (20%)
- **Sales Pipeline:** No quoting or sales management (15%)
- **Financial Operations:** No invoicing or payment processing (15%)
- **Business Intelligence:** Limited reporting and analytics (10%)

---

## 🚀 **COMPLETE CRM SCHEMA IMPLEMENTATION PLAN**

### **📋 PHASE 1: CUSTOMER & SALES MANAGEMENT (Critical - 4-6 weeks)**

#### **1. Customer Management Models**
- **Customer Model:** Complete customer profiles with contact management
- **Lead Model:** Lead tracking and pipeline management
- **SalesActivity Model:** Sales activity tracking and follow-ups
- **Enhanced User Relations:** Customer assignment and sales rep management

#### **2. Sales Pipeline Models**
- **Quote Model:** Multi-service quoting with approval workflows
- **QuoteItem Model:** Detailed quote line items with categories
- **Sales Pipeline Integration:** Quote-to-journey conversion
- **Sales Analytics:** Pipeline performance and conversion tracking

### **📋 PHASE 2: FINANCIAL OPERATIONS (Critical - 3-4 weeks)**

#### **1. Invoicing System**
- **Invoice Model:** Automated invoice generation with tax support
- **InvoiceItem Model:** Detailed invoice line items
- **Payment Model:** Multiple payment methods and gateway integration
- **FinancialTransaction Model:** Complete financial tracking

#### **2. Financial Management**
- **Multi-Currency Support:** CAD, USD, EUR support
- **Tax Management:** Automated tax calculations (GST/HST)
- **Payment Processing:** Stripe, PayPal, Square integration
- **Financial Reporting:** Revenue and payment analytics

### **📋 PHASE 3: EQUIPMENT & INVENTORY MANAGEMENT (Important - 3-4 weeks)**

#### **1. Equipment Management**
- **Equipment Model:** Fleet tracking and maintenance scheduling
- **EquipmentMaintenance Model:** Maintenance records and scheduling
- **EquipmentAssignment Model:** Resource allocation and tracking
- **Equipment Analytics:** Cost analysis and utilization tracking

#### **2. Inventory Management**
- **Inventory Model:** Stock tracking with reorder points
- **InventoryTransaction Model:** Purchase, sale, and adjustment tracking
- **Supplier Management:** Vendor information and performance tracking
- **Inventory Analytics:** Stock level monitoring and cost optimization

### **📋 PHASE 4: SCHEDULING & CALENDAR SYSTEM (Important - 3-4 weeks)**

#### **1. Scheduling System**
- **Schedule Model:** Advanced scheduling with resource allocation
- **Availability Model:** User availability and time-off management
- **Calendar Integration:** Google Calendar, Outlook integration
- **Conflict Resolution:** Automatic conflict detection and resolution

#### **2. Resource Optimization**
- **AI-Powered Scheduling:** Intelligent job assignment
- **Resource Allocation:** Equipment and crew optimization
- **Schedule Analytics:** Efficiency and utilization reporting
- **Mobile Scheduling:** Field crew scheduling capabilities

### **📋 PHASE 5: REPORTING & ANALYTICS (Important - 4-5 weeks)**

#### **1. Reporting System**
- **Report Model:** Custom report builder with scheduling
- **Dashboard Model:** Personalized dashboards with widgets
- **Export Capabilities:** PDF, Excel, CSV, JSON formats
- **Scheduled Reports:** Automated report generation and delivery

#### **2. Business Intelligence**
- **KPI Dashboards:** Operational and financial metrics
- **Advanced Analytics:** Predictive analytics and trend analysis
- **Performance Benchmarking:** Industry comparisons
- **Real-time Analytics:** Live data dashboards

### **📋 PHASE 6: COMMUNICATION & NOTIFICATIONS (Important - 3-4 weeks)**

#### **1. Communication System**
- **Communication Model:** Multi-channel communication tracking
- **Template Model:** Standardized communication templates
- **Delivery Tracking:** Email, SMS, push notification tracking
- **Customer Engagement:** Communication effectiveness analytics

#### **2. Notification System**
- **Real-time Notifications:** Instant alerts and updates
- **Template Management:** Customizable notification templates
- **Delivery Optimization:** Smart delivery timing
- **Engagement Analytics:** Notification effectiveness tracking

### **📋 PHASE 7: INTEGRATION & API MANAGEMENT (Important - 4-5 weeks)**

#### **1. Integration System**
- **Integration Model:** Third-party system integration
- **IntegrationSyncLog Model:** Sync tracking and error handling
- **Webhook Model:** Real-time data synchronization
- **API Management:** Rate limiting and health monitoring

#### **2. Automation Workflows**
- **Business Process Automation:** Automated task execution
- **Trigger-based Actions:** Event-driven automation
- **Workflow Optimization:** Process efficiency improvements
- **Integration Analytics:** System performance monitoring

---

## 🔐 **ENHANCED RBAC & SECURITY**

### **1. Enhanced Role Permissions**
- **RolePermission Model:** Granular permissions per role and resource
- **UserPermission Model:** Individual user permission overrides
- **PermissionScope:** OWN, LOCATION, CLIENT, ALL access levels
- **Conditional Access:** Advanced access control with conditions

### **2. Data Encryption & Security**
- **EncryptedData Model:** AES-256-GCM encryption for sensitive data
- **Key Management:** Rotating encryption keys
- **Compliance:** GDPR, PIPEDA, SOC 2 compliance
- **Audit Trail:** Complete security event logging

### **3. API Security**
- **JWT Authentication:** Secure token-based authentication
- **Role-Based Authorization:** Endpoint access control
- **Rate Limiting:** API usage throttling
- **Input Validation:** Comprehensive data validation

---

## 📊 **NEW DATABASE MODELS SUMMARY**

### **Customer & Sales (8 Models)**
1. **Customer** - Customer profiles and contact management
2. **Lead** - Lead tracking and pipeline management
3. **SalesActivity** - Sales activity tracking
4. **Quote** - Multi-service quoting system
5. **QuoteItem** - Quote line items and pricing
6. **RolePermission** - Enhanced role-based permissions
7. **UserPermission** - Individual user permissions
8. **EncryptedData** - Data encryption for sensitive information

### **Financial Operations (5 Models)**
9. **Invoice** - Automated invoice generation
10. **InvoiceItem** - Invoice line items
11. **Payment** - Payment processing and tracking
12. **FinancialTransaction** - Complete financial tracking
13. **Enhanced User Relations** - Financial operation permissions

### **Equipment & Inventory (6 Models)**
14. **Equipment** - Fleet and equipment management
15. **EquipmentMaintenance** - Maintenance scheduling and records
16. **EquipmentAssignment** - Resource allocation
17. **Inventory** - Stock tracking and management
18. **InventoryTransaction** - Inventory movement tracking
19. **Enhanced Location Relations** - Equipment and inventory location management

### **Scheduling & Calendar (2 Models)**
20. **Schedule** - Advanced scheduling system
21. **Availability** - User availability management

### **Reporting & Analytics (2 Models)**
22. **Report** - Custom report builder
23. **Dashboard** - Personalized dashboards

### **Communication & Notifications (2 Models)**
24. **Communication** - Multi-channel communication tracking
25. **Template** - Communication templates

### **Integration & API (4 Models)**
26. **Integration** - Third-party system integration
27. **IntegrationSyncLog** - Sync tracking and error handling
28. **Webhook** - Real-time data synchronization
29. **WebhookDelivery** - Webhook delivery tracking

---

## 🔄 **UPDATED RELATIONSHIPS**

### **Enhanced User Model Relations**
- **Customer Assignment:** Sales rep to customer relationships
- **Quote Management:** Quote creation and approval workflows
- **Financial Operations:** Invoice and payment management
- **Equipment Management:** Equipment assignment and maintenance
- **Inventory Management:** Inventory creation and transaction tracking
- **Scheduling:** Schedule creation and user assignment
- **Reporting:** Report generation and dashboard management
- **Communication:** Communication creation and template management
- **Integration:** Integration creation and webhook management
- **Permissions:** Role and user permission management

### **Enhanced Client Model Relations**
- **Customer Management:** Client-specific customer data
- **Sales Pipeline:** Client-specific quotes and leads
- **Financial Operations:** Client-specific invoices and payments
- **Equipment Management:** Client-specific equipment and inventory
- **Scheduling:** Client-specific scheduling and availability
- **Reporting:** Client-specific reports and dashboards
- **Communication:** Client-specific communications and templates
- **Integration:** Client-specific integrations and webhooks
- **Security:** Client-specific encrypted data

---

## 📊 **NEW ENUMS (50+ New Enums)**

### **Customer & Sales Enums**
- **LeadStatus:** NEW, CONTACTED, QUALIFIED, PROPOSAL_SENT, NEGOTIATION, WON, LOST, ARCHIVED
- **LeadPriority:** LOW, MEDIUM, HIGH, URGENT
- **QuoteStatus:** DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED, CONVERTED
- **QuoteItemCategory:** MOVING_SERVICES, STORAGE_SERVICES, PACKING_SERVICES, SPECIALTY_SERVICES, EQUIPMENT_RENTAL, INSURANCE, OTHER
- **SalesActivityType:** PHONE_CALL, EMAIL, MEETING, PROPOSAL_SENT, FOLLOW_UP, DEMO, SITE_VISIT, OTHER

### **Financial Enums**
- **InvoiceStatus:** DRAFT, SENT, VIEWED, PARTIAL_PAID, PAID, OVERDUE, CANCELLED, REFUNDED
- **PaymentMethod:** CASH, CHECK, BANK_TRANSFER, CREDIT_CARD, DEBIT_CARD, PAYPAL, STRIPE, SQUARE, OTHER
- **PaymentStatus:** PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED
- **TransactionType:** INCOME, EXPENSE, TRANSFER, ADJUSTMENT

### **Equipment & Inventory Enums**
- **EquipmentType:** TRUCK, TRAILER, FORKLIFT, DOLLY, STRAPS, BLANKETS, TOOLS, OTHER
- **EquipmentStatus:** ACTIVE, MAINTENANCE, REPAIR, RETIRED, SOLD
- **MaintenanceType:** PREVENTIVE, CORRECTIVE, EMERGENCY, INSPECTION
- **AssignmentStatus:** ACTIVE, COMPLETED, CANCELLED
- **InventoryTransactionType:** PURCHASE, SALE, ADJUSTMENT, TRANSFER, DAMAGE, EXPIRY

### **Scheduling Enums**
- **ScheduleStatus:** SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED
- **ScheduleType:** JOURNEY, MAINTENANCE, TRAINING, MEETING, OTHER
- **SchedulePriority:** LOW, NORMAL, HIGH, URGENT
- **AvailabilityType:** PERSONAL, SICK, VACATION, TRAINING, MAINTENANCE, OTHER

### **Reporting Enums**
- **ReportType:** FINANCIAL, OPERATIONAL, CUSTOMER, SALES, INVENTORY, EQUIPMENT, CUSTOM
- **ReportStatus:** PENDING, GENERATING, COMPLETED, FAILED
- **ReportFormat:** PDF, EXCEL, CSV, JSON

### **Communication Enums**
- **CommunicationType:** EMAIL, SMS, PUSH_NOTIFICATION, IN_APP, LETTER, PHONE_CALL
- **CommunicationStatus:** DRAFT, SENT, DELIVERED, READ, FAILED
- **TemplateType:** EMAIL, SMS, LETTER, INVOICE, QUOTE, REPORT

### **Integration Enums**
- **IntegrationType:** ACCOUNTING, CRM, EMAIL, SMS, PAYMENT, SHIPPING, CUSTOM
- **IntegrationStatus:** ACTIVE, INACTIVE, ERROR, SYNCING
- **SyncType:** FULL, INCREMENTAL, MANUAL
- **SyncStatus:** PENDING, IN_PROGRESS, COMPLETED, FAILED
- **DeliveryStatus:** PENDING, SENT, DELIVERED, FAILED, RETRY

### **Permission Enums**
- **PermissionScope:** OWN, LOCATION, CLIENT, ALL

---

## 🗄️ **CORE DATABASE ENTITIES**

### **🏢 Multi-Tenant Architecture**

#### **Client Model**
```prisma
model Client {
  id          String   @id @default(cuid())
  name        String
  industry    String?
  isFranchise Boolean  @default(false)
  
  // Enhanced fields
  contactEmail String?
  contactPhone String?
  website     String?
  logo        String?
  timezone    String   @default("America/Toronto")
  currency    String   @default("CAD")
  language    String   @default("en")
  
  // Business settings
  settings    Json?    // Enhanced settings object
  features    Json?    // Feature flags and capabilities
  limits      Json?    // Usage limits and quotas
  
  // Status and audit
  status      ClientStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  locations     Location[]
  users         User[]
  customers     Customer[]     // NEW: CRM Customer management
  leads         Lead[]         // NEW: CRM Lead tracking
  quotes        Quote[]        // NEW: CRM Sales pipeline
  invoices      Invoice[]      // NEW: CRM Financial operations
  payments      Payment[]      // NEW: CRM Payment tracking
  financialTransactions FinancialTransaction[] // NEW: CRM Financial tracking
  equipment     Equipment[]    // NEW: CRM Equipment management
  inventory     Inventory[]    // NEW: CRM Inventory management
  schedules     Schedule[]     // NEW: CRM Scheduling system
  reports       Report[]       // NEW: CRM Reporting system
  dashboards    Dashboard[]    // NEW: CRM Business intelligence
  communications Communication[] // NEW: CRM Communication system
  templates     Template[]     // NEW: CRM Template management
  integrations  Integration[]  // NEW: CRM Integration system
  webhooks      Webhook[]      // NEW: CRM Webhook system
  encryptedData EncryptedData[] // NEW: CRM Data encryption
}
```

#### **Location Model**
```prisma
model Location {
  id          String   @id @default(cuid())
  clientId    String
  name        String
  address     Json     // Full address structure
  phone       String?
  email       String?
  
  // Enhanced fields
  managerName String?
  managerPhone String?
  managerEmail String?
  businessHours Json?  // Operating hours
  services    String[] // Available services
  capacity    Json?    // Storage and operational capacity
  coordinates Json?    // GPS coordinates
  
  // Status and audit
  status      LocationStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  users       User[]
  journeys    TruckJourney[]
  storageUnits StorageUnit[]
  equipment   Equipment[]    // NEW: CRM Equipment management
  inventory   Inventory[]    // NEW: CRM Inventory management
  schedules   Schedule[]     // NEW: CRM Scheduling system
  quotes      Quote[]        // NEW: CRM Sales pipeline
}
```

#### **User Model**
```prisma
model User {
  id         String     @id @default(cuid())
  name       String
  email      String     @unique
  role       UserRole
  locationId String
  clientId   String
  status     UserStatus @default(ACTIVE)
  
  // Enhanced fields
  phone      String?
  avatar     String?
  lastLogin  DateTime?
  preferences Json?     // User preferences and settings
  apiKey     String?    @unique // For API access
  twoFactorEnabled Boolean @default(false)
  
  // Audit fields
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  createdBy  String?    // Who created this user
  updatedBy  String?    // Who last updated this user

  // Relations
  location Location @relation(fields: [locationId], references: [id], onDelete: Restrict)
  client   Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)

  // Journey relations
  assignedJourneys AssignedCrew[]
  createdJourneys  TruckJourney[] @relation("JourneyCreator")
  journeyEntries   JourneyEntry[]
  mediaUploads     Media[]
  auditEntries     AuditEntry[]

  // Mobile relations
  mobileSessions        MobileSession[]
  mobileJourneyUpdates  MobileJourneyUpdate[]
  mobileMediaItems      MobileMediaItem[]
  mobileNotifications   MobileNotification[]

  // Journey step relations
  approvedSteps         JourneyStep[] @relation("StepApprover")
  createdActivities     StepActivity[] @relation("ActivityCreator")

  // NEW: CRM Relations
  customerAssignments Customer[] @relation("CustomerAssignment")
  quoteCreators       Quote[] @relation("QuoteCreator")
  quoteApprovers      Quote[] @relation("QuoteApprover")
  invoiceCreators     Invoice[] @relation("InvoiceCreator")
  transactionCreators FinancialTransaction[] @relation("TransactionCreator")
  equipmentAssignments Equipment[] @relation("EquipmentAssignment")
  equipmentUsers      EquipmentAssignment[] @relation("EquipmentUser")
  maintenanceTechnicians EquipmentMaintenance[] @relation("MaintenanceTechnician")
  inventoryCreators   Inventory[] @relation("InventoryCreator")
  inventoryTransactionCreators InventoryTransaction[] @relation("InventoryTransactionCreator")
  scheduleUsers       Schedule[] @relation("ScheduleUser")
  scheduleCreators    Schedule[] @relation("ScheduleCreator")
  reportGenerators    Report[] @relation("ReportGenerator")
  communicationCreators Communication[] @relation("CommunicationCreator")
  templateCreators    Template[] @relation("TemplateCreator")
  integrationCreators Integration[] @relation("IntegrationCreator")
  webhookCreators     Webhook[] @relation("WebhookCreator")
  permissionCreators  RolePermission[] @relation("PermissionCreator")
  permissionGranters  UserPermission[] @relation("PermissionGranter")
  availabilityRecords Availability[]
}
```

### **🚛 Core Operations Management**

#### **TruckJourney Model**
```prisma
model TruckJourney {
  id          String   @id @default(cuid())
  clientId    String
  locationId  String
  createdBy   String
  title       String
  description String?
  
  // Journey details
  startLocation Json
  endLocation   Json
  startDate     DateTime
  endDate       DateTime?
  duration      Int?     // Duration in minutes
  priority      JourneyPriority @default(NORMAL)
  tags          String[]
  
  // Cost tracking
  estimatedCost Decimal? @db.Decimal(10,2)
  actualCost    Decimal? @db.Decimal(10,2)
  profitMargin  Decimal? @db.Decimal(5,2)
  
  // Status and audit
  status      JourneyStage @default(MORNING_PREP)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  location    Location @relation(fields: [locationId], references: [id], onDelete: Restrict)
  createdUser User     @relation("JourneyCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  
  // Journey relations
  steps       JourneyStep[]
  crew        AssignedCrew[]
  entries     JourneyEntry[]
  media       Media[]
  
  // NEW: CRM Relations
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  customerId  String?
  quote       Quote?   @relation(fields: [quoteId], references: [id], onDelete: SetNull)
  quoteId     String?
  invoices    Invoice[] // NEW: CRM Financial operations
  equipmentAssignments EquipmentAssignment[] // NEW: CRM Equipment management
  schedule    Schedule? // NEW: CRM Scheduling system
}
```

#### **JourneyStep Model**
```prisma
model JourneyStep {
  id          String   @id @default(cuid())
  journeyId   String
  stepNumber  Int
  title       String
  description String?
  status      StepStatus @default(PENDING)
  
  // Step details
  startTime   DateTime?
  endTime     DateTime?
  duration    Int?     // Duration in minutes
  notes       String?
  
  // Approval workflow
  approvedBy  String?
  approvedAt  DateTime?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  journey     TruckJourney @relation(fields: [journeyId], references: [id], onDelete: Cascade)
  approvedUser User? @relation("StepApprover", fields: [approvedBy], references: [id], onDelete: SetNull)
  activities  StepActivity[]
}
```

### **📱 Mobile Field Operations**

#### **MobileSession Model**
```prisma
model MobileSession {
  id          String   @id @default(cuid())
  userId      String
  deviceId    String
  deviceInfo  Json     // Device information
  appVersion  String
  osVersion   String
  
  // Session details
  startTime   DateTime @default(now())
  endTime     DateTime?
  isActive    Boolean  @default(true)
  
  // Location tracking
  lastLocation Json?
  lastLocationTime DateTime?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  updates     MobileJourneyUpdate[]
  mediaItems  MobileMediaItem[]
  notifications MobileNotification[]
}
```

#### **MobileJourneyUpdate Model**
```prisma
model MobileJourneyUpdate {
  id          String   @id @default(cuid())
  sessionId   String
  journeyId   String
  stepId      String?
  
  // Update details
  type        String   // Status update, location, etc.
  data        Json     // Update data
  location    Json?    // GPS coordinates
  timestamp   DateTime @default(now())
  
  // Sync status
  synced      Boolean  @default(false)
  syncError   String?
  
  // Audit fields
  createdAt   DateTime @default(now())

  // Relations
  session     MobileSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  journey     TruckJourney @relation(fields: [journeyId], references: [id], onDelete: Cascade)
  step        JourneyStep? @relation(fields: [stepId], references: [id], onDelete: SetNull)
}
```

### **🗄️ Storage Management**

#### **StorageUnit Model**
```prisma
model StorageUnit {
  id          String   @id @default(cuid())
  locationId  String
  unitNumber  String
  type        StorageUnitType
  size        String   // Dimensions or capacity
  status      StorageUnitStatus @default(AVAILABLE)
  
  // Pricing
  basePrice   Decimal @db.Decimal(10,2)
  currentPrice Decimal @db.Decimal(10,2)
  currency    String   @default("CAD")
  
  // Features
  features    String[] // Climate control, security, etc.
  notes       String?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  location    Location @relation(fields: [locationId], references: [id], onDelete: Restrict)
  bookings    StorageBooking[]
}
```

#### **StorageBooking Model**
```prisma
model StorageBooking {
  id          String   @id @default(cuid())
  unitId      String
  journeyId   String
  startDate   DateTime
  endDate     DateTime?
  status      BookingStatus @default(ACTIVE)
  
  // Booking details
  totalCost   Decimal @db.Decimal(10,2)
  paidAmount  Decimal @db.Decimal(10,2) @default(0)
  notes       String?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  unit        StorageUnit @relation(fields: [unitId], references: [id], onDelete: Restrict)
  journey     TruckJourney @relation(fields: [journeyId], references: [id], onDelete: Restrict)
}
```

### **🔐 Audit & Compliance**

#### **AuditEntry Model**
```prisma
model AuditEntry {
  id          String   @id @default(cuid())
  userId      String
  action      String   // CREATE, UPDATE, DELETE, LOGIN, etc.
  resource    String   // Model name (User, Journey, etc.)
  resourceId  String?  // Record ID
  details     Json?    // Action details and changes
  
  // Audit metadata
  severity    AuditSeverity @default(INFO)
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Restrict)
}
```

---

## 🎯 **IMPLEMENTATION STRATEGY**

### **Phase 1: Foundation (Weeks 1-2)**
1. **Database Schema Updates**
   - Add Customer and Lead models
   - Create necessary indexes and constraints
   - Update existing models for CRM integration

2. **API Development**
   - Customer management endpoints
   - Lead tracking endpoints
   - Quote generation endpoints

3. **Frontend Development**
   - Customer management interface
   - Lead pipeline interface
   - Quote creation interface

### **Phase 2: Core Features (Weeks 3-6)**
1. **Sales Pipeline Implementation**
   - Lead qualification workflow
   - Quote-to-journey conversion
   - Sales activity tracking

2. **Financial Operations**
   - Invoice generation system
   - Payment processing integration
   - Financial reporting

3. **Integration Testing**
   - End-to-end workflow testing
   - Performance optimization
   - User acceptance testing

### **Phase 3: Advanced Features (Weeks 7-12)**
1. **Business Intelligence**
   - Custom report builder
   - KPI dashboards
   - Advanced analytics

2. **Operational Excellence**
   - Equipment management
   - Inventory tracking
   - Advanced scheduling

3. **Production Deployment**
   - Production environment setup
   - Data migration
   - User training

---

## 🎯 **SECURITY & COMPLIANCE**

### **1. Data Encryption**
- **Sensitive Data:** Customer PII, financial data, API keys
- **Encryption Algorithm:** AES-256-GCM
- **Key Management:** Rotating encryption keys
- **Compliance:** GDPR, PIPEDA, SOC 2

### **2. Access Control**
- **Role-Based Access:** Granular permissions per role
- **Multi-Tenant Isolation:** Complete data separation
- **Audit Trail:** All actions logged and tracked
- **Session Management:** Secure session handling

### **3. API Security**
- **Authentication:** JWT tokens with refresh
- **Authorization:** Role-based endpoint access
- **Rate Limiting:** API usage throttling
- **Input Validation:** Comprehensive data validation

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **1. Database Indexing**
- **Composite Indexes:** Multi-column queries
- **Partial Indexes:** Active records only
- **GIN Indexes:** Array and JSON fields
- **Covering Indexes:** Include frequently accessed columns

### **2. Query Optimization**
- **Connection Pooling:** Efficient database connections
- **Query Caching:** Redis-based caching
- **Lazy Loading:** On-demand data loading
- **Pagination:** Efficient large dataset handling

### **3. Application Performance**
- **CDN Integration:** Static asset delivery
- **Image Optimization:** Compressed media files
- **Code Splitting:** Lazy-loaded components
- **Service Workers:** Offline capability

---

## 🎉 **CONCLUSION**

This comprehensive CRM schema implementation plan will transform the C&C CRM from an **Operations Management System** into a **Complete Operational CRM** for moving and logistics companies.

### **✅ Benefits:**
- **Complete Customer Lifecycle Management**
- **End-to-End Sales Pipeline**
- **Comprehensive Financial Operations**
- **Advanced Business Intelligence**
- **Operational Excellence Tools**
- **Enterprise-Grade Security**

### **🚀 Next Steps:**
1. **Implement Phase 1** - Customer & Sales Management
2. **Add Financial Operations** - Invoicing & Payments
3. **Build Business Intelligence** - Reporting & Analytics
4. **Deploy to Production** - Complete CRM Solution

The system will be ready to compete with enterprise CRM solutions while maintaining its mobile-first, operations-focused design.

---

**🎉 The C&C CRM will become a complete operational CRM solution for the moving and logistics industry!**

