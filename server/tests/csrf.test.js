const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

describe('CSRF token endpoint and enforcement', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());

    // set up csurf in cookie mode to mimic server/index.js configuration
    app.use(
      csurf({
        cookie: {
          httpOnly: false,
          sameSite: 'lax',
          secure: false,
        },
      })
    );

    // endpoint to retrieve token
    app.get('/api/csrf-token', (req, res) => {
      try {
        const token = req.csrfToken();
        res.json({ success: true, csrfToken: token });
      } catch (err) {
        res.status(500).json({ success: false });
      }
    });

    // a state-changing endpoint that requires CSRF token
    app.post('/api/test-state', (req, res) => {
      res.json({ success: true });
    });

    // error handler
    app.use((err, req, res, next) => {
      if (err.code === 'EBADCSRFTOKEN') return res.status(403).json({ success: false, message: 'Invalid CSRF' });
      res.status(500).json({ success: false, message: err.message });
    });
  });

  test('GET /api/csrf-token returns token and sets cookie', async () => {
    const agent = request.agent(app);
    const res = await agent.get('/api/csrf-token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('csrfToken');
    // cookie should be set in 'set-cookie'
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
  });

  test('POST state-changing without token is rejected', async () => {
    const agent = request.agent(app);
    // first, get token cookie
    await agent.get('/api/csrf-token');
    // now call state-changing endpoint without header
    const res = await agent.post('/api/test-state').send({});
    expect(res.status).toBe(403);
  });

  test('POST state-changing with X-CSRF-Token header succeeds', async () => {
    const agent = request.agent(app);
    const getRes = await agent.get('/api/csrf-token');
    const token = getRes.body.csrfToken;
    const res = await agent.post('/api/test-state').set('x-csrf-token', token).send({});
    expect(res.status).toBe(200);
  });
});
