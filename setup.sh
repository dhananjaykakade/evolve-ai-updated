#!/bin/bash
# =============================================================================
# 🚀 Evolve AI - Complete Setup Script
# =============================================================================
# This script sets up all microservices, databases, and seeds data
# Usage: ./setup.sh [options]
# Options:
#   --skip-db      Skip database setup
#   --skip-install Skip npm install
#   --skip-seed    Skip database seeding
#   --dev          Development mode (keeps services running)
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flags
SKIP_DB=false
SKIP_INSTALL=false
SKIP_SEED=false
DEV_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-db)
      SKIP_DB=true
      shift
      ;;
    --skip-install)
      SKIP_INSTALL=true
      shift
      ;;
    --skip-seed)
      SKIP_SEED=true
      shift
      ;;
    --dev)
      DEV_MODE=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: ./setup.sh [--skip-db] [--skip-install] [--skip-seed] [--dev]"
      exit 1
      ;;
  esac
done

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC} $1"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

print_step() {
  echo -e "${CYAN}▶${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

check_command() {
  if ! command -v $1 &> /dev/null; then
    print_error "$1 is not installed. Please install it first."
    exit 1
  fi
}

wait_for_service() {
  local url=$1
  local max_attempts=${2:-30}
  local attempt=0
  
  print_step "Waiting for $url to be ready..."
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -s -f "$url" > /dev/null 2>&1; then
      print_success "Service is ready!"
      return 0
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
  done
  
  echo ""
  print_error "Service did not start in time"
  return 1
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

print_header "🔍 Pre-flight Checks"

print_step "Checking required tools..."
check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose"

print_success "Node version: $(node --version)"
print_success "NPM version: $(npm --version)"
print_success "Docker version: $(docker --version | head -n 1)"

# Check if pnpm is installed, install if not
if ! command -v pnpm &> /dev/null; then
  print_warning "pnpm not found. Installing..."
  npm install -g pnpm
  print_success "pnpm installed"
else
  print_success "pnpm version: $(pnpm --version)"
fi

# =============================================================================
# Environment Files Setup
# =============================================================================

print_header "📄 Setting Up Environment Files"

# Database .env
if [ ! -f "database/.env" ]; then
  print_step "Creating database/.env from template..."
  cat > database/.env << 'EOF'
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
EOF
  print_success "Created database/.env"
else
  print_warning "database/.env already exists, skipping"
fi

# Auth Service .env
if [ ! -f "backend-service/auth-service/.env" ]; then
  print_step "Creating auth-service/.env..."
  cat > backend-service/auth-service/.env << 'EOF'
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
EOF
  print_success "Created auth-service/.env"
else
  print_warning "auth-service/.env already exists, skipping"
fi

# Teacher Service .env
if [ ! -f "backend-service/teacher-service/.env" ]; then
  print_step "Creating teacher-service/.env..."
  cat > backend-service/teacher-service/.env << 'EOF'
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_teacher"

# Service Port
PORT=9003

# Service URLs
AUTH_SERVICE_URL="http://localhost:8001"
STUDENT_SERVICE_URL="http://localhost:9002"

# JWT Secret (should match auth service)
JWT_SECRET="evolve-ai-super-secret-jwt-key-change-in-production"
EOF
  print_success "Created teacher-service/.env"
else
  print_warning "teacher-service/.env already exists, skipping"
fi

# Student Service .env
if [ ! -f "backend-service/student-service/.env" ]; then
  print_step "Creating student-service/.env..."
  cat > backend-service/student-service/.env << 'EOF'
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_student"

# Service Port
PORT=9002

# Service URLs
AUTH_SERVICE_URL="http://localhost:8001"
TEACHER_SERVICE_URL="http://localhost:9003"

# JWT Secret (should match auth service)
JWT_SECRET="evolve-ai-super-secret-jwt-key-change-in-production"
EOF
  print_success "Created student-service/.env"
else
  print_warning "student-service/.env already exists, skipping"
fi

# API Gateway .env
if [ ! -f "backend-service/api-gateway/.env" ]; then
  print_step "Creating api-gateway/.env..."
  cat > backend-service/api-gateway/.env << 'EOF'
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
EOF
  print_success "Created api-gateway/.env"
else
  print_warning "api-gateway/.env already exists, skipping"
fi

# Notification Service .env
if [ ! -f "backend-service/notification-service/.env" ]; then
  print_step "Creating notification-service/.env..."
  cat > backend-service/notification-service/.env << 'EOF'
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_notifications"

# Service Port
PORT=9020

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:5174"
EOF
  print_success "Created notification-service/.env"
else
  print_warning "notification-service/.env already exists, skipping"
fi

# =============================================================================
# Install Dependencies
# =============================================================================

if [ "$SKIP_INSTALL" = false ]; then
  print_header "📦 Installing Dependencies"
  
  # Install root dependencies
  print_step "Installing root dependencies..."
  pnpm install
  print_success "Root dependencies installed"
  
  # Install shared package dependencies
  print_step "Installing shared package dependencies..."
  cd shared && pnpm install && cd ..
  print_success "Shared package dependencies installed"
  
  # Install service dependencies
  print_step "Installing service dependencies..."
  pnpm install --filter auth-service
  pnpm install --filter teacher-service
  pnpm install --filter student-service
  pnpm install --filter api-gateway
  pnpm install --filter notification-service
  print_success "Service dependencies installed"
else
  print_warning "Skipping dependency installation"
fi

# =============================================================================
# Database Setup
# =============================================================================

if [ "$SKIP_DB" = false ]; then
  print_header "🗄️ Setting Up Databases"
  
  print_step "Starting Docker containers..."
  cd database
  docker-compose down -v 2>/dev/null || true
  docker-compose up -d
  cd ..
  
  print_success "Docker containers started"
  
  print_step "Waiting for databases to be ready..."
  sleep 10
  
  # Check PostgreSQL
  print_step "Checking PostgreSQL..."
  until docker exec evolve_postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo -n "."
    sleep 2
  done
  print_success "PostgreSQL is ready"
  
  # Check MongoDB
  print_step "Checking MongoDB..."
  until docker exec evolve_mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    echo -n "."
    sleep 2
  done
  print_success "MongoDB is ready"
  
  # Check Redis
  print_step "Checking Redis..."
  until docker exec evolve_redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 2
  done
  print_success "Redis is ready"
  
else
  print_warning "Skipping database setup"
fi

# =============================================================================
# Prisma Setup
# =============================================================================

print_header "🔧 Setting Up Prisma (Auth Service)"

cd backend-service/auth-service

print_step "Generating Prisma Client..."
npx prisma generate
print_success "Prisma Client generated"

print_step "Running Prisma migrations..."
npx prisma migrate deploy || npx prisma migrate dev --name init
print_success "Prisma migrations completed"

cd ../..

# =============================================================================
# Database Seeding
# =============================================================================

if [ "$SKIP_SEED" = false ]; then
  print_header "🌱 Seeding Databases"
  
  print_step "Seeding Auth Service (PostgreSQL)..."
  cd backend-service/auth-service
  node prisma/seed.js || npm run seed
  cd ../..
  print_success "Auth service seeded"
  
  # Start auth service temporarily for cross-service seeding
  print_step "Starting auth service for cross-service seeding..."
  cd backend-service/auth-service
  node index.js > /tmp/auth-service.log 2>&1 &
  AUTH_PID=$!
  cd ../..
  
  # Wait for auth service
  if wait_for_service "http://localhost:8001/health" 30; then
    print_success "Auth service is running"
    
    print_step "Seeding Teacher Service (MongoDB)..."
    cd backend-service/teacher-service
    node src/config/seed.js || npm run seed
    cd ../..
    print_success "Teacher service seeded"
    
    print_step "Seeding Student Service (MongoDB)..."
    cd backend-service/student-service
    node src/config/seed.js || npm run seed
    cd ../..
    print_success "Student service seeded"
    
    # Kill auth service
    print_step "Stopping temporary auth service..."
    kill $AUTH_PID 2>/dev/null || true
    wait $AUTH_PID 2>/dev/null || true
    print_success "Auth service stopped"
  else
    print_error "Failed to start auth service for seeding"
    kill $AUTH_PID 2>/dev/null || true
  fi
  
else
  print_warning "Skipping database seeding"
fi

# =============================================================================
# Final Summary
# =============================================================================

print_header "✅ Setup Complete!"

echo -e "${GREEN}Your Evolve AI microservices are ready!${NC}"
echo ""
echo -e "${CYAN}Database Services:${NC}"
echo "  • PostgreSQL:  localhost:5433"
echo "  • MongoDB:     localhost:27019"
echo "  • Redis:       localhost:6379"
echo ""
echo -e "${CYAN}Microservices:${NC}"
echo "  • API Gateway:         http://localhost:9001"
echo "  • Auth Service:        http://localhost:8001"
echo "  • Teacher Service:     http://localhost:9003"
echo "  • Student Service:     http://localhost:9002"
echo "  • Notification Service: http://localhost:9020"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Start all services:  ${YELLOW}pnpm start${NC}"
echo "  2. Or start individually:"
echo "     ${YELLOW}cd backend-service/api-gateway && npm run dev${NC}"
echo "     ${YELLOW}cd backend-service/auth-service && npm run dev${NC}"
echo "     ${YELLOW}cd backend-service/teacher-service && npm run dev${NC}"
echo "     ${YELLOW}cd backend-service/student-service && npm run dev${NC}"
echo ""
echo -e "${CYAN}Health Checks:${NC}"
echo "  ${YELLOW}curl http://localhost:9001/health${NC}"
echo ""
echo -e "${CYAN}Documentation:${NC}"
echo "  • Quick Start: ${YELLOW}cat QUICK_START_GUIDE.md${NC}"
echo "  • Improvements: ${YELLOW}cat README_IMPROVEMENTS.md${NC}"
echo ""

if [ "$DEV_MODE" = true ]; then
  print_header "🚀 Starting Services (Dev Mode)"
  
  print_step "Starting all services..."
  pnpm start
fi

print_success "Setup script completed successfully! 🎉"
