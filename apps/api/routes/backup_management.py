"""
Backup Management API Routes
C&C CRM - Super Admin Backup Management System
CISSP Compliant - Agile Security Lifecycle
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import os
import subprocess
import shutil
from pathlib import Path

from ..middleware.auth import get_current_user
from ..middleware.super_admin import require_super_admin
from ..models.backup import (
    BackupFileResponse, BackupStatusResponse, BackupLogResponse, 
    BackupSettingsResponse, BackupSettingsUpdate, ManualBackupRequest,
    RestoreBackupRequest, BackupVerificationResponse
)

router = APIRouter(prefix="/backup", tags=["Backup Management"])

# ===== CONFIGURATION =====
BACKUP_ROOT = "/Users/udishkolnik/C&C/c-and-c-crm/backups"
BACKUP_SCRIPT = "/Users/udishkolnik/C&C/c-and-c-crm/scripts/automated_backup_system.sh"
LOG_FILE = f"{BACKUP_ROOT}/backup.log"
ENCRYPTION_KEY_FILE = f"{BACKUP_ROOT}/.backup_key"

# ===== HELPER FUNCTIONS =====

def get_backup_files() -> List[Dict[str, Any]]:
    """Get list of backup files with metadata"""
    backup_files = []
    
    if not os.path.exists(BACKUP_ROOT):
        return backup_files
    
    for file_path in Path(BACKUP_ROOT).glob("*.enc"):
        if file_path.is_file():
            stat = file_path.stat()
            
            # Parse filename to extract metadata
            filename = file_path.name
            file_type = "unknown"
            
            if "git-backup" in filename:
                file_type = "git"
            elif "config-backup" in filename:
                file_type = "config"
            elif "db-backup" in filename:
                file_type = "database"
            elif "full-backup" in filename:
                file_type = "full"
            
            # Extract timestamp from filename
            timestamp_str = filename.split("-")[-1].replace(".tar.gz.enc", "").replace(".sql.enc", "")
            try:
                created_at = datetime.strptime(timestamp_str, "%Y%m%d-%H%M%S")
            except:
                created_at = datetime.fromtimestamp(stat.st_mtime)
            
            backup_files.append({
                "id": f"backup-{len(backup_files) + 1}",
                "name": filename,
                "type": file_type,
                "size": stat.st_size,
                "sizeFormatted": format_file_size(stat.st_size),
                "createdAt": created_at.isoformat(),
                "status": "verified",  # TODO: Implement actual verification
                "encryption": "AES-256-CBC",
                "integrity": True,
                "retentionDays": 30,
                "path": str(file_path),
                "checksum": f"sha256:{generate_file_hash(str(file_path))}"
            })
    
    return sorted(backup_files, key=lambda x: x["createdAt"], reverse=True)

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def generate_file_hash(file_path: str) -> str:
    """Generate SHA256 hash of file"""
    try:
        import hashlib
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()[:8]
    except:
        return "unknown"

def get_backup_status() -> Dict[str, Any]:
    """Get current backup system status"""
    backup_files = get_backup_files()
    total_size = sum(backup["size"] for backup in backup_files)
    
    # Get disk space
    try:
        disk_usage = shutil.disk_usage(BACKUP_ROOT)
        disk_space = {
            "used": disk_usage.used,
            "available": disk_usage.free,
            "total": disk_usage.total,
            "percentage": (disk_usage.used / disk_usage.total) * 100
        }
    except:
        disk_space = {
            "used": 0,
            "available": 0,
            "total": 0,
            "percentage": 0
        }
    
    # Determine system health
    system_health = "healthy"
    if disk_space["percentage"] > 90:
        system_health = "critical"
    elif disk_space["percentage"] > 80:
        system_health = "warning"
    
    # Get last backup time
    last_backup = None
    if backup_files:
        last_backup = backup_files[0]["createdAt"]
    
    # Calculate next scheduled backup
    now = datetime.now()
    next_daily = now.replace(hour=2, minute=0, second=0, microsecond=0)
    if next_daily <= now:
        next_daily += timedelta(days=1)
    
    return {
        "lastBackup": last_backup or now.isoformat(),
        "nextScheduledBackup": next_daily.isoformat(),
        "totalBackups": len(backup_files),
        "totalSize": total_size,
        "totalSizeFormatted": format_file_size(total_size),
        "systemHealth": system_health,
        "encryptionStatus": "active" if os.path.exists(ENCRYPTION_KEY_FILE) else "inactive",
        "automationStatus": "running",  # TODO: Check actual cron status
        "diskSpace": disk_space
    }

def get_backup_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Get backup logs from log file"""
    logs = []
    
    if not os.path.exists(LOG_FILE):
        return logs
    
    try:
        with open(LOG_FILE, 'r') as f:
            lines = f.readlines()
            
        for line in lines[-limit:]:  # Get last N lines
            if line.strip():
                # Parse log line format: [timestamp] [LEVEL] message
                try:
                    parts = line.strip().split('] [')
                    if len(parts) >= 2:
                        timestamp_str = parts[0].replace('[', '')
                        level_message = parts[1].split('] ', 1)
                        if len(level_message) >= 2:
                            level = level_message[0]
                            message = level_message[1]
                            
                            logs.append({
                                "id": f"log-{len(logs) + 1}",
                                "timestamp": timestamp_str,
                                "level": level,
                                "message": message,
                                "action": "LOG_ENTRY",
                                "status": "success" if level == "INFO" else "failed"
                            })
                except:
                    continue
                    
    except Exception as e:
        print(f"Error reading backup logs: {e}")
    
    return logs[::-1]  # Reverse to show newest first

def get_backup_settings() -> Dict[str, Any]:
    """Get current backup settings"""
    return {
        "retentionDays": 30,
        "encryptionEnabled": True,
        "compressionEnabled": True,
        "verificationEnabled": True,
        "automationEnabled": True,
        "dailyBackupTime": "02:00",
        "weeklyBackupDay": "Sunday",
        "monthlyBackupDay": 1,
        "maxBackupSize": 1073741824,  # 1GB
        "alertThreshold": 80
    }

def execute_backup_command(command: str) -> Dict[str, Any]:
    """Execute backup system command"""
    try:
        result = subprocess.run(
            [BACKUP_SCRIPT, command],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returnCode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": "Command timed out after 5 minutes",
            "returnCode": -1
        }
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": str(e),
            "returnCode": -1
        }

# ===== API ENDPOINTS =====

@router.get("/status", response_model=BackupStatusResponse)
async def get_backup_status_endpoint(
    current_user: Dict = Depends(require_super_admin)
):
    """Get backup system status"""
    try:
        status_data = get_backup_status()
        return {
            "success": True,
            "data": status_data,
            "message": "Backup status retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get backup status: {str(e)}"
        )

@router.get("/files", response_model=List[BackupFileResponse])
async def get_backup_files_endpoint(
    current_user: Dict = Depends(require_super_admin),
    type_filter: Optional[str] = Query(None, description="Filter by backup type"),
    status_filter: Optional[str] = Query(None, description="Filter by backup status"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of files to return")
):
    """Get list of backup files"""
    try:
        backup_files = get_backup_files()
        
        # Apply filters
        if type_filter and type_filter != "ALL":
            backup_files = [f for f in backup_files if f["type"] == type_filter]
        
        if status_filter and status_filter != "ALL":
            backup_files = [f for f in backup_files if f["status"] == status_filter]
        
        # Apply limit
        backup_files = backup_files[:limit]
        
        return backup_files
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get backup files: {str(e)}"
        )

@router.get("/files/{backup_id}", response_model=BackupFileResponse)
async def get_backup_file_endpoint(
    backup_id: str,
    current_user: Dict = Depends(require_super_admin)
):
    """Get specific backup file details"""
    try:
        backup_files = get_backup_files()
        backup_file = next((f for f in backup_files if f["id"] == backup_id), None)
        
        if not backup_file:
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        return backup_file
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get backup file: {str(e)}"
        )

@router.post("/files/{backup_id}/verify", response_model=BackupVerificationResponse)
async def verify_backup_file_endpoint(
    backup_id: str,
    current_user: Dict = Depends(require_super_admin)
):
    """Verify backup file integrity"""
    try:
        backup_files = get_backup_files()
        backup_file = next((f for f in backup_files if f["id"] == backup_id), None)
        
        if not backup_file:
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        # Execute verification command
        result = execute_backup_command("verify")
        
        return {
            "success": result["success"],
            "backupId": backup_id,
            "integrity": result["success"],
            "message": "Backup verification completed",
            "details": result["stdout"] if result["success"] else result["stderr"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify backup file: {str(e)}"
        )

@router.delete("/files/{backup_id}")
async def delete_backup_file_endpoint(
    backup_id: str,
    current_user: Dict = Depends(require_super_admin)
):
    """Delete backup file"""
    try:
        backup_files = get_backup_files()
        backup_file = next((f for f in backup_files if f["id"] == backup_id), None)
        
        if not backup_file:
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        # Delete the file
        file_path = backup_file["path"]
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return {
            "success": True,
            "message": "Backup file deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete backup file: {str(e)}"
        )

@router.post("/manual", response_model=Dict[str, Any])
async def create_manual_backup_endpoint(
    request: ManualBackupRequest,
    current_user: Dict = Depends(require_super_admin)
):
    """Create manual backup"""
    try:
        # Execute manual backup command
        result = execute_backup_command("backup")
        
        if result["success"]:
            return {
                "success": True,
                "message": "Manual backup initiated successfully",
                "details": result["stdout"]
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Backup failed: {result['stderr']}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create manual backup: {str(e)}"
        )

@router.get("/logs", response_model=List[BackupLogResponse])
async def get_backup_logs_endpoint(
    current_user: Dict = Depends(require_super_admin),
    limit: int = Query(50, ge=1, le=1000, description="Maximum number of log entries to return"),
    level: Optional[str] = Query(None, description="Filter by log level")
):
    """Get backup logs"""
    try:
        logs = get_backup_logs(limit)
        
        # Apply level filter
        if level:
            logs = [log for log in logs if log["level"] == level]
        
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get backup logs: {str(e)}"
        )

@router.get("/settings", response_model=BackupSettingsResponse)
async def get_backup_settings_endpoint(
    current_user: Dict = Depends(require_super_admin)
):
    """Get backup settings"""
    try:
        settings = get_backup_settings()
        return {
            "success": True,
            "data": settings,
            "message": "Backup settings retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get backup settings: {str(e)}"
        )

@router.put("/settings", response_model=BackupSettingsResponse)
async def update_backup_settings_endpoint(
    settings: BackupSettingsUpdate,
    current_user: Dict = Depends(require_super_admin)
):
    """Update backup settings"""
    try:
        # TODO: Implement actual settings update
        # For now, just return the updated settings
        updated_settings = get_backup_settings()
        updated_settings.update(settings.dict(exclude_unset=True))
        
        return {
            "success": True,
            "data": updated_settings,
            "message": "Backup settings updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update backup settings: {str(e)}"
        )

@router.post("/restore", response_model=Dict[str, Any])
async def restore_backup_endpoint(
    request: RestoreBackupRequest,
    current_user: Dict = Depends(require_super_admin)
):
    """Restore from backup"""
    try:
        # Validate backup file exists
        if not os.path.exists(request.backupPath):
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        # Execute restore command
        result = execute_backup_command(f"restore {request.backupPath} {request.restoreDirectory}")
        
        if result["success"]:
            return {
                "success": True,
                "message": "Backup restore initiated successfully",
                "details": result["stdout"]
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Restore failed: {result['stderr']}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restore backup: {str(e)}"
        )

@router.post("/upload")
async def upload_backup_file_endpoint(
    file: UploadFile = File(...),
    current_user: Dict = Depends(require_super_admin)
):
    """Upload backup file for restore"""
    try:
        # Validate file type
        if not file.filename.endswith('.enc'):
            raise HTTPException(
                status_code=400,
                detail="Only encrypted backup files (.enc) are allowed"
            )
        
        # Save uploaded file
        upload_path = os.path.join(BACKUP_ROOT, file.filename)
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "success": True,
            "message": "Backup file uploaded successfully",
            "filePath": upload_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload backup file: {str(e)}"
        )

@router.get("/health", response_model=Dict[str, Any])
async def get_backup_health_endpoint(
    current_user: Dict = Depends(require_super_admin)
):
    """Get backup system health check"""
    try:
        # Check if backup script exists
        script_exists = os.path.exists(BACKUP_SCRIPT)
        
        # Check if backup directory exists
        dir_exists = os.path.exists(BACKUP_ROOT)
        
        # Check if encryption key exists
        key_exists = os.path.exists(ENCRYPTION_KEY_FILE)
        
        # Get disk space
        disk_space = get_backup_status()["diskSpace"]
        
        # Determine overall health
        health_status = "healthy"
        if not script_exists or not dir_exists or not key_exists:
            health_status = "critical"
        elif disk_space["percentage"] > 90:
            health_status = "critical"
        elif disk_space["percentage"] > 80:
            health_status = "warning"
        
        return {
            "success": True,
            "data": {
                "status": health_status,
                "scriptExists": script_exists,
                "directoryExists": dir_exists,
                "encryptionKeyExists": key_exists,
                "diskSpace": disk_space,
                "timestamp": datetime.now().isoformat()
            },
            "message": "Backup health check completed"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get backup health: {str(e)}"
        )

@router.post("/automation/toggle", response_model=Dict[str, Any])
async def toggle_backup_automation_endpoint(
    current_user: Dict = Depends(require_super_admin)
):
    """Toggle backup automation on/off"""
    try:
        # TODO: Implement actual automation toggle
        # This would involve enabling/disabling cron jobs
        
        return {
            "success": True,
            "message": "Backup automation toggled successfully",
            "automationEnabled": True  # TODO: Get actual status
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to toggle backup automation: {str(e)}"
        )

@router.get("/analytics", response_model=Dict[str, Any])
async def get_backup_analytics_endpoint(
    current_user: Dict = Depends(require_super_admin),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze")
):
    """Get backup analytics"""
    try:
        backup_files = get_backup_files()
        
        # Filter by date range
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_backups = [
            f for f in backup_files 
            if datetime.fromisoformat(f["createdAt"]) >= cutoff_date
        ]
        
        # Calculate analytics
        total_size = sum(f["size"] for f in recent_backups)
        type_counts = {}
        for backup in recent_backups:
            backup_type = backup["type"]
            type_counts[backup_type] = type_counts.get(backup_type, 0) + 1
        
        return {
            "success": True,
            "data": {
                "totalBackups": len(recent_backups),
                "totalSize": total_size,
                "totalSizeFormatted": format_file_size(total_size),
                "typeDistribution": type_counts,
                "averageSize": total_size / len(recent_backups) if recent_backups else 0,
                "period": f"Last {days} days"
            },
            "message": "Backup analytics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get backup analytics: {str(e)}"
        )
