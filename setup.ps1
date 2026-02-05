# 🚀 NexLevel Speech - Complete Startup Script (PowerShell)
# Runs both backend and frontend with proper setup

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 NexLevel Speech - Complete Setup & Start" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

$nodeVersion = node -v
Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
Write-Host ""

# Backend Setup
Write-Host "🔧 Setting up Backend..." -ForegroundColor Yellow

Push-Location "$PROJECT_ROOT\backend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..."
    npm install
}

Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "Setting up database..."
npx prisma db push

Write-Host "Seeding database..."
npx ts-node prisma/seed.ts

Write-Host "✅ Backend setup complete" -ForegroundColor Green
Pop-Location
Write-Host ""

# Frontend Setup
Write-Host "🎨 Setting up Frontend..." -ForegroundColor Yellow

Push-Location "$PROJECT_ROOT\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    'NEXT_PUBLIC_API_URL=http://localhost:3001/api' | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "Created .env.local"
}

Write-Host "✅ Frontend setup complete" -ForegroundColor Green
Pop-Location
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Test Credentials:" -ForegroundColor Blue
Write-Host "  Email: test@example.com"
Write-Host "  Password: Test123456"
Write-Host ""

Write-Host "🚀 Starting Services:" -ForegroundColor Blue
Write-Host ""
Write-Host "🔵 Terminal 1 (Backend):"
Write-Host "  cd backend"
Write-Host "  npm run start:dev"
Write-Host ""
Write-Host "🟣 Terminal 2 (Frontend):"
Write-Host "  cd frontend"
Write-Host "  npm run dev"
Write-Host ""

Write-Host "🌐 URLs:" -ForegroundColor Blue
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:3001"
Write-Host "  API:      http://localhost:3001/api"
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Blue
Write-Host "  SETUP_COMPLETE.md    - Complete setup guide"
Write-Host "  DEPLOYMENT_GUIDE.md  - Deployment and troubleshooting"
Write-Host ""

Write-Host "Start the backend and frontend in separate terminals to complete setup." -ForegroundColor Yellow
Write-Host ""
