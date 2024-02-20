export class AdminService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  upgradeUserRole = async (role, userId) => {
    const isExistUser = await this.userRepository.getUserById(userId);
    if (!isExistUser) throw new Error('사용자가 존재하지 않습니다.');

    const userData = {
      id: +userId,
      role: role,
    };
    const user = await this.userRepository.updateUser(userData);
    return user;
  };

  deleteUser = async (userId) => {
    const isExistUser = await this.userRepository.getUserById(userId);
    if (!isExistUser) throw new Error('사용자가 존재하지 않습니다.');

    await this.userRepository.deleteUser(userId);
  };
}
