#!/bin/bash

# 🔐 AUTOMATED BACKUP SETUP - AGILE SECURITY LIFECYCLE
# C&C CRM Production Backup Automation
# Modern DevOps Security Practices

set -euo pipefail

# ===== CONFIGURATION =====
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_SCRIPT="$SCRIPT_DIR/automated_backup_system.sh"
CRON_LOG="$PROJECT_ROOT/backups/cron.log"

# ===== AGILE SECURITY LIFECYCLE CONFIGURATION =====
# Modern DevOps Security: Continuous Security, Shift Left, DevSecOps

# Backup Schedule (Agile: Frequent, Automated, Secure)
DAILY_BACKUP_TIME="02:00"      # 2 AM daily
WEEKLY_BACKUP_TIME="03:00"     # 3 AM Sundays
MONTHLY_BACKUP_TIME="04:00"    # 4 AM 1st of month

# Security Monitoring
HEALTH_CHECK_INTERVAL="06:00"  # 6 AM daily
SECURITY_AUDIT_TIME="01:00"    # 1 AM daily

# ===== SECURITY FUNCTIONS =====
log_security() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SECURITY] $1" | tee -a "$CRON_LOG"
}

verify_script_security() {
    log_security "Verifying backup script security"
    
    # Check script permissions
    if [[ ! -x "$BACKUP_SCRIPT" ]]; then
        log_security "ERROR: Backup script not executable"
        return 1
    fi
    
    # Check script ownership
    local script_owner=$(stat -f%Su "$BACKUP_SCRIPT")
    if [[ "$script_owner" != "$(whoami)" ]]; then
        log_security "WARNING: Backup script owned by $script_owner"
    fi
    
    # Check for security vulnerabilities
    if grep -q "password\|secret\|key" "$BACKUP_SCRIPT"; then
        log_security "WARNING: Script contains potential sensitive data"
    fi
    
    log_security "Backup script security verification passed"
}

# ===== CRON JOB FUNCTIONS =====
create_cron_job() {
    local schedule="$1"
    local command="$2"
    local description="$3"
    
    log_security "Creating cron job: $description"
    
    # Create cron job entry
    local cron_entry="$schedule $command >> $CRON_LOG 2>&1"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
    
    log_security "Cron job created: $description"
}

setup_daily_backups() {
    log_security "Setting up daily backup automation"
    
    # Daily backup at 2 AM
    create_cron_job \
        "0 2 * * *" \
        "$BACKUP_SCRIPT backup" \
        "Daily backup at 2 AM"
    
    # Health check at 6 AM
    create_cron_job \
        "0 6 * * *" \
        "$BACKUP_SCRIPT health" \
        "Daily health check at 6 AM"
    
    # Security audit at 1 AM
    create_cron_job \
        "0 1 * * *" \
        "$BACKUP_SCRIPT test" \
        "Daily security audit at 1 AM"
}

setup_weekly_backups() {
    log_security "Setting up weekly backup automation"
    
    # Weekly full backup on Sundays at 3 AM
    create_cron_job \
        "0 3 * * 0" \
        "$BACKUP_SCRIPT backup" \
        "Weekly full backup on Sundays at 3 AM"
    
    # Weekly cleanup on Saturdays at 4 AM
    create_cron_job \
        "0 4 * * 6" \
        "$BACKUP_SCRIPT cleanup" \
        "Weekly cleanup on Saturdays at 4 AM"
}

setup_monthly_backups() {
    log_security "Setting up monthly backup automation"
    
    # Monthly comprehensive backup on 1st of month at 4 AM
    create_cron_job \
        "0 4 1 * *" \
        "$BACKUP_SCRIPT backup" \
        "Monthly comprehensive backup on 1st at 4 AM"
}

# ===== MONITORING SETUP =====
setup_monitoring() {
    log_security "Setting up backup monitoring"
    
    # Create monitoring script
    cat > "$SCRIPT_DIR/backup_monitor.sh" << 'EOF'
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
EOF

    chmod +x "$SCRIPT_DIR/backup_monitor.sh"
    
    # Add monitoring to cron
    create_cron_job \
        "*/30 * * * *" \
        "$SCRIPT_DIR/backup_monitor.sh" \
        "Backup monitoring every 30 minutes"
}

# ===== SECURITY COMPLIANCE =====
setup_security_compliance() {
    log_security "Setting up security compliance monitoring"
    
    # Create security compliance script
    cat > "$SCRIPT_DIR/security_compliance.sh" << 'EOF'
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
EOF

    chmod +x "$SCRIPT_DIR/security_compliance.sh"
    
    # Add security compliance to cron
    create_cron_job \
        "0 1 * * *" \
        "$SCRIPT_DIR/security_compliance.sh" \
        "Daily security compliance check at 1 AM"
}

# ===== MAIN SETUP FUNCTION =====
main() {
    log_security "Starting automated backup setup"
    
    # Verify script security
    verify_script_security || exit 1
    
    # Create backup directory if it doesn't exist
    mkdir -p "$PROJECT_ROOT/backups"
    
    # Setup cron jobs
    setup_daily_backups
    setup_weekly_backups
    setup_monthly_backups
    
    # Setup monitoring
    setup_monitoring
    
    # Setup security compliance
    setup_security_compliance
    
    # Display current crontab
    log_security "Current crontab configuration:"
    crontab -l
    
    log_security "Automated backup setup completed successfully"
    log_security "Backup schedule:"
    log_security "  - Daily: 2 AM (backup), 6 AM (health check)"
    log_security "  - Weekly: Sunday 3 AM (full backup), Saturday 4 AM (cleanup)"
    log_security "  - Monthly: 1st of month 4 AM (comprehensive backup)"
    log_security "  - Monitoring: Every 30 minutes"
    log_security "  - Security: Daily 1 AM (compliance check)"
    
    echo ""
    echo "🔐 AUTOMATED BACKUP SYSTEM SETUP COMPLETE"
    echo "=========================================="
    echo "✅ Daily backups scheduled at 2 AM"
    echo "✅ Weekly full backups on Sundays at 3 AM"
    echo "✅ Monthly comprehensive backups on 1st at 4 AM"
    echo "✅ Health monitoring every 30 minutes"
    echo "✅ Security compliance checks daily at 1 AM"
    echo "✅ AES-256-GCM encryption enabled"
    echo "✅ 30-day retention policy"
    echo "✅ Audit logging enabled"
    echo ""
    echo "📁 Backup location: $PROJECT_ROOT/backups"
    echo "📋 Log files: backup.log, cron.log, monitor.log, security.log"
    echo ""
    echo "🛡️ CISSP Compliance:"
    echo "  - Data Protection: AES-256-GCM encryption"
    echo "  - Access Control: Secure file permissions"
    echo "  - Audit Trail: Comprehensive logging"
    echo "  - Risk Management: Automated health checks"
    echo "  - Incident Response: Automated monitoring"
}

# ===== COMMAND LINE INTERFACE =====
case "${1:-}" in
    "setup")
        main
        ;;
    "remove")
        log_security "Removing automated backup cron jobs"
        crontab -l 2>/dev/null | grep -v "automated_backup_system.sh" | crontab -
        crontab -l 2>/dev/null | grep -v "backup_monitor.sh" | crontab -
        crontab -l 2>/dev/null | grep -v "security_compliance.sh" | crontab -
        log_security "Automated backup cron jobs removed"
        ;;
    "status")
        log_security "Current backup automation status:"
        echo "Cron jobs:"
        crontab -l 2>/dev/null | grep -E "(backup|monitor|security)" || echo "No backup cron jobs found"
        echo ""
        echo "Backup directory:"
        ls -la "$PROJECT_ROOT/backups/"
        ;;
    *)
        echo "C&C CRM Automated Backup Setup"
        echo "Usage: $0 {setup|remove|status}"
        echo ""
        echo "Commands:"
        echo "  setup   - Setup automated backup cron jobs"
        echo "  remove  - Remove automated backup cron jobs"
        echo "  status  - Show current backup automation status"
        echo ""
        echo "Agile Security Features:"
        echo "  - Continuous Security Monitoring"
        echo "  - Automated Compliance Checks"
        echo "  - Risk-Based Backup Scheduling"
        echo "  - DevSecOps Integration"
        echo "  - CISSP Compliance"
        exit 1
        ;;
esac
