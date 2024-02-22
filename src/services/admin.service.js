import NotFoundError from '../errors/NotFoundError.js';

export class AdminService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  upgradeUserRole = async (role, userId) => {
    const isExistUser = await this.userRepository.getUserById(userId);
    if (!isExistUser) throw new NotFoundError('사용자가 존재하지 않습니다.');

    const userData = {
      id: +userId,
      role: role,
    };
    await this.userRepository.updateUser(userData);
    const user = this.userRepository.getUserById(userId);
    return user;
  };

  deleteUser = async (userId) => {
    const isExistUser = await this.userRepository.getUserById(userId);
    if (!isExistUser) throw new NotFoundError('사용자가 존재하지 않습니다.');

    await this.userRepository.deleteUser(userId);
  };

  getAllUsers = async () => {
    const users = await this.userRepository.getAllUsers();
    return users;
  };
}
