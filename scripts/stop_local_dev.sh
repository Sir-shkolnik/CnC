#!/bin/bash

# Local Development Stop Script
# Purpose: Stop all local development services

echo "🛑 Stopping C&C CRM Local Development Environment"
echo "=================================================="

# Stop frontend
echo "🌐 Stopping frontend..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "next dev" 2>/dev/null

# Stop API server
echo "🔌 Stopping API server..."
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "python -m uvicorn" 2>/dev/null

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose down

# Kill any remaining processes on our ports
echo "🔍 Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5432 | xargs kill -9 2>/dev/null
lsof -ti:6379 | xargs kill -9 2>/dev/null

echo "✅ All services stopped successfully!"
echo ""
echo "🔄 To start again, run: ./scripts/start_local_dev.sh"
