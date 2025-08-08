#!/bin/bash

# Local Development Startup Script
# Purpose: Start all services locally for development and testing

echo "🚀 Starting C&C CRM Local Development Environment"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Stopping existing service..."
        lsof -ti:$1 | xargs kill -9
        sleep 2
    fi
}

# Check and clear ports
echo "🔍 Checking ports..."
check_port 5432  # PostgreSQL
check_port 6379  # Redis
check_port 8000  # API
check_port 3000  # Frontend

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker-compose exec -T postgres pg_isready -U c_and_c_user -d c_and_c_crm; do
    echo "⏳ Database not ready yet, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd prisma && npx prisma generate && cd ..

# Run database migrations
echo "🗄️ Running database migrations..."
cd prisma && npx prisma migrate dev --name init && cd ..

# Start API server in background
echo "🔌 Starting API server..."
cd apps/api && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!
cd ../..

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
sleep 5

# Test API health
until curl -s http://localhost:8000/health > /dev/null; do
    echo "⏳ API not ready yet, waiting..."
    sleep 2
done

echo "✅ API is ready!"

# Run SmartMoving sync test
echo "🔄 Running SmartMoving sync test..."
python scripts/test_smartmoving_sync_local.py

# Start frontend in background
echo "🌐 Starting frontend..."
cd apps/frontend && npm run dev &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 10

# Test frontend
until curl -s http://localhost:3000 > /dev/null; do
    echo "⏳ Frontend not ready yet, waiting..."
    sleep 2
done

echo "✅ Frontend is ready!"

# Print access information
echo ""
echo "🎉 Local Development Environment Started Successfully!"
echo "======================================================"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️ Database: localhost:5432 (c_and_c_crm)"
echo "🔴 Redis: localhost:6379"
echo ""
echo "👤 Login Credentials:"
echo "   Email: shahbaz@lgm.com"
echo "   Password: 1234"
echo ""
echo "📊 SmartMoving data has been synced to the database!"
echo "   You should now see real LGM journey data in the dashboard."
echo ""
echo "🛑 To stop all services, run: ./scripts/stop_local_dev.sh"
echo ""

# Function to handle cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Stopping local development environment..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    docker-compose down
    echo "✅ All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo "🔄 Services are running. Press Ctrl+C to stop."
wait
