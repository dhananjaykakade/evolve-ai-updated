# =============================================================================
# 🚀 Evolve AI - Complete Setup Script (Windows)
# =============================================================================
# This script sets up all microservices, databases, and seeds data
# Usage: .\setup.ps1 [-SkipDb] [-SkipInstall] [-SkipSeed] [-Dev]
# =============================================================================

param(
    [switch]$SkipDb,
    [switch]$SkipInstall,
    [switch]$SkipSeed,
    [switch]$Dev
)

$ErrorActionPreference = "Stop"

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"

# =============================================================================
# Helper Functions
# =============================================================================

function Print-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor $Blue
    Write-Host "║ $Message" -ForegroundColor $Blue
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor $Blue
    Write-Host ""
}

function Print-Step {
    param([string]$Message)
    Write-Host "▶ $Message" -ForegroundColor $Cyan
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Wait-ForService {
    param(
        [string]$Url,
        [int]$MaxAttempts = 30
    )
    
    Print-Step "Waiting for $Url to be ready..."
    
    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Print-Success "Service is ready!"
                return $true
            }
        }
        catch {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 2
        }
    }
    
    Write-Host ""
    Print-Error "Service did not start in time"
    return $false
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

Print-Header "🔍 Pre-flight Checks"

Print-Step "Checking required tools..."

if (-not (Test-Command "node")) {
    Print-Error "Node.js is not installed. Please install it first."
    exit 1
}

if (-not (Test-Command "npm")) {
    Print-Error "npm is not installed. Please install it first."
    exit 1
}

if (-not (Test-Command "docker")) {
    Print-Error "Docker is not installed. Please install it first."
    exit 1
}

Print-Success "Node version: $(node --version)"
Print-Success "NPM version: $(npm --version)"
Print-Success "Docker version: $(docker --version)"

# Check if pnpm is installed
if (-not (Test-Command "pnpm")) {
    Print-Warning "pnpm not found. Installing..."
    npm install -g pnpm
    Print-Success "pnpm installed"
}
else {
    Print-Success "pnpm version: $(pnpm --version)"
}

# =============================================================================
# Environment Files Setup
# =============================================================================

Print-Header "📄 Setting Up Environment Files"

# Database .env
if (-not (Test-Path "database\.env")) {
    Print-Step "Creating database\.env from template..."
    @"
# Database Configuration
POSTGRES_DB=evolve
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5433

MONGO_PORT=27019
REDIS_PORT=6379

# Optional admin tools
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin123
PGADMIN_PORT=8080
MONGO_EXPRESS_PORT=8081
"@ | Out-File -FilePath "database\.env" -Encoding UTF8
    Print-Success "Created database\.env"
}
else {
    Print-Warning "database\.env already exists, skipping"
}

# Auth Service .env
if (-not (Test-Path "backend-service\auth-service\.env")) {
    Print-Step "Creating auth-service\.env..."
    @"
# Database URLs
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/evolve?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret
JWT_SECRET="evolve-ai-super-secret-jwt-key-change-in-production"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Service Port
PORT=8001

# Service URLs
AUTH_SERVICE_URL="http://localhost:8001"
STUDENT_SERVICE_URL="http://localhost:9002"
TEACHER_SERVICE_URL="http://localhost:9003"

# Cloudinary (Optional)
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
"@ | Out-File -FilePath "backend-service\auth-service\.env" -Encoding UTF8
    Print-Success "Created auth-service\.env"
}
else {
    Print-Warning "auth-service\.env already exists, skipping"
}

# Teacher Service .env
if (-not (Test-Path "backend-service\teacher-service\.env")) {
    Print-Step "Creating teacher-service\.env..."
    @"
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_teacher"

# Service Port
PORT=9003

# Service URLs
AUTH_SERVICE_URL="http://localhost:8001"
STUDENT_SERVICE_URL="http://localhost:9002"

# JWT Secret (should match auth service)
JWT_SECRET="evolve-ai-super-secret-jwt-key-change-in-production"
"@ | Out-File -FilePath "backend-service\teacher-service\.env" -Encoding UTF8
    Print-Success "Created teacher-service\.env"
}
else {
    Print-Warning "teacher-service\.env already exists, skipping"
}

# Student Service .env
if (-not (Test-Path "backend-service\student-service\.env")) {
    Print-Step "Creating student-service\.env..."
    @"
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_student"

# Service Port
PORT=9002

# Service URLs
AUTH_SERVICE_URL="http://localhost:8001"
TEACHER_SERVICE_URL="http://localhost:9003"

# JWT Secret (should match auth service)
JWT_SECRET="evolve-ai-super-secret-jwt-key-change-in-production"
"@ | Out-File -FilePath "backend-service\student-service\.env" -Encoding UTF8
    Print-Success "Created student-service\.env"
}
else {
    Print-Warning "student-service\.env already exists, skipping"
}

# API Gateway .env
if (-not (Test-Path "backend-service\api-gateway\.env")) {
    Print-Step "Creating api-gateway\.env..."
    @"
# Gateway Port
PORT=9001

# Service URLs
AUTH_SERVICE_URL="http://localhost:8001"
TEACHER_SERVICE_URL="http://localhost:9003"
STUDENT_SERVICE_URL="http://localhost:9002"
NOTIFICATION_SERVICE_URL="http://localhost:9020"
GRADING_SERVICE_URL="http://localhost:9006"
EXAM_SERVICE_URL="http://localhost:9005"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:5174"

# Rate Limiting
RATE_LIMIT_MAX=1000

NODE_ENV=development
"@ | Out-File -FilePath "backend-service\api-gateway\.env" -Encoding UTF8
    Print-Success "Created api-gateway\.env"
}
else {
    Print-Warning "api-gateway\.env already exists, skipping"
}

# Notification Service .env
if (-not (Test-Path "backend-service\notification-service\.env")) {
    Print-Step "Creating notification-service\.env..."
    @"
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_notifications"

# Service Port
PORT=9020

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:5174"
"@ | Out-File -FilePath "backend-service\notification-service\.env" -Encoding UTF8
    Print-Success "Created notification-service\.env"
}
else {
    Print-Warning "notification-service\.env already exists, skipping"
}

# =============================================================================
# Install Dependencies
# =============================================================================

if (-not $SkipInstall) {
    Print-Header "📦 Installing Dependencies"
    
    Print-Step "Installing root dependencies..."
    pnpm install
    Print-Success "Root dependencies installed"
    
    Print-Step "Installing shared package dependencies..."
    Push-Location shared
    pnpm install
    Pop-Location
    Print-Success "Shared package dependencies installed"
    
    Print-Step "Installing service dependencies..."
    pnpm install --filter auth-service
    pnpm install --filter teacher-service
    pnpm install --filter student-service
    pnpm install --filter api-gateway
    pnpm install --filter notification-service
    Print-Success "Service dependencies installed"
}
else {
    Print-Warning "Skipping dependency installation"
}

# =============================================================================
# Database Setup
# =============================================================================

if (-not $SkipDb) {
    Print-Header "🗄️ Setting Up Databases"
    
    Print-Step "Starting Docker containers..."
    Push-Location database
    docker-compose down -v 2>$null
    docker-compose up -d
    Pop-Location
    
    Print-Success "Docker containers started"
    
    Print-Step "Waiting for databases to be ready (30 seconds)..."
    Start-Sleep -Seconds 30
    
    Print-Success "Databases should be ready"
}
else {
    Print-Warning "Skipping database setup"
}

# =============================================================================
# Prisma Setup
# =============================================================================

Print-Header "🔧 Setting Up Prisma (Auth Service)"

Push-Location backend-service\auth-service

Print-Step "Generating Prisma Client..."
npx prisma generate
Print-Success "Prisma Client generated"

Print-Step "Running Prisma migrations..."
try {
    npx prisma migrate deploy
}
catch {
    npx prisma migrate dev --name init
}
Print-Success "Prisma migrations completed"

Pop-Location

# =============================================================================
# Database Seeding
# =============================================================================

if (-not $SkipSeed) {
    Print-Header "🌱 Seeding Databases"
    
    Print-Step "Seeding Auth Service (PostgreSQL)..."
    Push-Location backend-service\auth-service
    node prisma\seed.js
    Pop-Location
    Print-Success "Auth service seeded"
    
    Print-Step "Starting auth service for cross-service seeding..."
    Push-Location backend-service\auth-service
    $AuthJob = Start-Job -ScriptBlock { node index.js }
    Pop-Location
    
    if (Wait-ForService "http://localhost:8001/health" 30) {
        Print-Success "Auth service is running"
        
        Print-Step "Seeding Teacher Service (MongoDB)..."
        Push-Location backend-service\teacher-service
        node src\config\seed.js
        Pop-Location
        Print-Success "Teacher service seeded"
        
        Print-Step "Seeding Student Service (MongoDB)..."
        Push-Location backend-service\student-service
        node src\config\seed.js
        Pop-Location
        Print-Success "Student service seeded"
        
        Print-Step "Stopping temporary auth service..."
        Stop-Job $AuthJob
        Remove-Job $AuthJob
        Print-Success "Auth service stopped"
    }
    else {
        Print-Error "Failed to start auth service for seeding"
        Stop-Job $AuthJob -ErrorAction SilentlyContinue
        Remove-Job $AuthJob -ErrorAction SilentlyContinue
    }
}
else {
    Print-Warning "Skipping database seeding"
}

# =============================================================================
# Final Summary
# =============================================================================

Print-Header "✅ Setup Complete!"

Write-Host "Your Evolve AI microservices are ready!" -ForegroundColor $Green
Write-Host ""
Write-Host "Database Services:" -ForegroundColor $Cyan
Write-Host "  • PostgreSQL:  localhost:5433"
Write-Host "  • MongoDB:     localhost:27019"
Write-Host "  • Redis:       localhost:6379"
Write-Host ""
Write-Host "Microservices:" -ForegroundColor $Cyan
Write-Host "  • API Gateway:         http://localhost:9001"
Write-Host "  • Auth Service:        http://localhost:8001"
Write-Host "  • Teacher Service:     http://localhost:9003"
Write-Host "  • Student Service:     http://localhost:9002"
Write-Host "  • Notification Service: http://localhost:9020"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor $Cyan
Write-Host "  1. Start all services:  " -NoNewline
Write-Host "pnpm start" -ForegroundColor $Yellow
Write-Host "  2. Or start individually:"
Write-Host "     cd backend-service\api-gateway; npm run dev" -ForegroundColor $Yellow
Write-Host ""
Write-Host "Health Checks:" -ForegroundColor $Cyan
Write-Host "  curl http://localhost:9001/health" -ForegroundColor $Yellow
Write-Host ""
Write-Host "Documentation:" -ForegroundColor $Cyan
Write-Host "  • Quick Start: cat QUICK_START_GUIDE.md" -ForegroundColor $Yellow
Write-Host "  • Improvements: cat README_IMPROVEMENTS.md" -ForegroundColor $Yellow
Write-Host ""

if ($Dev) {
    Print-Header "🚀 Starting Services (Dev Mode)"
    Print-Step "Starting all services..."
    pnpm start
}

Print-Success "Setup script completed successfully! 🎉"
