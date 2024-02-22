import dataSource from '../typeorm/index.js';

export class UserRepository {
  signUp = async (email, name, hashedPassword) => {
    await dataSource.getRepository('User').insert({
      email,
      password: hashedPassword,
      name,
    });
  };

  getUserByEmail = async (email) => {
    const user = await dataSource.getRepository('User').findOne({
      where: { email: email },
    });
    return user;
  };

  getUserById = async (userId) => {
    const user = await dataSource.getRepository('User').findOne({
      where: { id: +userId },
    });
    return user;
  };

  updateUser = async (userData) => {
    if (userData.age) userData.age = +userData.age;
    await dataSource.getRepository('User').update(
      {
        id: +userData.id,
      },
      userData
    );
  };

  deleteUser = async (userId) => {
    await dataSource.getRepository('User').delete({
      id: +userId,
    });
    return;
  };

  getAllUsers = async () => {
    const users = await dataSource.getRepository('User').find();
    return users;
  };
}
