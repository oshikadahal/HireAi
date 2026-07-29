const { bruteForceProtection, recordFailedAttempt, resetBruteForceStore } = require('../middleware/security');

describe('Brute-force protection', () => {
  beforeEach(() => {
    resetBruteForceStore();
  });

  test('blocks an IP after repeated failed authentication attempts', () => {
    const req = {
      headers: {},
      socket: { remoteAddress: '203.0.113.10' },
      method: 'POST',
      path: '/api/auth/login',
      ip: '203.0.113.10',
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    for (let i = 0; i < 6; i += 1) {
      recordFailedAttempt(req);
    }

    bruteForceProtection(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });
});
