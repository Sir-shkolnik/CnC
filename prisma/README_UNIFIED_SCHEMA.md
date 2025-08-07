# 🚀 C&C CRM Unified Database Schema

## 📋 **OVERVIEW**

The C&C CRM Unified Database Schema is a comprehensive, production-ready database design that consolidates all existing schemas and aligns perfectly with the C&C CRM application design, colors, and functionality.

**Version:** 3.0.0  
**Status:** Production Ready  
**Last Updated:** January 2025  

---

## 🎨 **DESIGN ALIGNMENT**

### **🎯 Application Design Integration**
- **Color Scheme:** Aligned with C&C CRM design system (`#00C2FF`, `#19FFA5`, `#121212`)
- **Branding Support:** Multi-company branding with custom colors, logos, and themes
- **UI/UX Consistency:** Database structure supports all frontend components and features
- **Mobile-First:** Optimized for mobile field operations and offline capabilities

### **🏗️ Architecture Principles**
- **Multi-Tenant First:** Every table includes `clientId` and `locationId` scoping
- **Role-Based Access:** Comprehensive RBAC with granular permissions
- **Audit Trail:** Complete audit logging with diff tracking
- **Offline Capability:** Mobile sync and offline data support
- **Scalability:** Optimized indexes and performance tuning

---

## 📊 **SCHEMA STRUCTURE**

### **🏢 Core Entities**
```
User                    # Enhanced user management with preferences
Client                  # Multi-company support with branding
Location                # Geographic and operational locations
TruckJourney           # Core journey management
JourneyStep            # Step-by-step journey workflow
StepActivity           # Activity tracking within steps
AssignedCrew           # Crew assignment and management
JourneyEntry           # Journey notes, photos, GPS data
Media                  # File uploads and media management
AuditEntry             # Complete audit trail
MoveSource             # Lead and customer source tracking
```

### **📦 Storage System**
```
StorageUnit            # Storage unit management
StorageBooking         # Storage booking and reservations
BillingPlan            # Subscription and billing management
```

### **👑 Super Admin System**
```
SuperAdminUser         # Super admin user management
SuperAdminSession      # Super admin session tracking
CompanyAccessLog       # Cross-company access logging
```

### **📱 Mobile App Support**
```
MobileSession          # Mobile device session management
MobileJourneyUpdate    # Real-time journey updates
MobileMediaItem        # Mobile media uploads
MobileNotification     # Push notifications
```

---

## 🎯 **KEY FEATURES**

### **✅ Multi-Company Support**
- **Branding:** Custom colors, logos, themes per company
- **Isolation:** Complete data isolation between companies
- **Scaling:** Support for unlimited companies and locations
- **Management:** Super admin cross-company oversight

### **✅ Enhanced User Management**
- **Roles:** ADMIN, MANAGER, DRIVER, MOVER, DISPATCHER, AUDITOR, SUPER_ADMIN
- **Preferences:** User-specific settings and theme preferences
- **Security:** Two-factor authentication, API keys, session management
- **Mobile:** GPS tracking, offline capabilities, push notifications

### **✅ Journey Management**
- **Workflow:** 4-step journey process (Ready to Go → Points A → New Location → Back to Dispatcher)
- **Tracking:** Real-time GPS, status updates, media uploads
- **Crew:** Dynamic crew assignment and management
- **Approval:** Step-by-step approval workflow with role-based permissions

### **✅ Storage System**
- **Units:** Flexible storage unit management (SMALL, MEDIUM, LARGE, XLARGE, CUSTOM)
- **Booking:** Storage booking and reservation system
- **Billing:** Automated billing and payment tracking
- **Features:** Climate control, security, drive-up access

### **✅ Financial Management**
- **Billing Plans:** Subscription-based billing (BASIC, STANDARD, PREMIUM, ENTERPRISE, CUSTOM)
- **Cost Tracking:** Estimated vs actual costs for journeys
- **Payment Status:** PENDING, INVOICED, PAID, OVERDUE, CANCELLED
- **Currency Support:** Multi-currency support (default: CAD)

### **✅ Audit & Compliance**
- **Complete Audit Trail:** Every action logged with user, timestamp, and diff
- **Severity Levels:** DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Compliance:** GDPR, SOX, and industry compliance ready
- **Reporting:** Built-in audit summary views and functions

---

## 🚀 **QUICK START**

### **1. Database Setup**
```bash
# Run the unified migration
psql -d c_and_c_crm -f prisma/migration_unified.sql

# Load comprehensive seed data
psql -d c_and_c_crm -f prisma/seed_data_comprehensive.sql
```

### **2. Prisma Client Generation**
```bash
# Generate Prisma client from unified schema
npx prisma generate --schema=prisma/schema_unified.prisma
```

### **3. Environment Configuration**
```env
# Database connection
DATABASE_URL="postgresql://c_and_c_user:c_and_c_password@localhost:5432/c_and_c_crm"

# Application settings
NODE_ENV=development
PORT=3000
API_PORT=8000
```

---

## 📁 **FILE STRUCTURE**

```
prisma/
├── schema_unified.prisma           # 🎯 Main unified schema
├── migration_unified.sql           # 🚀 Complete migration script
├── seed_data_comprehensive.sql     # 🌱 Comprehensive seed data
├── README_UNIFIED_SCHEMA.md        # 📖 This documentation
├── schema.prisma                   # 📄 Original schema (legacy)
├── schema_optimized.prisma         # ⚡ Optimized schema (legacy)
├── create_schema.sql               # 🏗️ Original creation script
├── add_mobile_tables.sql           # 📱 Mobile tables (legacy)
├── update_mobile_tables.sql        # 🔄 Mobile table updates (legacy)
├── super_admin_schema.sql          # 👑 Super admin schema (legacy)
├── super_admin_schema_simple.sql   # 👑 Simple super admin (legacy)
└── seed_data.sql                   # 🌱 Basic seed data (legacy)
```

---

## 🎨 **BRANDING & CUSTOMIZATION**

### **Company Branding**
Each company can have custom branding stored in the `Client.settings` field:

```json
{
  "branding": {
    "primaryColor": "#00C2FF",
    "secondaryColor": "#19FFA5",
    "logo": "company-logo.png",
    "theme": "dark"
  },
  "features": {
    "auditTrail": true,
    "aiFeatures": true,
    "crmSync": true,
    "mobileOps": true,
    "storageSystem": true,
    "superAdmin": true
  }
}
```

### **User Preferences**
User-specific preferences stored in `User.preferences`:

```json
{
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": true
  },
  "dashboard": {
    "defaultView": "journeys"
  },
  "mobile": {
    "gpsTracking": true
  }
}
```

---

## 🔧 **PERFORMANCE OPTIMIZATION**

### **📈 Indexes**
- **Composite Indexes:** Optimized for multi-tenant queries
- **Status Indexes:** Fast filtering by status
- **Date Indexes:** Efficient date range queries
- **Full-Text Search:** GIN indexes for text search

### **🔍 Views**
- **ActiveJourneys:** Real-time active journey overview
- **StorageUtilization:** Storage capacity and usage analytics
- **AuditSummary:** Audit trail summary and reporting

### **⚡ Functions**
- **calculate_journey_duration():** Automatic duration calculation
- **get_user_permissions():** Role-based permission checking
- **update_updated_at_column():** Automatic timestamp updates

---

## 🔐 **SECURITY FEATURES**

### **🛡️ Multi-Tenant Security**
- **Data Isolation:** Complete separation between companies
- **Row-Level Security:** Database-level access control
- **Audit Logging:** Every action tracked and logged

### **🔑 Authentication & Authorization**
- **JWT Tokens:** Secure session management
- **API Keys:** Programmatic access control
- **Two-Factor Auth:** Enhanced security for sensitive operations
- **Role-Based Access:** Granular permission system

### **📱 Mobile Security**
- **Device Registration:** Secure mobile device management
- **Offline Encryption:** Encrypted offline data storage
- **Session Management:** Secure mobile session handling

---

## 📊 **DATA MODELS**

### **🏢 Client Model**
```typescript
interface Client {
  id: string;
  name: string;
  industry?: string;
  isFranchise: boolean;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  timezone: string;
  currency: string;
  language: string;
  settings: Json;
  features: Json;
  limits: Json;
  status: ClientStatus;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### **👤 User Model**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locationId: string;
  clientId: string;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  lastLogin?: DateTime;
  preferences: Json;
  apiKey?: string;
  twoFactorEnabled: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### **🚛 TruckJourney Model**
```typescript
interface TruckJourney {
  id: string;
  locationId: string;
  clientId: string;
  date: DateTime;
  status: JourneyStage;
  truckNumber?: string;
  moveSourceId?: string;
  startTime?: DateTime;
  endTime?: DateTime;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  priority: JourneyPriority;
  tags: string[];
  estimatedCost?: Decimal;
  actualCost?: Decimal;
  billingStatus: BillingStatus;
  startLocation?: Json;
  endLocation?: Json;
  routeData?: Json;
  createdBy: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

---

## 🔄 **MIGRATION GUIDE**

### **From Legacy Schema**
1. **Backup Database:** Create full database backup
2. **Run Migration:** Execute `migration_unified.sql`
3. **Verify Data:** Check data integrity and relationships
4. **Update Application:** Point to new unified schema
5. **Test Thoroughly:** Verify all functionality works

### **Migration Steps**
```bash
# 1. Backup existing database
pg_dump c_and_c_crm > backup_before_migration.sql

# 2. Run unified migration
psql -d c_and_c_crm -f prisma/migration_unified.sql

# 3. Load comprehensive seed data
psql -d c_and_c_crm -f prisma/seed_data_comprehensive.sql

# 4. Generate new Prisma client
npx prisma generate --schema=prisma/schema_unified.prisma

# 5. Test application
npm run dev
```

---

## 🧪 **TESTING**

### **Database Tests**
```bash
# Run database connection test
python test_db_connection.py

# Run comprehensive tests
python tests/database/run_comprehensive_tests.py

# Run performance tests
python tests/database/test_performance_connection.py
```

### **Application Tests**
```bash
# Run frontend tests
npm run test

# Run API tests
python -m pytest tests/api/

# Run end-to-end tests
npm run test:e2e
```

---

## 📈 **MONITORING & ANALYTICS**

### **Database Monitoring**
- **Query Performance:** Monitor slow queries and optimize
- **Connection Pooling:** Track database connections
- **Storage Usage:** Monitor database growth
- **Backup Status:** Automated backup monitoring

### **Application Analytics**
- **User Activity:** Track user engagement and usage patterns
- **Journey Metrics:** Monitor journey completion rates
- **Storage Utilization:** Track storage unit usage
- **Financial Performance:** Monitor billing and revenue

---

## 🚀 **DEPLOYMENT**

### **Production Deployment**
```bash
# 1. Run migration on production
psql -d production_db -f prisma/migration_unified.sql

# 2. Load production seed data
psql -d production_db -f prisma/seed_data_comprehensive.sql

# 3. Update application configuration
# 4. Deploy application
# 5. Verify functionality
```

### **Environment Variables**
```env
# Production Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Application Settings
NODE_ENV=production
PORT=3000
API_PORT=8000

# Security
JWT_SECRET=your-jwt-secret
API_KEY_SECRET=your-api-key-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## 📞 **SUPPORT & MAINTENANCE**

### **🔧 Maintenance Tasks**
- **Daily:** Monitor database performance and backups
- **Weekly:** Review audit logs and security events
- **Monthly:** Analyze usage patterns and optimize queries
- **Quarterly:** Review and update security policies

### **🐛 Troubleshooting**
- **Connection Issues:** Check database connectivity and credentials
- **Performance Issues:** Review query performance and indexes
- **Data Integrity:** Verify foreign key constraints and relationships
- **Security Issues:** Review audit logs and access patterns

---

## 📚 **RESOURCES**

### **📖 Documentation**
- [C&C CRM Project Documentation](../Project_docs/)
- [API Documentation](../apps/api/docs/)
- [Frontend Component Library](../apps/frontend/components/)

### **🔗 Related Files**
- [Main Application](../apps/frontend/)
- [API Server](../apps/api/)
- [Project Documentation](../Project_docs/)

---

## 🎉 **CONCLUSION**

The C&C CRM Unified Database Schema represents a comprehensive, production-ready solution that:

✅ **Aligns perfectly** with the application design and branding  
✅ **Supports multi-company** operations with complete isolation  
✅ **Provides enhanced security** with comprehensive audit trails  
✅ **Optimizes performance** with strategic indexing and views  
✅ **Enables mobile operations** with offline capabilities  
✅ **Scales efficiently** for enterprise-level deployments  

This unified schema is the foundation for a robust, scalable, and feature-rich CRM system that meets all current and future business requirements.

---

**Last Updated:** January 2025  
**Version:** 3.0.0  
**Status:** Production Ready 🚀 