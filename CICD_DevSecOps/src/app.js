const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));

  app.get('/', (_req, res) => res.json({ message: 'Hello from the DevSecOps pipeline!' }));

  app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.get('/version', (_req, res) => {
    try {
      const info = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'build-info.json'), 'utf8'));
      res.json(info);
    } catch {
      res.json({ version: 'dev' });
    }
  });

  app.post('/add', (req, res) => {
    const { a, b } = req.body || {};
    if (typeof a !== 'number' || typeof b !== 'number') {
      return res.status(400).json({ error: 'a and b must be numbers' });
    }
    res.json({ result: a + b });
  });

  return app;
}

module.exports = { createApp };
