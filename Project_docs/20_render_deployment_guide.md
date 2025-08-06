# 🚀 C&C CRM Render.com Deployment Guide

**Version:** 2.6.0  
**Last Updated:** January 2025  
**Status:** Production Ready

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [SSH Key Setup](#ssh-key-setup)
4. [GitHub Repository Setup](#github-repository-setup)
5. [Render.com Configuration](#rendercom-configuration)
6. [Environment Variables](#environment-variables)
7. [Deployment Process](#deployment-process)
8. [Service Architecture](#service-architecture)
9. [Monitoring & Logs](#monitoring--logs)
10. [Troubleshooting](#troubleshooting)
11. [Production URLs](#production-urls)
12. [Cost Analysis](#cost-analysis)

---

## 🎯 **Overview**

The C&C CRM system is deployed on Render.com as a multi-service application with the following components:

- **Backend API** (FastAPI + PostgreSQL)
- **Frontend Web App** (Next.js 14)
- **Mobile Portal** (Next.js 14 - Mobile Mode)
- **Storage System** (Next.js 14 - Storage Mode)
- **Redis Cache** (Session & Real-time Data)
- **PostgreSQL Database** (Multi-tenant data)

---

## ✅ **Prerequisites**

### **Required Accounts:**
- [GitHub Account](https://github.com) (for code repository)
- [Render.com Account](https://render.com) (for deployment)
- SSH key pair for secure Git operations

### **Local Development Setup:**
- Git installed and configured
- SSH key pair generated
- Docker (for local testing)

---

## 🔑 **SSH Key Setup**

### **1. Generate SSH Key Pair**
```bash
# Generate new SSH key (if not exists)
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/github_ed25519

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to SSH agent
ssh-add ~/.ssh/github_ed25519
```

### **2. Add Public Key to GitHub**
```bash
# Display public key
cat ~/.ssh/github_ed25519.pub
```

**Steps:**
1. Copy the displayed public key
2. Go to GitHub → Settings → SSH and GPG keys
3. Click "New SSH key"
4. Paste the key and save

### **3. Test SSH Connection**
```bash
# Test GitHub SSH connection
ssh -T git@github.com
```

**Expected Output:** `Hi username! You've successfully authenticated...`

---

## 📚 **GitHub Repository Setup**

### **Repository Structure**
```
c-and-c-crm/
├── apps/
│   ├── api/                 # FastAPI Backend
│   │   ├── main.py
│   │   ├── routes/
│   │   └── middleware/
│   └── frontend/            # Next.js Frontend
│       ├── app/
│       ├── components/
│       └── package.json
├── prisma/                  # Database Schema
├── render.yaml             # Render Blueprint
├── requirements.txt        # Python Dependencies
└── README.md
```

### **Git Commands**
```bash
# Initialize repository (if needed)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial deployment setup"

# Add remote origin
git remote add origin git@github.com:Sir-shkolnik/CnC.git

# Push to GitHub
git push -u origin main
```

---

## ⚙️ **Render.com Configuration**

### **Blueprint Configuration (`render.yaml`)**

```yaml
databases:
  - name: c-and-c-crm-postgres
    databaseName: c_and_c_crm
    user: c_and_c_user
    plan: free

  - name: c-and-c-crm-redis
    plan: free

services:
  - type: web
    name: c-and-c-crm-api
    env: python
    plan: free
    buildCommand: |
      python -m pip install --upgrade pip
      pip install -r requirements.txt
      pip install prisma
      prisma generate
    startCommand: |
      python -m uvicorn apps.api.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHONPATH
        value: .
      - key: DATABASE_URL
        fromDatabase:
          name: c-and-c-crm-postgres
          property: connectionString
      - key: REDIS_URL
        value: redis://c-and-c-crm-redis.onrender.com:6379
      - key: CORS_ORIGINS
        value: https://c-and-c-crm-frontend.onrender.com,https://c-and-c-crm-mobile.onrender.com,https://c-and-c-crm-storage.onrender.com

  - type: web
    name: c-and-c-crm-frontend
    env: node
    plan: free
    buildCommand: |
      cd apps/frontend
      npm install
      npm run build
    startCommand: |
      cd apps/frontend
      next start -p $PORT
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://c-and-c-crm-api.onrender.com
      - key: NEXT_PUBLIC_APP_URL
        value: https://c-and-c-crm-frontend.onrender.com
      - key: NEXT_PUBLIC_ENVIRONMENT
        value: production

  - type: web
    name: c-and-c-crm-mobile
    env: node
    plan: free
    buildCommand: |
      cd apps/frontend
      npm install
      npm run build
    startCommand: |
      cd apps/frontend
      next start -p $PORT
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://c-and-c-crm-api.onrender.com
      - key: NEXT_PUBLIC_APP_URL
        value: https://c-and-c-crm-mobile.onrender.com
      - key: NEXT_PUBLIC_ENVIRONMENT
        value: production
      - key: NEXT_PUBLIC_MOBILE_MODE
        value: true

  - type: web
    name: c-and-c-crm-storage
    env: node
    plan: free
    buildCommand: |
      cd apps/frontend
      npm install
      npm run build
    startCommand: |
      cd apps/frontend
      next start -p $PORT
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://c-and-c-crm-api.onrender.com
      - key: NEXT_PUBLIC_APP_URL
        value: https://c-and-c-crm-storage.onrender.com
      - key: NEXT_PUBLIC_ENVIRONMENT
        value: production
      - key: NEXT_PUBLIC_STORAGE_MODE
        value: true
```

---

## 🔧 **Environment Variables**

### **Backend API Variables**
```bash
# Database
DATABASE_URL=postgresql://c_and_c_user:password@host:5432/c_and_c_crm
REDIS_URL=redis://c-and-c-crm-redis.onrender.com:6379

# CORS
CORS_ORIGINS=https://c-and-c-crm-frontend.onrender.com,https://c-and-c-crm-mobile.onrender.com,https://c-and-c-crm-storage.onrender.com

# Python
PYTHONPATH=.
```

### **Frontend Variables**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://c-and-c-crm-api.onrender.com
NEXT_PUBLIC_APP_URL=https://c-and-c-crm-frontend.onrender.com
NEXT_PUBLIC_ENVIRONMENT=production

# Mode Configuration
NEXT_PUBLIC_MOBILE_MODE=true  # For mobile portal
NEXT_PUBLIC_STORAGE_MODE=true # For storage system
```

---

## 🚀 **Deployment Process**

### **1. Connect GitHub Repository**
1. Go to [Render.com Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub account
4. Select the `CnC` repository

### **2. Deploy Blueprint**
1. Render will detect `render.yaml`
2. Review the services configuration
3. Click "Apply" to start deployment

### **3. Monitor Deployment**
- Watch build logs for each service
- Check for any errors or warnings
- Verify all services start successfully

### **4. Post-Deployment Setup**
1. **Database Migration:**
   ```bash
   # Connect to API service and run migrations
   prisma migrate deploy
   ```

2. **Seed Data (Optional):**
   ```bash
   # Add initial data if needed
   python scripts/seed_data.py
   ```

---

## 🏗️ **Service Architecture**

### **Service Dependencies**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile        │    │   Storage       │
│   (Next.js)     │    │   Portal        │    │   System        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Backend API          │
                    │      (FastAPI)            │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   PostgreSQL Database     │
                    │   Redis Cache             │
                    └───────────────────────────┘
```

### **Service URLs**
- **API:** `https://c-and-c-crm-api.onrender.com`
- **Frontend:** `https://c-and-c-crm-frontend.onrender.com`
- **Mobile:** `https://c-and-c-crm-mobile.onrender.com`
- **Storage:** `https://c-and-c-crm-storage.onrender.com`

---

## 📊 **Monitoring & Logs**

### **Accessing Logs**
1. Go to Render Dashboard
2. Select the service
3. Click "Logs" tab
4. View real-time logs

### **Health Checks**
```bash
# API Health Check
curl https://c-and-c-crm-api.onrender.com/health

# Frontend Check
curl https://c-and-c-crm-frontend.onrender.com

# Database Connection
curl https://c-and-c-crm-api.onrender.com/health/database
```

### **Key Metrics to Monitor**
- **Response Times:** < 2 seconds
- **Error Rates:** < 1%
- **Uptime:** > 99.9%
- **Memory Usage:** < 80%
- **CPU Usage:** < 70%

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Build Failures**
```bash
# Check build logs
# Common causes:
# - Missing dependencies
# - TypeScript errors
# - Environment variable issues
```

**Solutions:**
- Verify all dependencies in `package.json` and `requirements.txt`
- Check TypeScript compilation locally
- Ensure environment variables are set correctly

#### **2. Database Connection Issues**
```bash
# Check database URL format
DATABASE_URL=postgresql://user:password@host:port/database
```

**Solutions:**
- Verify database credentials
- Check network connectivity
- Ensure database is running

#### **3. CORS Errors**
```bash
# Verify CORS_ORIGINS includes all frontend URLs
CORS_ORIGINS=https://c-and-c-crm-frontend.onrender.com,https://c-and-c-crm-mobile.onrender.com,https://c-and-c-crm-storage.onrender.com
```

#### **4. Service Not Starting**
```bash
# Check start commands
# Verify port configuration
# Check environment variables
```

### **Debug Commands**
```bash
# Check service status
curl -I https://c-and-c-crm-api.onrender.com/health

# Test database connection
curl https://c-and-c-crm-api.onrender.com/health/database

# Check frontend build
curl -I https://c-and-c-crm-frontend.onrender.com
```

---

## 🌐 **Production URLs**

### **Main Application**
- **Landing Page:** `https://c-and-c-crm-frontend.onrender.com`
- **Login:** `https://c-and-c-crm-frontend.onrender.com/auth/login`
- **Dashboard:** `https://c-and-c-crm-frontend.onrender.com/dashboard`

### **Mobile Portal**
- **Mobile Login:** `https://c-and-c-crm-mobile.onrender.com`
- **Field Operations:** `https://c-and-c-crm-mobile.onrender.com/mobile`

### **Storage System**
- **Storage Dashboard:** `https://c-and-c-crm-storage.onrender.com/storage`
- **Unit Management:** `https://c-and-c-crm-storage.onrender.com/storage/units`

### **API Endpoints**
- **API Base:** `https://c-and-c-crm-api.onrender.com`
- **Health Check:** `https://c-and-c-crm-api.onrender.com/health`
- **API Docs:** `https://c-and-c-crm-api.onrender.com/docs`

### **Super Admin Portal**
- **Super Admin:** `https://c-and-c-crm-frontend.onrender.com/super-admin/auth/login`
- **Company Management:** `https://c-and-c-crm-frontend.onrender.com/super-admin/companies`

---

## 💰 **Cost Analysis**

### **Free Tier Limits**
- **Web Services:** 750 hours/month (free)
- **PostgreSQL:** 90 days free trial
- **Redis:** 30 days free trial

### **Paid Plans (if needed)**
- **Web Services:** $7/month per service
- **PostgreSQL:** $7/month (starter plan)
- **Redis:** $13/month (starter plan)

### **Estimated Monthly Cost**
- **Current Setup:** $0/month (free tier)
- **Production Scale:** $34/month (4 services + database + cache)

---

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
1. **Weekly:**
   - Check service logs
   - Monitor performance metrics
   - Review error rates

2. **Monthly:**
   - Update dependencies
   - Review security patches
   - Backup verification

3. **Quarterly:**
   - Performance optimization
   - Security audit
   - Cost review

### **Emergency Contacts**
- **Render Support:** [support.render.com](https://support.render.com)
- **GitHub Issues:** [github.com/Sir-shkolnik/CnC/issues](https://github.com/Sir-shkolnik/CnC/issues)

---

## 📝 **Deployment Checklist**

### **Pre-Deployment**
- [ ] SSH keys configured
- [ ] GitHub repository ready
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Dependencies updated

### **Deployment**
- [ ] Blueprint deployed successfully
- [ ] All services running
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] CORS configured correctly

### **Post-Deployment**
- [ ] All URLs accessible
- [ ] Authentication working
- [ ] Database connections stable
- [ ] Performance acceptable
- [ ] Monitoring configured

---

**🎉 Deployment Complete!**

Your C&C CRM system is now live on Render.com with full production capabilities including mobile operations, storage management, and multi-company support.

---

**Last Updated:** January 2025  
**Next Review:** After major deployment changes  
**Version:** 2.6.0 