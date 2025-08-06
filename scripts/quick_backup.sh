#!/bin/bash
# quick_backup.sh - Quick backup for development

set -e

BACKUP_ROOT="/Users/udishkolnik/Desktop/C-and-C-Backups"
PROJECT_ROOT="/Users/udishkolnik/C&C/c-and-c-crm"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="${BACKUP_ROOT}/quick/${TIMESTAMP}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

mkdir -p "$BACKUP_DIR"

echo "🔄 Quick backup started..."

# Backup code changes
log "Backing up code changes..."
cd "$PROJECT_ROOT"
git diff > "${BACKUP_DIR}/code_changes.patch" 2>/dev/null || warning "No git changes to backup"
git status > "${BACKUP_DIR}/git_status.txt" 2>/dev/null || warning "Git status unavailable"

# Backup database
log "Backing up database..."
if command -v pg_dump &> /dev/null; then
    if pg_dump -h localhost -U c_and_c_user -d c_and_c_crm > "${BACKUP_DIR}/database.sql" 2>/dev/null; then
        gzip "${BACKUP_DIR}/database.sql"
        log "Database backup completed"
    else
        warning "Database backup failed (database may not be running)"
    fi
else
    warning "PostgreSQL client tools not available"
fi

# Backup docker state
log "Backing up Docker state..."
if command -v docker &> /dev/null; then
    docker ps > "${BACKUP_DIR}/docker_ps.txt" 2>/dev/null || warning "Docker not running"
    docker images > "${BACKUP_DIR}/docker_images.txt" 2>/dev/null || warning "Docker not running"
else
    warning "Docker not available"
fi

# Backup important files
log "Backing up important files..."
cp "${PROJECT_ROOT}/package.json" "${BACKUP_DIR}/" 2>/dev/null || warning "package.json not found"
cp "${PROJECT_ROOT}/requirements.txt" "${BACKUP_DIR}/" 2>/dev/null || warning "requirements.txt not found"
cp "${PROJECT_ROOT}/docker-compose.yml" "${BACKUP_DIR}/" 2>/dev/null || warning "docker-compose.yml not found"

# Create backup info
cat > "${BACKUP_DIR}/backup_info.txt" << EOF
Quick Backup Info
=================
Backup Date: $(date)
Backup Type: Quick Development Backup
Project Root: ${PROJECT_ROOT}

Components Backed Up:
- Code Changes: $(ls -la "${BACKUP_DIR}/code_changes.patch" 2>/dev/null | wc -l || echo "0") files
- Database: $(ls -la "${BACKUP_DIR}/database.sql.gz" 2>/dev/null | wc -l || echo "0") files
- Docker State: $(ls -la "${BACKUP_DIR}/docker_ps.txt" 2>/dev/null | wc -l || echo "0") files
- Config Files: $(ls -la "${BACKUP_DIR}/"*.json "${BACKUP_DIR}/"*.yml "${BACKUP_DIR}/"*.txt 2>/dev/null | wc -l || echo "0") files

Backup Size: $(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1 || echo "Unknown")
EOF

echo "✅ Quick backup completed: $BACKUP_DIR"
echo "📁 Backup location: $BACKUP_DIR"
echo "📊 Backup size: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "Unknown")" 