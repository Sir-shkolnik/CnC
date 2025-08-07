# 05_Frontend_UI_Guide.md

## 🎨 **C&C CRM FRONTEND SYSTEM OVERVIEW**

**Last Updated:** January 2025  
**Version:** 2.8.0  
**Status:** ✅ **PRODUCTION READY - Real LGM Data Integration**

---

## 📚 **DOCUMENTATION STRUCTURE**

This frontend system is documented across multiple focused files:

### **📖 Core Documentation Files**
- **[05a_Design_System.md](./05a_design_system.md)** - Color palette, typography, and component library
- **[05b_Component_Architecture.md](./05b_component_architecture.md)** - Modular component system and patterns
- **[05c_Responsive_Design.md](./05c_responsive_design.md)** - Mobile-first responsive design and alignment

### **🎯 This Overview Document**
- Platform assumptions and architecture
- State management overview
- Development workflow
- Testing strategy
- Performance optimization

---

## 🔧 **PLATFORM ASSUMPTIONS & ARCHITECTURE**

### **Technology Stack**
```json
{
  "framework": "Next.js 14 with App Router (React 18+)",
  "language": "TypeScript 5.0+ with strict mode",
  "styling": "Tailwind CSS 3.3+ with custom design system",
  "state": "Zustand 4.4+ with persistence",
  "data": "SWR 2.2+ with optimistic updates",
  "forms": "React Hook Form 7.45+ with Zod validation",
  "pwa": "Service Worker with Workbox",
  "offline": "IndexedDB with Dexie.js",
  "testing": "Jest + React Testing Library + Playwright",
  "linting": "ESLint + Prettier + Husky"
}
```

### **Architecture Principles**
- **Mobile-First**: Design for mobile, enhance for desktop
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Modular Components**: Single responsibility, reusable components
- **Type Safety**: Full TypeScript coverage with strict mode
- **Performance**: Optimized rendering and bundle splitting
- **Accessibility**: WCAG 2.1 AA compliance
- **Real Data Integration**: Complete LGM data with location-based access

---

## 🧠 **STATE MANAGEMENT OVERVIEW**

### **Zustand Store Architecture**
```typescript
// Global State Structure
interface AppState {
  auth: AuthState;        // Unified authentication (super admin + regular users)
  journey: JourneyState;  // Journey data and operations
  menu: MenuState;        // Navigation and UI state
  ui: UIState;           // Global UI state (modals, loading, etc.)
  superAdmin: SuperAdminState; // Super admin multi-company state
}

// Unified Auth Store Implementation
export const useAuthStore = create<AuthState>((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  userType: null, // 'super_admin' | 'regular' | null
  
  // Actions
  login: async (credentials) => { 
    // Unified login for both user types
    // Automatically detects user type and sets appropriate state
  },
  logout: () => { /* implementation */ },
  
  // Computed
  hasPermission: (permission) => { /* implementation */ },
  isSuperAdmin: () => get().userType === 'super_admin'
}));

// Super Admin Store
export const useSuperAdminStore = create<SuperAdminState>((set, get) => ({
  // State
  superAdmin: null,
  currentCompany: null,
  availableCompanies: [],
  isAuthenticated: false,
  
  // Actions
  login: async (credentials) => { /* implementation */ },
  switchCompany: async (companyId) => { /* implementation */ },
  logout: () => { /* implementation */ },
  
  // Computed
  hasPermission: (permission) => { /* implementation */ }
}));
```

---

## 🔐 **UNIFIED AUTHENTICATION SYSTEM**

### **Login Flow**
The frontend now supports a unified authentication system that handles both super admin and regular users through a single login interface.

#### **Login Process:**
1. **Single Login Form**: One form for all user types
2. **Backend Detection**: API automatically detects user type
3. **Role-Based Redirects**: Frontend redirects based on `userType`
4. **State Management**: Appropriate store updates based on user type

#### **User Type Detection:**
```typescript
// Login response includes user_type
interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      user_type: 'super_admin' | 'regular';
      clientId?: string;
      locationId?: string;
    };
  };
}

// Frontend automatically redirects based on user_type
useEffect(() => {
  if (isAuthenticated) {
    const userType = useAuthStore.getState().userType;
    if (userType === 'super_admin') {
      router.push('/super-admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  }
}, [isAuthenticated, router]);
```

#### **Access Control:**
- **Super Admin**: Full access to all companies and locations
- **Regular Users**: Location-based access only
- **Role-Based UI**: Different interfaces based on user type

---

## 📱 **PAGE STRUCTURE & ROUTING**

### **App Router Structure**
```
app/
├── layout.tsx                    # ✅ Root layout with PWA
├── page.tsx                      # ✅ Landing page
├── globals.css                   # ✅ Custom Tailwind styles
├── manifest.ts                   # ✅ PWA manifest
├── auth/                         # ✅ Unified authentication
│   ├── login/page.tsx           # ✅ Single login for all users
│   └── register/page.tsx        # ✅ User registration
├── dashboard/page.tsx            # ✅ Regular user dashboard
├── journeys/page.tsx             # ✅ Journey management
├── journey/                      # ✅ Journey pages
│   ├── create/page.tsx          # ✅ Journey creation wizard
│   └── [id]/page.tsx            # ✅ Journey detail view
├── users/page.tsx                # ✅ User management
├── clients/page.tsx              # ✅ Client management
├── crew/page.tsx                 # ✅ Crew management
├── audit/page.tsx                # ✅ Audit & compliance
├── settings/page.tsx             # ✅ System settings
├── test/page.tsx                 # ✅ Component showcase
└── super-admin/                  # ✅ Super admin portal
    ├── auth/login/page.tsx       # ✅ Super admin login (legacy)
    ├── dashboard/page.tsx        # ✅ Super admin dashboard
    ├── companies/page.tsx        # ✅ Company management
    ├── users/page.tsx            # ✅ User management
    ├── locations/page.tsx        # ✅ Location management
    └── journeys/page.tsx         # ✅ Journey management
```

### **Real LGM Data Integration**

#### **Location-Based Access:**
```typescript
// Regular users see only their location data
const { data: journeys } = useSWR(
  isAuthenticated && userType === 'regular' 
    ? `/journey/active` 
    : null
);

// Super admin sees all data
const { data: allJourneys } = useSWR(
  isAuthenticated && userType === 'super_admin' 
    ? `/super-admin/journeys` 
    : null
);
```

#### **Real Location Data:**
```typescript
// Location data includes real LGM information
interface Location {
  id: string;
  name: string;
  contact: string;           // Real LGM contact person
  direct_line: string;       // Direct phone number
  ownership_type: 'CORPORATE' | 'FRANCHISE';
  trucks: string;            // Number of trucks
  trucks_shared_with: string; // Shared truck network
  storage: 'LOCKER' | 'POD' | 'NO';
  storage_pricing: string;   // Detailed pricing
  cx_care: boolean;          // Customer care availability
  clientId: string;
  timezone: string;
  address: string;
}
```

---

## 🎨 **DESIGN SYSTEM INTEGRATION**

### **Real Data Visualization**
The frontend now displays real LGM data with appropriate visual indicators:

#### **Location Cards:**
```typescript
// Location card with real LGM data
<LocationCard
  name="VANCOUVER"
  contact="RASOUL"
  ownershipType="CORPORATE"
  trucks="11"
  storage="POD"
  cxCare={true}
  storagePricing="7x6x7 - $99, oversized items - $50"
/>
```

#### **Storage Type Indicators:**
```typescript
// Visual indicators for storage types
const StorageBadge = ({ type }: { type: string }) => {
  const config = {
    LOCKER: { color: 'bg-blue-500', icon: 'locker' },
    POD: { color: 'bg-green-500', icon: 'pod' },
    NO: { color: 'bg-gray-500', icon: 'no-storage' }
  };
  
  return (
    <Badge className={config[type].color}>
      <Icon name={config[type].icon} />
      {type} Storage
    </Badge>
  );
};
```

#### **Customer Care Status:**
```typescript
// CX Care availability indicator
const CxCareIndicator = ({ enabled }: { enabled: boolean }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">
      {enabled ? 'CX Care Available' : 'CX Care Unavailable'}
    </span>
  </div>
);
```

---

## 🔄 **DATA FLOW & API INTEGRATION**

### **API Client (`lib/api.ts`)**
```typescript
// Unified API client with real data support
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Unified login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Login failed');
    
    return data;
  }
  
  // Location-based data fetching
  async getActiveJourneys(): Promise<Journey[]> {
    const token = localStorage.getItem('auth-storage')?.token;
    const response = await fetch(`${this.baseURL}/journey/active`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();
    return data.data || [];
  }
  
  // Super admin data fetching
  async getSuperAdminLocations(): Promise<Location[]> {
    const token = localStorage.getItem('auth-storage')?.token;
    const response = await fetch(`${this.baseURL}/super-admin/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();
    return data.data || [];
  }
}
```

### **Real-Time Data Updates**
```typescript
// SWR for real-time data with real LGM information
const { data: locations, mutate } = useSWR(
  isAuthenticated ? '/super-admin/locations' : null,
  fetcher,
  {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true
  }
);

// Optimistic updates for real data
const updateLocation = async (locationId: string, updates: Partial<Location>) => {
  // Optimistic update
  mutate(
    (current) => current?.map(loc => 
      loc.id === locationId ? { ...loc, ...updates } : loc
    ),
    false
  );
  
  // API call
  await api.updateLocation(locationId, updates);
  
  // Revalidate
  mutate();
};
```

---

## 📊 **REAL LGM DATA DISPLAY**

### **Dashboard with Real Data**
```typescript
// Dashboard showing real LGM statistics
const Dashboard = () => {
  const { data: stats } = useSWR('/super-admin/analytics', fetcher);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Locations"
        value="43"
        description="LGM locations across Canada"
        icon="location"
      />
      <StatCard
        title="Corporate Locations"
        value="8"
        description="Company-owned facilities"
        icon="building"
      />
      <StatCard
        title="Franchise Locations"
        value="35"
        description="Franchise partner locations"
        icon="store"
      />
      <StatCard
        title="CX Care Coverage"
        value="79.1%"
        description="Locations with customer care"
        icon="support"
      />
    </div>
  );
};
```

### **Location Management with Real Data**
```typescript
// Location management with complete LGM information
const LocationManagement = () => {
  const { data: locations } = useSWR('/super-admin/locations', fetcher);
  
  return (
    <div className="space-y-6">
      {locations?.map(location => (
        <LocationCard
          key={location.id}
          name={location.name}
          contact={location.contact}
          directLine={location.direct_line}
          ownershipType={location.ownership_type}
          trucks={location.trucks}
          storage={location.storage}
          storagePricing={location.storage_pricing}
          cxCare={location.cx_care}
          trucksSharedWith={location.trucks_shared_with}
        />
      ))}
    </div>
  );
};
```

---

## 🎯 **PRODUCTION READINESS**

### **✅ COMPLETED FEATURES**
- ✅ **Real LGM Data Integration**: 43 locations with complete information
- ✅ **Unified Authentication**: Single login for all user types
- ✅ **Location-Based Access**: Proper data isolation and permissions
- ✅ **Super Admin Portal**: Complete multi-company management
- ✅ **Real Contact Information**: Actual LGM employees and phone numbers
- ✅ **Storage Details**: LOCKER, POD, NO storage with pricing
- ✅ **Customer Care Status**: CX care availability indicators
- ✅ **Truck Information**: Number of trucks and sharing networks
- ✅ **Responsive Design**: Mobile-first with PWA support
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Performance**: Optimized rendering and data fetching

### **📋 NEXT STEPS**
1. **Create Real LGM Users**: Add actual LGM employees to the system
2. **Location Assignment**: Assign users to specific LGM locations
3. **Role Configuration**: Set up proper roles and permissions
4. **Real Journey Data**: Begin actual moving operations
5. **Storage Integration**: Connect real storage facilities

---

## 🚀 **FRONTEND SUMMARY**

The C&C CRM frontend is now **production-ready** with:
- ✅ **Real LGM company data** (43 locations across Canada)
- ✅ **Real contact information** (actual LGM employees and phone numbers)
- ✅ **Real storage details** (LOCKER, POD, NO storage with pricing)
- ✅ **Unified authentication** (super admin and regular users)
- ✅ **Location-based access control** (proper data isolation)
- ✅ **Complete UI system** (responsive, accessible, performant)
- ✅ **Super admin management** (multi-company oversight)

The frontend is ready for real LGM operations to begin!

