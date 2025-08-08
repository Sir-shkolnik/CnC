"""
Backup Management Models
C&C CRM - Super Admin Backup Management System
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# ===== ENUMS =====

class BackupType(str, Enum):
    GIT = "git"
    CONFIG = "config"
    DATABASE = "database"
    FULL = "full"

class BackupStatus(str, Enum):
    ENCRYPTED = "encrypted"
    VERIFIED = "verified"
    CORRUPTED = "corrupted"
    PENDING = "pending"

class SystemHealth(str, Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"

class LogLevel(str, Enum):
    INFO = "INFO"
    ERROR = "ERROR"
    SECURITY = "SECURITY"
    WARNING = "WARNING"

class AutomationStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"

# ===== BASE MODELS =====

class BackupFileBase(BaseModel):
    name: str = Field(..., description="Backup file name")
    type: BackupType = Field(..., description="Type of backup")
    size: int = Field(..., description="File size in bytes")
    sizeFormatted: str = Field(..., description="Human readable file size")
    createdAt: str = Field(..., description="Creation timestamp")
    status: BackupStatus = Field(..., description="Backup status")
    encryption: str = Field(..., description="Encryption method")
    integrity: bool = Field(..., description="File integrity status")
    retentionDays: int = Field(..., description="Retention period in days")
    path: str = Field(..., description="File path")
    checksum: Optional[str] = Field(None, description="File checksum")

class BackupStatusBase(BaseModel):
    lastBackup: str = Field(..., description="Last backup timestamp")
    nextScheduledBackup: str = Field(..., description="Next scheduled backup timestamp")
    totalBackups: int = Field(..., description="Total number of backups")
    totalSize: int = Field(..., description="Total size in bytes")
    totalSizeFormatted: str = Field(..., description="Human readable total size")
    systemHealth: SystemHealth = Field(..., description="System health status")
    encryptionStatus: str = Field(..., description="Encryption status")
    automationStatus: AutomationStatus = Field(..., description="Automation status")
    diskSpace: Dict[str, Any] = Field(..., description="Disk space information")

class BackupLogBase(BaseModel):
    timestamp: str = Field(..., description="Log timestamp")
    level: LogLevel = Field(..., description="Log level")
    message: str = Field(..., description="Log message")
    action: str = Field(..., description="Action performed")
    userId: Optional[str] = Field(None, description="User ID who performed action")
    backupId: Optional[str] = Field(None, description="Related backup ID")
    duration: Optional[int] = Field(None, description="Operation duration in seconds")
    status: str = Field(..., description="Operation status")

class BackupSettingsBase(BaseModel):
    retentionDays: int = Field(30, ge=1, le=365, description="Retention period in days")
    encryptionEnabled: bool = Field(True, description="Enable encryption")
    compressionEnabled: bool = Field(True, description="Enable compression")
    verificationEnabled: bool = Field(True, description="Enable verification")
    automationEnabled: bool = Field(True, description="Enable automation")
    dailyBackupTime: str = Field("02:00", description="Daily backup time (HH:MM)")
    weeklyBackupDay: str = Field("Sunday", description="Weekly backup day")
    monthlyBackupDay: int = Field(1, ge=1, le=31, description="Monthly backup day")
    maxBackupSize: int = Field(1073741824, ge=1048576, description="Maximum backup size in bytes")
    alertThreshold: int = Field(80, ge=1, le=100, description="Disk usage alert threshold")

    @validator('dailyBackupTime')
    def validate_daily_backup_time(cls, v):
        try:
            datetime.strptime(v, "%H:%M")
            return v
        except ValueError:
            raise ValueError('Daily backup time must be in HH:MM format')

    @validator('weeklyBackupDay')
    def validate_weekly_backup_day(cls, v):
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if v not in valid_days:
            raise ValueError(f'Weekly backup day must be one of: {", ".join(valid_days)}')
        return v

# ===== REQUEST MODELS =====

class ManualBackupRequest(BaseModel):
    type: Optional[BackupType] = Field(None, description="Type of backup to create")
    description: Optional[str] = Field(None, description="Backup description")

class RestoreBackupRequest(BaseModel):
    backupPath: str = Field(..., description="Path to backup file")
    restoreDirectory: str = Field(..., description="Directory to restore to")
    verifyIntegrity: bool = Field(True, description="Verify backup integrity before restore")

class BackupSettingsUpdate(BaseModel):
    retentionDays: Optional[int] = Field(None, ge=1, le=365, description="Retention period in days")
    encryptionEnabled: Optional[bool] = Field(None, description="Enable encryption")
    compressionEnabled: Optional[bool] = Field(None, description="Enable compression")
    verificationEnabled: Optional[bool] = Field(None, description="Enable verification")
    automationEnabled: Optional[bool] = Field(None, description="Enable automation")
    dailyBackupTime: Optional[str] = Field(None, description="Daily backup time (HH:MM)")
    weeklyBackupDay: Optional[str] = Field(None, description="Weekly backup day")
    monthlyBackupDay: Optional[int] = Field(None, ge=1, le=31, description="Monthly backup day")
    maxBackupSize: Optional[int] = Field(None, ge=1048576, description="Maximum backup size in bytes")
    alertThreshold: Optional[int] = Field(None, ge=1, le=100, description="Disk usage alert threshold")

    @validator('dailyBackupTime')
    def validate_daily_backup_time(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, "%H:%M")
                return v
            except ValueError:
                raise ValueError('Daily backup time must be in HH:MM format')
        return v

    @validator('weeklyBackupDay')
    def validate_weekly_backup_day(cls, v):
        if v is not None:
            valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            if v not in valid_days:
                raise ValueError(f'Weekly backup day must be one of: {", ".join(valid_days)}')
        return v

# ===== RESPONSE MODELS =====

class BackupFileResponse(BackupFileBase):
    id: str = Field(..., description="Backup file ID")

    class Config:
        schema_extra = {
            "example": {
                "id": "backup-1",
                "name": "c-and-c-crm-git-backup-20250807-212638.tar.gz.enc",
                "type": "git",
                "size": 19922944,
                "sizeFormatted": "19.0 MB",
                "createdAt": "2025-08-07T21:26:38Z",
                "status": "verified",
                "encryption": "AES-256-CBC",
                "integrity": True,
                "retentionDays": 30,
                "path": "/backups/c-and-c-crm-git-backup-20250807-212638.tar.gz.enc",
                "checksum": "sha256:abc123..."
            }
        }

class BackupStatusResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    data: BackupStatusBase = Field(..., description="Backup status data")
    message: str = Field(..., description="Response message")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "lastBackup": "2025-08-07T21:26:40Z",
                    "nextScheduledBackup": "2025-08-08T02:00:00Z",
                    "totalBackups": 3,
                    "totalSize": 20406016,
                    "totalSizeFormatted": "19.5 MB",
                    "systemHealth": "healthy",
                    "encryptionStatus": "active",
                    "automationStatus": "running",
                    "diskSpace": {
                        "used": 24117248,
                        "available": 499999999999,
                        "total": 500000000000,
                        "percentage": 0.005
                    }
                },
                "message": "Backup status retrieved successfully"
            }
        }

class BackupLogResponse(BaseModel):
    id: str = Field(..., description="Log entry ID")
    timestamp: str = Field(..., description="Log timestamp")
    level: LogLevel = Field(..., description="Log level")
    message: str = Field(..., description="Log message")
    action: str = Field(..., description="Action performed")
    userId: Optional[str] = Field(None, description="User ID who performed action")
    backupId: Optional[str] = Field(None, description="Related backup ID")
    duration: Optional[int] = Field(None, description="Operation duration in seconds")
    status: str = Field(..., description="Operation status")

    class Config:
        schema_extra = {
            "example": {
                "id": "log-1",
                "timestamp": "2025-08-07T21:26:40Z",
                "level": "INFO",
                "message": "Full backup completed successfully",
                "action": "BACKUP_COMPLETED",
                "userId": "super-admin",
                "backupId": "backup-1",
                "duration": 2,
                "status": "success"
            }
        }

class BackupSettingsResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    data: BackupSettingsBase = Field(..., description="Backup settings data")
    message: str = Field(..., description="Response message")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "retentionDays": 30,
                    "encryptionEnabled": True,
                    "compressionEnabled": True,
                    "verificationEnabled": True,
                    "automationEnabled": True,
                    "dailyBackupTime": "02:00",
                    "weeklyBackupDay": "Sunday",
                    "monthlyBackupDay": 1,
                    "maxBackupSize": 1073741824,
                    "alertThreshold": 80
                },
                "message": "Backup settings retrieved successfully"
            }
        }

class BackupVerificationResponse(BaseModel):
    success: bool = Field(..., description="Verification success status")
    backupId: str = Field(..., description="Backup file ID")
    integrity: bool = Field(..., description="Backup integrity status")
    message: str = Field(..., description="Verification message")
    details: Optional[str] = Field(None, description="Verification details")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "backupId": "backup-1",
                "integrity": True,
                "message": "Backup verification completed",
                "details": "Backup file integrity verified successfully"
            }
        }

# ===== ANALYTICS MODELS =====

class BackupAnalytics(BaseModel):
    totalBackups: int = Field(..., description="Total number of backups")
    totalSize: int = Field(..., description="Total size in bytes")
    totalSizeFormatted: str = Field(..., description="Human readable total size")
    typeDistribution: Dict[str, int] = Field(..., description="Backup type distribution")
    averageSize: float = Field(..., description="Average backup size in bytes")
    period: str = Field(..., description="Analysis period")

class BackupAnalyticsResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    data: BackupAnalytics = Field(..., description="Analytics data")
    message: str = Field(..., description="Response message")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "totalBackups": 15,
                    "totalSize": 306090240,
                    "totalSizeFormatted": "292.0 MB",
                    "typeDistribution": {
                        "git": 5,
                        "config": 5,
                        "database": 5
                    },
                    "averageSize": 20406016.0,
                    "period": "Last 30 days"
                },
                "message": "Backup analytics retrieved successfully"
            }
        }

# ===== HEALTH CHECK MODELS =====

class BackupHealthCheck(BaseModel):
    status: SystemHealth = Field(..., description="Overall health status")
    scriptExists: bool = Field(..., description="Backup script exists")
    directoryExists: bool = Field(..., description="Backup directory exists")
    encryptionKeyExists: bool = Field(..., description="Encryption key exists")
    diskSpace: Dict[str, Any] = Field(..., description="Disk space information")
    timestamp: str = Field(..., description="Health check timestamp")

class BackupHealthResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    data: BackupHealthCheck = Field(..., description="Health check data")
    message: str = Field(..., description="Response message")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "status": "healthy",
                    "scriptExists": True,
                    "directoryExists": True,
                    "encryptionKeyExists": True,
                    "diskSpace": {
                        "used": 24117248,
                        "available": 499999999999,
                        "total": 500000000000,
                        "percentage": 0.005
                    },
                    "timestamp": "2025-08-07T21:30:00Z"
                },
                "message": "Backup health check completed"
            }
        }
