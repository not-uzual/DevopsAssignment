const request = require('supertest');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createApp } = require('../src/app');

let app;
let dir;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-'));
  app = createApp({ dataDir: dir, apiKey: 'test-key', appEnv: 'test' });
});

describe('probes and info', () => {
  test('GET /healthz', async () => {
    expect((await request(app).get('/healthz')).body).toEqual({ status: 'ok' });
  });
  test('GET /readyz ready when storage writable', async () => {
    expect((await request(app).get('/readyz')).status).toBe(200);
  });
  test('GET / returns greeting and env', async () => {
    const res = await request(app).get('/');
    expect(res.body.env).toBe('test');
  });
  test('GET /version', async () => {
    expect((await request(app).get('/version')).body).toHaveProperty('version');
  });
});

describe('notes', () => {
  test('POST without key is 401', async () => {
    expect((await request(app).post('/notes').send({ text: 'x' })).status).toBe(401);
  });
  test('POST with key creates, GET lists', async () => {
    const created = await request(app).post('/notes').set('x-api-key', 'test-key').send({ text: 'hello' });
    expect(created.status).toBe(201);
    const list = await request(app).get('/notes');
    expect(list.body).toHaveLength(1);
    expect(list.body[0].text).toBe('hello');
  });
  test('rejects empty and oversized notes', async () => {
    const h = { 'x-api-key': 'test-key' };
    expect((await request(app).post('/notes').set(h).send({ text: '  ' })).status).toBe(400);
    expect((await request(app).post('/notes').set(h).send({ text: 'a'.repeat(281) })).status).toBe(400);
  });
  test('notes persist across store instances (PVC behavior)', async () => {
    await request(app).post('/notes').set('x-api-key', 'test-key').send({ text: 'persist me' });
    const app2 = createApp({ dataDir: dir, apiKey: 'test-key' });
    expect((await request(app2).get('/notes')).body[0].text).toBe('persist me');
  });
});

describe('observability and security', () => {
  test('/metrics exposes http and notes metrics', async () => {
    await request(app).get('/');
    const res = await request(app).get('/metrics');
    expect(res.text).toMatch(/http_request_duration_seconds/);
    expect(res.text).toMatch(/notes_total/);
  });
  test('security headers set, x-powered-by hidden', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
  test('GET /burn returns', async () => {
    expect((await request(app).get('/burn?ms=30')).body.burned_ms).toBe(30);
  });
});
