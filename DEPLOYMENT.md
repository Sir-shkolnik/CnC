# 🚀 C&C CRM Deployment Guide - Render.com

## 📋 **Deployment Overview**

This guide will help you deploy the C&C CRM system to Render.com with separate services for frontend, backend, mobile portal, storage system, and database.

### **System Architecture**
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI (Python) with PostgreSQL
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for real-time data and session management
- **Mobile Portal**: Mobile-first field operations interface
- **Storage System**: Interactive storage management with drag-and-drop
- **Authentication**: JWT-based with role-based access
- **Real Data**: 43 LGM locations with complete operational data

---

## 🎯 **Deployment Steps**

### **Step 1: Prepare GitHub Repository**

1. **Ensure all files are committed and pushed:**
   ```bash
   git add .
   git commit -m "🚀 Prepare for Render deployment v2.6.0"
   git push origin main
   ```

2. **Verify repository structure:**
   ```
   c-and-c-crm/
   ├── render.yaml              # Render configuration
   ├── apps/
   │   ├── api/                 # FastAPI backend
   │   └── frontend/            # Next.js frontend
   ├── prisma/                  # Database schema
   ├── requirements.txt         # Python dependencies
   └── package.json            # Node.js dependencies
   ```

### **Step 2: Create Render Account**

1. **Sign up at [render.com](https://render.com)**
2. **Connect your GitHub account**
3. **Select the `CnC` repository**

### **Step 3: Deploy Using Blueprint**

1. **Click "New +" → "Blueprint"**
2. **Connect your GitHub repository**
3. **Select the `CnC` repository**
4. **Render will automatically detect `render.yaml`**
5. **Click "Apply" to deploy all services**

### **Step 4: Manual Deployment (Alternative)**

If blueprint deployment doesn't work, deploy services manually:

#### **A. Create PostgreSQL Database**
1. **New + → PostgreSQL**
2. **Name**: `c-and-c-crm-db`
3. **Database**: `c_and_c_crm`
4. **User**: `c_and_c_user`
5. **Plan**: Free (for development) or Standard ($7/month for production)

#### **B. Create Redis Cache**
1. **New + → Redis**
2. **Name**: `c-and-c-crm-redis`
3. **Plan**: Free (for development) or Standard ($7/month for production)

#### **C. Create Backend API Service**
1. **New + → Web Service**
2. **Connect GitHub repository**
3. **Name**: `c-and-c-crm-api`
4. **Environment**: Python
5. **Build Command**: 
   ```bash
   pip install -r requirements.txt
   pip install prisma
   prisma generate
   ```
6. **Start Command**: 
   ```bash
   uvicorn apps.api.main:app --host 0.0.0.0 --port $PORT
   ```

#### **D. Create Frontend Service**
1. **New + → Web Service**
2. **Connect GitHub repository**
3. **Name**: `c-and-c-crm-frontend`
4. **Environment**: Node
5. **Build Command**: 
   ```bash
   cd apps/frontend
   npm install
   npm run build
   ```
6. **Start Command**: 
   ```bash
   cd apps/frontend
   npm start
   ```

#### **E. Create Mobile Portal Service**
1. **New + → Web Service**
2. **Connect GitHub repository**
3. **Name**: `c-and-c-crm-mobile`
4. **Environment**: Node
5. **Build Command**: 
   ```bash
   cd apps/frontend
   npm install
   npm run build
   ```
6. **Start Command**: 
   ```bash
   cd apps/frontend
   npm start
   ```

#### **F. Create Storage System Service**
1. **New + → Web Service**
2. **Connect GitHub repository**
3. **Name**: `c-and-c-crm-storage`
4. **Environment**: Node
5. **Build Command**: 
   ```bash
   cd apps/frontend
   npm install
   npm run build
   ```
6. **Start Command**: 
   ```bash
   cd apps/frontend
   npm start
   ```

---

## 🔧 **Environment Variables**

### **Backend API Environment Variables**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=720
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
CORS_ORIGINS=https://c-and-c-crm-frontend.onrender.com
REDIS_URL=redis://c-and-c-crm-redis.onrender.com:6379
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=INFO
LOG_FORMAT=json
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=365
DEFAULT_TIMEZONE=America/Toronto
DEFAULT_CLIENT_ID=clm_f55e13de_a5c4_4990_ad02_34bb07187daa
```

### **Frontend Environment Variables**
```bash
NEXT_PUBLIC_API_URL=https://c-and-c-crm-api.onrender.com
NEXT_PUBLIC_APP_URL=https://c-and-c-crm-frontend.onrender.com
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

### **Mobile Portal Environment Variables**
```bash
NEXT_PUBLIC_API_URL=https://c-and-c-crm-api.onrender.com
NEXT_PUBLIC_APP_URL=https://c-and-c-crm-mobile.onrender.com
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
NEXT_PUBLIC_MOBILE_MODE=true
```

### **Storage System Environment Variables**
```bash
NEXT_PUBLIC_API_URL=https://c-and-c-crm-api.onrender.com
NEXT_PUBLIC_APP_URL=https://c-and-c-crm-storage.onrender.com
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
NEXT_PUBLIC_STORAGE_MODE=true
```

---

## 🗄️ **Database Setup**

### **Step 1: Run Database Migrations**
After deployment, run database migrations:

1. **Access your backend service logs**
2. **Run the following commands:**
   ```bash
   # Generate Prisma client
   prisma generate
   
   # Run migrations
   prisma migrate deploy
   
   # Seed initial data (if needed)
   python populate_lgm_locations.py
   ```

### **Step 2: Verify Database Connection**
1. **Check backend health endpoint**: `https://c-and-c-crm-api.onrender.com/health`
2. **Verify database tables are created**
3. **Confirm LGM data is loaded**

---

## 🔐 **Authentication Setup**

### **Super Admin Access**
- **Username**: `udi.shkolnik`
- **Password**: `Id200633048!`
- **Role**: `SUPER_ADMIN`

### **Regular User Access**
- **Email**: `sarah.johnson@lgm.com`
- **Password**: `1234`
- **Role**: `ADMIN`

### **Mobile Field Operations Access**
- **Email**: `david.rodriguez@lgm.com`
- **Password**: `password123`
- **Role**: `DRIVER`

---

## 🌐 **Access URLs**

### **Production URLs**
- **Frontend**: `https://c-and-c-crm-frontend.onrender.com`
- **Backend API**: `https://c-and-c-crm-api.onrender.com`
- **Mobile Portal**: `https://c-and-c-crm-mobile.onrender.com`
- **Storage System**: `https://c-and-c-crm-storage.onrender.com`
- **API Documentation**: `https://c-and-c-crm-api.onrender.com/docs`
- **Health Check**: `https://c-and-c-crm-api.onrender.com/health`

### **Main Application Pages**
- **Landing**: `https://c-and-c-crm-frontend.onrender.com`
- **Login**: `https://c-and-c-crm-frontend.onrender.com/auth/login`
- **Dashboard**: `https://c-and-c-crm-frontend.onrender.com/dashboard`
- **Journeys**: `https://c-and-c-crm-frontend.onrender.com/journeys`
- **Mobile Portal**: `https://c-and-c-crm-mobile.onrender.com/mobile`
- **Storage System**: `https://c-and-c-crm-storage.onrender.com/storage`

### **Super Admin Portal**
- **Super Admin Login**: `https://c-and-c-crm-frontend.onrender.com/super-admin/auth/login`
- **Super Admin Dashboard**: `https://c-and-c-crm-frontend.onrender.com/super-admin/dashboard`

---

## 📱 **Mobile Field Operations Portal**

### **Features**
- **Mobile-First Design** - Optimized for phone screens with thumb-friendly interface
- **"One Page, One Job" Philosophy** - Single-page journey management
- **Offline Capability** - Full functionality without internet connection
- **Real-time Sync** - Background data synchronization when online
- **GPS Integration** - Automatic location tracking and updates
- **Quick Actions** - One-tap operations for efficiency
- **Progress Tracking** - Visual progress indicators and step completion
- **Role-Based Access** - Different permissions for drivers, movers, managers
- **Media Capture** - Photo/video/signature capture with metadata
- **Push Notifications** - Real-time alerts and updates
- **Session Management** - Device registration and session tracking
- **Real Database Integration** - Uses actual C&C CRM database with real user data

### **Mobile Portal URLs**
- **Mobile Login**: `https://c-and-c-crm-mobile.onrender.com/mobile`
- **Mobile API**: `https://c-and-c-crm-api.onrender.com/mobile`
- **Real User Credentials**: david.rodriguez@lgm.com / password123

---

## 🗄️ **Storage System Portal**

### **Features**
- **Interactive Drag-and-Drop Map** - Visual storage unit management
- **Real-time Inventory** - Live tracking of storage unit availability
- **Dynamic Configuration** - Resize, reposition, and reconfigure storage layouts
- **Mobile Control** - Touch-friendly interface for field operations
- **Analytics Dashboard** - Storage utilization and revenue analytics
- **Customer Portal** - Self-service storage booking
- **Automated Billing** - Usage-based billing and payment processing
- **Multi-Location Support** - Manage 43 LGM locations with storage facilities

### **Storage System URLs**
- **Storage Management**: `https://c-and-c-crm-storage.onrender.com/storage`
- **Customer Booking**: `https://c-and-c-crm-storage.onrender.com/storage/booking`
- **Unit Management**: `https://c-and-c-crm-storage.onrender.com/storage/units`
- **Billing Management**: `https://c-and-c-crm-storage.onrender.com/storage/billing`

---

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
- **API Health**: `https://c-and-c-crm-api.onrender.com/health`
- **Frontend Health**: `https://c-and-c-crm-frontend.onrender.com`
- **Mobile Health**: `https://c-and-c-crm-mobile.onrender.com/mobile`
- **Storage Health**: `https://c-and-c-crm-storage.onrender.com/storage`

### **Monitoring Setup**
1. **Enable Render monitoring**
2. **Set up uptime monitoring**
3. **Configure error alerts**
4. **Monitor database performance**

---

## 🔒 **Security Configuration**

### **SSL/HTTPS**
- ✅ **Automatic SSL**: Render provides free SSL certificates
- ✅ **HTTPS Only**: All traffic is encrypted
- ✅ **Security Headers**: Configured in Next.js and FastAPI

### **Environment Variables**
- ✅ **Secure Storage**: Environment variables are encrypted
- ✅ **No Hardcoded Secrets**: All secrets are in environment variables
- ✅ **JWT Security**: Strong JWT secret generation

### **CORS Configuration**
- ✅ **Restricted Origins**: Only production domains allowed
- ✅ **Secure Headers**: Proper security headers configured

---

## 💰 **Cost Analysis**

### **Render.com Pricing (Monthly)**

#### **Development/Testing (Free Tier)**
- **Frontend Service**: $0/month (Free tier)
- **Backend Service**: $0/month (Free tier)
- **Mobile Portal**: $0/month (Free tier)
- **Storage System**: $0/month (Free tier)
- **PostgreSQL Database**: $0/month (Free tier)
- **Redis Cache**: $0/month (Free tier)
- **Total**: $0/month

#### **Production (Paid Plans)**
- **Frontend Service**: $7/month (Starter plan)
- **Backend Service**: $7/month (Starter plan)
- **Mobile Portal**: $7/month (Starter plan)
- **Storage System**: $7/month (Starter plan)
- **PostgreSQL Database**: $7/month (Standard plan)
- **Redis Cache**: $7/month (Standard plan)
- **Total**: $42/month

### **Plan Comparison**
- **Free Tier**: $0/month (limited to 750 hours/month, cold starts)
- **Starter Plans**: $7/month each (512MB RAM, 0.1 CPU)
- **Standard Plans**: $25/month each (1GB RAM, 0.5 CPU)

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Build Failures**
```bash
# Check build logs in Render dashboard
# Verify all dependencies are in requirements.txt
# Ensure Node.js version is compatible
```

#### **2. Database Connection Issues**
```bash
# Verify DATABASE_URL environment variable
# Check database service is running
# Ensure migrations are applied
```

#### **3. CORS Errors**
```bash
# Verify CORS_ORIGINS environment variable
# Check frontend URL is correct
# Ensure HTTPS is used in production
```

#### **4. JWT Authentication Issues**
```bash
# Verify JWT_SECRET is set
# Check token expiration settings
# Ensure proper CORS configuration
```

#### **5. Redis Connection Issues**
```bash
# Verify REDIS_URL environment variable
# Check Redis service is running
# Ensure Redis credentials are correct
```

### **Debug Commands**
```bash
# Check backend logs
curl https://c-and-c-crm-api.onrender.com/health

# Check frontend status
curl https://c-and-c-crm-frontend.onrender.com

# Check mobile portal
curl https://c-and-c-crm-mobile.onrender.com/mobile

# Check storage system
curl https://c-and-c-crm-storage.onrender.com/storage

# Test database connection
curl https://c-and-c-crm-api.onrender.com/super-admin/companies
```

---

## 📈 **Performance Optimization**

### **Frontend Optimizations**
- ✅ **Next.js Optimization**: Enabled compression and image optimization
- ✅ **Bundle Optimization**: Tree shaking and code splitting
- ✅ **PWA Support**: Progressive Web App capabilities
- ✅ **CDN**: Render provides global CDN

### **Backend Optimizations**
- ✅ **Gzip Compression**: Enabled for all responses
- ✅ **Database Indexing**: Optimized database queries
- ✅ **Connection Pooling**: Efficient database connections
- ✅ **Caching**: Redis integration for caching

### **Mobile Optimizations**
- ✅ **Offline Capability**: Service Worker and IndexedDB
- ✅ **GPS Integration**: Real-time location tracking
- ✅ **Media Capture**: Photo/video/signature upload
- ✅ **Push Notifications**: Real-time alerts

### **Storage System Optimizations**
- ✅ **Drag-and-Drop**: Smooth interactions with Framer Motion
- ✅ **Real-time Updates**: WebSocket integration
- ✅ **Analytics**: Live performance tracking
- ✅ **Mobile Responsive**: Touch-friendly interface

---

## 🔄 **Continuous Deployment**

### **Auto-Deploy Setup**
1. **Connect GitHub repository**
2. **Enable auto-deploy on main branch**
3. **Configure deployment hooks**
4. **Set up deployment notifications**

### **Deployment Process**
1. **Push changes to main branch**
2. **Render automatically detects changes**
3. **Builds and deploys new version**
4. **Health checks ensure successful deployment**

---

## 📋 **Post-Deployment Checklist**

- [ ] **Database migrations applied**
- [ ] **Environment variables configured**
- [ ] **Health checks passing**
- [ ] **Authentication working**
- [ ] **Frontend loading correctly**
- [ ] **Mobile portal accessible**
- [ ] **Storage system functional**
- [ ] **API endpoints responding**
- [ ] **SSL certificates active**
- [ ] **Monitoring configured**
- [ ] **Backup strategy implemented**
- [ ] **User access verified**

---

## 🎉 **Go-Live**

### **Final Steps**
1. **Test all functionality with real LGM data**
2. **Verify super admin access**
3. **Test mobile field operations**
4. **Confirm all 43 LGM locations are accessible**
5. **Validate user permissions and roles**
6. **Test offline capabilities**
7. **Verify real-time features**
8. **Test storage system functionality**
9. **Verify Redis cache integration**

### **Launch Announcement**
- **System**: C&C CRM v2.6.0
- **Status**: Production Ready
- **Access**: https://c-and-c-crm-frontend.onrender.com
- **Mobile**: https://c-and-c-crm-mobile.onrender.com
- **Storage**: https://c-and-c-crm-storage.onrender.com
- **Support**: Available for LGM operations team

---

## 📞 **Support & Maintenance**

### **Monitoring**
- **Render Dashboard**: Monitor service health
- **Logs**: Check application logs for errors
- **Metrics**: Track performance and usage

### **Updates**
- **Automatic**: GitHub integration for continuous deployment
- **Manual**: Deploy updates through Render dashboard
- **Rollback**: Easy rollback to previous versions

### **Backup**
- **Database**: Automatic daily backups
- **Code**: GitHub repository backup
- **Configuration**: Environment variables backup

---

**🎯 The C&C CRM system is now ready for production deployment on Render.com!**

**Status**: Production Ready v2.6.0  
**Tagline**: Trust the Journey  
**Next Step**: Deploy and start LGM operations 