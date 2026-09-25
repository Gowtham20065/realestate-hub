import request from 'supertest';
import app from '../index';

describe('Properties Endpoints', () => {
  it('GET /api/properties returns paginated list of properties', async () => {
    const res = await request(app).get('/api/properties?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.properties)).toBe(true);
    expect(res.body.data.properties.length).toBeLessThanOrEqual(5);
    expect(res.body.data.pagination).toHaveProperty('total');
    expect(res.body.data.pagination).toHaveProperty('totalPages');
  });

  it('GET /api/properties?city=Austin filters listings by city', async () => {
    const res = await request(app).get('/api/properties?city=Austin');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const properties = res.body.data.properties;
    for (const prop of properties) {
      expect(prop.city.toLowerCase()).toBe('austin');
    }
  });

  it('GET /api/properties/:id returns 404 for non-existent or unknown ID', async () => {
    const res = await request(app).get('/api/properties/non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
