# C&C CRM - Command & Control CRM

**Mobile-first operations management for moving & logistics companies**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🎯 Overview

C&C CRM is a comprehensive mobile-first operations management platform designed specifically for moving and logistics companies. The system provides real-time field data tracking, crew management, audit trails, and multi-location support with advanced external company integration capabilities.

## ✨ Key Features

### 🚛 **Journey Management**
- **Real-time GPS Tracking** - Live location updates for all journeys
- **Configurable Workflows** - Customizable journey steps and processes
- **Crew Assignment** - Driver and mover management
- **Media Upload** - Photos, videos, and document capture
- **Offline Support** - Works seamlessly without internet connection

### 🏢 **Company Management System** ⭐ **NEW**
- **External Company Integration** - Generic architecture for multiple companies
- **SmartMoving API Integration** - Let's Get Moving (LGM) data synchronization
- **Automated Background Sync** - 12-hour interval data updates
- **Comprehensive Data Management** - 66+ branches, 59+ materials, 25+ service types, 100+ users, 100+ referral sources
- **GPS Location Data** - Full coordinates for all company locations
- **Pricing Information** - Complete materials and service pricing
- **Data Analysis** - Comprehensive deep analysis completed (75% data completeness)
- **Quality Assessment** - 90% data quality with identified gaps and recommendations

### 👥 **User Management**
- **Role-Based Access Control** - Super Admin, Admin, Dispatcher, Driver, Mover
- **Multi-Location Support** - Franchise and location management
- **Secure Authentication** - JWT-based authentication system
- **Permission System** - Granular access controls

### 📱 **Mobile Field Operations**
- **Mobile-Optimized Interface** - Designed for field workers
- **Real-time Updates** - Live journey progress and status
- **Offline Sync** - Automatic data synchronization
- **Media Capture** - Photo and video uploads
- **Status Reporting** - Real-time check-ins and updates

### 📊 **Analytics & Reporting**
- **Real-time Dashboard** - Live operational data
- **Performance Metrics** - Journey and crew analytics
- **Audit Trail** - Complete system audit logging
- **Data Export** - CSV and JSON export capabilities

## 🏗️ Architecture

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database with Prisma ORM
- **Redis** - Caching and session management
- **JWT Authentication** - Secure token-based authentication
- **Background Tasks** - Automated data synchronization

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Responsive Design** - Mobile-first approach

### Deployment
- **Render.com** - Cloud hosting platform
- **PostgreSQL** - Managed database service
- **Redis** - Managed caching service
- **Automated Deployments** - Git-based deployment pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sir-shkolnik/CnC.git
   cd c-and-c-crm
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   pip install -r requirements.txt
   
   # Frontend dependencies
   cd apps/frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Configure your environment variables
   DATABASE_URL="postgresql://user:password@localhost:5432/cnc_crm"
   JWT_SECRET="your-secret-key"
   REDIS_URL="redis://localhost:6379"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   python -m prisma generate
   
   # Run database migrations
   python -m prisma db push
   ```

5. **Start the development servers**
   ```bash
   # Backend (API)
   python -m uvicorn apps.api.main:app --reload --port 8000
   
   # Frontend (in another terminal)
   cd apps/frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Mobile Interface: http://localhost:3000/mobile

## 🏢 Company Management System

### Overview
The Company Management System provides a generic, scalable architecture for integrating external company data into the C&C CRM platform. It currently supports Let's Get Moving (LGM) through SmartMoving API integration.

### Features
- **Multi-Company Support** - Not hardcoded for LGM, supports any external company
- **Automated Data Sync** - Background synchronization every 12 hours
- **Comprehensive Data** - Branches, materials, service types, users, and more
- **GPS Coordinates** - Full location data with latitude/longitude
- **Pricing Information** - Complete materials and service pricing
- **Super Admin Interface** - Complete administrative controls

### LGM Integration Data
| Data Type | Count | Details |
|-----------|-------|---------|
| **Branches** | 50 | Full addresses with GPS coordinates |
| **Materials** | 59 | Complete pricing and specifications |
| **Service Types** | 25 | Service categories and descriptions |
| **Move Sizes** | 38 | Size classifications and ranges |
| **Room Types** | 10 | Room type categories |
| **Users** | 50 | Company user information |
| **Referral Sources** | 50 | Lead sources and providers |

### Access
- **Super Admin Dashboard**: Navigate to "External Integrations" in the menu
- **API Endpoints**: `/company-management/*` endpoints
- **Documentation**: Complete API documentation available

## 📱 Mobile Field Operations

### Features
- **Mobile-Optimized Interface** - Designed for field workers
- **Real-time GPS Tracking** - Live location updates
- **Offline Operation** - Works without internet connection
- **Media Capture** - Photo and video uploads
- **Status Updates** - Real-time journey progress
- **Crew Management** - Driver and mover coordination

### Access
- **Mobile Interface**: `/mobile` route
- **Field Operations**: Optimized for mobile devices
- **Offline Support**: Automatic sync when connection restored

## 🔐 Security

### Authentication
- **JWT Tokens** - Secure token-based authentication
- **Role-Based Access** - Granular permission system
- **Session Management** - Secure session handling
- **Super Admin Controls** - Administrative oversight

### Data Protection
- **Encrypted Storage** - Secure data storage
- **Audit Trail** - Complete activity logging
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Secure error responses

## 📊 API Documentation

### Core Endpoints
- **Authentication**: `/auth/*` - Login, logout, user management
- **Journey Management**: `/journey/*` - Journey CRUD operations
- **Company Management**: `/company-management/*` - External company integration
- **Super Admin**: `/super-admin/*` - Administrative functions
- **Mobile Operations**: `/mobile/*` - Mobile-specific endpoints

### Documentation
- **Interactive API Docs**: Available at `/docs` when running
- **OpenAPI Specification**: Complete API specification
- **Code Examples**: Request/response examples
- **Authentication Guide**: JWT token usage

## 🚀 Deployment

### Render.com Deployment
The application is configured for automatic deployment on Render.com:

1. **Connect Repository** - Link your GitHub repository
2. **Configure Services** - API, Frontend, Mobile, and Storage services
3. **Set Environment Variables** - Configure production settings
4. **Deploy** - Automatic deployment on git push

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
JWT_SECRET="your-secret-key"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="720"

# External APIs
SMARTMOVING_API_KEY="your-api-key"
SMARTMOVING_CLIENT_ID="your-client-id"

# Redis (optional)
REDIS_URL="redis://host:port"

# Environment
ENVIRONMENT="production"
DEBUG="false"
```

## 📈 Monitoring & Maintenance

### Health Checks
- **API Health**: `/health` endpoint
- **Database Connectivity**: Connection pool monitoring
- **Background Services**: Sync service status
- **Frontend Accessibility**: UI availability monitoring

### Logging
- **Structured Logging** - JSON-formatted logs
- **Error Tracking** - Comprehensive error logging
- **Performance Monitoring** - Response time tracking
- **Audit Trail** - Complete activity logging

### Backup & Recovery
- **Automated Backups** - Daily database backups
- **Data Recovery** - Point-in-time recovery
- **Disaster Recovery** - Complete system recovery procedures

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- **Python**: Black, isort, flake8
- **TypeScript**: ESLint, Prettier
- **Database**: Prisma schema validation
- **Testing**: pytest for backend, Jest for frontend

### Testing
```bash
# Backend tests
pytest tests/

# Frontend tests
cd apps/frontend
npm test

# Integration tests
pytest tests/integration/
```

## 📚 Documentation

### Project Documentation
- [Current Status Summary](./Project_docs/00_current_status_summary.md)
- [Company Management System](./Project_docs/27_company_management_system.md)
- [Technical Implementation](./Project_docs/28_technical_implementation_summary.md)
- [API Documentation](./Project_docs/04_api_structure_and_routes.md)
- [Frontend Guide](./Project_docs/05_frontend_ui_guide.md)
- [Deployment Guide](./Project_docs/07_deployment_instructions.md)

### User Guides
- [Super Admin Guide](./User_Journey/01_SUPER_ADMIN_Journey.md)
- [Dispatcher Guide](./User_Journey/03_DISPATCHER_Journey.md)
- [Driver Guide](./User_Journey/04_DRIVER_Journey.md)
- [Mover Guide](./User_Journey/05_MOVER_Journey.md)

## 📞 Support

### Getting Help
- **Documentation**: Comprehensive guides and tutorials
- **API Documentation**: Interactive API documentation
- **Issues**: GitHub issues for bug reports
- **Discussions**: GitHub discussions for questions

### Contact
- **Email**: support@cnc-crm.com
- **GitHub**: [Issues](https://github.com/Sir-shkolnik/CnC/issues)
- **Documentation**: [Project Docs](./Project_docs/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- **Let's Get Moving** - For providing the SmartMoving API integration
- **Render.com** - For hosting and deployment infrastructure
- **Open Source Community** - For the amazing tools and libraries

---

**C&C CRM** - Trust the Journey  
**Version**: 2.0.0  
**Last Updated**: August 7, 2025
