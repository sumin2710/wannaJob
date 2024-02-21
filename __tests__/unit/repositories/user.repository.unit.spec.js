import { beforeEach, jest } from '@jest/globals';
import { UserRepository } from '../../../src/repositories/user.repository';

let mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

let userRepository = new UserRepository(mockPrisma);

describe('User Repository Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('signUp Method', async () => {
    const mockReturn = 'User object';
    const params = {
      email: 'aaa@aaa.com',
      password: 'hashed aaaaa***',
      name: 'aaa',
    };

    mockPrisma.user.create.mockReturnValue(mockReturn);

    const user = await userRepository.signUp(
      params.email,
      params.name,
      params.password
    );
    expect(user).toEqual(mockReturn);
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: params,
    });
  });

  test('getUserByEmail Method', async () => {
    const mockReturn = 'User object';
    const mockEmail = 'aaa@aaa.com';

    mockPrisma.user.findUnique.mockReturnValue(mockReturn);

    const user = await userRepository.getUserByEmail(mockEmail);
    expect(user).toEqual(mockReturn);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockEmail },
    });
  });

  test('getUserById Method', async () => {
    const mockReturn = 'User object';
    const mockUserId = 1;

    mockPrisma.user.findUnique.mockReturnValue(mockReturn);

    const user = await userRepository.getUserById(mockUserId);
    expect(user).toEqual(mockReturn);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: +mockUserId },
    });
  });

  test('updateUser Method', async () => {
    const mockReturn = 'User object';
    const params = {
      id: 1,
      email: 'bbb@bbb.com',
      password: 'hashed bbbb***',
      name: 'bbb',
      age: '22',
    };

    mockPrisma.user.update.mockReturnValue(mockReturn);

    const user = await userRepository.updateUser(params);
    expect(user).toEqual(mockReturn);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: +params.id },
      data: {
        ...params,
        age: +params.age,
      },
    });
  });

  test('deleteUser Method', async () => {
    const mockUserId = 1;

    await userRepository.deleteUser(mockUserId);
    expect(mockPrisma.user.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: +mockUserId },
    });
  });
});
