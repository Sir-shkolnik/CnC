# 🔄 SmartMoving Data Integration Plan

**Date:** August 8, 2025  
**Status:** 📋 **PLANNING PHASE**  
**Version:** 1.0.0  

---

## 🎯 **OBJECTIVE**

Pull jobs/journeys from SmartMoving API by location and date, normalize the data, and integrate it into C&C CRM so users can view their journeys for today with proper RBAC (Role-Based Access Control).

---

## 📊 **CURRENT UNDERSTANDING**

### **SmartMoving API Access**
- **API Key:** `185840176c73420fbd3a473c2fdccedb`
- **Client ID:** `b0db4e2b-74af-44e2-8ecd-6f4921ec836f`
- **API Type:** Standard (Read-only access)
- **Base URL:** `https://api.smartmoving.com`

### **C&C CRM Database Structure**
- **Multi-tenant:** Client → Location → User hierarchy
- **Journey Model:** `TruckJourney` with location-based filtering
- **RBAC:** 6 user roles (ADMIN, DISPATCHER, DRIVER, MOVER, MANAGER, AUDITOR)
- **Real LGM Data:** 43 locations with actual contact information

---

## 🔍 **SMARTMOVING API EXPLORATION**

### **1. API Endpoints to Test**

#### **Jobs/Estimates Endpoints**
```bash
# Get all jobs/estimates
GET /api/estimates
GET /api/jobs
GET /api/moves

# Get jobs by date range
GET /api/estimates?startDate=2025-08-08&endDate=2025-08-08

# Get jobs by location
GET /api/estimates?locationId={location_id}

# Get specific job
GET /api/estimates/{estimate_id}
GET /api/jobs/{job_id}
```

#### **Location Endpoints**
```bash
# Get all locations
GET /api/locations
GET /api/offices

# Get specific location
GET /api/locations/{location_id}
```

#### **Customer Endpoints**
```bash
# Get customers
GET /api/customers
GET /api/customers/{customer_id}
```

### **2. Data Structure Analysis**

#### **Expected SmartMoving Job Structure**
```json
{
  "id": "job_12345",
  "estimateId": "est_67890",
  "customerId": "cust_11111",
  "locationId": "loc_22222",
  "status": "Scheduled",
  "moveDate": "2025-08-08T09:00:00Z",
  "originAddress": {
    "street1": "123 Main St",
    "city": "Toronto",
    "state": "ON",
    "postalCode": "M5J2N1"
  },
  "destinationAddress": {
    "street1": "456 Oak Ave",
    "city": "Ottawa",
    "state": "ON",
    "postalCode": "K1A0B1"
  },
  "crew": [
    {
      "userId": "user_33333",
      "role": "Driver",
      "name": "John Smith"
    }
  ],
  "truck": {
    "id": "truck_44444",
    "number": "T-001"
  },
  "totalAmount": 2500.00,
  "createdAt": "2025-08-01T10:00:00Z",
  "updatedAt": "2025-08-07T15:30:00Z"
}
```

---

## 🗄️ **DATA NORMALIZATION PLAN**

### **1. SmartMoving → C&C CRM Mapping**

#### **Job/Estimate → TruckJourney**
| SmartMoving Field | C&C CRM Field | Notes |
|-------------------|---------------|-------|
| `id` | `externalId` | Store original SmartMoving ID |
| `estimateId` | `moveSourceId` | Link to move source |
| `customerId` | `customerId` | Link to customer |
| `locationId` | `locationId` | Map to LGM location |
| `status` | `status` | Map status values |
| `moveDate` | `date` | Journey date |
| `originAddress` | `startLocation` | JSON field |
| `destinationAddress` | `endLocation` | JSON field |
| `totalAmount` | `estimatedCost` | Pricing information |
| `createdAt` | `createdAt` | Timestamp |
| `updatedAt` | `updatedAt` | Last update |

#### **Crew Assignment → AssignedCrew**
| SmartMoving Field | C&C CRM Field | Notes |
|-------------------|---------------|-------|
| `crew[].userId` | `userId` | Map to C&C user |
| `crew[].role` | `role` | Map role values |
| `crew[].name` | `name` | Crew member name |

#### **Customer → Customer**
| SmartMoving Field | C&C CRM Field | Notes |
|-------------------|---------------|-------|
| `customer.id` | `externalId` | SmartMoving customer ID |
| `customer.firstName` | `firstName` | Customer first name |
| `customer.lastName` | `lastName` | Customer last name |
| `customer.email` | `email` | Customer email |
| `customer.phone` | `phone` | Customer phone |

### **2. Status Mapping**

#### **SmartMoving → C&C CRM Status Mapping**
```python
STATUS_MAPPING = {
    # SmartMoving Status → C&C CRM JourneyStage
    "Scheduled": "MORNING_PREP",
    "In Progress": "EN_ROUTE", 
    "On Site": "ONSITE",
    "Completed": "COMPLETED",
    "Cancelled": "CANCELLED",
    "Pending": "MORNING_PREP"
}
```

#### **Role Mapping**
```python
ROLE_MAPPING = {
    # SmartMoving Role → C&C CRM UserRole
    "Driver": "DRIVER",
    "Mover": "MOVER",
    "Dispatcher": "DISPATCHER",
    "Manager": "MANAGER",
    "Admin": "ADMIN"
}
```

---

## 🏢 **LGM LOCATION MAPPING**

### **Target Location Selection**

Based on the LGM data, I recommend testing with **BURNABY** location:

**Why BURNABY:**
- **Corporate Location:** Direct LGM control
- **Contact:** SHAHBAZ (available for coordination)
- **Trucks:** 5 trucks available
- **Storage:** POD storage available
- **Status:** Active with CX Care

**Location Details:**
- **C&C CRM Location ID:** `loc_lgm_burnaby_corporate_001`
- **SmartMoving Location ID:** Need to discover via API
- **Contact:** SHAHBAZ
- **Timezone:** America/Vancouver

### **Location Mapping Strategy**

#### **1. SmartMoving Location Discovery**
```python
# Get all SmartMoving locations
GET /api/locations

# Filter for LGM Burnaby
# Look for: "Burnaby", "BC", "Vancouver area"
```

#### **2. Location ID Mapping**
```python
LOCATION_MAPPING = {
    # SmartMoving Location ID → C&C CRM Location ID
    "sm_burnaby_001": "loc_lgm_burnaby_corporate_001",
    "sm_toronto_001": "loc_lgm_downtown_toronto_corporate_001",
    "sm_vancouver_001": "loc_lgm_vancouver_corporate_001"
}
```

---

## 🔧 **IMPLEMENTATION PLAN**

### **Phase 1: API Exploration & Testing**

#### **Step 1: Discover SmartMoving API Structure**
```python
# Test endpoints to understand data structure
async def explore_smartmoving_api():
    endpoints = [
        "/api/health",
        "/api/locations", 
        "/api/estimates",
        "/api/jobs",
        "/api/customers"
    ]
    
    for endpoint in endpoints:
        response = await test_endpoint(endpoint)
        log_response_structure(response)
```

#### **Step 2: Map LGM Burnaby Location**
```python
# Find SmartMoving location that matches LGM Burnaby
async def find_burnaby_location():
    locations = await get_smartmoving_locations()
    
    for location in locations:
        if "burnaby" in location.name.lower():
            return location.id
    
    return None
```

#### **Step 3: Get Today's Jobs for Burnaby**
```python
# Pull today's jobs for Burnaby location
async def get_burnaby_jobs_today():
    today = datetime.now().strftime("%Y-%m-%d")
    burnaby_location_id = await find_burnaby_location()
    
    jobs = await get_smartmoving_jobs(
        location_id=burnaby_location_id,
        start_date=today,
        end_date=today
    )
    
    return jobs
```

### **Phase 2: Data Normalization**

#### **Step 1: Create Data Normalization Service**
```python
class SmartMovingDataNormalizer:
    def __init__(self, lgm_client_id: str):
        self.lgm_client_id = lgm_client_id
        self.location_mapping = self.load_location_mapping()
        self.status_mapping = STATUS_MAPPING
        self.role_mapping = ROLE_MAPPING
    
    async def normalize_job(self, smartmoving_job: dict) -> dict:
        """Convert SmartMoving job to C&C CRM TruckJourney format"""
        
        # Map basic fields
        normalized_job = {
            "externalId": smartmoving_job["id"],
            "locationId": self.map_location_id(smartmoving_job["locationId"]),
            "clientId": self.lgm_client_id,
            "date": smartmoving_job["moveDate"],
            "status": self.map_status(smartmoving_job["status"]),
            "truckNumber": smartmoving_job.get("truck", {}).get("number"),
            "startLocation": smartmoving_job["originAddress"],
            "endLocation": smartmoving_job["destinationAddress"],
            "estimatedCost": smartmoving_job.get("totalAmount"),
            "notes": f"Imported from SmartMoving - Job {smartmoving_job['id']}",
            "createdById": "system_import",  # System user for imports
            "createdAt": smartmoving_job["createdAt"],
            "updatedAt": smartmoving_job["updatedAt"]
        }
        
        return normalized_job
    
    async def normalize_crew(self, smartmoving_job: dict, journey_id: str) -> list:
        """Convert SmartMoving crew to C&C CRM AssignedCrew format"""
        
        crew_assignments = []
        
        for crew_member in smartmoving_job.get("crew", []):
            assignment = {
                "journeyId": journey_id,
                "userId": await self.map_user_id(crew_member["userId"]),
                "role": self.map_role(crew_member["role"]),
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            }
            crew_assignments.append(assignment)
        
        return crew_assignments
```

#### **Step 2: Create Database Integration Service**
```python
class SmartMovingIntegrationService:
    def __init__(self, db_session, normalizer: SmartMovingDataNormalizer):
        self.db = db_session
        self.normalizer = normalizer
    
    async def import_jobs_for_location(self, location_id: str, date: str):
        """Import jobs for specific location and date"""
        
        # Get jobs from SmartMoving
        smartmoving_jobs = await get_smartmoving_jobs(
            location_id=location_id,
            start_date=date,
            end_date=date
        )
        
        imported_count = 0
        
        for job in smartmoving_jobs:
            try:
                # Normalize job data
                normalized_job = await self.normalizer.normalize_job(job)
                
                # Check if job already exists
                existing_journey = await self.db.get_journey_by_external_id(
                    normalized_job["externalId"]
                )
                
                if existing_journey:
                    # Update existing journey
                    await self.update_journey(existing_journey.id, normalized_job)
                else:
                    # Create new journey
                    journey_id = await self.create_journey(normalized_job)
                    
                    # Import crew assignments
                    crew_assignments = await self.normalizer.normalize_crew(job, journey_id)
                    await self.create_crew_assignments(crew_assignments)
                
                imported_count += 1
                
            except Exception as e:
                logger.error(f"Failed to import job {job['id']}: {e}")
                continue
        
        return imported_count
```

### **Phase 3: RBAC Integration**

#### **Step 1: Location-Based Access Control**
```python
async def get_journeys_for_user(user_id: str, date: str = None):
    """Get journeys for user based on their role and location"""
    
    user = await get_user(user_id)
    
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    
    # Base query with location filter
    query = {
        "clientId": user.clientId,
        "locationId": user.locationId,
        "date": date
    }
    
    # Role-based filtering
    if user.role == "ADMIN":
        # Admin can see all journeys in their location
        journeys = await get_journeys(query)
    
    elif user.role == "DISPATCHER":
        # Dispatcher can see all journeys in their location
        journeys = await get_journeys(query)
    
    elif user.role == "DRIVER":
        # Driver can see journeys they're assigned to
        journeys = await get_journeys_for_crew_member(user_id, query)
    
    elif user.role == "MOVER":
        # Mover can see journeys they're assigned to
        journeys = await get_journeys_for_crew_member(user_id, query)
    
    elif user.role == "MANAGER":
        # Manager can see all journeys in their location
        journeys = await get_journeys(query)
    
    elif user.role == "AUDITOR":
        # Auditor can see completed journeys
        query["status"] = "COMPLETED"
        journeys = await get_journeys(query)
    
    return journeys
```

#### **Step 2: Real-time Data Sync**
```python
class SmartMovingSyncService:
    def __init__(self, integration_service: SmartMovingIntegrationService):
        self.integration_service = integration_service
    
    async def sync_today_journeys(self):
        """Sync today's journeys for all LGM locations"""
        
        lgm_locations = await get_lgm_locations()
        
        for location in lgm_locations:
            try:
                # Get SmartMoving location ID
                smartmoving_location_id = await map_to_smartmoving_location(location.id)
                
                if smartmoving_location_id:
                    # Import today's jobs
                    imported_count = await self.integration_service.import_jobs_for_location(
                        smartmoving_location_id,
                        datetime.now().strftime("%Y-%m-%d")
                    )
                    
                    logger.info(f"Imported {imported_count} jobs for {location.name}")
                
            except Exception as e:
                logger.error(f"Failed to sync location {location.name}: {e}")
                continue
```

---

## 🧪 **TESTING STRATEGY**

### **Test 1: API Connection & Discovery**
```python
async def test_smartmoving_connection():
    """Test basic API connectivity and discover endpoints"""
    
    # Test health endpoint
    health_response = await test_endpoint("/api/health")
    assert health_response.status_code == 200
    
    # Test locations endpoint
    locations_response = await test_endpoint("/api/locations")
    assert locations_response.status_code == 200
    
    # Find Burnaby location
    burnaby_location = find_location_by_name(locations_response.data, "Burnaby")
    assert burnaby_location is not None
    
    return burnaby_location
```

### **Test 2: Data Retrieval**
```python
async def test_job_retrieval():
    """Test retrieving jobs for Burnaby location"""
    
    burnaby_location = await test_smartmoving_connection()
    
    # Get today's jobs
    today = datetime.now().strftime("%Y-%m-%d")
    jobs_response = await get_smartmoving_jobs(
        location_id=burnaby_location["id"],
        start_date=today,
        end_date=today
    )
    
    assert jobs_response.status_code == 200
    assert len(jobs_response.data) >= 0  # May be empty
    
    return jobs_response.data
```

### **Test 3: Data Normalization**
```python
async def test_data_normalization():
    """Test normalizing SmartMoving job data"""
    
    # Get sample job data
    sample_job = await get_sample_job()
    
    # Create normalizer
    normalizer = SmartMovingDataNormalizer(lgm_client_id="clm_f55e13de_a5c4_4990_ad02_34bb07187daa")
    
    # Normalize job
    normalized_job = await normalizer.normalize_job(sample_job)
    
    # Validate normalized data
    assert normalized_job["externalId"] == sample_job["id"]
    assert normalized_job["locationId"] == "loc_lgm_burnaby_corporate_001"
    assert normalized_job["status"] in ["MORNING_PREP", "EN_ROUTE", "ONSITE", "COMPLETED"]
    
    return normalized_job
```

### **Test 4: Database Integration**
```python
async def test_database_integration():
    """Test saving normalized data to C&C CRM database"""
    
    # Get normalized job data
    normalized_job = await test_data_normalization()
    
    # Create integration service
    integration_service = SmartMovingIntegrationService(db_session, normalizer)
    
    # Import job
    journey_id = await integration_service.create_journey(normalized_job)
    
    # Verify job was created
    created_journey = await get_journey(journey_id)
    assert created_journey.externalId == normalized_job["externalId"]
    assert created_journey.locationId == normalized_job["locationId"]
    
    return created_journey
```

### **Test 5: RBAC Testing**
```python
async def test_rbac_access():
    """Test role-based access to imported journeys"""
    
    # Create test users with different roles
    test_users = [
        {"role": "ADMIN", "locationId": "loc_lgm_burnaby_corporate_001"},
        {"role": "DRIVER", "locationId": "loc_lgm_burnaby_corporate_001"},
        {"role": "DISPATCHER", "locationId": "loc_lgm_burnaby_corporate_001"}
    ]
    
    for user_data in test_users:
        user = await create_test_user(user_data)
        
        # Get journeys for user
        journeys = await get_journeys_for_user(user.id)
        
        # Verify access based on role
        if user.role == "ADMIN":
            assert len(journeys) > 0  # Should see all journeys
        elif user.role == "DRIVER":
            # Should only see assigned journeys
            assigned_journeys = [j for j in journeys if user.id in j.crew_member_ids]
            assert len(journeys) == len(assigned_journeys)
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: API Exploration**
- [ ] Test SmartMoving API connectivity
- [ ] Discover available endpoints
- [ ] Map LGM Burnaby location to SmartMoving location
- [ ] Retrieve sample job data for Burnaby
- [ ] Document API response structure

### **Phase 2: Data Normalization**
- [ ] Create SmartMovingDataNormalizer class
- [ ] Implement job data normalization
- [ ] Implement crew assignment normalization
- [ ] Create status and role mapping
- [ ] Test data transformation

### **Phase 3: Database Integration**
- [ ] Create SmartMovingIntegrationService class
- [ ] Implement job import functionality
- [ ] Add external ID tracking
- [ ] Handle duplicate job detection
- [ ] Test database operations

### **Phase 4: RBAC Integration**
- [ ] Implement location-based filtering
- [ ] Add role-based access control
- [ ] Create journey retrieval by user role
- [ ] Test access permissions
- [ ] Document RBAC rules

### **Phase 5: Production Deployment**
- [ ] Create scheduled sync service
- [ ] Add error handling and logging
- [ ] Implement retry mechanisms
- [ ] Create monitoring dashboard
- [ ] Deploy to production

---

## 🚀 **NEXT STEPS**

### **Immediate Actions**
1. **Test SmartMoving API endpoints** to discover data structure
2. **Map LGM Burnaby location** to SmartMoving location ID
3. **Retrieve sample job data** for today's date
4. **Create data normalization service** for job transformation
5. **Test database integration** with normalized data

### **Success Criteria**
- ✅ SmartMoving API connection working
- ✅ LGM Burnaby location mapped
- ✅ Today's jobs retrieved successfully
- ✅ Data normalized to C&C CRM format
- ✅ Jobs saved to database with proper RBAC
- ✅ Users can view their journeys by role and location

---

## 📞 **SUPPORT & RESOURCES**

### **SmartMoving API Documentation**
- **Base URL:** https://api.smartmoving.com
- **API Key:** `185840176c73420fbd3a473c2fdccedb`
- **Client ID:** `b0db4e2b-74af-44e2-8ecd-6f4921ec836f`

### **C&C CRM Database**
- **LGM Client ID:** `clm_f55e13de_a5c4_4990_ad02_34bb07187daa`
- **Burnaby Location ID:** `loc_lgm_burnaby_corporate_001`
- **Contact:** SHAHBAZ

### **Test Environment**
- **API Testing:** Use provided test script
- **Database:** Production PostgreSQL on Render.com
- **Logging:** Comprehensive audit trail

---

**🎯 GOAL:** Enable LGM users to view their SmartMoving jobs in C&C CRM with proper role-based access control by location and date.

---

**Last Updated:** August 8, 2025  
**Next Review:** After API exploration  
**Version:** 1.0.0
