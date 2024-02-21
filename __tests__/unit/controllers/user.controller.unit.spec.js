import { jest } from '@jest/globals';
import { UserController } from '../../../src/controllers/user.controller';

let mockUserService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
};

let userController = new UserController(mockUserService);

describe('User Controller Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('signUp Method', async () => {
    const req = {
      body: {
        email: 'aaa@aaa.com',
        name: 'aaa',
        password: 'aaaa***',
        checkPassword: 'aaaa***',
      },
    };
    const newUser = {
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
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    mockUserService.signUp.mockReturnValue(newUser);

    await userController.signUp(req, res, next);

    expect(mockUserService.signUp).toHaveBeenCalledTimes(1);
    expect(mockUserService.signUp).toHaveBeenCalledWith(
      req.body.email,
      req.body.name,
      req.body.password,
      req.body.checkPassword
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ newUser });
  });

  test('signIn Method', async () => {
    const req = {
      body: { email: 'aaa@aaa.com', password: 'aaaa***' },
      ip: '0.0.0.0',
      headers: {
        'user-agent': 'Thunder Client (https://www.thunderclient.com)',
      },
      session: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    const next = jest.fn();

    const user = {
      id: 6,
      name: 'aaa',
      email: 'aaa@aaa.com',
      role: 'USER',
      age: null,
      gender: null,
      profileImage: null,
      createdAt: '2024-02-21T05:24:07.187Z',
      updatedAt: '2024-02-21T05:24:07.187Z',
      accessToken: 'testToken',
      refreshToken: 'testRefreshToken',
    };
    mockUserService.signIn.mockReturnValue(user);

    await userController.signIn(req, res, next);

    expect(mockUserService.signIn).toHaveBeenCalledTimes(1);
    expect(mockUserService.signIn).toHaveBeenCalledWith(
      req.body.email,
      req.body.password,
      req.ip,
      req.headers['user-agent']
    );
    expect(res.cookie).toHaveBeenCalledWith('accessToken', user.accessToken);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user });
  });

  test('logOut Method', async () => {
    const req = { session: { destroy: jest.fn((callback) => callback()) } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      clearCookie: jest.fn(),
    };

    await userController.logOut(req, res);

    expect(req.session.destroy).toHaveBeenCalledTimes(1);
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('성공적으로 로그아웃되었습니다.');
  });

  test('getUser Method', async () => {
    const req = { userId: 6 };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const user = {
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
    mockUserService.getUserById.mockReturnValue(user);

    await userController.getUser(req, res, next);

    expect(mockUserService.getUserById).toHaveBeenCalledTimes(1);
    expect(mockUserService.getUserById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user });
  });

  test('updateUser Method', async () => {
    const req = {
      body: { name: 'bbb', gender: 'M' },
      userId: 6,
      file: { location: 'aaaProfileImage' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const updatedUser = {
      id: 6,
      name: 'bbb',
      email: 'aaa@aaa.com',
      role: 'USER',
      age: null,
      gender: 'M',
      profileImage: req.file.location,
      createdAt: '2024-02-21T05:24:07.187Z',
      updatedAt: '2024-02-21T06:24:07.187Z',
    };
    mockUserService.updateUser.mockReturnValue(updatedUser);

    await userController.updateUser(req, res, next);

    expect(mockUserService.updateUser).toHaveBeenCalledTimes(1);
    expect(mockUserService.updateUser).toHaveBeenCalledWith({
      ...req.body,
      id: req.userId,
      profileImage: req.file.location,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ updatedUser });
  });
});
