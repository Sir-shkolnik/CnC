# C&C CRM - Multi-stage Docker Build
# Command & Control CRM for Moving & Logistics Operations

# ===== STAGE 1: BASE IMAGE =====
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# ===== STAGE 2: BACKEND BUILD =====
FROM base as backend-builder

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY apps/api/ ./apps/api/
COPY modules/ ./modules/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN pip install prisma && prisma generate

# ===== STAGE 3: FRONTEND BUILD =====
FROM node:18-alpine as frontend-builder

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm ci

# Copy frontend source
COPY apps/frontend/ ./apps/frontend/
COPY packages/ ./packages/

# Install frontend dependencies
WORKDIR /app/apps/frontend
RUN npm install

# ===== STAGE 4: PRODUCTION IMAGE =====
FROM base as production

# Install Node.js for frontend serving
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy Python dependencies from backend builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend code
COPY --from=backend-builder /app/apps/api/ ./apps/api/
COPY --from=backend-builder /app/modules/ ./modules/
COPY --from=backend-builder /app/prisma/ ./prisma/

# Copy frontend build
COPY --from=frontend-builder /app/apps/frontend/.next/ ./apps/frontend/.next/
COPY --from=frontend-builder /app/apps/frontend/public/ ./apps/frontend/public/
COPY --from=frontend-builder /app/apps/frontend/package.json ./apps/frontend/

# Copy shared packages
COPY --from=frontend-builder /app/packages/ ./packages/

# Install production Node.js dependencies
WORKDIR /app/apps/frontend
RUN npm ci --only=production

# Copy application files
WORKDIR /app
COPY .env.example .env
COPY docker-compose.yml .
COPY render.yaml .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose ports
EXPOSE 8000 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command
CMD ["sh", "-c", "uvicorn apps.api.main:app --host 0.0.0.0 --port 8000"] 