/* eslint-disable @typescript-eslint/no-require-imports */
// Spawner script - starts Next.js as a detached process
const { spawn } = require('child_process');
const fs = require('fs');

const log = fs.openSync('/home/z/my-project/dev.log', 'a');

const child = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000'], {
  cwd: '/home/z/my-project',
  detached: true,
  stdio: ['ignore', log, log],
  env: { ...process.env, NODE_ENV: 'development' }
});

child.unref();

console.log(`Spawned Next.js dev server with PID: ${child.pid}`);
process.exit(0);
