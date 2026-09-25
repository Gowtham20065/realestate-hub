import request from 'supertest';
import app from '../index';

describe('Healthcheck Endpoint', () => {
  it('GET /api/health returns 200 and healthy database status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body.stats).toHaveProperty('properties');
  });
});
