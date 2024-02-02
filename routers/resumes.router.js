import express from 'express';
import { prisma } from '../models/index.js';
import { Prisma } from '@prisma/client';
import authMiddleware from '../middlewares/auth.middleware.js';
import authHrmanagerMiddleware from '../middlewares/auth-hrmanager.middleware.js';

const router = express.Router();

/** 이력서 생성 API */
router.post('/resumes', authMiddleware, async (req, res, next) => {
  try {
    const { title, introduction, hobby } = req.body; // title, introduction, hobby
    const { userId } = req.user;
    const resume = await prisma.resumes.create({
      data: {
        userId: +userId,
        title: title ? title : '이력서 제목',
        introduction,
        hobby,
      },
    });
    return res
      .status(201)
      .json({ message: '이력서가 생성되었습니다.', data: resume });
  } catch (err) {
    next(err);
  }
});

/** 이력서 삭제 API */
router.delete('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const isExistResume = await prisma.resumes.findFirst({
      where: { resumeId: +resumeId },
    });
    if (!isExistResume)
      return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });
    if (isExistResume.userId !== req.user.userId)
      return res.status(401).json({ message: '삭제 권한이 없습니다.' });

    await prisma.resumes.delete({
      where: { resumeId: +resumeId },
    });
    return res.status(200).json({ message: '이력서가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

/** 이력서 수정 API */
router.patch('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const updateData = req.body;
    const { resumeId } = req.params;

    const isExistResume = await prisma.resumes.findFirst({
      where: { resumeId: +resumeId },
    });
    if (!isExistResume)
      return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });
    if (isExistResume.userId !== req.user.userId)
      return res.status(401).json({ message: '수정 권한이 없습니다.' });

    const status = [
      'APPLY',
      'DROP',
      'PASS',
      'INTERVIEW1',
      'INTERVIEW2',
      'FINAL_PASS',
    ];
    if (updateData.status && !status.includes(updateData.status))
      return res.status(412).json({
        message:
          '이력서의 상태는 APPLY, DROP, PASS, INTERVIEW1, INTERVIEW2, FINAL_PASS 중 하나여야 합니다.',
      });

    const updatedResume = await prisma.resumes.update({
      data: { ...updateData },
      where: { resumeId: +resumeId },
    });
    return res
      .status(200)
      .json({ message: '이력서가 수정되었습니다.', data: updatedResume });
  } catch (err) {
    next(err);
  }
});

/** 이력서 상세 조회 API (사용자는 본인의 이력서만, 인사담당자는 전부 열람 가능) */
router.get('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    let resume = {};
    if (req.user.role === 'HR_MANAGER') {
      resume = await prisma.$transaction(
        async (tx) => {
          const resume = await tx.resumes.findFirst({
            where: { resumeId: +resumeId },
            select: {
              userId: true,
              title: true,
              introduction: true,
              hobby: true,
              status: true,
              createdAt: true,
            },
          });
          const userId = resume.userId;
          const userInfo = await tx.userInfos.findFirst({
            where: { userId: +userId },
            select: { name: true, gender: true, age: true, profileImage: true },
          });
          return Object.assign({}, resume, userInfo);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
      );
    } else {
      const data = await prisma.users.findFirst({
        where: { userId: +req.user.userId },
        select: {
          userInfos: {
            select: { name: true, gender: true, age: true, profileImage: true },
          },
          resumes: {
            where: { resumeId: +resumeId },
            select: {
              userId: true,
              title: true,
              introduction: true,
              hobby: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });
      resume = Object.assign({}, data.userInfos, ...data.resumes);
    }

    if (!resume)
      return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });

    if (resume.userId !== req.user.userId && req.user.role !== 'HR_MANAGER')
      return res.status(401).json({ message: '권한이 없습니다.' });

    return res.status(200).json({
      message: '상세 조회에 성공하였습니다.',
      data: resume,
    });
  } catch (err) {
    next(err);
  }
});

/** 모든 이력서 목록 조회 API (인사담당자만 가능) */
router.get(
  '/resumes',
  authMiddleware,
  authHrmanagerMiddleware,
  async (req, res, next) => {
    try {
      const { orderKey, orderValue } = req.query;
      if (!orderKey || !orderValue)
        return res
          .status(400)
          .json({ message: '정렬기준이 될 컬럼과 정렬 방향을 지정해주세요.' });

      const data = await prisma.users.findMany({
        select: {
          userInfos: {
            select: { userId: true, name: true },
          },
          resumes: {
            select: {
              resumeId: true,
              title: true,
              introduction: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          [orderKey]: orderValue,
        },
      });

      const resumeList = data
        .filter((v) => v.resumes.length > 0)
        .map((v) => Object.assign({}, v.userInfos, v.resumes));

      return res.status(200).json({ data: resumeList });
    } catch (err) {
      next(err);
    }
  }
);

/** 이력서의 상태(status)'만' 변경 API (인사담당자만 가능) */
router.patch(
  '/resumes/:resumeId/changeStatus',
  authMiddleware,
  authHrmanagerMiddleware,
  async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const { status } = req.body;
      if (!status)
        return res.status(400).json({
          message:
            '변경할 상태를 입력해주세요. 이력서의 상태는 APPLY, DROP, PASS, INTERVIEW1, INTERVIEW2, FINAL_PASS 중 하나여야 합니다.',
        });
      const isExistResume = await prisma.resumes.findFirst({
        where: { resumeId: +resumeId },
      });

      if (!isExistResume)
        return res
          .status(404)
          .json({ message: '이력서 조회에 실패하였습니다.' });

      const enum_status = [
        'APPLY',
        'DROP',
        'PASS',
        'INTERVIEW1',
        'INTERVIEW2',
        'FINAL_PASS',
      ];
      if (!enum_status.includes(status))
        return res.status(412).json({
          message:
            '이력서의 상태는 APPLY, DROP, PASS, INTERVIEW1, INTERVIEW2, FINAL_PASS 중 하나여야 합니다.',
        });
      const resume = await prisma.resumes.update({
        where: { resumeId: +resumeId },
        data: { status: status },
      });
      return res
        .status(200)
        .json({ message: '이력서의 상태가 수정되었습니다.', data: resume });
    } catch (err) {
      next(err);
    }
  }
);
export default router;

/**
 * @swagger
 *  /api/resumes:
 *    post:
 *      summary: 이력서 생성
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Create_resumes_request_body'
 *      responses:
 *        201:
 *          description: 생성 성공
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Resumes'
 *
 */
/**
 * @swagger
 *  /api/resumes/{resumeId}:
 *    delete:
 *      summary: 이력서 삭제
 *      parameters:
 *        - in: path
 *          name: resumeId
 *          schema:
 *            type: integer
 *          required: true
 *          description: 이력서 ID
 *      responses:
 *        200:
 *          description: 삭제 성공
 *        404:
 *          description: 이력서 조회에 실패하였습니다
 *        401:
 *          삭제 권한이 없습니다
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    Create_resumes_request_body:
 *      type: object
 *      properties:
 *        title:
 *          type: string
 *          example: 이력서 제목
 *        introduction:
 *          type: string
 *          example: 자기소개
 *        hobby:
 *          type: string
 *          example: 독서
 *    Resumes:
 *      type: object
 *      properties:
 *        resumeId:
 *          type: integer
 *          example: 2
 *        userId:
 *          type: integer
 *          example: 2
 *        title:
 *          type: string
 *        introduction:
 *          type: string
 *        hobby:
 *          type: string
 *        status:
 *          type: string
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 */
