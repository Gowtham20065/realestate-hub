import request from 'supertest';
import app from '../index';

describe('Authentication Endpoints', () => {
  it('POST /api/auth/signup fails with 400 when missing required fields', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'not-an-email',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login fails with 401 on non-existent account', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost_user_does_not_exist@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me fails with 401 when Authorization header is absent', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
