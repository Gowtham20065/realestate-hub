import request from 'supertest';
import app from '../index';

describe('Recommendations BFF Endpoints', () => {
  it('GET /api/recommendations returns 200 with recommended properties list', async () => {
    const res = await request(app).get('/api/recommendations?limit=4');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('recommendations');
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations.length).toBeLessThanOrEqual(4);

    if (res.body.data.recommendations.length > 0) {
      const first = res.body.data.recommendations[0];
      expect(first).toHaveProperty('property_id');
      expect(first).toHaveProperty('match_percentage');
      expect(first).toHaveProperty('reason');
    }
  });

  it('GET /api/recommendations/similar/:propertyId returns 200 with similar listings', async () => {
    // 1. Get an existing property first
    const propRes = await request(app).get('/api/properties?limit=1');
    expect(propRes.status).toBe(200);
    const existingProperty = propRes.body.data.properties[0];

    // 2. Fetch similar listings for it
    const res = await request(app).get(`/api/recommendations/similar/${existingProperty.id}?limit=3`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
