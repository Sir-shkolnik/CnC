#!/bin/bash
# cleanup_backups.sh - Clean up old backups

BACKUP_ROOT="/Users/udishkolnik/Desktop/C-and-C-Backups"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "🧹 C&C CRM Backup Cleanup"
echo "========================="

# Check if backup directory exists
if [ ! -d "$BACKUP_ROOT" ]; then
    echo -e "${RED}❌ Backup directory not found: $BACKUP_ROOT${NC}"
    exit 1
fi

# Get initial sizes
initial_size=$(du -sh "$BACKUP_ROOT" 2>/dev/null | cut -f1 || echo "Unknown")
info "Initial backup directory size: $initial_size"

# Cleanup daily backups (keep for 7 days)
info "Cleaning up daily backups older than 7 days..."
if [ -d "${BACKUP_ROOT}/daily" ]; then
    daily_count_before=$(find "${BACKUP_ROOT}/daily" -type d 2>/dev/null | wc -l)
    find "${BACKUP_ROOT}/daily" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    daily_count_after=$(find "${BACKUP_ROOT}/daily" -type d 2>/dev/null | wc -l)
    daily_removed=$((daily_count_before - daily_count_after))
    if [ $daily_removed -gt 0 ]; then
        log "Removed $daily_removed old daily backup(s)"
    else
        info "No old daily backups to remove"
    fi
else
    warning "Daily backup directory not found"
fi

# Cleanup quick backups (keep for 3 days)
info "Cleaning up quick backups older than 3 days..."
if [ -d "${BACKUP_ROOT}/quick" ]; then
    quick_count_before=$(find "${BACKUP_ROOT}/quick" -type d 2>/dev/null | wc -l)
    find "${BACKUP_ROOT}/quick" -type d -mtime +3 -exec rm -rf {} \; 2>/dev/null || true
    quick_count_after=$(find "${BACKUP_ROOT}/quick" -type d 2>/dev/null | wc -l)
    quick_removed=$((quick_count_before - quick_count_after))
    if [ $quick_removed -gt 0 ]; then
        log "Removed $quick_removed old quick backup(s)"
    else
        info "No old quick backups to remove"
    fi
else
    warning "Quick backup directory not found"
fi

# Cleanup weekly backups (keep for 4 weeks)
info "Cleaning up weekly backups older than 4 weeks..."
if [ -d "${BACKUP_ROOT}/weekly" ]; then
    weekly_count_before=$(find "${BACKUP_ROOT}/weekly" -type d 2>/dev/null | wc -l)
    find "${BACKUP_ROOT}/weekly" -type d -mtime +28 -exec rm -rf {} \; 2>/dev/null || true
    weekly_count_after=$(find "${BACKUP_ROOT}/weekly" -type d 2>/dev/null | wc -l)
    weekly_removed=$((weekly_count_before - weekly_count_after))
    if [ $weekly_removed -gt 0 ]; then
        log "Removed $weekly_removed old weekly backup(s)"
    else
        info "No old weekly backups to remove"
    fi
else
    warning "Weekly backup directory not found"
fi

# Cleanup monthly backups (keep for 12 months)
info "Cleaning up monthly backups older than 12 months..."
if [ -d "${BACKUP_ROOT}/monthly" ]; then
    monthly_count_before=$(find "${BACKUP_ROOT}/monthly" -type d 2>/dev/null | wc -l)
    find "${BACKUP_ROOT}/monthly" -type d -mtime +365 -exec rm -rf {} \; 2>/dev/null || true
    monthly_count_after=$(find "${BACKUP_ROOT}/monthly" -type d 2>/dev/null | wc -l)
    monthly_removed=$((monthly_count_before - monthly_count_after))
    if [ $monthly_removed -gt 0 ]; then
        log "Removed $monthly_removed old monthly backup(s)"
    else
        info "No old monthly backups to remove"
    fi
else
    warning "Monthly backup directory not found"
fi

# Cleanup empty directories
info "Removing empty directories..."
find "$BACKUP_ROOT" -type d -empty -delete 2>/dev/null || true

# Get final sizes
final_size=$(du -sh "$BACKUP_ROOT" 2>/dev/null | cut -f1 || echo "Unknown")
info "Final backup directory size: $final_size"

# Summary
echo ""
echo "📋 Cleanup Summary:"
echo "==================="
echo "• Daily backups removed: $daily_removed"
echo "• Quick backups removed: $quick_removed"
echo "• Weekly backups removed: $weekly_removed"
echo "• Monthly backups removed: $monthly_removed"
echo "• Initial size: $initial_size"
echo "• Final size: $final_size"

total_removed=$((daily_removed + quick_removed + weekly_removed + monthly_removed))

if [ $total_removed -gt 0 ]; then
    log "✅ Cleanup completed successfully! Removed $total_removed backup(s)"
else
    info "✅ Cleanup completed - no old backups to remove"
fi

echo ""
echo "📊 Current Backup Status:"
echo "========================="
echo "• Daily backups: $(find "${BACKUP_ROOT}/daily" -type d 2>/dev/null | wc -l)"
echo "• Quick backups: $(find "${BACKUP_ROOT}/quick" -type d 2>/dev/null | wc -l)"
echo "• Weekly backups: $(find "${BACKUP_ROOT}/weekly" -type d 2>/dev/null | wc -l)"
echo "• Monthly backups: $(find "${BACKUP_ROOT}/monthly" -type d 2>/dev/null | wc -l)"
echo "• Total backups: $(find "$BACKUP_ROOT" -type d 2>/dev/null | wc -l)" 