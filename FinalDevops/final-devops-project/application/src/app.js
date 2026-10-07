const express = require('express');
const helmet = require('helmet');
const client = require('prom-client');
const fs = require('fs');
const path = require('path');
const { NoteStore } = require('./store');

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }));
}

function createApp(config = {}) {
  const cfg = {
    dataDir: process.env.DATA_DIR || './data',
    appEnv: process.env.APP_ENV || 'dev',
    greeting: process.env.GREETING || 'Hello from notes-api',
    apiKey: process.env.API_KEY || '',
    maxNoteLength: Number(process.env.MAX_NOTE_LENGTH) || 280,
    ...config,
  };

  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry });
  const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
    registers: [registry],
  });
  const notesGauge = new client.Gauge({
    name: 'notes_total',
    help: 'Number of stored notes',
    registers: [registry],
    collect() { this.set(store.list().length); },
  });
  void notesGauge;

  const store = new NoteStore(cfg.dataDir);
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));

  app.use((req, res, next) => {
    const end = httpDuration.startTimer();
    res.on('finish', () => {
      end({ method: req.method, route: req.route ? req.route.path : 'unmatched', status: res.statusCode });
      if (req.path !== '/healthz' && req.path !== '/metrics') {
        log(res.statusCode >= 500 ? 'error' : 'info', 'request', {
          method: req.method, path: req.path, status: res.statusCode,
        });
      }
    });
    next();
  });

  // Probes: liveness = process is up; readiness = storage is writable.
  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
  app.get('/readyz', (_req, res) => {
    try {
      fs.accessSync(cfg.dataDir, fs.constants.W_OK);
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'storage not writable' });
    }
  });

  app.get('/', (_req, res) => res.json({ message: cfg.greeting, env: cfg.appEnv }));

  app.get('/version', (_req, res) => {
    try {
      res.json(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'build-info.json'), 'utf8')));
    } catch {
      res.json({ version: 'dev' });
    }
  });

  // Write endpoints require the API key (comes from a Kubernetes Secret).
  function requireKey(req, res, next) {
    if (!cfg.apiKey || req.get('x-api-key') !== cfg.apiKey) {
      return res.status(401).json({ error: 'invalid or missing API key' });
    }
    next();
  }

  app.get('/notes', (_req, res) => res.json(store.list()));

  app.post('/notes', requireKey, (req, res) => {
    const text = req.body && req.body.text;
    if (typeof text !== 'string' || !text.trim() || text.length > cfg.maxNoteLength) {
      return res.status(400).json({ error: `text must be 1-${cfg.maxNoteLength} characters` });
    }
    res.status(201).json(store.add(text.trim()));
  });

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  });

  // CPU burner so the HPA can be demonstrated.
  app.get('/burn', (req, res) => {
    const ms = Math.min(Number(req.query.ms) || 500, 5000);
    const end = Date.now() + ms;
    (function slice() {
      const s = Date.now() + 20;
      while (Date.now() < s) Math.sqrt(Math.random());
      if (Date.now() < end) setImmediate(slice); else res.json({ burned_ms: ms });
    })();
  });

  return app;
}

module.exports = { createApp, log };
