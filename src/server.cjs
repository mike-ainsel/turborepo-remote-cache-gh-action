const { createApp } = require('turborepo-remote-cache');

// Simple structured logging for CommonJS environment
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };
  console.log(JSON.stringify(logEntry));
};

const handleError = (message, error) => {
  log('error', message, { error: error.message });
  process.exit(1);
};

log('info', 'Creating Turbo Cache Server...');

const app = createApp({trustProxy: true});

const host = process.env.HOST;
const port = process.env.PORT;

if (!host || !port) {
  handleError('Missing required environment variables', new Error('HOST and PORT must be set'));
}

log('info', 'Starting server', { host, port });

app.listen({ host, port }, (err) => {
  if (err) {
    handleError('Failed to start server', err);
  }
  log('info', 'Server started successfully', { host, port });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'Received SIGTERM, shutting down gracefully');
  process.exit(0);
});
