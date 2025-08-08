# LGM Data Flow Diagram

## 🔄 **Complete Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LGM COMPLETE DATA FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  SmartMoving    │    │   C&C CRM API    │    │   PostgreSQL    │
│     API         │    │                  │    │   Database      │
│                 │    │                  │    │                 │
│ • 185 customers │───▶│ • Health: ✅     │───▶│ • Multi-tenant  │
│ • 37 pages      │    │ • Auth: ✅       │    │ • LGM Client    │
│ • 48h coverage  │    │ • Journey: ✅    │    │ • Normalized    │
│ • Real-time     │    │ • Audit: ✅      │    │ • Audit trail   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Background     │    │   Frontend       │    │   User          │
│  Sync Service   │    │   Dashboard      │    │   Interface     │
│                 │    │                  │    │                 │
│ • Every 2h      │    │ • Role-based     │    │ • Real-time     │
│ • All branches  │    │ • Location filter│    │ • Mobile ready  │
│ • 48h data      │    │ • Journey views  │    │ • Multi-device  │
│ • Error handling│    │ • Analytics      │    │ • Responsive    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 **Data Volume Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA VOLUME FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

SmartMoving API (185 customers/day)
    │
    ├── Page 1: 5 customers
    ├── Page 2: 5 customers
    ├── Page 3: 5 customers
    ├── ...
    ├── Page 36: 5 customers
    └── Page 37: 5 customers
    │
    ▼
Background Sync Service (Every 2 hours)
    │
    ├── Today's Data: 185 customers
    └── Tomorrow's Data: 185 customers
    │
    ▼
Data Normalization Pipeline
    │
    ├── Customer Data → Notes & Contact Info
    ├── Opportunity Data → External Data
    ├── Job Data → Core Journey Data
    ├── Addresses → Start/End Locations
    └── Financial Data → Estimated Costs
    │
    ▼
PostgreSQL Database (Multi-tenant)
    │
    ├── LGM Client: clm_f55e13de_a5c4_4990_ad02_34bb07187daa
    ├── 6 Branch Locations
    ├── External ID Tracking
    └── Audit Trail
    │
    ▼
API Endpoints (Authenticated)
    │
    ├── /smartmoving/journeys/active
    ├── /smartmoving/journeys/today
    ├── /smartmoving/journeys/tomorrow
    └── /smartmoving/sync/automated/trigger
    │
    ▼
Frontend Dashboard (Role-based)
    │
    ├── SUPER_ADMIN: Full access
    ├── ADMIN: Company management
    ├── MANAGER: Location management
    ├── DISPATCHER: Journey management
    ├── DRIVER: Mobile operations
    ├── MOVER: Field operations
    └── AUDITOR: Compliance & reporting
```

## 🏢 **LGM Organization Structure**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LGM ORGANIZATION STRUCTURE                            │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LETS GET MOVING                                    │
│                    clm_f55e13de_a5c4_4990_ad02_34bb07187daa                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │   CALGARY       │ │   VANCOUVER     │ │   BURNABY       │
        │   🇨🇦            │ │   🇨🇦            │ │   🇨🇦            │
        │ loc_lgm_calgary │ │loc_lgm_vancouver│ │loc_lgm_burnaby  │
        │ _001            │ │ _001            │ │ _corporate_001  │
        └─────────────────┘ └─────────────────┘ └─────────────────┘
                    │               │               │
                    ▼               ▼               ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │   TORONTO       │ │   EDMONTON      │ │   WINNIPEG      │
        │   🇨🇦            │ │   🇨🇦            │ │   🇨🇦            │
        │loc_lgm_toronto  │ │loc_lgm_edmonton │ │loc_lgm_winnipeg │
        │ _001            │ │ _001            │ │ _001            │
        └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 👥 **User Roles & Data Access**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            USER ROLES & DATA ACCESS                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SUPER_ADMIN   │    │     ADMIN       │    │    MANAGER      │
│                 │    │                 │    │                 │
│ • Full system   │    │ • Company mgmt  │    │ • Location mgmt │
│ • All data      │    │ • All locations │    │ • Branch data   │
│ • User mgmt     │    │ • User mgmt     │    │ • Team mgmt     │
│ • System config │    │ • Reports       │    │ • Operations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DISPATCHER    │    │     DRIVER      │    │     MOVER       │
│                 │    │                 │    │                 │
│ • Journey mgmt  │    │ • Mobile ops    │    │ • Field ops     │
│ • Route planning│    │ • GPS tracking  │    │ • Job execution │
│ • Crew assign   │    │ • Status update │    │ • Photo capture │
│ • Real-time     │    │ • Navigation    │    │ • Time tracking │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 AUDITOR                                          │
│                                                                                 │
│ • Compliance & reporting                                                        │
│ • Audit trail access                                                            │
│ • Data validation                                                               │
│ • Performance metrics                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 **Sync Process Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SYNC PROCESS FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Every 2 Hours │    │ SmartMoving API │    │ Data Extraction │
│                 │    │                 │    │                 │
│ • Background    │───▶│ • 185 customers │───▶│ • Page 1-37     │
│ • Automated     │    │ • 37 pages      │    │ • All customers │
│ • Error retry   │    │ • 48h coverage  │    │ • Opportunities │
│ • Logging       │    │ • Real-time     │    │ • Jobs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │ Data Validation │    │ Data Normalization │
│   Storage       │    │                 │    │                 │
│                 │    │                 │    │                 │
│ • Multi-tenant  │◀───│ • Quality check │◀───│ • SmartMoving   │
│ • LGM client    │    │ • Completeness  │    │ → C&C CRM       │
│ • Location map  │    │ • Accuracy      │    │ • Schema mapping│
│ • Audit trail   │    │ • Consistency   │    │ • Field mapping │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Access    │    │   Frontend      │    │   User          │
│                 │    │   Dashboard     │    │   Interface     │
│                 │    │                 │    │                 │
│ • Authenticated │───▶│ • Role-based    │───▶│ • Real-time     │
│ • Role-based    │    │ • Location filter│   │ • Mobile ready  │
│ • Real-time     │    │ • Journey views │    │ • Multi-device  │
│ • Secure        │    │ • Analytics     │    │ • Responsive    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📈 **Performance Metrics Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PERFORMANCE METRICS                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Response  │    │ Data Processing │    │   Sync Time     │
│   Times         │    │   Times         │    │                 │
│                 │    │                 │    │                 │
│ • Health: <1s   │    │ • Extraction:   │    │ • Total: 45s    │
│ • SmartMoving:  │    │   30s/185 cust  │    │ • Background:   │
│   <2s           │    │ • Normalization:│    │   2h intervals  │
│ • Company: <1s  │    │   10s/100 jobs  │    │ • Real-time:    │
│ • Journey: <1s  │    │ • Storage:      │    │   <3s updates   │
│                 │    │   5s/100 records│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 **Security & Access Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY & ACCESS                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Authentication│    │   Authorization │    │   Data          │
│                 │    │                 │    │   Protection    │
│                 │    │                 │    │                 │
│ • Bearer tokens │───▶│ • Role-based    │───▶│ • HTTPS         │
│ • JWT validation│    │ • Multi-tenant  │    │ • Encryption    │
│ • Session mgmt  │    │ • Location scope│    │ • Validation    │
│ • Secure login  │    │ • Data isolation│    │ • Audit trail   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 **Key Data Flow Points**

1. **SmartMoving API** → 185 customers/day, 37 pages, real-time data
2. **Background Sync** → Every 2 hours, all branches, 48-hour coverage
3. **Data Normalization** → SmartMoving → C&C CRM schema mapping
4. **Database Storage** → Multi-tenant, LGM client, 6 locations
5. **API Access** → Authenticated, role-based, real-time
6. **Frontend Dashboard** → Role-based views, location filtering
7. **User Interface** → Real-time, mobile-ready, responsive

## 🚀 **Production Status**

**✅ FULLY OPERATIONAL**

- **Data Volume:** 185 customers/day, 37 pages, 48-hour coverage
- **Performance:** All endpoints < 3 seconds
- **Security:** Bearer token authentication, role-based access
- **Reliability:** 2-hour sync intervals, error handling, audit trail
- **Scalability:** Pagination, connection pooling, multi-tenant architecture

---

**Diagram Created:** August 8, 2025  
**Data Flow:** SmartMoving → Background Sync → Database → API → Frontend → User  
**Coverage:** 6 LGM branches, 48 hours, 185 customers/day 