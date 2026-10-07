const { createApp, log } = require('./app');

const port = Number(process.env.PORT) || 3000;
const app = createApp();
const server = app.listen(port, () => log('info', 'listening', { port }));

// Graceful shutdown so rolling updates don't drop requests.
process.on('SIGTERM', () => {
  log('info', 'SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});
