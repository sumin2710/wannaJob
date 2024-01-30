import express from 'express';
import { prisma } from '../models/index.js';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import joi from 'joi';
import jwt from 'jsonwebtoken';

const router = express.Router();

const registerSchema = joi.object({
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
  name: joi
    .string()
    .min(1)
    .max(10)
    .required()
    .messages({ 'string.max': '이름은 10글자 이내의 문자열입니다. ' }),
  password: joi
    .string()
    .pattern(new RegExp('^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,30}$'))
    .required()
    .messages({
      'string.pattern.base':
        '비밀번호는 6-30자의 숫자와 영문자로 이루어지며 특수문자를 최소 한 자 이상 포함해야 합니다.',
      'string.empty': `빈 문자열은 비밀번호가 될 수 없습니다.`,
      'any.required': `비밀번호는 필수 입력사항입니다.`,
    }),
  checkPassword: joi.string().required(),
});

/** 회원가입 API */
router.post('/sign-up', async (req, res, next) => {
  try {
    const validation = await registerSchema.validateAsync(req.body);
    const { email, name, password, checkPassword } = validation;

    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });
    if (isExistUser)
      return res.status(409).json({ message: '이미 존재하는 사용자입니다.' });

    if (password !== checkPassword)
      return res.status(412).json({ message: '비밀번호가 일치하지 않습니다.' });

    // into DB
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user, userInfo] = await prisma.$transaction(
      async (tx) => {
        const user = await tx.users.create({
          data: {
            email,
            password: hashedPassword,
          },
        });
        const userInfo = await tx.userInfos.create({
          data: {
            userId: user.userId,
            name,
          },
        });
        return [user, userInfo];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      userData: `이메일: ${email}, 이름 : ${name}`,
    });
  } catch (err) {
    next(err);
  }
});

/** 로그인 API */
router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user)
    return res
      .status(401)
      .json({ message: '이름 또는 패스워드를 확인해주세요.' });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

  const accessToken = jwt.sign(
    {
      userId: user.userId,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: '12h',
    }
  );
  res.cookie('Authorization', `Bearer ${accessToken}`);

  return res.status(200).json({ message: '로그인에 성공하였습니다.' });
});

/** 내 정보 조회 API */
router.get('/user', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      userInfos: {
        select: {
          name: true,
          age: true,
          gender: true,
          profileImage: true,
        },
      },
    },
  });
  return res.status(200).json({ userData: user });
});

export default router;
