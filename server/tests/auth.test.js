const request = require('supertest');
const app = require('../index');

describe('Auth endpoints (smoke)', () => {
  test('Health endpoint returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
