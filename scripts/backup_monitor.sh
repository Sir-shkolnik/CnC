#!/bin/bash

# Backup Monitoring Script
# Agile Security: Continuous Monitoring

BACKUP_ROOT="/Users/udishkolnik/C&C/c-and-c-crm/backups"
LOG_FILE="$BACKUP_ROOT/monitor.log"

log_monitor() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [MONITOR] $1" | tee -a "$LOG_FILE"
}

# Check backup health
if ! /Users/udishkolnik/C&C/c-and-c-crm/scripts/automated_backup_system.sh health; then
    log_monitor "ERROR: Backup system health check failed"
    # Send alert (email, Slack, etc.)
    exit 1
fi

# Check disk space
available_gb=$(df "$BACKUP_ROOT" | awk 'NR==2 {print int($4/1024/1024)}')
if [[ $available_gb -lt 10 ]]; then
    log_monitor "WARNING: Low disk space: ${available_gb}GB available"
fi

# Check backup age
latest_backup=$(find "$BACKUP_ROOT" -name "*.enc" -type f -exec stat -f%m {} \; | sort -n | tail -1)
if [[ -n "$latest_backup" ]]; then
    current_time=$(date +%s)
    age_hours=$(( (current_time - latest_backup) / 3600 ))
    
    if [[ $age_hours -gt 48 ]]; then
        log_monitor "WARNING: No recent backup found (${age_hours} hours old)"
    fi
fi

log_monitor "Backup monitoring completed successfully"
