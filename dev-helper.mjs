#!/usr/bin/env node
/**
 * =============================================================================
 * 🛠️ Evolve AI - Development Helper Script
 * =============================================================================
 * Provides convenient commands for common development tasks
 * Usage: node dev-helper.mjs <command>
 * =============================================================================
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(message) {
  console.log('');
  console.log(`${colors.blue}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset} ${message.padEnd(59)} ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
}

async function checkHealth(service) {
  return new Promise((resolve) => {
    const ports = {
      gateway: 9001,
      auth: 9001,  // Auth routes through gateway
      student: 9002,
      teacher: 9003,
      notification: 9004,
    };

    const port = ports[service];
    if (!port) {
      resolve({ service, status: 'unknown', message: 'Invalid service' });
      return;
    }

    http.get(`http://localhost:${port}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ service, status: 'healthy', port, message: data });
        } else {
          resolve({ service, status: 'unhealthy', port, message: `Status ${res.statusCode}` });
        }
      });
    }).on('error', (err) => {
      resolve({ service, status: 'down', port, message: err.message });
    });
  });
}

async function checkAllServices() {
  printHeader('🏥 Health Check - All Services');

  const services = ['gateway', 'auth', 'student', 'teacher', 'notification'];
  const results = await Promise.all(services.map(checkHealth));

  results.forEach(({ service, status, port, message }) => {
    const emoji = status === 'healthy' ? '✅' : status === 'unhealthy' ? '⚠️' : '❌';
    const color = status === 'healthy' ? 'green' : status === 'unhealthy' ? 'yellow' : 'red';
    print(`${emoji} ${service.padEnd(15)} [${port}] - ${status}`, color);
  });

  console.log('');
  const healthyCount = results.filter(r => r.status === 'healthy').length;
  print(`${healthyCount}/${services.length} services healthy`, healthyCount === services.length ? 'green' : 'yellow');
  console.log('');
}

async function checkDatabases() {
  printHeader('🗄️ Database Status');

  try {
    const { stdout } = await execAsync('docker ps --filter "name=evolve" --format "{{.Names}}\t{{.Status}}"');
    const containers = stdout.trim().split('\n');

    if (containers[0] === '') {
      print('❌ No database containers running', 'red');
      print('Run: pnpm db:up', 'yellow');
      return;
    }

    containers.forEach(line => {
      const [name, status] = line.split('\t');
      const emoji = status.includes('Up') ? '✅' : '❌';
      const color = status.includes('Up') ? 'green' : 'red';
      print(`${emoji} ${name.padEnd(20)} - ${status}`, color);
    });
  } catch (error) {
    print('❌ Error checking Docker containers', 'red');
    print('Is Docker running?', 'yellow');
  }
  console.log('');
}

async function viewLogs(service) {
  printHeader(`📋 Viewing Logs - ${service}`);

  const paths = {
    auth: 'backend-service/auth-service',
    teacher: 'backend-service/teacher-service',
    student: 'backend-service/student-service',
    gateway: 'backend-service/api-gateway',
    notification: 'backend-service/notification-service',
  };

  if (service === 'db' || service === 'databases') {
    print('Database logs:', 'cyan');
    print('PostgreSQL: docker logs evolve_postgres', 'yellow');
    print('MongoDB:    docker logs evolve_mongodb', 'yellow');
    print('Redis:      docker logs evolve_redis', 'yellow');
    return;
  }

  const path = paths[service];
  if (!path) {
    print(`❌ Unknown service: ${service}`, 'red');
    print('Available: auth, teacher, student, gateway, notification, databases', 'yellow');
    return;
  }

  print(`Starting ${service} service in dev mode...`, 'cyan');
  print('Press Ctrl+C to exit', 'yellow');
  console.log('');

  spawn('pnpm', ['run', 'dev'], {
    cwd: path,
    stdio: 'inherit',
    shell: true,
  });
}

async function killPort(port) {
  printHeader(`🔪 Killing Process on Port ${port}`);

  try {
    if (process.platform === 'win32') {
      // Windows
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');
      const pids = new Set();

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      });

      if (pids.size === 0) {
        print(`No process found on port ${port}`, 'yellow');
        return;
      }

      for (const pid of pids) {
        try {
          await execAsync(`taskkill /PID ${pid} /F`);
          print(`✅ Killed process ${pid}`, 'green');
        } catch (err) {
          print(`❌ Failed to kill process ${pid}`, 'red');
        }
      }
    } else {
      // Linux/Mac
      try {
        await execAsync(`lsof -ti:${port} | xargs kill -9`);
        print(`✅ Killed process on port ${port}`, 'green');
      } catch (err) {
        print(`No process found on port ${port}`, 'yellow');
      }
    }
  } catch (error) {
    print(`❌ Error: ${error.message}`, 'red');
  }
  console.log('');
}

async function resetDatabase() {
  printHeader('♻️ Resetting Databases');

  print('⚠️ This will delete all data!', 'yellow');
  print('Stopping containers...', 'cyan');

  try {
    await execAsync('docker-compose down -v', { cwd: 'database' });
    print('✅ Containers stopped', 'green');

    print('Starting fresh containers...', 'cyan');
    await execAsync('docker-compose up -d', { cwd: 'database' });
    print('✅ Containers started', 'green');

    print('Waiting for databases...', 'cyan');
    await new Promise(resolve => setTimeout(resolve, 10000));

    print('Running Prisma migrations...', 'cyan');
    await execAsync('npx prisma migrate deploy', { cwd: 'backend-service/auth-service' });
    print('✅ Migrations completed', 'green');

    print('\nDatabases reset successfully!', 'green');
    print('Run seeding: npm run seed:orchestrated', 'yellow');
  } catch (error) {
    print(`❌ Error: ${error.message}`, 'red');
  }
  console.log('');
}

async function showInfo() {
  printHeader('ℹ️ Evolve AI - Quick Reference');

  print('🚀 Start Commands:', 'cyan');
  console.log('  pnpm setup              - Complete setup');
  console.log('  pnpm dev:backend        - Start backend services');
  console.log('  pnpm dev:frontend       - Start frontend apps');
  console.log('  pnpm dev                - Start everything');
  console.log('');

  print('🗄️ Database Commands:', 'cyan');
  console.log('  pnpm db:up              - Start databases');
  console.log('  pnpm db:down            - Stop databases');
  console.log('  pnpm db:reset           - Reset databases');
  console.log('');

  print('🌱 Seeding Commands:', 'cyan');
  console.log('  pnpm seed:orchestrated  - Seed all databases');
  console.log('  pnpm seed:all           - Alternative seeding');
  console.log('');

  print('🔧 Prisma Commands:', 'cyan');
  console.log('  pnpm prisma:studio      - Open Prisma Studio');
  console.log('  pnpm prisma:migrate     - Run migrations');
  console.log('  pnpm prisma:generate    - Generate client');
  console.log('');

  print('🏥 Health & Monitoring:', 'cyan');
  console.log('  node dev-helper.mjs health - Check all services');
  console.log('  node dev-helper.mjs db     - Check databases');
  console.log('  pnpm health             - Health via curl');
  console.log('');

  print('📊 Service URLs:', 'cyan');
  console.log('  API Gateway:    http://localhost:9001');
  console.log('  Auth Routes:    http://localhost:9001/auth');
  console.log('  Student:        http://localhost:9002');
  console.log('  Teacher:        http://localhost:9003');
  console.log('  Notification:   http://localhost:9004');
  console.log('');

  print('🔑 Default Login:', 'cyan');
  console.log('  Admin:    admin@example.com / admin123');
  console.log('  Teacher:  teacher1@example.com / teacher123');
  console.log('  Student:  student1@example.com / student123');
  console.log('');
}

// Command router
async function main() {
  const command = process.argv[2];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showInfo();
    return;
  }

  switch (command) {
    case 'health':
    case 'status':
      await checkAllServices();
      break;

    case 'db':
    case 'databases':
      await checkDatabases();
      break;

    case 'logs':
      const service = process.argv[3];
      if (!service) {
        print('Usage: node dev-helper.mjs logs <service>', 'yellow');
        print('Services: auth, teacher, student, gateway, notification, databases', 'cyan');
        return;
      }
      await viewLogs(service);
      break;

    case 'kill':
      const port = process.argv[3];
      if (!port) {
        print('Usage: node dev-helper.mjs kill <port>', 'yellow');
        print('Example: node dev-helper.mjs kill 9001', 'cyan');
        return;
      }
      await killPort(port);
      break;

    case 'reset':
    case 'reset-db':
      await resetDatabase();
      break;

    case 'info':
      await showInfo();
      break;

    default:
      print(`❌ Unknown command: ${command}`, 'red');
      print('Available commands: health, db, logs, kill, reset, info', 'yellow');
      print('Run: node dev-helper.mjs help', 'cyan');
  }
}

main().catch(console.error);
