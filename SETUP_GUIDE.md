# 🚀 Evolve AI - Complete Setup Guide

This guide will help you set up the entire Evolve AI microservices platform with a single command.

## 📋 Prerequisites

Before running the setup, ensure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **pnpm** v8+ ([Install](https://pnpm.io/installation): `npm install -g pnpm`)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (for version control)

### Note
- If pnpm is not installed, the setup script will auto-install it for you
- **PostgreSQL Client** (psql) for manual database access
- **MongoDB Compass** for MongoDB GUI

## 🎯 Quick Start

### Option 1: Cross-Platform Node.js Setup (Recommended)

```bash
# Complete setup with one command
pnpm setup

# Or run directly
node setup.mjs
```

### Option 2: Platform-Specific Scripts

#### Linux/Mac (Bash)
```bash
chmod +x setup.sh
./setup.sh
```

#### Windows (PowerShell)
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

## 📦 Setup Script Options

The Node.js setup script (`setup.mjs`) supports several options:

```bash
# Full setup (default)
pnpm setup

# Quick setup (skip dependency installation)
pnpm setup:quick
node setup.mjs --skip-install

# Setup without seeding
pnpm setup:no-seed
node setup.mjs --skip-seed

# Setup and start services in dev mode
pnpm setup:dev
node setup.mjs --dev

# Skip database setup (if already running)
node setup.mjs --skip-db

# Combine multiple options
node setup.mjs --skip-install --skip-seed
```

## 🔧 What the Setup Does

The setup script performs the following steps:

### 1️⃣ Pre-flight Checks
- ✅ Verifies Node.js installation
- ✅ Verifies pnpm installation (installs if missing)
- ✅ Verifies Docker installation
- ✅ Displays version information

### 2️⃣ Environment Configuration
Creates `.env` files for all services with sensible defaults:

- `database/.env` - Database configuration
- `backend-service/auth-service/.env` - Auth service config
- `backend-service/teacher-service/.env` - Teacher service config
- `backend-service/student-service/.env` - Student service config
- `backend-service/api-gateway/.env` - API Gateway config
- `backend-service/notification-service/.env` - Notification service config

### 3️⃣ Dependency Installation
- Installs root project dependencies
- Installs shared package dependencies
- Installs all microservice dependencies using pnpm workspaces

### 4️⃣ Database Setup
Starts Docker containers for:
- **PostgreSQL** (port 5433)
- **MongoDB** (port 27019)
- **Redis** (port 6379)

### 5️⃣ Prisma Setup (Auth Service)
- Generates Prisma Client
- Runs database migrations
- Creates database schema

### 6️⃣ Database Seeding
Seeds all databases with initial data:

**Auth Service (PostgreSQL):**
- 1 Admin user (`admin@example.com` / `admin123`)
- 5 Teacher users (`teacher1@example.com` - `teacher5@example.com` / `teacher123`)
- 10 Student users (`student1@example.com` - `student10@example.com` / `student123`)
- Sample subjects and courses

**Teacher Service (MongoDB):**
- Teacher profiles linked to auth service
- Course assignments

**Student Service (MongoDB):**
- Student profiles linked to auth service
- Course enrollments

## 📊 Service Ports

After setup, services are available on:

| Service | URL | Port |
|---------|-----|------|
| API Gateway | http://localhost:9001 | 9001 |
| Auth Routes | http://localhost:9001/auth | 9001 |
| Student Service | http://localhost:9002 | 9002 |
| Teacher Service | http://localhost:9003 | 9003 |
| Notification Service | http://localhost:9004 | 9004 |

### Database Ports

| Database | URL | Port |
|----------|-----|------|
| PostgreSQL | postgresql://localhost:5433/evolve | 5433 |
| MongoDB | mongodb://localhost:27019 | 27019 |
| Redis | redis://localhost:6379 | 6379 |

## 🎮 Post-Setup Commands

### Starting Services

```bash
# Start all backend services
pnpm start

# Or start with auto-reload (development)
pnpm dev:backend

# Start only API Gateway
pnpm start:gateway

# Start all services except gateway
pnpm start:services

# Start all services + frontends
pnpm dev
```

### Database Management

```bash
# Start databases
pnpm db:up

# Stop databases
pnpm db:down

# Reset databases (removes all data)
pnpm db:reset
```

### Prisma Commands

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Open Prisma Studio (Database GUI)
pnpm prisma:studio
```

### Seeding

```bash
# Seed all databases (orchestrated)
pnpm seed:orchestrated

# Seed individual services
pnpm seed:all
```

### Health Checks

```bash
# Check all services health
pnpm status

# Or manually
curl http://localhost:9001/health
curl http://localhost:8001/health
curl http://localhost:9002/health
curl http://localhost:9003/health
```

### View Quick Reference

```bash
# Show all available commands
pnpm run info
node dev-helper.mjs info
```

## 🔑 Default Credentials

After seeding, you can login with these credentials:

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`

### Teacher Accounts
- Email: `teacher1@example.com` to `teacher5@example.com`
- Password: `teacher123`

### Student Accounts
- Email: `student1@example.com` to `student10@example.com`
- Password: `student123`

## 🐛 Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Kill specific port (Windows)
netstat -ano | findstr :9001
taskkill /PID <PID> /F

# Kill specific port (Linux/Mac)
lsof -ti:9001 | xargs kill -9

# Or use the kill-port package
npx kill-port 9001
```

### Docker Not Running

```bash
# Check Docker status
docker --version
docker ps

# Start Docker Desktop manually if needed
```

### Database Connection Issues

```bash
# Check if containers are running
docker ps

# View container logs
docker logs evolve_postgres
docker logs evolve_mongodb
docker logs evolve_redis

# Restart containers
pnpm db:down
pnpm db:up
```

### Prisma Migration Errors

```bash
# Reset Prisma migrations
cd backend-service/auth-service
npx prisma migrate reset --force

# Or delete and recreate
npx prisma migrate dev --name init
```

### Permission Denied (Linux/Mac)

```bash
# Make scripts executable
chmod +x setup.sh
chmod +x setup.mjs

# Or run with explicit interpreter
bash setup.sh
node setup.mjs
```

### Seeding Fails

```bash
# Check if gateway is running (auth routes through it)
curl http://localhost:9001/health

# View API Gateway logs (handles auth routes)
cd backend-service/api-gateway
pnpm dev

# Manually seed one service at a time
cd backend-service/auth-service
node prisma/seed.js

cd ../teacher-service
node src/config/seed.js

cd ../student-service
node src/config/seed.js
```

## 🔄 Resetting Everything

If you want to start fresh:

```bash
# Stop all services
pnpm db:down

# Remove all node_modules
rm -rf node_modules
rm -rf backend-service/*/node_modules
rm -rf Evolve-*/node_modules

# Remove all .env files
rm -f database/.env
rm -f backend-service/*/.env

# Run setup again
pnpm setup
```

## 📚 Next Steps

After successful setup:

1. **Read the Documentation**
   - `QUICK_START_GUIDE.md` - Implementation guide
   - `MICROSERVICES_IMPROVEMENT_PLAN.md` - Architecture overview
   - `IMPLEMENTATION_SUMMARY.md` - Feature summary
   - `README_IMPROVEMENTS.md` - Quick wins

2. **Explore the Shared Libraries**
   - `shared/README.md` - Shared utilities documentation
   - `shared/http-client.js` - Resilient HTTP client
   - `shared/cache-service.js` - Redis caching layer
   - `shared/middleware/` - Reusable middleware

3. **Start Development**
   ```bash
   # Start backend with auto-reload
   pnpm dev:backend
   
   # In another terminal, start frontends
   pnpm dev:frontend
   ```

4. **Test the APIs**
   - Import `postman-collection.json` (if available)
   - Test endpoints via API Gateway: `http://localhost:9001`
   - Check health: `http://localhost:9001/health`

5. **Monitor Services**
   - Check logs in terminal
   - Use Prisma Studio: `pnpm prisma:studio`
   - Access pgAdmin (if enabled): `http://localhost:8080`

## 🎉 Success Indicators

Your setup is successful when:

- ✅ All services return `200 OK` on health checks
- ✅ You can login with default credentials
- ✅ No error messages in console
- ✅ Databases contain seed data
- ✅ API Gateway routes requests correctly

## 💡 Tips

1. **Use the Node.js setup script** (`setup.mjs`) - it's cross-platform and has better error handling
2. **Keep Docker Desktop running** - databases need it
3. **Check health endpoints** before testing APIs
4. **Use the shared libraries** for new services
5. **Follow the improvement plan** for production deployment

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Check Docker container logs: `docker logs <container-name>`
4. Verify environment variables in `.env` files
5. Ensure all ports are available (9001-9020, 5433, 27019, 6379)

## 📝 Script Comparison

| Feature | setup.mjs | setup.sh | setup.ps1 |
|---------|-----------|----------|-----------|
| Platform | Cross-platform | Linux/Mac | Windows |
| Language | Node.js | Bash | PowerShell |
| Options | `--skip-db`, `--skip-install`, `--skip-seed`, `--dev` | None | None |
| Colors | ✅ | ✅ | ✅ |
| Error Handling | ✅ Advanced | ✅ Basic | ✅ Basic |
| Health Checks | ✅ | ✅ | ✅ |
| Recommended | ✅ Yes | For Linux/Mac only | For Windows only |

---

## 🚀 Ready to Go!

Once setup is complete, you have a fully functional microservices platform with:

- ✅ 6+ microservices
- ✅ 3 databases (PostgreSQL, MongoDB, Redis)
- ✅ API Gateway with routing
- ✅ Authentication & authorization
- ✅ Sample data
- ✅ Development & production configurations
- ✅ Shared libraries for consistency
- ✅ Comprehensive documentation

**Happy coding! 🎊**
