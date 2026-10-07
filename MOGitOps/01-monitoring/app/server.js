const express = require('express');
const client = require('prom-client');

const app = express();
const register = client.register;

// CPU, memory (RSS, heap), event-loop lag, GC, file descriptors...
client.collectDefaultMetrics();

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});
const healthGauge = new client.Gauge({
  name: 'app_health_status',
  help: '1 = healthy, 0 = unhealthy',
});
healthGauge.set(1);

let healthy = true;
const leak = [];

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }));
}

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : 'unmatched';
    end({ method: req.method, route, status: res.statusCode });
    log(res.statusCode >= 500 ? 'error' : 'info', 'request', {
      method: req.method, path: req.path, status: res.statusCode,
    });
  });
  next();
});

app.get('/', (_req, res) => res.json({ message: 'monitored app', healthy }));

// Application health: used by Prometheus (blackbox-style via app_health_status) and Docker healthcheck
app.get('/healthz', (_req, res) => res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'unhealthy' }));

// --- fault injection endpoints to make dashboards and alerts move ---
app.get('/cpu', (req, res) => {          // burn CPU for ?ms=2000, yielding so /metrics stays reachable
  const ms = Math.min(Number(req.query.ms) || 2000, 120000);
  const end = Date.now() + ms;
  (function slice() {
    const sliceEnd = Date.now() + 50;
    while (Date.now() < sliceEnd) { Math.sqrt(Math.random()); }
    if (Date.now() < end) setImmediate(slice); else res.json({ burned_ms: ms });
  })();
});
app.get('/mem', (req, res) => {          // retain ?mb=50 more memory
  const mb = Math.min(Number(req.query.mb) || 50, 200);
  leak.push(Buffer.alloc(mb * 1024 * 1024, 1));
  res.json({ retained_mb: leak.length * mb });
});
app.get('/mem/free', (_req, res) => { leak.length = 0; global.gc && global.gc(); res.json({ freed: true }); });
app.get('/fail', (_req, res) => res.status(500).json({ error: 'injected failure' }));
app.get('/health/toggle', (_req, res) => {
  healthy = !healthy;
  healthGauge.set(healthy ? 1 : 0);
  log('warn', 'health toggled', { healthy });
  res.json({ healthy });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => log('info', 'listening', { port: 3000 }));
