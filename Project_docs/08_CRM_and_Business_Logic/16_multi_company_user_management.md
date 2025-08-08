# 16_Multi_Company_User_Management.md

## 🏢 Multi-Company User Management System

**System:** C&C CRM Super Admin Management  
**Super Admin:** udi.shkolnik  
**Last Updated:** January 2025  
**Status:** Backend Implementation Complete - Ready for Frontend  

---

## 📋 **OVERVIEW**

This document defines the multi-company user management system that allows super admin users (like `udi.shkolnik`) to access and manage all companies, locations, users, and data across the entire C&C CRM platform. This system provides:

- **Cross-Company Access:** View and manage all companies and their data
- **Company Selection:** Choose which company to work with
- **Data Isolation:** Maintain proper data separation while allowing oversight
- **Audit Trail:** Track all super admin actions across companies
- **Role-Based Permissions:** Different levels of access for different super admin roles

---

## 👤 **SUPER ADMIN USER**

### **Primary Super Admin**
```json
{
  "username": "udi.shkolnik",
  "email": "udi.shkolnik@lgm.com",
  "password": "Id200633048!",
  "role": "SUPER_ADMIN",
  "permissions": [
    "VIEW_ALL_COMPANIES",
    "MANAGE_ALL_USERS",
    "ACCESS_ALL_LOCATIONS",
    "VIEW_ALL_JOURNEYS",
    "MANAGE_SYSTEM_SETTINGS",
    "AUDIT_ALL_ACTIONS"
  ],
  "status": "ACTIVE",
  "created_at": "2025-01-01T00:00:00Z",
  "last_login": null
}
```

### **Super Admin Roles**
| Role | Description | Permissions |
|------|-------------|-------------|
| **SUPER_ADMIN** | Full system access | All permissions |
| **COMPANY_ADMIN** | Multi-company management | Company management, user oversight |
| **AUDITOR** | Read-only access to all data | View permissions only |
| **SUPPORT_ADMIN** | Customer support access | Limited management permissions |

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **Database Schema Extensions**

#### **Super Admin Users Table**
```sql
CREATE TABLE super_admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role SUPER_ADMIN_ROLE NOT NULL DEFAULT 'SUPER_ADMIN',
    permissions JSONB NOT NULL DEFAULT '[]',
    status USER_STATUS NOT NULL DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES super_admin_users(id),
    updated_by UUID REFERENCES super_admin_users(id)
);
```

#### **Company Access Logs Table**
```sql
CREATE TABLE company_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admin_users(id),
    company_id UUID NOT NULL REFERENCES clients(id),
    action_type ACCESS_ACTION_TYPE NOT NULL,
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Super Admin Sessions Table**
```sql
CREATE TABLE super_admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admin_users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    current_company_id UUID REFERENCES clients(id),
    permissions_scope JSONB,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);
```

### **Enums and Types**
```sql
-- Super admin roles
CREATE TYPE super_admin_role AS ENUM (
    'SUPER_ADMIN',
    'COMPANY_ADMIN', 
    'AUDITOR',
    'SUPPORT_ADMIN'
);

-- Access action types
CREATE TYPE access_action_type AS ENUM (
    'LOGIN',
    'LOGOUT',
    'COMPANY_SWITCH',
    'USER_VIEW',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'JOURNEY_VIEW',
    'JOURNEY_CREATE',
    'JOURNEY_UPDATE',
    'JOURNEY_DELETE',
    'LOCATION_VIEW',
    'LOCATION_CREATE',
    'LOCATION_UPDATE',
    'LOCATION_DELETE',
    'AUDIT_VIEW',
    'SETTINGS_UPDATE'
);
```

---

## 🔐 **AUTHENTICATION & AUTHORIZATION**

### **Super Admin Authentication Flow**
```typescript
interface SuperAdminAuth {
  // Login
  login: {
    username: string;
    password: string;
  };
  
  // Response
  response: {
    success: boolean;
    message: string;
    data: {
      access_token: string;
      refresh_token: string;
      super_admin: {
        id: string;
        username: string;
        email: string;
        role: SuperAdminRole;
        permissions: string[];
        current_company_id?: string;
      };
      expires_in: number;
    };
  };
}
```

### **Permission System**
```typescript
interface SuperAdminPermissions {
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
```

### **Company Context Switching**
```typescript
interface CompanyContext {
  // Switch company context
  switchCompany: {
    company_id: string;
  };
  
  // Response
  response: {
    success: boolean;
    message: string;
    data: {
      current_company: {
        id: string;
        name: string;
        type: 'CORPORATE' | 'FRANCHISE';
        status: string;
      };
      available_companies: Company[];
      permissions_scope: SuperAdminPermissions;
    };
  };
}
```

---

## 🛠️ **BACKEND API ENDPOINTS**

### **Authentication Endpoints**
```typescript
// POST /api/super-admin/auth/login
interface SuperAdminLoginRequest {
  username: string;
  password: string;
}

// POST /api/super-admin/auth/logout
interface SuperAdminLogoutRequest {
  session_token: string;
}

// GET /api/super-admin/auth/me
interface SuperAdminProfileResponse {
  id: string;
  username: string;
  email: string;
  role: SuperAdminRole;
  permissions: string[];
  current_company?: Company;
  available_companies: Company[];
}
```

### **Company Management Endpoints**
```typescript
// GET /api/super-admin/companies
interface GetCompaniesRequest {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'CORPORATE' | 'FRANCHISE' | 'ALL';
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
}

// GET /api/super-admin/companies/{company_id}
interface GetCompanyRequest {
  company_id: string;
}

// POST /api/super-admin/companies
interface CreateCompanyRequest {
  name: string;
  type: 'CORPORATE' | 'FRANCHISE';
  contact_email: string;
  contact_phone: string;
  address: string;
  settings: CompanySettings;
}

// PATCH /api/super-admin/companies/{company_id}
interface UpdateCompanyRequest {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  settings?: CompanySettings;
  status?: 'ACTIVE' | 'INACTIVE';
}

// DELETE /api/super-admin/companies/{company_id}
interface DeleteCompanyRequest {
  company_id: string;
  force?: boolean;
}
```

### **User Management Endpoints**
```typescript
// GET /api/super-admin/users
interface GetUsersRequest {
  company_id?: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
}

// GET /api/super-admin/users/{user_id}
interface GetUserRequest {
  user_id: string;
}

// POST /api/super-admin/users
interface CreateUserRequest {
  company_id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  profile: UserProfile;
}

// PATCH /api/super-admin/users/{user_id}
interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: UserRole;
  permissions?: string[];
  profile?: UserProfile;
  status?: 'ACTIVE' | 'INACTIVE';
}

// DELETE /api/super-admin/users/{user_id}
interface DeleteUserRequest {
  user_id: string;
  force?: boolean;
}
```

### **Location Management Endpoints**
```typescript
// GET /api/super-admin/locations
interface GetLocationsRequest {
  company_id?: string;
  page?: number;
  limit?: number;
  search?: string;
  province?: string;
  storage_type?: 'LOCKER' | 'POD' | 'NO';
  cx_care?: boolean;
}

// GET /api/super-admin/locations/{location_id}
interface GetLocationRequest {
  location_id: string;
}

// POST /api/super-admin/locations
interface CreateLocationRequest {
  company_id: string;
  name: string;
  contact: string;
  direct_line: string;
  ownership_type: 'CORPORATE' | 'FRANCHISE';
  trucks: number;
  storage_type: 'LOCKER' | 'POD' | 'NO';
  storage_pricing: string;
  cx_care: boolean;
  province: string;
  region: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// PATCH /api/super-admin/locations/{location_id}
interface UpdateLocationRequest {
  name?: string;
  contact?: string;
  direct_line?: string;
  trucks?: number;
  storage_type?: 'LOCKER' | 'POD' | 'NO';
  storage_pricing?: string;
  cx_care?: boolean;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status?: 'ACTIVE' | 'INACTIVE';
}
```

### **Journey Management Endpoints**
```typescript
// GET /api/super-admin/journeys
interface GetJourneysRequest {
  company_id?: string;
  location_id?: string;
  page?: number;
  limit?: number;
  status?: JourneyStage;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// GET /api/super-admin/journeys/{journey_id}
interface GetJourneyRequest {
  journey_id: string;
}

// POST /api/super-admin/journeys
interface CreateJourneyRequest {
  company_id: string;
  location_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_address: string;
  delivery_address: string;
  scheduled_date: string;
  estimated_duration: number;
  crew_size: number;
  special_requirements?: string;
}

// PATCH /api/super-admin/journeys/{journey_id}
interface UpdateJourneyRequest {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  pickup_address?: string;
  delivery_address?: string;
  scheduled_date?: string;
  estimated_duration?: number;
  crew_size?: number;
  special_requirements?: string;
  status?: JourneyStage;
}
```

### **Audit & Analytics Endpoints**
```typescript
// GET /api/super-admin/audit-logs
interface GetAuditLogsRequest {
  company_id?: string;
  user_id?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// GET /api/super-admin/analytics/overview
interface GetAnalyticsOverviewResponse {
  total_companies: number;
  total_users: number;
  total_locations: number;
  total_journeys: number;
  active_journeys: number;
  completed_journeys: number;
  revenue_this_month: number;
  revenue_last_month: number;
}

// GET /api/super-admin/analytics/company/{company_id}
interface GetCompanyAnalyticsRequest {
  company_id: string;
  date_from?: string;
  date_to?: string;
}

// GET /api/super-admin/analytics/export
interface ExportDataRequest {
  data_type: 'USERS' | 'JOURNEYS' | 'LOCATIONS' | 'AUDIT_LOGS';
  company_id?: string;
  date_from?: string;
  date_to?: string;
  format: 'CSV' | 'JSON' | 'EXCEL';
}
```

---

## ✅ **BACKEND IMPLEMENTATION COMPLETE**

### **Completed Components**

#### **✅ Phase 1: Database Setup**
- **✅ Created super admin tables** (`super_admin_users`, `super_admin_sessions`, `company_access_logs`)
- **✅ Added performance indexes** for all tables
- **✅ Created database schema** (`super_admin_schema.sql`)
- **✅ Set up foreign key relationships** and constraints
- **✅ Created database functions** for session validation and access logging

#### **✅ Phase 2: Authentication System**
- **✅ Implemented super admin login/logout** endpoints (`/super-admin/auth/login`, `/super-admin/auth/logout`)
- **✅ Created session token management** with UUID-based tokens
- **✅ Added password hashing** using bcrypt
- **✅ Implemented session management** with company context switching

#### **✅ Phase 3: Company Management**
- **✅ Created company CRUD endpoints** (`/super-admin/companies`)
- **✅ Implemented company switching** functionality (`/super-admin/auth/switch-company`)
- **✅ Added company filtering** and search capabilities
- **✅ Created company analytics** endpoints

#### **✅ Phase 4: User Management**
- **✅ Implemented cross-company user management** (`/super-admin/users`)
- **✅ Added user creation/editing** with company assignment
- **✅ Created user search** and filtering by company, role, status
- **✅ Implemented user analytics** and reporting

#### **✅ Phase 5: Analytics & Audit**
- **✅ Implemented comprehensive audit logging** (`/super-admin/audit-logs`)
- **✅ Added analytics overview** (`/super-admin/analytics/overview`)
- **✅ Created audit report generation** with filtering
- **✅ Implemented security measures** and permission validation

### **Backend Files Created**

#### **Database Schema**
- `prisma/super_admin_schema.sql` - Complete database schema with tables, indexes, and functions

#### **Authentication Middleware**
- `apps/api/middleware/super_admin_auth.py` - Super admin authentication and authorization

#### **API Routes**
- `apps/api/routes/super_admin.py` - Complete super admin API endpoints

#### **Main Application**
- Updated `apps/api/main.py` to include super admin routes

#### **Testing**
- `test_super_admin.py` - Comprehensive test suite for all super admin functionality

### **API Endpoints Implemented**

#### **Authentication**
- `POST /super-admin/auth/login` - Super admin login
- `POST /super-admin/auth/logout` - Super admin logout
- `GET /super-admin/auth/me` - Get super admin profile
- `POST /super-admin/auth/switch-company` - Switch company context

#### **Company Management**
- `GET /super-admin/companies` - Get all companies with filtering
- `GET /super-admin/companies/{company_id}` - Get specific company
- `POST /super-admin/companies` - Create new company
- `PATCH /super-admin/companies/{company_id}` - Update company

#### **User Management**
- `GET /super-admin/users` - Get all users with filtering
- `GET /super-admin/users/{user_id}` - Get specific user
- `POST /super-admin/users` - Create new user

#### **Analytics & Audit**
- `GET /super-admin/analytics/overview` - Get system overview analytics
- `GET /super-admin/audit-logs` - Get audit logs with filtering

### **Security Features Implemented**

#### **Authentication Security**
- **Strong password hashing** using bcrypt
- **Session-based authentication** with UUID tokens
- **Automatic session expiration** (24 hours)
- **Failed login attempt tracking**

#### **Authorization Security**
- **Role-based access control** for all operations
- **Permission validation** on every request
- **Company context validation** for data access
- **Audit logging** for all actions

#### **Data Security**
- **Input validation** and sanitization
- **SQL injection prevention** using parameterized queries
- **Secure communication** using HTTPS
- **Data encryption** for sensitive information

### **Testing Results**

#### **Test Coverage**
- **✅ Health Check** - API connectivity
- **✅ Authentication** - Login/logout functionality
- **✅ Profile Management** - User profile and company access
- **✅ Company Management** - CRUD operations and filtering
- **✅ Company Switching** - Context switching functionality
- **✅ User Management** - Cross-company user operations
- **✅ Analytics** - System overview and reporting
- **✅ Audit Logs** - Access logging and filtering
- **✅ Logout** - Session termination

#### **Test Script**
Run the complete test suite:
```bash
cd c-and-c-crm
python test_super_admin.py
```

### **Database Setup Instructions**

#### **Apply Database Schema**
```bash
# Connect to PostgreSQL and run the schema
psql -h localhost -U c_and_c_user -d c_and_c_crm -f prisma/super_admin_schema.sql
```

#### **Verify Setup**
```bash
# Check if super admin user was created
psql -h localhost -U c_and_c_user -d c_and_c_crm -c "SELECT username, role, status FROM super_admin_users;"
```

### **API Testing Examples**

#### **Login as Super Admin**
```bash
curl -X POST http://localhost:8000/super-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "udi.shkolnik", "password": "Id200633048!"}'
```

#### **Get All Companies**
```bash
curl -X GET http://localhost:8000/super-admin/companies \
  -H "Authorization: Bearer {session_token}"
```

#### **Switch Company Context**
```bash
curl -X POST http://localhost:8000/super-admin/auth/switch-company \
  -H "Authorization: Bearer {session_token}" \
  -H "Content-Type: application/json" \
  -d '{"company_id": "{company_id}"}'
```

#### **Get Analytics Overview**
```bash
curl -X GET http://localhost:8000/super-admin/analytics/overview \
  -H "Authorization: Bearer {session_token}"
```

## 🔧 **FRONTEND IMPLEMENTATION PLAN**

### **Phase 1: Super Admin Authentication**
1. **Create super admin login page** with proper styling
2. **Implement session management** in frontend
3. **Add authentication guards** for protected routes
4. **Create logout functionality**

### **Phase 2: Company Management Interface**
1. **Build company selector component** with search and filtering
2. **Create company management dashboard** with CRUD operations
3. **Implement company switching** functionality
4. **Add company analytics** visualization

### **Phase 3: User Management Interface**
1. **Create user management dashboard** with cross-company view
2. **Implement user creation/editing** forms
3. **Add user search and filtering** capabilities
4. **Create user analytics** and reporting

### **Phase 4: Analytics Dashboard**
1. **Build analytics overview** with charts and metrics
2. **Create audit log viewer** with filtering
3. **Implement data export** functionality
4. **Add real-time monitoring** capabilities

### **Phase 5: Integration & Testing**
1. **Integrate with existing frontend** components
2. **Add responsive design** for mobile devices
3. **Implement error handling** and user feedback
4. **Create comprehensive frontend tests**

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
```python
# Test super admin authentication
def test_super_admin_login():
    # Test valid credentials
    # Test invalid credentials
    # Test locked account
    # Test expired password

# Test company management
def test_company_crud():
    # Test create company
    # Test read company
    # Test update company
    # Test delete company

# Test user management
def test_cross_company_user_management():
    # Test create user in company
    # Test update user across companies
    # Test delete user
    # Test user search and filtering
```

### **Integration Tests**
```python
# Test complete workflows
def test_super_admin_workflow():
    # Login as super admin
    # Switch between companies
    # Create users in different companies
    # View analytics across companies
    # Export data

# Test security measures
def test_security_measures():
    # Test permission checks
    # Test data isolation
    # Test audit logging
    # Test rate limiting
```

### **API Tests**
```bash
# Test all endpoints
curl -X POST http://localhost:8000/api/super-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "udi.shkolnik", "password": "Id200633048!"}'

curl -X GET http://localhost:8000/api/super-admin/companies \
  -H "Authorization: Bearer {token}"

curl -X GET http://localhost:8000/api/super-admin/users \
  -H "Authorization: Bearer {token}" \
  -H "X-Company-ID: {company_id}"
```

---

## 📊 **DATA FLOW**

### **Super Admin Login Flow**
```
1. Super Admin enters credentials
2. System validates credentials
3. System creates session with permissions
4. System returns access token
5. System logs access attempt
6. Frontend stores token and permissions
```

### **Company Switching Flow**
```
1. Super Admin selects company
2. System validates company access
3. System updates session context
4. System logs company switch
5. Frontend updates UI for selected company
6. All subsequent requests include company context
```

### **Data Access Flow**
```
1. Super Admin requests data
2. System validates permissions
3. System applies company context filter
4. System returns filtered data
5. System logs data access
6. Frontend displays data with company context
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Authentication Security**
- **Strong password requirements** for super admin accounts
- **Multi-factor authentication** for sensitive operations
- **Session timeout** and automatic logout
- **Failed login attempt** tracking and account lockout

### **Authorization Security**
- **Role-based access control** for all operations
- **Permission validation** on every request
- **Company context validation** for data access
- **Audit logging** for all actions

### **Data Security**
- **Data encryption** for sensitive information
- **Secure communication** using HTTPS
- **Input validation** and sanitization
- **SQL injection** prevention

### **Audit & Compliance**
- **Comprehensive audit trails** for all actions
- **Data access logging** with timestamps
- **User activity monitoring** and alerts
- **Compliance reporting** capabilities

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Backend Deployment**
- [ ] Database migrations applied
- [ ] Super admin user created
- [ ] Environment variables configured
- [ ] Security measures implemented
- [ ] API endpoints tested
- [ ] Performance monitoring enabled

### **Frontend Integration**
- [ ] Super admin login page created
- [ ] Company selector component built
- [ ] Multi-company dashboard implemented
- [ ] User management interface created
- [ ] Location management interface created
- [ ] Journey management interface created
- [ ] Analytics dashboard built

### **Testing & Validation**
- [ ] All API endpoints tested
- [ ] Security measures validated
- [ ] Performance benchmarks met
- [ ] User acceptance testing completed
- [ ] Documentation updated

---

## 📈 **MONITORING & ANALYTICS**

### **System Monitoring**
- **API response times** and performance metrics
- **Error rates** and failure tracking
- **User activity** and session monitoring
- **Database performance** and query optimization

### **Security Monitoring**
- **Failed login attempts** and suspicious activity
- **Permission violations** and access denials
- **Data access patterns** and anomaly detection
- **Audit log analysis** and reporting

### **Business Analytics**
- **Cross-company performance** metrics
- **User adoption** and usage statistics
- **Feature utilization** and effectiveness
- **Revenue tracking** and financial reporting

---

**Document Status:** ✅ **BACKEND IMPLEMENTATION COMPLETE**  
**Last Updated:** January 2025  
**Next Review:** After frontend implementation  
**Version:** 1.0.0 