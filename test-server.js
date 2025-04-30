import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set up test environment variables
process.env.STORAGE_PROVIDER = 's3';
process.env.STORAGE_PATH = 'milab-euce1-prod-data-s3-turborepo-cache';
process.env.HOST = '0.0.0.0';
process.env.PORT = '9090';
process.env.TURBO_TOKEN = 'b2c7602c6296ec41c5c59382978db83bd004a5b157d934a3a56430197484f1d6';
process.env.TURBO_TEAM = 'citest';

// AWS configuration for local testing
process.env.AWS_PROFILE = 'mike-ainsel-mik8s'; // e.g., 'default' or 'development'
process.env.AWS_DEFAULT_REGION = 'eu-central-1';
process.env.AWS_REGION = 'eu-central-1';
process.env.AWS_SDK_LOAD_CONFIG = '1'; // Enable loading from AWS config file
process.env.AWS_CONFIG_FILE = process.env.HOME + '/.aws/config'; // Explicitly set config file path
process.env.AWS_SHARED_CREDENTIALS_FILE = process.env.HOME + '/.aws/credentials'; // Explicitly set credentials file path

// Start the server
const server = spawn(
  process.execPath,
  [resolve(__dirname, 'src/server.cjs')],
  {
    stdio: 'inherit',
    env: process.env
  }
);

// Handle server process
server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
}); 
