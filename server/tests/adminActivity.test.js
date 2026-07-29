const mockCountDocuments = jest.fn();
const mockFind = jest.fn();

jest.mock('../models/ActivityLog', () => ({
  countDocuments: mockCountDocuments,
  find: mockFind,
}));

jest.mock('../utils/notify', () => jest.fn());

const { getActivityLogs } = require('../controllers/adminController');

describe('Admin activity logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns paginated activity logs for admin review', async () => {
    const req = { query: { page: '1', limit: '10', search: 'login' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockCountDocuments.mockResolvedValue(1);
    mockFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([{ action: 'login', status: 'failed' }]),
          }),
        }),
      }),
    });

    await getActivityLogs(req, res);

    expect(mockCountDocuments).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, logs: expect.any(Array) }));
  });
});
