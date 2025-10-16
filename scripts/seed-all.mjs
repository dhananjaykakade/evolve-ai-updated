import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const ROOT = process.cwd();
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:9001';

function runCmd(command, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...opts });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function startCmd(command, args = [], opts = {}) {
  const child = spawn(command, args, { stdio: 'inherit', shell: true, ...opts });
  return child;
}

async function waitForHttp(url, timeoutMs = 60000, intervalMs = 1500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch (e) {
      // ignore and retry
    }
    await wait(intervalMs);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function main() {
  console.log('🔧 Bringing up databases...');
  await runCmd('pnpm', ['run', 'db:up'], { cwd: ROOT });

  // console.log('🧭 Running Prisma migrate for auth-service...');
  // await runCmd('pnpm', ['--filter', 'auth-service', 'migrate'], { cwd: ROOT });

  console.log('🌱 Seeding auth-service (Postgres)...');
  await runCmd('pnpm', ['--filter', 'auth-service', 'seed'], { cwd: ROOT });

  console.log('🚀 Starting auth-service (needed for /subjects)...');
  const authProc = startCmd('pnpm', ['--filter', 'auth-service', 'start'], { cwd: ROOT });

  try {
    console.log('⏳ Waiting for auth-service readiness...');
    await waitForHttp(`${AUTH_URL}/ready`, 60000, 1500);
    // Extra ping to /subjects to ensure Prisma is reachable
    await waitForHttp(`${AUTH_URL}/subjects`, 60000, 1500);

    console.log('📝 Seeding teacher-service assignments...');
    await runCmd('pnpm', ['--filter', 'teacher-service', 'seed'], { cwd: ROOT });

    console.log('📝 Seeding teacher-service MCQ tests...');
    await runCmd('node', ['backend-service/teacher-service/src/config/testSeed.js'], { cwd: ROOT });

    console.log('📝 Seeding teacher-service coding tests...');
    await runCmd('node', ['backend-service/teacher-service/src/config/codingTestSeed.js'], { cwd: ROOT });

    console.log('📝 Seeding student-service assignments...');
    await runCmd('pnpm', ['--filter', 'student-service', 'seed'], { cwd: ROOT });

    console.log('🎉 All seeds completed successfully.');
  } catch (err) {
    console.error('❌ Seed orchestration failed:', err);
    process.exitCode = 1;
  } finally {
    if (authProc && !authProc.killed) {
      console.log('🛑 Stopping auth-service...');
      try { authProc.kill('SIGINT'); } catch {}
    }
  }
}

main().catch((e) => {
  console.error('❌ Unexpected error in seed orchestration:', e);
  process.exit(1);
});
