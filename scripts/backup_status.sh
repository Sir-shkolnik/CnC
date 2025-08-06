#!/bin/bash
# backup_status.sh - Check backup status

BACKUP_ROOT="/Users/udishkolnik/Desktop/C-and-C-Backups"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "📊 C&C CRM Backup Status"
echo "========================"

# Check latest backup
if [ -d "${BACKUP_ROOT}/latest" ]; then
    echo -e "${GREEN}✅ Latest backup exists${NC}"
    echo "Latest backup files:"
    ls -la "${BACKUP_ROOT}/latest" | grep -v "^total"
else
    echo -e "${RED}❌ No latest backup found${NC}"
fi

# Check daily backups
echo ""
echo -e "${BLUE}📅 Daily Backups:${NC}"
if [ -d "${BACKUP_ROOT}/daily" ]; then
    daily_count=$(ls -1 "${BACKUP_ROOT}/daily" 2>/dev/null | wc -l)
    if [ $daily_count -gt 0 ]; then
        echo "Found $daily_count daily backup(s):"
        ls -la "${BACKUP_ROOT}/daily" | grep "^d" | tail -5 | awk '{print $9}' | sort -r
    else
        echo "No daily backups found"
    fi
else
    echo -e "${YELLOW}⚠️  Daily backup directory not found${NC}"
fi

# Check quick backups
echo ""
echo -e "${BLUE}⚡ Quick Backups:${NC}"
if [ -d "${BACKUP_ROOT}/quick" ]; then
    quick_count=$(ls -1 "${BACKUP_ROOT}/quick" 2>/dev/null | wc -l)
    if [ $quick_count -gt 0 ]; then
        echo "Found $quick_count quick backup(s):"
        ls -la "${BACKUP_ROOT}/quick" | grep "^d" | tail -3 | awk '{print $9}' | sort -r
    else
        echo "No quick backups found"
    fi
else
    echo -e "${YELLOW}⚠️  Quick backup directory not found${NC}"
fi

# Check weekly backups
echo ""
echo -e "${BLUE}📅 Weekly Backups:${NC}"
if [ -d "${BACKUP_ROOT}/weekly" ]; then
    weekly_count=$(ls -1 "${BACKUP_ROOT}/weekly" 2>/dev/null | wc -l)
    if [ $weekly_count -gt 0 ]; then
        echo "Found $weekly_count weekly backup(s):"
        ls -la "${BACKUP_ROOT}/weekly" | grep "^d" | tail -3 | awk '{print $9}' | sort -r
    else
        echo "No weekly backups found"
    fi
else
    echo -e "${YELLOW}⚠️  Weekly backup directory not found${NC}"
fi

# Check monthly backups
echo ""
echo -e "${BLUE}📅 Monthly Backups:${NC}"
if [ -d "${BACKUP_ROOT}/monthly" ]; then
    monthly_count=$(ls -1 "${BACKUP_ROOT}/monthly" 2>/dev/null | wc -l)
    if [ $monthly_count -gt 0 ]; then
        echo "Found $monthly_count monthly backup(s):"
        ls -la "${BACKUP_ROOT}/monthly" | grep "^d" | tail -3 | awk '{print $9}' | sort -r
    else
        echo "No monthly backups found"
    fi
else
    echo -e "${YELLOW}⚠️  Monthly backup directory not found${NC}"
fi

# Check backup sizes
echo ""
echo -e "${BLUE}💾 Backup Sizes:${NC}"
if [ -d "${BACKUP_ROOT}/daily" ] && [ "$(ls -A "${BACKUP_ROOT}/daily" 2>/dev/null)" ]; then
    echo "Daily backup sizes:"
    du -sh "${BACKUP_ROOT}/daily"/* 2>/dev/null | head -5
fi

if [ -d "${BACKUP_ROOT}/quick" ] && [ "$(ls -A "${BACKUP_ROOT}/quick" 2>/dev/null)" ]; then
    echo "Quick backup sizes:"
    du -sh "${BACKUP_ROOT}/quick"/* 2>/dev/null | head -3
fi

# Check total backup size
echo ""
echo -e "${BLUE}💿 Total Backup Size:${NC}"
if [ -d "$BACKUP_ROOT" ]; then
    total_size=$(du -sh "$BACKUP_ROOT" 2>/dev/null | cut -f1)
    echo "Total backup directory size: $total_size"
else
    echo -e "${RED}❌ Backup directory not found${NC}"
fi

# Check disk space
echo ""
echo -e "${BLUE}💿 Disk Space:${NC}"
if [ -d "$BACKUP_ROOT" ]; then
    df -h "$BACKUP_ROOT" | tail -1
else
    df -h | grep -E "(Filesystem|/dev/)" | head -1
fi

# Check last backup time
echo ""
echo -e "${BLUE}🕐 Last Backup Time:${NC}"
if [ -d "${BACKUP_ROOT}/latest" ]; then
    latest_file=$(find "${BACKUP_ROOT}/latest" -type f -name "*.tar.gz" -o -name "*.sql.gz" 2>/dev/null | head -1)
    if [ -n "$latest_file" ]; then
        last_backup=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$latest_file" 2>/dev/null || stat -c "%y" "$latest_file" 2>/dev/null)
        echo "Last backup: $last_backup"
    else
        echo "No backup files found in latest directory"
    fi
else
    echo "No latest backup directory found"
fi

# Check backup health
echo ""
echo -e "${BLUE}🔍 Backup Health Check:${NC}"
if [ -d "${BACKUP_ROOT}/latest" ]; then
    health_errors=0
    
    # Check for essential backup files
    if [ ! -f "${BACKUP_ROOT}/latest/code.tar.gz" ]; then
        echo -e "${RED}❌ Code backup missing${NC}"
        ((health_errors++))
    else
        echo -e "${GREEN}✅ Code backup exists${NC}"
    fi
    
    if [ ! -f "${BACKUP_ROOT}/latest/database.sql.gz" ]; then
        echo -e "${YELLOW}⚠️  Database backup missing${NC}"
    else
        echo -e "${GREEN}✅ Database backup exists${NC}"
    fi
    
    if [ ! -f "${BACKUP_ROOT}/latest/containers.tar.gz" ]; then
        echo -e "${YELLOW}⚠️  Container backup missing${NC}"
    else
        echo -e "${GREEN}✅ Container backup exists${NC}"
    fi
    
    if [ ! -f "${BACKUP_ROOT}/latest/config.tar.gz" ]; then
        echo -e "${YELLOW}⚠️  Config backup missing${NC}"
    else
        echo -e "${GREEN}✅ Config backup exists${NC}"
    fi
    
    if [ $health_errors -eq 0 ]; then
        echo -e "${GREEN}🎉 Backup health: GOOD${NC}"
    else
        echo -e "${YELLOW}⚠️  Backup health: ISSUES DETECTED${NC}"
    fi
else
    echo -e "${RED}❌ No backup health check possible - no latest backup${NC}"
fi

echo ""
echo "📋 Backup Summary:"
echo "=================="
echo "• Backup Root: $BACKUP_ROOT"
echo "• Daily Backups: $(ls -1 "${BACKUP_ROOT}/daily" 2>/dev/null | wc -l)"
echo "• Quick Backups: $(ls -1 "${BACKUP_ROOT}/quick" 2>/dev/null | wc -l)"
echo "• Weekly Backups: $(ls -1 "${BACKUP_ROOT}/weekly" 2>/dev/null | wc -l)"
echo "• Monthly Backups: $(ls -1 "${BACKUP_ROOT}/monthly" 2>/dev/null | wc -l)"
echo "• Total Size: $(du -sh "$BACKUP_ROOT" 2>/dev/null | cut -f1 || echo "Unknown")" 