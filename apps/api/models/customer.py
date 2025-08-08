"""
Customer Management Models
C&C CRM - Pydantic Models for Customer & Lead Management
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

# ===== ENUMS =====

class LeadStatus(str, Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    PROPOSAL_SENT = "PROPOSAL_SENT"
    NEGOTIATION = "NEGOTIATION"
    WON = "WON"
    LOST = "LOST"
    ARCHIVED = "ARCHIVED"

class LeadPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class SalesActivityType(str, Enum):
    PHONE_CALL = "PHONE_CALL"
    EMAIL = "EMAIL"
    MEETING = "MEETING"
    PROPOSAL_SENT = "PROPOSAL_SENT"
    FOLLOW_UP = "FOLLOW_UP"
    DEMO = "DEMO"
    SITE_VISIT = "SITE_VISIT"
    OTHER = "OTHER"

# ===== CUSTOMER MODELS =====

class AddressModel(BaseModel):
    street: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    province: str = Field(..., description="Province/State")
    postalCode: str = Field(..., description="Postal/ZIP code")
    country: str = Field(default="Canada", description="Country")
    unit: Optional[str] = Field(None, description="Unit/Apartment number")

    @validator('postalCode')
    def validate_postal_code(cls, v):
        if len(v) < 3:
            raise ValueError('Postal code must be at least 3 characters')
        return v.upper()

class CustomerCreate(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=50, description="Customer first name")
    lastName: str = Field(..., min_length=1, max_length=50, description="Customer last name")
    email: str = Field(..., description="Customer email address")  # TEMPORARY: Changed from EmailStr to str to fix deployment
    phone: str = Field(..., min_length=10, max_length=20, description="Customer phone number")
    address: AddressModel = Field(..., description="Customer address")
    leadSource: Optional[str] = Field(None, max_length=100, description="How the customer found us")
    leadStatus: Optional[LeadStatus] = Field(LeadStatus.NEW, description="Current lead status")
    assignedTo: Optional[str] = Field(None, description="Sales rep user ID")
    estimatedValue: Optional[Decimal] = Field(None, ge=0, description="Estimated customer value")
    notes: Optional[str] = Field(None, max_length=1000, description="Customer notes")
    tags: Optional[List[str]] = Field(default=[], description="Customer tags")
    preferences: Optional[Dict[str, Any]] = Field(default={}, description="Customer preferences")

    @validator('phone')
    def validate_phone(cls, v):
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, v))
        if len(digits_only) < 10:
            raise ValueError('Phone number must have at least 10 digits')
        return v

    @validator('estimatedValue')
    def validate_estimated_value(cls, v):
        if v is not None and v < 0:
            raise ValueError('Estimated value cannot be negative')
        return v

class CustomerUpdate(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=50)
    lastName: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[str] = None  # TEMPORARY: Changed from EmailStr to str to fix deployment
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    address: Optional[AddressModel] = None
    leadSource: Optional[str] = Field(None, max_length=100)
    leadStatus: Optional[LeadStatus] = None
    assignedTo: Optional[str] = None
    estimatedValue: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=1000)
    tags: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None
    isActive: Optional[bool] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            digits_only = ''.join(filter(str.isdigit, v))
            if len(digits_only) < 10:
                raise ValueError('Phone number must have at least 10 digits')
        return v

    @validator('estimatedValue')
    def validate_estimated_value(cls, v):
        if v is not None and v < 0:
            raise ValueError('Estimated value cannot be negative')
        return v

class CustomerResponse(BaseModel):
    id: str = Field(..., description="Customer ID")
    firstName: str = Field(..., description="Customer first name")
    lastName: str = Field(..., description="Customer last name")
    email: str = Field(..., description="Customer email address")
    phone: str = Field(..., description="Customer phone number")
    address: Dict[str, Any] = Field(..., description="Customer address")
    leadSource: Optional[str] = Field(None, description="Lead source")
    leadStatus: str = Field(..., description="Current lead status")
    assignedTo: Optional[str] = Field(None, description="Assigned sales rep ID")
    assignedUserName: Optional[str] = Field(None, description="Assigned sales rep name")
    estimatedValue: Optional[Decimal] = Field(None, description="Estimated customer value")
    notes: Optional[str] = Field(None, description="Customer notes")
    tags: List[str] = Field(default=[], description="Customer tags")
    preferences: Dict[str, Any] = Field(default={}, description="Customer preferences")
    isActive: bool = Field(..., description="Customer active status")
    leadCount: int = Field(default=0, description="Number of leads")
    activityCount: int = Field(default=0, description="Number of sales activities")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

# ===== LEAD MODELS =====

class LeadCreate(BaseModel):
    source: str = Field(..., max_length=100, description="Lead source")
    status: Optional[LeadStatus] = Field(LeadStatus.NEW, description="Lead status")
    priority: Optional[LeadPriority] = Field(LeadPriority.MEDIUM, description="Lead priority")
    estimatedMoveDate: Optional[datetime] = Field(None, description="Estimated move date")
    estimatedValue: Optional[Decimal] = Field(None, ge=0, description="Estimated lead value")
    notes: Optional[str] = Field(None, max_length=1000, description="Lead notes")
    followUpDate: Optional[datetime] = Field(None, description="Follow-up date")
    contactHistory: Optional[List[Dict[str, Any]]] = Field(default=[], description="Contact history")
    score: Optional[int] = Field(0, ge=0, le=100, description="Lead score (0-100)")
    qualificationCriteria: Optional[Dict[str, Any]] = Field(default={}, description="Qualification criteria")

    @validator('estimatedValue')
    def validate_estimated_value(cls, v):
        if v is not None and v < 0:
            raise ValueError('Estimated value cannot be negative')
        return v

    @validator('score')
    def validate_score(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Score must be between 0 and 100')
        return v

class LeadUpdate(BaseModel):
    source: Optional[str] = Field(None, max_length=100)
    status: Optional[LeadStatus] = None
    priority: Optional[LeadPriority] = None
    estimatedMoveDate: Optional[datetime] = None
    estimatedValue: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=1000)
    followUpDate: Optional[datetime] = None
    lastContact: Optional[datetime] = None
    contactHistory: Optional[List[Dict[str, Any]]] = None
    score: Optional[int] = Field(None, ge=0, le=100)
    qualificationCriteria: Optional[Dict[str, Any]] = None

    @validator('estimatedValue')
    def validate_estimated_value(cls, v):
        if v is not None and v < 0:
            raise ValueError('Estimated value cannot be negative')
        return v

    @validator('score')
    def validate_score(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Score must be between 0 and 100')
        return v

class LeadResponse(BaseModel):
    id: str = Field(..., description="Lead ID")
    customerId: str = Field(..., description="Customer ID")
    source: str = Field(..., description="Lead source")
    status: str = Field(..., description="Lead status")
    priority: str = Field(..., description="Lead priority")
    estimatedMoveDate: Optional[datetime] = Field(None, description="Estimated move date")
    estimatedValue: Optional[Decimal] = Field(None, description="Estimated lead value")
    notes: Optional[str] = Field(None, description="Lead notes")
    followUpDate: Optional[datetime] = Field(None, description="Follow-up date")
    lastContact: Optional[datetime] = Field(None, description="Last contact date")
    contactHistory: List[Dict[str, Any]] = Field(default=[], description="Contact history")
    score: int = Field(default=0, description="Lead score")
    qualificationCriteria: Dict[str, Any] = Field(default={}, description="Qualification criteria")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

# ===== SALES ACTIVITY MODELS =====

class SalesActivityCreate(BaseModel):
    leadId: Optional[str] = Field(None, description="Related lead ID")
    customerId: Optional[str] = Field(None, description="Related customer ID")
    type: SalesActivityType = Field(..., description="Activity type")
    subject: Optional[str] = Field(None, max_length=200, description="Activity subject")
    description: str = Field(..., max_length=1000, description="Activity description")
    outcome: Optional[str] = Field(None, max_length=500, description="Activity outcome")
    nextAction: Optional[str] = Field(None, max_length=500, description="Next action")
    scheduledDate: Optional[datetime] = Field(None, description="Scheduled date")
    completedDate: Optional[datetime] = Field(None, description="Completed date")
    duration: Optional[int] = Field(None, ge=0, description="Duration in minutes")
    cost: Optional[Decimal] = Field(None, ge=0, description="Activity cost")
    notes: Optional[str] = Field(None, max_length=1000, description="Activity notes")

    @validator('duration')
    def validate_duration(cls, v):
        if v is not None and v < 0:
            raise ValueError('Duration cannot be negative')
        return v

    @validator('cost')
    def validate_cost(cls, v):
        if v is not None and v < 0:
            raise ValueError('Cost cannot be negative')
        return v

    @validator('customerId', 'leadId')
    def validate_related_entities(cls, v, values):
        if 'customerId' not in values and 'leadId' not in values:
            raise ValueError('Either customerId or leadId must be provided')
        return v

class SalesActivityUpdate(BaseModel):
    leadId: Optional[str] = None
    customerId: Optional[str] = None
    type: Optional[SalesActivityType] = None
    subject: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    outcome: Optional[str] = Field(None, max_length=500)
    nextAction: Optional[str] = Field(None, max_length=500)
    scheduledDate: Optional[datetime] = None
    completedDate: Optional[datetime] = None
    duration: Optional[int] = Field(None, ge=0)
    cost: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=1000)

    @validator('duration')
    def validate_duration(cls, v):
        if v is not None and v < 0:
            raise ValueError('Duration cannot be negative')
        return v

    @validator('cost')
    def validate_cost(cls, v):
        if v is not None and v < 0:
            raise ValueError('Cost cannot be negative')
        return v

class SalesActivityResponse(BaseModel):
    id: str = Field(..., description="Activity ID")
    leadId: Optional[str] = Field(None, description="Related lead ID")
    customerId: Optional[str] = Field(None, description="Related customer ID")
    userId: str = Field(..., description="User who created the activity")
    userName: Optional[str] = Field(None, description="User name")
    type: str = Field(..., description="Activity type")
    subject: Optional[str] = Field(None, description="Activity subject")
    description: str = Field(..., description="Activity description")
    outcome: Optional[str] = Field(None, description="Activity outcome")
    nextAction: Optional[str] = Field(None, description="Next action")
    scheduledDate: Optional[datetime] = Field(None, description="Scheduled date")
    completedDate: Optional[datetime] = Field(None, description="Completed date")
    duration: Optional[int] = Field(None, description="Duration in minutes")
    cost: Optional[Decimal] = Field(None, description="Activity cost")
    notes: Optional[str] = Field(None, description="Activity notes")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

# ===== ANALYTICS MODELS =====

class CustomerAnalytics(BaseModel):
    totalCustomers: int = Field(..., description="Total number of customers")
    customersByStatus: Dict[str, int] = Field(..., description="Customers grouped by status")
    customersBySource: Dict[str, int] = Field(..., description="Customers grouped by source")
    recentCustomers: int = Field(..., description="Customers created in last 30 days")
    totalEstimatedValue: float = Field(..., description="Total estimated value")

class LeadAnalytics(BaseModel):
    totalLeads: int = Field(..., description="Total number of leads")
    leadsByStatus: Dict[str, int] = Field(..., description="Leads grouped by status")
    leadsByPriority: Dict[str, int] = Field(..., description="Leads grouped by priority")
    leadsBySource: Dict[str, int] = Field(..., description="Leads grouped by source")
    conversionRate: float = Field(..., description="Lead conversion rate")
    averageScore: float = Field(..., description="Average lead score")

class SalesActivityAnalytics(BaseModel):
    totalActivities: int = Field(..., description="Total number of activities")
    activitiesByType: Dict[str, int] = Field(..., description="Activities grouped by type")
    activitiesByUser: Dict[str, int] = Field(..., description="Activities grouped by user")
    averageDuration: float = Field(..., description="Average activity duration")
    totalCost: float = Field(..., description="Total activity cost") 