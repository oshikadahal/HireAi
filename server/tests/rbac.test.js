const { authorize } = require('../middleware/auth');

describe('RBAC middleware presence', () => {
  test('authorize is a function', () => {
    expect(typeof authorize).toBe('function');
  });
});
