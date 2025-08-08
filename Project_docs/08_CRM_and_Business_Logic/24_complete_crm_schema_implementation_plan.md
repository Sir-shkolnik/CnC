# Complete CRM Schema Implementation Plan

## 🎯 **COMPREHENSIVE CRM SCHEMA IMPLEMENTATION**

**Last Updated:** January 2025  
**Version:** 3.0.0  
**Status:** 🚀 **PLANNING - Complete CRM Schema Implementation**

---

## 📊 **CURRENT SCHEMA ANALYSIS**

### **✅ EXISTING STRENGTHS**
- **Operations Management:** 85% complete (TruckJourney, JourneyStep, AssignedCrew)
- **Multi-Tenant Architecture:** Complete (Client, Location, User isolation)
- **Mobile Field Operations:** Complete (MobileSession, MobileJourneyUpdate)
- **Storage Management:** Complete (StorageUnit, StorageBooking, BillingPlan)
- **Audit & Compliance:** Complete (AuditEntry, RolePermission)
- **Super Admin System:** Complete (SuperAdminUser, SuperAdminSession)

### **❌ MISSING CRM FUNCTIONALITY**
- **Customer Management:** 0% (No Customer, Lead models)
- **Sales Pipeline:** 0% (No Quote, QuoteItem models)
- **Financial Operations:** 0% (No Invoice, Payment models)
- **Equipment Management:** 0% (No Equipment, Inventory models)
- **Scheduling System:** 0% (No Schedule, Availability models)
- **Reporting & Analytics:** 0% (No Report, Dashboard models)
- **Communication System:** 0% (No Communication, Template models)
- **Integration System:** 0% (No Integration, Webhook models)

---

## 🚀 **COMPLETE CRM SCHEMA IMPLEMENTATION**

### **Phase 1: Customer & Sales Management (Critical)**

#### **1. Customer Management Models**
```prisma
// Customer Management
model Customer {
  id          String   @id @default(cuid())
  clientId    String
  firstName   String
  lastName    String
  email       String
  phone       String
  address     Json     // Full address structure with validation
  leadSource  String?  // Website, referral, cold call, social media
  leadStatus  LeadStatus @default(NEW)
  assignedTo  String?  // Sales rep user ID
  estimatedValue Decimal? @db.Decimal(10,2)
  notes       String?
  tags        String[]
  preferences Json?    // Customer preferences and settings
  isActive    Boolean  @default(true)
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  assignedUser User?   @relation("CustomerAssignment", fields: [assignedTo], references: [id], onDelete: SetNull)
  
  // CRM Relations
  leads       Lead[]
  quotes      Quote[]
  invoices    Invoice[]
  communications Communication[]
  
  // Journey Relations (when customer becomes active)
  journeys    TruckJourney[]
  
  // Indexes for performance
  @@index([clientId, leadStatus])
  @@index([clientId, isActive])
  @@index([email, clientId])
  @@index([assignedTo, leadStatus])
  @@index([createdAt])
  
  // Unique constraints
  @@unique([email, clientId])
  @@unique([phone, clientId])
}

model Lead {
  id          String   @id @default(cuid())
  customerId  String
  source      String   // Website, referral, cold call, social media, trade show
  status      LeadStatus @default(NEW)
  priority    LeadPriority @default(MEDIUM)
  estimatedMoveDate DateTime?
  estimatedValue Decimal? @db.Decimal(10,2)
  notes       String?
  followUpDate DateTime?
  lastContact DateTime?
  contactHistory Json? // Array of contact attempts and responses
  
  // Lead scoring
  score       Int      @default(0)
  qualificationCriteria Json? // Lead qualification checklist
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  // Sales pipeline relations
  quotes      Quote[]
  activities  SalesActivity[]
  
  // Indexes for performance
  @@index([customerId, status])
  @@index([status, priority])
  @@index([followUpDate])
  @@index([estimatedMoveDate])
  @@index([score])
}

model SalesActivity {
  id          String   @id @default(cuid())
  leadId      String?
  customerId  String?
  userId      String
  type        SalesActivityType
  subject     String?
  description String
  outcome     String?
  nextAction  String?
  scheduledDate DateTime?
  completedDate DateTime?
  
  // Activity metadata
  duration    Int?     // Duration in minutes
  cost        Decimal? @db.Decimal(10,2)
  notes       String?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  lead        Lead?    @relation(fields: [leadId], references: [id], onDelete: Cascade)
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  
  // Indexes for performance
  @@index([leadId, type])
  @@index([customerId, type])
  @@index([userId, scheduledDate])
  @@index([scheduledDate, completedDate])
}
```

#### **2. Sales Pipeline Models**
```prisma
model Quote {
  id          String   @id @default(cuid())
  customerId  String
  clientId    String
  locationId  String
  createdBy   String
  status      QuoteStatus @default(DRAFT)
  totalAmount Decimal @db.Decimal(10,2)
  currency    String   @default("CAD")
  validUntil  DateTime
  terms       String?
  notes       String?
  
  // Quote metadata
  version     Int      @default(1)
  isTemplate  Boolean  @default(false)
  templateName String?
  
  // Approval workflow
  approvedBy  String?
  approvedAt  DateTime?
  rejectionReason String?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Restrict)
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  location    Location @relation(fields: [locationId], references: [id], onDelete: Restrict)
  createdUser User     @relation("QuoteCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  approvedUser User?   @relation("QuoteApprover", fields: [approvedBy], references: [id], onDelete: SetNull)
  
  // Sales pipeline relations
  quoteItems  QuoteItem[]
  invoices    Invoice[]
  
  // Journey relation (when quote becomes job)
  journey     TruckJourney?
  
  // Indexes for performance
  @@index([customerId, status])
  @@index([clientId, status])
  @@index([validUntil])
  @@index([createdBy, status])
  @@index([approvedBy])
}

model QuoteItem {
  id          String   @id @default(cuid())
  quoteId     String
  description String
  quantity    Int
  unitPrice   Decimal @db.Decimal(10,2)
  totalPrice  Decimal @db.Decimal(10,2)
  category    QuoteItemCategory
  subcategory String?
  
  // Item metadata
  notes       String?
  isOptional  Boolean  @default(false)
  sortOrder   Int      @default(0)
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  quote       Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([quoteId, category])
  @@index([category, subcategory])
}
```

### **Phase 2: Financial Operations (Critical)**

#### **1. Invoicing System**
```prisma
model Invoice {
  id          String   @id @default(cuid())
  journeyId   String?
  customerId  String
  clientId    String
  quoteId     String?
  invoiceNumber String @unique
  status      InvoiceStatus @default(DRAFT)
  subtotal    Decimal @db.Decimal(10,2)
  taxAmount   Decimal @db.Decimal(10,2)
  totalAmount Decimal @db.Decimal(10,2)
  currency    String  @default("CAD")
  dueDate     DateTime
  paidDate    DateTime?
  paymentMethod String?
  
  // Invoice metadata
  terms       String?
  notes       String?
  isRecurring Boolean  @default(false)
  recurringSchedule Json?
  
  // Tax information
  taxRate     Decimal @db.Decimal(5,4) @default(0.13) // 13% GST/HST
  taxExempt   Boolean  @default(false)
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  journey     TruckJourney? @relation(fields: [journeyId], references: [id], onDelete: SetNull)
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Restrict)
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  quote       Quote?   @relation(fields: [quoteId], references: [id], onDelete: SetNull)
  createdUser User?    @relation("InvoiceCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Financial relations
  payments    Payment[]
  invoiceItems InvoiceItem[]
  
  // Indexes for performance
  @@index([customerId, status])
  @@index([clientId, status])
  @@index([dueDate])
  @@index([invoiceNumber])
  @@index([journeyId])
}

model InvoiceItem {
  id          String   @id @default(cuid())
  invoiceId   String
  description String
  quantity    Int
  unitPrice   Decimal @db.Decimal(10,2)
  totalPrice  Decimal @db.Decimal(10,2)
  category    String
  subcategory String?
  
  // Item metadata
  notes       String?
  sortOrder   Int      @default(0)
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([invoiceId, category])
}

model Payment {
  id          String   @id @default(cuid())
  invoiceId   String
  amount      Decimal @db.Decimal(10,2)
  paymentMethod PaymentMethod
  transactionId String?
  status      PaymentStatus @default(PENDING)
  
  // Payment metadata
  notes       String?
  receiptUrl  String?
  processingFee Decimal? @db.Decimal(10,2)
  
  // Payment gateway data
  gateway     String?  // Stripe, PayPal, Square, etc.
  gatewayData Json?    // Gateway-specific response data
  
  // Audit fields
  processedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([invoiceId])
  @@index([transactionId])
  @@index([status, processedAt])
  @@index([paymentMethod])
}
```

#### **2. Financial Tracking**
```prisma
model FinancialTransaction {
  id          String   @id @default(cuid())
  clientId    String
  type        TransactionType
  amount      Decimal @db.Decimal(10,2)
  currency    String  @default("CAD")
  description String
  category    String
  subcategory String?
  
  // Transaction metadata
  reference   String?  // External reference number
  notes       String?
  tags        String[]
  
  // Date tracking
  transactionDate DateTime
  postedDate     DateTime @default(now())
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  createdUser User?    @relation("TransactionCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Related entities
  invoiceId   String?
  paymentId   String?
  journeyId   String?
  
  // Indexes for performance
  @@index([clientId, type])
  @@index([transactionDate])
  @@index([category, subcategory])
  @@index([reference])
}
```

### **Phase 3: Equipment & Inventory Management**

#### **1. Equipment Management**
```prisma
model Equipment {
  id          String   @id @default(cuid())
  clientId    String
  locationId  String
  name        String
  type        EquipmentType
  serialNumber String?
  status      EquipmentStatus @default(ACTIVE)
  
  // Equipment details
  manufacturer String?
  model       String?
  year        Int?
  capacity    String?  // Weight capacity, volume, etc.
  specifications Json? // Detailed specifications
  
  // Financial tracking
  purchaseDate DateTime?
  purchasePrice Decimal? @db.Decimal(10,2)
  currentValue Decimal? @db.Decimal(10,2)
  depreciationRate Decimal? @db.Decimal(5,4)
  
  // Maintenance tracking
  lastMaintenance DateTime?
  nextMaintenance DateTime?
  maintenanceSchedule Json? // Maintenance intervals
  maintenanceHistory Json? // Maintenance records
  
  // Location tracking
  currentLocation String? // GPS coordinates or location description
  assignedTo     String? // Assigned user
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  location    Location @relation(fields: [locationId], references: [id], onDelete: Restrict)
  assignedUser User?   @relation("EquipmentAssignment", fields: [assignedTo], references: [id], onDelete: SetNull)
  
  // Operational relations
  maintenanceRecords EquipmentMaintenance[]
  assignments        EquipmentAssignment[]
  
  // Indexes for performance
  @@index([clientId, type])
  @@index([locationId, status])
  @@index([status, nextMaintenance])
  @@index([serialNumber])
}

model EquipmentMaintenance {
  id          String   @id @default(cuid())
  equipmentId String
  type        MaintenanceType
  description String
  cost        Decimal? @db.Decimal(10,2)
  performedBy String?
  performedAt DateTime
  nextDueDate DateTime?
  
  // Maintenance details
  notes       String?
  parts       Json?    // Parts used
  laborHours  Decimal? @db.Decimal(5,2)
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  equipment   Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)
  technician  User?     @relation("MaintenanceTechnician", fields: [performedBy], references: [id], onDelete: SetNull)
  
  // Indexes for performance
  @@index([equipmentId, type])
  @@index([performedAt])
  @@index([nextDueDate])
}

model EquipmentAssignment {
  id          String   @id @default(cuid())
  equipmentId String
  journeyId   String?
  userId      String?
  startDate   DateTime
  endDate     DateTime?
  status      AssignmentStatus @default(ACTIVE)
  
  // Assignment details
  notes       String?
  purpose     String?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  equipment   Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)
  journey     TruckJourney? @relation(fields: [journeyId], references: [id], onDelete: SetNull)
  user        User?     @relation("EquipmentUser", fields: [userId], references: [id], onDelete: SetNull)
  
  // Indexes for performance
  @@index([equipmentId, status])
  @@index([journeyId])
  @@index([startDate, endDate])
}
```

#### **2. Inventory Management**
```prisma
model Inventory {
  id          String   @id @default(cuid())
  locationId  String
  itemName    String
  category    String
  subcategory String?
  quantity    Int
  minQuantity Int      // Reorder point
  maxQuantity Int?     // Maximum stock level
  unitCost    Decimal @db.Decimal(10,2)
  unitPrice   Decimal @db.Decimal(10,2)
  
  // Item details
  description String?
  sku         String?  // Stock keeping unit
  barcode     String?
  dimensions  Json?    // Length, width, height, weight
  specifications Json? // Item specifications
  
  // Supplier information
  supplier    String?
  supplierContact String?
  supplierEmail String?
  supplierPhone String?
  
  // Tracking
  lastRestocked DateTime?
  lastUsed      DateTime?
  expiryDate    DateTime?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  location    Location @relation(fields: [locationId], references: [id], onDelete: Restrict)
  createdUser User?    @relation("InventoryCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Inventory relations
  transactions InventoryTransaction[]
  
  // Indexes for performance
  @@index([locationId, category])
  @@index([quantity, minQuantity])
  @@index([sku])
  @@index([supplier])
  @@unique([locationId, sku])
}

model InventoryTransaction {
  id          String   @id @default(cuid())
  inventoryId String
  type        InventoryTransactionType
  quantity    Int
  unitCost    Decimal @db.Decimal(10,2)
  totalCost   Decimal @db.Decimal(10,2)
  
  // Transaction details
  reference   String?  // PO number, invoice number, etc.
  notes       String?
  
  // Audit fields
  transactionDate DateTime @default(now())
  createdAt   DateTime @default(now())
  createdBy   String?

  // Relations
  inventory   Inventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  createdUser User?     @relation("InventoryTransactionCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Indexes for performance
  @@index([inventoryId, type])
  @@index([transactionDate])
  @@index([reference])
}
```

### **Phase 4: Scheduling & Calendar System**

#### **1. Scheduling System**
```prisma
model Schedule {
  id          String   @id @default(cuid())
  locationId  String
  crewId      String?
  userId      String?
  date        DateTime
  startTime   DateTime
  endTime     DateTime
  status      ScheduleStatus @default(SCHEDULED)
  
  // Schedule details
  title       String
  description String?
  type        ScheduleType
  priority    SchedulePriority @default(NORMAL)
  
  // Resource allocation
  equipmentIds String[] // Array of equipment IDs
  vehicleIds   String[] // Array of vehicle IDs
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relations
  location    Location @relation(fields: [locationId], references: [id], onDelete: Restrict)
  crew        AssignedCrew? @relation(fields: [crewId], references: [id], onDelete: SetNull)
  user        User?     @relation("ScheduleUser", fields: [userId], references: [id], onDelete: SetNull)
  createdUser User?     @relation("ScheduleCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Schedule relations
  journey     TruckJourney?
  
  // Indexes for performance
  @@index([locationId, date])
  @@index([userId, date])
  @@index([status, startTime])
  @@index([type, priority])
}

model Availability {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  startTime   DateTime
  endTime     DateTime
  isAvailable Boolean  @default(true)
  
  // Availability details
  reason      String?
  type        AvailabilityType @default(PERSONAL)
  notes       String?
  
  // Recurring availability
  isRecurring Boolean  @default(false)
  recurringPattern Json? // Weekly, monthly pattern
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([userId, date])
  @@index([isAvailable, startTime, endTime])
  @@index([type])
}
```

### **Phase 5: Reporting & Analytics**

#### **1. Reporting System**
```prisma
model Report {
  id          String   @id @default(cuid())
  clientId    String
  reportType  ReportType
  name        String
  description String?
  parameters  Json     // Report filters and parameters
  generatedBy String
  status      ReportStatus @default(PENDING)
  
  // Report details
  fileUrl     String?
  fileSize    Int?
  format      ReportFormat @default(PDF)
  scheduledAt DateTime?
  lastGenerated DateTime?
  
  // Scheduling
  isScheduled Boolean  @default(false)
  schedule    Json?    // Cron expression or schedule pattern
  recipients  String[] // Email addresses
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  generatedUser User   @relation("ReportGenerator", fields: [generatedBy], references: [id], onDelete: Restrict)
  
  // Indexes for performance
  @@index([clientId, reportType])
  @@index([status, scheduledAt])
  @@index([generatedBy])
}

model Dashboard {
  id          String   @id @default(cuid())
  clientId    String
  userId      String
  name        String
  description String?
  layout      Json     // Dashboard layout configuration
  widgets     Json     // Widget configurations
  isDefault   Boolean  @default(false)
  isPublic    Boolean  @default(false)
  
  // Dashboard settings
  refreshInterval Int? // Auto-refresh interval in seconds
  theme        String  @default("dark")
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([clientId, userId])
  @@unique([userId, isDefault])
}
```

### **Phase 6: Communication & Notifications**

#### **1. Communication System**
```prisma
model Communication {
  id          String   @id @default(cuid())
  clientId    String
  type        CommunicationType
  recipient   String
  subject     String?
  content     String
  status      CommunicationStatus @default(DRAFT)
  
  // Communication details
  templateId  String?
  variables   Json?    // Template variables
  attachments Json?    // File attachments
  
  // Delivery tracking
  sentAt      DateTime?
  deliveredAt DateTime?
  readAt      DateTime?
  failedAt    DateTime?
  failureReason String?
  
  // Metadata
  metadata    Json?
  tags        String[]
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  template    Template? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  createdUser User?    @relation("CommunicationCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Customer relations
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  
  // Indexes for performance
  @@index([clientId, type])
  @@index([status, sentAt])
  @@index([recipient])
  @@index([customerId])
}

model Template {
  id          String   @id @default(cuid())
  clientId    String
  name        String
  type        TemplateType
  subject     String?
  content     String
  variables   Json     // Template variables definition
  isActive    Boolean  @default(true)
  
  // Template details
  description String?
  category    String?
  tags        String[]
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  createdUser User?    @relation("TemplateCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Template relations
  communications Communication[]
  
  // Indexes for performance
  @@index([clientId, type])
  @@index([isActive, category])
}
```

### **Phase 7: Integration & API Management**

#### **1. Integration System**
```prisma
model Integration {
  id          String   @id @default(cuid())
  clientId    String
  name        String
  type        IntegrationType
  config      Json     // API keys, endpoints, etc.
  status      IntegrationStatus @default(ACTIVE)
  
  // Integration details
  description String?
  version     String?
  lastSync    DateTime?
  errorCount  Int      @default(0)
  lastError   String?
  
  // Sync settings
  syncInterval Int?    // Sync interval in minutes
  autoSync    Boolean  @default(true)
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  createdUser User?    @relation("IntegrationCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Integration relations
  syncLogs    IntegrationSyncLog[]
  
  // Indexes for performance
  @@index([clientId, type])
  @@index([status, lastSync])
}

model IntegrationSyncLog {
  id          String   @id @default(cuid())
  integrationId String
  type        SyncType
  status      SyncStatus
  recordsProcessed Int @default(0)
  recordsCreated Int @default(0)
  recordsUpdated Int @default(0)
  recordsFailed Int @default(0)
  
  // Sync details
  startedAt   DateTime @default(now())
  completedAt DateTime?
  duration    Int?     // Duration in seconds
  error       String?
  
  // Audit fields
  createdAt   DateTime @default(now())

  // Relations
  integration Integration @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([integrationId, type])
  @@index([status, startedAt])
}

model Webhook {
  id          String   @id @default(cuid())
  clientId    String
  name        String
  url         String
  events      String[] // Events to trigger webhook
  isActive    Boolean  @default(true)
  
  // Webhook details
  secret      String?
  description String?
  headers     Json?    // Custom headers
  
  // Delivery tracking
  lastTriggered DateTime?
  successCount Int @default(0)
  failureCount Int @default(0)
  lastError    String?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  createdUser User?    @relation("WebhookCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Webhook relations
  deliveries  WebhookDelivery[]
  
  // Indexes for performance
  @@index([clientId, isActive])
  @@index([lastTriggered])
}

model WebhookDelivery {
  id          String   @id @default(cuid())
  webhookId   String
  event       String
  payload     Json
  status      DeliveryStatus
  responseCode Int?
  responseBody String?
  
  // Delivery details
  attemptedAt DateTime @default(now())
  deliveredAt DateTime?
  retryCount  Int      @default(0)
  
  // Audit fields
  createdAt   DateTime @default(now())

  // Relations
  webhook     Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([webhookId, status])
  @@index([attemptedAt])
}
```

---

## 🔐 **ENHANCED RBAC & SECURITY**

### **1. Enhanced Role Permissions**
```prisma
model RolePermission {
  id          String   @id @default(cuid())
  role        UserRole
  resource    String   // Model name (Customer, Quote, Invoice, etc.)
  action      String   // CREATE, READ, UPDATE, DELETE, APPROVE
  canAccess   Boolean  @default(false)
  canCreate   Boolean  @default(false)
  canRead     Boolean  @default(false)
  canUpdate   Boolean  @default(false)
  canDelete   Boolean  @default(false)
  canApprove  Boolean  @default(false)
  
  // Scope restrictions
  scope       PermissionScope @default(OWN) // OWN, LOCATION, CLIENT, ALL
  conditions  Json?    // Additional conditions for access
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  // Relations
  createdUser User?    @relation("PermissionCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  
  // Indexes for performance
  @@index([role, resource])
  @@unique([role, resource, action])
}

model UserPermission {
  id          String   @id @default(cuid())
  userId      String
  resource    String
  action      String
  granted     Boolean  @default(true)
  expiresAt   DateTime?
  
  // Permission details
  reason      String?
  grantedBy   String?
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  grantedUser User?    @relation("PermissionGranter", fields: [grantedBy], references: [id], onDelete: SetNull)
  
  // Indexes for performance
  @@index([userId, resource])
  @@index([expiresAt])
}
```

### **2. Data Encryption & Security**
```prisma
model EncryptedData {
  id          String   @id @default(cuid())
  clientId    String
  entityType  String   // Model name
  entityId    String   // Record ID
  fieldName   String   // Field name
  encryptedValue String // Encrypted value
  encryptionKey String // Key identifier
  
  // Encryption metadata
  algorithm   String   @default("AES-256-GCM")
  iv          String   // Initialization vector
  tag         String?  // Authentication tag
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Restrict)
  
  // Indexes for performance
  @@index([clientId, entityType, entityId])
  @@unique([entityType, entityId, fieldName])
}
```

---

## 🔄 **UPDATED RELATIONSHIPS**

### **1. Enhanced User Model Relations**
```prisma
model User {
  // ... existing fields ...

  // New CRM relations
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

### **2. Enhanced Client Model Relations**
```prisma
model Client {
  // ... existing fields ...

  // New CRM relations
  customers           Customer[]
  leads               Lead[]
  quotes              Quote[]
  invoices            Invoice[]
  payments            Payment[]
  financialTransactions FinancialTransaction[]
  equipment           Equipment[]
  inventory           Inventory[]
  schedules           Schedule[]
  reports             Report[]
  dashboards          Dashboard[]
  communications      Communication[]
  templates           Template[]
  integrations        Integration[]
  webhooks            Webhook[]
  encryptedData       EncryptedData[]
}
```

---

## 📊 **NEW ENUMS**

```prisma
// Customer & Sales Enums
enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  PROPOSAL_SENT
  NEGOTIATION
  WON
  LOST
  ARCHIVED
}

enum LeadPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum QuoteStatus {
  DRAFT
  SENT
  VIEWED
  ACCEPTED
  REJECTED
  EXPIRED
  CONVERTED
}

enum QuoteItemCategory {
  MOVING_SERVICES
  STORAGE_SERVICES
  PACKING_SERVICES
  SPECIALTY_SERVICES
  EQUIPMENT_RENTAL
  INSURANCE
  OTHER
}

enum SalesActivityType {
  PHONE_CALL
  EMAIL
  MEETING
  PROPOSAL_SENT
  FOLLOW_UP
  DEMO
  SITE_VISIT
  OTHER
}

// Financial Enums
enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PARTIAL_PAID
  PAID
  OVERDUE
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  CASH
  CHECK
  BANK_TRANSFER
  CREDIT_CARD
  DEBIT_CARD
  PAYPAL
  STRIPE
  SQUARE
  OTHER
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
  ADJUSTMENT
}

// Equipment & Inventory Enums
enum EquipmentType {
  TRUCK
  TRAILER
  FORKLIFT
  DOLLY
  STRAPS
  BLANKETS
  TOOLS
  OTHER
}

enum EquipmentStatus {
  ACTIVE
  MAINTENANCE
  REPAIR
  RETIRED
  SOLD
}

enum MaintenanceType {
  PREVENTIVE
  CORRECTIVE
  EMERGENCY
  INSPECTION
}

enum AssignmentStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

enum InventoryTransactionType {
  PURCHASE
  SALE
  ADJUSTMENT
  TRANSFER
  DAMAGE
  EXPIRY
}

// Scheduling Enums
enum ScheduleStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RESCHEDULED
}

enum ScheduleType {
  JOURNEY
  MAINTENANCE
  TRAINING
  MEETING
  OTHER
}

enum SchedulePriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum AvailabilityType {
  PERSONAL
  SICK
  VACATION
  TRAINING
  MAINTENANCE
  OTHER
}

// Reporting Enums
enum ReportType {
  FINANCIAL
  OPERATIONAL
  CUSTOMER
  SALES
  INVENTORY
  EQUIPMENT
  CUSTOM
}

enum ReportStatus {
  PENDING
  GENERATING
  COMPLETED
  FAILED
}

enum ReportFormat {
  PDF
  EXCEL
  CSV
  JSON
}

// Communication Enums
enum CommunicationType {
  EMAIL
  SMS
  PUSH_NOTIFICATION
  IN_APP
  LETTER
  PHONE_CALL
}

enum CommunicationStatus {
  DRAFT
  SENT
  DELIVERED
  READ
  FAILED
}

enum TemplateType {
  EMAIL
  SMS
  LETTER
  INVOICE
  QUOTE
  REPORT
}

// Integration Enums
enum IntegrationType {
  ACCOUNTING
  CRM
  EMAIL
  SMS
  PAYMENT
  SHIPPING
  CUSTOM
}

enum IntegrationStatus {
  ACTIVE
  INACTIVE
  ERROR
  SYNCING
}

enum SyncType {
  FULL
  INCREMENTAL
  MANUAL
}

enum SyncStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  RETRY
}

// Permission Enums
enum PermissionScope {
  OWN
  LOCATION
  CLIENT
  ALL
}
```

---

## 🔧 **IMPLEMENTATION STRATEGY**

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