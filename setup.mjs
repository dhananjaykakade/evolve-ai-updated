#!/usr/bin/env node
/**
 * =============================================================================
 * 🚀 Evolve AI - Complete Setup Script (Node.js - Cross-platform)
 * =============================================================================
 * This script sets up all microservices, databases, and seeds data
 * Usage: node setup.js [options]
 * Options:
 *   --skip-db      Skip database setup
 *   --skip-install Skip npm install
 *   --skip-seed    Skip database seeding
 *   --dev          Development mode (keeps services running)
 * =============================================================================
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  skipDb: args.includes('--skip-db'),
  skipInstall: args.includes('--skip-install'),
  skipSeed: args.includes('--skip-seed'),
  dev: args.includes('--dev'),
};

// =============================================================================
// Helper Functions
// =============================================================================

function printHeader(message) {
  console.log('');
  console.log(`${colors.blue}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset} ${message}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
}

function printStep(message) {
  console.log(`${colors.cyan}▶${colors.reset} ${message}`);
}

function printSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function printError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

async function checkCommand(command) {
  try {
    await execAsync(`${command} --version`);
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [], {
      cwd,
      shell: true,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}: ${command}`));
    });

    child.on('error', reject);
  });
}

function waitForService(url, maxAttempts = 30) {
  return new Promise((resolve) => {
    let attempts = 0;

    const check = () => {
      if (attempts >= maxAttempts) {
        resolve(false);
        return;
      }

      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          attempts++;
          process.stdout.write('.');
          setTimeout(check, 2000);
        }
      }).on('error', () => {
        attempts++;
        process.stdout.write('.');
        setTimeout(check, 2000);
      });
    };

    check();
  });
}

function createEnvFile(filePath, content) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, content.trim() + '\n', 'utf8');
}

// =============================================================================
// Main Setup Process
// =============================================================================

async function main() {
  try {
    // Pre-flight checks
    printHeader('🔍 Pre-flight Checks');

    printStep('Checking required tools...');
    
    if (!(await checkCommand('node'))) {
      printError('Node.js is not installed');
      process.exit(1);
    }
    
    if (!(await checkCommand('pnpm'))) {
      printWarning('pnpm not found. Installing...');
      await runCommand('npm install -g pnpm');
      printSuccess('pnpm installed');
    }
    
    if (!(await checkCommand('docker'))) {
      printError('Docker is not installed');
      process.exit(1);
    }

    const { stdout: nodeVersion } = await execAsync('node --version');
    const { stdout: pnpmVersion } = await execAsync('pnpm --version');
    printSuccess(`Node version: ${nodeVersion.trim()}`);
    printSuccess(`pnpm version: ${pnpmVersion.trim()}`)

    // Environment Files Setup
    printHeader('📄 Setting Up Environment Files');

    const envFiles = [
      {
        path: join(__dirname, 'database', '.env'),
        content: `
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
        `,
      },
      {
        path: join(__dirname, 'backend-service', 'auth-service', '.env'),
        content: `
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
PORT=9001

# Service URLs
AUTH_SERVICE_URL="http://localhost:9001"
STUDENT_SERVICE_URL="http://localhost:9002"
TEACHER_SERVICE_URL="http://localhost:9003"

# Cloudinary (Optional)
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
        `,
      },
      {
        path: join(__dirname, 'backend-service', 'teacher-service', '.env'),
        content: `
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_teacher"

# Service Port
PORT=9003

# Service URLs
AUTH_SERVICE_URL="http://localhost:9001"
STUDENT_SERVICE_URL="http://localhost:9002"

# JWT Secret (should match auth service)
JWT_SECRET="evolve-ai-super-secret-jwt-key-change-in-production"
        `,
      },
      {
        path: join(__dirname, 'backend-service', 'student-service', '.env'),
        content: `
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_student"

# Service Port
PORT=9002

# Service URLs
AUTH_SERVICE_URL="http://localhost:9001"
TEACHER_SERVICE_URL="http://localhost:9003"

# JWT Secret (should match auth service)
JWT_SECRET="evolve-ai-super-secret-jwt-key-change-in-production"
        `,
      },
      {
        path: join(__dirname, 'backend-service', 'api-gateway', '.env'),
        content: `
# Gateway Port
PORT=9001

# Service URLs
AUTH_SERVICE_URL="http://localhost:9001"
TEACHER_SERVICE_URL="http://localhost:9003"
STUDENT_SERVICE_URL="http://localhost:9002"
NOTIFICATION_SERVICE_URL="http://localhost:9004"
GRADING_SERVICE_URL="http://localhost:9006"
EXAM_SERVICE_URL="http://localhost:9005"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:5174"

# Rate Limiting
RATE_LIMIT_MAX=1000

NODE_ENV=development
        `,
      },
      {
        path: join(__dirname, 'backend-service', 'notification-service', '.env'),
        content: `
# MongoDB
MONGO_URI="mongodb://localhost:27019/evolve_notifications"

# Service Port
PORT=9004

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:5174"
        `,
      },
    ];

    for (const { path, content } of envFiles) {
      if (!existsSync(path)) {
        printStep(`Creating ${path}...`);
        createEnvFile(path, content);
        printSuccess(`Created ${path}`);
      } else {
        printWarning(`${path} already exists, skipping`);
      }
    }

    // Install Dependencies
    if (!options.skipInstall) {
      printHeader('📦 Installing Dependencies');

      printStep('Installing root dependencies...');
      await runCommand('pnpm install');
      printSuccess('Root dependencies installed');

      printStep('Installing shared package dependencies...');
      await runCommand('pnpm install', join(__dirname, 'shared'));
      printSuccess('Shared package dependencies installed');

      printStep('Installing service dependencies...');
      await runCommand('pnpm install --filter auth-service');
      await runCommand('pnpm install --filter teacher-service');
      await runCommand('pnpm install --filter student-service');
      await runCommand('pnpm install --filter api-gateway');
      await runCommand('pnpm install --filter notification-service');
      printSuccess('Service dependencies installed');
    } else {
      printWarning('Skipping dependency installation');
    }

    // Database Setup
    if (!options.skipDb) {
      printHeader('🗄️ Setting Up Databases');

      printStep('Starting Docker containers...');
      const dbPath = join(__dirname, 'database');
      try {
        await execAsync('docker-compose down -v', { cwd: dbPath });
      } catch {
        // Ignore error if containers don't exist
      }
      await runCommand('docker-compose up -d', dbPath);
      printSuccess('Docker containers started');

      printStep('Waiting for databases to be ready (30 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      printSuccess('Databases should be ready');
    } else {
      printWarning('Skipping database setup');
    }

    // Prisma Setup
    printHeader('🔧 Setting Up Prisma (Auth Service)');

    const authServicePath = join(__dirname, 'backend-service', 'auth-service');

    printStep('Generating Prisma Client...');
    await runCommand('npx prisma generate', authServicePath);
    printSuccess('Prisma Client generated');

    printStep('Running Prisma migrations...');
    try {
      await runCommand('npx prisma migrate deploy', authServicePath);
    } catch {
      await runCommand('npx prisma migrate dev --name init', authServicePath);
    }
    printSuccess('Prisma migrations completed');

    // Database Seeding
    if (!options.skipSeed) {
      printHeader('🌱 Seeding Databases');

      printStep('Seeding Auth Service (PostgreSQL)...');
      await runCommand('node prisma/seed.js', authServicePath);
      printSuccess('Auth service seeded');

      printStep('Starting auth service for cross-service seeding...');
      const authProcess = spawn('pnpm', ['start'], {
        cwd: authServicePath,
        stdio: 'ignore',
        detached: true,
      });

      printStep('Waiting for auth service...');
      const authReady = await waitForService('http://localhost:9001/health', 30);

      if (authReady) {
        console.log('');
        printSuccess('Auth service is running');

        printStep('Seeding Teacher Service (MongoDB)...');
        await runCommand('node src/config/seed.js', join(__dirname, 'backend-service', 'teacher-service'));
        printSuccess('Teacher service seeded');

        printStep('Seeding Student Service (MongoDB)...');
        await runCommand('node src/config/seed.js', join(__dirname, 'backend-service', 'student-service'));
        printSuccess('Student service seeded');

        printStep('Stopping temporary auth service...');
        process.kill(-authProcess.pid);
        printSuccess('Auth service stopped');
      } else {
        console.log('');
        printError('Failed to start auth service for seeding');
        process.kill(-authProcess.pid);
      }
    } else {
      printWarning('Skipping database seeding');
    }

    // Final Summary
    printHeader('✅ Setup Complete!');

    console.log(`${colors.green}Your Evolve AI microservices are ready!${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Database Services:${colors.reset}`);
    console.log('  • PostgreSQL:  localhost:5433');
    console.log('  • MongoDB:     localhost:27019');
    console.log('  • Redis:       localhost:6379');
    console.log('');
    console.log(`${colors.cyan}Microservices:${colors.reset}`);
    console.log('  • API Gateway:          http://localhost:9001');
    console.log('  • Auth Routes:          http://localhost:9001/auth');
    console.log('  • Teacher Service:      http://localhost:9003');
    console.log('  • Student Service:      http://localhost:9002');
    console.log('  • Notification Service: http://localhost:9004');
    console.log('');
    console.log(`${colors.cyan}Next Steps:${colors.reset}`);
    console.log(`  1. Start all services:  ${colors.yellow}pnpm start${colors.reset}`);
    console.log('  2. Or start individually:');
    console.log(`     ${colors.yellow}cd backend-service/api-gateway && pnpm run dev${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Health Checks:${colors.reset}`);
    console.log(`  ${colors.yellow}curl http://localhost:9001/health${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Documentation:${colors.reset}`);
    console.log(`  • Quick Start: ${colors.yellow}cat QUICK_START_GUIDE.md${colors.reset}`);
    console.log(`  • Improvements: ${colors.yellow}cat README_IMPROVEMENTS.md${colors.reset}`);
    console.log('');

    if (options.dev) {
      printHeader('🚀 Starting Services (Dev Mode)');
      printStep('Starting all services...');
      await runCommand('pnpm start');
    }

    printSuccess('Setup script completed successfully! 🎉');
  } catch (error) {
    printError(`Setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run main function
main();
