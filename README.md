# 🚛 C&C CRM (Command & Control CRM)

> **Trust the Journey** - Modern, mobile-first operations management for moving & logistics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)

## 📋 Overview

C&C CRM is a modern, mobile-first operations management system purpose-built for moving, logistics, and dispatch-heavy businesses. Unlike traditional CRM systems, C&C focuses on operational excellence over sales pipelines, empowering companies to:

- 🚚 Track and manage daily field operations (Truck Journeys)
- 👥 Ensure accountability across roles: Dispatcher, Driver, Mover
- 📸 Capture live data from the field (photos, GPS, notes, confirmations)
- 🤖 Automate cost calculations, crew feedback, and compliance

## 🏗️ Architecture

### Tech Stack
- **Backend**: Python 3.11 + FastAPI + Prisma ORM
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (multi-tenant SuperDB)
- **Deployment**: Docker + Render.com
- **Authentication**: JWT with role-based access control
- **Audit**: Immutable audit trails with diff tracking

### 12 C&C Engine Modules
1. **Command & Control** - Dispatch HQ and journey management
2. **Connect & Convert** - Lead to booking pipeline
3. **Crew & Customer** - HR + client sync
4. **Capture & Confirm** - Field data intake (GPS, photos, signatures)
5. **Calendar & Capacity** - Scheduling and resource allocation
6. **Cost & Compensation** - Profit intelligence and crew pay
7. **Compliance & Consistency** - Audit trails and rule enforcement
8. **Chat & Collaboration** - Real-time team communication
9. **Cash & Contracts** - Payments and document management
10. **Cloud & Control** - Multi-tenant SaaS engine
11. **Clean & Concise** - UX philosophy and auto-tagging
12. **Customer & Care** - Support tools and experience management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/c-and-c-crm.git
   cd c-and-c-crm
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```
   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6379
   - FastAPI backend on port 8000
   - Next.js frontend on port 3000
   - Prisma Studio on port 5555

4. **Or start manually**
   ```bash
   # Install dependencies
   npm install
   pip install -r requirements.txt
   
   # Set up database
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   
   # Start development servers
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - Prisma Studio: http://localhost:5555

## 📁 Project Structure

```
c-and-c-crm/
├── apps/
│   ├── api/                    # FastAPI Backend
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic
│   │   └── middleware/        # Auth, tenant, audit middleware
│   └── frontend/              # Next.js Frontend
│       ├── app/               # App Router pages
│       ├── components/        # React components
│       ├── store/             # Zustand state management
│       └── hooks/             # Custom React hooks
├── modules/                   # Shared business logic
├── packages/
│   └── shared/               # Shared types and utilities
│       ├── models/           # TypeScript interfaces
│       ├── constants/        # Shared constants
│       └── validators/       # Zod validation schemas
├── prisma/                   # Database schema and migrations
├── tests/                    # Test suites
└── docs/                     # Documentation
```

## 🔐 Security Features

- **Multi-tenant isolation** - Complete data separation per client
- **Role-based access control** - Granular permissions per user role
- **JWT authentication** - Secure token-based auth
- **Audit trails** - Immutable logs of all actions
- **Input validation** - Zod schemas for all API endpoints
- **CORS protection** - Configured for production domains

## 🎨 UI/UX Philosophy

- **Mobile-first design** - Optimized for field crews
- **Dark theme** - Modern, professional interface
- **PWA ready** - Installable on mobile devices
- **Offline capability** - Works without internet connection
- **Role-aware forms** - Shows only relevant fields per user

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests only
npm run test:api

# Run frontend tests only
npm run test:frontend

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Render.com (Recommended)
1. Connect your GitHub repository
2. Create a new Web Service
3. Set environment variables
4. Deploy automatically on push to main

### Docker
```bash
# Build production image
docker build -t c-and-c-crm .

# Run with environment variables
docker run -p 8000:8000 -p 3000:3000 \
  -e DATABASE_URL=your_db_url \
  -e JWT_SECRET=your_secret \
  c-and-c-crm
```

## 🔧 Development Commands

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database with sample data
npm run db:studio      # Open Prisma Studio

# Development
npm run dev            # Start both frontend and backend
npm run dev:api        # Start backend only
npm run dev:frontend   # Start frontend only

# Building
npm run build          # Build both frontend and backend
npm run build:api      # Build backend only
npm run build:frontend # Build frontend only

# Linting and formatting
npm run lint           # Run all linters
npm run lint:api       # Format Python code
npm run lint:frontend  # Lint TypeScript/React code
```

## 📊 Database Schema

The application uses a multi-tenant SuperDB architecture with the following core entities:

- **User** - Role-based access control
- **Client** - Multi-tenant isolation
- **Location** - Geographic organization
- **TruckJourney** - Core operational entity
- **JourneyEntry** - Field data capture
- **Media** - Photo/video storage
- **AuditEntry** - Compliance tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the established naming conventions
- Ensure all database queries include tenant scoping
- Add audit logging for all CRUD operations
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Project Docs](./Project_docs/)
- **API Reference**: http://localhost:8000/docs
- **Issues**: [GitHub Issues](https://github.com/your-org/c-and-c-crm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/c-and-c-crm/discussions)

## 🏢 About

C&C CRM is developed by **C&C Systems Inc.** for modern logistics operations. The platform is designed to replace traditional CRM systems with operational excellence, focusing on real-world field operations rather than sales pipelines.

---

**Trust the Journey** 🚛✨ # Deployment test
