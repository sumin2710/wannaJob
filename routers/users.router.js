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
    .max(30)
    .required()
    .messages({ 'string.max': '이름은 30글자 이내의 문자열입니다. ' }),
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
    const { clientId, name } = req.body;
    let user, userInfo;

    if (clientId) {
      // 카카오 회원가입
      const isExistUser = await prisma.users.findFirst({
        where: { clientId },
      });
      if (isExistUser)
        return res.status(409).json({ message: '이미 존재하는 사용자입니다.' });

      // into DB
      [user, userInfo] = await prisma.$transaction(
        async (tx) => {
          const user = await tx.users.create({
            data: {
              clientId,
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
    } else {
      // 일반 회원가입
      const validation = await registerSchema.validateAsync(req.body);
      const { email, name, password, checkPassword } = validation;

      const isExistUser = await prisma.users.findFirst({
        where: { email },
      });
      if (isExistUser)
        return res.status(409).json({ message: '이미 존재하는 사용자입니다.' });

      if (password !== checkPassword)
        return res
          .status(412)
          .json({ message: '비밀번호가 일치하지 않습니다.' });

      // into DB
      const hashedPassword = await bcrypt.hash(password, 10);
      [user, userInfo] = await prisma.$transaction(
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
    }

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: user,
      userInfo: userInfo,
    });
  } catch (err) {
    next(err);
  }
});

/** 로그인 API */
router.post('/sign-in', async (req, res, next) => {
  const { clientId } = req.body;
  let user;
  if (clientId) {
    // 카카오 로그인
    user = await prisma.users.findFirst({ where: { clientId } });
    if (!user)
      return res
        .status(412)
        .json({ message: '클라이언트 아이디를 확인해주세요.' });
  } else {
    // 일반(이메일) 로그인
    const { email, password } = req.body;
    user = await prisma.users.findFirst({ where: { email } });
    if (!user)
      return res
        .status(412)
        .json({ message: '이름 또는 패스워드를 확인해주세요.' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(412).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const accessToken = jwt.sign(
    {
      userId: user.userId,
      role: user.role,
    },
    process.env.ACCESS_SECRET_KEY,
    {
      expiresIn: '12h',
    }
  );
  const refreshToken = jwt.sign(
    {
      userId: user.userId,
      role: user.role,
    },
    process.env.REFRESH_SECRET_KEY,
    {
      expiresIn: '7d',
    }
  );

  // refresh token DB에 저장하기
  const isExistRefreshToken = await prisma.refreshTokens.findFirst({
    where: { userId: user.userId },
  });
  // 이미 존재한다면 DB의 refresh token 수정하기
  if (isExistRefreshToken) {
    await prisma.refreshTokens.update({
      where: { userId: user.userId },
      data: {
        token: refreshToken,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
        createdAt: new Date(),
      },
    });
  } else {
    await prisma.refreshTokens.create({
      data: {
        userId: user.userId,
        token: refreshToken,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
      },
    });
  }

  res.cookie('accessToken', accessToken);
  res.cookie('refreshToken', refreshToken);

  return res.status(200).json({ message: '로그인에 성공하였습니다.' });
});

/** 내 정보 조회 API */
router.get('/users', authMiddleware, async (req, res, next) => {
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
  return res.status(200).json({ data: user });
});

/** 내 정보 수정 API */
router.patch('/users', authMiddleware, async (req, res, next) => {
  try {
    const updateData = req.body; // name, age, gender, profileImage
    const { userId } = req.user;
    const userInfo = await prisma.userInfos.findFirst({
      where: { userId: +userId },
    });
    if (!userInfo)
      return res
        .status(404)
        .json({ message: '사용자 정보가 존재하지 않습니다.' });
    // into DB
    const updatedUserInfo = await prisma.userInfos.update({
      data: { ...updateData },
      where: { userId: +userId },
    });
    return res.status(200).json({
      message: '성공적으로 수정이 완료되었습니다.',
      data: updatedUserInfo,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
/**
 * @swagger
 *  /api/sign-up:
 *    post:
 *      summary: 회원가입
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Sign_up_request_body'
 *      responses:
 *        200:
 *          description: 회원가입 성공
 */
/**
 * @swagger
 *  /api/sign-in:
 *    post:
 *      summary: 로그인
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Login_request_body'
 *      responses:
 *        200:
 *          description: 로그인 성공
 *          headers:
 *            Set-Cookie:
 *              schema:
 *                type: string
 *                example: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJIUl9NQU5BR0VSIiwiaWF0IjoxNzA2NzkzMjQ0LCJleHAiOjE3MDczOTgwNDR9.QTXz7wYBtziUtPATlwQxr4ZCtZFl55M6TygdokKveNI; Path=/; Domain=localhost,refreshToken=...
 */
/**
 *@swagger
 *  /api/users:
 *   get:
 *     summary: req header의 userId를 가지고 내 정보를 조회
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: bad request
 *       401:
 *         description: 토큰이 조작되었습니다
 */
/**
 * @swagger
 *  /api/users:
 *    patch:
 *      summary: 내 정보를 수정
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Patch_user_request_body'
 *      responses:
 *        200:
 *          description: 수정 성공
 *        404:
 *          description: 사용자 정보가 존재하지 않습니다
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    Users:
 *      type: object
 *      properties:
 *        userId:
 *          type: integer
 *          format: int32
 *          example: 1
 *        email:
 *          type: string
 *          format: email
 *          example: park@gmail.com
 *        password:
 *          type: string
 *          format: password
 *          example: dddddn*
 *        createdAt:
 *          type: string
 *          format: date-time
 *          example: 2017-07-21T17:32:28Z
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          example: 2017-07-21T17:32:28Z
 *        role:
 *          type: string
 *          example: USER
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    UserInfos:
 *      type: object
 *      properties:
 *        userId:
 *          type: integer
 *          format: int32
 *          example: 1
 *        name:
 *          type: string
 *          example: park
 *        age:
 *          type: integer
 *          format: int32
 *          example: 20
 *        gender:
 *          type: string
 *          example: female
 *        profileImage:
 *          type: string
 *          example: img.png
 *        createdAt:
 *          type: string
 *          format: date-time
 *          example: 2017-07-21T17:32:28Z
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          example: 2017-07-21T17:32:28Z
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    Sign_up_request_body:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *          example: mocha@gmail.com
 *        password:
 *          type: string
 *          format: password
 *          example: skjfljdksf%
 *        checkPassword:
 *          type: string
 *          format: password
 *          example: skjfljdksf%
 *        name:
 *          type: string
 *          example: Mocha
 *    Login_request_body:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *          example: manager@gmail.com
 *        password:
 *          type: string
 *          format: password
 *          example: dddddd*
 *    Patch_user_request_body:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          example: Mochas
 *        age:
 *          type: integer
 *          format: int32
 *          example: 22
 *        gender:
 *          type: string
 *          example: female
 *        profileImage:
 *          type: string
 *          example: img.png
 *    Get_user_result:
 *      type: object
 *      properties:
 *        userId:
 *          type: integer
 *          format: int32
 *          example: 2
 *        email:
 *          type: string
 *          format: email
 *          example: manager@gmail.com
 *        createdAt:
 *          type: string
 *          format: date-time
 *          example: 2024-02-01T11:41:05.455Z
 *        name:
 *          type: string
 *          example: 김박
 *        age:
 *          type: integer
 *          example: 32
 *        gender:
 *          type: string
 *          example: female
 *        profileImage:
 *          type: string
 *          example: image.png
 *
 */
