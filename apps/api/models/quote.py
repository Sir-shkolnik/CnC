"""
Quote Management Models
C&C CRM - Pydantic Models for Sales Pipeline & Quote Management
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

# ===== ENUMS =====

class QuoteStatus(str, Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    VIEWED = "VIEWED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    CONVERTED = "CONVERTED"

class QuoteItemCategory(str, Enum):
    MOVING_SERVICES = "MOVING_SERVICES"
    STORAGE_SERVICES = "STORAGE_SERVICES"
    PACKING_SERVICES = "PACKING_SERVICES"
    SPECIALTY_SERVICES = "SPECIALTY_SERVICES"
    EQUIPMENT_RENTAL = "EQUIPMENT_RENTAL"
    INSURANCE = "INSURANCE"
    OTHER = "OTHER"

# ===== QUOTE MODELS =====

class QuoteCreate(BaseModel):
    customerId: str = Field(..., description="Customer ID")
    totalAmount: Decimal = Field(..., ge=0, description="Total quote amount")
    currency: str = Field(default="CAD", max_length=3, description="Currency code")
    validUntil: Optional[datetime] = Field(None, description="Quote validity date")
    terms: Optional[str] = Field(None, max_length=2000, description="Quote terms and conditions")
    notes: Optional[str] = Field(None, max_length=1000, description="Quote notes")
    status: Optional[QuoteStatus] = Field(QuoteStatus.DRAFT, description="Quote status")
    version: Optional[int] = Field(1, ge=1, description="Quote version")
    isTemplate: Optional[bool] = Field(False, description="Is this a template")
    templateName: Optional[str] = Field(None, max_length=100, description="Template name")

    @validator('currency')
    def validate_currency(cls, v):
        valid_currencies = ['CAD', 'USD', 'EUR']
        if v not in valid_currencies:
            raise ValueError(f'Currency must be one of: {", ".join(valid_currencies)}')
        return v

    @validator('totalAmount')
    def validate_total_amount(cls, v):
        if v < 0:
            raise ValueError('Total amount cannot be negative')
        return v

class QuoteUpdate(BaseModel):
    totalAmount: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=3)
    validUntil: Optional[datetime] = None
    terms: Optional[str] = Field(None, max_length=2000)
    notes: Optional[str] = Field(None, max_length=1000)
    status: Optional[QuoteStatus] = None
    version: Optional[int] = Field(None, ge=1)
    isTemplate: Optional[bool] = None
    templateName: Optional[str] = Field(None, max_length=100)

    @validator('currency')
    def validate_currency(cls, v):
        if v is not None:
            valid_currencies = ['CAD', 'USD', 'EUR']
            if v not in valid_currencies:
                raise ValueError(f'Currency must be one of: {", ".join(valid_currencies)}')
        return v

    @validator('totalAmount')
    def validate_total_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError('Total amount cannot be negative')
        return v

class QuoteResponse(BaseModel):
    id: str = Field(..., description="Quote ID")
    customerId: str = Field(..., description="Customer ID")
    customerName: str = Field(..., description="Customer full name")
    customerEmail: str = Field(..., description="Customer email")
    customerPhone: str = Field(..., description="Customer phone")
    clientId: str = Field(..., description="Client ID")
    locationId: str = Field(..., description="Location ID")
    createdBy: str = Field(..., description="Created by user ID")
    createdUserName: Optional[str] = Field(None, description="Created by user name")
    status: str = Field(..., description="Quote status")
    totalAmount: Decimal = Field(..., description="Total quote amount")
    currency: str = Field(..., description="Currency code")
    validUntil: datetime = Field(..., description="Quote validity date")
    terms: Optional[str] = Field(None, description="Quote terms")
    notes: Optional[str] = Field(None, description="Quote notes")
    version: int = Field(..., description="Quote version")
    isTemplate: bool = Field(..., description="Is template")
    templateName: Optional[str] = Field(None, description="Template name")
    approvedBy: Optional[str] = Field(None, description="Approved by user ID")
    approvedUserName: Optional[str] = Field(None, description="Approved by user name")
    approvedAt: Optional[datetime] = Field(None, description="Approval date")
    rejectionReason: Optional[str] = Field(None, description="Rejection reason")
    itemCount: int = Field(default=0, description="Number of quote items")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

# ===== QUOTE ITEM MODELS =====

class QuoteItemCreate(BaseModel):
    description: str = Field(..., max_length=500, description="Item description")
    quantity: int = Field(..., ge=1, description="Item quantity")
    unitPrice: Decimal = Field(..., ge=0, description="Unit price")
    totalPrice: Decimal = Field(..., ge=0, description="Total price")
    category: QuoteItemCategory = Field(..., description="Item category")
    subcategory: Optional[str] = Field(None, max_length=100, description="Item subcategory")
    notes: Optional[str] = Field(None, max_length=500, description="Item notes")
    isOptional: Optional[bool] = Field(False, description="Is optional item")
    sortOrder: Optional[int] = Field(0, ge=0, description="Sort order")

    @validator('unitPrice')
    def validate_unit_price(cls, v):
        if v < 0:
            raise ValueError('Unit price cannot be negative')
        return v

    @validator('totalPrice')
    def validate_total_price(cls, v):
        if v < 0:
            raise ValueError('Total price cannot be negative')
        return v

    @validator('quantity')
    def validate_quantity(cls, v):
        if v < 1:
            raise ValueError('Quantity must be at least 1')
        return v

class QuoteItemUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=500)
    quantity: Optional[int] = Field(None, ge=1)
    unitPrice: Optional[Decimal] = Field(None, ge=0)
    totalPrice: Optional[Decimal] = Field(None, ge=0)
    category: Optional[QuoteItemCategory] = None
    subcategory: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)
    isOptional: Optional[bool] = None
    sortOrder: Optional[int] = Field(None, ge=0)

    @validator('unitPrice')
    def validate_unit_price(cls, v):
        if v is not None and v < 0:
            raise ValueError('Unit price cannot be negative')
        return v

    @validator('totalPrice')
    def validate_total_price(cls, v):
        if v is not None and v < 0:
            raise ValueError('Total price cannot be negative')
        return v

    @validator('quantity')
    def validate_quantity(cls, v):
        if v is not None and v < 1:
            raise ValueError('Quantity must be at least 1')
        return v

class QuoteItemResponse(BaseModel):
    id: str = Field(..., description="Quote item ID")
    quoteId: str = Field(..., description="Quote ID")
    description: str = Field(..., description="Item description")
    quantity: int = Field(..., description="Item quantity")
    unitPrice: Decimal = Field(..., description="Unit price")
    totalPrice: Decimal = Field(..., description="Total price")
    category: str = Field(..., description="Item category")
    subcategory: Optional[str] = Field(None, description="Item subcategory")
    notes: Optional[str] = Field(None, description="Item notes")
    isOptional: bool = Field(..., description="Is optional item")
    sortOrder: int = Field(..., description="Sort order")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

# ===== ANALYTICS MODELS =====

class QuoteAnalytics(BaseModel):
    totalQuotes: int = Field(..., description="Total number of quotes")
    quotesByStatus: Dict[str, int] = Field(..., description="Quotes grouped by status")
    totalValue: float = Field(..., description="Total quote value")
    conversionRate: float = Field(..., description="Quote conversion rate")
    convertedQuotes: int = Field(..., description="Number of converted quotes")

class SalesPipelineAnalytics(BaseModel):
    pipeline: List[Dict[str, Any]] = Field(..., description="Pipeline stages with counts and values")

class ConversionAnalytics(BaseModel):
    conversionByMonth: List[Dict[str, Any]] = Field(..., description="Conversion data by month")

# ===== TEMPLATE MODELS =====

class QuoteTemplateCreate(BaseModel):
    name: str = Field(..., max_length=100, description="Template name")
    description: Optional[str] = Field(None, max_length=500, description="Template description")
    totalAmount: Decimal = Field(..., ge=0, description="Default total amount")
    currency: str = Field(default="CAD", max_length=3, description="Currency code")
    terms: Optional[str] = Field(None, max_length=2000, description="Default terms")
    notes: Optional[str] = Field(None, max_length=1000, description="Template notes")
    items: List[QuoteItemCreate] = Field(default=[], description="Default quote items")

    @validator('currency')
    def validate_currency(cls, v):
        valid_currencies = ['CAD', 'USD', 'EUR']
        if v not in valid_currencies:
            raise ValueError(f'Currency must be one of: {", ".join(valid_currencies)}')
        return v

    @validator('totalAmount')
    def validate_total_amount(cls, v):
        if v < 0:
            raise ValueError('Total amount cannot be negative')
        return v

class QuoteTemplateResponse(BaseModel):
    id: str = Field(..., description="Template ID")
    name: str = Field(..., description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    totalAmount: Decimal = Field(..., description="Default total amount")
    currency: str = Field(..., description="Currency code")
    terms: Optional[str] = Field(None, description="Default terms")
    notes: Optional[str] = Field(None, description="Template notes")
    itemCount: int = Field(default=0, description="Number of default items")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True 