#!/bin/bash

# 🚀 NexLevel Speech - Complete Startup Script
# Runs both backend and frontend with proper setup

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 NexLevel Speech - Complete Setup & Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}"
echo ""

# Backend Setup
echo -e "${YELLOW}🔧 Setting up Backend...${NC}"
cd "$PROJECT_ROOT/backend"

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Setting up database..."
npx prisma db push

echo "Seeding database..."
npx ts-node prisma/seed.ts

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Frontend Setup
echo -e "${YELLOW}🎨 Setting up Frontend...${NC}"
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
    echo "Created .env.local"
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}📝 Test Credentials:${NC}"
echo "  Email: test@example.com"
echo "  Password: Test123456"
echo ""

echo -e "${BLUE}🚀 Starting Services:${NC}"
echo ""
echo "🔵 Terminal 1 (Backend):"
echo "  cd backend && npm run start:dev"
echo ""
echo "🟣 Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""

echo -e "${BLUE}🌐 URLs:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  API:      http://localhost:3001/api"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "  SETUP_COMPLETE.md    - Complete setup guide"
echo "  DEPLOYMENT_GUIDE.md  - Deployment & troubleshooting"
echo ""

echo -e "${YELLOW}Start the backend and frontend in separate terminals to complete setup.${NC}"
echo ""
