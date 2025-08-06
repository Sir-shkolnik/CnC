# 🔧 C&C CRM Troubleshooting Guide

**Version:** 2.6.0  
**Last Updated:** January 2025  
**Status:** Active

---

## 🚨 **Critical Issues & Solutions**

### **Issue 1: "No module named uvicorn" Error**

**Error Message:**
```
/opt/render/project/src/.venv/bin/python: No module named uvicorn
```

**Root Cause:** Uvicorn not properly installed in the virtual environment

**Solution Applied:**
```yaml
# In render.yaml - API Service
buildCommand: |
  python -m pip install --upgrade pip
  pip install -r requirements.txt
  pip install uvicorn[standard]==0.24.0  # Explicit installation
  pip install prisma
  prisma generate

startCommand: |
  source .venv/bin/activate
  uvicorn apps.api.main:app --host 0.0.0.0 --port $PORT
```

**Verification:**
```bash
# Check if API is responding
curl -I https://c-and-c-crm-api.onrender.com/health
```

---

## 🔍 **Common Deployment Issues**

### **Issue 2: Frontend Build Failures**

**Error Types:**
- TypeScript compilation errors
- Missing dependencies
- Module resolution issues

**Solutions:**
1. **Check package.json dependencies**
2. **Verify TypeScript configuration**
3. **Ensure all imports are correct**

**Fixed Commands:**
```yaml
# Frontend services - corrected start commands
startCommand: |
  cd apps/frontend
  next start -p $PORT  # Instead of npm start
```

### **Issue 3: Database Connection Problems**

**Error Types:**
- Connection timeout
- Authentication failures
- Schema mismatches

**Solutions:**
1. **Verify DATABASE_URL format**
2. **Check database credentials**
3. **Run Prisma migrations**

**Debug Commands:**
```bash
# Test database connection
curl https://c-and-c-crm-api.onrender.com/health/database

# Check database logs
docker logs trujourney-postgres
```

### **Issue 4: CORS Errors**

**Error Types:**
- Cross-origin request blocked
- Missing CORS headers

**Solution:**
```yaml
# Ensure CORS_ORIGINS includes all frontend URLs
CORS_ORIGINS=https://c-and-c-crm-frontend.onrender.com,https://c-and-c-crm-mobile.onrender.com,https://c-and-c-crm-storage.onrender.com
```

---

## 📊 **Health Check Commands**

### **API Health Checks**
```bash
# Basic health check
curl -I https://c-and-c-crm-api.onrender.com/health

# Database health check
curl https://c-and-c-crm-api.onrender.com/health/database

# Full API response
curl https://c-and-c-crm-api.onrender.com/health
```

### **Frontend Health Checks**
```bash
# Main frontend
curl -I https://c-and-c-crm-frontend.onrender.com

# Mobile portal
curl -I https://c-and-c-crm-mobile.onrender.com

# Storage system
curl -I https://c-and-c-crm-storage.onrender.com
```

### **Local Development Checks**
```bash
# Check local services
lsof -i :8000  # API port
lsof -i :3000  # Frontend port
lsof -i :5433  # PostgreSQL port
lsof -i :6379  # Redis port

# Docker containers
docker ps
docker logs <container-name>
```

---

## 🐳 **Docker Troubleshooting**

### **Container Status**
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Container logs
docker logs trujourney-postgres
docker logs trujourney-redis
```

### **Common Docker Issues**

#### **PostgreSQL Container Issues**
```bash
# Check PostgreSQL logs
docker logs trujourney-postgres

# Common errors:
# - Port conflicts (5433 vs 5432)
# - Permission issues
# - Data directory problems
```

#### **Redis Container Issues**
```bash
# Check Redis logs
docker logs trujourney-redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

---

## 🔧 **Render.com Specific Issues**

### **Build Failures**
1. **Check build logs in Render Dashboard**
2. **Verify requirements.txt and package.json**
3. **Ensure all dependencies are listed**

### **Service Not Starting**
1. **Check start commands**
2. **Verify environment variables**
3. **Check port configuration**

### **Database Connection Issues**
1. **Verify DATABASE_URL format**
2. **Check database service status**
3. **Run migrations if needed**

---

## 📝 **Debugging Checklist**

### **Pre-Deployment**
- [ ] All dependencies in requirements.txt
- [ ] All dependencies in package.json
- [ ] TypeScript compilation passes locally
- [ ] Environment variables documented
- [ ] Build commands tested locally

### **During Deployment**
- [ ] Build logs show no errors
- [ ] All services start successfully
- [ ] Health checks pass
- [ ] Database migrations run
- [ ] CORS configured correctly

### **Post-Deployment**
- [ ] All URLs accessible
- [ ] API endpoints responding
- [ ] Frontend-backend communication working
- [ ] Database connections stable
- [ ] Performance acceptable

---

## 🚀 **Quick Fix Commands**

### **For Uvicorn Issues**
```bash
# Add to render.yaml buildCommand
pip install uvicorn[standard]==0.24.0

# Update startCommand
source .venv/bin/activate
uvicorn apps.api.main:app --host 0.0.0.0 --port $PORT
```

### **For Frontend Issues**
```bash
# Update startCommand in render.yaml
cd apps/frontend
next start -p $PORT
```

### **For Database Issues**
```bash
# Check connection string format
DATABASE_URL=postgresql://user:password@host:port/database

# Run migrations
prisma migrate deploy
```

---

## 📞 **Support Resources**

### **Render.com Documentation**
- [Troubleshooting Deploys](https://render.com/docs/troubleshooting-deploys)
- [Web Services](https://render.com/docs/web-services)
- [Databases](https://render.com/docs/databases)

### **Project Documentation**
- [Deployment Guide](./20_render_deployment_guide.md)
- [API Documentation](https://c-and-c-crm-api.onrender.com/docs)
- [GitHub Issues](https://github.com/Sir-shkolnik/CnC/issues)

---

## 🎯 **Current Status**

### **✅ Resolved Issues**
1. **Uvicorn Installation** - Fixed with explicit installation in buildCommand
2. **Frontend Start Commands** - Updated to use `next start -p $PORT`
3. **Documentation** - Comprehensive deployment guide created

### **⚠️ Monitoring**
1. **API Service** - Watch for successful deployment after uvicorn fix
2. **Database Connections** - Monitor for connection stability
3. **Frontend Services** - Verify all portals working correctly

---

**Last Updated:** January 2025  
**Next Review:** After API service deployment  
**Version:** 2.6.0 