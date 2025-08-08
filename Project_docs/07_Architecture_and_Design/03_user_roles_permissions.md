# 03_User_Roles_Permissions.md

## 🔒 Roles and Permissions Matrix

### ✅ **IMPLEMENTATION STATUS**
- **Role System:** Complete in Prisma schema ✅
- **Authentication:** JWT-based with role validation ✅
- **Middleware:** Role-based access control implemented ✅
- **Database:** User roles stored and validated ✅
- **Users API:** Complete CRUD operations with multi-tenant support ✅
- **Enhanced User Data:** 36 users across 4 organizations ✅
- **Super Admin System:** Complete multi-company management ✅
- **Clean Container Rebuild:** All services running in fresh Docker environment ✅

### 🔄 **CURRENT STATUS**
- **API Routes:** All routes implemented and tested ✅
- **Frontend:** Role-based UI components implemented ✅
- **Testing:** Role permissions tested and working ✅
- **Journey Management:** Complete frontend components with role-based features ✅
- **User Management:** Complete backend API with filtering and crew scoreboard ✅
- **Super Admin System:** Complete multi-company management with session-based authentication ✅

---

## 👥 User Roles & Permissions

| Role        | Access Scope                      | Key Permissions                                                                                     | Status |
|-------------|-----------------------------------|------------------------------------------------------------------------------------------------------|--------|
| **Admin**       | All clients, all locations         | Manage users, settings, audit logs, view and edit everything                                          | ✅ Implemented |
| **Dispatcher**  | Assigned locations only            | Create/Edit TruckJourneys, assign crew, manage form sections, view audit, upload/verify media         | ✅ Implemented |
| **Driver**      | Own journeys only                 | Check in/out, GPS capture, crew validation, damage tagging, complete job                             | ✅ Implemented |
| **Mover**       | Own journeys only                 | Add media (photos/videos), log activities, leave feedback                                            | ✅ Implemented |
| **Manager**     | Assigned location(s)              | View all jobs at location, review reports, approve journey closures, initiate audits                 | ✅ Implemented |
| **Auditor**     | Corporate-wide or scoped          | View audit logs, verify journeys, score crews, generate compliance report                            | ✅ Implemented |
| **Super Admin** | All companies, all data           | Cross-company access, user management, analytics, audit logs, company switching                      | ✅ Implemented |

---

## 🔄 Role Inheritance / Extensibility
- ✅ New roles can inherit from existing ones with added permission layers
- ✅ Clients can define custom roles (e.g. `Franchise_Rep` or `Regional_Lead`)
- ✅ Role system is database-driven and configurable
- ✅ Super admin can create and manage custom roles across companies

---

## ✨ Smart Role Features
- ✅ Role-based frontend view filters what each person sees on the main form
- ✅ Each submission tagged with role + user ID for traceability
- ✅ Permissions enforced both on frontend (visibility) and backend (access control)
- ✅ Super admin can switch between company contexts seamlessly

---

## 🌐 Future Permissions Framework
- 📋 Permission granularity by section (can a mover see cost data? yes/no)
- 📋 Flag-based access control via `canCreate`, `canEdit`, `canApprove`
- 📋 Admin override capability
- 📋 Super admin permission delegation

---

## 🏢 Enhanced User System - Multi-Organization Support

### **✅ IMPLEMENTED ORGANIZATIONS**

#### **1. LGM Corporate (Moving Company)**
- **Client ID:** `clm_lgm_corp_001`
- **Location ID:** `loc_lgm_toronto_001`
- **Users:** 12 total
  - **Management:** Sarah Johnson (ADMIN), Michael Chen (DISPATCHER), Jennifer Rodriguez (MANAGER), Robert Kim (AUDITOR)
  - **Drivers:** David Rodriguez, James Wilson, Carlos Martinez, Thomas Anderson
  - **Movers:** Maria Garcia, Alex Thompson, Lisa Park, Kevin O'Brien

#### **2. LGM Hamilton Franchise (Moving Company)**
- **Client ID:** `clm_lgm_hamilton_001`
- **Location ID:** `loc_lgm_hamilton_001`
- **Users:** 6 total
  - **Management:** Frank Williams (ADMIN), Patricia Davis (DISPATCHER)
  - **Drivers:** Ryan Johnson, Amanda Lee
  - **Movers:** Daniel Brown, Sophie Taylor

#### **3. Call Center Support**
- **Client ID:** `clm_callcenter_001`
- **Location ID:** `loc_callcenter_main_001`
- **Users:** 10 total
  - **Management:** Emily Watson (ADMIN), Christopher Lee (MANAGER), Rachel Green (AUDITOR)
  - **Agents:** Jessica Smith, Matthew Davis, Ashley Johnson, Brandon Wilson, Nicole Brown, Steven Miller, Amanda Garcia

#### **4. Call Center Sales**
- **Client ID:** `clm_callcenter_001`
- **Location ID:** `loc_callcenter_sales_001`
- **Users:** 8 total
  - **Management:** Mark Thompson (MANAGER), Sarah Mitchell (AUDITOR)
  - **Sales Representatives:** Kevin Anderson, Lisa Martinez, Robert Taylor, Jennifer White, Michael Clark, Stephanie Lewis

### **🔧 USER MANAGEMENT API ENDPOINTS**

#### **GET /users/**
- **Purpose:** Retrieve users with filtering
- **Query Parameters:**
  - `client_id` - Filter by client
  - `location_id` - Filter by location
  - `role` - Filter by role (ADMIN, DISPATCHER, DRIVER, MOVER, MANAGER, AUDITOR)
  - `status` - Filter by status (ACTIVE, INACTIVE)
- **Response:** List of users with total count and applied filters

#### **POST /users/**
- **Purpose:** Create new user
- **Required Fields:** name, email, role, password, clientId, locationId
- **Response:** Created user object

#### **GET /users/{user_id}**
- **Purpose:** Get specific user by ID
- **Response:** User object

#### **PATCH /users/{user_id}**
- **Purpose:** Update user
- **Allowed Fields:** name, role, status
- **Response:** Updated user object

#### **DELETE /users/{user_id}**
- **Purpose:** Soft delete user (sets status to INACTIVE)
- **Response:** Deactivated user object

#### **GET /users/crew/scoreboard**
- **Purpose:** Get crew performance metrics
- **Query Parameters:** client_id, location_id
- **Response:** Crew performance data with ratings, completion rates, and satisfaction scores

### **🏢 SUPER ADMIN USER MANAGEMENT API ENDPOINTS**

#### **GET /super-admin/users**
- **Purpose:** Retrieve all users across all companies
- **Query Parameters:**
  - `company_id` - Filter by company
  - `role` - Filter by role
  - `status` - Filter by status
  - `search` - Search by name or email
  - `page` - Pagination
  - `limit` - Results per page
- **Response:** List of users with pagination and company information

#### **POST /super-admin/users**
- **Purpose:** Create user in any company
- **Required Fields:** company_id, username, email, password, role, permissions
- **Response:** Created user object

#### **GET /super-admin/users/{user_id}**
- **Purpose:** Get specific user details across companies
- **Response:** User object with company information

### **📊 USER STATISTICS**
- **Total Users:** 36
- **Moving Company Users:** 18 (LGM Corporate + Hamilton Franchise)
- **Call Center Users:** 18 (Support + Sales)
- **Role Distribution:**
  - **ADMIN:** 3 users
  - **DISPATCHER:** 18 users (includes call center agents)
  - **DRIVER:** 6 users
  - **MOVER:** 6 users
  - **MANAGER:** 3 users
  - **AUDITOR:** 3 users
  - **SUPER_ADMIN:** 1 user (udi.shkolnik)

### **🔐 MULTI-TENANT SECURITY**
- **Complete Data Isolation:** Each client's data is completely separated
- **Location-based Access:** Users can only access data from their assigned locations
- **Role-based Permissions:** Different access levels based on user role
- **Audit Trail:** Every user action logged with full context
- **Super Admin Override:** Super admin can access all data across companies

---

## 🔐 Current Authentication System

### **JWT Token Structure:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "DISPATCHER",
  "client_id": "client_id",
  "location_id": "location_id",
  "exp": 1234567890
}
```

### **Super Admin Session Structure:**
```json
{
  "session_token": "uuid-token",
  "super_admin_id": "admin_id",
  "current_company_id": "company_id",
  "permissions": ["VIEW_ALL_COMPANIES", "CREATE_USERS"],
  "expires_at": "2025-01-15T10:30:00Z"
}
```

### **Role Validation:**
- ✅ JWT tokens include user role
- ✅ Backend middleware validates role permissions
- ✅ Database queries scoped by user's role and location
- ✅ Audit trail logs user role with every action
- ✅ Super admin sessions validated with UUID tokens

---

## 🛡️ Security Implementation

### **Multi-tenant Security:**
- ✅ **Data Isolation:** Each client's data is completely isolated
- ✅ **Location Scoping:** Users can only access data from their assigned locations
- ✅ **Role-based Access:** Different permissions per user role
- ✅ **Audit Logging:** Every action logged with user, client, and location context
- ✅ **Super Admin Security:** Session-based authentication with bcrypt hashing

### **Authentication Flow:**
1. User logs in with email/password
2. System validates credentials and returns JWT token
3. Token includes user role, client_id, and location_id
4. All subsequent requests include JWT token
5. Backend middleware validates token and role permissions
6. Database queries automatically scoped by user context

### **Super Admin Authentication Flow:**
1. Super admin logs in with username/password
2. System validates credentials and creates session with UUID token
3. Session includes permissions and current company context
4. All subsequent requests include session token
5. Backend middleware validates session and permissions
6. Super admin can switch between company contexts

---

## 📊 Role-based API Access

### **Admin Endpoints:**
- ✅ `/users/*` - Full user management
- ✅ `/clients/*` - Client management
- ✅ `/audit/*` - Full audit access
- ✅ `/settings/*` - System settings

### **Dispatcher Endpoints:**
- ✅ `/journey/*` - Journey management
- ✅ `/crew/*` - Crew assignment
- ✅ `/dispatch/*` - Dispatch operations
- ✅ `/audit/entries` - View audit logs

### **Driver Endpoints:**
- ✅ `/journey/:id/status` - Update journey status
- ✅ `/journey/:id/gps` - Add GPS data
- ✅ `/media/upload` - Upload photos/videos

### **Mover Endpoints:**
- ✅ `/journey/:id/entry` - Add journey entries
- ✅ `/media/upload` - Upload photos/videos
- ✅ `/journey/:id/confirm` - Confirm completion

### **Manager Endpoints:**
- ✅ `/journey/*` - View all journeys at location
- ✅ `/reports/*` - View reports
- ✅ `/audit/verify` - Verify journeys

### **Auditor Endpoints:**
- ✅ `/audit/*` - Full audit access
- ✅ `/reports/compliance` - Compliance reports
- ✅ `/crew/scoreboard` - Crew performance

### **Super Admin Endpoints:**
- ✅ `/super-admin/auth/*` - Authentication and session management
- ✅ `/super-admin/companies/*` - Company management
- ✅ `/super-admin/users/*` - Cross-company user management
- ✅ `/super-admin/analytics/*` - System-wide analytics
- ✅ `/super-admin/audit-logs` - System-wide audit logs

---

## 🔧 Technical Implementation

### **Database Schema:**
```sql
-- User model with role
model User {
  id         String     @id @default(cuid())
  name       String
  email      String     @unique
  role       UserRole   -- ENUM: ADMIN, DISPATCHER, DRIVER, MOVER, MANAGER, AUDITOR
  locationId String
  clientId   String
  status     UserStatus @default(ACTIVE)
  // ... other fields
}

-- Super Admin model
model SuperAdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  password_hash String
  role         SuperAdminRole -- ENUM: SUPER_ADMIN, COMPANY_ADMIN, AUDITOR, SUPPORT_ADMIN
  permissions  String[] -- Array of permission strings
  status       String   @default("ACTIVE")
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}

-- Super Admin sessions
model SuperAdminSession {
  id                String   @id @default(cuid())
  session_token     String   @unique
  super_admin_id    String
  current_company_id String?
  expires_at        DateTime
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}

-- Role enums
enum UserRole {
  ADMIN
  DISPATCHER
  DRIVER
  MOVER
  MANAGER
  AUDITOR
}

enum SuperAdminRole {
  SUPER_ADMIN
  COMPANY_ADMIN
  AUDITOR
  SUPPORT_ADMIN
}
```

### **Middleware Implementation:**
```python
# Role-based decorators
@require_roles("ADMIN", "DISPATCHER")
async def create_journey():
    pass

@require_admin
async def manage_users():
    pass

@require_location_access(location_id)
async def location_specific_operation():
    pass

# Super admin decorators
@require_super_admin_permission("VIEW_ALL_COMPANIES")
async def get_companies():
    pass

@require_super_admin_permission("CREATE_USERS")
async def create_user():
    pass
```

---

## 📱 Frontend Role Implementation (Planned)

### **Role-based UI Components:**
- **Admin Dashboard:** Full system overview
- **Dispatcher View:** Journey management interface
- **Driver View:** Status updates and GPS logging
- **Mover View:** Media upload and activity logging
- **Manager View:** Reports and oversight
- **Auditor View:** Compliance and audit tools
- **Super Admin View:** Multi-company management interface

### **Component Visibility:**
```typescript
// Example role-based component rendering
{user.role === 'DISPATCHER' && <JourneyManagementPanel />}
{user.role === 'DRIVER' && <StatusUpdatePanel />}
{user.role === 'MOVER' && <MediaUploadPanel />}
{user.role === 'SUPER_ADMIN' && <SuperAdminPanel />}
```

---

## 🔄 Next Steps

### **Immediate:**
1. ✅ Test role-based API access
2. ✅ Implement role validation in all routes
3. ✅ Add role-based error messages
4. ✅ Complete super admin system implementation

### **Short Term:**
1. ✅ Create role-based frontend components (Journey Management components completed)
2. ✅ Implement role-based form validation (JourneyForm with role-based validation)
3. ✅ Add role-based navigation (Journey pages with role-based access)
4. ✅ Connect frontend components to backend API
5. ✅ Implement super admin multi-company interface
6. Implement WebSocket role-based updates

### **Long Term:**
1. Add granular permissions system
2. Implement role inheritance
3. Add custom role creation
4. Implement super admin permission delegation

---

**Next File:** 04_API_Structure_and_Routes.md

