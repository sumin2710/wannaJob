import { jest } from '@jest/globals';
import { AdminService } from '../../../src/services/admin.service.js';
import NotFoundError from '../../../src/errors/NotFoundError.js';

let mockUserRepository = {
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

let adminService = new AdminService(mockUserRepository);

describe('Admin Service Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('upgradeUserRole Method', async () => {
    const userId = 6;
    const role = 'HR_MANAGER';
    const sampleUser = {
      id: 6,
      name: 'aaa',
      email: 'aaa@aaa.com',
      role: 'USER',
      age: null,
      gender: null,
      profileImage: null,
      createdAt: '2024-02-21T05:24:07.187Z',
      updatedAt: '2024-02-21T05:24:07.187Z',
    };
    const updateUser = {
      role: 'HR_MANAGER',
      updatedAt: '2024-02-21T06:24:07.187Z',
    };
    mockUserRepository.getUserById.mockReturnValue(sampleUser);
    mockUserRepository.updateUser.mockReturnValue({
      ...sampleUser,
      ...updateUser,
    });

    const result = await adminService.upgradeUserRole(role, userId);

    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
    expect(mockUserRepository.updateUser).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith({
      id: +userId,
      role,
    });
    expect(result).toEqual({ ...sampleUser, ...updateUser });
  });

  test('deleteUser Method', async () => {
    const userId = 6;
    mockUserRepository.getUserById.mockReturnValue({ id: userId });

    await adminService.deleteUser(userId);

    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
    expect(mockUserRepository.deleteUser).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId);
  });

  test('deleteUser Method By NotFoundError', async () => {
    const userId = 1;
    mockUserRepository.getUserById.mockReturnValue(null);

    try {
      await adminService.deleteUser(userId);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toEqual('사용자가 존재하지 않습니다.');
    }
  });
});
