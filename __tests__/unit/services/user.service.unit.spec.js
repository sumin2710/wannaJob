import { jest } from '@jest/globals';
import { UserService } from '../../../src/services/user.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

let mockUserRepository = {
  signUp: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

let userService = new UserService(mockUserRepository);

describe('User Service Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('signUp Method', async () => {
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

    const params = {
      name: 'aaa',
      password: 'aaaa**',
      checkPassword: 'aaaa**',
      email: 'aaa@aaa.com',
    };

    mockUserRepository.getUserByEmail.mockReturnValue(null);
    mockUserRepository.signUp.mockReturnValue(sampleUser);
    bcrypt.hash.mockResolvedValue('hashed aaaa***');

    const result = await userService.signUp(
      params.email,
      params.name,
      params.password,
      params.checkPassword
    );

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
      params.email
    );

    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith(params.password, 10);

    expect(mockUserRepository.signUp).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.signUp).toHaveBeenCalledWith(
      params.email,
      params.name,
      'hashed aaaa***'
    );

    expect(result).toEqual(sampleUser);
  });

  test('signUp Method By Existing User Error', async () => {
    const params = {
      name: 'aaa',
      password: 'aaaa**',
      checkPassword: 'aaaa**',
      email: 'aaa@aaa.com',
    };

    mockUserRepository.getUserByEmail.mockReturnValue(true);

    try {
      await userService.signUp(
        params.email,
        params.name,
        params.password,
        params.checkPassword
      );
    } catch (err) {
      expect(err.message).toEqual('이미 존재하는 사용자입니다.');
    }

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
      params.email
    );
  });

  test('signUp Method By Password Mismatch Error', async () => {
    const params = {
      name: 'aaa',
      password: 'aaaa**',
      checkPassword: 'bbbb**',
      email: 'aaa@aaa.com',
    };

    mockUserRepository.getUserByEmail.mockReturnValue(null);

    try {
      await userService.signUp(
        params.email,
        params.name,
        params.password,
        params.checkPassword
      );
    } catch (err) {
      expect(err.message).toEqual('비밀번호가 일치하지 않습니다.');
    }

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
      params.email
    );
  });

  test('getUserByEmail Method', async () => {
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

    const email = 'aaa@aaa.com';
    mockUserRepository.getUserByEmail.mockReturnValue(sampleUser);

    const result = await userService.getUserByEmail(email);

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);

    expect(result).toEqual(sampleUser);
  });

  test('getUserById Method', async () => {
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

    const userId = 6;
    mockUserRepository.getUserById.mockReturnValue(sampleUser);

    const result = await userService.getUserById(userId);

    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);

    expect(result).toEqual(sampleUser);
  });

  test('signIn Method', async () => {
    const sampleUser = {
      id: 6,
      name: 'aaa',
      email: 'aaa@aaa.com',
      password: 'hashed aaaa***',
      role: 'USER',
      age: null,
      gender: null,
      profileImage: null,
      createdAt: '2024-02-21T05:24:07.187Z',
      updatedAt: '2024-02-21T05:24:07.187Z',
    };

    const params = {
      email: 'aaa@aaa.com',
      password: 'aaaa**',
    };

    mockUserRepository.getUserByEmail.mockReturnValue(sampleUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('testToken');

    const result = await userService.signIn(
      params.email,
      params.password,
      '0.0.0.0',
      'Thunder Client (https://www.thunderclient.com)'
    );

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
      params.email
    );

    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      params.password,
      sampleUser.password
    );

    expect(jwt.sign).toHaveBeenCalledTimes(2); // token 2개라 2번 호출됨
  });

  test('updateUser Method', async () => {
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
    const params = {
      id: 6,
      name: 'bbb',
      gender: 'M',
    };

    mockUserRepository.getUserById.mockReturnValue(sampleUser);
    mockUserRepository.updateUser.mockReturnValue({
      ...sampleUser,
      ...params,
    });

    const result = await userService.updateUser(params);

    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getUserById).toHaveBeenCalledWith(params.id);

    expect(mockUserRepository.updateUser).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith(params);

    expect(result).toEqual({ ...sampleUser, ...params });
  });
});
