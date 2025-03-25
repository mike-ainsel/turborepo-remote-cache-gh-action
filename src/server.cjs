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

log('info', 'Creating Turbo Cache Server...');

const app = createApp({trustProxy: true});

const host = process.env.HOST;
const port = process.env.PORT;

log('info', 'Starting server', { host, port });

app.listen({ host, port }, (err) => {
  if (err) {
    log('error', 'Failed to start server', { error: err.message });
    process.exit(1);
  }
  log('info', 'Server started successfully', { host, port });
});
