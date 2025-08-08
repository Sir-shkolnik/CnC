#!/bin/bash

# Security Compliance Script
# CISSP Compliance: Continuous Security Monitoring

BACKUP_ROOT="/Users/udishkolnik/C&C/c-and-c-crm/backups"
SECURITY_LOG="$BACKUP_ROOT/security.log"

log_security() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SECURITY] $1" | tee -a "$SECURITY_LOG"
}

# Check encryption key
if [[ ! -f "$BACKUP_ROOT/.backup_key" ]]; then
    log_security "CRITICAL: Encryption key missing"
    exit 1
fi

# Check key permissions
key_perms=$(stat -f%Lp "$BACKUP_ROOT/.backup_key")
if [[ "$key_perms" != "600" ]]; then
    log_security "WARNING: Encryption key has insecure permissions: $key_perms"
fi

# Check backup directory permissions
backup_perms=$(stat -f%Lp "$BACKUP_ROOT")
if [[ "$backup_perms" != "755" ]]; then
    log_security "WARNING: Backup directory has insecure permissions: $backup_perms"
fi

# Check for unauthorized access
unauthorized_files=$(find "$BACKUP_ROOT" -name "*.enc" -exec ls -la {} \; | grep -v "$(whoami)")
if [[ -n "$unauthorized_files" ]]; then
    log_security "WARNING: Unauthorized access detected to backup files"
fi

log_security "Security compliance check completed"
