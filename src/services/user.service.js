import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { bucketName, s3 } from '../utils/multer/multer.js';
import BadRequestError from '../errors/BadRequestError.js';
import NotFoundError from '../errors/NotFoundError.js';

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  signUp = async (email, name, password, checkPassword) => {
    // 해당 사용자 존재 여부 확인
    const isExistUser = await this.userRepository.getUserByEmail(email);
    if (isExistUser) throw new BadRequestError('이미 존재하는 사용자입니다.');

    // 비밀번호 비교 검증
    if (password !== checkPassword)
      throw new BadRequestError('비밀번호가 일치하지 않습니다.');

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.signUp(email, name, hashedPassword);
    const user = await this.userRepository.getUserByEmail(email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  getUserByEmail = async (email) => {
    const user = await this.userRepository.getUserByEmail(email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  getUserById = async (userId) => {
    const user = await this.userRepository.getUserById(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  signIn = async (email, password, ip, userAgent) => {
    // 해당 사용자 존재 여부 확인
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new BadRequestError('이름 또는 패스워드를 확인해주세요.');

    // 비밀번호 검증
    if (!(await bcrypt.compare(password, user.password)))
      throw new BadRequestError('비밀번호가 일치하지 않습니다.');

    // accessToken, refreshToken 발급
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.ACCESS_SECRET_KEY,
      {
        expiresIn: '12h',
      }
    );
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        ip,
        userAgent,
      },
      process.env.REFRESH_SECRET_KEY,
      {
        expiresIn: '7d',
      }
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      accessToken,
      refreshToken,
    };
  };

  updateUser = async (userData) => {
    // 해당 사용자 존재 여부 확인
    const isExistUser = await this.userRepository.getUserById(userData.id);
    if (!isExistUser) throw new NotFoundError('존재하지 않는 사용자입니다.');

    // 만약 프로필 사진이 이미 있다면, s3의 기존 것 삭제
    if (isExistUser.profileImage) {
      const imageName = isExistUser.profileImage.split('com/')[1];
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: imageName,
      });
      try {
        await s3.send(deleteCommand);
      } catch (err) {
        next(err);
      }
    }

    await this.userRepository.updateUser(userData);

    const user = await this.userRepository.getUserById(userData.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };
}
