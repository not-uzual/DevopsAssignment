const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();

describe('API', () => {
  test('GET / returns greeting', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/DevSecOps/);
  });

  test('GET /healthz returns ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /version returns version info', async () => {
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version');
  });

  test('POST /add sums numbers', async () => {
    const res = await request(app).post('/add').send({ a: 2, b: 3 });
    expect(res.body.result).toBe(5);
  });

  test('POST /add rejects bad input', async () => {
    const res = await request(app).post('/add').send({ a: 'x', b: 3 });
    expect(res.status).toBe(400);
  });

  test('security headers are set and x-powered-by hidden', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
