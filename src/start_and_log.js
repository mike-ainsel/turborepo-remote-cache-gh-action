import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'url';
import { logFile } from './logs.js';
import { logger } from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

logger.info('Starting Cache Server Process...');

const subprocess = spawn(
  process.execPath,  // Use the current Node.js executable path
  [resolve(__dirname, '..', 'server', 'index.cjs')],
  { stdio: 'pipe' },
);

// Handle spawn errors
subprocess.on('error', (err) => {
  logger.error('Failed to start server process', { error: err.message });
  process.exit(1);
});

// Handle process exit
subprocess.on('exit', (code) => {
  if (code !== 0) {
    logger.error('Server process exited with non-zero code', { code });
    process.exit(code);
  }
});

// Pipe output to log files
subprocess.stdout.pipe(createWriteStream(logFile('out')));
subprocess.stderr.pipe(createWriteStream(logFile('err')));

// Handle cleanup on parent process termination
process.on('SIGTERM', () => {
  if (subprocess.pid) {
    logger.info('Shutting down server process', { pid: subprocess.pid });
    process.kill(subprocess.pid);
  }
  process.exit(0);
});