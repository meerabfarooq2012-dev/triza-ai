/**
 * Node.js-only mini-service launcher — loaded by instrumentation.ts
 *
 * Starts the chat and notification Socket.io services if their ports
 * are not already in use. This ensures they auto-start with the Next.js
 * server and avoids duplicate processes.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import net from 'node:net';

/** Check if a port is already in use */
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, '0.0.0.0');
  });
}

/** Spawn a mini-service if its port is not already in use */
async function spawnIfNotRunning(
  name: string,
  port: number,
  cwd: string,
  logPath: string
) {
  const inUse = await isPortInUse(port);
  if (inUse) {
    console.log(`[Instrumentation] ${name} already running on port ${port} — skipping`);
    return;
  }

  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  const proc = spawn('bun', ['--hot', 'index.ts'], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  proc.stdout?.on('data', (data: Buffer) => logStream.write(data));
  proc.stderr?.on('data', (data: Buffer) => logStream.write(data));
  proc.on('error', (err) => {
    logStream.write(`[Instrumentation] Failed to start ${name}: ${err.message}\n`);
  });
  proc.on('exit', (code, signal) => {
    logStream.write(`[Instrumentation] ${name} exited with code ${code}, signal ${signal}\n`);
  });

  console.log(`[Instrumentation] ${name} spawned (PID: ${proc.pid}, port ${port})`);

  const cleanup = () => {
    try { proc.kill('SIGTERM'); } catch { /* already exited */ }
    logStream.end();
  };
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

export function startMiniServices() {
  const projectRoot = process.cwd();

  spawnIfNotRunning(
    'Chat service',
    3003,
    path.join(projectRoot, 'mini-services', 'chat-service'),
    path.join(projectRoot, 'mini-services', 'chat-service', 'log.txt')
  );

  spawnIfNotRunning(
    'Notification service',
    3004,
    path.join(projectRoot, 'mini-services', 'notification-service'),
    path.join(projectRoot, 'mini-services', 'notification-service', 'log.txt')
  );
}
