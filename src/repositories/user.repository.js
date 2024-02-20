export class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  signUp = async (email, name, hashedPassword) => {
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    return newUser;
  };

  getUserByEmail = async (email) => {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });
    return user;
  };

  getUserById = async (userId) => {
    const user = await this.prisma.user.findFirst({
      where: { id: +userId },
    });
    return user;
  };

  updateUser = async (userData) => {
    if (userData.age) userData.age = +userData.age;
    const updatedUser = await this.prisma.user.update({
      where: { id: +userData.id },
      data: {
        ...userData,
      },
    });
    return updatedUser;
  };

  deleteUser = async (userId) => {
    await this.prisma.user.delete({
      where: { id: +userId },
    });
    return;
  };
}
