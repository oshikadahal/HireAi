const { authorize, requireOwnership } = require('../middleware/auth');

describe('RBAC middleware', () => {
  test('denies non-owners from accessing owned resources', () => {
    const req = {
      user: { role: 'candidate', _id: 'user-2' },
      params: { user: 'user-1' },
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    expect(() => requireOwnership('user')(req, res, next)).toThrow('You can only access your own resources');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('allows admins to bypass ownership checks', () => {
    const req = {
      user: { role: 'admin', _id: 'admin-1' },
      params: {},
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    requireOwnership('user')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('authorizes the correct role', () => {
    const req = { user: { role: 'hr' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authorize('hr', 'admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
