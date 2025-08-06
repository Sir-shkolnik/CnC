# C&C CRM Backup System

This directory contains the backup and recovery scripts for the C&C CRM project.

## 🚀 Quick Start

### Run a Quick Backup (Development)
```bash
./scripts/quick_backup.sh
```
Creates a fast backup of code changes, database, and important files.

### Run a Complete Backup
```bash
./scripts/backup_system.sh
```
Creates a comprehensive backup of code, containers, database, and configuration.

### Check Backup Status
```bash
./scripts/backup_status.sh
```
Shows the status of all backups and disk space.

### Clean Up Old Backups
```bash
./scripts/cleanup_backups.sh
```
Removes old backups based on retention policy.

## 📁 Backup Structure

```
/Users/udishkolnik/C&C/backups/
├── daily/          # Daily backups (kept for 7 days)
├── weekly/         # Weekly backups (kept for 4 weeks)
├── monthly/        # Monthly backups (kept for 12 months)
├── quick/          # Quick development backups (kept for 3 days)
└── latest/         # Latest backup files (always available)
```

## 🔧 Backup Components

### Code Backup
- Source code (Git archive)
- Apps directory
- Prisma schema
- Project documentation

### Container Backup
- Docker images
- Running containers
- Docker Compose files
- Dockerfiles

### Database Backup
- Full PostgreSQL dump
- Schema-only backup
- Data-only backup (excludes super admin tables)

### Configuration Backup
- Environment files
- Package files
- Configuration files

## 📊 Retention Policy

| Backup Type | Retention Period | Location |
|-------------|------------------|----------|
| **Daily** | 7 days | `/backups/daily/` |
| **Weekly** | 4 weeks | `/backups/weekly/` |
| **Monthly** | 12 months | `/backups/monthly/` |
| **Quick** | 3 days | `/backups/quick/` |
| **Latest** | Always | `/backups/latest/` |

## 🛠️ Prerequisites

- **Docker**: For container backups
- **PostgreSQL**: For database backups
- **Git**: For code backups
- **Bash**: For script execution

## 🔒 Security Notes

- Database backups exclude super admin tables for security
- All backups are local only (no network transmission)
- Backup directory has restricted permissions
- Consider encryption for production use

## 📋 Usage Examples

### Development Workflow
```bash
# Before making changes
./scripts/quick_backup.sh

# Make your changes...

# After making changes
./scripts/quick_backup.sh
```

### Production Backup
```bash
# Daily automated backup
./scripts/backup_system.sh

# Check backup health
./scripts/backup_status.sh

# Clean up old backups
./scripts/cleanup_backups.sh
```

### Automated Backups (macOS)
```bash
# Add to crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /Users/udishkolnik/C\&C/c-and-c-crm/scripts/backup_system.sh >> /Users/udishkolnik/C\&C/backups/backup.log 2>&1
```

## 🚨 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql
```

### Docker Not Running
```bash
# Start Docker Desktop
open -a Docker
```

### Permission Issues
```bash
# Fix permissions
chmod +x scripts/*.sh
chmod 700 /Users/udishkolnik/C\&C/backups
```

## 📈 Monitoring

The backup system provides:
- **Backup verification** with integrity checks
- **Size monitoring** and disk space alerts
- **Health checks** for backup files
- **Detailed logging** for troubleshooting

## 📞 Support

For backup system issues:
1. Check the backup logs in `/Users/udishkolnik/C&C/backups/`
2. Run `./scripts/backup_status.sh` for diagnostics
3. Review the main documentation in `Project_docs/17_backup_system.md` 