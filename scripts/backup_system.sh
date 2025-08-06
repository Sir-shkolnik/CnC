#!/bin/bash
# backup_system.sh - C&C CRM Complete Backup System

set -e  # Exit on any error

# Configuration
BACKUP_ROOT="/Users/udishkolnik/Desktop/C-and-C-Backups"
PROJECT_ROOT="/Users/udishkolnik/C&C/c-and-c-crm"
DB_NAME="c_and_c_crm"
DB_USER="c_and_c_user"
DB_HOST="localhost"
DB_PORT="5432"

# Timestamp for this backup
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="${BACKUP_ROOT}/daily/${TIMESTAMP}"
LATEST_DIR="${BACKUP_ROOT}/latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Create backup directories
create_directories() {
    log "Creating backup directories..."
    mkdir -p "${BACKUP_DIR}"/{code,containers,database,config}
    mkdir -p "${LATEST_DIR}"
}

# Backup source code
backup_code() {
    log "Backing up source code..."
    
    cd "${PROJECT_ROOT}"
    
    # Create git archive
    git archive --format=tar.gz --output="${BACKUP_DIR}/code/source_code.tar.gz" HEAD
    
    # Backup specific directories
    tar -czf "${BACKUP_DIR}/code/apps.tar.gz" apps/ 2>/dev/null || warning "Apps directory not found"
    tar -czf "${BACKUP_DIR}/code/prisma.tar.gz" prisma/ 2>/dev/null || warning "Prisma directory not found"
    if [ -d "Project_docs" ]; then
        tar -czf "${BACKUP_DIR}/code/project_docs.tar.gz" Project_docs/
    else
        warning "Project_docs directory not found"
    fi
    
    # Copy to latest
    cp "${BACKUP_DIR}/code/source_code.tar.gz" "${LATEST_DIR}/code.tar.gz"
    
    log "Code backup completed"
}

# Backup Docker containers and images
backup_containers() {
    log "Backing up Docker containers and images..."
    
    # Get list of running containers
    CONTAINERS=$(docker ps --format "{{.Names}}" 2>/dev/null || echo "")
    
    # Save container images
    docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>" | while read image; do
        if [ ! -z "$image" ]; then
            filename=$(echo "$image" | tr '/' '_' | tr ':' '_')
            docker save "$image" | gzip > "${BACKUP_DIR}/containers/${filename}.tar.gz"
        fi
    done
    
    # Export running containers
    for container in $CONTAINERS; do
        if [ ! -z "$container" ]; then
            docker export "$container" | gzip > "${BACKUP_DIR}/containers/${container}.tar.gz"
        fi
    done
    
    # Backup docker-compose files
    find "${PROJECT_ROOT}" -name "docker-compose*.yml" -exec cp {} "${BACKUP_DIR}/containers/" \; 2>/dev/null || true
    find "${PROJECT_ROOT}" -name "Dockerfile*" -exec cp {} "${BACKUP_DIR}/containers/" \; 2>/dev/null || true
    
    # Create containers archive
    tar -czf "${LATEST_DIR}/containers.tar.gz" -C "${BACKUP_DIR}" containers/
    
    log "Container backup completed"
}

# Backup PostgreSQL database
backup_database() {
    log "Backing up PostgreSQL database..."
    
    # Check if database is accessible
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        warning "Database not accessible, skipping database backup"
        return 0
    fi
    
    # Full database dump
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --no-owner --no-privileges \
        | gzip > "${BACKUP_DIR}/database/full_dump.sql.gz"
    
    # Schema only backup
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --schema-only --verbose --clean --no-owner --no-privileges \
        | gzip > "${BACKUP_DIR}/database/schema_only.sql.gz"
    
    # Data only backup (exclude super admin tables for security)
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --data-only --verbose --exclude-table=super_admin_users \
        --exclude-table=super_admin_sessions --exclude-table=company_access_logs \
        | gzip > "${BACKUP_DIR}/database/data_only.sql.gz"
    
    # Copy to latest
    cp "${BACKUP_DIR}/database/full_dump.sql.gz" "${LATEST_DIR}/database.sql.gz"
    
    log "Database backup completed"
}

# Backup configuration files
backup_config() {
    log "Backing up configuration files..."
    
    # Environment files
    find "${PROJECT_ROOT}" -name ".env*" -exec cp {} "${BACKUP_DIR}/config/" \; 2>/dev/null || true
    find "${PROJECT_ROOT}" -name "env.example" -exec cp {} "${BACKUP_DIR}/config/" \; 2>/dev/null || true
    
    # Configuration files
    find "${PROJECT_ROOT}" -name "*.config.*" -exec cp {} "${BACKUP_DIR}/config/" \; 2>/dev/null || true
    find "${PROJECT_ROOT}" -name "*.conf" -exec cp {} "${BACKUP_DIR}/config/" \; 2>/dev/null || true
    
    # Package files
    cp "${PROJECT_ROOT}/package.json" "${BACKUP_DIR}/config/" 2>/dev/null || true
    cp "${PROJECT_ROOT}/requirements.txt" "${BACKUP_DIR}/config/" 2>/dev/null || true
    cp "${PROJECT_ROOT}/docker-compose.yml" "${BACKUP_DIR}/config/" 2>/dev/null || true
    
    # Create config archive
    tar -czf "${LATEST_DIR}/config.tar.gz" -C "${BACKUP_DIR}" config/
    
    log "Configuration backup completed"
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    cat > "${BACKUP_DIR}/manifest.txt" << EOF
C&C CRM Backup Manifest
=======================
Backup Date: $(date)
Backup ID: ${TIMESTAMP}
Project Root: ${PROJECT_ROOT}

Components Backed Up:
- Source Code: $(ls -la "${BACKUP_DIR}/code/" 2>/dev/null | wc -l || echo "0") files
- Containers: $(ls -la "${BACKUP_DIR}/containers/" 2>/dev/null | wc -l || echo "0") files
- Database: $(ls -la "${BACKUP_DIR}/database/" 2>/dev/null | wc -l || echo "0") files
- Configuration: $(ls -la "${BACKUP_DIR}/config/" 2>/dev/null | wc -l || echo "0") files

Backup Size: $(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1 || echo "Unknown")

Git Status:
$(cd "${PROJECT_ROOT}" && git status --porcelain 2>/dev/null || echo "Git status unavailable")

Docker Status:
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker status unavailable")

Database Status:
$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>/dev/null || echo "Database not accessible")

EOF
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    # Check if all backup files exist
    local errors=0
    
    if [ ! -f "${BACKUP_DIR}/code/source_code.tar.gz" ]; then
        error "Source code backup missing"
        ((errors++))
    fi
    
    if [ ! -f "${BACKUP_DIR}/database/full_dump.sql.gz" ]; then
        warning "Database backup missing (database may not be running)"
    fi
    
    if [ ! -d "${BACKUP_DIR}/containers" ] || [ -z "$(ls -A "${BACKUP_DIR}/containers" 2>/dev/null)" ]; then
        warning "No container backups found"
    fi
    
    if [ ! -d "${BACKUP_DIR}/config" ] || [ -z "$(ls -A "${BACKUP_DIR}/config" 2>/dev/null)" ]; then
        warning "No configuration backups found"
    fi
    
    if [ $errors -eq 0 ]; then
        log "Backup verification completed successfully"
        return 0
    else
        error "Backup verification failed with $errors errors"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Keep daily backups for 7 days
    find "${BACKUP_ROOT}/daily" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    
    # Keep weekly backups for 4 weeks
    find "${BACKUP_ROOT}/weekly" -type d -mtime +28 -exec rm -rf {} \; 2>/dev/null || true
    
    # Keep monthly backups for 12 months
    find "${BACKUP_ROOT}/monthly" -type d -mtime +365 -exec rm -rf {} \; 2>/dev/null || true
    
    log "Cleanup completed"
}

# Main backup function
main() {
    log "Starting C&C CRM backup system..."
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        warning "Docker is not installed or not in PATH"
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        warning "PostgreSQL client tools are not installed"
    fi
    
    # Create directories
    create_directories
    
    # Perform backups
    backup_code
    backup_containers
    backup_database
    backup_config
    
    # Create manifest
    create_manifest
    
    # Verify backup
    if verify_backup; then
        log "Backup completed successfully!"
        log "Backup location: ${BACKUP_DIR}"
        log "Latest backup: ${LATEST_DIR}"
    else
        error "Backup verification failed!"
        exit 1
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    log "Backup system completed"
}

# Run main function
main "$@" 