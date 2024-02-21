import { jest } from '@jest/globals';
import { AdminController } from '../../../src/controllers/admin.controller';

let mockAdminService = {
  upgradeUserRole: jest.fn(),
  deleteUser: jest.fn(),
};

let adminController = new AdminController(mockAdminService);

describe('Admin Controller Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('upgradeUserRole Method', async () => {
    const req = {
      body: { role: 'HR_MANAGER' },
      params: { userId: 6 },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    mockAdminService.upgradeUserRole.mockReturnValue(req.body);

    await adminController.upgradeUserRole(req, res, next);

    expect(mockAdminService.upgradeUserRole).toHaveBeenCalledTimes(1);
    expect(mockAdminService.upgradeUserRole).toHaveBeenCalledWith(
      req.body.role,
      req.params.userId
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: req.body });
  });

  test('deleteUser Method', async () => {
    const req = {
      params: { userId: 6 },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await adminController.deleteUser(req, res, next);

    expect(mockAdminService.deleteUser).toHaveBeenCalledTimes(1);
    expect(mockAdminService.deleteUser).toHaveBeenCalledWith(req.params.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      `${req.params.userId} 사용자가 삭제되었습니다.`
    );
  });
});
