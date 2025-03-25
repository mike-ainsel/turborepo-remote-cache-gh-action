import {
  exportVariable,
  saveState,
  setFailed,
} from '@actions/core';
import getFreePort from 'get-port';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { waitUntilUsedOnHost } from 'tcp-port-used';
import { fileURLToPath } from 'url';
import { indentMultiline } from './indentMultiline.js';
import { host, port, storagePath, storageProvider, teamId, token } from './inputs.js';
import { readLog } from './logs.js';
import { pidIsRunning } from './pidIsRunning.js';
import { logger } from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function validateEnv() {
  const required = ['STORAGE_PROVIDER', 'STORAGE_PATH', 'HOST'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error('Failed to start server', { error });
    setFailed(error);
    process.exit(1);
  }
}

async function getPort() {
  if (port) {
    if (port < 0 || port > 65535) {
      const error = `Invalid port number: ${port}`;
      logger.error('Failed to start server', { error });
      setFailed(error);
      process.exit(1);
    }
    logger.debug('Using specified port', { port });
    return port;
  }

  logger.debug('Getting available port...');
  const freePort = await getFreePort();
  logger.debug('Available port found', { port: freePort });

  return freePort;
}

async function main() {
  try {
    // Set required environment variables from inputs
    process.env.STORAGE_PROVIDER = storageProvider;
    process.env.STORAGE_PATH = storagePath;
    process.env.HOST = host;
    
    validateEnv();
    const port = await getPort();

    logger.info('Starting Turbo Cache Server...', {
      host,
      port,
      storageProvider,
      storagePath,
      teamId,
    });

    const subprocess = spawn(
      process.execPath,
      [resolve(__dirname, '..', 'start_and_log')],
      {
        detached: true,
        stdio: 'pipe',
        env: {
          ...process.env,
          HOST: host,
          PORT: port.toString(),
          TURBO_TOKEN: token,
          STORAGE_PROVIDER: storageProvider,
          STORAGE_PATH: storagePath,
          TURBO_TEAM: teamId,
          LOG_LEVEL: 'debug', // Enable debug logging
        },
      },
    );

    subprocess.on('error', (err) => {
      logger.error('Failed to start subprocess', { error: err.message });
      setFailed(`Failed to start Turbo Cache Server: ${err.message}`);
      process.exit(1);
    });

    // Capture server output for token extraction
    let serverOutput = '';
    subprocess.stdout?.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      logger.debug('Server stdout', { data: output });
    });
    subprocess.stderr?.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      logger.debug('Server stderr', { data: output });
    });

    const pid = subprocess.pid?.toString();

    try {
      logger.debug(`Waiting for port ${port} to be used...`);
      await waitUntilUsedOnHost(port, host, 250, 20000);
      logger.info('Spawned Turbo Cache Server', {
        pid,
        port,
        host,
      });
      saveState('pid', subprocess.pid?.toString());

      // Extract token from server output if not provided
      let finalToken = token;
      if (!finalToken) {
        const tokenMatch = serverOutput.match(/TURBO_TOKEN=([^\s]+)/);
        if (tokenMatch) {
          finalToken = tokenMatch[1];
          logger.info('Using generated token', { token: finalToken });
        }
      }

      logger.debug('Export environment variables...');
      exportVariable('TURBO_API', `http://${host}:${port}`);
      exportVariable('TURBO_TOKEN', finalToken);
      exportVariable('TURBO_TEAM', teamId);

      // Log server configuration for debugging
      logger.info('Server configuration', {
        host,
        port,
        storageProvider,
        storagePath,
        teamId,
        hasToken: !!finalToken,
      });

      process.on('SIGTERM', async () => {
        if (subprocess.pid) {
          logger.info('Shutting down Turbo Cache Server', { pid: subprocess.pid });
          process.kill(subprocess.pid);
        }
        process.exit(0);
      });

      process.exit(0);
    } catch (e) {
      if (pidIsRunning(pid)) {
        logger.warn('Timed out while waiting for Turbo Cache Server, yet process is running', { pid });
        process.kill(pid);
      }
      const errors = await readLog('err');
      const errorMessage = errors ? `\nServer error log:\n${indentMultiline(errors)}` : '';
      const error = `Turbo Cache Server failed to start on port: ${port}${errorMessage}`;
      logger.error('Failed to start server', { error });
      setFailed(error);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    setFailed(error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error in main', { error: error.message });
  setFailed(error.message);
  process.exit(1);
});
